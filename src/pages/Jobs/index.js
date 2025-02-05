import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AddIcon,
  ArrowRight,
  BellIcon,
  CloseIcon,
  FilterCrossIcon,
  NewFilterIcon,
  RightArrow,
  Search,
} from "../../assets/svg";
import "./Jobs.scss";
import {
  createJobs,
  createTask,
  deleteJob,
  deleteJobs,
  deleteTask,
  FilterJobs,
  getJobByNum,
  getJobs,
  getJobsByFilter,
  getJobsNum,
  getSingleJob,
  getUserByRole,
  SearchJobs,
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
  NewJobModalWithTasks,
  NewTaskModal,
  UpdateTaskModal,
} from "../../Components/JobModal/Edit/JobModal";
import { StatusList } from "../../helper";
import Add from "../../Components/JobModal/Add/Add";
import { Link, useLocation } from "react-router-dom";
import { NotificationComponent } from "../../Components/navMenu";
import { Calendar } from "react-date-range";
import ErrorToast from "../../Components/ErrorToast";
import TaggedUser from "../../Components/JobModal/Edit/TaggedUser";

const renderComment = (message) => {
  if (!message) return <p className="no-comment">No Comments</p>;
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
  return (
    <div className="latest-comment">
      <div className="msg">
        <p className="time">
          {" "}
          {moment(message.created_at).isBefore(moment().subtract(1, "hour"))
            ? moment(message.created_at).format("h:mm a") // Show time if more than 1 hour ago
            : moment(message.created_at)
                .fromNow()
                .replace("minute", "min")
                .replace("minutes", "mins")}
        </p>
        <span></span>
        <p className="name"> {message.user} :</p>
      </div>
      <p className="content">{renderMessage(message.body)}</p>
    </div>
  );
};

export const formatJobNumber = (jobNum) => {
  // Ensure jobNum is a number or a string
  const jobStr = jobNum?.toString();

  // Check if the job number has at least 5 digits for slicing
  if (jobStr && jobStr.length >= 5) {
    return `${jobStr.slice(0, 2)}-${jobStr.slice(-3)}`;
  } else {
    return jobStr;
  }
};
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
  const searchBarRef = useRef(null);

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
  const [selectSearchOptions, setSelectSearchOptions] = useState("");
  const [showingSearchOptions, setShowingSearchOptions] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [showAddJoRow, setShowAddJobRow] = useState(false);
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [newJobIdFilled, setNewJobIdFilled] = useState(false);
  const [newJobIdExist, setNewJobIdExist] = useState(false);
  const [addJobNameBoxAdded, setAddJobNameAdded] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showNewJobModalWithTasks, setShowNewJobModalWithTasks] =
    useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showNewJobAddTaskModal, setShowNewJobAddTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [storageUpdated, setStorageUpdated] = useState(false);
  const [reloadTabs, setReloadTabs] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [newJobCollaboratorsList, setNewJobCollaboratorsList] = useState([]);
  const [newJobCollaboratorsListId, setNewJobCollaboratorsListId] = useState(
    []
  );
  const [usersList, setUsersList] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [pageUrls, setPageUrls] = useState([]);
  const [filteredString, setFilteredString] = useState([]);
  const [filteredQuery, setFilteredQuery] = useState([]);

  const [newJobIdNumber, setNewJobIdNumber] = useState(Number("00000"));
  const [newJobIdNumberForNewTask, setNewJobIdNumberForNewTask] = useState(
    Number("00000")
  );
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
      console.log("exists", exists);
      if (exists.res?.exists) {
        setNewJobIdExist(true);
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
      setShowAddJobRow(true);
      handleAddJobScroll();
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
    if (state !== 1 && state?.id) {
      localStorage.setItem("jobId", state?.id);
      setShowJobModal(true);
      console.log("job id", filteredJobs, state?.id);
      setGetJob({
        data: state,
        stage: findNearestStage(state),
      });
    }
    fetchJobs();
  }, [location, state]);

  const handleSearchApply = async () => {
    setLoading(true);
    try {
      var reqData = {
        [selectSearchOptions]: searchedInput,
      };
      setShowingSearchOptions(searchedInput);
      const response = await SearchJobs(reqData);
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

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    // Check if the container has been scrolled to the bottom
    if (
      container.scrollTop + container.clientHeight >= container.scrollHeight &&
      filteredJobs.length >= 20
    ) {
      setLoading(true);
      try {
        const res = await getJobs(loadMorePage + 1);
        const data = res?.res?.data;
        setFilteredJobs((prevJobs) => [...prevJobs, ...data]);
      } catch (error) {
        console.log("error while fetching jobs", error);
      } finally {
        setLoading(false);
      }
      setLoadMorePage(loadMorePage + 1);
    }
  }, [loadMorePage, filteredJobs]);

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
    const year = date.getFullYear().toString();

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

  const handleNewAddTaskClick = () => {
    setNewJobIdNumberForNewTask(newJobIdNumber);
    setShowNewJobAddTaskModal(true);
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
        console.log("error in adding job", error);
      } finally {
        handleCancelAddJob();
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
          const formattedDueDate = new Date().toISOString().split("T")[0];
          setFilteredJobs((prevJobs) => [
            {
              job_num: newJobIdNumber,
              title: addJobName,
              collaborators: newJobCollaboratorsList,
              due_date: selectedNewJobDueDate || formattedDueDate,
              status: selectNewJobStatus || "",
            },
            ...prevJobs,
          ]);
          synchronizeRowHeights();
          setShowAddJobRow(false);
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
          synchronizeRowHeights();
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
              status: selectNewJobStatus || "not-started",
            },
            ...prevJobs,
          ]);
          synchronizeRowHeights();
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
    setTimeout(() => {
      setNewJobCollaboratorsList((prevList) => [...prevList, user]);
    }, 0);
    setUsersList((prevList) => prevList.filter((u) => u.id !== user.id));

    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id
          ? { ...job, collaborators: [...(job.collaborators || []), user] }
          : job
      )
    );
    setTimeout(() => {
      setNewJobCollaboratorsListId((prevList) => [...prevList, user.id]);
    }, 0);
  };

  const handleRemoveCollaborator = async (user) => {
    setTimeout(() => {
      setNewJobCollaboratorsList((prevList) =>
        prevList.filter((u) => u.id !== user.id)
      );
    }, 0);
    setTimeout(() => {
      setUsersList((prevList) => [user, ...prevList]);
    }, 0);
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
    setTimeout(() => {
      setNewJobCollaboratorsListId((prevList) =>
        prevList.filter((u) => u.id !== user.id)
      );
    }, 0);
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
      synchronizeRowHeights();
    }
    return;
  };

  const handleCollaboratorClick = (job) => {
    setActiveJobField("Collaborators");
    setNewJobCollaboratorsList(job?.collaborators);
    const CollaboratorsId = job?.collaborators?.map(
      (collaborator) => collaborator.id
    );
    setNewJobCollaboratorsListId(CollaboratorsId);

    setUsersList((prevList) =>
      prevList.filter((u) => !CollaboratorsId.includes(u.id))
    );

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
    setShowAddTaskModal(true);
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

    // Use UTC to avoid timezone shifts
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );

    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(utcDate.getUTCDate()).padStart(2, "0");

    // Format the date as YYYY-MM-DD
    let formattedDueDate = `${year}-${month}-${day}`;
    setEditedJobDueDate(formattedDueDate);

    // Update the due_date in the filteredJobs array
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id
          ? { ...job, due_date: utcDate.toISOString().split("T")[0] }
          : job
      )
    );
  };

  const handleTitleUpdate = () => {
    setActiveJobField("");
  };

  useEffect(() => {
    const handleUpdateJob = async (updatedJob) => {
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
        // fetchUsers();
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
          updatedJob,
          originalJob,
          !showNewJobModal || !showNewJobModalWithTasks
        );

        const isJobChanged = (updatedJob, originalJob) => {
          if (!updatedJob || !originalJob) {
            console.error(
              "isJobChanged called with undefined or null values:",
              { updatedJob, originalJob }
            );
            return false;
          }

          return (
            (updatedJob?.title || "") !== (originalJob?.title || "") ||
            (updatedJob?.collaborators || []) !==
              (originalJob?.collaborators || []) ||
            (updatedJob?.status || "") !== (originalJob?.status || "") ||
            (updatedJob?.due_date || null) !== (originalJob?.due_date || null)
          );
        };

        console.log("isJobChanged -", isJobChanged(updatedJob, originalJob));
        if (isJobChanged(updatedJob, originalJob)) {
          handleUpdateJob(updatedJob);
          synchronizeRowHeights();
        }
        if (!showNewJobModal && !showNewJobModalWithTasks) {
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
    showNewJobModalWithTasks,
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

  const handleUpdateJobDesc = async (jobId, updatedFields, tasks) => {
    try {
      const reqBody = {
        job_id: jobId,
        dataObj: {
          description: updatedFields,
          tasks: tasks,
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
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const toggleShowAllTasks = () => {
    setShowAllTasks((prev) => !prev);
  };

  const handleUpdateTask = async (
    newData,
    taskId,
    newJobCollaboratorsList,
    stage
  ) => {
    console.log(newData?.updatedTask?.title);
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) => ({
        ...job,
        tasks: job.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                title: newData?.updatedTask?.title,
                due_date: newData?.updatedTask?.due_date,
                status: newData?.updatedTask?.status,
                description: newData?.updatedTask?.description,
                users: newJobCollaboratorsList,
                stage_id: stage?.id,
                stage: stage,
              }
            : task
        ),
      }))
    );
    setShowUpdateTaskModal(false);
    var response = await updateTask(newData, taskId);
    if (response.res) {
      fetchJobs();
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
        tasks:
          job.id === taskId
            ? [
                {
                  title: newData.newTask.title,
                  due_date: newData.newTask.due_date,
                  status: newData.newTask.status,
                  description: newData.newTask.description,
                },
                ...job.tasks,
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

  const handleCheckTask = async (jobId, index) => {
    try {
      setLoading(true);
      const response = await getSingleJob(jobId);
      if (response.res) {
        setActiveTask(response.res.tasks[index]);
        var updatedTask = response.res.tasks[index];
        setFilteredJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.tasks.some((task) => task.id === updatedTask.id)
              ? {
                  ...job,
                  tasks: job.tasks.map((task) =>
                    task.id === updatedTask.id
                      ? {
                          ...task,
                          title: updatedTask?.title,
                        }
                      : task
                  ),
                }
              : job
          )
        );
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

  const synchronizeRowHeights = () => {
    const rightRows = document.querySelectorAll(".table_right tr");
    const leftRows = document.querySelectorAll(".table_left tr");
    const rightColumns = document.querySelectorAll(".table_right tr td");
    const leftColumns = document.querySelectorAll(".table_left tr td");

    if (rightRows.length !== leftRows.length) {
      console.error("Both tables must have the same number of rows.");
      return;
    }

    var maxHeight = 10;

    for (let i = 0; i < rightRows.length; i++) {
      const rightHeight = rightRows[i].offsetHeight;
      const leftHeight = leftRows[i].offsetHeight;

      maxHeight = Math.max(rightHeight, leftHeight);

      rightRows[i].style.height = `${maxHeight}px`;
      leftRows[i].style.height = `${maxHeight}px`;
    }
    for (let i = 0; i < rightColumns.length; i++) {
      rightColumns[i].style.height = `${maxHeight}px`;
    }
    for (let i = 0; i < leftColumns.length; i++) {
      leftColumns[i].style.height = `${maxHeight}px`;
    }
  };

  useEffect(() => {
    synchronizeRowHeights();
  }, [filteredJobs]);

  const handleAddJobScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleJobId = async (jobNum) => {
    try {
      const response = await getJobByNum(jobNum);
      if (response.res) {
        console.log(response.res);
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

  const handleAddNewJobWithTask = async (task) => {
    console.log("clicked", task);

    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) => ({
        ...job,
        tasks:
          job.job_num === task.job_num
            ? [...(job.tasks || []), task]
            : job.tasks,
      }))
    );
    setShowNewJobAddTaskModal(false);
    const jobToUpdate = await handleJobId(task.job_num);
    const taskToUpdate = { ...task, job_id: jobToUpdate?.id };
    var response = await createTask(taskToUpdate, jobToUpdate?.id);
    if (response.res) {
      console.log("Task create successful", response.res);
    } else {
      console.error("Task create failed:", response.error);
      toast.error(response.error?.message || "Failed to add the task");
    }
  };

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

  const [userColors, setUserColors] = useState({}); // To store colors for 'user' class elements

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
      collaborator_ids: filteredQuery.collaborator_ids?.filter(
        (id) => id !== value.value
      ),
      statuses: filteredQuery.statuses?.filter(
        (status) => status !== value.value
      ),
    };

    if (updatedQuery.collaborator_ids?.length === 0)
      delete updatedQuery.collaborator_ids;
    if (updatedQuery.statuses?.length === 0) delete updatedQuery.statuses;

    setFilteredQuery(updatedQuery);
    setFilteredString((prevFiltered) =>
      prevFiltered.filter((item) => item !== value)
    );

    try {
      setLoading(true);
      const response = await FilterJobs(updatedQuery);

      if (!response.error) {
        setFilteredJobs(response?.res?.data);
      }
    } catch (error) {
      console.error("Error in applying filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJobWithTask = async (job) => {
    setActiveJob(job);
    setUpdateJobId(job.id);
    setShowNewJobModalWithTasks(true);
  };

  const handleErrorToastClose = () => {
    console.log("handleErrorToastClose");
    setNewJobId(["", "", "", "", ""]);
    setNewJobIdExist(false);
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
          usersList={usersList}
          handleClose={async (isDeleting = false, description) => {
            setGetJob();
            setActiveJob(null);
            setShowNewJobModal(false);
            if (!isDeleting && activeJob) {
              await handleUpdateJobDesc(activeJob?.id, description);
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

      {showNewJobModalWithTasks && (
        <NewJobModalWithTasks
          usersList={usersList}
          job={activeJob}
          handleClose={async (isDeleting = false) => {
            setGetJob();
            setActiveJob(null);
            setShowNewJobModalWithTasks(false);
            if (!isDeleting && activeJob) {
              await handleUpdateJobDesc(
                activeJob.id,
                activeJob.description,
                activeJob.tasks
              );
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

      {showNewJobAddTaskModal && (
        <NewTaskModal
          usersList={usersList}
          jobNum={newJobIdNumberForNewTask}
          handleClose={async () => {
            setGetJob();
            setShowNewJobAddTaskModal(false);
          }}
          scrollRef={taskMobileScrollRef}
          onCreateTask={handleAddNewJobWithTask}
          handleDelete={() => {
            setShowNewJobAddTaskModal(false);
          }}
        />
      )}

      {showAddTaskModal && (
        <CreateTaskModal
          usersList={usersList}
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
          usersList={usersList}
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
        <NewJobModal
          job={getJob.data}
          usersList={usersList}
          handleClose={async (isDeleting = false, description) => {
            setGetJob();
            setActiveJob(null);
            setShowJobModal(false);
            if (!isDeleting && getJob?.data) {
              await handleUpdateJobDesc(getJob.data?.id, description);
            }
            if (isDeleting) {
              setFilteredJobs((prevJobs) =>
                prevJobs.filter((job) => job.id !== getJob?.data?.id)
              );
            }
          }}
          fetchJobs={fetchJobs}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
          handleDelete={() => {
            setFilteredJobs((prevJobs) =>
              prevJobs.filter((job) => job.id !== getJob?.data?.id)
            );
            setIsDeleting(true);
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
                <div
                  className="searchBox"
                  onClick={() => setShowSearchOptions(true)}
                  ref={searchBarRef}
                >
                  <div className="IconBox">
                    <Search />
                  </div>
                  {showSearchOptions ? (
                    <div className="SearchOptionBox">
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
                      <div
                        className={`searchOptionBtn ${
                          selectSearchOptions !== "title" &&
                          selectSearchOptions !== ""
                            ? "disable"
                            : selectSearchOptions !== ""
                            ? "active"
                            : ""
                        }`}
                        onClick={() => setSelectSearchOptions("title")}
                      >
                        Job Name
                      </div>
                      <div
                        className={`searchOptionBtn ${
                          selectSearchOptions !== "collaborator_name" &&
                          selectSearchOptions !== ""
                            ? "disable"
                            : selectSearchOptions !== ""
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectSearchOptions("collaborator_name")
                        }
                      >
                        Collaborator
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
                        fetchJobs();
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
                <Filter
                  setFilteredString={setFilteredString}
                  setFilteredQuery={setFilteredQuery}
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
                onClick={() => {
                  setShowAddJobRow(true);
                  handleAddJobScroll();
                }}
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
              <div className="delete-item d-flex align-items-center flex-wrap gap-2">
                {showingSearchOptions ? (
                  <>Search Results For: '{showingSearchOptions}'</>
                ) : selectSearchOptions ? (
                  <>
                    {selectSearchOptions === "job_num" && (
                      <>
                        Enter the number of the ‘Job’ you would like to search
                        for.
                      </>
                    )}
                    {selectSearchOptions === "title" && (
                      <>
                        Enter the name of the ‘Job’ you would like to search
                        for.
                      </>
                    )}
                    {selectSearchOptions === "collaborator_name" && (
                      <>
                        Enter the name of the ‘Collaborator’ you would like to
                        search for.
                      </>
                    )}
                    {!["job_num", "title", "collaborator_name"].includes(
                      selectSearchOptions
                    ) && (
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
                          : "currentColor";
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
                  "Showing All Jobs"
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="pagination-container">
          <div
            className="JobsContainer desktop"
            ref={containerRef}
            style={{ overflowY: "auto", maxHeight: "calc(100vh - 175px" }}
          >
            <div className="left-side">
              <div className="first-table">
                <div className="job_table_outer_div  ">
                  <table className="table table-borderless text-light">
                    <thead className="sticky-header">
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
                    <tbody className="table_left">
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
                              <div className="addJobNoBoxInputs position-relative">
                                {/* Render 5 input fields for OTP */}
                                {newJobId.map((digit, index) => (
                                  <>
                                    <input
                                      className={`${newJobIdExist && "error"}`}
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
                                {newJobIdExist && (
                                  <ErrorToast
                                    onClose={() => handleErrorToastClose()}
                                  />
                                )}
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
                            onClick={() => {
                              setNewJobActiveBoxLeft("AddCollaborators");
                              setNewJobActiveBoxRight("");
                            }}
                          >
                            <div className="collaboratorsBox">
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
                              <span className={`jobNoBtn`}>
                                {formatJobNumber(job?.job_num)}
                              </span>
                            </td>
                            <td
                              className={`px-3 clickBox jobName d-flex align-items-center justify-content-between`}
                              style={{ minHeight: "58px" }}
                            >
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
                                  style={{ flex: "1" }}
                                  onClick={() => handleTitleClick(job)}
                                >
                                  <h4>{job.title}</h4>
                                </div>
                              )}
                              <span
                                onClick={() => {
                                  setActiveJob(job);
                                  setShowNewJobModal(true);
                                }}
                              >
                                <ArrowRight />
                              </span>
                            </td>
                            <td
                              className={`text-center clickBox`}
                              onClick={() => handleCollaboratorClick(job)}
                            >
                              <div className="collaboratorsBox">
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
                      <thead className="">
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
                      <tbody className="table_right">
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
                                    style={{
                                      textTransform: "capitalize",
                                    }}
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
                                  if (newJobIdNumber !== 0 || addJobName) {
                                    handleNewAddTaskClick();
                                  } else {
                                    toast.error("Add Job First");
                                  }
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
                                  className={`statusBtn ${
                                    job.status != undefined
                                      ? job.status
                                      : "not-started"
                                  }`}
                                  onClick={() => handleStatusClick(job)}
                                >
                                  {job.status != undefined
                                    ? StatusList[job.status]
                                    : "Not Started"}
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
                              <td className="text-start d-flex align-items-center justify-content-between">
                                <div
                                  className="d-flex align-items-center "
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
                                                console.log(task);
                                                if (!task.id) {
                                                  console.log("not from db");
                                                  handleCheckTask(
                                                    job.id,
                                                    index
                                                  );
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
                                      className={`clickBoxtext`}
                                      onClick={() => handleAddTaskClick(job)}
                                    >
                                      Add Tasks +
                                    </div>
                                  </div>
                                </div>
                                <div className="task-view-more">
                                  {job?.tasks?.length > 3 && (
                                    <div
                                      className={` mx-0 `}
                                      onClick={() => handleOpenJobWithTask(job)}
                                    >
                                      View More <RightArrow color="#E2E31F" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="text-center ">
                                {formatDate(job.updated_at)}
                              </td>
                              <td className="px-3">
                                <div className="jobDescriptionTextDiv">
                                  {renderComment(job?.latest_messages[0])}
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
