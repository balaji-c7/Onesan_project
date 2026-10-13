import { useState } from "react";
import { PET_TYPES } from "../data/pets";
import PetCharacter from "./PetCharacter";
import s from "../styles/LandingPage.module.css";

const TRAITS_ICONS = {
  Independent: "😏", Energetic: "⚡", Gentle: "🌸",
  Cheerful: "🎵", Hyper: "🌀", Clever: "🦊", Calm: "🍃", Social: "🤝",
};

export default function LandingPage({ onAdopt, hasSave, onContinue }) {
  const [selected, setSelected] = useState(null);
  const [name, setName]         = useState("");
  const [showNew, setShowNew]   = useState(!hasSave);
  const [hovered, setHovered]   = useState(null);

  const previewPet = hovered || selected;

  const handleAdopt = () => {
    if (!selected) return;
    onAdopt(selected, name.trim() || selected.name);
  };

  // ── Continue/New banner ──
  if (hasSave && !showNew) {
    return (
      <div className={s.page}>
        <div className={s.header}>
          <div className={s.logoWrap}>🐾</div>
          <h1 className={s.title}>CozyPets</h1>
          <p className={s.sub}>Your virtual pet world</p>
        </div>
        <div className={s.saveBanner}>
          <div className={s.saveBannerIcon}>🏡</div>
          <h3>Welcome back!</h3>
          <p>Your pet is waiting for you at home~</p>
          <div className={s.bannerBtns}>
            <button className={s.continueBtn} onClick={onContinue}>
              🏠 Continue
            </button>
            <button className={s.newBtn} onClick={() => setShowNew(true)}>
              🐣 New Pet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.logoWrap}>🐾</div>
        <h1 className={s.title}>CozyPets</h1>
        <p className={s.sub}>Choose a companion and give them all your love! 💖</p>
      </div>

      <div className={s.layout}>
        {/* Pet grid */}
        <div className={s.left}>
          <h2 className={s.sectionTitle}>Pick your pet ✨</h2>
          <div className={s.grid}>
            {PET_TYPES.map(pet => (
              <div
                key={pet.id}
                className={`${s.card} ${selected?.id === pet.id ? s.cardSelected : ""}`}
                style={{ "--pet-bg": pet.bgGradient, "--pet-color": pet.colors.body }}
                onClick={() => { setSelected(pet); if (!name) setName(pet.name); }}
                onMouseEnter={() => setHovered(pet)}
                onMouseLeave={() => setHovered(null)}
              >
                {selected?.id === pet.id && <div className={s.checkmark}>✓</div>}
                <div className={s.cardEmoji}>{pet.emoji}</div>
                <div className={s.cardName}>{pet.displayName}</div>
                <div className={s.traitBadge}>
                  {TRAITS_ICONS[pet.trait]} {pet.trait}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview pane */}
        {previewPet && (
          <div className={s.preview} style={{ background: previewPet.bgGradient }}>
            <div className={s.previewChar}>
              <PetCharacter
                petType={previewPet}
                mood={{ label: "Happy", emoji: "😊" }}
                growthStage={{ scale: 0.85 }}
                activeAction={null}
                isSleeping={false}
                onPoke={() => {}}
                width={200}
                height={210}
                showToggle={false}
              />
            </div>
            <div className={s.previewInfo}>
              <div className={s.previewName}>{previewPet.displayName}</div>
              <div className={s.previewDesc}>{previewPet.description}</div>
              <div className={s.previewStats}>
                <div className={s.previewStat}>
                  <span>🍖 Hunger</span>
                  <div className={s.diffBar}>
                    <div style={{ width: `${(previewPet.personality.hunger / 4) * 100}%`, background: "#FF9800", height: "100%", borderRadius: "99px" }}/>
                  </div>
                </div>
                <div className={s.previewStat}>
                  <span>⚡ Energy</span>
                  <div className={s.diffBar}>
                    <div style={{ width: `${(previewPet.personality.energy / 4) * 100}%`, background: "#7C4DFF", height: "100%", borderRadius: "99px" }}/>
                  </div>
                </div>
                <div className={s.previewStat}>
                  <span>😊 Mood</span>
                  <div className={s.diffBar}>
                    <div style={{ width: `${(previewPet.personality.happiness / 3) * 100}%`, background: "#E91E63", height: "100%", borderRadius: "99px" }}/>
                  </div>
                </div>
              </div>
              <div className={s.previewFav}>❤️ Loves: <strong>{previewPet.favouriteFood}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Name + adopt */}
      {selected && (
        <div className={s.adoptRow}>
          <input
            className={s.nameInput}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`Name your ${selected.displayName}...`}
            maxLength={16}
          />
          <button className={s.adoptBtn} onClick={handleAdopt}>
            🏡 Adopt {name.trim() || selected.name}!
          </button>
        </div>
      )}
    </div>
  );
}
