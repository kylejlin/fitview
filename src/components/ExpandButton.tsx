import React from "react";
import "./ExpandButton.css";

export default function ExpandButton({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button className="ExpandButton" onClick={onClick}>
      {toggleText(isExpanded)}
    </button>
  );
}

function toggleText(isExpanded: boolean): string {
  if (isExpanded) {
    return "▶◀";
  } else {
    return "◀▶";
  }
}
