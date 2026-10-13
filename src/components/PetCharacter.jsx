import { useState } from "react";
import Pet3D from "./Pet3D";
import s from "../styles/PetCharacter.module.css";

// ============================================================
//  Mouth paths per mood
// ============================================================
const MOUTHS = {
  ecstatic: <path d="M 72 140 Q 100 168 128 140" stroke="#444" strokeWidth="3.5" fill="#FF6B6B" strokeLinecap="round"/>,
  happy:    <path d="M 78 138 Q 100 158 122 138" stroke="#444" strokeWidth="3"   fill="none"    strokeLinecap="round"/>,
  playful:  <path d="M 76 136 Q 100 160 124 136" stroke="#444" strokeWidth="3.5" fill="#FF9999" strokeLinecap="round"/>,
  loved:    <path d="M 74 138 Q 100 164 126 138" stroke="#444" strokeWidth="3.5" fill="#FFB3B3" strokeLinecap="round"/>,
  bored:    <path d="M 80 142 L 120 142"          stroke="#888" strokeWidth="2.5" fill="none"    strokeLinecap="round"/>,
  annoyed:  <path d="M 80 148 Q 100 138 120 148"  stroke="#888" strokeWidth="2.5" fill="none"    strokeLinecap="round"/>,
  sad:      <path d="M 80 150 Q 100 138 120 150"  stroke="#666" strokeWidth="2.5" fill="none"    strokeLinecap="round"/>,
  hungry:   <path d="M 82 142 Q 100 154 118 142"  stroke="#888" strokeWidth="2.5" fill="none"    strokeLinecap="round"/>,
  sleepy:   <path d="M 84 140 Q 100 150 116 140"  stroke="#888" strokeWidth="2"   fill="none"    strokeLinecap="round"/>,
  sick:     <path d="M 78 148 Q 92 140 106 148 Q 120 156 134 148" stroke="#999" strokeWidth="2.5" fill="none" strokeLinecap="round"/>,
  dirty:    <path d="M 80 146 Q 100 136 120 146"  stroke="#888" strokeWidth="2.5" fill="none"    strokeLinecap="round"/>,
};

// ============================================================
//  Eye shapes per mood
// ============================================================
function Eyes({ mood, colors }) {
  const eyeBase = (cx, cy) => (
    <>
      <ellipse cx={cx} cy={cy} rx="20" ry="20" fill="white" />
      <ellipse cx={cx} cy={cy} rx="18" ry="18" fill="white" stroke={colors.outline} strokeWidth="1.5"/>
    </>
  );

  const defaultPupil = (cx, cy, pRx = 11, pRy = 13) => (
    <>
      <ellipse cx={cx} cy={cy+2} rx={pRx} ry={pRy} fill={colors.eye}/>
      <ellipse cx={cx-3} cy={cy-3} rx="4" ry="4" fill="white" opacity="0.85"/>
      <ellipse cx={cx+5} cy={cy+5} rx="2" ry="2" fill="white" opacity="0.5"/>
    </>
  );

  const halfClosedPupil = (cx, cy) => (
    <>
      <ellipse cx={cx} cy={cy+2} rx="11" ry="8" fill={colors.eye}/>
      <ellipse cx={cx-3} cy={cy+1} rx="3" ry="2.5" fill="white" opacity="0.8"/>
    </>
  );

  const closedEye = (cx, cy) => (
    <path d={`M ${cx-14} ${cy} Q ${cx} ${cy-8} ${cx+14} ${cy}`} stroke={colors.outline} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  );

  const xEye = (cx, cy) => (
    <>
      <line x1={cx-10} y1={cy-10} x2={cx+10} y2={cy+10} stroke="#888" strokeWidth="3" strokeLinecap="round"/>
      <line x1={cx+10} y1={cy-10} x2={cx-10} y2={cy+10} stroke="#888" strokeWidth="3" strokeLinecap="round"/>
    </>
  );

  const starEye = (cx, cy) => (
    <text x={cx} y={cy+8} textAnchor="middle" fontSize="22" fill="#FFB300">⭐</text>
  );

  const heartEye = (cx, cy) => (
    <text x={cx} y={cy+8} textAnchor="middle" fontSize="18" fill="#E91E63">❤️</text>
  );

  const lx = 76, ly = 100, rx = 124, ry = 100;

  const renderEyes = () => {
    switch(mood) {
      case "ecstatic":
        return (<>{eyeBase(lx,ly)}{starEye(lx,ly)}{eyeBase(rx,ry)}{starEye(rx,ry)}</>);
      case "loved":
        return (<>{eyeBase(lx,ly)}{heartEye(lx,ly)}{eyeBase(rx,ry)}{heartEye(rx,ry)}</>);
      case "sleepy":
        return (<>{eyeBase(lx,ly)}{halfClosedPupil(lx,ly)}{eyeBase(rx,ry)}{halfClosedPupil(rx,ry)}</>);
      case "sick":
        return (<>{eyeBase(lx,ly)}{xEye(lx,ly)}{eyeBase(rx,ry)}{xEye(rx,ry)}</>);
      case "sad":
      case "hungry":
      case "dirty":
        // Droopy eyes
        return (
          <>
            {eyeBase(lx,ly)}
            <ellipse cx={lx} cy={ly+4} rx="11" ry="10" fill={colors.eye}/>
            <ellipse cx={lx-3} cy={ly+1} rx="3.5" ry="3.5" fill="white" opacity="0.8"/>
            {eyeBase(rx,ry)}
            <ellipse cx={rx} cy={ry+4} rx="11" ry="10" fill={colors.eye}/>
            <ellipse cx={rx-3} cy={ry+1} rx="3.5" ry="3.5" fill="white" opacity="0.8"/>
            {/* Droopy eyebrows */}
            <path d={`M ${lx-14} ${ly-18} Q ${lx} ${ly-12} ${lx+14} ${ly-18}`} stroke={colors.outline} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d={`M ${rx-14} ${ry-18} Q ${rx} ${ry-12} ${rx+14} ${ry-18}`} stroke={colors.outline} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </>
        );
      case "annoyed":
        return (
          <>
            {eyeBase(lx,ly)}{defaultPupil(lx,ly)}
            {eyeBase(rx,ry)}{defaultPupil(rx,ry)}
            {/* Angry eyebrows */}
            <line x1={lx-14} y1={ly-22} x2={lx+12} y2={ly-14} stroke={colors.outline} strokeWidth="3" strokeLinecap="round"/>
            <line x1={rx-12} y1={ry-14} x2={rx+14} y2={ry-22} stroke={colors.outline} strokeWidth="3" strokeLinecap="round"/>
          </>
        );
      default:
        return (
          <>
            {eyeBase(lx,ly)}{defaultPupil(lx,ly)}
            {eyeBase(rx,ry)}{defaultPupil(rx,ry)}
          </>
        );
    }
  };

  return renderEyes();
}

// ============================================================
//  Per-type ear renderers
// ============================================================
function Ears({ earType, colors }) {
  switch(earType) {
    case "pointed": // cat, fox
      return (
        <>
          <polygon points="28,65 10,15 62,50" fill={colors.body} stroke={colors.outline} strokeWidth="2" strokeLinejoin="round"/>
          <polygon points="35,62 20,22 58,50" fill={colors.inner}/>
          <polygon points="138,50 190,15 172,65" fill={colors.body} stroke={colors.outline} strokeWidth="2" strokeLinejoin="round"/>
          <polygon points="142,50 180,22 165,62" fill={colors.inner}/>
        </>
      );
    case "floppy": // dog
      return (
        <>
          <ellipse cx="40" cy="72" rx="28" ry="42" fill={colors.body} stroke={colors.outline} strokeWidth="2" transform="rotate(-20,40,72)"/>
          <ellipse cx="40" cy="72" rx="20" ry="34" fill={colors.inner} transform="rotate(-20,40,72)"/>
          <ellipse cx="160" cy="72" rx="28" ry="42" fill={colors.body} stroke={colors.outline} strokeWidth="2" transform="rotate(20,160,72)"/>
          <ellipse cx="160" cy="72" rx="20" ry="34" fill={colors.inner} transform="rotate(20,160,72)"/>
        </>
      );
    case "tall": // rabbit
      return (
        <>
          <ellipse cx="65" cy="40" rx="18" ry="48" fill={colors.body} stroke={colors.outline} strokeWidth="2" transform="rotate(-8,65,40)"/>
          <ellipse cx="65" cy="40" rx="10" ry="38" fill={colors.inner} transform="rotate(-8,65,40)"/>
          <ellipse cx="135" cy="40" rx="18" ry="48" fill={colors.body} stroke={colors.outline} strokeWidth="2" transform="rotate(8,135,40)"/>
          <ellipse cx="135" cy="40" rx="10" ry="38" fill={colors.inner} transform="rotate(8,135,40)"/>
        </>
      );
    case "round": // hamster, panda
      return (
        <>
          <circle cx="52" cy="62" r="22" fill={colors.body} stroke={colors.outline} strokeWidth="2"/>
          <circle cx="52" cy="62" r="14" fill={colors.inner}/>
          <circle cx="148" cy="62" r="22" fill={colors.body} stroke={colors.outline} strokeWidth="2"/>
          <circle cx="148" cy="62" r="14" fill={colors.inner}/>
        </>
      );
    case "none": // bird, penguin
      return null;
    default:
      return null;
  }
}

// ============================================================
//  Per-type nose
// ============================================================
function Nose({ muzzleType, colors }) {
  switch(muzzleType) {
    case "large": // dog
      return (
        <>
          <ellipse cx="100" cy="130" rx="28" ry="20" fill={colors.belly} stroke={colors.outline} strokeWidth="1.5"/>
          <ellipse cx="100" cy="124" rx="14" ry="10" fill={colors.outline}/>
          <ellipse cx="95"  cy="121" rx="4"  ry="3"  fill="white" opacity="0.6"/>
        </>
      );
    case "beak": // bird
      return (
        <polygon points="100,118 88,132 112,132" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5" strokeLinejoin="round"/>
      );
    case "beak-round": // penguin
      return (
        <ellipse cx="100" cy="128" rx="12" ry="9" fill="#FF8F00" stroke="#E65100" strokeWidth="1.5"/>
      );
    case "chubby": // hamster — big cheeks
      return (
        <>
          <ellipse cx="100" cy="122" rx="6" ry="5" fill={colors.outline} opacity="0.7"/>
          <ellipse cx="95"  cy="120" rx="2" ry="1.5" fill="white" opacity="0.6"/>
          {/* Extra chubby cheeks */}
          <ellipse cx="64"  cy="118" rx="20" ry="15" fill={colors.cheek} opacity="0.4"/>
          <ellipse cx="136" cy="118" rx="20" ry="15" fill={colors.cheek} opacity="0.4"/>
        </>
      );
    case "long": // fox
      return (
        <>
          <ellipse cx="100" cy="124" rx="20" ry="14" fill={colors.belly} stroke={colors.outline} strokeWidth="1.5"/>
          <ellipse cx="100" cy="120" rx="9" ry="7" fill={colors.outline}/>
          <ellipse cx="96"  cy="118" rx="3" ry="2" fill="white" opacity="0.6"/>
        </>
      );
    case "tiny": // rabbit
      return (
        <>
          <ellipse cx="100" cy="124" rx="7" ry="6" fill={colors.inner} stroke={colors.outline} strokeWidth="1.5"/>
          <ellipse cx="97"  cy="122" rx="2" ry="1.5" fill="white" opacity="0.5"/>
        </>
      );
    default: // small — cat, panda
      return (
        <>
          <polygon points="100,118 93,126 107,126" fill={colors.inner} stroke={colors.outline} strokeWidth="1.5" strokeLinejoin="round"/>
          <ellipse cx="97" cy="116" rx="2" ry="1.5" fill="white" opacity="0.4"/>
        </>
      );
  }
}

// ============================================================
//  Body / special features per type
// ============================================================
function SpecialFeatures({ petType, colors }) {
  switch(petType.id) {
    case "panda":
      return (
        <>
          <ellipse cx="72" cy="95" rx="22" ry="20" fill={colors.outline} opacity="0.85"/>
          <ellipse cx="128" cy="95" rx="22" ry="20" fill={colors.outline} opacity="0.85"/>
        </>
      );
    case "cat":
      return (
        <>
          {/* Whiskers */}
          <line x1="15"  y1="122" x2="80"  y2="122" stroke={colors.outline} strokeWidth="1.5" opacity="0.6"/>
          <line x1="15"  y1="130" x2="80"  y2="128" stroke={colors.outline} strokeWidth="1.5" opacity="0.6"/>
          <line x1="15"  y1="138" x2="80"  y2="134" stroke={colors.outline} strokeWidth="1.5" opacity="0.6"/>
          <line x1="185" y1="122" x2="120" y2="122" stroke={colors.outline} strokeWidth="1.5" opacity="0.6"/>
          <line x1="185" y1="130" x2="120" y2="128" stroke={colors.outline} strokeWidth="1.5" opacity="0.6"/>
          <line x1="185" y1="138" x2="120" y2="134" stroke={colors.outline} strokeWidth="1.5" opacity="0.6"/>
        </>
      );
    case "hamster":
      return (
        <>
          <line x1="35"  y1="125" x2="80"  y2="122" stroke={colors.outline} strokeWidth="1.2" opacity="0.5"/>
          <line x1="35"  y1="131" x2="80"  y2="128" stroke={colors.outline} strokeWidth="1.2" opacity="0.5"/>
          <line x1="165" y1="125" x2="120" y2="122" stroke={colors.outline} strokeWidth="1.2" opacity="0.5"/>
          <line x1="165" y1="131" x2="120" y2="128" stroke={colors.outline} strokeWidth="1.2" opacity="0.5"/>
        </>
      );
    case "fox":
      return (
        <>
          <line x1="15"  y1="124" x2="80"  y2="120" stroke={colors.outline} strokeWidth="1.5" opacity="0.5"/>
          <line x1="15"  y1="132" x2="80"  y2="128" stroke={colors.outline} strokeWidth="1.5" opacity="0.5"/>
          <line x1="185" y1="124" x2="120" y2="120" stroke={colors.outline} strokeWidth="1.5" opacity="0.5"/>
          <line x1="185" y1="132" x2="120" y2="128" stroke={colors.outline} strokeWidth="1.5" opacity="0.5"/>
          {/* Black socks on feet */}
        </>
      );
    case "penguin":
      return (
        <>
          {/* Tuxedo patch */}
          <ellipse cx="100" cy="215" rx="35" ry="50" fill={colors.belly}/>
        </>
      );
    case "bird":
      return (
        <>
          {/* Wing marks */}
          <ellipse cx="58"  cy="200" rx="30" ry="16" fill={colors.inner} stroke={colors.outline} strokeWidth="1.5" transform="rotate(-25,58,200)"/>
          <ellipse cx="142" cy="200" rx="30" ry="16" fill={colors.inner} stroke={colors.outline} strokeWidth="1.5" transform="rotate(25,142,200)"/>
          {/* Tuft on head */}
          <ellipse cx="100" cy="64" rx="8" ry="14" fill={colors.inner} transform="rotate(-10,100,64)"/>
          <ellipse cx="110" cy="68" rx="7" ry="12" fill={colors.body}  transform="rotate(10,110,68)"/>
        </>
      );
    case "rabbit":
      return (
        <>
          {/* Light whisker marks */}
          <line x1="30"  y1="128" x2="88"  y2="124" stroke={colors.outline} strokeWidth="1.2" opacity="0.4"/>
          <line x1="30"  y1="134" x2="88"  y2="130" stroke={colors.outline} strokeWidth="1.2" opacity="0.4"/>
          <line x1="170" y1="128" x2="112" y2="124" stroke={colors.outline} strokeWidth="1.2" opacity="0.4"/>
          <line x1="170" y1="134" x2="112" y2="130" stroke={colors.outline} strokeWidth="1.2" opacity="0.4"/>
        </>
      );
    default:
      return null;
  }
}

// ============================================================
//  Blush cheeks (always rendered, opacity varies by mood)
// ============================================================
function Cheeks({ mood, colors }) {
  const opacity = ["happy","ecstatic","loved","playful"].includes(mood) ? 0.5 : 0.2;
  return (
    <>
      <ellipse cx="58"  cy="122" rx="16" ry="10" fill={colors.cheek} opacity={opacity}/>
      <ellipse cx="142" cy="122" rx="16" ry="10" fill={colors.cheek} opacity={opacity}/>
    </>
  );
}

// ============================================================
//  Main PetCharacter SVG Component
// ============================================================
export default function PetCharacter({
  petType,
  mood,
  growthStage,
  activeAction,
  onPoke,
  isSleeping,
  width = 270,
  height = 270,
  is3DProp,
  showToggle = false,
}) {
  const [internal3D, setInternal3D] = useState(true);
  const is3D = is3DProp !== undefined ? is3DProp : internal3D;

  if (!petType) return null;
  const { colors, earType, muzzleType, tailType } = petType;
  const moodKey = mood?.label?.toLowerCase().split("!")[0].split("~")[0].split(".")[0] || "happy";
  const scale   = growthStage?.scale || 1;

  if (is3D) {
    return (
      <div className={s.wrap3D}>
        <Pet3D
          petType={petType}
          mood={mood}
          growthStage={growthStage}
          activeAction={activeAction}
          onPoke={onPoke}
          isSleeping={isSleeping}
          width={width}
          height={height}
        />
        {showToggle && (
          <button
            className={s.viewToggle}
            onClick={(e) => { e.stopPropagation(); setIs3D(false); }}
            title="Switch to 2D view"
          >
            ✨ 3D Model • Switch to 2D
          </button>
        )}
      </div>
    );
  }

  const animClass = isSleeping ? s.sleeping
    : activeAction === "poke"    ? s.poked
    : activeAction === "play"    ? s.bounce
    : activeAction === "feed"    ? s.wiggle
    : activeAction === "clean"   ? s.spin
    : activeAction === "annoyed" ? s.shake
    : s.idle;

  return (
    <div
      className={`${s.characterWrap} ${animClass}`}
      style={{ transform: `scale(${scale})` }}
      onClick={onPoke}
      title="Click to pet!"
    >
      <svg
        viewBox="0 0 200 290"
        width="200"
        height="290"
        style={{ overflow: "visible", cursor: "pointer" }}
      >
        {/* ─── Tail (behind body) ─── */}
        {tailType === "curled" && (
          <path d="M 145 255 Q 185 240 180 205 Q 175 178 155 188" stroke={colors.body} strokeWidth="18" fill="none" strokeLinecap="round"/>
        )}
        {tailType === "wagging" && (
          <path d="M 150 250 Q 195 235 185 195" stroke={colors.body} strokeWidth="16" fill="none" strokeLinecap="round"/>
        )}
        {tailType === "bushy" && (
          <>
            <path d="M 148 252 Q 188 230 180 200" stroke={colors.body} strokeWidth="22" fill="none" strokeLinecap="round"/>
            <path d="M 152 248 Q 186 226 179 198" stroke="white" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.6"/>
          </>
        )}
        {tailType === "puff" && (
          <circle cx="160" cy="258" r="14" fill={colors.belly} stroke={colors.outline} strokeWidth="2"/>
        )}

        {/* ─── Body ─── */}
        <ellipse cx="100" cy="220" rx="62" ry="72" fill={colors.body} stroke={colors.outline} strokeWidth="2.5"/>
        {/* Belly patch */}
        <ellipse cx="100" cy="228" rx="36" ry="46" fill={colors.belly} opacity="0.85"/>

        {/* ─── Arms ─── */}
        <ellipse cx="48"  cy="220" rx="22" ry="14" fill={colors.body} stroke={colors.outline} strokeWidth="2" transform="rotate(-30,48,220)"/>
        <ellipse cx="152" cy="220" rx="22" ry="14" fill={colors.body} stroke={colors.outline} strokeWidth="2" transform="rotate(30,152,220)"/>
        {/* Paw pads */}
        <circle cx="36"  cy="232" r="9"  fill={colors.inner} stroke={colors.outline} strokeWidth="1.5"/>
        <circle cx="164" cy="232" r="9"  fill={colors.inner} stroke={colors.outline} strokeWidth="1.5"/>
        <circle cx="30"  cy="228" r="5"  fill={colors.inner} opacity="0.6"/>
        <circle cx="36"  cy="223" r="5"  fill={colors.inner} opacity="0.6"/>
        <circle cx="158" cy="228" r="5"  fill={colors.inner} opacity="0.6"/>
        <circle cx="164" cy="223" r="5"  fill={colors.inner} opacity="0.6"/>

        {/* ─── Feet ─── */}
        <ellipse cx="78"  cy="278" rx="24" ry="14" fill={colors.body} stroke={colors.outline} strokeWidth="2"/>
        <ellipse cx="122" cy="278" rx="24" ry="14" fill={colors.body} stroke={colors.outline} strokeWidth="2"/>
        <ellipse cx="78"  cy="279" rx="16" ry="8"  fill={colors.inner} opacity="0.6"/>
        <ellipse cx="122" cy="279" rx="16" ry="8"  fill={colors.inner} opacity="0.6"/>

        {/* ─── Ears (go BEHIND head visually via render order) ─── */}
        <Ears earType={earType} colors={colors}/>

        {/* ─── Head ─── */}
        <circle cx="100" cy="110" r="78" fill={colors.body} stroke={colors.outline} strokeWidth="2.5"/>

        {/* ─── Special per-type features (on head) ─── */}
        <SpecialFeatures petType={petType} colors={colors}/>

        {/* ─── Eyes ─── */}
        <Eyes mood={moodKey} colors={colors}/>

        {/* ─── Cheeks ─── */}
        <Cheeks mood={moodKey} colors={colors}/>

        {/* ─── Nose / Muzzle ─── */}
        <Nose muzzleType={muzzleType} colors={colors}/>

        {/* ─── Mouth ─── */}
        {MOUTHS[moodKey] || MOUTHS.happy}

        {/* ─── Sleeping ZZZ overlay ─── */}
        {isSleeping && (
          <>
            <text x="155" y="75"  fontSize="18" fill="#7C4DFF" fontWeight="bold" className={s.zzz1}>z</text>
            <text x="168" y="55"  fontSize="22" fill="#7C4DFF" fontWeight="bold" className={s.zzz2}>z</text>
            <text x="182" y="32"  fontSize="28" fill="#7C4DFF" fontWeight="bold" className={s.zzz3}>Z</text>
          </>
        )}
      </svg>

      {showToggle && (
        <button
          className={s.viewToggle}
          onClick={(e) => { e.stopPropagation(); setIs3D(true); }}
          title="Switch to 3D view"
        >
          🎨 2D • Switch to 3D
        </button>
      )}

      {/* Shadow under character */}
      <div className={s.shadow}/>
    </div>
  );
}
