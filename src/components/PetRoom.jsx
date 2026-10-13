import { useState, useEffect, useRef } from "react";
import { PET_TYPES } from "../data/pets";
import PetCharacter from "./PetCharacter";
import FoodMenu from "./FoodMenu";
import s from "../styles/PetRoom.module.css";

// ---- Mood speech lines ----
const MOOD_SPEECH = {
  ecstatic: ["BEST DAY EVER!! 🤩", "I'm SO happy right now!!", "Everything is AMAZING!!!"],
  happy:    ["I'm really happy~ 😊", "Today is a great day!", "You're the best!"],
  playful:  ["Let's play!! 🎮", "I have SO much energy!", "Throw the ball!"],
  loved:    ["I love you!! 💖", "More pets please!!", "Best owner ever~"],
  bored:    ["This is boring...", "Can we do something?", "Yawwwn..."],
  hungry:   ["My tummy is growling 🥺", "Feed me pleaase...", "I'm SO hungry..."],
  sleepy:   ["*yawn*... so tired~", "Need... sleep...", "Eyes getting heavy..."],
  sad:      ["I feel lonely 😢", "I miss you...", "Don't forget about me..."],
  sick:     ["I don't feel good 🤒", "My head hurts...", "I need medicine..."],
  dirty:    ["I need a bath! 🤢", "So itchy...", "Icky icky..."],
  annoyed:  ["STOP POKING ME!!! 😤", "I said ENOUGH!", "Leave me alone!!"],
};
function getSpeechLine(mood) {
  const key = mood?.label?.toLowerCase().split("!")[0].split("~")[0].split(".")[0] || "happy";
  const lines = MOOD_SPEECH[key] || MOOD_SPEECH.happy;
  return lines[Math.floor(Math.random() * lines.length)];
}

// ---- Particle renderer ----
function Particles({ particles }) {
  const SYMBOLS = { heart: "💗", star: "⭐", food: "✨", bubble: "🫧", angry: "💢", note: "♪" };
  return (
    <>
      {particles.map(p => (
        <div key={p.id} className={s.particle}
          style={{ left: `${p.x}%`, top: `${p.y}%`, "--vx": `${p.vx}px`, "--vy": `${p.vy}px` }}>
          {SYMBOLS[p.type] || "✨"}
        </div>
      ))}
    </>
  );
}

// ---- XP Progress Bar ----
const XP_THRESHOLDS = [0, 150, 400, 900];
function XPBar({ xp, stage }) {
  const idx     = ["Baby","Child","Teen","Adult"].indexOf(stage.name);
  const prevXp  = XP_THRESHOLDS[idx] || 0;
  const nextXp  = XP_THRESHOLDS[idx + 1] || null;
  const pct     = nextXp ? Math.min(100, ((xp - prevXp) / (nextXp - prevXp)) * 100) : 100;
  return (
    <div className={s.xpRow}>
      <span className={s.xpLabel}>⭐ {stage.name}</span>
      <div className={s.xpBar}><div className={s.xpFill} style={{ width: `${pct}%` }}/></div>
      <span className={s.xpVal}>{nextXp ? `${xp}/${nextXp}` : "MAX"}</span>
    </div>
  );
}

// ---- Stat bar ----
function StatBar({ icon, label, value, colorClass }) {
  const pct = Math.round(value);
  const isLow = pct < 20;
  return (
    <div className={s.stat}>
      <div className={s.statHead}>
        <span className={s.statIcon}>{icon}</span>
        <span className={`${s.statVal} ${isLow ? s.statValLow : ""}`}>{pct}</span>
      </div>
      <div className={s.statTrack}>
        <div className={`${s.statFill} ${s[colorClass]} ${isLow ? s.statLow : ""}`} style={{ width: `${pct}%` }}/>
      </div>
      <span className={s.statLabel}>{label}</span>
    </div>
  );
}

// ---- Main PetRoom ----
export default function PetRoom({ petHook, onReset }) {
  const {
    pet, stats, xp, dayCount,
    isSleeping, isSick, isNight, mood, growthStage,
    notification, activeAction, particles, levelUpAnim,
    feedPet, playWithPet, toggleSleep, cleanPet, pokePet,
  } = petHook;

  const [showFood, setShowFood]   = useState(false);
  const [speech, setSpeech]       = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [is3D, setIs3D]           = useState(true);
  const speechTimer = useRef(null);

  // Speech cycling
  useEffect(() => {
    if (!mood) return;
    const refresh = () => {
      setSpeech(getSpeechLine(mood));
      setShowSpeech(true);
      clearTimeout(speechTimer.current);
      speechTimer.current = setTimeout(() => setShowSpeech(false), 4200);
    };
    refresh();
    const t = setInterval(refresh, 7000);
    return () => { clearInterval(t); clearTimeout(speechTimer.current); };
  }, [mood?.label]);

  const petType = PET_TYPES.find(p => p.id === pet?.type);
  if (!pet || !petType) return null;

  return (
    <div className={`${s.room} ${isNight ? s.night : ""}`}>

      {/* BACKGROUND */}
      <div className={s.roomBg} style={{ backgroundImage: `url('/room_bg.jpg')` }}/>
      {isNight && <div className={s.nightOverlay}/>}

      {/* TOP HUD */}
      <div className={s.hud}>
        <div className={s.hudLeft}>
          <div className={s.nameBadge} style={{ background: petType.bgGradient }}>
            <span style={{ fontSize: "1.2em" }}>{petType.emoji}</span>
            <span>{pet.name}</span>
            {isSick && <span className={s.sickBadge}>🤒 Sick</span>}
          </div>
          <div className={s.dayBadge}>📅 Day {dayCount}</div>
        </div>
        <div className={s.hudRight}>
          <XPBar xp={xp} stage={growthStage}/>
          <button
            className={s.modeBtn}
            onClick={() => setIs3D(prev => !prev)}
            title={is3D ? "Switch to 2D Style" : "Switch to 3D Model"}
          >
            {is3D ? "✨ 3D" : "🎨 2D"}
          </button>
          <button className={s.resetBtn} onClick={onReset} title="New pet">🔄</button>
        </div>
      </div>

      {/* SCENE */}
      <div className={s.scene}>
        <div className={s.petArea}>
          {showSpeech && (
            <div className={`${s.bubble} ${s.bubbleIn}`}>
              <span>{mood?.emoji} {speech}</span>
            </div>
          )}
          <PetCharacter
            petType={petType}
            mood={mood}
            growthStage={growthStage}
            activeAction={activeAction}
            isSleeping={isSleeping}
            onPoke={pokePet}
            width={270}
            height={270}
            is3DProp={is3D}
          />
          <div className={s.tapHint}>tap to pet!</div>
          <div className={s.particleLayer}><Particles particles={particles}/></div>
        </div>
        {levelUpAnim && (
          <div className={s.levelUpFlash}>
            <div className={s.levelUpText}>🌟 {growthStage.name}!</div>
          </div>
        )}
      </div>

      {/* BOTTOM PANEL */}
      <div className={s.panel}>
        <div className={s.stats}>
          <StatBar icon="🍖" label="Hunger"  value={stats.hunger}      colorClass="hunger"/>
          <StatBar icon="😊" label="Happy"   value={stats.happiness}   colorClass="happy"/>
          <StatBar icon="⚡" label="Energy"  value={stats.energy}      colorClass="energy"/>
          <StatBar icon="💚" label="Health"  value={stats.health}      colorClass="health"/>
          <StatBar icon="🛁" label="Clean"   value={stats.cleanliness} colorClass="clean"/>
        </div>
        <div className={s.actions}>
          <button className={`${s.actionBtn} ${s.feedBtn}`} onClick={() => setShowFood(true)}>
            <span className={s.btnIcon}>🍖</span><span>Feed</span>
          </button>
          <button className={`${s.actionBtn} ${s.playBtn} ${(isSleeping || isSick) ? s.disabled : ""}`} onClick={playWithPet}>
            <span className={s.btnIcon}>🎮</span><span>Play</span>
          </button>
          <button className={`${s.actionBtn} ${isSleeping ? s.sleepBtnActive : s.sleepBtn}`} onClick={toggleSleep}>
            <span className={s.btnIcon}>{isSleeping ? "⏰" : "😴"}</span>
            <span>{isSleeping ? "Wake" : "Sleep"}</span>
          </button>
          <button className={`${s.actionBtn} ${s.cleanBtn}`} onClick={cleanPet}>
            <span className={s.btnIcon}>🛁</span><span>Clean</span>
          </button>
        </div>
        <div className={s.pokeStrip}>
          <span>💡 Tap the pet to interact!</span>
          {isSick && (
            <button className={s.medBtn} onClick={() => setShowFood(true)}>
              💊 Give Medicine
            </button>
          )}
        </div>
      </div>

      {/* FOOD MENU */}
      {showFood && (
        <FoodMenu
          onFeed={feedPet}
          onClose={() => setShowFood(false)}
          isSick={isSick}
          favouriteFood={petType?.favouriteFood}
        />
      )}

      {/* TOAST */}
      {notification && <div className={s.toast}>{notification}</div>}
    </div>
  );
}
