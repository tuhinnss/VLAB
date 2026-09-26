// app/components/Chapter.jsx
import Link from "next/link.js";
import useTranslation from "../hooks/useTranslation.ts";

function Chapter(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <Link
      id={props.id}
      href={props.link}
      className={`chapter-button ${isCompleted ? "notranslate" : ""}`}
    >
      {t(props.name)}
    </Link>
  );
}

export default Chapter;
