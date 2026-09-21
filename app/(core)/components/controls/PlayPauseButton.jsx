import { useState } from "react";
import { togglePause, isPaused } from "../../constants/Time.js";
import useTranslation from "../../hooks/useTranslation.ts";

export default function PlayPauseButton() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [paused, setPaused] = useState(isPaused());

  const handleClick = () => {
    togglePause();
    setPaused(isPaused());
  };

  return (
    <button
      onClick={handleClick}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Play/Pause simulation")}
    >
      {paused ? t("Play") : t("Pause")}
    </button>
  );
}
