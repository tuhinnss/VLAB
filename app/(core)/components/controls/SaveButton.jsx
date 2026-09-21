// controls/SaveButton.jsx
import useTranslation from "../../hooks/useTranslation.ts";

export default function SaveButton({ inputs, simulation }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const handleSave = () => {
    localStorage.setItem(simulation, JSON.stringify(inputs));
    alert(t("Inputs value saved in local memory for ") + simulation + "!");
  };

  return (
    <button
      onClick={handleSave}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Save inputs to local memory")}
    >
      {t("Save")}
    </button>
  );
}
