
const ToggleButton = ({ isOn, setIsOn, clearFilter = () => {} }) => {
 

  return (
    <div className={`toggle-container ${isOn ? "on" : "off"}`} onClick={() => {
      setIsOn(!isOn)
      clearFilter()
      }}>
      <div className={`toggle-circle ${isOn ? "on" : "off"}`}></div>
    </div>
  );
};

export default ToggleButton;
