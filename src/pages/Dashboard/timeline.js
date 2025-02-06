import React, { useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import Timeline from "../../Components/Timeline";
import { AddIcon, AddTaskGreyButton } from "../../assets/svg";
import { updateTask } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import { getMessages } from "../../services/chat_attachment";
import { formatJobNumber } from "../Jobs";
import TaggedUser from "../../Components/JobModal/Edit/TaggedUser";

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
    result.push(<TaggedUser key={match.index} name={match[1]} />);
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

  useEffect(() => {
    const newRandomNumber = Math.floor(Math.random() * 100);
    setRandomNumber(newRandomNumber);
  }, []);
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "2-digit" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options);
  };

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
      const response1 = await getMessages(jobId);
      if (!response1.error) {
        const combinedArray = [...response1.res];
        const sortedMessages = combinedArray.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA - dateB;
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
        setTimeout(() => {
          setUpdateTaskStatus(null);
        }, 1000);
        console.log("task status updated");
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
                        className={`tasksDiv ${task.stage} ${
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
                                setUpdateTaskStatus(task);
                                handleTaskUpdate(task);
                              }}
                            ></div>
                            <div>
                              <div className="taskHeading">| {task.id} |</div>
                              <div className="taskHeading">{trimmedTitle}</div>
                              <div className="taskDate">
                                <span>Due Date</span>
                                <span>{task.due_date}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center collaboratorsBox justify-content-end">
                                {task?.collaborators?.length > 0 && (
                                  <>
                                    {task?.collaborators
                                      .slice(0, 3)
                                      .map((user, index) => {
                                        const initials = user
                                          .split(" ")
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
                                            }}
                                          >
                                            {initials}
                                          </div>
                                        );
                                      })}

                                    {task?.collaborators?.length > 3 && (
                                      <div
                                        className={`collaboratorsBoxUser`}
                                        style={{
                                          minWidth: "40px",
                                          zIndex: 1,
                                        }}
                                      >
                                        +{task?.collaborators.length - 3}
                                      </div>
                                    )}
                                  </>
                                )}
                                {task.collaborators?.length === 0 && (
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
                    navigate("/jobs/tasks", { state: selectedJob });
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
                  navigate("/jobs", { state: selectedJob });
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
                          <div className="d-flex align-items-start gap-3">
                            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center justify-content-end">
                                <div
                                  className={`InitialsBoxUser`}
                                  style={{
                                    minWidth: "40px",
                                  }}
                                >
                                  {chat.user.name
                                    .split(" ")
                                    .map((part) => part.charAt(0).toUpperCase())
                                    .join("")}
                                </div>
                              </div>
                            </div>
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
                          </div>
                        </div>
                        <div className="chatBtnDiv">
                          <p>Lastest Update: {formatDate(chat.updated_at)}</p>
                          <button
                            className="Btn"
                            onClick={() => {
                              navigate("/jobs", { state: selectedJob });
                            }}
                          >
                            Reply
                          </button>
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
