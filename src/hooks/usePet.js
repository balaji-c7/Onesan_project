import { useState, useEffect, useCallback, useRef } from "react";
import { getMood, getGrowthStage, PET_TYPES } from "../data/pets";

// ---- Constants ----
const TICK_MS      = 7000;   // stat decay tick
const POKE_RESET_MS = 12000; // poke count resets after 12s of no poking
const NEGLECT_TICKS = 4;     // ticks at critical before penalty

const INITIAL_STATS = {
  hunger:      80,
  happiness:   80,
  energy:      80,
  health:      100,
  cleanliness: 90,
};

// ---- Persistence ----
function saveGame(data) {
  try { localStorage.setItem("cozypets_v2", JSON.stringify(data)); } catch {}
}
function loadGame() {
  try {
    const raw = localStorage.getItem("cozypets_v2");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ---- Decay helper ----
function decay(val, rate) { return Math.max(0, val - rate); }
function restore(val, amt, max = 100) { return Math.min(max, val + amt); }

export function usePet() {
  const [pet, setPet]       = useState(null);
  const [stats, setStats]   = useState(INITIAL_STATS);
  const [xp, setXp]         = useState(0);
  const [dayCount, setDayCount]   = useState(1);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isSick, setIsSick]       = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeAction, setActiveAction] = useState(null); // "feed"|"play"|"sleep"|"clean"|"poke"
  const [pokeCount, setPokeCount] = useState(0);   // recent poke count
  const [lastPokeTime, setLastPokeTime] = useState(0);
  const [particles, setParticles]   = useState([]);   // { id, type, x, y }
  const [levelUpAnim, setLevelUpAnim] = useState(false);

  const neglectTicks = useRef({}); // { hunger: 0, energy: 0, cleanliness: 0, health: 0 }
  const dayTick      = useRef(0);
  const prevXp       = useRef(0);
  const tickRef      = useRef(null);

  // ---- Load saved game ----
  useEffect(() => {
    const saved = loadGame();
    if (saved?.pet) {
      setPet(saved.pet);
      setStats(saved.stats || INITIAL_STATS);
      setXp(saved.xp || 0);
      setDayCount(saved.dayCount || 1);
      setIsSick(saved.isSick || false);
      prevXp.current = saved.xp || 0;
    }
  }, []);

  // ---- Auto-save ----
  useEffect(() => {
    if (pet) {
      saveGame({ pet, stats, xp, dayCount, isSick });
    }
  }, [pet, stats, xp, dayCount, isSick]);

  // ---- Reset poke count after inactivity ----
  useEffect(() => {
    if (pokeCount === 0) return;
    const t = setTimeout(() => setPokeCount(0), POKE_RESET_MS);
    return () => clearTimeout(t);
  }, [lastPokeTime]);

  // ---- Detect level-up ----
  const currentStage = getGrowthStage(xp);
  const prevStage    = getGrowthStage(prevXp.current);
  useEffect(() => {
    if (currentStage.name !== prevStage.name && prevXp.current > 0) {
      setLevelUpAnim(true);
      showNotification(`🌟 ${pet?.name} grew into a ${currentStage.name}!`);
      setTimeout(() => setLevelUpAnim(false), 3000);
    }
    prevXp.current = xp;
  }, [currentStage.name]);

  // ---- Game Tick (stat decay) ----
  useEffect(() => {
    if (!pet) return;
    tickRef.current = setInterval(() => {
      dayTick.current += 1;
      if (dayTick.current >= 18) { dayTick.current = 0; setDayCount(d => d + 1); }

      const hour   = new Date().getHours();
      const isNight = hour >= 20 || hour < 6;

      setStats(prev => {
        // Get personality decay rates
        const petType = PET_TYPES.find(p => p.id === pet.type);
        const rates   = petType?.personality || { hunger: 2, happiness: 1, energy: 1.5, cleanliness: 1 };

        // Night modifier
        const nightMod = isNight ? { energy: 1.4, happiness: 0.7 } : { energy: 1, happiness: 1 };

        // If sleeping — only restore energy, nothing else decays much
        if (isSleeping) {
          return {
            ...prev,
            energy:  restore(prev.energy, 12),
            health:  restore(prev.health, 2),
            hunger:  decay(prev.hunger, 0.5),
          };
        }

        const next = {
          hunger:      decay(prev.hunger,      rates.hunger),
          happiness:   decay(prev.happiness,   rates.happiness * nightMod.happiness),
          energy:      decay(prev.energy,      rates.energy    * nightMod.energy),
          health:      prev.health,
          cleanliness: decay(prev.cleanliness, rates.cleanliness * 0.5),
        };

        // Neglect tracking
        const nt = neglectTicks.current;
        nt.hunger      = next.hunger      < 15 ? (nt.hunger      || 0) + 1 : 0;
        nt.energy      = next.energy      < 10 ? (nt.energy      || 0) + 1 : 0;
        nt.cleanliness = next.cleanliness < 15 ? (nt.cleanliness || 0) + 1 : 0;

        // Health penalty from neglect
        let healthDelta = 0;
        if (nt.hunger      > NEGLECT_TICKS) healthDelta -= 2.5;
        if (nt.cleanliness > NEGLECT_TICKS) healthDelta -= 1.5;
        if (next.energy    < 5)             healthDelta -= 1.0;

        // Health recovery if well cared for
        if (next.hunger > 60 && next.cleanliness > 50 && next.happiness > 50) {
          healthDelta += 0.5;
        }

        next.health = Math.max(0, Math.min(100, prev.health + healthDelta));

        // Sickness trigger / recovery
        if (next.health < 20) {
          setIsSick(true);
        } else if (next.health > 60) {
          setIsSick(false);
        }

        // Critical notifications
        if (next.hunger      < 15 && prev.hunger      >= 15) showNotification(`🍖 ${pet.name} is very hungry!`);
        if (next.energy      < 10 && prev.energy      >= 10) showNotification(`😴 ${pet.name} is exhausted!`);
        if (next.happiness   < 20 && prev.happiness   >= 20) showNotification(`😢 ${pet.name} feels lonely...`);
        if (next.cleanliness < 15 && prev.cleanliness >= 15) showNotification(`🤢 ${pet.name} needs a bath!`);
        if (next.health      < 20 && prev.health      >= 20) showNotification(`🤒 ${pet.name} got sick! Give medicine.`);

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(tickRef.current);
  }, [pet, isSleeping]);

  // ---- Notification helper ----
  const notifTimer = useRef(null);
  const showNotification = useCallback((msg) => {
    setNotification(msg);
    clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), 3500);
  }, []);

  // ---- Particle helper ----
  const spawnParticles = useCallback((type, count = 5, cx = 50, cy = 40) => {
    const ps = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      type,
      x: cx + (Math.random() - 0.5) * 80,
      y: cy + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 60,
      vy: -(Math.random() * 60 + 20),
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 1200);
  }, []);

  // ---- Action: trigger animation helper ----
  const triggerAction = useCallback((type, fn) => {
    setActiveAction(type);
    fn();
    setTimeout(() => setActiveAction(null), 1000);
  }, []);

  // ---- Feed ----
  const feedPet = useCallback((food) => {
    if (!pet) return;
    if (food.sickOnly && !isSick) {
      showNotification(`💊 Medicine is only for sick pets!`);
      return;
    }
    if (!food.sickOnly && isSick && food.id !== "water") {
      showNotification(`🤒 ${pet.name} is sick! Give medicine first!`);
    }
    triggerAction("feed", () => {
      const eff = food.effects;
      setStats(prev => ({
        hunger:      restore(prev.hunger,      eff.hunger      || 0),
        happiness:   restore(prev.happiness,   eff.happiness   || 0),
        energy:      restore(prev.energy,      eff.energy      || 0),
        health:      restore(prev.health,      eff.health      || 0),
        cleanliness: restore(prev.cleanliness, eff.cleanliness || 0),
      }));
      setXp(x => x + 8);
      spawnParticles("food", 6, 50, 35);
      showNotification(`${food.emoji} Yummy! ${pet.name} loved the ${food.label.toLowerCase()}!`);
    });
  }, [pet, isSick, triggerAction, spawnParticles, showNotification]);

  // ---- Play ----
  const playWithPet = useCallback(() => {
    if (!pet) return;
    if (isSick) { showNotification(`🤒 ${pet.name} is too sick to play!`); return; }
    if (stats.energy < 12) { showNotification(`😴 ${pet.name} is too tired!`); return; }
    triggerAction("play", () => {
      setStats(prev => ({
        ...prev,
        happiness:   restore(prev.happiness, 22),
        energy:      decay(prev.energy, 14),
        hunger:      decay(prev.hunger, 6),
        cleanliness: decay(prev.cleanliness, 8),
      }));
      setXp(x => x + 12);
      spawnParticles("star", 7, 50, 30);
      showNotification(`🎉 ${pet.name} had a blast playing!`);
    });
  }, [pet, isSick, stats.energy, triggerAction, spawnParticles, showNotification]);

  // ---- Sleep ----
  const toggleSleep = useCallback(() => {
    if (!pet) return;
    if (isSleeping) {
      setIsSleeping(false);
      showNotification(`⚡ ${pet.name} woke up refreshed!`);
    } else {
      if (stats.energy >= 95) { showNotification(`⚡ ${pet.name} is full of energy!`); return; }
      setIsSleeping(true);
      showNotification(`💤 Sweet dreams, ${pet.name}~`);
    }
  }, [pet, isSleeping, stats.energy, showNotification]);

  // ---- Clean ----
  const cleanPet = useCallback(() => {
    if (!pet) return;
    if (stats.cleanliness >= 95) { showNotification(`✨ ${pet.name} is already sparkling clean!`); return; }
    triggerAction("clean", () => {
      setStats(prev => ({
        ...prev,
        cleanliness: restore(prev.cleanliness, 45),
        health:      restore(prev.health, 10),
        happiness:   restore(prev.happiness, 8),
      }));
      setXp(x => x + 6);
      spawnParticles("bubble", 8, 50, 35);
      showNotification(`🛁 ${pet.name} smells so fresh and clean!`);
    });
  }, [pet, stats.cleanliness, triggerAction, spawnParticles, showNotification]);

  // ---- Poke / pet directly ----
  const pokePet = useCallback((e) => {
    if (!pet || isSleeping) return;
    const now = Date.now();
    setLastPokeTime(now);
    const newCount = pokeCount + 1;
    setPokeCount(newCount);

    // Get click position relative to element
    const rect = e.currentTarget?.getBoundingClientRect?.();
    const cx = rect ? ((e.clientX - rect.left) / rect.width) * 100 : 50;
    const cy = rect ? ((e.clientY - rect.top)  / rect.height) * 100 : 40;

    if (newCount > 8) {
      triggerAction("annoyed", () => {
        setStats(prev => ({ ...prev, happiness: decay(prev.happiness, 3) }));
        showNotification(`😤 Stop poking me!!`);
        spawnParticles("angry", 4, cx, cy);
      });
      return;
    }

    const happinessGain = newCount <= 5 ? 4 : 1;
    triggerAction("poke", () => {
      setStats(prev => ({
        ...prev,
        happiness: restore(prev.happiness, happinessGain),
      }));
      setXp(x => x + 2);
      spawnParticles(newCount >= 3 ? "heart" : "note", 3, cx, cy);
      if (newCount === 3) showNotification(`💖 ${pet.name} loves the attention!`);
    });
  }, [pet, isSleeping, pokeCount, triggerAction, spawnParticles, showNotification]);

  // ---- Adopt ----
  const adoptPet = useCallback((petType, customName) => {
    const p = { ...petType, name: customName || petType.name, type: petType.id };
    setPet(p);
    setStats(INITIAL_STATS);
    setXp(0);
    setDayCount(1);
    setIsSick(false);
    setPokeCount(0);
    neglectTicks.current = {};
    dayTick.current = 0;
    prevXp.current = 0;
    showNotification(`🎉 Welcome home, ${p.name}! 🏡`);
  }, [showNotification]);

  // ---- Reset ----
  const resetGame = useCallback(() => {
    localStorage.removeItem("cozypets_v2");
    setPet(null);
    setStats(INITIAL_STATS);
    setXp(0);
    setDayCount(1);
    setIsSick(false);
    setIsSleeping(false);
    setPokeCount(0);
    neglectTicks.current = {};
  }, []);

  const growthStage = getGrowthStage(xp);
  const mood        = pet ? getMood(stats, pokeCount) : null;
  const hour        = new Date().getHours();
  const isNight     = hour >= 20 || hour < 6;

  return {
    pet, stats, xp, dayCount,
    isSleeping, isSick, isNight,
    mood, growthStage,
    notification, activeAction, particles, levelUpAnim,
    pokeCount,
    feedPet, playWithPet, toggleSleep, cleanPet, pokePet,
    adoptPet, resetGame,
  };
}
