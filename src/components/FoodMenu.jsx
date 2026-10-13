import { useState } from "react";
import { FOOD_TYPES } from "../data/pets";
import s from "../styles/FoodMenu.module.css";

export default function FoodMenu({ onFeed, onClose, isSick, favouriteFood }) {
  const [hoveredId, setHoveredId] = useState(null);

  const foods = isSick
    ? FOOD_TYPES  // Show all including medicine when sick
    : FOOD_TYPES.filter(f => !f.sickOnly);

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.menu} onClick={e => e.stopPropagation()}>
        <div className={s.title}>🍽️ What should we feed them?</div>
        <div className={s.grid}>
          {foods.map(food => {
            const isFav = food.id === favouriteFood;
            const isHov = hoveredId === food.id;
            return (
              <button
                key={food.id}
                className={`${s.foodBtn} ${isFav ? s.fav : ""} ${food.sickOnly ? s.medicine : ""}`}
                style={{ "--food-color": food.color }}
                onMouseEnter={() => setHoveredId(food.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => { onFeed(food); onClose(); }}
              >
                <span className={s.foodEmoji}>{food.emoji}</span>
                <span className={s.foodLabel}>{food.label}</span>
                {isFav && <span className={s.favBadge}>❤️ Fav</span>}
                {food.sickOnly && <span className={s.medBadge}>Sick only</span>}
                {isHov && (
                  <div className={s.tooltip}>
                    <div className={s.tooltipDesc}>{food.desc}</div>
                    <div className={s.tooltipStats}>
                      {food.effects.hunger      > 0 && <span>🍖 +{food.effects.hunger}</span>}
                      {food.effects.happiness   > 0 && <span>😊 +{food.effects.happiness}</span>}
                      {food.effects.energy      > 0 && <span>⚡ +{food.effects.energy}</span>}
                      {food.effects.health      > 0 && <span>💚 +{food.effects.health}</span>}
                      {food.effects.cleanliness > 0 && <span>✨ +{food.effects.cleanliness}</span>}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <button className={s.closeBtn} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
