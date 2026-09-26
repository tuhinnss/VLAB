import { COLORS } from "../data/tags";

function Tag({ tag, className = "" }) {
  const colorData = COLORS[tag.color] || COLORS.grey;

  // Plain text label: the category colour is applied in tags.css
  const inlineStyle = { "--tag-color": colorData.secondary };

  return (
    <span className={`tag ${className}`} style={inlineStyle}>
      {tag.name}
    </span>
  );
}

export default Tag;
