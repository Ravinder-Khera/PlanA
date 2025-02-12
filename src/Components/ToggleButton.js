import { useState } from "react";

const ToggleButton = ({ isOn, setIsOn }) => {
 

  return (
    <div className={`toggle-container ${isOn ? "on" : "off"}`} onClick={() => setIsOn(!isOn)}>
      <div className={`toggle-circle ${isOn ? "on" : "off"}`}></div>
    </div>
  );
};

export default ToggleButton;
