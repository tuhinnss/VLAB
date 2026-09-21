// controls/DeleteButton.jsx
import useTranslation from "../../hooks/useTranslation.ts";

export default function DeleteButton({ simulation }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const handleDelete = () => {
    localStorage.removeItem(simulation);
    alert(t("Simulation Inputs deleted for ") + simulation + "!");
  };

  return (
    <button
      onClick={handleDelete}
      className={`btn-glow ${isCompleted ? "notranslate" : ""}`}
      title={t("Delete saved inputs from local memory")}
    >
      {t("Delete")}
    </button>
  );
}
