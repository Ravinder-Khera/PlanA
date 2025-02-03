import React, { useEffect, useRef, useState } from "react";
import CountUp from "react-countup";
import { Bars } from "react-loader-spinner";
import { getDashboardSummary, updateTask } from "../../services/auth";
import Timeline from "../../Components/Timeline";
import { AddIcon, User } from "../../assets/svg";
import { useNavigate } from "react-router-dom";
import { getMessages } from "../../services/chat_attachment";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [randomNumber, setRandomNumber] = useState(0);
  const [selectedJob, setSelectedJob] = useState();
  const [selectedJobTask, setSelectedJobTask] = useState();
  const [taskCount, setTaskCount] = useState(0);
  const [chats, setChats] = useState(null);
  const [markTaskStatus, setMarkTaskStatus] = useState(false);
  const [updateTaskStatus, setUpdateTaskStatus] = useState(null);
  const [delayedUpdate, setDelayedUpdate] = useState(false);

  const selectedJobRef = useRef(null);
  const overFlowRef = useRef(null);

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
      setLoading(true);
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
    } finally {
      setLoading(false);
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
        popUpSlide.classList.add("slideIn");
      }
    }, 1000);
  }, [selectedJob]);

  useEffect(() => {
    if (selectedJob) {
      const currentDate = new Date();
      const applicationTasks = selectedJob?.tasks;
      const sortedTasks = applicationTasks
        .map((task) => {
          const dueDate = new Date(task.due_date);
          const timeDiff = Math.abs(dueDate - currentDate);
          return { ...task, timeDiff };
        })
        .sort((a, b) => a.timeDiff - b.timeDiff);
      const nearestTask =
        sortedTasks.length > 2 ? sortedTasks.slice(0, 2) : sortedTasks;
      setTaskCount(sortedTasks.length);
      setSelectedJobTask(nearestTask);
      fetchChats(selectedJob.id);
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "2-digit" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options);
  };

  useEffect(() => {
    if (markTaskStatus) {
      const timer = setTimeout(() => {
        setDelayedUpdate(true);
      }, 750); 
  
      return () => clearTimeout(timer);
    } else {
      setDelayedUpdate(false);
    }

    const handleTaskUpdate = async (task) => {
      let reqBody = {
        status: 'completed',
      };
      try {
        const response = await updateTask(reqBody, task.id);
        if (response.res) {
          console.log('task status updated');
        } 
      } catch (error) {
        console.log("error while updating task", error);
      }
    };

    if (updateTaskStatus) {
      console.log('task status called');
      handleTaskUpdate(updateTaskStatus)
    }
  }, [markTaskStatus,updateTaskStatus]);

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
          <div className="custom_box">
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
          <div className="custom_box">
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
          <div className="custom_box">
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
          <div className="custom_box">
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
          setSelectedJob={setSelectedJob}
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
              <div className="taskCount">{taskCount} Tasks</div>
              <div className="taskDetails">
                {selectedJobTask &&
                  selectedJobTask.map((task, index) => {
                    const trimmedTitle =
                      task.title.length > 35
                        ? task.title.substring(0, 35) + "..."
                        : task.title;
                    return (
                      <div key={index} className={`tasksDiv ${task.stage} ${delayedUpdate ? 'update' : ''}`}>
                        <div className="d-flex align-items-center justify-content-between" style={{ gap: "20px" }}>
                          <div>
                            <div className={`markTaskComplete ${markTaskStatus && 'active'}`} onClick={()=> {setMarkTaskStatus(true)
                              setUpdateTaskStatus(task)
                            }}></div>
                          </div>
                          <div>
                            <div className="taskHeading">| {task.id} |</div>
                            <div className="taskHeading">{trimmedTitle}</div>
                            <div className="taskDate">
                              <span>Due Date</span>
                              <span>{task.due_date}</span>
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
              <div className="taskCount text-center mt-4">
                <p
                  onClick={() => {
                    navigate("/dashboard/tasks", { state: selectedJob });
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
                          <div>
                            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center justify-content-end">
                                <div
                                  className={` UserImg addedUserImages `}
                                  style={{
                                    minWidth: "40px",
                                    zIndex: index,
                                  }}
                                >
                                  {chat.user.profile_pic !== "" ? (
                                    <img
                                      alt={chat.user.name}
                                      src={
                                        process.env
                                          .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                        chat.user.profile_pic
                                      }
                                    />
                                  ) : (
                                    <User />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="chatHeading">{chat.user.name}</div>
                            <div className="chatTime">
                              |{selectedJob.id}|{selectedJob.title}
                            </div>
                            <div className="chatMsg">"{trimmedTitle}"</div>
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
