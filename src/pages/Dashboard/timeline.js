import React, { useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import Timeline from "../../Components/Timeline";
import { AddIcon, AddTaskGreyButton } from "../../assets/svg";
import { updateTask } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { getJobComments, getMessages } from "../../services/chat_attachment";
import { formatJobNumber } from "../Jobs";
import TaggedUser from "../../Components/JobModal/Edit/TaggedUser";
import moment from "moment";
import TaskCompletionPopup from "../../Components/dashboardTasks/TaskCompletionPopup";
import { addNotification, CollaboratorBorders, CollaboratorNameBorders } from "../../helper";

const renderMessage = (text) => {
  // Regular expression to match words enclosed in {}
  const regex = /{([^}]+)}/g;
  let result = [];
  let lastIndex = 0;
  let match;

  // Iterate through each match of text inside {}
  while ((match = regex.exec(text)) !== null) {
    // Push the text before the match (normal text)
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    // Push the name inside {} as TaggedUser component
    result.push(<TaggedUser userKey={match.index} name={match[1]} />);
    lastIndex = regex.lastIndex; // Update last matched index
  }

  // Push any remaining text after the last match
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
};

function TimelinePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);
  const [updateTaskStatus, setUpdateTaskStatus] = useState(null);
  const [reloadTask, setReloadTask] = useState(false);
  const [selectedJob, setSelectedJob] = useState();
  const selectedJobRef = useRef(null);
  const [selectedJobTask, setSelectedJobTask] = useState();
  const [taskCount, setTaskCount] = useState(0);
  const [chats, setChats] = useState(null);
  const overFlowRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskCompletionPopup, setShowTaskCompletionPopup] = useState(false);

  useEffect(() => {
    const newRandomNumber = Math.floor(Math.random() * 100);
    setRandomNumber(newRandomNumber);
  }, []);

  const taskHandle = () => {
    const currentDate = new Date();
    const applicationTasks = selectedJob?.tasks;
    const sortedTasks =
      applicationTasks.length > 0 &&
      applicationTasks
        ?.filter((task) => task.status !== "completed")
        .map((task) => {
          const dueDate = new Date(task.due_date);
          const timeDiff = Math.abs(dueDate - currentDate);
          return { ...task, timeDiff };
        })
        .sort((a, b) => a.timeDiff - b.timeDiff);
    const nearestTask =
      sortedTasks?.length > 2 ? sortedTasks?.slice(0, 2) : sortedTasks;
    setTaskCount(sortedTasks?.length);
    console.log("nearestTask", nearestTask);
    setSelectedJobTask(nearestTask);
    fetchChats(selectedJob.id);
  };

  useEffect(() => {
    if (selectedJob) {
      taskHandle();
    }
  }, [selectedJob]);
  const fetchChats = async (jobId) => {
    try {
      const response1 = await getJobComments(jobId);
      if (!response1.error) {
        const combinedArray = [...response1.res];
        const sortedMessages = combinedArray.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA + dateB;
        });
        const latestChats =
          sortedMessages.length > 2
            ? sortedMessages.slice(0, 2)
            : sortedMessages;
        setChats(latestChats);
      } else {
        setChats([]);
      }
    } catch (error) {
      setChats([]);
      console.log("error in fetching messages");
    }
  };
  useEffect(() => {
    const slideOverflow = overFlowRef.current;
    if (selectedJob) {
      slideOverflow.classList.add("slideOverflow");
    } else {
      slideOverflow.classList.remove("slideOverflow");
    }
    setTimeout(() => {
      if (selectedJob) {
        const popUpSlide = selectedJobRef.current;
        popUpSlide.classList.add("slideIn");
      }
    }, 1000);
  }, [selectedJob]);

  const handleSelectJobClose = () => {
    if (selectedJob) {
      const popUpSlide = selectedJobRef.current;
      popUpSlide.classList.remove("slideIn");
    }
    setTimeout(() => {
      setSelectedJob();
    }, 1000);
  };

  const handleTaskUpdate = async (task) => {
    let reqBody = {
      status: "completed",
    };
    try {
      const response = await updateTask({ updatedTask: reqBody }, task.id);
      if (response.res) {
        setReloadTask((prevValue) => !prevValue);
        console.log("task status updated");
        setSelectedTask(null);
        if (reqBody?.status === "completed") {
          const name = localStorage.getItem("user");
          addNotification("success", `Task Completed by ${name}`);
        }else{

          addNotification("success", "Task Updated");
        }
        // setTimeout(() => {
        //   setUpdateTaskStatus(null);
        // }, 2000);
      }
    } catch (error) {
      console.log("error while updating task", error);
    }
  };
  const handleCreateNewTask = () => {
    navigate("/jobs", { state: { selectedJob, key: "new-task-job" } });
  };
  return (
    <>
      {showTaskCompletionPopup && (
        <TaskCompletionPopup
          task={selectedTask}
          handleClose={() => {
            setShowTaskCompletionPopup(false);
            setSelectedTask(null);
          }}
          handleFinalClose={() => {
            setUpdateTaskStatus(selectedTask);
            handleTaskUpdate(selectedTask);
            setShowTaskCompletionPopup(false);
            setSelectedTask(null);
          }}
        />
      )}
      {loading && (
        <div className="loaderDiv">
          <Bars
            height="80"
            width="80"
            color="#E2E31F"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}
      <div
        className="DashboardTopMenu DashboardBgLines position-relative"
        ref={overFlowRef}
      >
        <div className="DashboardHeading">
          <h2>Timeline</h2>
        </div>
        <Timeline
          timeFrame="monthly"
          loadNo={randomNumber}
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          reloadTask={reloadTask}
        />
        {selectedJob && (
          <div className="jobTaskPopUp" ref={selectedJobRef}>
            <div className="DashboardHeading DashboardJobHeading d-flex justify-content-between align-items-center">
              <h2>Tasks Today</h2>
              <div
                className="addNewTaskBtn d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none"
                onClick={handleSelectJobClose}
              >
                <div className="UserImg" style={{ minWidth: "40px" }}>
                  <div style={{ transform: "rotate(45deg)" }}>
                    <AddIcon />
                  </div>
                </div>
              </div>
            </div>
            <div className={`dashboard_task`}>
              <div className="taskCount">
                {taskCount ? (
                  `${taskCount} Tasks`
                ) : (
                  <span className="no-tasks">No Task</span>
                )}
              </div>
              <div className="taskDetails">
                {selectedJobTask &&
                  selectedJobTask?.length > 0 &&
                  selectedJobTask.map((task, index) => {
                    const trimmedTitle =
                      task?.title?.length > 35
                        ? task?.title.substring(0, 35) + "..."
                        : task?.title;
                    const isTaskUpdated = updateTaskStatus?.id === task.id;
                    return (
                      <div
                        key={index}
                        className={`tasksDiv ${task.stage?.title} ${
                          isTaskUpdated ? "update" : ""
                        }`}
                      >
                        <div
                          className="d-flex align-items-center justify-content-between"
                          style={{ gap: "20px" }}
                        >
                          <div
                            className="d-flex align-items-center justify-content-between"
                            style={{ gap: "20px" }}
                          >
                            <div
                              className={`markTaskComplete ${
                                updateTaskStatus?.id === task?.id && "active"
                              }`}
                              onClick={() => {
                                if (task.status === "completed") return;
                                setSelectedTask(task);
                                setUpdateTaskStatus(task);
                                handleTaskUpdate(task);

                                // setShowTaskCompletionPopup(true);
                              }}
                            ></div>
                            <div>
                              <div className="taskHeading">| {task.id} |</div>
                              <div className="taskHeading">{trimmedTitle}</div>
                              <div className="taskDate">
                                <span>Due Date</span>
                                <span>
                                  {moment(task.due_date || new Date())
                                    .local()
                                    .format("DD MMMM, YYYY")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center collaboratorsBox justify-content-end">
                                {task?.users?.length > 0 && (
                                  <>
                                    {task?.users
                                      .slice(0, 3)
                                      .map((user, index) => {
                                        const initials = user?.name
                                          ?.split(" ")
                                          .map((part) =>
                                            part.charAt(0).toUpperCase()
                                          )
                                          .join("");
                                        return (
                                          <div
                                            key={index}
                                            className={`collaboratorsBoxUser`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: index,
                                              border:
                                                CollaboratorBorders[user.id] ||
                                                CollaboratorNameBorders[
                                                  user.name
                                                ] ||
                                                "1px solid rgb(105, 103, 103)",
                                            }}
                                          >
                                            {initials}
                                          </div>
                                        );
                                      })}

                                    {task?.users?.length > 3 && (
                                      <div
                                        className={`collaboratorsBoxUser`}
                                        style={{
                                          minWidth: "40px",
                                          zIndex: task?.users?.length,
                                        }}
                                      >
                                        +{task?.users.length - 3}
                                      </div>
                                    )}
                                  </>
                                )}
                                {task.users?.length === 0 && (
                                  <div
                                    className="collaboratorsBoxUser disabled m-0"
                                    style={{ minWidth: "40px" }}
                                  >
                                    N/A
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div
                className="create_new_task_div"
                onClick={handleCreateNewTask}
              >
                <span>
                  <AddTaskGreyButton />{" "}
                </span>
                <p>Create New Task</p>
              </div>
              <div className="taskCount text-center mt-4">
                <p
                  onClick={() => {
                    navigate("/jobs", {
                      state: { selectedJob, key: "job-task" },
                    });
                  }}
                >
                  See All
                </p>
              </div>
            </div>
            <div className="DashboardHeading DashboardJobHeading mt-5 d-flex justify-content-between align-items-center">
              <h2>New Comments</h2>
              <div
                className="addNewTaskBtn d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none"
                onClick={() => {
                  navigate("/jobs", {
                    state: { selectedJob, key: "job-task" },
                  });
                }}
              >
                <div className="taskCount text-center">
                  <p>See More</p>
                </div>
              </div>
            </div>
            <div className={`dashboard_task`}>
              <div className="taskDetails">
                {chats && chats.length > 0 ? (
                  chats.map((chat, index) => {
                    const trimmedTitle =
                      chat.body.length > 100
                        ? chat.body.substring(0, 100) + "..."
                        : chat.body;
                    return (
                      <div key={index} className={`chatDiv `}>
                        <div
                          className="d-flex align-items-center justify-content-start"
                          style={{ gap: "19px" }}
                        >
                          <div className="d-flex align-items-start gap-3 w-100">
                            <div className="w-100 listContent d-flex align-items-start gap-2 justify-content-start navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div
                                className={`InitialsBoxUser`}
                                style={{
                                  minWidth: "40px",
                                  border:
                                    CollaboratorNameBorders[chat.user?.name] ||
                                    "1px solid rgb(105, 103, 103)",
                                }}
                              >
                                {chat.user?.initials}
                              </div>
                              <div className="w-100 d-flex align-items-start justify-content-end flex-column">
                                <div>
                                  <div className="chatHeading">
                                    {chat.user.name}
                                  </div>
                                  <div className="chatTime">
                                    | &nbsp; {formatJobNumber(selectedJob.id)}{" "}
                                    &nbsp; | &nbsp; {selectedJob.title}
                                  </div>
                                  <div className="chatMsg">
                                    {renderMessage(trimmedTitle)}
                                  </div>
                                </div>
                                <div className="chatBtnDiv ">
                                  <p>
                                    Lastest Update:{" "}
                                    {moment(chat.updated_at)
                                      .local()
                                      .format("DD MMMM, YYYY")}
                                  </p>
                                  <button
                                    className="Btn"
                                    onClick={() => {
                                      navigate("/jobs", {
                                        state: { selectedJob, key: "job-task" },
                                      });
                                    }}
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="taskCount text-center">
                    <p>No Comments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TimelinePage;
