import React from "react";
import "./style.scss"
const TaggedUser = ({ key, name }) => {
  const initials = name
                        .split(" ")
                        .map((part) => part.charAt(0).toUpperCase())
                        .join("");
  return (
    <div className="tag-container" key={key}>
      {/* <div className="tag-initials"><h4>{initials}</h4></div> */}
      <div className="name">@{name}</div>
    </div>
  );
};

export default TaggedUser;
