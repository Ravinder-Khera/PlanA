import React, { useEffect, useRef, useState } from "react";
import "./Complete.scss";
import { CalenderIcon, CrossIcon, TaskIcon, User } from "../../assets/svg";
import { DateRangePicker, Calendar } from "react-date-range";
import { getUserByRole } from "../../services/auth";

const Complete = ({ data, handleClose }) => {

  const [loading, setLoading] = useState(false);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null); 
  const [selectTitle, setSelectTitle] = useState(data.title); 
  const [addTaskJobStageDropdown, setAddTaskJobStageDropdown] = useState(false);
  const [searchJobStages, setSearchJobStages] = useState([]);
  const [selectedSearchJobStage, setSelectedSearchJobStage] = useState("");
  const [selectedSearchJobStageId, setSelectedSearchJobStageId] = useState("");
  const [addTaskJobUserDropdown, setAddTaskJobUserDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const selectDueDateRef = useRef(null);
  const selectUserRef = useRef(null);
  const addTaskJobStageDropdownRef = useRef(null);
  
  let formattedDueDate = "";
  if (selectedDueDate) {
    const year = selectedDueDate.getFullYear();
    const month = String(selectedDueDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDueDate.getDate()).padStart(2, "0");
    formattedDueDate = `${year}-${month}-${day}`;
  } else {
    formattedDueDate = "";
  }

  const handleSelectDueDate = (date) => {
    setSelectDueDate(false);
    setSelectedDueDate(date);
  };

  
  useEffect(()=>{
    const fetchJobStages = async (job_id) => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem("authToken");
        const requestOptions = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        };
        let response = await fetch(
          `${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${job_id}/stages`,
          requestOptions
        );
        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");
        const data = isJson && (await response.json());
        setSearchJobStages(data);
        if (response.status === 200) {
          setLoading(false);
          return { res: data, error: null };
        } else {
          return { res: null, error: data };
        }
      } catch (error) {
        console.error("Error fetching jo stages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobStages(data.job_id);
    setSelectedUsers(data.users)
  },[data])


  useEffect(() => {
    const fetchJobUsers = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem("authToken");
        let response = await getUserByRole(authToken);
        if (response.res) {
          setUsersList(response.res);
        } else {
          console.error("Failed to fetch Users:", response.error);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobUsers();
  }, []);

  const handleUserClick = (userId) => {
    const isSelected = selectedUsers.includes(userId);

    if (isSelected) {
      setSelectedUsers((prevUsers) => prevUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers((prevUsers) => [...prevUsers, userId]);
    }
  };

  console.log(selectedUsers);

  return (
    <div className="popup-container">
      <div className="popup-body">
        <div className="close-icon" onClick={handleClose}>
          <CrossIcon />
        </div>
        <h2>Return To Tasks</h2>
        <p>
          Do you need to make any changes to <br /> your task before returning?
        </p>

        <div className="content">
          <div className="top  d-flex justify-content-between align-items-center ">
            <div className="left d-flex flex-column justify-content-center align-items-start">
              <h1>{data.job_id}</h1>
              <input className="taskTitleInput" value={selectTitle} onChange={(e)=> setSelectTitle(e.target.value)} />
            </div>
            <div className="right selectDueDateDiv">
              <div className="selectDueDateBtn" onClick={() => setSelectDueDate(!selectDueDate)}>
                <div className="date d-flex flex-column justify-content-center align-items-start">
                  <h1>Due Date:</h1>
                  <h4>{selectedDueDate ? formattedDueDate : data.due_date}</h4>
                </div>
                <TaskIcon />
              </div>
              {selectDueDate && (
                <div className="datePickerDiv" ref={selectDueDateRef}>
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
            </div>
          </div>
          <div className="bottom addNewTaskDiv d-flex gap-2 justify-content-between align-items-center">
            <div className="addTaskJobDiv w-100">
              <div className={`centerText addTaskJobBtn ${data.stage.title}`} style={{minHeight:'40px',fontSize:'16px'}} 
                onClick={() => {setAddTaskJobStageDropdown(!addTaskJobStageDropdown);}}>
                {selectedSearchJobStage ? selectedSearchJobStage : data.stage.title}
              </div>
              {addTaskJobStageDropdown && (
                <div
                  style={{top:'100%'}}
                  className="addTaskJobDropdown"
                  ref={addTaskJobStageDropdownRef}
                >
                  <div className="addTaskJobListScroll">
                    <div className="addTaskJobListItems">
                      {searchJobStages &&
                        searchJobStages.map((stage) => (
                          <div
                            key={stage.id}
                            className={`addTaskJobStageItem ${stage.title}`}
                            onClick={() => {
                              setSelectedSearchJobStage(stage.title);
                              setSelectedSearchJobStageId(stage.id);
                              setAddTaskJobStageDropdown(false);
                            }}
                          >
                            {stage.title}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
              <div className="addTaskJobDiv d-flex align-items-center justify-content-end">
                {data.users.length > 0 ? (
                  <>
                    {data.users.map((user, index) => (
                      <>
                        <div
                          key={index}
                          className={` UserImg addedUserImages ${
                            index === data.users.length - 1 ? "withAddBtn" : ""
                          }`}
                          style={{ minWidth: "40px", zIndex: index }}
                          onClick={() =>
                            setAddTaskJobUserDropdown(!addTaskJobUserDropdown)
                          }
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
                      </>
                    ))}
                  </>
                ) : (
                  <div
                    className="UserImg withAddBtn"
                    onClick={() =>
                      setAddTaskJobUserDropdown(!addTaskJobUserDropdown)
                    }
                    style={{ minWidth: "40px" }}
                  >
                    <User />
                  </div>
                )}
                {addTaskJobUserDropdown && (
                  <div
                    className="addTaskJobDropdown right"
                    ref={selectUserRef}
                  >
                    <div className="addTaskJobListScroll">
                      <div className="addTaskJobListItems">
                        <label className="addedAssignees">
                          Assignees
                        </label>
                        <div className="addedAssigneeBorder">
                          {usersList &&
                            usersList
                              .filter((user) =>
                                selectedUsers.includes(user.id)
                              )
                              .map((user) => (
                                <>
                                  <div
                                    key={user.id}
                                    className={`addAssigneeDiv  ${
                                      selectedUsers.includes(user.id) &&
                                      "active"
                                    }`}
                                    onClick={() =>
                                      handleUserClick(user.id)
                                    }
                                  >
                                    <div
                                      className={` UserImg addedUserImages `}
                                      style={{ minWidth: "40px" }}
                                    >
                                      {user.profile_pic !== "" ? (
                                        <img
                                          alt={user.name}
                                          src={
                                            process.env
                                              .REACT_APP_USER_API_CLOUD_IMG_PATH +
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
                                    <div className="checkAddBtn">
                                      {selectedUsers.includes(user.id)
                                        ? "-"
                                        : "+"}
                                    </div>
                                  </div>
                                </>
                              ))}
                        </div>
                        <label className="">Add Assignees</label>
                        {usersList
                          .filter(
                            (user) => !selectedUsers.includes(user.id)
                          )
                          .map((user) => (
                            <>
                              <div
                                key={user.id}
                                className={`addAssigneeDiv ${
                                  selectedUsers.includes(user.id) &&
                                  "active"
                                }`}
                                onClick={() => handleUserClick(user.id)}
                              >
                                <div
                                  className={` UserImg addedUserImages `}
                                  style={{ minWidth: "40px" }}
                                >
                                  {user.profile_pic !== "" ? (
                                    <img
                                      alt={user.name}
                                      src={
                                        process.env
                                          .REACT_APP_USER_API_CLOUD_IMG_PATH +
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
                                <div className="checkAddBtn">
                                  {selectedUsers.includes(user.id)
                                    ? "-"
                                    : "+"}
                                </div>
                              </div>
                            </>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
            <button type="button" className="return">Return</button>
            <button type="button" className="cancel" onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Complete;
