import React from "react";
import "./Complete.scss";
import { CalenderIcon, CrossIcon, User } from "../../assets/svg";
import { DateRangePicker, Calendar } from "react-date-range";

const Complete = ({ data, handleClose }) => {
  console.log("data", data);
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
              <h4>{data.title}</h4>
            </div>
            <div className="right d-flex justify-content-center align-items-center">
              <div className="date d-flex flex-column justify-content-center align-items-start 2">
                <h1>Due Date:</h1>
                <h4>{data.due_date}</h4>
              </div>
              <div className="calender">
                <CalenderIcon />
              </div>
              {/* <div className="datePickerDiv">
                <Calendar
                  calendarType="ISO 8601"
                  minDate={new Date()}
                  rangeColors={["#E2E31F"]}
                />
              </div> */}
            </div>
          </div>
          <div className="bottom  d-flex justify-content-between align-items-center">
            <div className={`centerText stageBtn  btn_${data.stage.title}`}>
              {data.stage.title}
            </div>
            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
              <div className=" d-flex align-items-center justify-content-end">
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
                        //   onClick={() => toggleUserDropdown(i)}
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
                    // onClick={() =>
                    //   setAddTaskJobUserDropdown(!addTaskJobUserDropdown)
                    // }
                    style={{ minWidth: "40px" }}
                  >
                    <User />
                  </div>
                )}
                {/* {userDropdownStates[i] && data.users.length > 0 && (
                  <div className="addAssigneeDropdown ">
                    <div className="addTaskJobListScroll" ref={selectUserRef}>
                      <div className="addTaskJobListItems">
                        <label className="addedAssignees">Assignees</label>
                        <div className="addedAssigneeBorder">
                          {usersList &&
                            usersList
                              .filter((user) =>
                                selectedAssignee.includes(user.id)
                              )
                              .map((user) => (
                                <>
                                  <div
                                    key={user.id}
                                    className={`addAssigneeDiv  ${
                                      selectedAssignee.includes(user.id) &&
                                      "active"
                                    }`}
                                    onClick={() => handleAssigneeClick(user.id)}
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
                                      {selectedAssignee.includes(user.id)
                                        ? "-"
                                        : "+"}
                                    </div>
                                  </div>
                                </>
                              ))}
                        </div>
                        <label className="">Add Assignees</label>
                        {usersList
                          .filter((user) => !selectedAssignee.includes(user.id))
                          .map((user) => (
                            <>
                              <div
                                key={user.id}
                                className={`addAssigneeDiv ${
                                  selectedAssignee.includes(user.id) && "active"
                                }`}
                                onClick={() => handleAssigneeClick(user.id)}
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
                                  {selectedAssignee.includes(user.id)
                                    ? "-"
                                    : "+"}
                                </div>
                              </div>
                            </>
                          ))}
                      </div>
                      <div className="d-flex flex-wrap gap-3 align-content-center justify-content-between mt-3">
                        <button
                          className="colorOutlineBtn"
                          onClick={() => handleAddAssignee(task.id)}
                        >
                          Add Assignee
                        </button>
                        <button
                          className="colorOutlineBtn"
                          onClick={() => handleCloseAddAssignee()}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )} */}
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
