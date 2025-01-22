import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AddIcon,
  BellIcon,
  CloseIcon,
  NewFilterIcon,
  Search,
} from "../../assets/svg";
import "./Jobs.scss";
import {
  createJobs,
  createTask,
  deleteJob,
  deleteJobs,
  deleteTask,
  getJobs,
  getJobsByFilter,
  getJobsNum,
  getUserByRole,
  updateJobs,
  updateTask,
} from "../../services/auth";
import { Bars } from "react-loader-spinner";
import { toast } from "react-toastify";
import moment from "moment";
import Filter from "../../Components/Filter/Filter";
import JobModal, {
  CreateTaskModal,
  NewJobModal,
  NewTaskModal,
  UpdateTaskModal,
} from "../../Components/JobModal/Edit/JobModal";
import { StatusList } from "../../helper";
import Add from "../../Components/JobModal/Add/Add";
import { useLocation } from "react-router-dom";
import { NotificationComponent } from "../../Components/navMenu";
import { Calendar } from "react-date-range";

const Jobs = () => {
  const containerRef = useRef(null);
  const filterRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef(null);
  const addJobRowRefLeft = useRef(null);
  const addJobRowRefRight = useRef(null);
  const newJobIdInputRefs = useRef([]);
  const taskMobileScrollRef = useRef(null);
  const tableActiveRowLeftRef = useRef(null);
  const tableActiveRowRightRef = useRef(null);

  const location = useLocation();

  const [filteredJobs, setFilteredJobs] = useState("");
  const [originalJobs, setOriginalJobs] = useState("");
  const [searchedInput, setSearchedInput] = useState("");
  const [newJobActiveBoxLeft, setNewJobActiveBoxLeft] = useState("");
  const [newJobActiveBoxRight, setNewJobActiveBoxRight] = useState("");
  const [addJobName, setAddJobName] = useState("");
  const [selectNewJobStatus, setSelectNewJobStatus] = useState("");
  const [editedValue, setEditedValue] = useState("");
  const [activeJobField, setActiveJobField] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showAddJoRow, setShowAddJobRow] = useState(false);
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [newJobIdFilled, setNewJobIdFilled] = useState(false);
  const [newJobIdExist, setNewJobIdExist] = useState(false);
  const [addJobNameBoxAdded, setAddJobNameAdded] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showNewJobAddTaskModal, setShowNewJobAddTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [storageUpdated, setStorageUpdated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reloadTabs, setReloadTabs] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [newJobCollaboratorsList, setNewJobCollaboratorsList] = useState([]);
  const [newJobCollaboratorsListId, setNewJobCollaboratorsListId] = useState(
    []
  );
  const [usersList, setUsersList] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [pageUrls, setPageUrls] = useState([]);

  const [newJobIdNumber, setNewJobIdNumber] = useState(Number("00000"));
  const [currentPage, setCurrentPage] = useState(1);
  const [loadMorePage, setLoadMorePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [newJobId, setNewJobId] = useState(["", "", "", "", ""]);
  const [getJob, setGetJob] = useState({
    data: {},
    stage: "",
  });

  const [activeJob, setActiveJob] = useState(null);
  const [activeTaskJob, setActiveTaskJob] = useState(null);
  const [activeTaskJobId, setActiveTaskJobId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [updateJobId, setUpdateJobId] = useState(null);

  const [selectedNewJobDueDate, setSelectedNewJobDueDate] = useState(null);
  const [editedJobDueDate, setEditedJobDueDate] = useState(null);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "notifications") {
        const updatedNotifications = JSON.parse(event.newValue);
        setNotifications(updatedNotifications);
        console.log(updatedNotifications, "updatedNotifications");
        setStorageUpdated(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const checkNotifications = () => {
      const existingNotificationsJSON = localStorage.getItem("notifications");
      if (existingNotificationsJSON) {
        setNotifications(JSON.parse(existingNotificationsJSON));
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [storageUpdated]);

  const handleNewJobIdChange = async (e, index) => {
    setNewJobIdExist(false);
    var value = e.target.value;
    // Only process if the value is a number (and not empty)
    if (isNaN(value) && value !== "") {
      return; // Do nothing if the entered value is not a number and it's not empty
    }
    const newOtp = [...newJobId];
    newOtp[index] = e.target.value.slice(0, 1);
    setNewJobId(newOtp);

    if (newOtp[index] !== "" && index < 4) {
      newJobIdInputRefs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      const target = newOtp.join("");
      const exists = await getJobsNum(target);

      if (exists.res.exists) {
        setNewJobIdExist(true);
        toast.error(
          <>
            <div>
              <h3>Job ID already exists!</h3>
            </div>
            <p>
              Please choose another jobs ID. Entered Job ID already has been
              assigned to another job.
            </p>
          </>
        );
        return;
      } else {
        setNewJobIdNumber(Number(target));
        setNewJobIdFilled(true);
      }
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && newJobId[index] === "") {
      setNewJobIdExist(false);
      if (index > 0) {
        newJobIdInputRefs.current[index - 1].focus();
      }
    }
  };

  const handleRemoveNotification = (notificationToRemove) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification !== notificationToRemove
      )
    );
    const updatedNotifications = notifications.filter(
      (notification) => notification !== notificationToRemove
    );
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  useEffect(() => {
    if (showJobModal && taskMobileScrollRef.current) {
      handleTScroll();
    }
  }, [showJobModal]);

  useEffect(() => {
    if (location.state === 1) {
      setShowAddModal(true);
    }
  }, [location]);

  const handleTScroll = () => {
    if (taskMobileScrollRef.current) {
      taskMobileScrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const { state } = location;
  useEffect(() => {
    if (state) {
      localStorage.setItem("jobId", state?.id);
      setShowJobModal(true);
      setGetJob({
        data: state,
        stage: findNearestStage(state),
      });
    }
    fetchJobs();
  }, [location]);

  const handleApply = async () => {
    let filterString = `title=${searchedInput}`;

    setLoading(true);
    try {
      const response = await getJobsByFilter(filterString);
      if (!response.error) {
        setFilteredJobs(response?.res?.data);
        setOriginalJobs(response?.res?.data);
        // console.log(response?.res?.data);
      }
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (url) => {
    const pageNumber = parseInt(url.match(/page=(\d+)/)[1]);
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    let handler = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
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
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // Function to extract users from stages
  function extractUsersFromStages(data) {
    if (!data) return;
    let usersArray;
    data?.forEach((project) => {
      usersArray = [];
      project.stages?.forEach((stage) => {
        stage.tasks?.forEach((task) => {
          if (task.users) usersArray.push(...task.users);
        });
      });
      project.usersArray = usersArray;
    });
  }

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJobs(currentPage);
      const data = res?.res?.data || [];
  
      // Update jobs state
      setFilteredJobs(data);
      setOriginalJobs(data);
  
      // Select the current job
      const selectedJob = data.find(
        (item) => item?.id === getJob?.data?.id || item?.id === state?.id
      );
  
      if (selectedJob) {
        setGetJob({
          data: selectedJob,
          stage: findNearestStage(selectedJob),
        });
      }
  
      // Extract users and update pagination data
      if (data.length > 0) {
        extractUsersFromStages(data);
        setTotalPages(res?.res?.last_page || 0);
        setPageUrls(res?.res?.links?.slice(1, -1) || []);
        setReloadTabs((prevReload) => !prevReload);
      }
    } catch (error) {
      console.error("Error while fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, getJob?.data?.id, state?.id]);
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleScroll = useCallback(async() => {
    console.log("handleScroll called");
    const container = containerRef.current;
    if (!container) return;

    // Check if the container has been scrolled to the bottom
    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
        setLoading(true);
        try {
          const res = await getJobs(loadMorePage + 1);
          const data = res?.res?.data;
            setFilteredJobs((prevJobs) => [
              ...prevJobs,
              ...data 
              ]);
        } catch (error) {
          console.log("error while fetching jobs", error);
        } finally {
          setLoading(false);
        }
        setLoadMorePage(loadMorePage + 1);
    }
  }, [loadMorePage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);


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

  const handleCheckBoxSelect = (e, id) => {
    const { checked } = e.target;
    if (checked) {
      setSelectedJobs((prevIds) => [...prevIds, id]);
    } else {
      setSelectedJobs((prevIds) =>
        prevIds.filter((selectedId) => selectedId !== id)
      );
    }
  };

  // const handleDelete = async () => {
  //   if (!selectedJobs.length) {
  //     toast.error(
  //       <>
  //         <div>
  //           <h3>Trouble Deleting Jobs?</h3>
  //         </div>
  //         <p>
  //           Please choose the jobs you want to delete. Currently, no jobs have
  //           been selected for deletion.
  //         </p>
  //       </>
  //     );
  //     return;
  //   }
  //   try {
  //     setLoading(true);
  //     let response = await deleteJobs({
  //       ids: selectedJobs,
  //     });
  //     console.log("jobs delete successful", response);
  //     if (response.res) {
  //       const notificationData = {
  //         class: "success",
  //         message: response.res.message,
  //       };
  //       const existingNotificationsJSON = localStorage.getItem("notifications");
  //       let existingNotifications = [];
  //       if (existingNotificationsJSON) {
  //         existingNotifications = JSON.parse(existingNotificationsJSON);
  //       }
  //       existingNotifications.push(notificationData);

  //       localStorage.setItem(
  //         "notifications",
  //         JSON.stringify(existingNotifications)
  //       );

  //       toast.success(`${response.res.message}`);
  //     } else {
  //       console.error("jobs delete failed:", response.error);
  //       const notificationData = {
  //         class: "error",
  //         message: response.error.message,
  //       };
  //       const existingNotificationsJSON = localStorage.getItem("notifications");
  //       let existingNotifications = [];
  //       if (existingNotificationsJSON) {
  //         existingNotifications = JSON.parse(existingNotificationsJSON);
  //       }
  //       existingNotifications.push(notificationData);

  //       localStorage.setItem(
  //         "notifications",
  //         JSON.stringify(existingNotifications)
  //       );

  //       toast.error(`${response.error.message}`);
  //     }
  //   } catch (error) {
  //     console.error("There was an error:", error);
  //   } finally {
  //     setLoading(false);
  //     fetchJobs();
  //     setSelectedJobs([]);
  //   }
  // };

  useEffect(() => {
    const bodyScroll = document.getElementById("rightSCroll");
    if (showJobModal || showNewJobModal) {
      bodyScroll.style.overflow = "hidden";
    } else {
      bodyScroll.style.overflow = "auto";
    }

    return () => {
      bodyScroll.style.overflow = "auto";
    };
  }, [showJobModal, showNewJobModal]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(2);

    return `${day}/${month}/${year}`;
  };

  const handleFocus = () => {
    if (newJobActiveBoxLeft !== "jobName") {
      setNewJobActiveBoxLeft("jobName");
      setNewJobActiveBoxRight("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (addJobName === "") {
        return;
      } else {
        setAddJobNameAdded(true);
        setNewJobActiveBoxLeft("");
        setNewJobActiveBoxRight("");
      }
    }
  };

  const handleCancelAddJob = () => {
    setShowAddJobRow(false);
    setNewJobId(["", "", "", "", ""]);
    setNewJobIdNumber(Number("00000"));
    setNewJobIdFilled(false);
    setAddJobNameAdded(false);
    setNewJobActiveBoxLeft("");
    setNewJobActiveBoxRight("");
    setAddJobName("");
    setNewJobCollaboratorsList([]);
    setSelectNewJobStatus("");
    setSelectedNewJobDueDate(null);
    setNewJobCollaboratorsListId([]);
  };

  useEffect(() => {
    const handleAddNewJob = async () => {
      try {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const day = String(new Date().getDate()).padStart(2, "0");
        let formattedDueDate = `${year}-${month}-${day}`;
        const reqBody = {
          job_num: newJobIdNumber,
          title: addJobName,
          collaborators: newJobCollaboratorsListId,
          due_date: selectedNewJobDueDate || formattedDueDate,
          status: selectNewJobStatus || "",
        };

        console.log("reqBody", reqBody);

        // API call to create job
        const response = await createJobs(reqBody);
        console.log("request body for create job", response);

        if (response?.res?.message) {
          console.log(`${response.res.message}`);
        } else {
          toast.error(`${response?.error?.message || "Error occurred"}`);
        }
      } catch (error) {
        console.log("error in updating jobs", error);
      } finally {
        fetchJobs(); // Ensure this fetches the latest jobs
        handleCancelAddJob(); // Reset state after action
      }
    };

    const handleClickOutside = (event) => {
      if (
        addJobRowRefLeft.current &&
        !addJobRowRefLeft.current.contains(event.target) &&
        addJobRowRefRight.current &&
        !addJobRowRefRight.current.contains(event.target)
      ) {
        if (newJobIdNumber === 0 || !addJobName) {
          handleCancelAddJob();
        } else {
          setFilteredJobs((prevJobs) => [
            {
              job_num: newJobIdNumber,
              title: addJobName,
              collaborators: newJobCollaboratorsList,
              due_date: selectedNewJobDueDate || "",
              status: selectNewJobStatus || "",
            },
            ...prevJobs,
          ]);
          handleAddNewJob();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    addJobName,
    newJobCollaboratorsList,
    newJobIdNumber,
    newJobCollaboratorsListId,
    selectedNewJobDueDate,
    selectNewJobStatus,
    fetchJobs,
  ]);

  useEffect(() => {
    const handleAddNewJob = async () => {
      try {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const day = String(new Date().getDate()).padStart(2, "0");
        let formattedDueDate = `${year}-${month}-${day}`;
        const reqBody = {
          job_num: newJobIdNumber,
          title: addJobName,
          collaborators: newJobCollaboratorsListId,
          due_date: selectedNewJobDueDate || formattedDueDate,
          status: selectNewJobStatus || "",
        };

        console.log("reqBody", reqBody);

        // API call to create job
        const response = await createJobs(reqBody);
        console.log("request body for create job", response);

        if (response?.res?.message) {
          console.log(`${response.res.message}`);
        } else {
          toast.error(`${response?.error?.message || "Error occurred"}`);
        }
      } catch (error) {
        console.log("error in updating jobs", error);
      } finally {
        handleCancelAddJob(); // Reset state after action
      }
    };
    const handleDoubleClick = (event) => {
      if (
        addJobRowRefLeft.current &&
        addJobRowRefLeft.current.contains(event.target)
      ) {
        if (newJobIdNumber === 0 || !addJobName) {
          return;
        } else {
          setFilteredJobs((prevJobs) => [
            {
              job_num: newJobIdNumber,
              title: addJobName,
              collaborators: newJobCollaboratorsListId,
              due_date: selectedNewJobDueDate || "",
              status: selectNewJobStatus || "",
            },
            ...prevJobs,
          ]);
          handleAddNewJob();
          setShowNewJobModal(true);
        }
      }
      if (
        addJobRowRefRight.current &&
        addJobRowRefRight.current.contains(event.target)
      ) {
        if (newJobIdNumber === 0 || !addJobName) {
          return;
        } else {
          setFilteredJobs((prevJobs) => [
            {
              job_num: newJobIdNumber,
              title: addJobName,
              collaborators: newJobCollaboratorsListId,
              due_date: selectedNewJobDueDate || "",
              status: selectNewJobStatus || "",
            },
            ...prevJobs,
          ]);
          handleAddNewJob();
          setShowNewJobModal(true);
        }
      }
    };

    document.addEventListener("dblclick", handleDoubleClick);

    return () => {
      document.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [
    addJobName,
    fetchJobs,
    newJobCollaboratorsListId,
    newJobIdNumber,
    selectNewJobStatus,
    selectedNewJobDueDate,
    tableActiveRowLeftRef,
    tableActiveRowRightRef,
  ]);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) => [...prevList, user]);
    setUsersList((prevList) => prevList.filter((u) => u.email !== user.email));
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id
          ? { ...job, collaborators: [...(job.collaborators || []), user] }
          : job
      )
    );
    setNewJobCollaboratorsListId((prevList) => [...prevList, user.id]);
  };

  const handleRemoveCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) =>
      prevList.filter((u) => u.email !== user.email)
    );
    setUsersList((prevList) => [...prevList, user]);
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id
          ? {
              ...job,
              collaborators: (job.collaborators || []).filter(
                (collaborator) => collaborator.email !== user.email
              ),
            }
          : job
      )
    );
    setNewJobCollaboratorsListId((prevList) =>
      prevList.filter((u) => u.id !== user.id)
    );
  };

  const handleSelectDueDate = (date) => {
    setNewJobActiveBoxLeft("");
    setNewJobActiveBoxRight("");
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setSelectedNewJobDueDate(formattedDueDate);
  };

  const handleTitleClick = async (job) => {
    setActiveJobField("Name");
    setEditedValue(job.title);
    if (activeJob?.id === job?.id) {
      return;
    }
    setActiveJob(job);
    setUpdateJobId(job.id);
  };

  const handleInputChange = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleUpdate();
      return;
    }
    setEditedValue(e.target.value);
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id ? { ...job, title: e.target.value } : job
      )
    );
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTitleUpdate();
    }
    return;
  };

  const handleCollaboratorClick = (job) => {
    setActiveJobField("Collaborators");
    setNewJobCollaboratorsList(job?.collaborators);
    if (activeJob?.id === job?.id) {
      return;
    }
    setActiveJob(job);
    setUpdateJobId(job.id);
  };

  const handleStatusClick = (job) => {
    setActiveJobField("Status");
    if (activeJob?.id === job?.id) {
      return;
    }
    setActiveJob(job);
    setUpdateJobId(job.id);
  };

  const handleAddTaskClick = (job) => {
    setActiveTaskJob(job);
    setShowAddTaskModal(true)
  };

  const handleStatusChange = (editedStatus) => {
    setActiveJobField("");
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id ? { ...job, status: editedStatus } : job
      )
    );
  };

  const handleDueDateClick = (job) => {
    setActiveJobField("DueDate");
    setEditedJobDueDate(new Date(job.due_date));
    if (activeJob?.id === job?.id) {
      return;
    }
    setActiveJob(job);
    setUpdateJobId(job.id);
  };

  const handleDueDateChange = (date) => {
    setActiveJobField("");
    setNewJobActiveBoxRight("");
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    let formattedDueDate = `${year}-${month}-${day}`;
    setEditedJobDueDate(formattedDueDate);

    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id
          ? { ...job, due_date: date.toISOString().split("T")[0] }
          : job
      )
    );
  };

  const handleTitleUpdate = () => {
    setActiveJobField("");
  };

  useEffect(() => {
    const handleUpdateJob = async (updatedJob) => {
      console.log("editedValue in handleUpdateJob", editedValue, updatedJob.id);
      try {
        const reqBody = {
          job_id: updatedJob.id,
          dataObj: {
            title: updatedJob.title,
            collaborators: newJobCollaboratorsListId,
            status: updatedJob.status,
            due_date: updatedJob.due_date,
          },
        };
        const response = await updateJobs(reqBody);
        if (!response.res) {
          console.error("jobs update failed:", response.error);
          const notificationData = {
            class: "error",
            message: response.error.message,
          };
          const existingNotificationsJSON =
            localStorage.getItem("notifications");
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
      }
    };
    const handleClickOutside = async (event) => {
      if (
        tableActiveRowLeftRef.current &&
        !tableActiveRowLeftRef.current.contains(event.target) &&
        tableActiveRowRightRef.current &&
        !tableActiveRowRightRef.current.contains(event.target)
      ) {
        const updatedJob = filteredJobs.find((job) => job.id === updateJobId);
        const originalJob = originalJobs.find((job) => job.id === updateJobId);

        console.log(
          "updatedJob -",
          updatedJob.title,
          updatedJob.collaborators,
          updatedJob.status,
          updatedJob.due_date
        );

        const isJobChanged = (updatedJob, originalJob) => {
          return (
            updatedJob.title !== originalJob.title ||
            updatedJob.collaborators !== originalJob.collaborators ||
            updatedJob.status !== originalJob.status ||
            updatedJob.due_date !== originalJob.due_date ||
            false
          );
        };
        console.log("isJobChanged -", isJobChanged(updatedJob, originalJob));
        if (isJobChanged(updatedJob, originalJob)) {
          handleUpdateJob(updatedJob);
        }
        if (!showNewJobModal) {
          setActiveJob(null);
          setNewJobCollaboratorsList([]);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    updateJobId,
    editedValue,
    activeJob,
    filteredJobs,
    originalJobs,
    newJobCollaboratorsListId,
    showNewJobModal,
  ]);

  useEffect(() => {
    const handleDoubleClick = (event) => {
      if (
        tableActiveRowLeftRef.current &&
        tableActiveRowLeftRef.current.contains(event.target)
      ) {
        setShowNewJobModal(true);
      }
      if (
        tableActiveRowRightRef.current &&
        tableActiveRowRightRef.current.contains(event.target)
      ) {
        setShowNewJobModal(true);
      }
    };

    document.addEventListener("dblclick", handleDoubleClick);

    return () => {
      document.removeEventListener("dblclick", handleDoubleClick);
    };
  }, []);

  useEffect(() => {
    if (activeJob === null) {
      setNewJobCollaboratorsListId([]);
    }
  }, [activeJob]);

  const handleUpdateJobDesc = async (jobId, updatedFields) => {
    try {
      const reqBody = {
        job_id: jobId,
        dataObj: {
          description: updatedFields,
        },
      };

      const response = await updateJobs(reqBody);

      if (!response.res) {
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
      const updatedJob = await response.json();
      console.log("Job updated successfully:", updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const toggleShowAllTasks = () => {
    setShowAllTasks((prev) => !prev);
  };

  const handleUpdateTask = async (newData, taskId ,newJobCollaboratorsList,stage) => {
    console.log(newData?.updatedTask?.title);

    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) => ({
        ...job,
        tasks: job.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                title: newData.updatedTask.title,
                due_date: newData.updatedTask.due_date,
                status: newData.updatedTask.status,
                description: newData.updatedTask.description,
                users: newJobCollaboratorsList,
                stage_id: stage.id,
              }
            : task
        ),
      }))
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

  const handleCreateTask = async (newData, taskId) => {
    console.log(newData?.newTask?.title);
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) => ({
        ...job,
        tasks: job.id === taskId 
          ? [
              ...job.tasks,
              {
                title: newData.newTask.title,
                due_date: newData.newTask.due_date,
                status: newData.newTask.status,
                description: newData.newTask.description,
              },
            ]
          : job.tasks,
      }))
    );
    setShowAddTaskModal(false);
    var response = await createTask(newData.newTask, taskId);
    if (response.res) {
      console.log("Task create successful", response.res);
    } else {
      console.error("Task create failed:", response.error);
      toast.error(response.error?.message || "Failed to add the task");
    }
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
            wrapperclassName=""
            visible={true}
          />
        </div>
      )}

      {showNewJobModal && (
        <NewJobModal
          job={activeJob}
          handleClose={async (isDeleting = false) => {
            setGetJob();
            setActiveJob(null);
            setShowNewJobModal(false);
            if (!isDeleting && activeJob) {
              await handleUpdateJobDesc(activeJob.id, activeJob.description);
            }
            if (isDeleting) {
              setFilteredJobs((prevJobs) =>
                prevJobs.filter((job) => job.id !== activeJob.id)
              );
            }
          }}
          fetchJobs={fetchJobs}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
          handleDelete={() => {
            setFilteredJobs((prevJobs) =>
              prevJobs.filter((job) => job.id !== activeJob.id)
            );
            setIsDeleting(true);
          }}
        />
      )}

      {showAddTaskModal && (
        <CreateTaskModal
          task={activeTaskJob}
          handleClose={async () => {
            setGetJob();
            setShowAddTaskModal(false);
          }}
          fetchJobs={fetchJobs}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
          onCreateTask={handleCreateTask}
          handleDelete={() => {
            setFilteredJobs((prevJobs) =>
              prevJobs.map((job) => ({
                ...job,
                tasks: job.tasks.filter((task) => task.id !== activeTask.id),
              }))
            );
            setShowAddTaskModal(false);
          }}
        />
      )}

      {showUpdateTaskModal && (
        <UpdateTaskModal
          task={activeTask}
          handleClose={async () => {
            setGetJob();
            setShowUpdateTaskModal(false);
          }}
          fetchJobs={fetchJobs}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
          onUpdateTask={handleUpdateTask}
          handleDelete={() => {
            setFilteredJobs((prevJobs) =>
              prevJobs.map((job) => ({
                ...job,
                tasks: job.tasks.filter((task) => task.id !== activeTask.id),
              }))
            );
            handleTaskDelete(activeTask);
            setShowUpdateTaskModal(false);
          }}
        />
      )}

      {showJobModal && (
        <JobModal
          job={getJob.data}
          stage={getJob.stage}
          handleClose={() => {
            setGetJob();
            setActiveJob(null);
            setShowJobModal(false);
          }}
          fetchJobs={fetchJobs}
          usersLists={getJob?.data?.usersArray}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
        />
      )}

      {showAddModal && (
        <Add
          fetchJobs={fetchJobs}
          handleClose={() => {
            setShowAddModal(false);
          }}
        />
      )}

      <div className="jobsBg">
        <div
          className="JobsHeading position-relative d-flex justify-content-between align-items-center gap-3 flex-wrap"
          style={{ zIndex: "2" }}
        >
          <div className="d-flex gap-3 flex-wrap leftGap align-items-center">
            <h2>Jobs</h2>
            <div className="navSearchDiv jobSearchDiv jobSearchBar">
              <form>
                <div className="searchBox">
                  <div className="IconBox">
                    <Search />
                  </div>
                  <input
                    name="search"
                    placeholder="Search"
                    value={searchedInput}
                    onChange={(e) => setSearchedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                  />
                  {searchedInput !== "" && (
                    <div
                      className="IconBox"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSearchedInput("")}
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
                <Filter
                  setFilteredJobs={setFilteredJobs}
                  setLoading={setLoading}
                  closeFilter={() => setShowFilter(false)}
                />
              )}
            </div>
          </div>
          <div className="d-flex gap-3 flex-wrap align-items-center">
            <div className="addjobs addJobsMobile" style={{ gap: "16px" }}>
              <div
                className="d-flex align-items-center"
                style={{ gap: "8px", cursor: "pointer" }}
                onClick={() => setShowAddJobRow(true)}
              >
                <div className={`addJobIcon ${showAddJoRow && "active"}`}>
                  <AddIcon />
                </div>
                <span>Add Job</span>
              </div>
              <div
                className="d-flex align-items-center"
                style={{ gap: "8px", cursor: "pointer" }}
                onClick={() => setNotificationDropDown(!notificationDropDown)}
              >
                <div className="notifyIcon notificationWhite mx-0">
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
                              {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                  <NotificationComponent
                                    key={index}
                                    notificationData={notification}
                                    onRemove={handleRemoveNotification}
                                  />
                                ))
                              ) : (
                                <div className="notificationClass info-class">
                                  <div className="notificationMsg">
                                    <div className="notificationIcon"></div>
                                    <div className="notificationText">
                                      No Notifications
                                    </div>
                                  </div>
                                  <div
                                    className="notificationCloseBtn"
                                    onClick={() =>
                                      setNotificationDropDown(false)
                                    }
                                  ></div>
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
              <div className="delete-item">Showing All Jobs</div>
            </div>
          </div>
        </div>
        <div className="pagination-container">
          <div className="JobsContainer desktop" ref={containerRef} style={{ overflowY: "auto", maxHeight: "calc(100vh - 175px" }}>
            <div className="left-side">
              <div className="first-table">
                <div className="job_table_outer_div  ">
                  <table className="table table-borderless text-light">
                    <thead>
                      <tr>
                        <th scope="col">
                          <div className="headerDiv">Job No.</div>
                        </th>
                        <th scope="col">
                          <div className="headerDiv">Job Name</div>
                        </th>
                        <th scope="col">
                          <div className="headerDiv">Collaborators</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {showAddJoRow && (
                        <tr className="addNewJobRow" ref={addJobRowRefLeft}>
                          <td
                            className={`text-center clickBox ${
                              newJobActiveBoxLeft === "jobId" && "active"
                            }`}
                          >
                            {newJobActiveBoxLeft !== "jobId" ? (
                              newJobIdFilled ? (
                                <span
                                  className={`jobNoBtn `}
                                  onClick={() => {
                                    setNewJobIdFilled(false);
                                    setNewJobActiveBoxLeft("jobId");
                                  }}
                                >
                                  {newJobIdNumber}
                                </span>
                              ) : (
                                <div
                                  className={`clickBoxtext`}
                                  onClick={() =>
                                    setNewJobActiveBoxLeft("jobId")
                                  }
                                >
                                  Enter Job No.
                                </div>
                              )
                            ) : newJobIdFilled ? (
                              <span
                                className={`jobNoBtn `}
                                onClick={() => {
                                  setNewJobIdFilled(false);
                                  setNewJobActiveBoxLeft("jobId");
                                }}
                              >
                                {newJobIdNumber}
                              </span>
                            ) : (
                              <div className="addJobNoBoxInputs">
                                {/* Render 5 input fields for OTP */}
                                {newJobId.map((digit, index) => (
                                  <>
                                    <input
                                      ref={(el) =>
                                        (newJobIdInputRefs.current[index] = el)
                                      }
                                      key={index}
                                      type="text"
                                      value={digit}
                                      placeholder="0"
                                      onChange={(e) =>
                                        handleNewJobIdChange(e, index)
                                      }
                                      onKeyDown={(e) =>
                                        handleBackspace(e, index)
                                      }
                                      maxLength="1"
                                    />
                                    {index === 1 && "-"}
                                  </>
                                ))}
                              </div>
                            )}
                          </td>
                          <td
                            className={`px-3 clickBox ${
                              newJobActiveBoxLeft === "jobName" && "active"
                            }`}
                          >
                            {addJobNameBoxAdded ? (
                              <div className={`newJobHeading`}>
                                {addJobName}
                              </div>
                            ) : (
                              <input
                                className="clickBoxInput"
                                placeholder="Enter Job Name"
                                type="text"
                                value={addJobName}
                                onChange={(e) => setAddJobName(e.target.value)}
                                onFocus={handleFocus}
                                onKeyDown={handleKeyDown}
                              />
                            )}
                          </td>
                          <td
                            className={`text-center clickBox ${
                              newJobActiveBoxLeft === "AddCollaborators" &&
                              "active"
                            }`}
                          >
                            <div
                              className="collaboratorsBox"
                              onClick={() => {
                                setNewJobActiveBoxLeft("AddCollaborators");
                                setNewJobActiveBoxRight("");
                              }}
                            >
                              <div className=" d-flex align-items-center justify-content-center">
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
                                              cursor: "pointer",
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
                                          zIndex: 4,
                                        }}
                                      >
                                        +{newJobCollaboratorsList.length - 3}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {newJobCollaboratorsList.length === 0 && (
                              <div
                                className={`clickBoxtext`}
                                onClick={() => {
                                  setNewJobActiveBoxLeft("AddCollaborators");
                                  setNewJobActiveBoxRight("");
                                }}
                              >
                                Add Collaborators
                              </div>
                            )}
                            {newJobActiveBoxLeft === "AddCollaborators" && (
                              <div className={`newJobItemDropBox`}>
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
                          </td>
                        </tr>
                      )}
                      {filteredJobs && filteredJobs?.length > 0 ? (
                        filteredJobs?.map((job, index) => (
                          <tr
                            ref={(el) => {
                              if (activeJob && activeJob.id === job.id) {
                                tableActiveRowLeftRef.current = el;
                              }
                            }}
                            key={index}
                            className={`addNewJobRow tableEntries ${
                              showAddJoRow && "disabled"
                            } ${
                              activeJob
                                ? activeJob?.id === job.id
                                  ? "active"
                                  : "disabled"
                                : ""
                            }`}
                          >
                            <td className="text-center">
                              <span className={`jobNoBtn`}>{job.id}</span>
                            </td>
                            <td className={`px-3 clickBox jobName`}>
                              {activeJob?.id === job.id &&
                              activeJobField === "Name" ? (
                                <input
                                  className="clickBoxInput"
                                  placeholder="Enter Job Name"
                                  type="text"
                                  value={editedValue}
                                  onChange={handleInputChange}
                                  onKeyDown={handleTitleKeyDown}
                                  onBlur={handleTitleUpdate}
                                  autoFocus
                                />
                              ) : (
                                <div
                                  className="job-name"
                                  onClick={() => handleTitleClick(job)}
                                >
                                  <h4>{job.title}</h4>
                                </div>
                              )}
                            </td>
                            <td className={`text-center clickBox`}>
                              <div
                                className="collaboratorsBox"
                                onClick={() => handleCollaboratorClick(job)}
                              >
                                <div className=" d-flex align-items-center justify-content-center">
                                  {job?.collaborators?.length > 0 && (
                                    <>
                                      {job?.collaborators
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

                                      {job?.collaborators?.length > 3 && (
                                        <div
                                          className={`collaboratorsBoxUser`}
                                          style={{
                                            minWidth: "40px",
                                            zIndex: index,
                                          }}
                                        >
                                          +{job?.collaborators.length - 3}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {job.collaborators?.length === 0 && (
                                    <div
                                      className="collaboratorsBoxUser disabled m-0"
                                      style={{ minWidth: "40px" }}
                                    >
                                      N/A
                                    </div>
                                  )}
                                </div>
                              </div>
                              {activeJob?.id === job.id &&
                                activeJobField === "Collaborators" && (
                                  <div className={`newJobItemDropBox`}>
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
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center">
                            <span className={`jobNoBtn btn_`}>
                              No Results Found
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="right-side">
              <div className="first-table">
                <div className="table-responsive right-side-table">
                  <div className="job_table_outer_div">
                    <table className="table table-borderless text-light">
                      <thead>
                        <tr>
                          <th scope="col">
                            <div className="headerDiv">Status</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Due Date</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Days Left</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv text-start">Tasks</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">
                              Client Last Contacted
                            </div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Comments</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {showAddJoRow && (
                          <tr className="addNewJobRow" ref={addJobRowRefRight}>
                            <td
                              className={`text-center clickBox ${
                                newJobActiveBoxRight === "SelectStatus" &&
                                "active"
                              }`}
                            >
                              <div
                                className={`clickBoxtext`}
                                onClick={() => {
                                  setNewJobActiveBoxRight("SelectStatus");
                                  setNewJobActiveBoxLeft("");
                                }}
                              >
                                {selectNewJobStatus ? (
                                  <div
                                    className={`statusBox ${selectNewJobStatus.replace(
                                      /\s+/g,
                                      ""
                                    )}`}
                                  >
                                    {selectNewJobStatus}
                                  </div>
                                ) : (
                                  "Select Status"
                                )}
                              </div>
                              {newJobActiveBoxRight === "SelectStatus" && (
                                <div className={`newJobItemDropBox`}>
                                  <div
                                    className="selectCollaboratorsBox"
                                    onClick={() => {
                                      setNewJobActiveBoxRight("");
                                      setSelectNewJobStatus("not-started");
                                    }}
                                  >
                                    <div className={`statusBox NotStarted`}>
                                      Not Started
                                    </div>
                                  </div>
                                  <div
                                    className="selectCollaboratorsBox"
                                    onClick={() => {
                                      setNewJobActiveBoxRight("");
                                      setSelectNewJobStatus("pending");
                                    }}
                                  >
                                    <div className="statusBox Pending">
                                      Pending
                                    </div>
                                  </div>
                                  <div
                                    className="selectCollaboratorsBox"
                                    onClick={() => {
                                      setNewJobActiveBoxRight("");
                                      setSelectNewJobStatus("in-progress");
                                    }}
                                  >
                                    <div className="statusBox InProgress">
                                      In Progress
                                    </div>
                                  </div>
                                  <div
                                    className="selectCollaboratorsBox"
                                    onClick={() => {
                                      setNewJobActiveBoxRight("");
                                      setSelectNewJobStatus("on-hold");
                                    }}
                                  >
                                    <div className="statusBox OnHold">
                                      On Hold
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td
                              className={`text-center clickBox ${
                                newJobActiveBoxRight === "SetDueDate" &&
                                "active"
                              }`}
                            >
                              <div
                                className={`clickBoxtext`}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setNewJobActiveBoxRight("SetDueDate");
                                  setNewJobActiveBoxLeft("");
                                }}
                              >
                                {selectedNewJobDueDate ? (
                                  <span style={{ color: "#fff" }}>
                                    {selectedNewJobDueDate}
                                  </span>
                                ) : (
                                  "Set Due Date"
                                )}
                              </div>
                              {newJobActiveBoxRight === "SetDueDate" && (
                                <div className="datePickerDiv">
                                  <Calendar
                                    date={selectedNewJobDueDate}
                                    onChange={handleSelectDueDate}
                                    value={selectedNewJobDueDate}
                                    calendarType="ISO 8601"
                                    minDate={new Date()}
                                    rangeColors={["#E2E31F"]}
                                  />
                                </div>
                              )}
                            </td>
                            <td className="text-center">
                              {selectedNewJobDueDate &&
                              Math.floor(
                                (new Date(selectedNewJobDueDate) - new Date()) /
                                  (1000 * 60 * 60 * 24)
                              ) > 0
                                ? Math.floor(
                                    (new Date(selectedNewJobDueDate) -
                                      new Date()) /
                                      (1000 * 60 * 60 * 24)
                                  ) + " days"
                                : "0 days"}
                            </td>
                            <td
                              className={`px-3 clickBox ${
                                newJobActiveBoxRight === "AddTask" && "active"
                              }`}
                            >
                              <div
                                className={`clickBoxtext disabled`}
                                onClick={() => {
                                  setNewJobActiveBoxRight("AddTask");
                                  setNewJobActiveBoxLeft("");
                                }}
                              >
                                Add Tasks
                              </div>
                            </td>
                            <td className="text-center "></td>
                            <td className="px-3">
                              <div className="jobDescriptionTextDiv"></div>
                            </td>
                          </tr>
                        )}
                        {filteredJobs &&
                          filteredJobs?.length > 0 &&
                          filteredJobs?.map((job) => (
                            <tr
                              ref={(el) => {
                                if (activeJob && activeJob.id === job.id) {
                                  tableActiveRowRightRef.current = el;
                                }
                              }}
                              key={job.id}
                              className={`addNewJobRow tableEntries ${
                                showAddJoRow && "disabled"
                              } ${
                                activeJob
                                  ? activeJob?.id === job.id
                                    ? "active"
                                    : "disabled"
                                  : ""
                              }`}
                            >
                              <td className={`text-center clickBox`}>
                                <span
                                  className={`statusBtn ${job.status}`}
                                  onClick={() => handleStatusClick(job)}
                                >
                                  {StatusList[job.status]}
                                </span>
                                {activeJob?.id === job.id &&
                                  activeJobField === "Status" && (
                                    <div className={`newJobItemDropBox`}>
                                      <div
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          handleStatusChange("not-started");
                                        }}
                                      >
                                        <div className={`statusBox NotStarted`}>
                                          Not Started
                                        </div>
                                      </div>
                                      <div
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          handleStatusChange("pending");
                                        }}
                                      >
                                        <div className="statusBox Pending">
                                          Pending
                                        </div>
                                      </div>
                                      <div
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          handleStatusChange("in-progress");
                                        }}
                                      >
                                        <div className="statusBox InProgress">
                                          In Progress
                                        </div>
                                      </div>
                                      <div
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          handleStatusChange("on-hold");
                                        }}
                                      >
                                        <div className="statusBox OnHold">
                                          On Hold
                                        </div>
                                      </div>
                                      <div
                                        className="selectCollaboratorsBox"
                                        onClick={() => {
                                          handleStatusChange("completed");
                                        }}
                                      >
                                        <div className="statusBox completed">
                                          Completed
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </td>
                              <td className={`text-center clickBox`}>
                                <div
                                  className={`clickBoxtext`}
                                  style={{ cursor: "pointer", color: "#fff" }}
                                  onClick={() => handleDueDateClick(job)}
                                >
                                  {moment(job.due_date).local().format("L")}
                                </div>
                                {activeJob?.id === job.id &&
                                  activeJobField === "DueDate" && (
                                    <div className="datePickerDiv">
                                      <Calendar
                                        date={editedJobDueDate}
                                        onChange={handleDueDateChange}
                                        value={editedJobDueDate}
                                        calendarType="ISO 8601"
                                        // minDate={new Date(job.due_date)}
                                        rangeColors={["#E2E31F"]}
                                      />
                                    </div>
                                  )}
                              </td>
                              <td className="text-center">
                                {moment(job.due_date)
                                  .local()
                                  .isBefore(moment(), "day")
                                  ? 0
                                  : moment(job.due_date)
                                      .local()
                                      .diff(moment(), "days")}{" "}
                                days
                              </td>
                              <td className="text-start">
                                <div
                                  className="d-flex align-items-center"
                                  style={{ gap: "8px" }}
                                >
                                  {job?.tasks?.length > 0 && (
                                    <>
                                      {job?.tasks
                                        .slice(
                                          0,
                                          showAllTasks ? job?.tasks.length : 3
                                        )
                                        .map((task, index) => {
                                          return (
                                            <span
                                              key={index}
                                              style={{ cursor: "pointer" }}
                                              className={`statusBtn mx-0 ${task.status}`}
                                              onClick={() => {
                                                setActiveTask(task);
                                                setShowUpdateTaskModal(true);
                                              }}
                                            >
                                              {task.title}
                                            </span>
                                          );
                                        })}
                                      {job?.tasks?.length > 3 && (
                                        <span
                                          className={`statusBtn clickBox mx-0 `}
                                          onClick={toggleShowAllTasks}
                                        >
                                          {showAllTasks
                                            ? "View Less"
                                            : "View More"}
                                        </span>
                                      )}
                                    </>
                                  )}
                                  <div className={`px-3 clickBox`}>
                                    <div
                                      className={`clickBoxtext`}
                                      // onClick={() => {
                                      //   setShowAddTaskModal(true);
                                      // }}
                                      onClick={() => handleAddTaskClick(job)}
                                    >
                                      Add Tasks
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center ">
                                {formatDate(job.latest_comment)}
                              </td>
                              <td className="px-3">
                                <div className="jobDescriptionTextDiv">
                                  {job.latest_update}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="JobsContainer mobile">
            <div className="left-side">
              <div className="first-table">
                <div className="job_table_outer_div  ">
                  <ul>
                    {filteredJobs && filteredJobs?.length > 0 ? (
                      filteredJobs?.map((job, index) => (
                        <li key={index}>
                          <div className="jobBox">
                            <div className="jobItem">
                              <div className="jobHeading">Select </div>
                              <div className="text-center">
                                {" "}
                                <label htmlFor={`select_${index}`}>
                                  <input
                                    type="checkbox"
                                    checked={selectedJobs.includes(job.id)}
                                    onChange={(e) =>
                                      handleCheckBoxSelect(e, job.id)
                                    }
                                    id={`select_${index}`}
                                    style={{ display: "none" }}
                                  />
                                  {selectedJobs.includes(job.id) ? (
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
                              </div>
                            </div>
                            <div
                              className="jobItem"
                              style={{ minHeight: "40px" }}
                            >
                              <div className="jobHeading">Job No.</div>
                              <div className="text-center">
                                <span
                                  className={`jobNoBtn btn_${findNearestStage(
                                    job
                                  )}`}
                                >
                                  {job.id}
                                </span>
                              </div>
                            </div>
                            <div className="jobItem align-items-start">
                              <div className="jobHeading">Job </div>
                              <div className="ps-3 text-end w-100">
                                <div className="job-name ms-auto">
                                  <h4
                                    style={{
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      localStorage.setItem("jobId", job.id);
                                      setShowJobModal(true);
                                      setGetJob({
                                        data: job,
                                        stage: findNearestStage(job),
                                      });
                                    }}
                                  >
                                    {job.title}
                                  </h4>
                                  <h6>{job.description}</h6>
                                </div>
                              </div>
                            </div>
                            <div className="jobItem">
                              <div className="jobHeading">Due/FUP On</div>
                              <div className="text-center">
                                {moment(job.due_date).local().format("L")}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-center">
                        <span className={`stageBtn btn_`}>
                          No Results Found
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="JobsHeading paginationDiv">
            <div className="paginationSections">
              <div className="btnDiv">
                <button
                  className="prevBtn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="prevBtn mobile"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
              </div>
              <div className="pageNoDiv">
                {pageUrls && currentPage >= 4 && (
                  <button disabled className="pageBtn pageDots">
                    ...
                  </button>
                )}
                {pageUrls &&
                  pageUrls
                    .filter(
                      (item, index) =>
                        Math.abs(index - currentPage + 1) <=
                        (currentPage < 3
                          ? 3
                          : currentPage > pageUrls.length - 2
                          ? 3
                          : 2)
                    )
                    .map((link, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(link.url)}
                        className={`${link.active && "activePageBtn"} pageBtn`}
                      >
                        {link.label}
                      </button>
                    ))}
                {pageUrls && currentPage <= pageUrls.length - 3 && (
                  <button disabled className="pageBtn pageDots">
                    ...
                  </button>
                )}
              </div>
              <div className="btnDiv">
                <button
                  className="nextBtn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button
                  className="nextBtn mobile"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  {">"}
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Jobs;
