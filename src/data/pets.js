// ============================================================
// CozyPets — Pet Data
// ============================================================

export const PET_TYPES = [
  {
    id: "cat",
    name: "Tom",
    displayName: "Cat",
    emoji: "🐱",
    colors: { body: "#9B9BC4", belly: "#C8C8E8", inner: "#F2AABB", outline: "#7070A8", cheek: "#E8A0B0", eye: "#3A3A7A" },
    personality: { hunger: 2.0, happiness: 0.8, energy: 1.5, cleanliness: 1.0 },
    bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    description: "Independent & mysterious. Low maintenance but hard to impress.",
    trait: "Independent",
    favouriteFood: "treat",
    earType: "pointed",
    tailType: "curled",
    hasWhiskers: true,
    muzzleType: "small",
  },
  {
    id: "dog",
    name: "Buddy",
    displayName: "Dog",
    emoji: "🐶",
    colors: { body: "#D4A06A", belly: "#ECC896", inner: "#C07840", outline: "#A07040", cheek: "#E8B080", eye: "#4A2C10" },
    personality: { hunger: 3.5, happiness: 2.0, energy: 2.5, cleanliness: 1.8 },
    bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    description: "Loyal & energetic! Needs lots of food, play, and attention.",
    trait: "Energetic",
    favouriteFood: "meal",
    earType: "floppy",
    tailType: "wagging",
    hasWhiskers: false,
    muzzleType: "large",
  },
  {
    id: "rabbit",
    name: "Bun",
    displayName: "Rabbit",
    emoji: "🐰",
    colors: { body: "#F0E8DC", belly: "#FAF6F0", inner: "#F2AABB", outline: "#D0C0A8", cheek: "#F9C8C8", eye: "#C850A0" },
    personality: { hunger: 2.5, happiness: 1.5, energy: 1.8, cleanliness: 1.2 },
    bgGradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    description: "Soft & gentle. Gets bored easily but is very easy to clean.",
    trait: "Gentle",
    favouriteFood: "snack",
    earType: "tall",
    tailType: "puff",
    hasWhiskers: true,
    muzzleType: "tiny",
  },
  {
    id: "bird",
    name: "Tweet",
    displayName: "Bird",
    emoji: "🐤",
    colors: { body: "#FFD54F", belly: "#FFF9C4", inner: "#FF8F00", outline: "#F9A825", cheek: "#FFB300", eye: "#1A237E" },
    personality: { hunger: 2.2, happiness: 1.8, energy: 2.0, cleanliness: 0.8 },
    bgGradient: "linear-gradient(135deg, #fffde7 0%, #fff9c4 100%)",
    description: "Chirpy & bright! Loves to play but doesn't get very dirty.",
    trait: "Cheerful",
    favouriteFood: "snack",
    earType: "none",
    tailType: "feather",
    hasWhiskers: false,
    muzzleType: "beak",
  },
  {
    id: "hamster",
    name: "Peanut",
    displayName: "Hamster",
    emoji: "🐹",
    colors: { body: "#E8C090", belly: "#F8E0C0", inner: "#F2AABB", outline: "#C89860", cheek: "#F9CAAA", eye: "#3C200A" },
    personality: { hunger: 2.8, happiness: 2.2, energy: 3.0, cleanliness: 1.5 },
    bgGradient: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
    description: "Tiny & hyperactive! Burns through energy incredibly fast.",
    trait: "Hyper",
    favouriteFood: "snack",
    earType: "round",
    tailType: "tiny",
    hasWhiskers: true,
    muzzleType: "chubby",
  },
  {
    id: "fox",
    name: "Foxy",
    displayName: "Fox",
    emoji: "🦊",
    colors: { body: "#E8853C", belly: "#FFF0E0", inner: "#C86020", outline: "#C06020", cheek: "#F0A870", eye: "#3A2808" },
    personality: { hunger: 3.0, happiness: 1.5, energy: 2.2, cleanliness: 1.3 },
    bgGradient: "linear-gradient(135deg, #fbe9e7 0%, #ffccbc 100%)",
    description: "Clever & cunning. Hard to read but very rewarding to raise.",
    trait: "Clever",
    favouriteFood: "meal",
    earType: "pointed",
    tailType: "bushy",
    hasWhiskers: true,
    muzzleType: "long",
  },
  {
    id: "panda",
    name: "Bao",
    displayName: "Panda",
    emoji: "🐼",
    colors: { body: "#F0F0F0", belly: "#FFFFFF", inner: "#E0E0E0", outline: "#1A1A2E", cheek: "#F8D0D0", eye: "#1A1A2E" },
    personality: { hunger: 2.0, happiness: 1.2, energy: 1.2, cleanliness: 0.9 },
    bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    description: "Peaceful & easygoing. Very low energy needs but loves bamboo treats.",
    trait: "Calm",
    favouriteFood: "treat",
    earType: "round",
    tailType: "short",
    hasWhiskers: false,
    muzzleType: "small",
  },
  {
    id: "penguin",
    name: "Igloo",
    displayName: "Penguin",
    emoji: "🐧",
    colors: { body: "#2C2C3E", belly: "#F0F0F8", inner: "#4A4A6A", outline: "#1A1A28", cheek: "#F8D0D0", eye: "#FFFFFF" },
    personality: { hunger: 2.5, happiness: 1.8, energy: 2.0, cleanliness: 1.0 },
    bgGradient: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
    description: "Social & charming. Loves company and fish snacks!",
    trait: "Social",
    favouriteFood: "snack",
    earType: "none",
    tailType: "flipper",
    hasWhiskers: false,
    muzzleType: "beak-round",
  },
];

// ---- Food Types ----
export const FOOD_TYPES = [
  {
    id: "meal",
    label: "Meal",
    emoji: "🍖",
    color: "#FF9800",
    desc: "A full meal. Very filling!",
    effects: { hunger: 35, happiness: 5, energy: 8 },
    cooldown: 0,
  },
  {
    id: "treat",
    label: "Treat",
    emoji: "🍪",
    color: "#E91E63",
    desc: "A yummy snack. Boosts mood!",
    effects: { hunger: 15, happiness: 20, energy: 3 },
    cooldown: 0,
  },
  {
    id: "snack",
    label: "Snack",
    emoji: "🥕",
    color: "#4CAF50",
    desc: "A healthy snack. Balanced stats.",
    effects: { hunger: 22, happiness: 10, energy: 5 },
    cooldown: 0,
  },
  {
    id: "water",
    label: "Water",
    emoji: "💧",
    color: "#2196F3",
    desc: "Fresh water. Restores health!",
    effects: { hunger: 8, health: 10, cleanliness: 5 },
    cooldown: 0,
  },
  {
    id: "medicine",
    label: "Medicine",
    emoji: "💊",
    color: "#9C27B0",
    desc: "For sick pets only. Restores health!",
    effects: { health: 35, happiness: -5 },
    cooldown: 0,
    sickOnly: true,
  },
];

// ---- Mood System ----
export const MOODS = {
  ecstatic:  { label: "Ecstatic!",  emoji: "🤩", color: "#FF6B35", priority: 10 },
  happy:     { label: "Happy",      emoji: "😊", color: "#4CAF50", priority: 5  },
  playful:   { label: "Playful!",   emoji: "😄", color: "#FF9800", priority: 6  },
  bored:     { label: "Bored...",   emoji: "😑", color: "#9E9E9E", priority: 4  },
  hungry:    { label: "Hungry!",    emoji: "😋", color: "#FF5722", priority: 8  },
  sleepy:    { label: "Sleepy~",    emoji: "😴", color: "#7C4DFF", priority: 7  },
  sad:       { label: "Sad",        emoji: "😢", color: "#2196F3", priority: 7  },
  sick:      { label: "Sick...",    emoji: "🤒", color: "#F44336", priority: 9  },
  dirty:     { label: "Dirty!",     emoji: "🤢", color: "#795548", priority: 7  },
  annoyed:   { label: "Annoyed",    emoji: "😤", color: "#FF7043", priority: 6  },
  loved:     { label: "Loved!",     emoji: "🥰", color: "#E91E63", priority: 9  },
};

export function getMood(stats, recentPokes = 0) {
  const { hunger, happiness, energy, health, cleanliness } = stats;
  if (health < 20) return MOODS.sick;
  if (cleanliness < 15) return MOODS.dirty;
  if (hunger < 15) return MOODS.hungry;
  if (energy < 10) return MOODS.sleepy;
  if (recentPokes > 6) return MOODS.annoyed;
  if (happiness < 20) return MOODS.sad;
  if (happiness < 40) return MOODS.bored;
  if (recentPokes >= 3 && recentPokes <= 6) return MOODS.loved;
  const allGood = hunger > 70 && happiness > 75 && energy > 65 && health > 80 && cleanliness > 60;
  if (allGood) return MOODS.ecstatic;
  if (happiness > 65 && energy > 50) return MOODS.playful;
  return MOODS.happy;
}

// ---- Growth Stages ----
export const GROWTH_STAGES = [
  { name: "Baby",  minAge: 0,  maxAge: 3,  scale: 0.70, xpNeeded: 0   },
  { name: "Child", minAge: 4,  maxAge: 8,  scale: 0.85, xpNeeded: 150 },
  { name: "Teen",  minAge: 9,  maxAge: 18, scale: 1.00, xpNeeded: 400 },
  { name: "Adult", minAge: 19, maxAge: Infinity, scale: 1.15, xpNeeded: 900 },
];

export function getGrowthStage(xp) {
  let stage = GROWTH_STAGES[0];
  for (const s of GROWTH_STAGES) {
    if (xp >= s.xpNeeded) stage = s;
    else break;
  }
  return stage;
}
