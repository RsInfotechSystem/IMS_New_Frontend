import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Button = ({ name, icon, onClick, disabled = false, type }) => {
  return (
    <button className="button" onClick={onClick} disabled={disabled} type={type}>
      {![undefined, null, ""].includes(icon)} {icon} {name}
    </button>
  );
};

export default Button;
