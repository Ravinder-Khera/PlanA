import React, { useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import {
  AddIcon,
  FilterIcon,
  NextIcon,
  PrevIcon,
  RedoIcon,
  Search,
  TaskIcon,
  User,
} from "../../assets/svg";
import {
  createTask,
  getJobIds,
  getUserByRole,
  updateTask,
} from "../../services/auth";

import { DateRangePicker, Calendar } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { toast } from "react-toastify";
import Complete from "../../Components/Popups/Complete";
import filterIcon from "../../assets/icons/filterIcon.png";
import Filter from "../../Components/Filter/Filter";
import { useNavigate } from "react-router-dom";
function TaskPage() {
  const [loading, setLoading] = useState(true);
  const [addTask, setAddTask] = useState(false);
  const [taskTab, setTaskTab] = useState("todo");
  const [addTaskJobDropdown, setAddTaskJobDropdown] = useState(false);
  const [addTaskJobDropdownMobile, setAddTaskJobDropdownMobile] = useState(false);
  const [addTaskJobStageDropdown, setAddTaskJobStageDropdown] = useState(false);
  const [addTaskJobStageDropdownMobile, setAddTaskJobStageDropdownMobile] = useState(false);
  const [addTaskJobUserDropdown, setAddTaskJobUserDropdown] = useState(false);
  const [addTaskJobUserDropdownMobile, setAddTaskJobUserDropdownMobile] = useState(false);
  const [selectDate, setSelectDate] = useState(false);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectDueDateMobile, setSelectDueDateMobile] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [tasksToDo, setTasksToDo] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchJobList, setSearchJobList] = useState("");
  const [selectedSearchJob, setSelectedSearchJob] = useState("");
  const [searchJobStages, setSearchJobStages] = useState([]);
  const [selectedSearchJobStage, setSelectedSearchJobStage] = useState("");
  const [selectedSearchJobStageId, setSelectedSearchJobStageId] = useState("");
  const [createTaskTitle, setCreateTaskTitle] = useState("");
  const [isChecked, setIsChecked] = useState({});
  const [userDropdownStates, setUserDropdownStates] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});
  const filterRef = useRef(null);
  const [filteredJobs, setFilteredJobs] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const addTaskJobDropdownRef = useRef(null);
  const addTaskJobDropdownRefMobile = useRef(null);
  const addTaskJobStageDropdownRef = useRef(null);
  const addTaskJobStageDropdownRefMobile = useRef(null);
  const selectDateRef = useRef(null);
  const selectDueDateRef = useRef(null);
  const selectDueDateRefMobile = useRef(null);
  const selectUserRef = useRef(null);
  const selectUserRefMobile = useRef(null);
  const selectAssigneeRef = useRef(null);
  const selectFilterRef = useRef(null);
  const taskMobileScrollRef = useRef(null);

  const fetchTasksToDo = async () => {
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
        `${
          process.env.REACT_APP_USER_API_CLOUD_ENDPOINT
        }/tasks/by-status-and-date?status=to-do&start_date=${selectionRange.startDate
          .toISOString()
          .slice(0, 10)}&end_date=${selectionRange.endDate
          .toISOString()
          .slice(0, 10)}&perPage=10`,
        requestOptions
      );
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson && (await response.json());
      setTasksToDo(data.data);
      if (response.status === 200) {
        setLoading(false);
        return { res: data, error: null };
      } else {
        return { res: null, error: data };
      }
    } catch (error) {
      console.error("Error fetching Tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksCompleted = async () => {
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
        `${
          process.env.REACT_APP_USER_API_CLOUD_ENDPOINT
        }/tasks/by-status-and-date?status=completed&start_date=${selectionRange.startDate
          .toISOString()
          .slice(0, 10)}&end_date=${selectionRange.endDate
          .toISOString()
          .slice(0, 10)}&perPage=10`,
        requestOptions
      );
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson && (await response.json());

      setTasksCompleted(data.data);
      if (response.status === 200) {
        setLoading(false);
        return { res: data, error: null };
      } else {
        return { res: null, error: data };
      }
    } catch (error) {
      console.error("Error fetching Tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let handler = (e) => {
      if (
        selectFilterRef.current &&
        !selectFilterRef.current.contains(e.target)
      ) {
        setShowFilter(false);
      }

      if (
        addTaskJobDropdownRef.current &&
        !addTaskJobDropdownRef.current.contains(e.target)
      ) {
        setAddTaskJobDropdown(false);
      }
      if (
        addTaskJobDropdownRefMobile.current &&
        !addTaskJobDropdownRefMobile.current.contains(e.target)
      ) {
        setAddTaskJobDropdownMobile(false);
      }
      if (
        addTaskJobStageDropdownRef.current &&
        !addTaskJobStageDropdownRef.current.contains(e.target)
      ) {
        setAddTaskJobStageDropdown(false);
      }
      if (
        addTaskJobStageDropdownRefMobile.current &&
        !addTaskJobStageDropdownRefMobile.current.contains(e.target)
      ) {
        setAddTaskJobStageDropdownMobile(false);
      }
      if (selectDateRef.current && !selectDateRef.current.contains(e.target)) {
        setSelectDate(false);
      }
      if (
        selectDueDateRef.current &&
        !selectDueDateRef.current.contains(e.target)
      ) {
        setSelectDueDate(false);
      }
      if (
        selectDueDateRefMobile.current &&
        !selectDueDateRefMobile.current.contains(e.target)
      ) {
        setSelectDueDateMobile(false);
      }
      if (selectUserRef.current && !selectUserRef.current.contains(e.target)) {
        setAddTaskJobUserDropdown(false);
      }
      if (selectUserRefMobile.current && !selectUserRefMobile.current.contains(e.target)) {
        setAddTaskJobUserDropdownMobile(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    if (showPopup && taskMobileScrollRef.current) {
      handleTScroll();
    }
  }, [showPopup]);

  const handleTScroll = () => {
    if (taskMobileScrollRef.current) {
      taskMobileScrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleTaskRedo = (task) => {
    setSelectedTask(task);
    setShowPopup(true);
  };

  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      new Date().getDate()
    ),
    endDate: new Date(),
    key: "selection",
  });

  const handleSelect = (ranges) => {
    setSelectionRange(ranges.selection);
  };

  const handleSelectDueDate = (date) => {
    setSelectDueDate(false);
    setSelectedDueDate(date);
  };

  const toggleCheckbox = async (taskId) => {
    try {
      const cleanedTaskId = taskId.replace(/^select_/, "");
      
      setIsChecked((prevState) => ({
        ...prevState,
        [taskId]: true,
      }));
      setLoading(true);
      const response = await updateTask(
        { status: "completed" },
        cleanedTaskId
      );
      console.log("update Task --", response);
      if (response.res) {
        const listItem = document.querySelector(`#stage_${cleanedTaskId}`);
        if (listItem) {
          listItem.classList.add("addCompleted");
        }
        setTimeout(() => {
          fetchTasksToDo();
          fetchTasksCompleted();
          setIsChecked((prevState) => ({
            ...prevState,
            [taskId]: false,
          }));
        }, 1000);
        toast.success("Task moved to Completed", {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        console.error("Task update failed:", response.error);

        toast.error(`${response.error.message}`, {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
      if (window.innerWidth < 992) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } 
    }
  };

  useEffect(() => {
    let handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const handleAssigneeClick = (userId) => {
    setSelectedAssignee((prevUsers) => {
      if (prevUsers.includes(userId)) {
        return prevUsers.filter((id) => id !== userId);
      } else {
        return [...prevUsers, userId];
      }
    });
  };

  const handleAddAssignee = async (taskId) => {
    try {
     
      setLoading(true);
      const response = await updateTask(
        { assignee_ids: selectedAssignee },
        taskId
      );
      console.log("update Task --", response);
      if (response.res) {
        fetchTasksToDo();
        fetchTasksCompleted();
        setSelectedAssignee([]);
        setUserDropdownStates([]);
        toast.success("Assignee added to Task", {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        console.error("Task update failed:", response.error);
        fetchTasksToDo();
        fetchTasksCompleted();
        setSelectedAssignee([]);
        setUserDropdownStates([]);
        toast.error(`${response.error.message}`, {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAddAssignee = async () => {
    setSelectedAssignee([]);
    setUserDropdownStates([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownStates.includes(true) &&
        selectAssigneeRef.current &&
        !selectAssigneeRef.current.contains(event.target)
      ) {
        const newUserDropdownStates = userDropdownStates.map(() => false);
        setUserDropdownStates(newUserDropdownStates);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownStates]);

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
      setSelectedSearchJob(job_id);
      setAddTaskJobDropdown(false);
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

  const handleCreateTask = async () => {
    if (createTaskTitle === "") {
      toast.error(`Task title can not be empty`, {
        position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (!selectedDueDate) {
      toast.error(`Select Task Due Date`, {
        position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (selectedSearchJob === "") {
      toast.error(`Select Job Id`, {
        position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (selectedSearchJobStage === "") {
      toast.error(`Select Stage `, {
        position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (selectedUsers.length <= 0) {
      toast.error(`Add Assignee to Task`, {
        position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
    try {
      setLoading(true);
      let response = await createTask(
        {
          job_id: selectedSearchJob,
          stage_id: selectedSearchJobStageId,
          title: createTaskTitle,
          due_date: formattedDueDate,
          assignee_ids: selectedUsers,
        }
      );
      console.log("create Task --", response);
      if (response.res) {
        console.log("create Task successful", response);
        toast.success("Task created successful", {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setSelectedDueDate(null);
        setJobList([]);
        setSelectedUsers([]);
        setSearchJobList("");
        setSelectedSearchJob("");
        setSearchJobStages([]);
        setSelectedSearchJobStage("");
        setSelectedSearchJobStageId("");
        setCreateTaskTitle("");
      } else {
        console.error("Task creation failed:", response.error);

        toast.error(`${Object.values(response.error.errors)[0][0]}`, {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    const isSelected = selectedUsers.includes(userId);

    if (isSelected) {
      setSelectedUsers((prevUsers) => prevUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers((prevUsers) => [...prevUsers, userId]);
    }
  };

  const toggleUserDropdown = (index) => {
    const newUserDropdownStates = [...userDropdownStates];
    newUserDropdownStates[index] = !newUserDropdownStates[index];
    const taskUsersIds = tasksToDo[index].users.map((user) => user.id);
    console.log("taskUsersIds", taskUsersIds);
    setUserDropdownStates(newUserDropdownStates);
    setSelectedAssignee(taskUsersIds);
  };

  const formattedStartDate = selectionRange.startDate.toLocaleDateString(
    "en-AU",
    { day: "numeric", month: "short", year: "numeric" }
  );
  const formattedEndDate = selectionRange.endDate.toLocaleDateString("en-Au", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let formattedDueDate = "";
  if (selectedDueDate) {
    const year = selectedDueDate.getFullYear();
    const month = String(selectedDueDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDueDate.getDate()).padStart(2, "0");
    formattedDueDate = `${year}-${month}-${day}`;
  } else {
    formattedDueDate = "";
  }

  useEffect(() => {
    const fetchJobIds = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await getJobIds(authToken);
        if (response.res) {
          setJobList(response.res);
          console.log("jobs-", response.res);
        } else {
          console.error("Failed to fetch tasks:", response.error);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchTasksToDo();
    fetchTasksCompleted();
    fetchJobUsers();
    fetchJobIds();
  }, [selectionRange.endDate, selectionRange.startDate]);

  const handleNextMonth = () => {
    setSelectionRange((prevState) => {
      const nextMonthStartDate = new Date(prevState.startDate);
      const nextMonthEndDate = new Date(prevState.endDate);
      nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() + 1);
      nextMonthEndDate.setMonth(nextMonthEndDate.getMonth() + 1);
      return {
        ...prevState,
        startDate: nextMonthStartDate,
        endDate: nextMonthEndDate,
      };
    });
  };

  const handlePrevMonth = () => {
    setSelectionRange((prevState) => {
      const nextMonthStartDate = new Date(prevState.startDate);
      const nextMonthEndDate = new Date(prevState.endDate);
      nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() - 1);
      nextMonthEndDate.setMonth(nextMonthEndDate.getMonth() - 1);
      return {
        ...prevState,
        startDate: nextMonthStartDate,
        endDate: nextMonthEndDate,
      };
    });
  };

  const handleFormatedDate = (date) => {
    const originalDate = new Date(date);
    const formattedDate = originalDate.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formattedDate;
  };

  const handleClose = ()=>{
    setTimeout(() => {
      fetchTasksToDo();
      fetchTasksCompleted();
    }, 1000);
    setShowPopup(false)
  }

  const handleJob = async (job_id) => {
    console.log(job_id,`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/job/${job_id}`);
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
        `${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/job/${job_id}`,
        requestOptions
      );
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const data = isJson && (await response.json());
      setSearchJobStages(data);
      if (response.status === 200) {
        setLoading(false);
        navigate("/jobs", { state: data })
        return { res: data, error: null };

      } else {
        return { res: null, error: data };
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
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
      <div className="DashboardTopMenu">
        {showPopup && (
          <Complete
            data={selectedTask}
            handleClose={() => handleClose()}
            scrollRef={taskMobileScrollRef}
          />
        )}
        <div className="DashboardHeading d-flex justify-content-between align-items-center">
          <h2>Tasks</h2>
          <div
            className={`addNewTaskBtn d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none  ${taskTab === "completed" && "d-none"}`}
            onClick={() => setAddTask(!addTask)}
          >
            New Task{" "}
            <div className="UserImg" style={{ minWidth: "40px" }}>
              <AddIcon />
            </div>
          </div>
        </div>
        <div className="DashboardHeading d-flex justify-content-between align-items-center position-relative">
          <div
            className="datePickerText addNewTaskBtn d-flex align-items-center gap-0 justify-content-end navMenuDiv p-0 bg-transparent shadow-none"
            style={{ marginTop: "40px" }}
          >
            <div className="selectPrevNextMonthIcon" onClick={handlePrevMonth}>
              <PrevIcon />
            </div>
            <div onClick={() => setSelectDate(!selectDate)}>
              <TaskIcon />
              {formattedStartDate}-{formattedEndDate}
            </div>
            <div
              className="selectPrevNextMonthIcon"
              style={{ marginLeft: "7px" }}
              onClick={handleNextMonth}
            >
              <NextIcon />
            </div>
          </div>
          {selectDate && (
            <div className="datePickerDiv" ref={selectDateRef}>
              <DateRangePicker
                moveRangeOnFirstSelection={false}
                editableDateInputs={false}
                ranges={[selectionRange]}
                onChange={handleSelect}
                rangeColors={["#E2E31F"]}
              />
            </div>
          )}

          <div
            className="d-flex  align-items-baseline pe-md-4 addNewTaskDiv "
            style={{ cursor: "pointer",marginTop: "40px" }}
            ref={filterRef}
          >
            <div
              className="d-flex align-items-center gap-2  "
              onClick={() => setShowFilter(!showFilter)}
            >
              <FilterIcon />
              <p style={{ color: "#E2E31F", fontSize: "14px", margin: "0" }}>
                Filter
              </p>
            </div>
            {showFilter && (
              <Filter
                setFilteredJobs={setFilteredJobs}
                setLoading={setLoading}
                closeFilter={() => setShowFilter(false)}
              />
            )}
          </div>
        </div>

        <div className="DashboardHeading d-flex justify-content-start align-items-center position-relative">
          <div className="taskTabsDiv">
            <div
              className={`taskTab tasksTodo ${taskTab === "todo" && "active"}`}
              onClick={() => setTaskTab("todo")}
            >
              To Do
            </div>
            <div
              className={`taskTab tasksCompleted ${
                taskTab === "completed" && "active"
              }`}
              onClick={() => setTaskTab("completed")}
            >
              Completed
            </div>
          </div>
        </div>

        {taskTab === "todo" && (
          <div className="taskContainer">
            <ul>
              <li className="heading">
                <div className="listContent">Title</div>
                <div className="listContent centerContent">
                  <div className="centerText">Stage</div>
                  <div className="centerText">Due Date</div>
                </div>
                <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none">
                  Assignee{" "}
                  <div className="UserImg" style={{ minWidth: "40px" }}>
                    <User />
                  </div>
                </div>
              </li>
              {addTask && (
                <li className="heading addNewTaskDiv">
                  <div className="listContent">
                    <div className="addNewTaskBtn d-flex align-items-center gap-2 justify-content-start navMenuDiv p-0 bg-transparent shadow-none">
                      
                      <div className="addTaskJobDiv">
                        <div
                          className="addTaskJobBtn"
                          onClick={() => {
                            setAddTaskJobDropdown(true);
                            setAddTaskJobStageDropdown(false);
                          }}
                        >
                          + Job No.
                          {selectedSearchJob && ` (${selectedSearchJob})`}
                        </div>
                        {addTaskJobDropdown && (
                          <div className="addTaskJobDropdown" ref={addTaskJobDropdownRef} >
                            <div className="addTaskJobSearchDiv">
                              <div className="searchBox">
                                <div className="IconBox">
                                  <Search />
                                </div>
                                <input
                                  name="search"
                                  placeholder="Search “Job No.” or  “Name”"
                                  value={searchJobList}
                                  onChange={(e) =>
                                    setSearchJobList(e.target.value)
                                  }
                                />
                              </div>
                              <div className="divider" />
                              <button
                                className="colorOutlineBtn"
                                onClick={() => {
                                  if (searchJobList === "") {
                                    toast.error("Select a Job Id to search", {
                                      position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
                                      autoClose: 5000,
                                      hideProgressBar: true,
                                      closeOnClick: true,
                                      pauseOnHover: true,
                                      draggable: true,
                                      progress: undefined,
                                      theme: "colored",
                                    });
                                  } else {
                                    fetchJobStages(searchJobList);
                                  }
                                }}
                              >
                                Apply
                              </button>
                            </div>
                            <div className="addTaskJobListScroll">
                              <div className="addTaskJobListItems">
                                {jobList &&
                                  jobList
                                    .filter((job) =>
                                      searchJobList
                                        ? job.id.toString() ===
                                          searchJobList.toString()
                                        : true
                                    )
                                    .map((job) => (
                                      <div
                                        key={job.id}
                                        className={`addTaskJobListItem ${
                                          searchJobList === job.id && "active"
                                        }`}
                                        onClick={() => setSearchJobList(job.id)}
                                      >
                                        {job.id}
                                      </div>
                                    ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        className="addTaskTitleBtn"
                        value={createTaskTitle}
                        onChange={(e) => setCreateTaskTitle(e.target.value)}
                        placeholder="Task Title"
                      />
                    </div>
                  </div>
                  <div className="listContent centerContent">
                    <div className="centerText addTaskJobDiv ">
                      <div
                        className={`addTaskJobBtn ${selectedSearchJobStage}`}
                        onClick={() => {
                          setAddTaskJobDropdown(false);
                          setAddTaskJobStageDropdown(!addTaskJobStageDropdown);
                          if (searchJobStages.length <= 0) {
                            toast.error("Select a Job Id first", {
                              position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
                              autoClose: 5000,
                              hideProgressBar: true,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              theme: "colored",
                            });
                          }
                        }}
                      >
                        {selectedSearchJobStage
                          ? selectedSearchJobStage
                          : "+ Add Stage"}
                      </div>
                      {addTaskJobStageDropdown &&
                        searchJobStages.length > 0 && (
                          <div className="addTaskJobDropdown" ref={addTaskJobStageDropdownRef} >
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
                    <div className="centerText addTaskJobDiv">
                      <div
                        className="addTaskDueDateBtn"
                        onClick={() => setSelectDueDate(!selectDueDate)}
                      >
                        <TaskIcon />{" "}
                        {selectedDueDate ? formattedDueDate : "Due Date"}
                      </div>
                      {selectDueDate && (
                        <div className="datePickerDiv" ref={selectDueDateRef}>
                          <Calendar
                            date={selectedDueDate}
                            onChange={handleSelectDueDate}
                            value={selectedDueDate}
                            calendarType="ISO 8601"
                            rangeColors={["#E2E31F"]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none">
                    <div className="addTaskJobDiv d-flex align-items-center justify-content-end">
                      {selectedUsers.length > 0 ? (
                        <>
                          {usersList
                            .filter((user) => selectedUsers.includes(user.id))
                            .map((user, index) => (
                              <div
                                key={index}
                                className={`UserImg addedUserImages ${index}`}
                                style={{ minWidth: "40px", zIndex: index }}
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
                          <div
                            className="UserImg withAddBtn m-0"
                            onClick={() =>
                              setAddTaskJobUserDropdown(!addTaskJobUserDropdown)
                            }
                            style={{ minWidth: "40px", zIndex: "99" }}
                          >
                            <User />
                          </div>
                        </>
                      ) : (
                        <div
                          className="UserImg withAddBtn"
                          onClick={() => {
                            setAddTaskJobUserDropdown(!addTaskJobUserDropdown);
                          }}
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
                                    ))}
                              </div>
                              <label className="">Add Assignees</label>
                              {usersList
                                .filter(
                                  (user) => !selectedUsers.includes(user.id)
                                )
                                .map((user) => (
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
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                      <div
                          className="UserImg createTaskBtn m-0"
                          style={{ minWidth: "40px" }}
                          onClick={handleCreateTask}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg"  width="25" height="25" viewBox="0 0 15 15">
                          <rect width="100%" height="100%" fill="none" />
                          <path fill="none" stroke="inherit" d="M4 7.5L7 10l4-5" />
                        </svg>
                      </div>

                    <div
                        className="UserImg cancelTaskBtn m-0"
                        style={{ minWidth: "40px" }}
                        onClick={()=> setAddTask(false)}
                      >
                      <AddIcon />
                    </div>
                  </div>
                </li>
              )}
              {tasksToDo &&
                tasksToDo.map((task, i) => (
                  <li
                    key={task.id}
                    id={`stage_` + task.id}
                    className={`  stage_` + task.stage.title}
                  >
                    <div className={`listContent listTitle `}>
                      <label htmlFor={`select_${task.id}`}>
                        <input
                          type="checkbox"
                          checked={isChecked[task.id] || false}
                          onChange={() => toggleCheckbox(`select_${task.id}`)}
                          id={`select_${task.id}`}
                          style={{ display: "none" }}
                        />
                        {isChecked[`select_${task.id}`] ? (
                          <div className="svg-box-selected mx-2">
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
                          <div className="svg-box-not-selected mx-2"></div>
                        )}
                      </label>
                      <p>
                        | {task.job_id} |<span>{task.title}</span>
                      </p>
                    </div>
                    <div className="listContent centerContent">
                      <div
                        className={`centerText stageBtn btn_${task.stage.title}`}
                      >
                        {task.stage.title}
                      </div>
                      <div className="centerText">
                        {handleFormatedDate(task.due_date)}
                      </div>
                    </div>
                    <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                      <div className=" d-flex align-items-center justify-content-end">
                        {task.users.length > 0 ? (
                          <>
                            {task.users.map((user, index) => (
                              <div
                                key={index}
                                className={` UserImg addedUserImages ${index === task.users.length - 1
                                  ? "withAddBtn"
                                  : ""
                                  }`}
                                style={{ minWidth: "40px", zIndex: index }}
                                onClick={() => toggleUserDropdown(i)}
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
                          </>
                        ) : (
                          <div
                            className="UserImg withAddBtn"
                            onClick={() => toggleUserDropdown(i)}
                            style={{ minWidth: "40px" }}
                          >
                            <User />
                          </div>
                        )}
                        {userDropdownStates[i] && (
                          <div className="addAssigneeDropdown ">
                            <div
                              className="addTaskJobListScroll"
                              ref={selectAssigneeRef}
                            >
                              <div className="addTaskJobListItems">
                                <label className="addedAssignees">
                                  Assignees
                                </label>
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
                                              selectedAssignee.includes(
                                                user.id
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
                                              {selectedAssignee.includes(
                                                user.id
                                              )
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
                                    (user) =>
                                      !selectedAssignee.includes(user.id)
                                  )
                                  .map((user) => (
                                    <>
                                      <div
                                        key={user.id}
                                        className={`addAssigneeDiv ${
                                          selectedAssignee.includes(user.id) &&
                                          "active"
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
                        )}
                      </div>
                    </div>
                    <div className="taskToJob" onClick={() => handleJob(task.job_id)}></div>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {taskTab === "todo" && (
          <div className="taskContainer mobile">
            <ul>
              {addTask && (
                <li className="heading addNewTaskDiv">
                  <div className="taskBox">
                      <div className="taskItem">
                        <div className="listContent">
                          <div className="addNewTaskBtn d-flex align-items-center gap-2 justify-content-start navMenuDiv p-0 bg-transparent shadow-none">
                            
                            <div className="addTaskJobDiv">
                              <div
                                className="addTaskJobBtn"
                                onClick={() => {
                                  setAddTaskJobDropdownMobile(true);
                                  setAddTaskJobStageDropdown(false);
                                }}
                              >
                                + Job No.
                                {selectedSearchJob && ` (${selectedSearchJob})`}
                              </div>
                              {addTaskJobDropdownMobile && (
                                <div
                                  className="addTaskJobDropdown"
                                  ref={addTaskJobDropdownRefMobile}
                                >
                                  <div className="addTaskJobSearchDiv">
                                    <div className="searchBox">
                                      <div className="IconBox">
                                        <Search />
                                      </div>
                                      <input
                                        name="search"
                                        placeholder="Search “Job No.” or  “Name”"
                                        value={searchJobList}
                                        onChange={(e) =>
                                          setSearchJobList(e.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="divider" />
                                    <button
                                      className="colorOutlineBtn"
                                      onClick={() => {
                                        if (searchJobList === "") {
                                          toast.error("Select a Job Id to search", {
                                            position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: "colored",
                                          });
                                        } else {
                                          fetchJobStages(searchJobList);
                                        }
                                      }}
                                    >
                                      Apply
                                    </button>
                                  </div>
                                  <div className="addTaskJobListScroll">
                                    <div className="addTaskJobListItems">
                                      {jobList &&
                                        jobList
                                          .filter((job) =>
                                            searchJobList
                                              ? job.id.toString() ===
                                                searchJobList.toString()
                                              : true
                                          )
                                          .map((job) => (
                                            <div
                                              key={job.id}
                                              className={`addTaskJobListItem ${
                                                searchJobList === job.id && "active"
                                              }`}
                                              onClick={() => setSearchJobList(job.id)}
                                            >
                                              {job.id}
                                            </div>
                                          ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <input
                              className="addTaskTitleBtn"
                              value={createTaskTitle}
                              onChange={(e) => setCreateTaskTitle(e.target.value)}
                              placeholder="Task Title"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Stage</div>
                          <div className="listContent centerContent">
                            <div className="centerText addTaskJobDiv ">
                              <div
                                className={`addTaskJobBtn ${selectedSearchJobStage}`}
                                onClick={() => {
                                  setAddTaskJobDropdown(false);
                                  setAddTaskJobStageDropdownMobile(!addTaskJobStageDropdownMobile);
                                  if (searchJobStages.length <= 0) {
                                    toast.error("Select a Job Id first", {
                                      position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
                                      autoClose: 5000,
                                      hideProgressBar: true,
                                      closeOnClick: true,
                                      pauseOnHover: true,
                                      draggable: true,
                                      progress: undefined,
                                      theme: "colored",
                                    });
                                  }
                                }}
                              >
                                {selectedSearchJobStage
                                  ? selectedSearchJobStage
                                  : "+ Add Stage"}
                              </div>
                              {addTaskJobStageDropdownMobile &&
                                searchJobStages.length > 0 && (
                                  <div
                                    className="addTaskJobDropdown right"
                                    ref={addTaskJobStageDropdownRefMobile}
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
                          </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Due Date</div>
                          <div className="listContent centerContent">
                            <div className="centerText addTaskJobDiv">
                                <div
                                  className="addTaskDueDateBtn"
                                  onClick={() => setSelectDueDateMobile(!selectDueDateMobile)}
                                >
                                  <TaskIcon />{" "}
                                  {selectedDueDate ? formattedDueDate : "Due Date"}
                                </div>
                                {selectDueDateMobile && (
                                  <div className="datePickerDiv " style={{right:'0',left:'auto'}} ref={selectDueDateRefMobile}>
                                    <Calendar
                                      date={selectedDueDate}
                                      onChange={handleSelectDueDate}
                                      value={selectedDueDate}
                                      calendarType="ISO 8601"
                                      rangeColors={["#E2E31F"]}
                                    />
                                  </div>
                                )}
                            </div>

                          </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Assignee</div>

                          <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none">
                            <div className="addTaskJobDiv d-flex align-items-center justify-content-end">
                              {selectedUsers.length > 0 ? (
                                <>
                                  {usersList
                                    .filter((user) => selectedUsers.includes(user.id))
                                    .map((user, index) => (
                                      <div
                                        key={index}
                                        className={`UserImg addedUserImages ${index}`}
                                        style={{ minWidth: "40px", zIndex: index }}
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
                                  <div
                                    className="UserImg withAddBtn m-0"
                                    onClick={() =>
                                      setAddTaskJobUserDropdownMobile(!addTaskJobUserDropdownMobile)
                                    }
                                    style={{ minWidth: "40px", zIndex: "99" }}
                                  >
                                    <User />
                                  </div>
                                </>
                              ) : (
                                <div
                                  className="UserImg withAddBtn"
                                  onClick={() => {
                                    setAddTaskJobUserDropdownMobile(!addTaskJobUserDropdownMobile);
                                  }}
                                  style={{ minWidth: "40px" }}
                                >
                                  <User />
                                </div>
                              )}
                              {addTaskJobUserDropdownMobile && (
                                <div
                                  className="addTaskJobDropdown right"
                                  ref={selectUserRefMobile}
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
                      <div className="taskItem">
                        <div className="listContent d-flex align-items-center gap-2 justify-content-between navMenuDiv p-0 bg-transparent shadow-none">
                            <div
                                className="UserImg createTaskBtn m-0"
                                style={{ minWidth: "40px" }}
                                onClick={handleCreateTask}
                              >
                              <svg xmlns="http://www.w3.org/2000/svg"  width="25" height="25" viewBox="0 0 15 15">
                                <rect width="100%" height="100%" fill="none" />
                                <path fill="none" stroke="inherit" d="M4 7.5L7 10l4-5" />
                              </svg>
                            </div>
                              <div
                                className="UserImg cancelTaskBtn m-0"
                                style={{ minWidth: "40px" }}
                                onClick={()=> setAddTask(false)}
                              >
                              <AddIcon />
                            </div>
                        </div>

                      </div>

                    </div>
                </li>
              )}
              {tasksToDo &&
                tasksToDo.map((task, i) => (
                  <li
                    key={task.id}
                    id={`stage_` + task.id}
                    className={`  stage_` + task.stage.title}
                  > 
                    <div className="taskBox">
                      <div className="taskItem">
                        <div className="taskHeading">Title</div>
                        <div className={`listContent listTitle `}>
                          <label htmlFor={`select_${task.id}`}>
                            <input
                              type="checkbox"
                              checked={isChecked[task.id] || false}
                              onChange={() => toggleCheckbox(`select_${task.id}`)}
                              id={`select_${task.id}`}
                              style={{ display: "none" }}
                            />
                            {isChecked[`select_${task.id}`] ? (
                              <div className="svg-box-selected mx-2">
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
                              <div className="svg-box-not-selected mx-2"></div>
                            )}
                          </label>
                          <p className="text-end">
                            | {task.job_id}|<span>{task.title}</span>
                          </p>
                        </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Stage</div>
                        <div className="listContent centerContent">
                          <div
                            className={`centerText stageBtn btn_${task.stage.title}`}
                          >
                            {task.stage.title}
                          </div>
                        </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Due Date</div>
                        <div className="listContent centerContent">
                          <div className="">
                            {handleFormatedDate(task.due_date)}
                          </div>
                        </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Assignee</div>
                        <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                          <div className=" d-flex align-items-center justify-content-end">
                            {task.users.length > 0 ? (
                              <>
                                {task.users.map((user, index) => (
                                  <div
                                    key={index}
                                    className={` UserImg addedUserImages ${index === task.users.length - 1
                                      ? "withAddBtn"
                                      : ""
                                      }`}
                                    style={{ minWidth: "40px", zIndex: index }}
                                    onClick={() => toggleUserDropdown(i)}
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
                              </>
                            ) : (
                              <div
                                className="UserImg withAddBtn"
                                onClick={() => toggleUserDropdown(i)}
                                style={{ minWidth: "40px" }}
                              >
                                <User />
                              </div>
                            )}
                            {userDropdownStates[i] && (
                              <div className="addAssigneeDropdown ">
                                <div
                                  className="addTaskJobListScroll"
                                  ref={selectAssigneeRef}
                                >
                                  <div className="addTaskJobListItems">
                                    <label className="addedAssignees">
                                      Assignees
                                    </label>
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
                                                  selectedAssignee.includes(
                                                    user.id
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
                                                  {selectedAssignee.includes(
                                                    user.id
                                                  )
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
                                        (user) =>
                                          !selectedAssignee.includes(user.id)
                                      )
                                      .map((user) => (
                                        <>
                                          <div
                                            key={user.id}
                                            className={`addAssigneeDiv ${
                                              selectedAssignee.includes(user.id) &&
                                              "active"
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
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {taskTab === "completed" && (
          <div className="taskContainer">
            <ul>
              {tasksCompleted &&
                tasksCompleted.map((task) => (
                  <li
                    key={task.id}
                    id={`stage_` + task.id}
                    className={`heading completeStage`}
                  >
                    <div className={`listContent listTitle `}>
                      <div
                        className="me-2 revertToDo"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowPopup(true);
                        }}
                      >
                        <RedoIcon />
                      </div>
                      <p>
                        | {task.job_id}|<span>{task.title}</span>
                      </p>
                    </div>
                    <div className="listContent centerContent">
                      <div
                        className={`centerText stageBtn btn_${task.stage.title}`}
                      >
                        {task.stage.title}
                      </div>
                      <div className="centerText">{task.due_date}</div>
                    </div>
                    <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none">
                      <div className=" d-flex align-items-center justify-content-end">

                        {task.users.length > 0 ? (
                            <>
                              {task.users.map((user, index) => (
                                  <div
                                    key={index}
                                    className={` UserImg addedUserImages `}
                                    style={{ minWidth: "40px", zIndex: index }}
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
                            </>
                        ):(
                          <div
                            className="UserImg "
                            style={{ minWidth: "40px" }}
                          >
                            <User />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {taskTab === "completed" && (
          <div className="taskContainer mobile">
            <ul>
              {tasksCompleted &&
                tasksCompleted.map((task) => (
                  <li
                    key={task.id}
                    id={`stage_` + task.id}
                    className={`heading completeStage`}
                  >
                    <div className="taskBox">
                      <div className="taskItem">
                        <div className="taskHeading">Title</div>
                        <div className={`listContent listTitle `}>
                          <div
                            className="me-2 revertToDo"
                            onClick={() => {
                              // setSelectedTask(task);
                              // setShowPopup(true);
                              handleTaskRedo(task);
                            }}
                          >
                            <RedoIcon />
                          </div>
                          <p>
                            | {task.job_id}|<span>{task.title}</span>
                          </p>
                        </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Stage</div>
                        <div className="listContent centerContent">
                          <div
                            className={`centerText stageBtn btn_${task.stage.title}`}
                          >
                            {task.stage.title}
                          </div>
                        </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Due Date</div>
                        <div className="listContent centerContent">
                          <div className="">
                            {handleFormatedDate(task.due_date)}
                          </div>
                        </div>
                      </div>
                      <div className="taskItem">
                        <div className="taskHeading">Assignee</div>
                        <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none">
                          <div className=" d-flex align-items-center justify-content-end">

                            {task.users.length > 0 ? (
                                <>
                                  {task.users.map((user, index) => (
                                      <div
                                        key={index}
                                        className={` UserImg addedUserImages `}
                                        style={{ minWidth: "40px", zIndex: index }}
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
                                </>
                            ):(
                              <div
                                className="UserImg "
                                style={{ minWidth: "40px" }}
                              >
                                <User />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default TaskPage;
