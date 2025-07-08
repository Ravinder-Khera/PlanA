import { useEffect, useState } from "react";
import "./ToggleSwitch.scss";

export default function ToggleSwitch({
  options,
  initialOption = options[0],
  onChange,
  className = "",
}) {
  const [activeOption, setActiveOption] = useState(initialOption);
  useEffect(() => {
    setActiveOption(initialOption);
  }, [initialOption]);
  const handleOptionClick = (option) => {
    setActiveOption(option);
    onChange?.(option);
  };

  const activeIndex = options.indexOf(activeOption);

  return (
    <div className={`toggle-switch ${className}`}>
      <div className="toggle-container2">
        {options.map((option, index) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            className={`toggle-option ${
              activeOption === option ? "active" : ""
            }`}
          >
            {option}
          </button>
        ))}

        <div
          className="toggle-indicator"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}
