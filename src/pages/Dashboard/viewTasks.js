import React, { useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import { AddIcon, FilterIcon } from "../../assets/svg";
import "./viewTasks.scss";
import {
  createTask,
  deleteTask,
  getJobByNum,
  getJobIds,
  getSingleJob,
  getTasksByFilter,
  getTasksByUser,
  getUserByRole,
  updateTask,
} from "../../services/auth";

import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { toast } from "react-toastify";
import Complete from "../../Components/Popups/Complete";
import filterIcon from "../../assets/icons/filterIcon.png";
import { useNavigate, useParams } from "react-router-dom";
import FilterTask from "../../Components/Filter/FilterTask";
import {
  CreateTaskModal,
  UpdateTaskModal,
} from "../../Components/JobModal/Edit/JobModal";
import moment from "moment";
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

  const handleFormatedDate = (date) => {
    const originalDate = new Date(date);
    const formattedDate = originalDate.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formattedDate;
  };

  const handleStoredApply = async (page) => {
    setLoading(true);
    const filterString = localStorage.getItem("filterString");
    try {
      // const response = await getTasksByFilter(filterString+`&page=${page}`);
      const response = await getTasksByFilter(
        filterString +
          `&status=${taskTab}&start_date=${selectionRange.startDate
            .toISOString()
            .slice(0, 10)}&end_date=${selectionRange.endDate
            .toISOString()
            .slice(0, 10)}&page=${page}`
      );
      if (!response.error) {
        let filterTab = response?.res.data.filter(
          (item) => item.status === taskTab
        );
        console.log("tasks", filterTab, taskTab);
        setFilteredTasks(filterTab);
        setFilteredTotalPages(response?.res.last_page);
        setFilteredPageUrls(response?.res.links.slice(1, -1));
      }
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleJobFilter = async () => {
      try {
        const response = await getTasksByUser();
        if (response.res) {
          console.log("job tasks are", response?.res?.tasks);
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
    handleJobFilter();
  }, []);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeTaskJob, setActiveTaskJob] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);

  const handleCreateModalTask = async (newData, taskId, users, stage) => {
    setFilteredTasks((prevTasks) => [
      {
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
      console.log("Task create successful", response.res);
    } else {
      console.error("Task create failed:", response.error);
      toast.error(response.error?.message || "Failed to add the task");
    }
  };

  const handleCheckTask = async (jobId, index) => {
    try {
      setLoading(true);
      
      const response = await getSingleJob(jobId);
      if (response.res) {
        setActiveTask(response.res.tasks[index]);
        var updatedTask = response.res.tasks[index];
       
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


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
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
            setFilteredTasks((prevTask) =>
              prevTask.filter((task) => task.id !== activeTask.id)
            );
            handleTaskDelete(activeTask);
            handleCloseModal();
          }}
        />
      )}

      <div className="DashboardTopMenu">
        <div className="pagination-container justify-content-start">
          <div className="DashboardHeading d-flex justify-content-between align-items-center">
            <h2>Tasks</h2>
            <div
              className={`addNewTaskBtn d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none  ${filteredTasks.length}`}
              onClick={() => {if(filteredTasks.length > 0){setShowAddTaskModal(true)}}}
              title={filteredTasks.length > 0 ? '' : 'Not Part of any Job yet'}
            >
              New Task{" "}
              <div className="UserImg" style={{ minWidth: "40px" }}>
                <AddIcon />
              </div>
            </div>
          </div>
          {/* <div className="DashboardHeading d-flex justify-content-end align-items-center position-relative">
            <div
              className="d-flex  align-items-baseline pe-md-4 addNewTaskDiv "
              style={{ cursor: "pointer", marginTop: "40px" }}
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
                <FilterTask
                  setFilteredTasks={setFilteredTasks}
                  setFilteredTotalPages={setFilteredTotalPages}
                  currentFilteredPage={currentFilteredPage}
                  setFilteredPageUrls={setFilteredPageUrls}
                  setLoading={setLoading}
                  taskTab={taskTab}
                  closeFilter={() => setShowFilter(false)}
                />
              )}
            </div>
          </div> */}

          <div className="taskContainer">
            <ul>
              <li key={"001"} className="heading">
                <div className="listContent">Title</div>
                <div className="listContent centerContent">
                  <div className="centerText">Stage</div>
                  <div className="centerText">Job No.</div>
                </div>
                <div className="listContent navMenuDiv p-0 bg-transparent shadow-none d-flex justify-content-end" >
                  <div className="d-flex w-100 align-items-center gap-2 justify-content-end" style={{maxWidth:'375px'}}>
                    <div className="centerText text-center" style={{flex:'1',maxWidth:'100px'}}>Status</div>
                    <div className="centerText text-center" style={{flex:'1'}}>Due Date</div>
                    <div className="centerText text-center" style={{flex:'1'}}>Days Left</div>
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
                    <div className={`listContent listTitle `}>
                      <p>
                        <span> {task?.title}</span>
                      </p>
                    </div>
                    <div className="listContent centerContent">
                      <div
                        className={`centerText stageBtn btn_${task?.stage?.title}`}
                      >
                        {task?.stage?.title ? task?.stage?.title : "N/A"}
                      </div>
                      <div className={`JobBtn`}>
                        {task?.job_num ? task?.job_num : "N/A"}
                      </div>
                    </div>
                    <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                    <div className="d-flex w-100 align-items-center gap-2 justify-content-end" style={{maxWidth:'375px'}}>
                        <div  style={{flex:'1',maxWidth:'100px'}} className={`centerText statusBtn m-0 ${task?.status}`}>
                          {task?.status ? task?.status : "N/A"}
                        </div>
                        <div style={{flex:'1'}}  className="text-center centerText">
                          {formatDate(task?.due_date)}
                        </div>
                        <div style={{flex:'1'}}  className="text-center centerText">
                          {moment(task?.due_date)
                            .local()
                            .isBefore(moment(), "day")
                            ? 0
                            : moment(task?.due_date)
                                .local()
                                .diff(moment(), "days")}{" "}
                          days
                        </div>
                    </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewTaskPage;
