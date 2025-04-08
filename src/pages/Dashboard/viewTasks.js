import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import {
  AddIcon,
  ArrowRight,
  BellIcon,
  CloseIcon,
  FilterCrossIcon,
  NewFilterIcon,
  Search,
} from "../../assets/svg";
import {
  createTask,
  deleteTask,
  getJobIds,
  getSingleJob,
  getTasksByUser,
  getUserByRole,
  updateTask,
} from "../../services/auth";
import "./viewTasks.scss";

import moment from "moment";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import TaskFilter from "../../Components/Filter/TaskFilter";
import {
  CreateTaskModal,
  UpdateTaskModal,
} from "../../Components/JobModal/Edit/JobModal";
import { formatJobNumber } from "../Jobs";
import ToggleButton from "../../Components/ToggleButton";
import { addNotification } from "../../helper";
function ViewTaskPage() {
  const [loading, setLoading] = useState(true);
  const [taskTab, setTaskTab] = useState("to-do");
  const [addTaskJobDropdown, setAddTaskJobDropdown] = useState(false);
  const [addTaskJobDropdownMobile, setAddTaskJobDropdownMobile] =
    useState(false);
  const [addTaskJobStageDropdown, setAddTaskJobStageDropdown] = useState(false);
  const [addTaskJobStageDropdownMobile, setAddTaskJobStageDropdownMobile] =
    useState(false);
  const [addTaskJobUserDropdown, setAddTaskJobUserDropdown] = useState(false);
  const [addTaskJobUserDropdownMobile, setAddTaskJobUserDropdownMobile] =
    useState(false);
  const [selectDate, setSelectDate] = useState(false);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectDueDateMobile, setSelectDueDateMobile] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [tasksToDo, setTasksToDo] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userDropdownStates, setUserDropdownStates] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTask, setSelectedTask] = useState({});
  const filterRef = useRef(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilteredPage, setCurrentFilteredPage] = useState(1);
  const [pageUrls, setPageUrls] = useState([]);
  const [filteredPageUrls, setFilteredPageUrls] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [pageUrls2, setPageUrls2] = useState([]);
  const [totalPages2, setTotalPages2] = useState(1);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [selectSearchOptions, setSelectSearchOptions] = useState("");
  const [showingSearchOptions, setShowingSearchOptions] = useState("");
  const [searchedInput, setSearchedInput] = useState("");
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
  const searchBarRef = useRef(null);
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [filteredString, setFilteredString] = useState([]);
  const [filteredQuery, setFilteredQuery] = useState([]);
  const [storageUpdated, setStorageUpdated] = useState(false);
  const [userColors, setUserColors] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [isOn, setIsOn] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const notificationRef = useRef(null);
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "notifications") {
        const updatedNotifications = JSON.parse(event.newValue)?.map(
          (notif) => ({
            ...notif,
            id: notif.id || uuidv4(),
          })
        );
        setNotifications(updatedNotifications);
        setStorageUpdated(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const checkNotifications = () => {
      const existingNotificationsJSON = localStorage.getItem("notifications");
      if (existingNotificationsJSON) {
        const existingNotifications = JSON.parse(existingNotificationsJSON).map(
          (notif) => ({
            ...notif,
            id: notif.id || uuidv4(),
          })
        );
        setNotifications(existingNotifications);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [storageUpdated]);


  const handleRemoveNotification = async (notificationToRemove) => {
    setDeletingId(notificationToRemove.id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification?.id !== notificationToRemove?.id
      )
    );
    const updatedNotifications = notifications.filter(
      (notification) => notification?.id !== notificationToRemove?.id
    );
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    setDeletingId(null);
  };

  useEffect(() => {
    let handler = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        console.log("triggerd  notification");
        setNotificationDropDown(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

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
      if (
        selectUserRefMobile.current &&
        !selectUserRefMobile.current.contains(e.target)
      ) {
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

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeTaskJob, setActiveTaskJob] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);

  const [selectionRange, setSelectionRange] = useState({
    startDate: firstDayOfMonth,
    endDate: lastDayOfMonth,
    key: "selection",
  });

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
    fetchJobUsers();
    fetchJobIds();
  }, [
    selectionRange.endDate,
    selectionRange.startDate,
    currentPage,
    currentPage2,
    currentFilteredPage,
  ]);

  useEffect(() => {
    const handleClickOutside = async (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target) &&
        !selectSearchOptions
      ) {
        setShowSearchOptions(false);
        setSelectSearchOptions("");
        setSearchedInput("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectSearchOptions]);

  const handleJobFilter = async () => {
    try {
      const response = await getTasksByUser(
        {},
        isOn ? "completed=true" : "non_completed=true"
      );
      if (response.res) {
        setActiveTaskJob(response?.res.data);
        setFilteredTasks(response?.res?.data);
        return response.res;
      } else {
        console.error("get task failed:", response.error);
        toast.error(response.error?.message || "Failed to get the job");
      }
    } catch (error) {
      console.error("Error getting job:", error);
      toast.error("Error getting task");
    }
  };
  useEffect(() => {
    handleJobFilter();
  }, [isOn]);

  const handleCreateModalTask = async (newData, taskId, users, stage) => {
    setFilteredTasks((prevTasks) => [
      {
        id: "temp",
        title: newData?.newTask?.title,
        description: newData?.newTask?.description,
        stage_id: newData?.newTask?.stage_id,
        due_date: newData?.newTask?.due_date,
        status: newData?.newTask?.status,
        assignee_ids: newData?.newTask?.assignee_ids,
        job_num: newData?.newTask?.job_num,
        job_id: newData?.newTask?.job_id,
        users: users,
        stage: stage,
      },
      ...prevTasks,
    ]);
    setShowAddTaskModal(false);
    var response = await createTask(newData.newTask, taskId);
    if (response.res) {
      const { task } = response.res;
      // Update the filteredTasks to replace the temporary task with the actual task
      setFilteredTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === "temp" ? task : t))
      );
      addNotification("success", "Task Created")
      console.log("Task create successful", response.res);
    } else {
      addNotification("error", "Task Creation Failed")
      console.error("Task create failed:", response.error);
      toast.error(response.error?.message || "Failed to add the task");
      // Optionally, remove the temporary task if the creation fails
      setFilteredTasks((prevTasks) => prevTasks.filter((t) => t.id !== "temp"));
    }
  };

  const handleCheckTask = async (jobId, index) => {
    try {
      setLoading(true);

      const response = await getSingleJob(jobId);
      if (response.res) {
        setActiveTask(response.res.tasks[index]);

        setShowUpdateTaskModal(true);
      } else {
        console.error("get task failed:", response.error);
        toast.error(response.error?.message || "Failed to get the job");
      }
    } catch (error) {
      console.error("Error getting job:", error);
      toast.error("Error getting task");
    } finally {
      setLoading(false);
    }
  };

  const handleActiveTask = async (task) => {
    // Reset the active task before setting the new one
    setActiveTask(null);

    // Delay to ensure state reset takes effect before setting the new task
    setTimeout(() => {
      setActiveTask(task);
      setShowUpdateTaskModal(true);
    }, 0);
  };

  const handleTaskDelete = async (task) => {
    try {
      const response = await deleteTask(task.id);
      if (response.res) {
          addNotification("success", "Task Deleted")
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

  const handleUpdateTask = async (
    newData,
    taskId,
    newJobCollaboratorsList,
    stage
  ) => {
    console.log(taskId, " - ", activeTask.id, " - ", newData);

    setFilteredTasks((prevTasks) =>
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
      addNotification("success", "Task Updated")
      console.log("Task Update successful", response.res);
    } else {
      addNotification("error", "Task Update Failed")
      console.error("Task Update failed:", response.error);
      toast.error(response.error?.message || "Failed to Update the task");
    }
  };

  const handleCloseModal = async () => {
    setShowUpdateTaskModal(false);
    setActiveTask(null);
  };

  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const handleSearchApply = async () => {
    setLoading(true);
    try {
      var reqData = {
        [selectSearchOptions]: searchedInput,
      };
      setShowingSearchOptions(searchedInput);
      const response = await getTasksByUser(
        reqData,
        isOn ? "completed=true" : "non_completed=true"
      );
      if (!response.error) {
        setFilteredTasks(response?.res?.data);
      }
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate a random color
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleRemoveFilter = async (value) => {
    const updatedQuery = {
      ...filteredQuery,
      stage_id: filteredQuery.stage_id?.filter((id) => id !== value.value),
      status: filteredQuery.status?.filter((status) => status !== value.value),
      due_this_week: undefined,
      due_in_14_days: undefined,
    };

    if (!updatedQuery?.stage_id || updatedQuery.stage_id?.length === 0)
      delete updatedQuery.stage_id;
    if (!updatedQuery.status || updatedQuery.status?.length === 0)
      delete updatedQuery.status;
    if (!updatedQuery.due_this_week) delete updatedQuery.due_this_week;
    if (!updatedQuery.due_in_14_days) delete updatedQuery.due_in_14_days;
    console.log("uupdated", updatedQuery);
    setFilteredQuery(updatedQuery);
    setFilteredString((prevFiltered) =>
      prevFiltered.filter((item) => item !== value)
    );

    try {
      setLoading(true);
      const response = await getTasksByUser(
        updatedQuery,
        isOn ? "completed=true" : "non_completed=true"
      );

      if (!response.error) {
        setFilteredTasks(response?.res?.data);
      }
    } catch (error) {
      console.error("Error in applying filter:", error);
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

      {showAddTaskModal && (
        <CreateTaskModal
          task={null}
          usersList={usersList}
          newTask={true}
          handleClose={async () => {
            setShowAddTaskModal(false);
          }}
          scrollRef={taskMobileScrollRef}
          onCreateTask={handleCreateModalTask}
          handleDelete={() => {
            setShowAddTaskModal(false);
          }}
        />
      )}

      {showUpdateTaskModal && activeTask && (
        <UpdateTaskModal
          task={activeTask}
          usersList={usersList}
          handleClose={handleCloseModal}
          scrollRef={taskMobileScrollRef}
          onUpdateTask={handleUpdateTask}
          handleDelete={() => {
            console.log("task to be deleted", filteredTasks, activeTask);
            setFilteredTasks((prevTask) =>
              prevTask.filter((task) => task.id !== activeTask.id)
            );
            handleTaskDelete(activeTask);
            handleCloseModal();
          }}
        />
      )}

      <div
        className="JobsHeading position-relative d-flex justify-content-between align-items-center gap-3 flex-wrap"
        style={{ zIndex: "2" }}
      >
        <div className="d-flex gap-3 flex-wrap leftGap align-items-center">
          <h2>Tasks</h2>
          <div className="navSearchDiv jobSearchDiv jobSearchBar">
            <form>
              <div
                className="searchBox"
                onClick={() => setShowSearchOptions(true)}
                ref={searchBarRef}
              >
                <div
                  className="IconBox"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={handleSearchApply}
                >
                  <Search />
                </div>
                {showSearchOptions ? (
                  <div className="SearchOptionBox">
                    <div
                      className={`searchOptionBtn ${
                        selectSearchOptions !== "task_name" &&
                        selectSearchOptions !== ""
                          ? "disable"
                          : selectSearchOptions !== ""
                          ? "active"
                          : ""
                      }`}
                      onClick={() => setSelectSearchOptions("task_name")}
                    >
                      Task Name
                    </div>
                    <div
                      className={`searchOptionBtn ${
                        selectSearchOptions !== "job_num" &&
                        selectSearchOptions !== ""
                          ? "disable"
                          : selectSearchOptions !== ""
                          ? "active"
                          : ""
                      }`}
                      onClick={() => setSelectSearchOptions("job_num")}
                    >
                      Job No.
                    </div>

                    {selectSearchOptions !== "" && (
                      <input
                        name="search"
                        placeholder="Search"
                        value={searchedInput}
                        onChange={(e) => {
                          if (selectSearchOptions === "job_num") {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                              setSearchedInput(value);
                            }
                          } else {
                            setSearchedInput(e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchApply();
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <input
                    name="search"
                    placeholder="Search"
                    onFocus={() => setShowSearchOptions(true)}
                  />
                )}

                {(searchedInput !== "" || selectSearchOptions !== "") && (
                  <div
                    className="IconBox"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectSearchOptions("");
                      setSearchedInput("");
                      setShowSearchOptions(false);
                      setShowingSearchOptions("");
                      handleJobFilter();
                    }}
                  >
                    <CloseIcon />
                  </div>
                )}
              </div>
            </form>
          </div>
          <div
            className="d-flex  align-items-baseline addNewTaskDiv position-relative"
            style={{ cursor: "pointer" }}
            ref={filterRef}
          >
            <div
              className="d-flex align-items-center gap-2  "
              onClick={() => setShowFilter(!showFilter)}
            >
              <NewFilterIcon />
              <p style={{ color: "#E2E31F", fontSize: "14px", margin: "0" }}>
                Filter
              </p>
            </div>
            {showFilter && (
              <TaskFilter
                setFilteredString={setFilteredString}
                setFilteredQuery={setFilteredQuery}
                setFilteredTasks={setFilteredTasks}
                setLoading={setLoading}
                closeFilter={() => setShowFilter(false)}
                isOn={isOn}
              />
            )}
          </div>
        </div>
        <div className="d-flex gap-3 flex-wrap align-items-center">
          <div className="addjobs addJobsMobile" style={{ gap: "16px" }}>
            <div
              className="d-flex align-items-center"
              style={{ gap: "8px", cursor: "pointer" }}
              onClick={() => {
                if (filteredTasks.length > 0) {
                  setShowAddTaskModal(true);
                }
              }}
              title={filteredTasks.length > 0 ? "" : "Not Part of any Job yet"}
            >
              <div className={`addJobIcon`}>
                <AddIcon />
              </div>
              <span>Add Task</span>
            </div>
            <div
              className="d-flex align-items-center"
              style={{ gap: "8px", cursor: "pointer" }}
              onClick={() => setNotificationDropDown(true)}
            >
              <div className="notifyIcon notificationWhite mx-0">
              {notifications?.length > 0 &&  <div className="activeNotification"></div>}
                <div className="addNewTaskDiv">
                  <div className="bellIcon addTaskJobDiv">
                    <div>
                      <BellIcon />
                    </div>
                    {notificationDropDown && (
                      <div
                        className="addTaskJobDropdown notificationDropdown right"
                        ref={notificationRef}
                      >
                        <div className="addTaskJobListScroll">
                          <div className="addTaskJobListItems">
                            {notifications?.length > 0 ? (
                              notifications?.map((notification, index) => (
                                <div
                                className={`notificationClass ${notification.class}-class ${
                                  deletingId === notification.id
                                    ? "deleting"
                                    : ""
                                }`}
                              >
                                <div className="notificationMsg">
                                  <div className="notificationIcon"></div>
                                  <div className="notificationText">
                                    {notification.message}
                                  </div>
                                </div>
                                <button
                                  className="notificationCloseBtn"
                                  onClick={() =>
                                    handleRemoveNotification(notification)
                                  }
                                />
                              </div>
                              ))
                            ) : (
                              <div className="notificationClass info-class">
                                <div className="notificationMsg">
                                  <div className="notificationIcon"></div>
                                  <div className="notificationText">
                                    No Notifications
                                  </div>
                                </div>
                               
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span>Notifications</span>
            </div>
          </div>
        </div>
      </div>
      <div className="JobsHeading d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center justify-content-start gap-3">
          <div className="delete-box">
            <div className="delete-item d-flex align-items-center flex-wrap gap-2">
              {showSearchOptions && selectSearchOptions === "" && (
                <>Select which category you would like to search by.</>
              )}
              {showingSearchOptions ? (
                <>Search Results For: '{showingSearchOptions}'</>
              ) : selectSearchOptions ? (
                <>
                  {selectSearchOptions === "task_name" && (
                    <>
                      Enter the name of the ‘Task Name’ you would like to search
                      for.
                    </>
                  )}
                  {selectSearchOptions === "job_num" && (
                    <>Enter the Job number you would like to search for.</>
                  )}

                  {!["task_name", "job_num"].includes(selectSearchOptions) && (
                    <>Select which category you would like to search by.</>
                  )}
                </>
              ) : filteredString.length > 0 ? (
                <>
                  Filtered By:{" "}
                  {filteredString.map((string, index) => {
                    const className =
                      string.filter.length <= 2
                        ? "user"
                        : string.filter.replace(/\s+/g, "-").toLowerCase();
                    // Assign a random color only once for each `user` string
                    if (className === "user" && !userColors[string.filter]) {
                      setUserColors((prevColors) => ({
                        ...prevColors,
                        [string.filter]: getRandomColor(),
                      }));
                    }

                    // Use the stored color or currentColor
                    const borderColor =
                      className === "user"
                        ? userColors[string.filter]
                        : "inherit";
                    return (
                      <span
                        className={`filterItemBox ${className}`}
                        key={index}
                        style={{ border: `1px solid ${borderColor}` }}
                        onClick={() => handleRemoveFilter(string)}
                      >
                        {string.filter} <FilterCrossIcon />
                      </span>
                    );
                  })}
                </>
              ) : (
                !showSearchOptions &&
                selectSearchOptions === "" &&
                "Showing All Tasks"
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="DashboardTopMenu">
        <div className="d-flex align-items-center justify-content-start gap-2">
          <ToggleButton isOn={isOn} setIsOn={setIsOn} />{" "}
          <div className="task-toggle-text"> Completed Tasks</div>
        </div>
        <div className="pagination-container justify-content-start">
          <div className="taskContainer">
            <ul
              style={{
                position: "relative",
                overflowY: "auto",
                maxHeight: "800px",
                zIndex: "1",
                paddingRight: "10px",
                scrollBehavior: "smooth",
              }}
            >
              <li
                key={"001"}
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 200,
                }}
                className="heading"
              >
                <div className="listContent">Title</div>
                <div className="listContent centerContent">
                  <div className="centerText">Stage</div>
                  <div className="centerText">Job No.</div>
                </div>
                <div className="listContent navMenuDiv p-0 bg-transparent shadow-none d-flex justify-content-end">
                  <div
                    className="d-flex w-100 align-items-center gap-2 justify-content-end"
                    style={{ maxWidth: "375px" }}
                  >
                    <div
                      className="centerText text-center"
                      style={{ flex: "1", maxWidth: "100px" }}
                    >
                      Status
                    </div>
                    <div
                      className="centerText text-center"
                      style={{ flex: "1" }}
                    >
                      Due Date
                    </div>
                    <div
                      className="centerText text-center"
                      style={{ flex: "1" }}
                    >
                      Days Left
                    </div>
                  </div>
                </div>
              </li>
              {filteredTasks.length > 0 &&
                filteredTasks.map((task, i) => (
                  <li
                    key={task?.id}
                    id={`stage_` + task?.id}
                    className={`  stage_` + task?.stage?.title}
                    onClick={() => {
                      if (!task.id) {
                        console.log("not from db", task);
                        handleCheckTask(task.job_id, i);
                      } else {
                        handleActiveTask(task);
                      }
                    }}
                  >
                    <div
                      className={`listContent listTitle justify-content-between`}
                    >
                      <p
                        title={task?.title?.replace(/\b\w/g, (char) => char.toUpperCase())}
                        style={{
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "normal",
                          maxWidth: "350px",
                        }}
                      >
                        {task?.title?.replace(/\b\w/g, (char) => char.toUpperCase())}
                      </p>

                      <p style={{ marginRight: "30px", cursor: "pointer" }}>
                        <ArrowRight />
                      </p>
                    </div>
                    <div className="listContent centerContent">
                      <div
                        className={`centerText stageBtn btn_${task?.stage?.title}`}
                      >
                        {task?.stage?.title ? task?.stage?.title : "N/A"}
                      </div>
                      <div className={`JobBtn`}>
                        {task?.job_num ? formatJobNumber(task?.job_num) : "N/A"}
                      </div>
                    </div>
                    <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                      <div
                        className="d-flex w-100 align-items-center gap-2 justify-content-end"
                        style={{ maxWidth: "375px" }}
                      >
                        <div
                          style={{ flex: "1", maxWidth: "100px" }}
                          className={`centerText statusBtn m-0 ${task?.status}`}
                        >
                          {task?.status ? task?.status : "N/A"}
                        </div>
                        <div
                          style={{ flex: "1" }}
                          className="text-center centerText"
                        >
                          {formatDate(task?.due_date)}
                        </div>
                        <div
                          style={{ flex: "1" }}
                          className="text-center centerText"
                        >
                          {moment(task?.due_date || new Date())
                            .startOf("day")
                            .isBefore(moment().startOf("day"))
                            ? "0 days"
                            : (() => {
                                const diff = moment(
                                  task?.due_date || new Date()
                                )
                                  .startOf("day")
                                  .diff(moment().startOf("day"), "days");
                                return `${diff} day${diff === 1 ? "" : "s"}`;
                              })()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              {filteredTasks.length === 0 && (
                <div className="no-result">
                  {" "}
                  <span>No Results Found</span>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewTaskPage;
