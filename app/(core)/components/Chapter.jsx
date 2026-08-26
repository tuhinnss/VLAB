// app/components/Chapter.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Tag from "./Tag.jsx";
import Link from "next/link.js";
import useTranslation from "../hooks/useTranslation.ts";

function Chapter(props) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  return (
    <section
      id={props.id}
      className={`chapter-card ${isCompleted ? "notranslate" : ""}`}
    >
      <div className="chapter-card-overlay">
        {/* Tags */}
        <div className="chapter-card-tags-container">
          {props.tags.map((tag, idx) => (
            <Tag tag={tag} key={tag.id || idx} />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-2xl flex items-center gap-2">
          {t(props.name)}
        </h2>

        {/* Link */}
        <Link href={props.link}>
          {t("Open Simulation")}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "10px" }} />
        </Link>
      </div>
    </section>
  );
}

export default Chapter;
