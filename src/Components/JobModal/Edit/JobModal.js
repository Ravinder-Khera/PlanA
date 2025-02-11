import { useEffect, useRef, useState } from "react";
import "./style.scss";
import Slider from "react-slick";
import {
  RedoIcon,
  User,
  TaskIcon,
  OpenCloseIcon,
  DeleteIcon,
  EditIcon,
  AddIcon,
  TickIcon,
  CrossIcon,
  RightArrow,
  DownArrow,
  AddTaskGreyButton,
  ModifiedRightArrow,
} from "../../../assets/svg";
import { Calendar } from "react-date-range";
import {
  AllStages,
  MAX_CALENDAR_YEAR,
  StageList,
  StatusList,
} from "../../../helper";
import {
  createTask,
  createTaskStage,
  deleteJob,
  deleteTask,
  getJobByNum,
  getJobsByUser,
  getSingleJob,
  getTaskStages,
  getUserByRole,
  updateJobs,
  updateTask,
} from "../../../services/auth";
import { toast } from "react-toastify";
import { Bars } from "react-loader-spinner";
import ChatAndAttachment, {
  AddNewJobChatAndAttachment,
  ChatAndComment,
  CommentBox,
} from "./ChatAndAttachment";
import moment from "moment";
import { formatJobNumber } from "../../../pages/Jobs";
import AdhocTaskCompletionPopup from "../../dashboardTasks/AdhocTemplate";

const JobModal = ({
  job,
  handleClose,
  stage,
  usersLists,
  fetchJobs,
  reloadTabs,
  scrollRef,
}) => {
  const [tasks, setTasks] = useState({});
  const [data, setData] = useState(job);
  const [filteredTasks, setFilteredTasks] = useState({});
  const [dueDate, setDueDate] = useState(null);
  const [latestUpdate, setLatestUpdate] = useState("");
  const [AssessmentManager, setAssessmentManager] = useState("");
  const [selectedTab, setSelectedTab] = useState("to-do");
  const [selectedStage, setSelectedStage] = useState();
  const [selectedTasks, setSelectedTasks] = useState();
  const [progress, setProgress] = useState(0);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectOperative, setSelectOperative] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [showStatuses, setShowStatuses] = useState(false);
  const [isArchive, setIsArchive] = useState(false);
  const [isEOFY, setIsEOFY] = useState(false);
  const [isLinkedIn, setIsLinkedIn] = useState(false);
  const [assignee, setAssignee] = useState([]);
  const [loader, setLoader] = useState(false);
  const [status, setStatus] = useState("");
  const [userDropdownStates, setUserDropdownStates] = useState();
  const [taskSelectedAssignee, setTaskSelectedAssignee] = useState([]);
  const [showAssignee, setShowAssignee] = useState(false);
  const [showAssigneeMobile, setShowAssigneeMobile] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [showStagesMobile, setShowStagesMobile] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState([]);
  const [selectedOperative, setSelectedOperative] = useState(null);
  const [operative, setOperative] = useState(null);

  const addTaskRef = useRef(null);
  const [newTask, setNewTask] = useState({
    title: "",
    stageTitle: "",
    status: "to-do",
    stageId: "",
    due_date: "",
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
  const selectTaskDueDateRef = useRef(null);
  const popUpRef = useRef(null);
  const cardRef = useRef(null);
  const sliderRef = useRef(null);
  const activeCardRef = useRef(null);
  const addTaskAssigneeRef = useRef(null);
  const showStagesRef = useRef(null);
  const showStagesRefMobile = useRef(null);
  const showAssigneeRef = useRef(null);
  const showAssigneeRefMobile = useRef(null);
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 3,
    speed: 500,
    arrow: true,
  };
  const [calendarVisibility, setCalendarVisibility] = useState(false);

  const handleResetClick = () => {
    // Get the index of the active card
    const activeIndex = Array.from(
      activeCardRef.current.parentElement.parentElement.children
    ).indexOf(activeCardRef.current.parentElement);
    // Go to the slide corresponding to the active card
    sliderRef.current.slickGoTo(activeIndex);
  };

  useEffect(() => {
    let handler = (e) => {
      if (popUpRef.current && !popUpRef.current.contains(e.target)) {
        handleClose();
      }
      if (showStagesRef.current && !showStagesRef.current.contains(e.target)) {
        setShowStages(false);
      }
      if (
        showStagesRefMobile.current &&
        !showStagesRefMobile.current.contains(e.target)
      ) {
        setShowStages(false);
      }
      if (
        selectTaskDueDateRef.current &&
        !selectTaskDueDateRef.current.contains(e.target)
      ) {
        setCalendarVisibility(false);
      }
      if (
        showAssigneeRef.current &&
        !showAssigneeRef.current.contains(e.target)
      ) {
        setShowAssignee(false);
      }
      if (
        showAssigneeRefMobile.current &&
        !showAssigneeRefMobile.current.contains(e.target)
      ) {
        setShowAssigneeMobile(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [handleClose]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [scrollRef]);

  const getIdsForStages = (stages) => {
    let tempArr = {};
    stages?.map((stage) => {
      tempArr = { ...tempArr, [stage.title]: stage.id };
    });
    setStageIds(tempArr);
  };

  useEffect(() => {
    setLatestUpdate(data?.latest_update);
    setDueDate(data?.due_date);
    setStatus(data?.status);
    setAssessmentManager(data?.assessment_manager);
    setSelectedOperative(data?.operative_id);
    setOperative(data?.operative);
    if (data?.is_archive !== "0") {
      setIsArchive(true);
    }
    if (data?.eofy !== "0") {
      setIsEOFY(true);
    }
    if (data?.linkedin_post !== "0") {
      setIsLinkedIn(true);
    }
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
    sortStages(data?.stages);

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
    sortTasksInStages(data?.stages);

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
    data?.stages?.forEach((stage) => {
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
      const newState = prevStates?.map((state, i) => {
        return i === index ? true : false;
      });
      return newState;
    });
  };

  // for task list
  const handleTaskAssigneeClick = (userId) => {
    setTaskSelectedAssignee((prevUsers) => {
      if (prevUsers.some((selectedUser) => selectedUser.id === userId)) {
        // If the user is already selected, remove them from the list
        return prevUsers.filter((user) => user.id !== userId);
      } else {
        // If the user is not selected, add them to the list
        const userToAdd = assignee.find((user) => user.id === userId);
        return [...prevUsers, userToAdd];
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
    const taskSelectedAssigneeIds = taskSelectedAssignee.map((user) => user.id);
    let reqBody = {
      assignee_ids: taskSelectedAssigneeIds,
    };
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
        const notificationData = {
          class: "success",
          message: "Task Updated Successfully!",
        };
        const existingNotificationsJSON = localStorage.getItem("notifications");
        let existingNotifications = [];
        if (existingNotificationsJSON) {
          existingNotifications = JSON.parse(existingNotificationsJSON);
        }
        existingNotifications.push(notificationData);

        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );
        toast.success("Task Updated Successfully!");
      } else {
        const notificationData = {
          class: "error",
          message: "Failed to Update Task!",
        };
        const existingNotificationsJSON = localStorage.getItem("notifications");
        let existingNotifications = [];
        if (existingNotificationsJSON) {
          existingNotifications = JSON.parse(existingNotificationsJSON);
        }
        existingNotifications.push(notificationData);

        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );

        toast.error("Failed to Update Task!");
      }
    } catch (error) {
      console.log("error while updating task", error);
    }
    setLoader(false);
    setTaskSelectedAssignee([]);
    setUserDropdownStates(Array(19).fill(false));
    setNewTask({
      title: "",
      stageTitle: "",
      status: "to-do",
      stageId: "",
      due_date: "",
    });
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
          is_archive: isArchive ? "1" : "0",
          linkedin_post: isLinkedIn ? "1" : "0",
          eofy: isEOFY ? "1" : "0",
          operative_id: operative?.id,
          assessment_manager: AssessmentManager,
        },
      };
      console.log("reqBody", reqBody);
      const response = await updateJobs(reqBody);
      if (response.res) {
        const notificationData = {
          class: "success",
          message: response.res.message,
        };
        const existingNotificationsJSON = localStorage.getItem("notifications");
        let existingNotifications = [];
        if (existingNotificationsJSON) {
          existingNotifications = JSON.parse(existingNotificationsJSON);
        }
        existingNotifications.push(notificationData);

        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );

        toast.success(`${response.res.message}`);
      } else {
        console.error("jobs update failed:", response.error);
        const notificationData = {
          class: "error",
          message: response.error.message,
        };
        const existingNotificationsJSON = localStorage.getItem("notifications");
        let existingNotifications = [];
        if (existingNotificationsJSON) {
          existingNotifications = JSON.parse(existingNotificationsJSON);
        }
        existingNotifications.push(notificationData);

        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );
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
    if (!newTask.title || newTask.title?.trim() === "") {
      toast.error("Please Enter Task Title.");
      return;
    }
    if (newTask.stageTitle === "") {
      toast.error("Please Select Task Stage.");
      return;
    }
    if (newTask.due_date === "") {
      toast.error("Please Select Task Due Date.");
      return;
    }
    setLoader(true);
    const taskSelectedAssigneeIds = selectedAssignee.map((user) => user.id);
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
      assignee_ids: taskSelectedAssigneeIds,
    };
    try {
      const response = await createTask(reqBody);
      if (response.res) {
        setNewTask({
          ...newTask,
          users: selectedAssignee,
        });
        fetchJobs();
        const notificationData = {
          class: "success",
          message: "Task Created Successfully!",
        };
        const existingNotificationsJSON = localStorage.getItem("notifications");
        let existingNotifications = [];
        if (existingNotificationsJSON) {
          existingNotifications = JSON.parse(existingNotificationsJSON);
        }
        existingNotifications.push(notificationData);

        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );

        toast.success("Task Created Successfully!");
      } else {
        const notificationData = {
          class: "error",
          message: "Failed to Create Task!",
        };
        const existingNotificationsJSON = localStorage.getItem("notifications");
        let existingNotifications = [];
        if (existingNotificationsJSON) {
          existingNotifications = JSON.parse(existingNotificationsJSON);
        }
        existingNotifications.push(notificationData);

        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );

        toast.error("Failed to Create Task!");
        setNewTask({
          title: "",
          stageTitle: "",
          status: "to-do",
          due_date: "",
        });
      }
    } catch (error) {
      console.log("error while updating task", error);
    }
    setLoader(false);
    setUserDropdownStates(Array(19).fill(false));
    setShowAssignee(false);
    setNewTask({
      title: "",
      stageTitle: "",
      status: "to-do",
      due_date: "",
    });
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
        if (listItem) {
          listItem.classList.add(
            selectedTab === "to-do" ? "addCompleted" : "addTodo"
          );
        }

        setTimeout(() => {
          fetchJobs();
          setSelectedTasks();
          toast.success("Task Status Updated Successfully.");
        }, 1000);
      } else {
        toast.error("Failed to Create Task.");
      }
    } catch (error) {
    } finally {
      setLoader(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(2);

    return `${day}/${month}/${year}`;
  };

  const handleOperative = (userId) => {
    setSelectedOperative(userId);
    setSelectOperative(false);
    setOperative(assignee.find((user) => user.id === userId));
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
      <div className="loaderDiv2 mobile">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div className="container pop-container" ref={popUpRef}>
              <div className="popup-content" ref={scrollRef}>
                <div className="popup-section-left">
                  <div
                    className="top-section"
                    style={{ position: "sticky", top: "0", zIndex: "10" }}
                  >
                    <div className="topsection-left">
                      <div className="top-left-content align-baseline">
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
                          <div className="d-flex justify-content-between flex-wrap">
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
                                        ?.slice(0, 2)
                                        ?.map((user, index) => (
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
                                      {usersLists?.length > 2 && (
                                        <div
                                          className={`UserImg-count addedUserImages`}
                                          style={{
                                            minWidth: "40px",
                                            zIndex: 4,
                                          }}
                                        >
                                          <div className="count-card">
                                            {usersLists?.length - 2}+
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
                      {data?.stages?.length > 2 ? (
                        <>
                          <Slider {...settings} ref={sliderRef}>
                            {data?.stages?.map((stageMap, index) => (
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
                                    className={`card-slider card_${stageMap.title} `}
                                    ref={
                                      stageMap.title === stage
                                        ? activeCardRef
                                        : cardRef
                                    }
                                  >
                                    <div
                                      className={`card-image listContent d-flex align-items-center gap-2 ${
                                        stageMap?.users?.length <= 1
                                          ? ""
                                          : "justify-content-center"
                                      } navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv`}
                                    >
                                      <div className=" d-flex align-items-center justify-content-center">
                                        {stageMap?.users?.length > 0 && (
                                          <>
                                            {stageMap?.users
                                              ?.slice(0, 3)
                                              ?.map((user, index) => (
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
                                            {stageMap?.users?.length > 3 && (
                                              <div
                                                className={`UserImg-count addedUserImages`}
                                                style={{
                                                  minWidth: "40px",
                                                  zIndex: 4,
                                                }}
                                              >
                                                <div className="count-card">
                                                  {stageMap?.users?.length - 3}+
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        {stageMap?.users?.length === 0 && (
                                          <div
                                            className="UserImg"
                                            style={{ minWidth: "40px" }}
                                          >
                                            <User />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <h1 className="card-head mt-2">
                                      Applicant
                                    </h1>
                                    <p className="card-para ">
                                      {stageMap.tasks[0]?.title}
                                    </p>
                                    <p className="card-days-text mt-2">
                                      {stageMap.daysLeftForNearestTask} Days
                                      Left
                                    </p>
                                    <button
                                      className={`card-btn mt-2 btnn_${stageMap.title}`}
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
                          <div className="resetDiv">
                            <div
                              className="resetBtn"
                              onClick={handleResetClick}
                            >
                              <span>Reset</span>
                              <RedoIcon />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="slick-center d-flex">
                            {data?.stages?.map((stageMap, index) => (
                              <div className="slider-box">
                                <div
                                  className={`card-slider card_${stageMap.title} `}
                                  ref={
                                    stageMap.title === stage
                                      ? activeCardRef
                                      : cardRef
                                  }
                                >
                                  <div
                                    className={`card-image listContent d-flex align-items-center gap-2 ${
                                      stageMap?.users?.length <= 1
                                        ? ""
                                        : "justify-content-center"
                                    } navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv`}
                                  >
                                    <div className=" d-flex align-items-center justify-content-center">
                                      {stageMap?.users?.length > 0 && (
                                        <>
                                          {stageMap?.users
                                            ?.slice(0, 3)
                                            ?.map((user, index) => (
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
                                          {stageMap?.users?.length > 3 && (
                                            <div
                                              className={`UserImg-count addedUserImages`}
                                              style={{
                                                minWidth: "40px",
                                                zIndex: 4,
                                              }}
                                            >
                                              <div className="count-card">
                                                {stageMap?.users?.length - 3}+
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      {stageMap?.users?.length === 0 && (
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
                                  <p className="card-para ">
                                    {stageMap.tasks[0]?.title}
                                  </p>
                                  <p className="card-days-text mt-2">
                                    {stageMap.daysLeftForNearestTask} Days Left
                                  </p>
                                  <button
                                    className={`card-btn mt-2 btnn_${stageMap.title}`}
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
                            ))}
                          </div>
                        </>
                      )}
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
                                htmlFor={`task_select_${task.id}`}
                                className="align-self-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`task_select_${task.id}`}
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

                              <div className="w-100  d-flex align-items-center position-relative flex-wrap flex-md-nowrap">
                                <div
                                  className="d-flex justify-content-between application-lodge mobile"
                                  // style={{ "min-width": "92%" }}
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

                                  <button
                                    className={`application-lodge-btn btn_${task.stageTitle}`}
                                  >
                                    {StageList[task?.stageTitle]}
                                  </button>
                                </div>
                                <div className="card-image user-cards listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                  <div className=" d-flex align-items-center justify-content-center">
                                    {task?.users?.length > 0 ? (
                                      <>
                                        {task?.users
                                          ?.slice(0, 2)
                                          ?.map((user, i) => (
                                            <div
                                              key={user.id}
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
                                          ))}
                                        {task?.users?.length > 2 && (
                                          <div
                                            className={`UserImg-count addedUserImages withAddBtn`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: 4,
                                            }}
                                          >
                                            <div className="count-card">
                                              {task?.users?.length - 2}+
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
                                        <div
                                          className="addTaskJobListScroll"
                                          ref={addTaskAssigneeRef}
                                        >
                                          <div className="addTaskJobListItems text-start">
                                            <label className="addedAssignees">
                                              Assignees
                                            </label>
                                            <div className="addedAssigneeBorder">
                                              {console.log(
                                                "assignee",
                                                assignee,
                                                taskSelectedAssignee
                                              )}
                                              {assignee &&
                                                assignee
                                                  .filter((user) =>
                                                    taskSelectedAssignee.some(
                                                      (selectedUser) =>
                                                        selectedUser.id ===
                                                        user.id
                                                    )
                                                  )
                                                  .map((user) => (
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
                                                        -
                                                      </div>
                                                    </div>
                                                  ))}
                                            </div>
                                            <label className="">
                                              Add Assignees
                                            </label>
                                            {assignee
                                              ?.filter(
                                                (user) =>
                                                  !taskSelectedAssignee?.some(
                                                    (selectedUser) =>
                                                      selectedUser.id ===
                                                      user.id
                                                  )
                                              )
                                              ?.map((user) => (
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
                                                    {taskSelectedAssignee?.some(
                                                      (itemId) =>
                                                        itemId === user.id
                                                    )
                                                      ? "-"
                                                      : "+"}
                                                  </div>
                                                </div>
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
                              onChange={(e) =>
                                handleTasksCheckBoxSelect(e, tasks?.length)
                              }
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
                              className="d-flex justify-content-between application-lodge "
                              style={{ "min-width": "92%" }}
                            >
                              <div className="d-flex gap-3 align-items-center">
                                {newTask.due_date !== "" ? (
                                  <img
                                    src="/assets/Group 87.png"
                                    alt=""
                                    style={{ width: "18px", height: "18px" }}
                                  />
                                ) : (
                                  <div className="centerText addTaskJobDiv">
                                    <div
                                      className="addTaskDueDateBtn"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        setCalendarVisibility(
                                          !calendarVisibility
                                        )
                                      }
                                    >
                                      <TaskIcon />{" "}
                                    </div>
                                    {calendarVisibility && (
                                      <div
                                        className="datePickerDiv"
                                        ref={selectTaskDueDateRef}
                                      >
                                        <Calendar
                                          date={selectedDueDate}
                                          onChange={(date) => {
                                            const year = date.getFullYear();
                                            const month = String(
                                              date.getMonth() + 1
                                            ).padStart(2, "0");
                                            const day = String(
                                              date.getDate()
                                            ).padStart(2, "0");
                                            let formattedDueDate = `${year}-${month}-${day}`;
                                            setNewTask({
                                              ...newTask,
                                              due_date: formattedDueDate,
                                            });
                                            setCalendarVisibility(false);
                                          }}
                                          value={selectedDueDate}
                                          calendarType="ISO 8601"
                                          rangeColors={["#E2E31F"]}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
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
                                    className={`application-lodge-btn btn_${newTask?.stageTitle}`}
                                  >
                                    {StageList[newTask?.stageTitle]}
                                  </button>
                                )}
                                {showStages && (
                                  <div className="stage-addTaskJobDropdown">
                                    <div className="addTaskJobListScroll">
                                      <div className="addTaskJobListItems">
                                        {Object.keys(StageList)?.map(
                                          (key, i) => (
                                            <div
                                              key={i}
                                              className={`addTaskJobStageItem ${key}`}
                                              onClick={() => {
                                                setNewTask({
                                                  ...newTask,
                                                  stageTitle: key,
                                                  stageId: StageList[key],
                                                });
                                                setShowStages(false);
                                              }}
                                            >
                                              {StageList[key]}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="card-image user-cards listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center justify-content-end">
                                {newTask.users?.length > 0 ? (
                                  <>
                                    {newTask.users
                                      ?.slice(0, 2)
                                      .map((user, i) => (
                                        <div
                                          key={user.id}
                                          className={` UserImg addedUserImages ${
                                            i === newTask.users.length - 1
                                              ? "withAddBtn"
                                              : ""
                                          }`}
                                          style={{
                                            minWidth: "40px",
                                            zIndex: i,
                                          }}
                                          onClick={() => {
                                            if (newTask.users) {
                                              setSelectedAssignee(
                                                newTask.users
                                              );
                                            } else {
                                              setSelectedAssignee([]);
                                            }
                                          }}
                                        >
                                          {user.profile_pic !== "" &&
                                          user.profile_pic !==
                                            "default-profile-pic.jpg" ? (
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
                                      ))}
                                    {newTask.users?.length > 2 && (
                                      <div
                                        key={3}
                                        className={`UserImg-count addedUserImages withAddBtn`}
                                        style={{
                                          minWidth: "40px",
                                          zIndex: 4,
                                        }}
                                      >
                                        <div className="count-card">
                                          {newTask.users?.length - 2}+
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div
                                    className="UserImg withAddBtn"
                                    onClick={() => {
                                      if (newTask.users) {
                                        setSelectedAssignee(newTask.users);
                                      } else {
                                        setSelectedAssignee([]);
                                      }
                                      setShowAssignee(!showAssignee);
                                    }}
                                    style={{ minWidth: "40px" }}
                                  >
                                    <User />
                                  </div>
                                )}
                                {showAssignee && (
                                  <div
                                    className="addAssigneeDropdown1"
                                    ref={showAssigneeRef}
                                  >
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
                                                  (item) => item.id === user.id
                                                )
                                              )
                                              .map((user) => (
                                                <div
                                                  key={user.id}
                                                  className={`addAssigneeDiv  ${
                                                    selectedAssignee?.some(
                                                      (item) =>
                                                        item.id === user.id
                                                    ) && "active"
                                                  }`}
                                                  onClick={() => {
                                                    handleAssigneeClick(user);
                                                  }}
                                                >
                                                  <div
                                                    className={` UserImg addedUserImages `}
                                                    style={{
                                                      minWidth: "40px",
                                                    }}
                                                  >
                                                    {user.profile_pic !== "" &&
                                                    user.profile_pic !==
                                                      "default-profile-pic.jpg" ? (
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
                                                      (item) =>
                                                        item.id === user.id
                                                    )
                                                      ? "-"
                                                      : "+"}
                                                  </div>
                                                </div>
                                              ))}
                                        </div>
                                        <label className="">
                                          Add Assignees
                                        </label>
                                        {assignee
                                          .filter(
                                            (user) =>
                                              !selectedAssignee?.some(
                                                (item) => item.id === user.id
                                              )
                                          )
                                          .map((user) => (
                                            <div
                                              key={user.id}
                                              className={`addAssigneeDiv ${
                                                selectedAssignee?.some(
                                                  (item) => item.id === user.id
                                                ) && "active"
                                              }`}
                                              onClick={() =>
                                                handleAssigneeClick(user)
                                              }
                                            >
                                              <div
                                                className={` UserImg addedUserImages `}
                                                style={{ minWidth: "40px" }}
                                              >
                                                {user.profile_pic !== "" &&
                                                user.profile_pic !==
                                                  "default-profile-pic.jpg" ? (
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
                                                  (item) => item.id === user.id
                                                )
                                                  ? "-"
                                                  : "+"}
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                      <div className="d-flex flex-wrap gap-3 align-content-center justify-content-between mt-3">
                                        <button
                                          className="colorOutlineBtn"
                                          onClick={() =>
                                            handleAddAssignee(newTask)
                                          }
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
                    <div className="table-main-section mobile mt-4 ">
                      <ul
                        className={`task-list ${showTask ? "show" : ""}`}
                        id="task-list-ul"
                      >
                        {filteredTasks?.length > 0 &&
                          filteredTasks?.map((task, index) => (
                            <li id={`stage_` + task.id} key={index}>
                              <label
                                htmlFor={`task_select_${task.id}`}
                                className="align-self-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`task_select_${task.id}`}
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
                              <div className="taskBox application-lodge">
                                <div className="taskItem ">
                                  <div className="taskHeading">
                                    <p>Title:</p>
                                  </div>
                                  <p
                                    className={`text-end text_${task.stageTitle}`}
                                  >
                                    {task.title}
                                  </p>
                                </div>
                                <div className="taskItem">
                                  <div className="taskHeading">
                                    <p>Stage:</p>
                                  </div>
                                  <button
                                    className={`application-lodge-btn btn_${task.stageTitle}`}
                                  >
                                    {StageList[task?.stageTitle]}
                                  </button>
                                </div>
                                <div className="taskItem">
                                  <div className="taskHeading"></div>
                                  <div className="card-image user-cards listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                    <div className=" d-flex align-items-center justify-content-center">
                                      {task?.users?.length > 0 ? (
                                        <>
                                          {task?.users
                                            ?.slice(0, 3)
                                            ?.map((user, i) => (
                                              <>
                                                <div
                                                  key={user.id}
                                                  className={` UserImg addedUserImages ${
                                                    i ===
                                                    task?.users?.length - 1
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
                                                      setTaskSelectedAssignee(
                                                        []
                                                      );
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
                                              setTaskSelectedAssignee(
                                                task.users
                                              );
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
                                        <div className="addAssigneeDropdown">
                                          <div
                                            className="addTaskJobListScroll"
                                            ref={addTaskAssigneeRef}
                                          >
                                            <div className="addTaskJobListItems">
                                              <label className="addedAssignees">
                                                Assignees
                                              </label>
                                              <div className="addedAssigneeBorder">
                                                {assignee &&
                                                  assignee
                                                    ?.filter((user) =>
                                                      taskSelectedAssignee?.some(
                                                        (itemId) =>
                                                          itemId === user.id
                                                      )
                                                    )
                                                    ?.map((user) => (
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
                                                    ))}
                                              </div>
                                              <label className="">
                                                Add Assignees
                                              </label>
                                              {assignee
                                                ?.filter(
                                                  (user) =>
                                                    !taskSelectedAssignee?.some(
                                                      (itemId) =>
                                                        itemId === user.id
                                                    )
                                                )
                                                ?.map((user) => (
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
                              </div>
                            </li>
                          ))}

                        <li>
                          <div className="taskBox application-lodge">
                            <div className="taskItem ">
                              <div className="taskHeading">
                                <p>Title:</p>
                              </div>
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
                            <div className="taskItem">
                              <div className="taskHeading">
                                <p>Stage:</p>
                              </div>
                              <div className="stage-addTaskJobDiv">
                                {newTask.stageTitle === "" ? (
                                  <div
                                    className="addStage-btn "
                                    onClick={() =>
                                      setShowStagesMobile(!showStagesMobile)
                                    }
                                  >
                                    + Add Stage
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setShowStagesMobile(!showStagesMobile)
                                    }
                                    className={`application-lodge-btn btn_${newTask?.stageTitle}`}
                                  >
                                    {StageList[newTask?.stageTitle]}
                                  </button>
                                )}
                                {showStagesMobile && (
                                  <div
                                    className="stage-addTaskJobDropdown right"
                                    ref={showStagesRefMobile}
                                  >
                                    <div className="addTaskJobListScroll ">
                                      <div className="addTaskJobListItems">
                                        {Object.keys(StageList)?.map(
                                          (key, i) => (
                                            <div
                                              key={i}
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
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="taskItem">
                              <div className="taskHeading"></div>
                              <div className="listContent user-cards d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                <div className=" d-flex align-items-center justify-content-end">
                                  {selectedAssignee?.length > 0 ? (
                                    <>
                                      {selectedAssignee
                                        ?.slice(0, 2)
                                        ?.map((user, i) => (
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
                                              setShowAssigneeMobile(
                                                !showAssigneeMobile
                                              )
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
                                        ))}
                                      {selectedAssignee?.length > 2 && (
                                        <div
                                          className={`UserImg-count addedUserImages withAddBtn`}
                                          style={{
                                            minWidth: "40px",
                                            zIndex: 4,
                                          }}
                                        >
                                          <div className="count-card">
                                            {selectedAssignee?.length - 2}+
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div
                                      className="UserImg withAddBtn"
                                      onClick={() =>
                                        setShowAssigneeMobile(
                                          !showAssigneeMobile
                                        )
                                      }
                                      style={{ minWidth: "40px" }}
                                    >
                                      <User />
                                    </div>
                                  )}
                                  {showAssigneeMobile && (
                                    <div
                                      className="addAssigneeDropdown1"
                                      ref={showAssigneeRefMobile}
                                    >
                                      <div className="addTaskJobListScroll">
                                        <div className="addTaskJobListItems">
                                          <label className="addedAssignees">
                                            Assignees
                                          </label>
                                          <div className="addedAssigneeBorder">
                                            {assignee &&
                                              assignee
                                                ?.filter((user) =>
                                                  selectedAssignee?.some(
                                                    (itemId) =>
                                                      itemId === user.id
                                                  )
                                                )
                                                ?.map((user) => (
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
                                                ))}
                                          </div>
                                          <label className="">
                                            Add Assignees
                                          </label>
                                          {assignee
                                            ?.filter(
                                              (user) =>
                                                !selectedAssignee?.some(
                                                  (itemId) => itemId === user.id
                                                )
                                            )
                                            ?.map((user) => (
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
                        className="input-box position-relative d-flex align-items-center"
                        style={{ textAlign: "left", cursor: "pointer" }}
                      >
                        <div
                          className="addTaskDueDateBtn "
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
                                {Object.keys(StatusList)?.map((key) => (
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
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Archive</p>
                      <div className="status-addTaskJobDiv">
                        <button
                          className={`checkBtn ${isArchive && "active"} h-100`}
                          onClick={() => setIsArchive(!isArchive)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 15 15"
                          >
                            <rect width="100%" height="100%" fill="none" />
                            <path
                              fill="none"
                              stroke="inherit"
                              d="M4 7.5L7 10l4-5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Assessment Manager</p>
                      <input
                        type="text"
                        name="latest-update"
                        id="latest-update"
                        placeholder="First Name Last Name"
                        value={AssessmentManager}
                        onChange={(e) => setAssessmentManager(e.target.value)}
                        className="text-white"
                      />
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Latest Comment</p>
                      <div
                        className="input-box position-relative d-flex align-items-center"
                        style={{ textAlign: "left", cursor: "auto" }}
                      >
                        <div className="addTaskDueDateBtn ">
                          {formatDate(data?.comment)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="d-flex gap-3 navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv position-relative"
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Operative</p>
                      <div className="status-addTaskJobDiv ">
                        <button
                          className={`checkBtn user h-100`}
                          onClick={() => setSelectOperative(!selectOperative)}
                        >
                          {selectedOperative ? (
                            <>
                              {operative.profile_pic !== "" ? (
                                <img
                                  alt={operative.name}
                                  src={
                                    process.env
                                      .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                    operative.profile_pic
                                  }
                                />
                              ) : (
                                <User />
                              )}
                            </>
                          ) : (
                            <User />
                          )}
                        </button>
                      </div>
                      {selectOperative && (
                        <div
                          className="addAssigneeDropdown1 "
                          style={{ top: "50%", height: "auto" }}
                        >
                          <div className="addTaskJobListScroll">
                            <div className="addTaskJobListItems text-start">
                              <label className="">Add Operative</label>
                              {assignee
                                ?.filter(
                                  (user) =>
                                    !taskSelectedAssignee?.some(
                                      (selectedUser) =>
                                        selectedUser.id === user.id
                                    )
                                )
                                ?.map((user) => (
                                  <div
                                    key={user.id}
                                    className={`addAssigneeDiv ${
                                      taskSelectedAssignee?.some(
                                        (itemId) => itemId === user.id
                                      ) && "active"
                                    }`}
                                    onClick={() => handleOperative(user.id)}
                                  >
                                    <div
                                      className={` UserImg addedUserImages `}
                                      style={{
                                        minWidth: "40px",
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
                                    <div>
                                      <h4>{user.name}</h4>
                                      <p className="h-auto bg-transparent">
                                        {user.email}
                                      </p>
                                    </div>
                                    <div className="checkAddBtn">
                                      {taskSelectedAssignee?.some(
                                        (itemId) => itemId === user.id
                                      )
                                        ? "-"
                                        : "+"}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Created</p>
                      <div
                        className="input-box position-relative d-flex align-items-center"
                        style={{ textAlign: "left", cursor: "auto" }}
                      >
                        <div className="addTaskDueDateBtn ">
                          {formatDate(data?.created_at)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>EOFY</p>
                      <div className="status-addTaskJobDiv">
                        <button
                          className={`checkBtn ${isEOFY && "active"} h-100`}
                          onClick={() => setIsEOFY(!isEOFY)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 15 15"
                          >
                            <rect width="100%" height="100%" fill="none" />
                            <path
                              fill="none"
                              stroke="inherit"
                              d="M4 7.5L7 10l4-5"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>LinkedIn Post</p>
                      <div className="status-addTaskJobDiv">
                        <button
                          className={`checkBtn ${isLinkedIn && "active"} h-100`}
                          onClick={() => setIsLinkedIn(!isLinkedIn)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 15 15"
                          >
                            <rect width="100%" height="100%" fill="none" />
                            <path
                              fill="none"
                              stroke="inherit"
                              d="M4 7.5L7 10l4-5"
                            />
                          </svg>
                        </button>
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
                  <ChatAndAttachment JobId={data?.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const NewJobModal = ({
  job,
  handleClose,
  reloadTabs,
  scrollRef,
  usersList,
}) => {
  const [loader, setLoader] = useState(false);
  const [description, setDescription] = useState(job?.description || "");
  const [isDeleting, setIsDeleting] = useState(false);

  const popUpRef = useRef(null);

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [scrollRef]);

  useEffect(() => {
    setDescription(job?.description);
  }, [job, reloadTabs]);

  const handleOnChange = (e) => {
    setDescription(e.target.value);
  };

  const handleModalClose = async () => {
    if (!isDeleting) {
      job = {
        ...job,
        description: description ?? "",
      };
    }
    await handleClose(isDeleting, description); // Pass the deletion flag to the parent
  };

  const handleDelete = async () => {
    try {
      setLoader(true);
      setIsDeleting(true); // Set the deletion flag
      const response = await deleteJob(job.id);
      if (response.res) {
        console.log("Job delete successful", response.res);
      } else {
        console.error("Job delete failed:", response.error);
        toast.error(response.error?.message || "Failed to delete the job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Error deleting job");
    } finally {
      setLoader(false);
      await handleClose(true); // Notify the parent to close the modal with the deletion flag
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
      <div className="loaderDiv2 mobile">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div
              className="container newJob-pop-container pop-container"
              ref={popUpRef}
            >
              <div className="popup-content" ref={scrollRef}>
                <div className="popup-section-left">
                  <div className="topFlexDiv">
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleDelete}
                    >
                      <div className="deletBg">
                        <DeleteIcon />
                      </div>
                      <div className="delete-item">Delete Job</div>
                    </div>
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleModalClose}
                    >
                      <div className="searchUserImg">
                        <OpenCloseIcon />
                      </div>
                      <div className="delete-item">Collapse</div>
                    </div>
                  </div>
                  <div className="innerScroll">
                    <h2 className="jobTitle">{job?.title}</h2>
                    <div className="discriptionBox">
                      <h3>Description</h3>
                      <textarea
                        type="text"
                        name="description"
                        id=""
                        rows={2}
                        value={description}
                        onChange={handleOnChange}
                        placeholder="Add Description Here..."
                      />
                    </div>
                    <AddNewJobChatAndAttachment
                      JobId={job?.id}
                      usersList={usersList}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const NewJobModalWithTasks = ({
  job,
  handleClose,
  reloadTabs,
  scrollRef,
  usersList,
}) => {
  const [loader, setLoader] = useState(false);
  const [description, setDescription] = useState(job?.description || "");
  const [isDeleting, setIsDeleting] = useState(false);

  const [jobTasks, setJobTasks] = useState(job?.tasks || []);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [activeTaskJob, setActiveTaskJob] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const popUpRef = useRef(null);
  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [scrollRef]);

  useEffect(() => {
    setDescription(job?.description || "");
  }, [job, reloadTabs]);

  const handleOnChange = (e) => {
    setDescription(e.target.value);
  };

  const handleModalClose = async () => {
    if (!isDeleting && job && description) {
      job.description = description;
    }
    if (!isDeleting && job && jobTasks) {
      console.log("job tasks", jobTasks);
      job.tasks = jobTasks;
    }
    await handleClose(isDeleting);
  };

  const handleDelete = async () => {
    try {
      setLoader(true);
      setIsDeleting(true); // Set the deletion flag
      const response = await deleteJob(job.id);
      if (response.res) {
        console.log("Job delete successful", response.res);
      } else {
        console.error("Job delete failed:", response.error);
        toast.error(response.error?.message || "Failed to delete the job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Error deleting job");
    } finally {
      setLoader(false);
      await handleClose(true); // Notify the parent to close the modal with the deletion flag
    }
  };

  const handleAddTaskClick = (job) => {
    setActiveTaskJob(job);
    setShowAddTaskModal(true);
  };

  const handleCheckTask = async (jobId, index) => {
    try {
      setLoader(true);
      const response = await getSingleJob(jobId);
      if (response.res) {
        setActiveTask(response.res.tasks[index]);
        var updatedTask = response.res.tasks[index];
        // setFilteredJobs((prevJobs) =>
        //   prevJobs.map((job) =>
        //     job.tasks.some((task) => task.id === updatedTask.id)
        //       ? {
        //           ...job,
        //           tasks: job.tasks.map((task) =>
        //             task.id === updatedTask.id
        //               ? {
        //                   ...task,
        //                   title: updatedTask?.title,
        //                 }
        //               : task
        //           ),
        //         }
        //       : job
        //   )
        // );
        setShowUpdateTaskModal(true);
      } else {
        console.error("get task failed:", response.error);
        toast.error(response.error?.message || "Failed to get the job");
      }
    } catch (error) {
      console.error("Error getting job:", error);
      toast.error("Error getting task");
    } finally {
      setLoader(false);
    }
  };

  const handleCreateModalTask = async (newData, taskId, users, stage) => {
    console.log(newData?.newTask);
    setJobTasks((prevTasks) => [
      {
        title: newData?.newTask?.title,
        description: newData?.newTask?.description,
        stage_id: newData?.newTask?.stage_id,
        due_date: newData?.newTask?.due_date,
        status: newData?.newTask?.status,
        assignee_ids: newData?.newTask?.assignee_ids,
        users: users,
        stage: stage,
      },
      ...prevTasks,
    ]);
    setShowAddTaskModal(false);
    var response = await createTask(newData.newTask, taskId);
    if (response.res) {
      console.log("Task create successful", response.res);
    } else {
      console.error("Task create failed:", response.error);
      toast.error(response.error?.message || "Failed to add the task");
    }
  };

  const handleUpdateTask = async (
    newData,
    taskId,
    newJobCollaboratorsList,
    stage
  ) => {
    console.log(taskId, " - ", activeTask.id, " - ", newData);

    setJobTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: newData?.updatedTask?.title || task?.title,
              description:
                newData?.updatedTask?.description || task?.description,
              stage_id: newData?.updatedTask?.stage_id || task?.stage_id,
              due_date: newData?.updatedTask?.due_date || task?.due_date,
              status: newData?.updatedTask?.status || task?.status,
              users: newJobCollaboratorsList || task?.users,
              stage: stage || task?.stage,
            }
          : task
      )
    );
    setShowUpdateTaskModal(false);
    var response = await updateTask(newData, taskId);
    if (response.res) {
      console.log("Task Update successful", response.res);
    } else {
      console.error("Task Update failed:", response.error);
      toast.error(response.error?.message || "Failed to Update the task");
    }
  };

  const handleCloseModal = async () => {
    setShowUpdateTaskModal(false);
    setActiveTask(null);
  };

  const handleTaskDelete = async (task) => {
    try {
      const response = await deleteTask(task.id);
      if (response.res) {
        console.log("Job delete successful", response.res);
      } else {
        console.error("Job delete failed:", response.error);
        toast.error(response.error?.message || "Failed to delete the job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Error deleting job");
    }
  };

  function formatStatus(status) {
    return status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const handleSendEmail = () => {
    setShowEmailPopup(true);
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

      {showAddTaskModal && (
        <CreateTaskModal
          task={activeTaskJob}
          handleClose={async () => {
            setShowAddTaskModal(false);
          }}
          onCreateTask={handleCreateModalTask}
          handleDelete={() => {
            setShowAddTaskModal(false);
          }}
        />
      )}
       {showEmailPopup && (
        <AdhocTaskCompletionPopup
          jobId={job?.id}
          handleClose={() => {
            setShowEmailPopup(false);
          }}
        />
      )}

      {showUpdateTaskModal && activeTask && (
        <UpdateTaskModal
          returnToJob={true}
          task={activeTask}
          handleClose={handleCloseModal}
          onUpdateTask={handleUpdateTask}
          handleDelete={() => {
            setJobTasks((prevTask) =>
              prevTask.filter((task) => task.id !== activeTask.id)
            );
            handleTaskDelete(activeTask);
            handleCloseModal();
          }}
        />
      )}

      <div className="loaderDiv2 mobile">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div
              className="container newJob-pop-container pop-container"
              ref={popUpRef}
            >
              <div className="popup-content" ref={scrollRef}>
                <div className="popup-section-left">
                  <div className="topFlexDiv">
                 
                      <div
                        className="delete-box"
                        style={{ cursor: "pointer", zIndex: 2 }}
                        onClick={handleSendEmail}
                      >
                        <div className="deletBg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="36"
                            height="36"
                            viewBox="0 0 36 36"
                            fill="none"
                          >
                            <mask id="path-1-inside-1_4895_1898" fill="white">
                              <rect width="36" height="36" rx="1" />
                            </mask>
                            <rect
                              width="36"
                              height="36"
                              rx="1"
                              fill="#E2E31F"
                            />
                            <rect
                              width="36"
                              height="36"
                              rx="1"
                              stroke="#E2E31F"
                              stroke-width="3"
                              mask="url(#path-1-inside-1_4895_1898)"
                            />
                            <path
                              d="M25.7806 16.6394L12.7399 9.19799C12.4648 9.04385 12.1492 8.97719 11.8352 9.0069C11.5213 9.03661 11.2238 9.16126 10.9824 9.36427C10.7411 9.56727 10.5673 9.83899 10.4843 10.1432C10.4012 10.4475 10.4128 10.7698 10.5176 11.0673L12.8928 17.9896L10.5176 24.9305C10.4348 25.1645 10.4093 25.4149 10.4434 25.6608C10.4774 25.9067 10.5699 26.1408 10.7131 26.3435C10.8563 26.5462 11.046 26.7116 11.2664 26.8259C11.4867 26.9401 11.7313 26.9998 11.9795 27C12.2461 26.9994 12.5082 26.9305 12.7407 26.7998L12.7477 26.7951L25.7837 19.3405C26.0228 19.2052 26.2216 19.0089 26.3599 18.7716C26.4983 18.5344 26.5712 18.2646 26.5712 17.99C26.5712 17.7153 26.4983 17.4456 26.3599 17.2083C26.2216 16.971 26.0228 16.7747 25.7837 16.6394H25.7806ZM12.5413 24.7676L14.5401 18.93H18.8079C19.0548 18.93 19.2917 18.8319 19.4663 18.6573C19.6409 18.4827 19.739 18.2459 19.739 17.9989C19.739 17.7519 19.6409 17.5151 19.4663 17.3405C19.2917 17.1658 19.0548 17.0677 18.8079 17.0677H14.5456L12.542 11.2294L24.3901 17.9904L12.5413 24.7676Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                        <div className="delete-item">Send Email</div>
                      </div>
                    
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleDelete}
                    >
                      <div className="deletBg">
                        <DeleteIcon />
                      </div>
                      <div className="delete-item">Delete Job</div>
                    </div>
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleModalClose}
                    >
                      <div className="searchUserImg">
                        <OpenCloseIcon />
                      </div>
                      <div className="delete-item">Collapse</div>
                    </div>
                  </div>
                  <div className="innerScroll">
                    <h2 className="jobTitle" title={job?.title}>
                      {job?.title}
                    </h2>
                    <div className="discriptionBox">
                      <h3>Description</h3>
                      <textarea
                        type="text"
                        name="description"
                        id=""
                        rows={2}
                        value={description}
                        onChange={handleOnChange}
                        placeholder="Add Description Here..."
                      />
                    </div>
                    {/* <div className="discriptionBox">
                      <h3>Tasks</h3>
                      <div
                        className="d-flex align-items-center flex-wrap"
                        style={{ gap: "8px" }}
                      >
                        {jobTasks.length > 0 && (
                          <>
                            {jobTasks.map((task, index) => {
                              return (
                                <span
                                  key={index}
                                  style={{ cursor: "pointer" }}
                                  className={`statusBtn mx-0 ${task.status}`}
                                  onClick={() => {
                                    console.log(task);
                                    if (!task.id) {
                                      console.log("not from db");
                                      handleCheckTask(job.id, index);
                                    } else {
                                      setActiveTask(task);
                                      setShowUpdateTaskModal(true);
                                    }
                                  }}
                                >
                                  {task.title}
                                </span>
                              );
                            })}
                          </>
                        )}
                        <div className={`px-3 clickBox`}>
                          <div
                            style={{ cursor: "pointer" }}
                            className={`clickBoxtext`}
                            onClick={() => handleAddTaskClick(job)}
                          >
                            Add Tasks +
                          </div>
                        </div>
                      </div>
                    </div> */}
                    <div className="discriptionBox">
                      <h3>Tasks</h3>
                    
                      <div
                        className={`task-table-container job-task-table-container ${
                          showAllTasks ? "show-more" : ""
                        }`}
                      >
                        <table className="task-table">
                          <tbody>
                            {jobTasks.map((task, index) => (
                              <tr key={index} className="task-row">
                                <td
                                  className={`task-title text-left   ${
                                    task.stage?.title?.split(" ")[0]
                                  }`}
                                  title={task?.title}
                                >
                                  {task?.title}
                                </td>
                                <td className="addNewTaskDiv text-center">
                                  <span
                                    className={`addTaskJobBtn stage_${
                                      task.stage?.title?.split(" ")[0]
                                    }`}
                                  >
                                    {task.stage?.title
                                      ? task.stage?.title
                                      : "N/A"}
                                  </span>
                                </td>
                                <td className="due-date">
                                  Due Date:{" "}
                                  <span>
                                    {moment(task.due_date).format("DD/MM/YYYY")}
                                  </span>
                                </td>
                                <td>
                                  <span className={`statusBox ${task.status}`}>
                                    {formatStatus(task.status)}
                                  </span>
                                </td>
                                <td>
                                  <div
                                    className="view-more"
                                    onClick={() => {
                                      if (!task.id) {
                                        handleCheckTask(job.id, index);
                                      } else {
                                        setActiveTask(task);
                                        setShowUpdateTaskModal(true);
                                      }
                                    }}
                                  >
                                    <RightArrow />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {jobTasks?.length > 4 && (
                        <div
                          className={`show-all-tasks ${
                            showAllTasks ? "show-more" : ""
                          }`}
                          onClick={() => setShowAllTasks(!showAllTasks)}
                        >
                          <DownArrow
                            className={`down-arrow-icon ${
                              showAllTasks ? "rotate" : ""
                            }`}
                          />
                          <span>
                            {showAllTasks
                              ? "Show Less Tasks"
                              : "Show All Tasks"}
                          </span>
                        </div>
                      )}

                      <div className={`px-1 add-task`}>
                        <button
                          className={`add-task-btn`}
                          onClick={() => handleAddTaskClick(job)}
                        >
                          <AddTaskGreyButton /> Add Task
                        </button>
                      </div>
                    </div>
                    {/* <AddNewJobChatAndAttachment
                      JobId={job?.id}
                      usersList={usersList}
                    /> */}
                    <ChatAndComment JobId={job?.id} usersList={usersList} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const NewTaskModal = ({
  jobNum,
  handleClose,
  handleDelete,
  onCreateTask,
  reloadTabs,
  scrollRef,
}) => {
  const [loader, setLoader] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [stage, setStage] = useState(null);
  const [stageBox, setStageBox] = useState(false);
  const [stageList, setStageList] = useState([]);
  const [dueDateCalender, setDueDateCalender] = useState(false);
  const [collaboratorsBox, setCollaboratorsBox] = useState(false);
  const [addStageBox, setAddStageBox] = useState(false);
  const [statusBox, setStatusBox] = useState(false);
  const [taskStatus, setTatskStatus] = useState("not-started");
  const [newJobCollaboratorsList, setNewJobCollaboratorsList] = useState([]);
  const [newJobCollaboratorsListId, setNewJobCollaboratorsListId] = useState(
    []
  );
  const [addStageTitle, setAddStageTitle] = useState("");
  const [colors, setColors] = useState([]);
  const [activeStageColor, setActiveStageColor] = useState("");
  const [usersList, setUsersList] = useState([]);
  const popUpRef = useRef(null);
  const datePickerRef = useRef(null);
  const newCollaboratorBoxRef = useRef(null);
  const statusBoxRef = useRef(null);
  const stageBoxRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const inputRef = useRef(null);
  const [firstClick, setFirstClick] = useState(true);
  const popupRef = useRef(null);
  const [inputPlaceholder, setInputPlaceholder] = useState("Select Task");

  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

  const fetchStages = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      let response = await getTaskStages(authToken);
      if (response.res) {
        setStageList(response.res);
        console.log("stages", response.res);
      } else {
        console.error("Failed to fetch Users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // useEffect(() => {
  //   const year = new Date().getFullYear();
  //   const month = String(new Date().getMonth() + 1).padStart(2, "0");
  //   const day = String(new Date().getDate()).padStart(2, "0");
  //   let formattedDueDate = `${year}-${month}-${day}`;
  //   setDueDate(formattedDueDate);
  // }, []);

  useEffect(() => {
    fetchUsers();
    fetchStages();
  }, []);

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [scrollRef]);

  const handleOnChange = (e) => {
    setDescription(e.target.value);
  };

  const handleModalClose = async () => {
    const newTask = {
      title: title,
      job_num: jobNum,
      due_date: dueDate,
      status: taskStatus,
      assignee_ids: newJobCollaboratorsListId,
      stage_id: stage?.id,
      description: description,
    };
    if (title !== "") {
      onCreateTask(newTask);
    } else {
      handleClose();
    }
  };

  const handleDueDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setDueDate(formattedDueDate);
    setDueDateCalender(false);
  };

  useEffect(() => {
    const handleClickOutside = async (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setDueDateCalender(false);
      }
      if (
        newCollaboratorBoxRef.current &&
        !newCollaboratorBoxRef.current.contains(event.target)
      ) {
        setCollaboratorsBox(false);
      }
      if (
        statusBoxRef.current &&
        !statusBoxRef.current.contains(event.target)
      ) {
        setStatusBox(false);
      }
      if (stageBoxRef.current && !stageBoxRef.current.contains(event.target)) {
        setStageBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRemoveCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) =>
      prevList.filter((u) => u.email !== user.email)
    );
    setUsersList((prevList) => [...prevList, user]);

    setNewJobCollaboratorsListId((prevList) =>
      prevList.filter((u) => u.id !== user.id)
    );
  };

  const handleSelectCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) => [...prevList, user]);
    setUsersList((prevList) => prevList.filter((u) => u.email !== user.email));
    setNewJobCollaboratorsListId((prevList) => [...prevList, user.id]);
  };

  function formatStatus(status) {
    return status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const generatedColors = Array.from({ length: stageList?.length }, () =>
      getRandomColor()
    );
    setColors(generatedColors);
  }, [stageList?.length]);

  const handleCreateStage = async (stageName) => {
    const newStage = {
      name: stageName,
    };
    setStageList((prevList) => [...prevList, newStage]);
    setAddStageBox(false);
    setAddStageTitle("");

    const response = await createTaskStage(newStage);

    if (response?.res?.message) {
      console.log(`${response.res.message}`);
    } else {
      toast.error(`${response?.error?.message || "Error occurred"}`);
    }
  };

  const handleCreateCustomTask = () => {
    setFirstClick(false);
    setIsPopupOpen(false);
    setInputPlaceholder("Write Task Name...");
    // Reset input and related states
    setTitle("");
    setStage(null);
    setTatskStatus("not-started");

    // Wait for state update, then focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      } else {
        console.log("inputRef is null"); // Debugging
      }
    }, 50);
  };

  const handleOptionClick = (option) => {
    setTitle(option.title);
    setStage({ id: option.id, title: option.stageTitle });
    setTatskStatus(option.status);
    setIsPopupOpen(false);
    setFirstClick(true)
  };

  const handleInputClick = () => {
    setIsPopupOpen(true);
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
      <div className="loaderDiv2 mobile">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div
              className="container newJob-pop-container pop-container"
              ref={popUpRef}
            >
              <div className="popup-content" ref={scrollRef}>
                <div className="popup-section-left">
                  <div className="topFlexDiv">
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleDelete}
                    >
                      <div className="deletBg">
                        <DeleteIcon />
                      </div>
                      <div className="delete-item">Delete Task</div>
                    </div>
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleModalClose}
                    >
                      <div className="searchUserImg">
                        <OpenCloseIcon />
                      </div>
                      <div className="delete-item">Collapse</div>
                    </div>
                  </div>
                  <div className="innerScroll">
                    <input
                      type="text"
                      className="jobTitle"
                      name="title"
                      value={title}
                      onChange={(e) => {
                        if (!firstClick) {
                          setTitle(e.target.value);
                        } else {
                          e.preventDefault();
                        }
                      }}
                      onClick={handleInputClick}
                      placeholder={inputPlaceholder ?? "Select Task"}
                      ref={inputRef}
                    />
                    {isPopupOpen && (
                      <div
                        style={{
                          position: "absolute",
                          padding: "20px",
                          border: "1px solid #353535",
                          borderRadius: "8px",
                          backgroundColor: "#252525",
                          width: "fit-content",
                          zIndex: "99",
                        }}
                        className="main-Stage-Div"
                        ref={popupRef}
                      >
                        <div
                          className="stages"
                          style={{
                            maxWidth: "600px",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        >
                          {AllStages.map((task, index) => (
                            <div
                              key={index}
                              onClick={() => handleOptionClick(task)}
                              style={{
                                padding: "5px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              className="all-stage"
                            >
                              <div className={`title ${task.stageTitle}`}>
                                {task.title}
                              </div>
                              <div
                                className={`stage-title stage_${task.stageTitle}`}
                              >
                                {task.stageTitle}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="custom-task"
                          onClick={() => {
                            handleCreateCustomTask();
                          }}
                        >
                          <div className="add-btn" style={{ minWidth: "40px" }}>
                            <AddIcon />
                          </div>{" "}
                          Create Custom Task
                        </div>
                      </div>
                    )}
                    <div className="discriptionBox">
                      <h3>Description</h3>
                      <textarea
                        type="text"
                        name="description"
                        rows={2}
                        value={description}
                        onChange={handleOnChange}
                        placeholder="Add Description Here..."
                      />
                    </div>

                    <div className="discriptionBox">
                      <h3>Days Left</h3>
                      {dueDate ? (
                        (() => {
                          // Normalize both dates to midnight
                          const dueDateObj = new Date(dueDate);
                          const now = new Date();

                          // Set both dates to midnight
                          dueDateObj.setHours(0, 0, 0, 0);
                          now.setHours(0, 0, 0, 0);

                          const daysLeft = Math.floor(
                            (dueDateObj - now) / (1000 * 60 * 60 * 24)
                          );

                          return daysLeft > 0 ? (
                            `${daysLeft} days`
                          ) : (
                            <span style={{ color: "#616161" }}>No Data</span>
                          );
                        })()
                      ) : (
                        <span style={{ color: "#616161" }}>No Data</span>
                      )}
                    </div>

                    <div className="discriptionBox">
                      <div className="editBox">
                        <div className="editBoxContent">
                          <h3>Job No.</h3>
                          <p className="textClass disabled">
                            <button className="taskJobBtn">{jobNum}</button>
                          </p>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Collaborators</h3>
                          <div className="textClass disabled collaboratorsBox justify-content-start position-relative">
                            <div
                              className=" d-flex align-items-center justify-content-center"
                              onClick={() => setCollaboratorsBox(true)}
                              style={{ cursor: "pointer" }}
                            >
                              {newJobCollaboratorsList.length > 0 && (
                                <>
                                  {newJobCollaboratorsList
                                    .slice(0, 3)
                                    .map((user, index) => {
                                      const initials = user.name
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

                                  {newJobCollaboratorsList.length > 3 && (
                                    <div
                                      className={`collaboratorsBoxUser`}
                                      style={{
                                        minWidth: "40px",
                                        zIndex: "4",
                                      }}
                                    >
                                      +{newJobCollaboratorsList.length - 3}
                                    </div>
                                  )}
                                </>
                              )}
                              {newJobCollaboratorsList.length === 0 && (
                                <div
                                  className="collaboratorsBoxUser disabled m-0"
                                  style={{
                                    minWidth: "40px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add Collaborators
                                </div>
                              )}
                            </div>
                            {collaboratorsBox && (
                              <div
                                className={`newJobItemDropBox`}
                                style={{   right: "10px",
                                  minWidth: "415px",
                                  maxWidth: "max-content",
                                  left:0,
                                  top: 'calc(100% + 11px)' }}
                                ref={newCollaboratorBoxRef}
                              >
                                {newJobCollaboratorsList.length > 0 && (
                                  <div className="addedCollabs">
                                    {newJobCollaboratorsList.map(
                                      (user, index) => {
                                        const initials = user.name
                                          .split(" ")
                                          .map((part) =>
                                            part.charAt(0).toUpperCase()
                                          )
                                          .join("");

                                        return (
                                          <div
                                            className="selectCollaboratorsBox"
                                            key={index}
                                            onClick={() =>
                                              handleRemoveCollaborator(user)
                                            }
                                          >
                                            <div
                                              className={`collaboratorsBoxUser`}
                                              style={{
                                                minWidth: "40px",
                                              }}
                                            >
                                              {initials}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                                {usersList
                                  ? usersList.map((user, index) => {
                                      const initials = user.name
                                        .split(" ")
                                        .map((part) =>
                                          part.charAt(0).toUpperCase()
                                        )
                                        .join("");

                                      return (
                                        <div
                                          className="selectCollaboratorsBox"
                                          key={index}
                                          onClick={() =>
                                            handleSelectCollaborator(user)
                                          }
                                        >
                                          <div
                                            className={`collaboratorsBoxUser`}
                                            style={{
                                              minWidth: "40px",
                                            }}
                                          >
                                            {initials}
                                          </div>
                                          <div className="userName">
                                            {user.name}
                                          </div>
                                          <div className="userMail">
                                            {user.email}
                                          </div>
                                        </div>
                                      );
                                    })
                                  : "No users found"}
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Status</h3>
                          <div className="position-relative">
                            <button
                              className={`statusBox ${taskStatus}`}
                              onClick={() => setStatusBox(true)}
                            >
                              {formatStatus(taskStatus)}
                            </button>
                            {statusBox && (
                              <div
                                className={`newJobItemDropBox`}
                                ref={statusBoxRef}
                              >
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("not-started");
                                  }}
                                >
                                  <div className={`statusBox not-started`}>
                                    Not Started
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("completed");
                                  }}
                                >
                                  <div className="statusBox completed">
                                    Completed
                                  </div>
                                </div>

                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("in-progress");
                                  }}
                                >
                                  <div className="statusBox in-progress">
                                    In Progress
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("on-hold");
                                  }}
                                >
                                  <div className="statusBox on-hold">
                                    On Hold
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("pending");
                                  }}
                                >
                                  <div className="statusBox pending">
                                    Pending
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner position-relative">
                          </div> */}
                          <h3>Due Date</h3>
                          <div
                            className={`textClass pointer ${
                              !dueDate && "disabled"
                            }`}
                            onClick={() => setDueDateCalender(true)}
                          >
                            {dueDate
                              ? moment(dueDate, "YYYY-MM-DD").format(
                                  "DD/MM/YYYY"
                                )
                              : "Select Date"}
                            {dueDateCalender && (
                              <div
                                className="datePickerDiv"
                                ref={datePickerRef}
                              >
                                <Calendar
                                  date={dueDate}
                                  onChange={handleDueDateChange}
                                  value={new Date(dueDate)}
                                  calendarType="ISO 8601"
                                  rangeColors={["#E2E31F"]}
                                  minDate={new Date()}
                                  maxDate={
                                    new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() +
                                          MAX_CALENDAR_YEAR
                                      )
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Stage</h3>
                          <div className="position-relative">
                            <button
                              className={`statusBox stageBox position-relative ${
                                stage ? stage : "disabled"
                              } stage_${stage?.title}`}
                              
                              onClick={() => setStageBox(true)}
                            >
                              {stage ? stage.title : "Select Stage"}
                            </button>
                           
                            {stageBox && (
                              <div
                                className={`newJobItemDropBox stageBox`}
                                ref={stageBoxRef}
                              >
                                <div className="stageListBox">
                                  {stageList.map((stage, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          setStageBox(false);
                                          setStage(stage);
                                          setActiveStageColor(colors[index]);
                                        }}
                                      >
                                        <div
                                          className={`statusBox position-relative ${
                                            stage ? `stage_${stage?.title}` : ""
                                          }`}
                                        >
                                          {stage.title}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* {!addStageBox ? (
                                  <div className="editBoxIcon pt-4">
                                    <div
                                      className="delete-box justify-content-start"
                                      style={{ cursor: "pointer", zIndex: 2 }}
                                      onClick={() => setAddStageBox(true)}
                                    >
                                      <div
                                        className="deletBg d-flex align-items-center justify-content-center"
                                        style={{
                                          padding: "6px",
                                          width: "36px",
                                          height: "36px",
                                        }}
                                      >
                                        <AddIcon />
                                      </div>
                                      <div className="delete-item">
                                        Create New Stage
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="AddStageBox">
                                    <input
                                      type="text"
                                      className="AddStageInput"
                                      name="title"
                                      value={addStageTitle}
                                      onChange={(e) => {
                                        setAddStageTitle(e.target.value);
                                      }}
                                      placeholder="Write New Stage Name Here..."
                                    />
                                    <div className="editBoxIcon">
                                      <div
                                        className="delete-box justify-content-start"
                                        style={{ cursor: "pointer", zIndex: 2 }}
                                        onClick={() =>
                                          handleCreateStage(addStageTitle)
                                        }
                                      >
                                        <div
                                          className="deletBg d-flex align-items-center justify-content-center"
                                          style={{
                                            padding: "6px",
                                            width: "36px",
                                            height: "36px",
                                          }}
                                        >
                                          <TickIcon />
                                        </div>
                                        <div className="delete-item">
                                          Confirm New Stage
                                        </div>
                                      </div>
                                    </div>
                                    <div className="editBoxIcon">
                                      <div
                                        className="delete-box justify-content-start"
                                        style={{ cursor: "pointer", zIndex: 2 }}
                                        onClick={() => {
                                          setAddStageBox(false);
                                          setAddStageTitle("");
                                        }}
                                      >
                                        <div
                                          className="cancelBg d-flex align-items-center justify-content-center"
                                          style={{
                                            padding: "6px",
                                            width: "36px",
                                            height: "36px",
                                          }}
                                        >
                                          <CrossIcon />
                                        </div>
                                        <div className="cancelBg-item">
                                          Cancel
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )} */}
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner position-relative">
                          </div> */}
                        </div>
                        <div className="editBoxIcon pe-4">
                          <div
                            className="delete-box"
                            style={{ cursor: "pointer", zIndex: 2 }}
                          >
                            <div className="deletBg" style={{ padding: "6px" }}>
                              <EditIcon />
                            </div>
                            <div className="delete-item">Edit</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <AddNewJobChatAndAttachment
                      JobId={jobNum}
                      usersList={usersList}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const UpdateTaskModal = ({
  returnToJob,
  task,
  handleClose,
  handleDelete,
  reloadTabs,
  onUpdateTask,
  scrollRef,
  usersList: suggestedUser,
}) => {
  const [loader, setLoader] = useState(false);
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [dueDate, setDueDate] = useState(task?.due_date || null);
  const [stage, setStage] = useState(task?.stage || null);
  const [stageBox, setStageBox] = useState(false);
  const [stageList, setStageList] = useState([]);
  const [dueDateCalender, setDueDateCalender] = useState(false);
  const [collaboratorsBox, setCollaboratorsBox] = useState(false);
  const [addStageBox, setAddStageBox] = useState(false);
  const [statusBox, setStatusBox] = useState(false);
  const [taskStatus, setTatskStatus] = useState(task?.status || "");
  const [newJobCollaboratorsList, setNewJobCollaboratorsList] = useState(
    task?.users || []
  );
  const [newJobCollaboratorsListId, setNewJobCollaboratorsListId] = useState(
    []
  );
  const [addStageTitle, setAddStageTitle] = useState("");

  const [colors, setColors] = useState([]);
  const [activeStageColor, setActiveStageColor] = useState("");
  const [usersList, setUsersList] = useState([]);
  const popUpRef = useRef(null);
  const datePickerRef = useRef(null);
  const newCollaboratorBoxRef = useRef(null);
  const statusBoxRef = useRef(null);
  const stageBoxRef = useRef(null);
  const [firstClick, setFirstClick] = useState(true);
  const inputRef = useRef(null);
  const popupRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState("Select Task");
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

  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (task?.users) {
      setNewJobCollaboratorsListId(task?.users.map((user) => user.id));
    }
  }, [task]);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        let response = await getTaskStages(authToken);
        if (response.res) {
          setStageList(response.res);
          console.log("setStage :", task?.stage_id);

          // setStage(response.res.filter((stage) => stage.id === task?.stage_id))
          console.log("stages", response.res);
        } else {
          console.error("Failed to fetch Users:", response.error);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchUsers();
    fetchStages();
  }, [task]);

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [scrollRef]);

  useEffect(() => {
    setDescription(task?.description);
  }, [task, reloadTabs]);

  const handleOnChange = (e) => {
    setDescription(e.target.value);
  };

  const handleModalClose = async () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const day = String(new Date().getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    const updatedTask = {
      title: title ? title : task.title,
      due_date: dueDate ? dueDate : formattedDueDate,
      status: taskStatus,
      assignee_ids: newJobCollaboratorsListId,
      stage_id: stage?.id,
      description: description,
    };
    if (
      title !== task.title ||
      dueDate !== task.due_date ||
      taskStatus !== task.status ||
      newJobCollaboratorsListId !== task.assignee_ids ||
      stage?.id !== task.stage_id ||
      description !== task.description
    ) {
      onUpdateTask({ updatedTask }, task.id, newJobCollaboratorsList, stage);
    } else {
      handleClose();
    }
  };

  const handleDueDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setDueDate(formattedDueDate);
    setDueDateCalender(false);
  };

  useEffect(() => {
    const handleClickOutside = async (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setDueDateCalender(false);
      }
      if (
        newCollaboratorBoxRef.current &&
        !newCollaboratorBoxRef.current.contains(event.target)
      ) {
        setCollaboratorsBox(false);
      }
      if (
        statusBoxRef.current &&
        !statusBoxRef.current.contains(event.target)
      ) {
        setStatusBox(false);
      }
      if (stageBoxRef.current && !stageBoxRef.current.contains(event.target)) {
        setStageBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRemoveCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) =>
      prevList.filter((u) => u.email !== user.email)
    );
    setUsersList((prevList) => [...prevList, user]);

    setNewJobCollaboratorsListId((prevList) =>
      prevList.filter((u) => u.id !== user.id)
    );
  };

  const handleSelectCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) => [...prevList, user]);
    setUsersList((prevList) => prevList.filter((u) => u.email !== user.email));
    setNewJobCollaboratorsListId((prevList) => [...prevList, user.id]);
  };

  function formatStatus(status) {
    return status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const generatedColors = Array.from({ length: stageList?.length }, () =>
      getRandomColor()
    );
    setColors(generatedColors);
  }, [stageList?.length]);

  const handleCreateStage = async (stageName) => {
    const newStage = {
      name: stageName,
    };
    setStageList((prevList) => [...prevList, newStage]);
    setAddStageBox(false);
    setAddStageTitle("");

    const response = await createTaskStage(newStage);

    if (response?.res?.message) {
      console.log(`${response.res.message}`);
    } else {
      toast.error(`${response?.error?.message || "Error occurred"}`);
    }
  };

  // Handle option selection
  const handleOptionClick = (option) => {
    setTitle(option.title);
    setStage({ id: option.id, title: option.stageTitle });
    setTatskStatus(option.status);
    setIsPopupOpen(false);
    setFirstClick(true)
  };

  const handleCreateCustomTask = () => {
    setFirstClick(false);
    setIsPopupOpen(false);
    setInputPlaceholder("Write Task Name...");
    // Reset input and related states
    setTitle("");
    setStage(null);
    setTatskStatus("not-started");

    // Wait for state update, then focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      } else {
        console.log("inputRef is null"); // Debugging
      }
    }, 50);
  };

  const handleInputClick = () => {
    setIsPopupOpen(true);
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
     
      <div className="loaderDiv2 mobile" style={{ zIndex: "1001" }}>
        <div className="pop-wrapper">
          <div className="wrapper">
            <div
              className="container newJob-pop-container pop-container"
              ref={popUpRef}
            >
              <div className="popup-content" ref={scrollRef}>
                <div className="popup-section-left">
                  <div className="topFlexDiv">
                   
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleDelete}
                    >
                      <div className="deletBg">
                        <DeleteIcon />
                      </div>
                      <div className="delete-item">Delete Task</div>
                    </div>
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleModalClose}
                    >
                      <div className="searchUserImg">
                        <OpenCloseIcon />
                      </div>
                      <div className="delete-item">
                        {returnToJob ? "Return To Job" : "Collapse"}
                      </div>
                    </div>
                  </div>
                  <div className="innerScroll">
                    <input
                      type="text"
                      className="jobTitle"
                      name="title"
                      value={title}
                      onChange={(e) => {
                        if (!firstClick) {
                          setTitle(e.target.value);
                        } else {
                          e.preventDefault();
                        }
                      }}
                      onClick={handleInputClick}
                      placeholder={inputPlaceholder ?? "Select Task"}
                      ref={inputRef}
                    />
                    {isPopupOpen && (
                      <div
                        style={{
                          position: "absolute",
                          padding: "20px",
                          border: "1px solid #353535",
                          borderRadius: "8px",
                          backgroundColor: "#252525",
                          width: "fit-content",
                          zIndex: "99",
                        }}
                        className="main-Stage-Div"
                        ref={popupRef}
                      >
                        <div
                          className="stages"
                          style={{
                            maxWidth: "600px",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        >
                          {AllStages.map((task, index) => (
                            <div
                              key={index}
                              onClick={() => handleOptionClick(task)}
                              style={{
                                padding: "5px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              className="all-stage"
                            >
                              <div className={`title ${task.stageTitle}`}>
                                {task.title}
                              </div>
                              <div
                                className={`stage-title stage_${task.stageTitle}`}
                              >
                                {task.stageTitle}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="custom-task"
                          onClick={() => {
                            handleCreateCustomTask();
                          }}
                        >
                          <div className="add-btn" style={{ minWidth: "40px" }}>
                            <AddIcon />
                          </div>{" "}
                          Create Custom Task
                        </div>
                      </div>
                    )}
                    <div className="discriptionBox">
                      <h3>Description</h3>
                      <textarea
                        type="text"
                        name="description"
                        rows={2}
                        value={description}
                        onChange={handleOnChange}
                        placeholder="Add Description Here..."
                      />
                    </div>

                    <div className="discriptionBox">
                      <h3>Days Left</h3>
                      {dueDate ? (
                        (() => {
                          // Normalize both dates to midnight
                          const dueDateObj = new Date(dueDate);
                          const now = new Date();

                          // Set both dates to midnight
                          dueDateObj.setHours(0, 0, 0, 0);
                          now.setHours(0, 0, 0, 0);

                          const daysLeft = Math.floor(
                            (dueDateObj - now) / (1000 * 60 * 60 * 24)
                          );

                          return daysLeft > 0 ? (
                            `${daysLeft} days`
                          ) : (
                            <span style={{ color: "#616161" }}>No Data</span>
                          );
                        })()
                      ) : (
                        <span style={{ color: "#616161" }}>No Data</span>
                      )}
                    </div>

                    <div className="discriptionBox">
                      <div className="editBox">
                        <div className="editBoxContent">
                          <h3>Job No.</h3>
                          <p className="textClass disabled">
                            <button className="taskJobBtn">
                              {task?.job_num}
                            </button>
                          </p>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Collaborators</h3>
                          <div className="textClass disabled collaboratorsBox justify-content-start position-relative">
                            <div
                              className=" d-flex align-items-center justify-content-center"
                              onClick={() => setCollaboratorsBox(true)}
                              style={{ cursor: "pointer" }}
                            >
                              {newJobCollaboratorsList.length > 0 && (
                                <>
                                  {newJobCollaboratorsList
                                    .slice(0, 3)
                                    .map((user, index) => {
                                      const initials = user.name
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

                                  {newJobCollaboratorsList.length > 3 && (
                                    <div
                                      className={`collaboratorsBoxUser`}
                                      style={{
                                        minWidth: "40px",
                                        zIndex: "4",
                                      }}
                                    >
                                      +{newJobCollaboratorsList.length - 3}
                                    </div>
                                  )}
                                </>
                              )}
                              {newJobCollaboratorsList.length === 0 && (
                                <div
                                  className="collaboratorsBoxUser disabled m-0"
                                  style={{
                                    minWidth: "40px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add Collaborators
                                </div>
                              )}
                            </div>
                            {collaboratorsBox && (
                              <div
                                className={`newJobItemDropBox`}
                                style={{
                                  right: "10px",
                                  minWidth: "415px",
                                  maxWidth: "max-content",
                                  top: 'calc(100% + 11px)',
                                  left: 0
                                }}
                                ref={newCollaboratorBoxRef}
                              >
                                {newJobCollaboratorsList.length > 0 && (
                                  <div className="addedCollabs">
                                    {newJobCollaboratorsList.map(
                                      (user, index) => {
                                        const initials = user.name
                                          .split(" ")
                                          .map((part) =>
                                            part.charAt(0).toUpperCase()
                                          )
                                          .join("");

                                        return (
                                          <div
                                            className="selectCollaboratorsBox"
                                            key={index}
                                            onClick={() =>
                                              handleRemoveCollaborator(user)
                                            }
                                          >
                                            <div
                                              className={`collaboratorsBoxUser`}
                                              style={{
                                                minWidth: "40px",
                                              }}
                                            >
                                              {initials}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                                {usersList
                                  ? usersList.map((user, index) => {
                                      const initials = user.name
                                        .split(" ")
                                        .map((part) =>
                                          part.charAt(0).toUpperCase()
                                        )
                                        .join("");

                                      return (
                                        <div
                                          className="selectCollaboratorsBox"
                                          key={index}
                                          onClick={() =>
                                            handleSelectCollaborator(user)
                                          }
                                        >
                                          <div
                                            className={`collaboratorsBoxUser`}
                                            style={{
                                              minWidth: "40px",
                                            }}
                                          >
                                            {initials}
                                          </div>
                                          <div className="userName">
                                            {user.name}
                                          </div>
                                          <div className="userMail">
                                            {user.email}
                                          </div>
                                        </div>
                                      );
                                    })
                                  : "No users found"}
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Status</h3>
                          <div className="position-relative">
                            <button
                              className={`statusBox ${taskStatus}`}
                              onClick={() => setStatusBox(true)}
                            >
                              {formatStatus(taskStatus)}
                            </button>
                            {statusBox && (
                              <div
                                className={`newJobItemDropBox`}
                                ref={statusBoxRef}
                              >
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("not-started");
                                  }}
                                >
                                  <div className={`statusBox not-started`}>
                                    Not Started
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("completed");
                                  }}
                                >
                                  <div className="statusBox completed">
                                    Completed
                                  </div>
                                </div>

                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("in-progress");
                                  }}
                                >
                                  <div className="statusBox in-progress">
                                    In Progress
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("on-hold");
                                  }}
                                >
                                  <div className="statusBox on-hold">
                                    On Hold
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("pending");
                                  }}
                                >
                                  <div className="statusBox pending">
                                    Pending
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner position-relative">
                          </div> */}
                          <h3>Due Date</h3>
                          <div
                            className={`textClass pointer ${
                              !dueDate && "disabled"
                            }`}
                            onClick={() => setDueDateCalender(true)}
                          >
                            {dueDate
                              ? moment(dueDate, "YYYY-MM-DD").format(
                                  "DD/MM/YYYY"
                                )
                              : "Select Date"}
                            {dueDateCalender && (
                              <div
                                className="datePickerDiv"
                                ref={datePickerRef}
                              >
                                <Calendar
                                  date={dueDate}
                                  onChange={handleDueDateChange}
                                  value={new Date(dueDate)}
                                  calendarType="ISO 8601"
                                  rangeColors={["#E2E31F"]}
                                  minDate={new Date()}
                                  maxDate={
                                    new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() +
                                          MAX_CALENDAR_YEAR
                                      )
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Stage</h3>
                          <div className="position-relative">
                            <button
                              className={`statusBox stageBox position-relative ${
                                stage ? stage : "disabled"
                              } stage_${stage?.title}`}
                              onClick={() => setStageBox(true)}
                            >
                              {stage ? stage.title : "Select Stage"}
                            </button>
                            {stageBox && (
                              <div
                                className={`newJobItemDropBox stageBox`}
                                ref={stageBoxRef}
                              >
                                <div className="stageListBox">
                                  {stageList.map((stage, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          setStageBox(false);
                                          setStage(stage);
                                          setActiveStageColor(colors[index]);
                                        }}
                                      >
                                        <div
                                          className={`statusBox position-relative ${
                                            stage ? `stage_${stage?.title}` : ""
                                          }`}
                                        >
                                          {stage.title}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {!addStageBox ? (
                                  <div className="editBoxIcon pt-4">
                                    <div
                                      className="delete-box justify-content-start"
                                      style={{ cursor: "pointer", zIndex: 2 }}
                                      onClick={() => setAddStageBox(true)}
                                    >
                                      <div
                                        className="deletBg d-flex align-items-center justify-content-center"
                                        style={{
                                          padding: "6px",
                                          width: "36px",
                                          height: "36px",
                                        }}
                                      >
                                        <AddIcon />
                                      </div>
                                      <div className="delete-item">
                                        Create New Stage
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="AddStageBox">
                                    <input
                                      type="text"
                                      className="AddStageInput"
                                      name="title"
                                      value={addStageTitle}
                                      onChange={(e) => {
                                        setAddStageTitle(e.target.value);
                                      }}
                                      placeholder="Write New Stage Name Here..."
                                    />
                                    <div className="editBoxIcon">
                                      <div
                                        className="delete-box justify-content-start"
                                        style={{ cursor: "pointer", zIndex: 2 }}
                                        onClick={() =>
                                          handleCreateStage(addStageTitle)
                                        }
                                      >
                                        <div
                                          className="deletBg d-flex align-items-center justify-content-center"
                                          style={{
                                            padding: "6px",
                                            width: "36px",
                                            height: "36px",
                                          }}
                                        >
                                          <TickIcon />
                                        </div>
                                        <div className="delete-item">
                                          Confirm New Stage
                                        </div>
                                      </div>
                                    </div>
                                    <div className="editBoxIcon">
                                      <div
                                        className="delete-box justify-content-start"
                                        style={{ cursor: "pointer", zIndex: 2 }}
                                        onClick={() => {
                                          setAddStageBox(false);
                                          setAddStageTitle("");
                                        }}
                                      >
                                        <div
                                          className="cancelBg d-flex align-items-center justify-content-center"
                                          style={{
                                            padding: "6px",
                                            width: "36px",
                                            height: "36px",
                                          }}
                                        >
                                          <CrossIcon />
                                        </div>
                                        <div className="cancelBg-item">
                                          Cancel
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner position-relative">
                          </div> */}
                        </div>
                        <div className="editBoxIcon pe-4">
                          <div
                            className="delete-box"
                            style={{ cursor: "pointer", zIndex: 2 }}
                          >
                            <div className="deletBg" style={{ padding: "6px" }}>
                              <EditIcon />
                            </div>
                            <div className="delete-item">Edit</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CommentBox
                      taskId={task?.id}
                      JobId={task?.job_id}
                      usersList={suggestedUser}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const CreateTaskModal = ({
  task: propTask,
  handleClose,
  handleDelete,
  onCreateTask,
  reloadTabs,
  scrollRef,
  newTask,
  usersList: suggestedUser,
}) => {
  const [task, setTask] = useState(propTask);
  const [loader, setLoader] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [dueDate, setDueDate] = useState(null);
  const [stage, setStage] = useState(null);
  const [stageBox, setStageBox] = useState(false);
  const [stageList, setStageList] = useState([]);
  const [dueDateCalender, setDueDateCalender] = useState(false);
  const [collaboratorsBox, setCollaboratorsBox] = useState(false);
  const [addStageBox, setAddStageBox] = useState(false);
  const [statusBox, setStatusBox] = useState(false);
  const [taskStatus, setTatskStatus] = useState("not-started");
  const [newJobCollaboratorsList, setNewJobCollaboratorsList] = useState([]);
  const [newJobCollaboratorsListId, setNewJobCollaboratorsListId] = useState(
    []
  );
  const [addStageTitle, setAddStageTitle] = useState("");
  const [colors, setColors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const popUpRef = useRef(null);
  const popupRef = useRef(null);
  const datePickerRef = useRef(null);
  const newCollaboratorBoxRef = useRef(null);
  const statusBoxRef = useRef(null);
  const stageBoxRef = useRef(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isJobPopupOpen, setIsJobPopupOpen] = useState(false);
  const inputRef = useRef(null);
  const inputJobRef = useRef(null);
  const jobSelectRef = useRef(null);
  const [firstClick, setFirstClick] = useState(true);
  const [jobNo, setJobNo] = useState(null);
  const [inputPlaceholder, setInputPlaceholder] = useState("Select Task");
  const handleInputClick = () => {
    setIsPopupOpen(true);
  };

  const handleInputJobClick = () => {
    setIsJobPopupOpen(true);
  };

  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // jobSelectRef
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        jobSelectRef.current &&
        !jobSelectRef.current.contains(event.target) &&
        inputJobRef.current &&
        !inputJobRef.current.contains(event.target)
      ) {
        setIsJobPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle option selection
  const handleOptionClick = (option) => {
    setTitle(option.title);
    setStage({ id: option.id, title: option.stageTitle });
    setTatskStatus(option.status);
    setIsPopupOpen(false);
    setFirstClick(true)
  };

  const handleJobOptionClick = (job) => {
    setTask((prevTask) => ({
      ...prevTask,
      job_num: job?.job_num, // Update the job_num field
      id: job?.id,
    }));
    setIsJobPopupOpen(false);
  };

  const fetchJonbNo = async () => {
    try {
      let response = await getJobsByUser();
      if (response.res) {
        setJobNo(response.res?.job_numbers);
      } else {
        console.error("Failed to fetch Users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
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

  const fetchStages = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      let response = await getTaskStages(authToken);
      if (response.res) {
        setStageList(response.res);
        console.log("stages", response.res);
      } else {
        console.error("Failed to fetch Users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // useEffect(() => {
  //   const year = new Date().getFullYear();
  //   const month = String(new Date().getMonth() + 1).padStart(2, "0");
  //   const day = String(new Date().getDate()).padStart(2, "0");
  //   let formattedDueDate = `${year}-${month}-${day}`;
  //   setDueDate(formattedDueDate);
  // }, []);

  useEffect(() => {
    fetchUsers();
    fetchStages();
    if (newTask) {
      fetchJonbNo();
    }
  }, []);

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [scrollRef]);

  const handleOnChange = (e) => {
    setDescription(e.target.value);
  };

  const handleModalClose = async () => {
    const newTaskData = {
      job_id: task?.id,
      title: title,
      due_date: dueDate,
      status: taskStatus,
      assignee_ids: newJobCollaboratorsListId,
      stage_id: stage?.id,
      description: description,
      job_num: task?.job_num,
    };
    if (
      (title !== "" && !newTask) ||
      (title !== "" && newTask && task && task?.job_num)
    ) {
      onCreateTask(
        { newTask: newTaskData },
        task.id,
        newJobCollaboratorsList,
        stage
      );
    } else {
      handleClose();
    }
  };

  const handleDueDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setDueDate(formattedDueDate);
    setDueDateCalender(false);
  };

  useEffect(() => {
    const handleClickOutside = async (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setDueDateCalender(false);
      }
      if (
        newCollaboratorBoxRef.current &&
        !newCollaboratorBoxRef.current.contains(event.target)
      ) {
        setCollaboratorsBox(false);
      }
      if (
        statusBoxRef.current &&
        !statusBoxRef.current.contains(event.target)
      ) {
        setStatusBox(false);
      }
      if (stageBoxRef.current && !stageBoxRef.current.contains(event.target)) {
        setStageBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRemoveCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) =>
      prevList.filter((u) => u.email !== user.email)
    );
    setUsersList((prevList) => [...prevList, user]);

    setNewJobCollaboratorsListId((prevList) =>
      prevList.filter((u) => u.id !== user.id)
    );
  };

  const handleSelectCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) => [...prevList, user]);
    setUsersList((prevList) => prevList.filter((u) => u.email !== user.email));
    setNewJobCollaboratorsListId((prevList) => [...prevList, user.id]);
  };

  function formatStatus(status) {
    return status
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const generatedColors = Array.from({ length: stageList?.length }, () =>
      getRandomColor()
    );
    setColors(generatedColors);
  }, [stageList?.length]);

  const handleCreateStage = async (stageName) => {
    const newStage = {
      name: stageName,
    };
    setStageList((prevList) => [...prevList, newStage]);
    setAddStageBox(false);
    setAddStageTitle("");

    const response = await createTaskStage(newStage);

    if (response?.res?.message) {
      console.log(`${response.res.message}`);
    } else {
      toast.error(`${response?.error?.message || "Error occurred"}`);
    }
  };

  const handleCreateCustomTask = () => {
    setFirstClick(false);
    setIsPopupOpen(false);
    setInputPlaceholder("Write Task Name...");
    // Reset input and related states
    setTitle("");
    setStage(null);
    setTatskStatus("not-started");

    // Wait for state update, then focus
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      } else {
        console.log("inputRef is null"); // Debugging
      }
    }, 50);
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
      <div className="loaderDiv2 mobile" style={{ zIndex: "1001" }}>
        <div className="pop-wrapper position-relative">
          <div className="wrapper">
            <div
              className="container newJob-pop-container pop-container "
              ref={popUpRef}
            >
              <div className="popup-content " ref={scrollRef}>
                <div className="popup-section-left">
                  <div className="topFlexDiv">
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleDelete}
                    >
                      <div className="deletBg">
                        <DeleteIcon />
                      </div>
                      <div className="delete-item">Delete Task</div>
                    </div>
                    <div
                      className="delete-box"
                      style={{ cursor: "pointer", zIndex: 2 }}
                      onClick={handleModalClose}
                    >
                      <div className="searchUserImg">
                        <OpenCloseIcon />
                      </div>
                      <div className="delete-item">Collapse</div>
                    </div>
                  </div>
                  <div className="innerScroll ">
                    {newTask && !task?.job_num && (
                      <>
                        {" "}
                        <input
                          type="text"
                          className="jobTitle position-relative"
                          name="title"
                          value={task?.job_num}
                          onChange={(e) => {
                            e.preventDefault();
                          }}
                          onClick={handleInputJobClick}
                          placeholder="Select Job No."
                          ref={inputJobRef}
                          autoFocus={true}
                        />
                        {isJobPopupOpen && (
                          <div
                            style={{
                              position: "absolute",
                              padding: "20px",
                              border: "1px solid #353535",
                              borderRadius: "8px",
                              backgroundColor: "#252525",
                              width: "max-content",
                              zIndex: "99",
                              right: "50%",
                            }}
                            className="main-Stage-Div"
                            ref={jobSelectRef}
                          >
                            <div
                              className="stages"
                              style={{
                                marginLeft: "auto",
                                minWidth: "300px",
                                maxHeight: "300px",
                                overflowY: "auto",
                              }}
                            >
                              {jobNo?.map((jobId, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleJobOptionClick(jobId)}
                                  style={{
                                    padding: "5px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  className="all-stage"
                                >
                                  <span className="job-id">
                                    {jobId.job_num}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {((newTask && task?.job_num) || !newTask) && (
                      <input
                        type="text"
                        className="jobTitle position-relative"
                        name="title"
                        value={title}
                        onChange={(e) => {
                          if (!firstClick) {
                            setTitle(e.target.value);
                          } else {
                            e.preventDefault();
                          }
                        }}
                        onClick={handleInputClick}
                        placeholder={inputPlaceholder ?? "Select Task"}
                        ref={inputRef}
                        autoFocus={!newTask && true}
                      />
                    )}
                    {isPopupOpen && (
                      <div
                        style={{
                          position: "absolute",
                          padding: "20px",
                          border: "1px solid #353535",
                          borderRadius: "8px",
                          backgroundColor: "#252525",
                          width: "fit-content",
                          zIndex: "99",
                        }}
                        className="main-Stage-Div"
                        ref={popupRef}
                      >
                        <div
                          className="stages"
                          style={{
                            maxWidth: "600px",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        >
                          {AllStages.map((task, index) => (
                            <div
                              key={index}
                              onClick={() => handleOptionClick(task)}
                              style={{
                                padding: "5px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              className="all-stage"
                            >
                              <div className={`title ${task.stageTitle}`}>
                                {task.title}
                              </div>
                              <div
                                className={`stage-title stage_${task.stageTitle}`}
                              >
                                {task.stageTitle}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="custom-task"
                          onClick={() => {
                            handleCreateCustomTask();
                          }}
                        >
                          <div className="add-btn" style={{ minWidth: "40px" }}>
                            <AddIcon />
                          </div>{" "}
                          Create Custom Task
                        </div>
                      </div>
                    )}
                    <div className="discriptionBox">
                      <h3>Description</h3>
                      <textarea
                        type="text"
                        name="description"
                        rows={2}
                        value={description}
                        onChange={handleOnChange}
                        placeholder="Add Description Here..."
                      />
                    </div>

                    {newTask ? (
                      <div className="discriptionBox">
                        <div className="d-flex align-items-center justify-content-start gap-1 mw-100">
                          {newTask && task?.job_num && (
                            <div style={{ flex: "0.5" }}>
                              <h3>Job No.</h3>
                              <p className="textClass disabled">
                                <button className="taskJobBtn">
                                  {formatJobNumber(task?.job_num)}
                                </button>
                              </p>
                            </div>
                          )}
                          <div style={{ flex: "1" }}>
                            <h3>Days Left</h3>
                            {dueDate ? (
                              (() => {
                                // Normalize both dates to midnight
                                const dueDateObj = new Date(dueDate);
                                const now = new Date();

                                // Set both dates to midnight
                                dueDateObj.setHours(0, 0, 0, 0);
                                now.setHours(0, 0, 0, 0);

                                const daysLeft = Math.floor(
                                  (dueDateObj - now) / (1000 * 60 * 60 * 24)
                                );

                                return daysLeft > 0 ? (
                                  `${daysLeft} days`
                                ) : (
                                  <span style={{ color: "#616161" }}>
                                    No Data
                                  </span>
                                );
                              })()
                            ) : (
                              <span style={{ color: "#616161" }}>No Data</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="discriptionBox">
                        <h3>Days Left</h3>
                        {dueDate ? (
                          (() => {
                            // Normalize both dates to midnight
                            const dueDateObj = new Date(dueDate);
                            const now = new Date();

                            // Set both dates to midnight
                            dueDateObj.setHours(0, 0, 0, 0);
                            now.setHours(0, 0, 0, 0);

                            const daysLeft = Math.floor(
                              (dueDateObj - now) / (1000 * 60 * 60 * 24)
                            );

                            return daysLeft > 0 ? (
                              `${daysLeft} days`
                            ) : (
                              <span style={{ color: "#616161" }}>No Data</span>
                            );
                          })()
                        ) : (
                          <span style={{ color: "#616161" }}>No Data</span>
                        )}
                      </div>
                    )}

                    <div className="discriptionBox">
                      <div className="editBox">
                        <div className="editBoxContent">
                          {!newTask && (
                            <>
                              <h3>Job No.</h3>
                              <p className="textClass disabled">
                                <button className="taskJobBtn">
                                  {formatJobNumber(task?.job_num)}
                                </button>
                              </p>
                            </>
                          )}
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Collaborators</h3>
                          <div className="textClass disabled collaboratorsBox justify-content-start position-relative">
                            <div
                              className=" d-flex align-items-center justify-content-center"
                              onClick={() => setCollaboratorsBox(true)}
                              style={{ cursor: "pointer" }}
                            >
                              {newJobCollaboratorsList.length > 0 && (
                                <>
                                  {newJobCollaboratorsList
                                    .slice(0, 3)
                                    .map((user, index) => {
                                      const initials = user.name
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

                                  {newJobCollaboratorsList.length > 3 && (
                                    <div
                                      className={`collaboratorsBoxUser`}
                                      style={{
                                        minWidth: "40px",
                                        zIndex: "4",
                                      }}
                                    >
                                      +{newJobCollaboratorsList.length - 3}
                                    </div>
                                  )}
                                </>
                              )}
                              {newJobCollaboratorsList.length === 0 && (
                                <div
                                  className="collaboratorsBoxUser disabled m-0"
                                  style={{
                                    minWidth: "40px",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add Collaborators
                                </div>
                              )}
                            </div>
                            {collaboratorsBox && (
                              <div
                                className={`newJobItemDropBox`}
                                style={{
                                  right: "10px",
                                  minWidth: "415px",
                                  maxWidth: "max-content",
                                  top: 'calc(100% + 11px)',
                                  left:0
                                }}
                                ref={newCollaboratorBoxRef}
                              >
                                {newJobCollaboratorsList.length > 0 && (
                                  <div className="addedCollabs">
                                    {newJobCollaboratorsList.map(
                                      (user, index) => {
                                        const initials = user.name
                                          .split(" ")
                                          .map((part) =>
                                            part.charAt(0).toUpperCase()
                                          )
                                          .join("");

                                        return (
                                          <div
                                            className="selectCollaboratorsBox"
                                            key={index}
                                            onClick={() =>
                                              handleRemoveCollaborator(user)
                                            }
                                          >
                                            <div
                                              className={`collaboratorsBoxUser`}
                                              style={{
                                                minWidth: "40px",
                                              }}
                                            >
                                              {initials}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                                {usersList
                                  ? usersList.map((user, index) => {
                                      const initials = user.name
                                        .split(" ")
                                        .map((part) =>
                                          part.charAt(0).toUpperCase()
                                        )
                                        .join("");

                                      return (
                                        <div
                                          className="selectCollaboratorsBox"
                                          key={index}
                                          onClick={() =>
                                            handleSelectCollaborator(user)
                                          }
                                        >
                                          <div
                                            className={`collaboratorsBoxUser`}
                                            style={{
                                              minWidth: "40px",
                                            }}
                                          >
                                            {initials}
                                          </div>
                                          <div className="userName">
                                            {user.name}
                                          </div>
                                          <div className="userMail">
                                            {user.email}
                                          </div>
                                        </div>
                                      );
                                    })
                                  : "No users found"}
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Status</h3>
                          <div className="position-relative">
                            <button
                              className={`statusBox ${taskStatus}`}
                              onClick={() => setStatusBox(true)}
                            >
                              {formatStatus(taskStatus)}
                            </button>
                            {statusBox && (
                              <div
                                className={`newJobItemDropBox`}
                                ref={statusBoxRef}
                              >
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("not-started");
                                  }}
                                >
                                  <div className={`statusBox not-started`}>
                                    Not Started
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("completed");
                                  }}
                                >
                                  <div className="statusBox completed">
                                    Completed
                                  </div>
                                </div>

                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("in-progress");
                                  }}
                                >
                                  <div className="statusBox in-progress">
                                    In Progress
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("on-hold");
                                  }}
                                >
                                  <div className="statusBox on-hold">
                                    On Hold
                                  </div>
                                </div>
                                <div
                                  className="selectCollaboratorsBox"
                                  onClick={() => {
                                    setStatusBox(false);
                                    setTatskStatus("pending");
                                  }}
                                >
                                  <div className="statusBox pending">
                                    Pending
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* <div className="editBoxInner position-relative">
                            </div> */}
                          </div>
                          <h3>Due Date</h3>
                          <div
                            className={`textClass pointer ${
                              !dueDate && "disabled"
                            }`}
                            onClick={() => setDueDateCalender(true)}
                          >
                            {dueDate
                              ? moment(dueDate, "YYYY-MM-DD").format(
                                  "DD/MM/YYYY"
                                )
                              : "Select Date"}
                            {dueDateCalender && (
                              <div
                                className="datePickerDiv"
                                ref={datePickerRef}
                              >
                                <Calendar
                                  date={dueDate}
                                  onChange={handleDueDateChange}
                                  value={new Date(dueDate)}
                                  calendarType="ISO 8601"
                                  rangeColors={["#E2E31F"]}
                                  minDate={new Date()}
                                  maxDate={
                                    new Date(
                                      new Date().setFullYear(
                                        new Date().getFullYear() +
                                          MAX_CALENDAR_YEAR
                                      )
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner">
                          </div> */}
                          <h3>Stage</h3>
                          <div className="position-relative">
                            <button
                              className={`statusBox stageBox  position-relative ${
                                !stage && "disabled"
                              } stage_${stage?.title}`}
                              onClick={() => setStageBox(true)}
                            >
                              {stage ? stage.title : "Select Stage"}
                            </button>
                            {stageBox && (
                              <div
                                className={`newJobItemDropBox stageBox`}
                                ref={stageBoxRef}
                              >
                                <div className="stageListBox">
                                  {stageList.map((stage, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          setStageBox(false);
                                          setStage(stage);
                                        }}
                                      >
                                        <div
                                          className={`statusBox position-relative stage_${stage?.title}`}
                                          // style={{
                                          //   border: `1px solid ${colors[index]}`,
                                          // }}
                                        >
                                          {stage.title}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* {!addStageBox ? (
                                    <div className="editBoxIcon pt-4">
                                      <div
                                        className="delete-box justify-content-start"
                                        style={{ cursor: "pointer", zIndex: 2 }}
                                        onClick={() => setAddStageBox(true)}
                                      >
                                        <div
                                          className="deletBg d-flex align-items-center justify-content-center"
                                          style={{
                                            padding: "6px",
                                            width: "36px",
                                            height: "36px",
                                          }}
                                        >
                                          <AddIcon />
                                        </div>
                                        <div className="delete-item">
                                          Create New Stage
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="AddStageBox">
                                      <input
                                        type="text"
                                        className="AddStageInput"
                                        name="title"
                                        value={addStageTitle}
                                        onChange={(e) => {
                                          setAddStageTitle(e.target.value);
                                        }}
                                        placeholder="Write New Stage Name Here..."
                                      />
                                      <div className="editBoxIcon">
                                        <div
                                          className="delete-box justify-content-start"
                                          style={{ cursor: "pointer", zIndex: 2 }}
                                          onClick={() =>
                                            handleCreateStage(addStageTitle)
                                          }
                                        >
                                          <div
                                            className="deletBg d-flex align-items-center justify-content-center"
                                            style={{
                                              padding: "6px",
                                              width: "36px",
                                              height: "36px",
                                            }}
                                          >
                                            <TickIcon />
                                          </div>
                                          <div className="delete-item">
                                            Confirm New Stage
                                          </div>
                                        </div>
                                      </div>
                                      <div className="editBoxIcon">
                                        <div
                                          className="delete-box justify-content-start"
                                          style={{ cursor: "pointer", zIndex: 2 }}
                                          onClick={() => {
                                            setAddStageBox(false);
                                            setAddStageTitle("");
                                          }}
                                        >
                                          <div
                                            className="cancelBg d-flex align-items-center justify-content-center"
                                            style={{
                                              padding: "6px",
                                              width: "36px",
                                              height: "36px",
                                            }}
                                          >
                                            <CrossIcon />
                                          </div>
                                          <div className="cancelBg-item">
                                            Cancel
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )} */}
                              </div>
                            )}
                          </div>
                          {/* <div className="editBoxInner position-relative">
                          </div> */}
                        </div>
                        <div className="editBoxIcon pe-4">
                          <div
                            className="delete-box"
                            style={{ cursor: "pointer", zIndex: 2 }}
                          >
                            <div className="deletBg" style={{ padding: "6px" }}>
                              <EditIcon />
                            </div>
                            <div className="delete-item">Edit</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CommentBox
                      taskId={null}
                      JobId={task?.id}
                      usersList={suggestedUser}
                    />
                  </div>
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
