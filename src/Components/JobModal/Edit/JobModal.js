import { useEffect, useRef, useState } from "react";
import "./style.scss";
import Slider from "react-slick";
import { User } from "../../../assets/svg";
import { Calendar } from "react-date-range";
import { StageList, StatusList } from "../../../helper";
import {
  createTask,
  getUserByRole,
  updateJobs,
  updateTask,
} from "../../../services/auth";
import { toast } from "react-toastify";
import { Bars } from "react-loader-spinner";
import ChatAndAttachment from "./ChatAndAttachment";

const JobModal = ({
  data,
  handleClose,
  stage,
  usersLists,
  fetchJobs,
  reloadTabs,
}) => {
  console.log("data", data);
  const [tasks, setTasks] = useState({});
  const [filteredTasks, setFilteredTasks] = useState({});
  const [dueDate, setDueDate] = useState(null);
  const [latestUpdate, setLatestUpdate] = useState("");
  const [selectedTab, setSelectedTab] = useState("to-do");
  const [selectedStage, setSelectedStage] = useState();
  const [selectedTasks, setSelectedTasks] = useState();
  const [progress, setProgress] = useState(0);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [showStatuses, setShowStatuses] = useState(false);
  const [assignee, setAssignee] = useState([]);
  const [loader, setLoader] = useState(false);
  const [status, setStatus] = useState("");
  const [userDropdownStates, setUserDropdownStates] = useState();
  const [taskSelectedAssignee, setTaskSelectedAssignee] = useState([]);
  const [showAssignee, setShowAssignee] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState([]);

  const addTaskRef = useRef(null);
  const [newTask, setNewTask] = useState({
    title: "",
    stageTitle: "",
    status: "to-do",
  });
  const [stageIds, setStageIds] = useState({});
  const [state, setState] = useState({
    title: "",
    location: "",
    description: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const selectDueDateRef = useRef(null);
  const popUpRef = useRef(null);
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 3,
    speed: 500,
    arrow: true,
  };

  useEffect(() => {
    let handler = (e) => {
      if (
        popUpRef.current &&
        !popUpRef.current.contains(e.target)
      ) {
        handleClose()
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const getIdsForStages = (stages) => {
    let tempArr = {};
    stages.map((stage) => {
      tempArr = { ...tempArr, [stage.title]: stage.id };
    });
    setStageIds(tempArr);
  };

  useEffect(() => {
    setLatestUpdate(data?.latest_update);
    setDueDate(data?.due_date);
    setStatus(data?.status);
    setState({
      title: data?.title,
      location: data?.location,
      description: data?.description,
    });
    getIdsForStages(data?.stages);
    function minDueDate(stage) {
      const currentDate = new Date();
      return stage.tasks.reduce((min, task) => {
        const taskDueDate = new Date(task.due_date);
        return taskDueDate >= currentDate && taskDueDate < min
          ? taskDueDate
          : min;
      }, Infinity);
    }

    // Function to sort stages based on minimum due date
    function sortStages(stages) {
      const currentDate = new Date();
      stages?.sort((a, b) => {
        const dueDateA = minDueDate(a);
        const dueDateB = minDueDate(b);
        const daysDifferenceA = Math.abs(
          (dueDateA - currentDate) / (1000 * 60 * 60 * 24)
        );
        const daysDifferenceB = Math.abs(
          (dueDateB - currentDate) / (1000 * 60 * 60 * 24)
        );
        return dueDateA - dueDateB || daysDifferenceA - daysDifferenceB;
      });
    }

    // Sorting stages
    sortStages(data.stages);

    // Function to sort tasks based on due date
    function sortTasks(tasks) {
      tasks?.sort((a, b) => {
        const dueDateA = new Date(a.due_date);
        const dueDateB = new Date(b.due_date);
        return dueDateA - dueDateB;
      });
    }

    // Function to sort tasks in all stages
    function sortTasksInStages(stages) {
      stages?.forEach((stage) => sortTasks(stage.tasks));
    }

    // Sorting tasks in all stages
    sortTasksInStages(data.stages);

    // Function to calculate days left for nearest task
    function daysLeftForNearestTask(tasks) {
      const currentDate = new Date();
      const nearestTask = tasks.find(
        (task) => new Date(task.due_date) >= currentDate
      );
      if (nearestTask) {
        const dueDate = new Date(nearestTask.due_date);
        const timeDiff = dueDate.getTime() - currentDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days and round up
      }
      return null; // If no task found
    }

    // Loop through stages to calculate days left for nearest task in each stage
    data.stages?.forEach((stage) => {
      stage.daysLeftForNearestTask = daysLeftForNearestTask(stage.tasks);
      let arr;
      stage.tasks.forEach((task) => {
        arr = task?.users?.map((user) => user);
        stage.users = [...arr];
      });
    });
    const _tempTasks = createTaskArrayWithStageTitle(data);
    const list1 = _tempTasks?.filter((task) => task.status !== "completed");

    const _per = Math.floor(
      ((_tempTasks?.length - list1?.length) / _tempTasks?.length) * 100
    );
    setProgress(_per);
    setTasks(_tempTasks);
    setFilteredTasks(list1);
    setUserDropdownStates(Array(list1?.length).fill(false));
  }, [data, reloadTabs]);

  // Function to create task array with stageTitle field
  function createTaskArrayWithStageTitle(data) {
    const taskArray = [];
    data?.stages?.forEach((stage) => {
      const stageTitle = stage.title;
      stage?.tasks?.forEach((task) => {
        taskArray.push({ ...task, stageTitle });
      });
    });
    return taskArray;
  }

  useEffect(() => {
    
    let _tempTasks = tasks;
    if (!tasks?.length) return;
    if (selectedTab === "to-do") {
      _tempTasks = tasks?.filter((task) => task.status !== "completed");
    } else {
      _tempTasks = tasks?.filter((task) => task.status === "completed");
    }
    setFilteredTasks(() => _tempTasks);
    setUserDropdownStates(Array(_tempTasks?.length).fill(false));
    const ul = document.getElementById("task-list-ul");
    if (ul) {
      const listItems = ul.querySelectorAll("li");
      listItems.forEach((item) => {
        item.classList.remove(
          selectedTab === "to-do" ? "addCompleted" : "addTodo"
        );
      });
    }
  }, [selectedTab, tasks]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      let response = await getUserByRole(authToken);
      if (response.res) {
        setAssignee(response.res);
      } else {
        console.error("Failed to fetch Users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // const handleStageCheckBoxSelect = (e, id) => {
  //   console.log("checked", e.target.checked, id);
  //   const { checked } = e.target;
  //   if (checked) {
  //     setSelectedStage((prevIds) => (prevIds ? [...prevIds, id] : [id]));
  //   } else {
  //     setSelectedStage((prevIds) =>
  //       prevIds ? prevIds.filter((selectedId) => selectedId !== id) : []
  //     );
  //   }
  // };

  const handleTasksCheckBoxSelect = (e, id) => {
    console.log("checked", e.target.checked, id, selectedTab);
    const { checked } = e.target;
    if (checked) {
      setSelectedTasks((prevIds) => (prevIds ? [...prevIds, id] : [id]));
      handleUpdateTaskStatus(id);
    } else {
      setSelectedTasks((prevIds) =>
        prevIds ? prevIds.filter((selectedId) => selectedId !== id) : []
      );
    }
  };

  const handleSelectDueDate = (date) => {
    setSelectDueDate(false);
    setSelectedDueDate(date);
    console.log("in handleSelectDueDate", date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setDueDate(formattedDueDate);
  };

  const handleIsEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleOnChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  // for task list
  const toggleUserDropdown = (index) => {
    setUserDropdownStates((prevStates) => {
      const newState = prevStates.map((state, i) => {
        return i === index ? true : false;
      });
      return newState;
    });
  };

  // for task list
  const handleTaskAssigneeClick = (userId) => {
    setTaskSelectedAssignee((prevUsers) => {
      if (prevUsers.some((itemId) => itemId === userId)) {
        return prevUsers.filter((itemId) => itemId !== userId);
      } else {
        return [...prevUsers, userId];
      }
    });
  };

  // for task list
  const handleTaskAddAssignee = async (task) => {
    if (!taskSelectedAssignee?.length) {
      toast.error("Please select assignee");
      return;
    }
    setLoader(true);
    let reqBody = {
      assignee_ids: taskSelectedAssignee,
    };
    console.log("selected assignee", taskSelectedAssignee);
    try {
      const response = await updateTask(reqBody, task.id);
      if (response.res) {
        let updatedTasks = [...tasks];

        const taskToUpdate = updatedTasks.find((item) => item.id === task.id);

        if (taskToUpdate) {
          taskToUpdate.users = taskSelectedAssignee;
        } else {
          console.error(`Task with id ${task.id} not found.`);
          return;
        }
        console.log("updatedTasks", updatedTasks);
        if (selectedTab === "to-do") {
          updatedTasks = tasks?.filter((task) => task.status !== "completed");
        } else {
          updatedTasks = tasks?.filter((task) => task.status === "completed");
        }
        setFilteredTasks(updatedTasks);
        fetchJobs();
        toast.success("Task Updated Successfully.");
      } else {
        toast.error("Failed to Update Task.");
      }
    } catch (error) {
      console.log("error while updating task", error);
    }
    setLoader(false);
    setTaskSelectedAssignee([]);
    setUserDropdownStates(Array(19).fill(false));
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      const reqBody = {
        job_id: data.id,
        dataObj: {
          title: state.title,
          description: state.description,
          due_date: dueDate,
          location: state.location,
          latest_update: latestUpdate,
          status,
        },
      };
      console.log("reqBody", reqBody);
      const response = await updateJobs(reqBody);
      if (response.res) {
        toast.success(`${response.res.message}`);
      } else {
        console.error("jobs update failed:", response.error);
        toast.error(`${response.error.message}`);
      }
    } catch (error) {
      console.log("error in updating jobs", error);
    } finally {
      setLoader(false);
      fetchJobs();
    }
  };

  // for new task
  const handleAssigneeClick = (userId) => {
    console.log("userId", userId);
    setSelectedAssignee((prevUsers) => {
      if (prevUsers?.some((itemId) => itemId === userId)) {
        return prevUsers?.filter((itemId) => itemId !== userId);
      } else {
        return [...prevUsers, userId];
      }
    });
  };

  // for new task
  const handleCloseAddAssignee = async () => {
    setSelectedAssignee([]);
    setShowAssignee(false);
  };

  // for new task
  const handleAddAssignee = async () => {
    if (!selectedAssignee?.length) {
      toast.error("Please select assignee");
      return;
    }
    if(!newTask.title || newTask.title?.trim() === ""){
      toast.error("Please Enter Task Title.");
      return;
    }
    if(newTask.stageTitle === ""){
      toast.error("Please Select Task Stage.");
      return;
    }
    setLoader(true);
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    let reqBody = {
      job_id: data.id,
      stage_id: stageIds[newTask.stageTitle],
      title: newTask.title,
      due_date: formattedDueDate,
      assignee_ids: selectedAssignee
    };
    try {
      const response = await createTask(reqBody);
      if (response.res) {
        setNewTask({
          ...newTask,
          users: selectedAssignee,
        });
        fetchJobs();
        toast.success("Task Created Successfully.");
      } else {
        toast.error("Failed to Create Task.");
        setNewTask({
          title: "",
          stageTitle: "",
          status: "to-do",
        });
      }
    } catch (error) {
      console.log("error while updating task", error);
    }
    setLoader(false);
    setUserDropdownStates(Array(19).fill(false));
    setShowAssignee(false);
  };

  const handleUpdateTaskStatus = async (taskId) => {
    try {
      setLoader(true);
      const response = await updateTask(
        { status: selectedTab === "to-do" ? "completed" : "to-do" },
        taskId
      );
      if (response.res) {
        const listItem = document.querySelector(`#stage_${taskId}`);
        console.log("listItem", listItem);
        if (listItem) {
          listItem.classList.add(
            selectedTab === "to-do" ? "addCompleted" : "addTodo"
          );
        }

        setTimeout(() => {
          fetchJobs();
          setSelectedTasks();
          toast.success("Task Status Updated Successfully.");
        }, 2000);
      } else {
        toast.error("Failed to Create Task.");
      }
    } catch (error) {
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader && (
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
      <div className="loaderDiv2">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div className="container pop-container" ref={popUpRef}>
              <div className="popup-content">
                <div className="popup-section-left">
                  <div
                    className="top-section"
                    style={{ position: "sticky", top: "0", zIndex: "2" }}
                  >
                    <div className="topsection-left">
                      <div className="top-left-content">
                        <div
                          onClick={handleClose}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src="/assets/Frame 60.png"
                            alt=""
                            className="back-icon"
                          />
                        </div>
                        <div className="position w-100">
                          <div className="d-flex justify-content-between">
                            <div className="title">
                              <div className="d-flex flex-column">
                                {!isEdit && (
                                  <>
                                    <h1 onClick={handleIsEdit}>
                                      {state.title}{" "}
                                      <span>
                                        <img
                                          className="penImage"
                                          src="/assets/pan.png"
                                          alt=""
                                          onClick={handleIsEdit}
                                        />
                                      </span>
                                    </h1>

                                    <p>{state.location}</p>
                                  </>
                                )}
                                {isEdit && (
                                  <div className="d-flex">
                                    <input
                                      onChange={handleOnChange}
                                      className="addInput"
                                      type="text"
                                      name="title"
                                      value={state.title}
                                      id=""
                                      placeholder="Add Title Here.."
                                    />
                                    <span>
                                      <img
                                        className="penImage"
                                        src="/assets/pan.png"
                                        alt=""
                                        onClick={handleIsEdit}
                                      />
                                    </span>
                                  </div>
                                )}
                                {isEdit && (
                                  <input
                                    className="LocationInput"
                                    type="text"
                                    name="location"
                                    id=""
                                    onChange={handleOnChange}
                                    value={state.location}
                                    placeholder="Add Location"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="d-flex gap-4">
                              <button
                                className={`stageBtn btn_${stage}`}
                                style={{ cursor: "unset" }}
                              >
                                {stage}
                              </button>
                              <div className=" groupImage listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                <div className=" d-flex align-items-center justify-content-center">
                                  {usersLists?.length > 0 && (
                                    <>
                                      {usersLists
                                        ?.slice(0, 3)
                                        .map((user, index) => (
                                          <div
                                            key={index}
                                            className={`UserImg addedUserImages `}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: index,
                                            }}
                                          >
                                            {user?.profile_pic !== "" ? (
                                              <img
                                                alt={user.name}
                                                src={
                                                  process.env
                                                    .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                  user?.profile_pic
                                                }
                                              />
                                            ) : (
                                              <User />
                                            )}
                                          </div>
                                        ))}
                                      {usersLists?.length > 3 && (
                                        <div
                                          key={4}
                                          className={`UserImg-count addedUserImages`}
                                          style={{
                                            minWidth: "40px",
                                            zIndex: 4,
                                          }}
                                        >
                                          <div className="count-card">
                                            {usersLists?.length - 3}+
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {usersLists?.length === 0 && (
                                    <div
                                      className="UserImg"
                                      style={{ minWidth: "40px" }}
                                    >
                                      <User />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="progress-bar-container">
                            <div
                              className="progress-upper"
                              style={{ width: `${progress}%` }}
                            >
                              <div className="progress-text">
                                <p>Progress:&nbsp;{progress}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="top-right-content">
                    <div className="discription-heading text-start">
                      <h1>Description</h1>
                      <textarea
                        type="text"
                        name="description"
                        id=""
                        rows={3}
                        value={state.description}
                        onChange={handleOnChange}
                        placeholder="Add Description Here..."
                      />
                      {/* <p className="mt-3">
                        Donec eget lorem ultrices, condimentum magna feugiat,
                        pulvinar urna. Praesent quis cursus eros, vitae
                        vulputate dui. Etiam molestie nulla ac nibh ullamcorper
                        interdum. Morbi sit amet nulla vestibulum, lobortis orci
                        sed, vestibulum leo. Sed eget commodo turpis, sagittis
                        porttitor mauris...
                      </p>
                      <p className="read-more" style={{ color: "#E2E31F" }}>
                        Read more{" "}
                        <span className="downArrow">
                          <img src="/assets/downArrow.svg" alt="" />
                        </span>
                      </p> */}
                    </div>

                    <div className="slider-container">
                      <Slider {...settings}>
                        {data?.stages?.map((stage, index) => (
                          <div>
                            <div className="slider-box">
                              {/* <label
                                htmlFor={`select_${index}`}
                                className="align-self-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`select_${index}`}
                                  style={{ display: "none" }}
                                  checked={selectedStage?.includes(stage.id)}
                                  onChange={(e) =>
                                    handleStageCheckBoxSelect(e, stage.id)
                                  }
                                />
                                {selectedStage?.includes(stage.id) ? (
                                  <div className="svg-box-2 mx-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="15"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                        fill="black"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="svg-box mx-2"></div>
                                )}
                              </label> */}
                              <div
                                className={`card-slider card_${stage.title}`}
                              >
                                <div
                                  className={`card-image listContent d-flex align-items-center gap-2 ${
                                    stage?.users?.length <= 1
                                      ? ""
                                      : "justify-content-center"
                                  } navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv`}
                                >
                                  <div className=" d-flex align-items-center justify-content-center">
                                    {stage?.users?.length > 0 && (
                                      <>
                                        {stage?.users
                                          ?.slice(0, 3)
                                          .map((user, index) => (
                                            <div
                                              key={index}
                                              className={`UserImg addedUserImages`}
                                              style={{
                                                minWidth: "40px",
                                                zIndex: index,
                                              }}
                                            >
                                              {user?.profile_pic !== "" ? (
                                                <img
                                                  alt={user.name}
                                                  src={
                                                    process.env
                                                      .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                                    user?.profile_pic
                                                  }
                                                />
                                              ) : (
                                                <User />
                                              )}
                                            </div>
                                          ))}
                                        {stage?.users?.length > 3 && (
                                          <div
                                            key={4}
                                            className={`UserImg-count addedUserImages`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: 4,
                                            }}
                                          >
                                            <div className="count-card">
                                              {stage?.users?.length - 3}+
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {stage?.users?.length === 0 && (
                                      <div
                                        className="UserImg"
                                        style={{ minWidth: "40px" }}
                                      >
                                        <User />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <h1 className="card-head mt-2">Applicant</h1>
                                <p className="card-para mt-2">
                                  {stage.tasks[0]?.title}
                                </p>
                                <p className="card-days-text mt-2">
                                  {stage.daysLeftForNearestTask} Days Left
                                </p>
                                <button
                                  className={`card-btn mt-2 btnn_${stage.title}`}
                                >
                                  <p className="btn-text">Jane Doe</p>
                                  <p
                                    className="btn-text"
                                    style={{ fontWeight: "300" }}
                                  >
                                    Assessment Manager
                                  </p>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>

                  <div className="table-section">
                    <div className="table-top-section">
                      <div className="tableTopLeft">
                        <h1>Tasks</h1>
                        {/* <p>+ Add All Stages</p> */}
                      </div>
                      <div className="tableTopRight">
                        <button
                          className={`${
                            selectedTab === "to-do" ? "active" : ""
                          }`}
                          onClick={() => setSelectedTab("to-do")}
                        >
                          To Do
                        </button>
                        <img src="/assets/doubleArrow.png" alt="" />
                        <button
                          className={`${
                            selectedTab === "completed" ? "active" : ""
                          }`}
                          onClick={() => setSelectedTab("completed")}
                        >
                          Completed
                        </button>
                      </div>
                    </div>
                    <div className="table-main-section mt-4 ">
                      <ul
                        className={`task-list ${showTask ? "show" : ""}`}
                        id="task-list-ul"
                      >
                        {filteredTasks?.length > 0 &&
                          filteredTasks?.map((task, index) => (
                            <li id={`stage_` + task.id} key={index}>
                              <label
                                htmlFor={`task_select_${index}`}
                                className="align-self-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`task_select_${index}`}
                                  style={{ display: "none" }}
                                  checked={selectedTasks?.includes(task.id)}
                                  onChange={(e) =>
                                    handleTasksCheckBoxSelect(e, task.id)
                                  }
                                />
                                {selectedTasks?.includes(task.id) ? (
                                  <div className="svg-box-2 mx-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="15"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                        fill="black"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="svg-box mx-2"></div>
                                )}
                              </label>
                              <div className="w-100  d-flex align-items-center position-relative">
                                <div
                                  className="d-flex justify-content-between application-lodge"
                                  style={{ "min-width": "92%" }}
                                >
                                  <div className="d-flex gap-3 align-items-center ">
                                    <img
                                      src="/assets/Group 87.png"
                                      alt=""
                                      style={{ width: "18px", height: "18px" }}
                                    />
                                    <p className={`text_${task.stageTitle}`}>
                                      {task.title}
                                    </p>
                                  </div>

                                  <button className={`btn_${task.stageTitle}`}>
                                    {StageList[task?.stageTitle]}
                                  </button>
                                </div>
                                <div className="card-image user-cards listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                  <div className=" d-flex align-items-center justify-content-center">
                                    {task?.users?.length > 0 ? (
                                      <>
                                        {task?.users
                                          ?.slice(0, 3)
                                          .map((user, i) => (
                                            <>
                                              <div
                                                key={task.id}
                                                className={` UserImg addedUserImages ${
                                                  i === task?.users?.length - 1
                                                    ? "withAddBtn"
                                                    : ""
                                                }`}
                                                style={{
                                                  minWidth: "40px",
                                                  zIndex: i,
                                                }}
                                                onClick={() => {
                                                  if (task.users) {
                                                    setTaskSelectedAssignee(
                                                      task.users
                                                    );
                                                  } else {
                                                    setTaskSelectedAssignee([]);
                                                  }
                                                  toggleUserDropdown(index);
                                                }}
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
                                            </>
                                          ))}
                                        {task?.users?.length > 3 && (
                                          <div
                                            key={4}
                                            className={`UserImg-count addedUserImages withAddBtn`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: 4,
                                            }}
                                          >
                                            <div className="count-card">
                                              {task?.users?.length - 3}+
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div
                                        className="UserImg withAddBtn"
                                        onClick={() => {
                                          if (task.users) {
                                            setTaskSelectedAssignee(task.users);
                                          } else {
                                            setTaskSelectedAssignee([]);
                                          }
                                          toggleUserDropdown(index);
                                        }}
                                        style={{ minWidth: "40px" }}
                                      >
                                        <User />
                                      </div>
                                    )}
                                    {userDropdownStates[index] && (
                                      <div className="addAssigneeDropdown ">
                                        <div className="addTaskJobListScroll">
                                          <div className="addTaskJobListItems">
                                            <label className="addedAssignees">
                                              Assignees
                                            </label>
                                            <div className="addedAssigneeBorder">
                                              {assignee &&
                                                assignee
                                                  .filter((user) =>
                                                    taskSelectedAssignee?.some(
                                                      (itemId) =>
                                                        itemId === user.id
                                                    )
                                                  )
                                                  .map((user) => (
                                                    <>
                                                      <div
                                                        key={user.id}
                                                        className={`addAssigneeDiv  ${
                                                          taskSelectedAssignee?.some(
                                                            (itemId) =>
                                                              itemId === user.id
                                                          ) && "active"
                                                        }`}
                                                        onClick={() =>
                                                          handleTaskAssigneeClick(
                                                            user.id
                                                          )
                                                        }
                                                      >
                                                        <div
                                                          className={` UserImg addedUserImages `}
                                                          style={{
                                                            minWidth: "40px",
                                                          }}
                                                        >
                                                          {user.profile_pic !==
                                                          "" ? (
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
                                                          {taskSelectedAssignee?.some(
                                                            (itemId) =>
                                                              itemId === user.id
                                                          )
                                                            ? "-"
                                                            : "+"}
                                                        </div>
                                                      </div>
                                                    </>
                                                  ))}
                                            </div>
                                            <label className="">
                                              Add Assignees
                                            </label>
                                            {assignee
                                              .filter(
                                                (user) =>
                                                  !taskSelectedAssignee?.some(
                                                    (itemId) =>
                                                      itemId === user.id
                                                  )
                                              )
                                              .map((user) => (
                                                <>
                                                  <div
                                                    key={user.id}
                                                    className={`addAssigneeDiv ${
                                                      taskSelectedAssignee?.some(
                                                        (itemId) =>
                                                          itemId === user.id
                                                      ) && "active"
                                                    }`}
                                                    onClick={() =>
                                                      handleTaskAssigneeClick(
                                                        user.id
                                                      )
                                                    }
                                                  >
                                                    <div
                                                      className={` UserImg addedUserImages `}
                                                      style={{
                                                        minWidth: "40px",
                                                      }}
                                                    >
                                                      {user.profile_pic !==
                                                      "" ? (
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
                                                      {taskSelectedAssignee?.some(
                                                        (itemId) =>
                                                          itemId === user.id
                                                      )
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
                                              onClick={() => {
                                                handleTaskAddAssignee(task);
                                              }}
                                            >
                                              Add Assignee
                                            </button>
                                            <button
                                              className="colorOutlineBtn"
                                              onClick={() => {
                                                setUserDropdownStates(
                                                  Array(19).fill(false)
                                                );
                                                setTaskSelectedAssignee([]);
                                              }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}

                        <li>
                          <label
                            htmlFor={`task_select_${tasks?.length}`}
                            className="align-self-center "
                          >
                            <input
                              type="checkbox"
                              id={`task_select_${tasks?.length}`}
                              style={{ display: "none" }}
                              checked={selectedTasks?.includes(tasks?.length)}
                              // onChange={(e) =>
                              //   handleTasksCheckBoxSelect(e, tasks?.length)
                              // }
                              ref={addTaskRef}
                            />
                            {selectedTasks?.includes(tasks?.length) ? (
                              <div className="svg-box-2 mx-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                    fill="black"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="svg-box mx-2"></div>
                            )}
                          </label>
                          <div className="w-100  d-flex align-items-center position-relative">
                            <div
                              className="d-flex justify-content-between application-lodge"
                              style={{ "min-width": "92%" }}
                            >
                              <div className="d-flex gap-3 align-items-center ">
                                <img
                                  src="/assets/Group 87.png"
                                  alt=""
                                  style={{ width: "18px", height: "18px" }}
                                />
                                <p className={`text_${newTask.stageTitle}`}>
                                  <input
                                    type="text"
                                    placeholder="Add description here..."
                                    className="task-desc-input"
                                    value={newTask.title}
                                    onChange={(e) =>
                                      setNewTask({
                                        ...newTask,
                                        title: e.target.value,
                                      })
                                    }
                                  />
                                </p>
                              </div>

                              <div className="stage-addTaskJobDiv">
                                {newTask.stageTitle === "" ? (
                                  <div
                                    className="addStage-btn "
                                    onClick={() => setShowStages(!showStages)}
                                  >
                                    + Add Stage
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowStages(!showStages)}
                                    className={`btn_${newTask?.stageTitle}`}
                                  >
                                    {StageList[newTask?.stageTitle]}
                                  </button>
                                )}
                                {showStages && (
                                  <div className="stage-addTaskJobDropdown">
                                    <div className="addTaskJobListScroll">
                                      <div className="addTaskJobListItems">
                                        {Object.keys(StageList).map((key) => (
                                          <div
                                            key={key}
                                            className={`addTaskJobStageItem ${key}`}
                                            onClick={() => {
                                              console.log("keyyy", key);
                                              setNewTask({
                                                ...newTask,
                                                stageTitle: key,
                                              });
                                              setShowStages(false);
                                            }}
                                          >
                                            {StageList[key]}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="listContent user-cards d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center justify-content-end">
                                {selectedAssignee?.length > 0 ? (
                                  <>
                                    {selectedAssignee
                                      ?.slice(0, 3)
                                      .map((user, i) => (
                                        <>
                                          <div
                                            key={user.id}
                                            className={` UserImg addedUserImages ${
                                              i === selectedAssignee?.length - 1
                                                ? "withAddBtn"
                                                : ""
                                            }`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: i,
                                            }}
                                            onClick={() =>
                                              setShowAssignee(!showAssignee)
                                            }
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
                                        </>
                                      ))}
                                    {selectedAssignee?.length > 3 && (
                                      <div
                                        key={4}
                                        className={`UserImg-count addedUserImages withAddBtn`}
                                        style={{
                                          minWidth: "40px",
                                          zIndex: 4,
                                        }}
                                      >
                                        <div className="count-card">
                                          {selectedAssignee?.length - 3}+
                                        </div>
                                      </div>
                                    )}
                                    {/* {assignee
                                      .filter((user) =>
                                        selectedAssignee?.some(
                                          (itemId) => itemId === user.id
                                        )
                                      )
                                      .map((user, index) => (
                                        <>
                                          <div
                                            key={index}
                                            className={`UserImg addedUserImages ${index}`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: index,
                                            }}
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
                                        </>
                                      ))} */}
                                  </>
                                ) : (
                                  <div
                                    className="UserImg withAddBtn"
                                    onClick={() =>
                                      setShowAssignee(!showAssignee)
                                    }
                                    style={{ minWidth: "40px" }}
                                  >
                                    <User />
                                  </div>
                                )}
                                {showAssignee && (
                                  <div className="addAssigneeDropdown1">
                                    <div className="addTaskJobListScroll">
                                      <div className="addTaskJobListItems">
                                        <label className="addedAssignees">
                                          Assignees
                                        </label>
                                        <div className="addedAssigneeBorder">
                                          {assignee &&
                                            assignee
                                              .filter((user) =>
                                                selectedAssignee?.some(
                                                  (itemId) => itemId === user.id
                                                )
                                              )
                                              .map((user) => (
                                                <>
                                                  <div
                                                    key={user.id}
                                                    className={`addAssigneeDiv  ${
                                                      selectedAssignee?.some(
                                                        (itemId) =>
                                                          itemId === user.id
                                                      ) && "active"
                                                    }`}
                                                    onClick={() => {
                                                      handleAssigneeClick(
                                                        user.id
                                                      );
                                                    }}
                                                  >
                                                    <div
                                                      className={` UserImg addedUserImages `}
                                                      style={{
                                                        minWidth: "40px",
                                                      }}
                                                    >
                                                      {user.profile_pic !==
                                                      "" ? (
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
                                                      {selectedAssignee?.some(
                                                        (itemId) =>
                                                          itemId === user.id
                                                      )
                                                        ? "-"
                                                        : "+"}
                                                    </div>
                                                  </div>
                                                </>
                                              ))}
                                        </div>
                                        <label className="">
                                          Add Assignees
                                        </label>
                                        {assignee
                                          .filter(
                                            (user) =>
                                              !selectedAssignee?.some(
                                                (itemId) => itemId === user.id
                                              )
                                          )
                                          .map((user) => (
                                            <>
                                              <div
                                                key={user.id}
                                                className={`addAssigneeDiv ${
                                                  selectedAssignee?.some(
                                                    (itemId) =>
                                                      itemId === user.id
                                                  ) && "active"
                                                }`}
                                                onClick={() =>
                                                  handleAssigneeClick(user.id)
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
                                                  {selectedAssignee?.some(
                                                    (itemId) =>
                                                      itemId === user.id
                                                  )
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
                                          onClick={handleAddAssignee}
                                        >
                                          Add Assignee
                                        </button>
                                        <button
                                          className="colorOutlineBtn"
                                          onClick={() =>
                                            handleCloseAddAssignee()
                                          }
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <p className="read-more">
                      Hide Task{" "}
                      <span className={`downArrow `}>
                        <img src="/assets/downArrow.svg" alt="" />
                      </span>
                    </p>
                  </div>

                  <div className="progressInputSection">
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Due/FUPOn</p>
                      <div
                        className="input-box position-relative"
                        style={{ textAlign: "left", cursor: "pointer" }}
                      >
                        <div
                          className="addTaskDueDateBtn my-2 "
                          onClick={() => setSelectDueDate(!selectDueDate)}
                        >
                          {dueDate}
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
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Latest Update</p>
                      <input
                        type="text"
                        name="latest-update"
                        id="latest-update"
                        placeholder="lorem ultrices, condimentum magna feugiat"
                        value={latestUpdate}
                        onChange={(e) => setLatestUpdate(e.target.value)}
                        className="text-white"
                      />
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Status</p>
                      <div className="status-addTaskJobDiv">
                        <button
                          className={`btm-statusBtn ${status} h-100`}
                          onClick={() => setShowStatuses(!showStatuses)}
                        >
                          {StatusList[status]}
                        </button>
                        {showStatuses && (
                          <div className="status-addTaskJobDropdown">
                            <div className="addTaskJobListScroll">
                              <div className="addTaskJobListItems">
                                {Object.keys(StatusList).map((key) => (
                                  <div
                                    key={key}
                                    className={`addTaskJobStageItem ${key}`}
                                    onClick={() => {
                                      setStatus(key);
                                      setShowStatuses(false);
                                    }}
                                  >
                                    {StatusList[key]}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex gap-3 showMore  align-items-center my-5 justify-content-end">
                      {/* <img src="/assets/Frame 32.png" className="" alt="" />
                      <div className="showMoreLine ">
                        <p>Show More</p>
                        <p>+ Add Field</p>
                      </div> */}
                      <button
                        className={`save-btn h-100`}
                        onClick={handleUpdateJob}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
                <div className="popup-section-right">
                  <ChatAndAttachment JobId={data.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobModal;
