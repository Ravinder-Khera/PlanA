import moment from "moment";
import { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { Bars } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import TaggedUser from "../../Components/JobModal/Edit/TaggedUser";
import Timeline from "../../Components/Timeline";
import TaskCompletionPopup from "../../Components/dashboardTasks/TaskCompletionPopup";
import { AddIcon, AddTaskGreyButton } from "../../assets/svg";
import {
  addNotification,
  CollaboratorNameBG,
  CollaboratorNameColor
} from "../../helper";
import { getDashboardSummary, updateTask } from "../../services/api";
import { getJobComments } from "../../services/chat_attachment";
import { formatJobNumber } from "../Jobs";

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

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [randomNumber, setRandomNumber] = useState(0);
  const [selectedJobTask, setSelectedJobTask] = useState();
  const [taskCount, setTaskCount] = useState(0);
  const [chats, setChats] = useState(null);
  const [updateTaskStatus, setUpdateTaskStatus] = useState(null);
  const [reloadTask, setReloadTask] = useState(false);
  const [selectedJob, setSelectedJob] = useState();
  const selectedJobRef = useRef(null);
  const overFlowRef = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskCompletionPopup, setShowTaskCompletionPopup] = useState(false);

  const findNearestStage = (data) => {
    let nearestStage = null;
    let nearestDueDate = Infinity;

    data?.stages?.forEach((stage) => {
      stage?.tasks?.forEach((task) => {
        const dueDate = new Date(task.due_date);
        const currentDate = new Date();

        const difference = dueDate - currentDate;

        if (difference > 0 && difference < nearestDueDate) {
          nearestDueDate = difference;
          nearestStage = stage;
        }
      });
    });
    return nearestStage ? nearestStage.title : "default";
  };

  useEffect(() => {
    const newRandomNumber = Math.floor(Math.random() * 100);
    setRandomNumber(newRandomNumber);
    if (!data) {
      setLoading(true);
      fetchData();
    }
  }, [data]);

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

  const handleSelectJobClose = () => {
    if (selectedJob) {
      const popUpSlide = selectedJobRef.current;
      popUpSlide.classList.remove("slideIn");
    }
    setTimeout(() => {
      setSelectedJob();
    }, 1000);
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
        if (popUpSlide) popUpSlide.classList.add("slideIn");
      }
    }, 1000);
  }, [selectedJob]);

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
    setSelectedJobTask(nearestTask);
    fetchChats(selectedJob.id);
  };

  useEffect(() => {
    if (selectedJob) {
      taskHandle();
    }
  }, [selectedJob]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      let response = await getDashboardSummary(authToken);
      if (response.res) {
        setData(response.res);
        setLoading(false);
      } else {
        setLoading(false);
        console.error("dashboard error:", response.error);
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = () => {
    navigate("/jobs", { state: 1 });
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
        setSelectedTask(null);
        if (reqBody?.status === "completed") {
          const name = localStorage.getItem("user");
          addNotification("success", `Task Completed by ${name}`);
        } else {
          // addNotification("success", "Task Updated");
        }
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
      <div
        className="DashboardTopMenu DashboardBgLines position-relative"
        ref={overFlowRef}
      >
        <div className="DashboardHeading d-flex justify-content-between align-items-center">
          <h2>Dashboard</h2>
          <div
            className="addNewTaskBtn d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none d-md-flex d-none"
            onClick={handleAddJob}
          >
            Add Job
            <div className="UserImg" style={{ minWidth: "40px" }}>
              <AddIcon />
            </div>
          </div>
        </div>
        <div className="dashboardBoxes">
          <div className="custom_box" onClick={() => navigate("/jobs/tasks")}>
            <h3>
              <CountUp
                start={0}
                end={data ? data.total_tasks : 0}
                duration={2}
                decimals={0}
              />
            </h3>
            <p>Total Tasks</p>
          </div>
          <div className="custom_box" onClick={() => navigate("/jobs/tasks")}>
            <h3>
              <CountUp
                start={0}
                end={data ? data.tasks_due : 0}
                duration={2}
                decimals={0}
              />
            </h3>
            <p>Tasks Due</p>
          </div>
          <div className="custom_box" onClick={() => navigate("/jobs")}>
            <h3>
              <CountUp
                start={0}
                end={data ? data.follow_up_jobs : 0}
                duration={2}
                decimals={0}
              />
            </h3>
            <p>Follow Up Jobs</p>
          </div>
          <div className="custom_box" onClick={() => navigate("/jobs")}>
            <h3>
              <CountUp
                start={0}
                end={data ? data.total_jobs : 0}
                duration={2}
                decimals={0}
              />
            </h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <Timeline
          timeFrame="weekly"
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
                                // setShowTaskCompletionPopup(true)
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
                                        const initials = user?.initials;
                                        console.log(user?.name)
                                        return (
                                          <div
                                            key={index}
                                            className={`collaboratorsBoxUser`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: index,
                                              border: "1px solid #767676",
                                              backgroundColor:
                                                CollaboratorNameBG[
                                                  user?.name
                                                ] || "#353535",
                                              color:
                                                CollaboratorNameColor[
                                                  user?.name
                                                ] || "#fff",
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
                                  border: "1px solid #767676",
                                  backgroundColor:
                                    CollaboratorNameBG[chat?.user?.name] ||
                                    "#353535",
                                  color:
                                    CollaboratorNameColor[chat?.user?.name] ||
                                    "#fff",
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

export async function getServerSideProps() {
  try {
    const authToken = localStorage.getItem("authToken");
    const data = await getDashboardSummary(authToken);
    return { props: { data } };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { props: { data: null } };
  }
}

export default Dashboard;
