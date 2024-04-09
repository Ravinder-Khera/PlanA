import { useEffect, useState ,useRef} from "react";
import "./style.scss";
import downArr from '../../assets/icons/Vector (1).svg'
import swapImg from '../../assets/icons/Vector (2).svg'
import assignImg from '../../assets/icons/Group 13.svg'
import { DateRangePicker, Calendar } from "react-date-range";
import {
  Search
} from "../../assets/svg";
const Filter = () => {
  const [showFIlter, setShowFilter] = useState(false);
  const [showSelectFIlter, setSelectShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectDate, setSelectDate] = useState(false);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [selectStages, setSelectStages] = useState(false);
  const selectDueDateRef1 = useRef(null);
  const addTaskJobDropdownRef1 = useRef(null);

  const handleItemClick = (data) => {
    setSelectedFilter(data);
    setSelectShowFilter(false);
    // setSelectStage(false);
    if (data === 'stage') {
      setSelectStages(true); 
    }
  };

  const handleSelectDueDate = (date) => {
    setSelectDueDate(false);
    setSelectedDueDate(date);
    
  };
  const SelectFilterData = [
    {
      data: "Date",
    },
    {
      data: "Job No."
    },

    {
      data: "stage",
    },
    {
      data: "Assignee",
    },
    {
      data: "Status",
    },
    {
      data: "Location",
    },
  ]

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        addTaskJobDropdownRef1.current &&
        !addTaskJobDropdownRef1.current.contains(event.target)
      ) {
        // setSelectedFilter(false);
        setSelectStages(false); 
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


 
  return (
    <>


      <div className="addTaskJobDiv" >
        <div className="addTaskJobDropdown right"

        >

          <div className="addTaskJobSearchDiv addNewTaskDiv d-flex ">
            <div className="addTaskJobDiv">
              <div className="select-fliter h-100 " onClick={() => setSelectShowFilter(true)}>
                <p>{selectedFilter || "Select Filter"}</p>
                <img src={downArr} alt="Dropdown Arrow" />
              </div>
              <div className={`addTaskJobDropdown ${showSelectFIlter ? "d-block" : " d-none"}`} style={{ minWidth: "100%", zIndex: "100" }}>
                <div className="addTaskJobListScroll" >
                  <div className="addTaskJobListItems" >
                    {SelectFilterData.map((d, index) => (
                      <div className="addTaskJobListItem false" key={index} onClick={() => {
                        handleItemClick(d.data)
                      }}>
                        {d.data}
                      </div>
                    ))}

                  </div>

                </div>
              </div>
            </div>
            <div className="divider" />
            {(selectedFilter === "" || selectedFilter === "stage" || selectedFilter === "Status" || selectedFilter === "Location") &&
              (<div className="searchBox">
                <div className="IconBox">
                  <Search />
                </div>
                <input
                  name="search"
                  placeholder="Search “Job No.” or  “Name”"
                  value=""

                />
              </div>)}
         
            {(selectedFilter === "Date") &&
              (<div className="searchBox" style={{ background: "transparent", padding: "0" }}>
                <div className="date d-flex gap-3 align-items-center ">
                  <input
                   className="m-0 dateInput"  
                   onClick={() => setSelectDueDate(!selectDueDate)}
                   
                    placeholder="00/00/0000"/>
                    {selectDueDate && (
                        <div className="datePickerDiv" style={{left:"auto"}} ref={selectDueDateRef1}>
                          <Calendar
                            date={selectedDueDate}
                            onChange={handleSelectDueDate}
                            value={selectedDueDate}
                            calendarType="ISO 8601"
                            minDate={new Date()}
                            rangeColors={["#E2E31F"]}
                          />
                        </div>
                      )}
                  <img src={swapImg} alt="" />
                  <input className="m-0 dateInput"   onClick={() => setSelectDueDate(!selectDueDate)} placeholder="00/00/0000"/>
                </div>
              </div>)}

            {(selectedFilter === "Assignee") &&
              (<div className="searchBox d-flex align-items-center" style={{ background: "transparent", padding: "0" }}>
                <div className="IconBox">
                  <img src={assignImg} className="" style={{ marginBottom: "-5px" }} />
                </div>
                <input
                  style={{ background: "#252525", padding: "14px 30px" }}
                  name="search"
                  placeholder="Assignee Name”"
                  value=""

                />
              </div>)}

            <button
              className="colorOutlineBtn"

            >
              Apply
            </button>
          </div>

        </div>
        {(selectedFilter === "stage" && selectStages  ) && (

          <div className="stage-buttonContainer" ref={addTaskJobDropdownRef1} >
            <button style={{ background: "#3B923999", border: " 1px solid #3B9239 " }}>Application</button>
            <button style={{ background: "#1FB4E366", border: "1px solid #1FB4E3" }}>Referral</button>
            <button style={{ background: "#8A50C57D", border: "1px solid #8A50C5" }}>Information Request</button>
            <button style={{ background: " #FF5C008C", border: "1px solid #FF5C00" }}>Public Notification</button>
            <button style={{ background: "#FF40BE66", border: " 1px solid #FF40BE" }}> Decision</button>
          </div>

        )}

      </div>

    </>
  );
};

export default Filter;
