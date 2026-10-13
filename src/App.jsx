import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import PetRoom from "./components/PetRoom";
import { usePet } from "./hooks/usePet";
import "./styles/global.css";

export default function App() {
  const petHook = usePet();   // ← Single source of truth
  const [screen, setScreen] = useState("loading");

  useEffect(() => {
    // Clear old v1 save format
    try { localStorage.removeItem("cozypets_save"); } catch {}
    // Check for v2 save
    try {
      const raw = localStorage.getItem("cozypets_v2");
      if (raw) {
        const d = JSON.parse(raw);
        if (d?.pet) { setScreen("landing"); return; }
      }
    } catch {}
    setScreen("landing");
  }, []);

  const handleAdopt = (petType, name) => {
    petHook.adoptPet(petType, name);
    setScreen("room");
  };

  const handleReset = () => {
    petHook.resetGame();
    setScreen("landing");
  };

  if (screen === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "72px",
        background: "linear-gradient(135deg, #fff8f0, #ffecd2)",
      }}>🐾</div>
    );
  }

  if (screen === "room" && petHook.pet) {
    return <PetRoom petHook={petHook} onReset={handleReset} />;
  }

  return (
    <LandingPage
      onAdopt={handleAdopt}
      hasSave={!!petHook.pet}
      onContinue={() => setScreen("room")}
    />
  );
}
