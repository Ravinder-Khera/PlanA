import { useEffect, useState, useRef } from "react";
import "./style.scss";
import downArr from "../../assets/icons/Vector (1).svg";
import swapImg from "../../assets/icons/Vector (2).svg";
import assignImg from "../../assets/icons/Group 13.svg";
import { DateRangePicker, Calendar } from "react-date-range";
import { Search, User } from "../../assets/svg";
import { StatusList } from "../../helper";
import { getJobsByFilter, getUserByRole } from "../../services/auth";
import { toast } from "react-toastify";

const Filter = ({ setFilteredJobs, setLoading, closeFilter }) => {
  const [showSelectFIlter, setSelectShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [startDate, setStartDate] = useState("YYYY-MM-DD");
  const [endDate, setEndDate] = useState("YYYY-MM-DD");
  const [searchedInput, setSearchedInput] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [showAssignee, setShowAssignee] = useState(false);
  const [usersList, setUsersList] = useState([]);

  const selectDueDateRef = useRef(null);
  const filterJobDropdownRef = useRef(null);
  const SelectFilterData = [
    {
      data: "Title",
      field: "title",
    },
    {
      data: "Location",
      field: "location",
    },
    {
      data: "Latest Update",
      field: "latest_update",
    },
    {
      data: "Description",
      field: "description",
    },
    {
      data: "Stage",
      field: "stage_name",
    },
    {
      data: "Assignee",
      field: "assignee",
    },
    {
      data: "Date",
      field: "due_date",
    },
    {
      data: "Status",
      field: "status",
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let handler = (e) => {
      if (
        filterJobDropdownRef.current &&
        !filterJobDropdownRef.current.contains(e.target)
      ) {
        setSelectShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      let response = await getUserByRole(authToken);
      if (response.res) {
        setUsersList(response.res);
      } else {
        console.error("Failed to fetch Users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleItemClick = (data) => {
    handleResetFields();
    setSelectedFilter(data.data);
    setSelectedField(data.field);
    setSelectShowFilter(false);
  };

  const handleSelect = (ranges) => {
    setSelectionRange(ranges.selection);
    const { startDate, endDate } = ranges.selection;
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, "0");
    const day = String(startDate.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setStartDate(formattedDueDate);
    const end_year = endDate.getFullYear();
    const end_month = String(endDate.getMonth() + 1).padStart(2, "0");
    const end_day = String(endDate.getDate()).padStart(2, "0");
    let end_formattedDueDate = `${end_year}-${end_month}-${end_day}`;
    setEndDate(end_formattedDueDate);
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const handleResetFields = () => {
    setShowDatePicker(false);
    setStartDate("YYYY-MM-DD");
    setEndDate("YYYY-MM-DD");
    setSelectionRange({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    });
    setSearchedInput("");
  };

  const handleApply = async () => {
    if (selectedField === "") {
      toast.error("Please select filter before applying");
      return;
    }
    let filterString = "";
    if (selectedField === "due_date") {
      filterString = `start_date=${startDate}&end_date=${endDate}`;
    } else if (selectedField === "status") {
      const value = Object.keys(StatusList).find(
        (key) => StatusList[key] === searchedInput
      );
      filterString = `${selectedField}=${value}`;
    } else {
      filterString = `${selectedField}=${searchedInput}`;
    }
    setLoading(true);
    try {
      const response = await getJobsByFilter(filterString);
      if (!response.error) {
        setFilteredJobs(response?.res?.data);
        handleResetFields();
        closeFilter();
      }
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeClick = (user) => {
    setSearchedInput(user.name);
    setShowAssignee(false);
  };

  return (
    <>
      <div className="addTaskJobDiv">
        <div className="addTaskJobDropdown right">
          <div className="addTaskJobSearchDiv addNewTaskDiv d-flex ">
            <div className="addTaskJobDiv">
              <div
                className="select-fliter h-100 "
                onClick={() => setSelectShowFilter(true)}
              >
                <p>{selectedFilter || "Select Filter"}</p>
                <img src={downArr} alt="Dropdown Arrow" />
              </div>
              <div
                className={`addTaskJobDropdown ${
                  showSelectFIlter ? "d-block" : " d-none"
                }`}
                ref={filterJobDropdownRef}
                style={{ minWidth: "100%", zIndex: "100" }}
              >
                <div className="addTaskJobListScroll">
                  <div className="addTaskJobListItems">
                    {SelectFilterData.map((d, index) => (
                      <div
                        className="addTaskJobListItem false"
                        key={index}
                        onClick={() => {
                          handleItemClick(d);
                        }}
                      >
                        {d.data}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="divider" />
            {(selectedFilter === "" ||
              selectedFilter === "Stage" ||
              selectedFilter === "Status" ||
              selectedFilter === "Location" ||
              selectedFilter === "Description" ||
              selectedFilter === "Latest Update" ||
              selectedFilter === "Title") && (
              <div className="searchBox">
                <div className="IconBox">
                  <Search />
                </div>
                <input
                  name="search"
                  placeholder="Search “Title” or  “Description”"
                  value={searchedInput}
                  onChange={(e) => setSearchedInput(e.target.value)}
                  disabled={selectedFilter === "Stage"}
                />
              </div>
            )}
            {selectedFilter === "Date" && (
              <div
                className="searchBox"
                style={{ background: "transparent", padding: "0" }}
              >
                <div className="date d-flex gap-3 align-items-center ">
                  <p className="m-0" onClick={handleShowDatePicker}>
                    {startDate}
                  </p>
                  {showDatePicker && (
                    <div
                      className="datePickerDiv"
                      style={{ left: "auto" }}
                      ref={selectDueDateRef}
                    >
                      <DateRangePicker
                        moveRangeOnFirstSelection={false}
                        editableDateInputs={false}
                        ranges={[selectionRange]}
                        onChange={handleSelect}
                        rangeColors={["#E2E31F"]}
                      />
                    </div>
                  )}
                  <img src={swapImg} alt="" />
                  <p className="m-0 " onClick={handleShowDatePicker}>
                    {endDate}
                  </p>
                </div>
              </div>
            )}

            {selectedFilter === "Assignee" && (
              <div
                className="searchBox navMenuDiv d-flex align-items-center"
                style={{ background: "transparent", padding: "0" }}
              >
                <div
                  className="IconBox addTaskJobDiv "
                  onClick={() => setShowAssignee(!showAssignee)}
                >
                  <img
                    src={assignImg}
                    className=""
                    alt={assignImg}
                    style={{ marginBottom: "-5px" }}
                    />
                    {showAssignee && (
                        <div className="addTaskJobDropdown right" style={{maxWidth:'max-content'}}>
                          <div className="addTaskJobListScroll">
                            <div className="addTaskJobListItems">
                              <label className="addedAssignees">Assignees</label>
                              {usersList.map((user) => (
                                <>
                                  <div
                                    key={user.id}
                                    className={`addAssigneeDiv `}
                                    onClick={() => handleAssigneeClick(user)}
                                  >
                                    <div
                                      className={` UserImg addedUserImages `}
                                      style={{ minWidth: "40px" }}
                                    >
                                      {user.profile_pic !== "" ? (
                                        <img
                                          alt={user.name}
                                          src={
                                            process.env.REACT_APP_USER_API_CLOUD_IMG_PATH +
                                            user.profile_pic
                                          }
                                        />
                                      ) : (
                                        <User />
                                      )}
                                    </div>
                                    <div>
                                      <h4>{user.name}</h4>
                                      <p>{user.email}</p>
                                    </div>
                                  </div>
                                </>
                              ))}
                            </div>
                          </div>
                        </div>
                    )}
                </div>
                <input
                  style={{ background: "#252525", padding: "14px 30px" }}
                  name="search"
                  placeholder="Assignee Name"
                  value={searchedInput}
                  onChange={(e) => setSearchedInput(e.target.value)}
                  disabled={selectedFilter === "Assignee"}
                />
              </div>
            )}

            <button className="colorOutlineBtn" onClick={handleApply}>
              Apply
            </button>
          </div>
        </div>
        {!showSelectFIlter && selectedFilter === "Stage" && (
          <div className="stage-buttonContainer">
            <button
              style={{ background: "#3B923999", border: " 1px solid #3B9239 " }}
              onClick={() => setSearchedInput("Application")}
            >
              Application
            </button>
            <button
              style={{ background: "#1FB4E366", border: "1px solid #1FB4E3" }}
              onClick={() => setSearchedInput("Referral")}
            >
              Referral
            </button>
            <button
              style={{ background: "#8A50C57D", border: "1px solid #8A50C5" }}
              onClick={() => setSearchedInput("Information Request")}
            >
              Information Request
            </button>
            <br />
            <button
              style={{ background: " #FF5C008C", border: "1px solid #FF5C00" }}
              onClick={() => setSearchedInput("Public Notification")}
            >
              Public Notification
            </button>
            <button
              style={{ background: "#FF40BE66", border: " 1px solid #FF40BE" }}
              onClick={() => setSearchedInput("Decision")}
            >
              {" "}
              Decision
            </button>
          </div>
        )}

        {!showSelectFIlter && selectedFilter === "Status" && (
          <div className="stage-buttonContainer">
            {Object.keys(StatusList).map((key) => (
              <button
                className={`filter-statusBtn ${key} h-100`}
                onClick={() => setSearchedInput(StatusList[key])}
              >
                {StatusList[key]}
              </button>
            ))}
          </div>
        )}

        
      </div>
    </>
  );
};

export default Filter;
