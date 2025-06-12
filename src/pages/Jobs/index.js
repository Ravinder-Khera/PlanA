import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import {
  AddIcon,
  ArrowRight,
  BellIcon,
  CloseIcon,
  CrossIcon,
  FilterCrossIcon,
  NewFilterIcon,
  RightArrow,
  Search,
  SortIcon,
  TickIcon,
} from "../../assets/svg";
import ErrorToast from "../../Components/ErrorToast";
import Filter from "../../Components/Filter/Filter";
import Sort from "../../Components/Filter/Sort";
import {
  CreateTaskModal,
  NewJobModal,
  NewJobModalWithTasks,
  NewTaskModal,
  UpdateTaskModal,
} from "../../Components/JobModal/Edit/JobModal";
import TaggedUser from "../../Components/JobModal/Edit/TaggedUser";
import {
  addNotification,
  CollaboratorNameBG,
  CollaboratorNameColor,
  locationOptions,
  sortTasksByDueDateProximity,
  StatusList,
} from "../../helper";
import {
  createJobs,
  createTask,
  deleteTask,
  FilterJobs,
  getJobByNum,
  getJobs,
  getJobsNum,
  getSingleJob,
  getUserByRole,
  SearchJobs,
  updateJobs,
  updateTask,
} from "../../services/auth";
import "./Jobs.scss";
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
      result.push(<TaggedUser userKey={match.index} name={match[1]} />);
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
        <p className="name"> {message.user?.name} :</p>
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
  const [newJob, setNewJob] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const jobId = query.get("jobId");
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
  const [showSort, setShowSort] = useState(false);
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
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [locations, setLocations] = useState(locationOptions);

  const [notifications, setNotifications] = useState([]);
  const [newJobCollaboratorsList, setNewJobCollaboratorsList] = useState([]);
  const [newJobCollaboratorsListId, setNewJobCollaboratorsListId] = useState(
    []
  );
  const [usersList, setUsersList] = useState([]);
  const [fullUsersList, setFullUsersList] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [pageUrls, setPageUrls] = useState([]);
  const [filteredString, setFilteredString] = useState([]);
  const [filteredQuery, setFilteredQuery] = useState({});

  const [newJobIdNumber, setNewJobIdNumber] = useState(Number("00000"));
  const [newJobIdNumberForNewTask, setNewJobIdNumberForNewTask] = useState(
    Number("00000")
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loadMorePage, setLoadMorePage] = useState(1);
  const [loadTotalPage, setLoadTotalPage] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [newJobId, setNewJobId] = useState(["", "", "", "", ""]);
  const [getJob, setGetJob] = useState({
    data: {},
    stage: "",
  });

  const [activeJob, setActiveJob] = useState(null);
  const [activeTaskJob, setActiveTaskJob] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [updateJobId, setUpdateJobId] = useState(null);

  const [selectedNewJobDueDate, setSelectedNewJobDueDate] = useState(null);
  const [collabChanged, setCollabChanged] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { state } = location;
  const prevPathRef = useRef(location.pathname);
  const [customLocation, setCustomLocation] = useState({
    location: "",
    state: "",
  });
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobFromJobID(jobId);
    }
  }, [jobId]);

  const fetchJobFromJobID = async (jobId) => {
    try {
      const jobRes = await getSingleJob(jobId);
      console.log("jobRes", jobRes);
      handleOpenJobWithTask(jobRes.res);
    } catch (error) {
      console.log("error in fetchJobFromJobID", error);
    } finally {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete("jobId");
      const newPath =
        location.pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : "");
      navigate(newPath, { replace: true });
    }
  };
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
      if (target == "00000") {
        toast.error("Job number cannot be zero.");
        return;
      }
      const exists = await getJobsNum(target);

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

  useEffect(() => {
    if (
      state !== 1 &&
      state?.key !== "new-task-job" &&
      state?.key !== "job-task" &&
      state
    ) {
      localStorage.setItem("jobId", state?.id);
      setShowJobModal(true);
      setGetJob({
        data: state,
        stage: findNearestStage(state),
      });
    }
    if (state !== 1 && state?.key === "new-task-job" && state?.selectedJob) {
      handleAddTaskClick(state?.selectedJob);
    }
    if (
      state !== 1 &&
      state?.key !== "new-task-job" &&
      state?.key == "job-task" &&
      state?.selectedJob
    ) {
      handleOpenJobWithTask(state?.selectedJob);
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
        setShowSort(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

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
      const sortedJobs = data.map((job) => {
        const sortedTasks = sortTasksByDueDateProximity(job.tasks || []);
        const nearestDueDate = sortedTasks[0]?.due_date || null;

        return {
          ...job,
          tasks: sortedTasks,
          due_date: nearestDueDate,
        };
      });

      // Update jobs state
      setFilteredJobs(sortedJobs);
      setOriginalJobs(sortedJobs);

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
        setLoadTotalPage(res?.res?.last_page);
        setLoadMorePage(loadMorePage + 1);
      }
    } catch (error) {
      console.error("Error while fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, getJob?.data?.id, state?.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, reload]);

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    // Check if the container has been scrolled to the bottom
    if (
      container.scrollTop + container.clientHeight >= container.scrollHeight &&
      filteredJobs.length >= 20 &&
      (loadTotalPage > loadMorePage || !loadTotalPage)
    ) {
      setLoading(true);
      try {
        let res;
        const isNonEmpty =
          filteredQuery && Object.keys(filteredQuery).length > 0;
        if (isNonEmpty) {
          const { sort, ...queryWithoutSort } = filteredQuery;
          console.log("filtered query", sort, filteredQuery);
          res = await FilterJobs(
            {
              ...queryWithoutSort,
              page: loadMorePage + 1,
            },
            sort
          );
        } else {
          res = await getJobs(loadMorePage + 1);
        }
        const data = res?.res?.data;
        setLoadTotalPage(res?.res?.last_page);

        const sortedJobs = data.map((job) => {
          const sortedTasks = sortTasksByDueDateProximity(job.tasks || []);
          const nearestDueDate = sortedTasks[0]?.due_date || null;

          return {
            ...job,
            tasks: sortedTasks,
            due_date: nearestDueDate,
          };
        });

        setFilteredJobs((prevJobs) => [...prevJobs, ...sortedJobs]);
        setOriginalJobs((prevJobs) => [...prevJobs, ...sortedJobs]);
      } catch (error) {
        console.log("error while fetching jobs", error);
      } finally {
        setLoading(false);
      }
      setLoadMorePage(loadMorePage + 1);
    }
  }, [loadMorePage, filteredJobs, loadTotalPage]);

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

    return `${year}-${month}-${day}`;
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
    setUsersList(fullUsersList);
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
          createNewJobRequest(false);
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

  const createNewJobRequest = (showPopup = true) => {
    const formattedDueDate = new Date().toISOString()?.split("T")[0];
    setFilteredJobs((prevJobs) => [
      {
        job_num: newJobIdNumber,
        title: addJobName,
        collaborators: newJobCollaboratorsListId,
        due_date: selectedNewJobDueDate || formattedDueDate,
        status: selectNewJobStatus || "not-started",
      },
      ...prevJobs,
    ]);
    handleAddNewJob();
    synchronizeRowHeights();
    if (showPopup) setShowNewJobModal(true);
  };

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
        status: selectNewJobStatus || "not-started",
      };

      // API call to create job
      const response = await createJobs(reqBody);
      if (response?.res) {
        const { job } = response?.res;
        // remove the temp job num details
        let tempJobs = filteredJobs.filter((job) => job !== newJobIdNumber);
        tempJobs = [job, ...tempJobs];
        addNotification("success", "Job Created");
        setFilteredJobs(tempJobs);
      } else {
        toast.error(`${response?.error?.message || "Error occurred"}`);
      }
    } catch (error) {
      console.log("error in updating jobs", error);
    } finally {
      handleCancelAddJob(); // Reset state after action
    }
  };

  useEffect(() => {
    const handleDoubleClick = (event) => {
      if (
        addJobRowRefLeft.current &&
        addJobRowRefLeft.current.contains(event.target)
      ) {
        if (newJobIdNumber === 0 || !addJobName) {
          setUsersList(fullUsersList);
          return;
        } else {
          createNewJobRequest();
        }
      }
      if (
        addJobRowRefRight.current &&
        addJobRowRefRight.current.contains(event.target)
      ) {
        if (newJobIdNumber === 0 || !addJobName) {
          setUsersList(fullUsersList);
          return;
        } else {
          createNewJobRequest();
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
        setFullUsersList(response.res);
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

  const handleLocationClick = (job) => {
    setActiveJobField("Location");
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

  const handleTitleUpdate = () => {
    setActiveJobField("");
  };

  //update job click outside
  // Helper: Compare arrays of collaborators by ID
  const arraysEqualById = (a = [], b = []) => {
    const idsA = a.map((item) => item.id).sort();
    const idsB = b.map((item) => item.id).sort();
    return JSON.stringify(idsA) === JSON.stringify(idsB);
  };

  // Helper: Check if a job has changed
  const isJobChanged = (updatedJob, originalJob) => {
    if (!updatedJob || !originalJob) return false;

    setCollabChanged(
      !arraysEqualById(
        updatedJob?.collaborators || [],
        originalJob?.collaborators || []
      )
    );

    return (
      updatedJob?.title !== originalJob?.title ||
      !arraysEqualById(
        updatedJob?.collaborators || [],
        originalJob?.collaborators || []
      ) ||
      updatedJob?.status !== originalJob?.status ||
      updatedJob?.due_date !== originalJob?.due_date
    );
  };

  // Helper: Perform job update request
  const handleUpdateJob = async (updatedJob) => {
    if (!updatedJob) return;

    try {
      const oldCollaboratorsId = updatedJob.collaborators?.map((c) => c.id);
      const reqBody = {
        job_id: updatedJob.id,
        dataObj: {
          title: updatedJob.title,
          collaborators: collabChanged
            ? newJobCollaboratorsListId
            : oldCollaboratorsId,
          status: updatedJob.status,
          due_date: updatedJob.due_date,
        },
      };

      const response = await updateJobs(reqBody);
      if (!response?.res) {
        toast.error(
          `Job Update Failed: ${response.error?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error in updating jobs", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = async (event) => {
      if (
        tableActiveRowLeftRef.current &&
        !tableActiveRowLeftRef.current.contains(event.target) &&
        tableActiveRowRightRef.current &&
        !tableActiveRowRightRef.current.contains(event.target)
      ) {
        if (!filteredJobs?.length || !originalJobs?.length || !updateJobId)
          return;

        const updatedJob = filteredJobs.find((job) => job.id === updateJobId);
        const originalJob = originalJobs.find((job) => job.id === updateJobId);

        if (!updatedJob || !originalJob) return;

        setUsersList(fullUsersList);

        if (isJobChanged(updatedJob, originalJob)) {
          await handleUpdateJob(updatedJob);
          synchronizeRowHeights();
        }

        if (!showNewJobModal && !showNewJobModalWithTasks) {
          setActiveJob(null);
          setNewJobCollaboratorsList([]);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    updateJobId,
    filteredJobs,
    originalJobs,
    newJobCollaboratorsListId,
    showNewJobModal,
    showNewJobModalWithTasks,
  ]);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    if (prevPath !== currentPath) {
      if (!filteredJobs?.length || !originalJobs?.length || !updateJobId)
        return;

      const updatedJob = filteredJobs.find((job) => job.id === updateJobId);
      const originalJob = originalJobs.find((job) => job.id === updateJobId);

      if (updatedJob && originalJob && isJobChanged(updatedJob, originalJob)) {
        handleUpdateJob(updatedJob);
      }

      prevPathRef.current = currentPath;
    }

    // Save on unmount
    return () => {
      if (!filteredJobs?.length || !originalJobs?.length || !updateJobId)
        return;

      const updatedJob = filteredJobs.find((job) => job.id === updateJobId);
      const originalJob = originalJobs.find((job) => job.id === updateJobId);

      if (updatedJob && originalJob && isJobChanged(updatedJob, originalJob)) {
        handleUpdateJob(updatedJob);
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleDoubleClick = (event) => {
      if (
        tableActiveRowLeftRef.current &&
        tableActiveRowLeftRef.current.contains(event.target)
      ) {
        console.log("table", getJob);
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
        addNotification("error", "Job Update Failed");
        toast.error(`${response.error.message}`);
      } else {
        // addNotification("success", "Job Updated");
      }
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleUpdateTask = async (
    newData,
    taskId,
    newJobCollaboratorsList,
    stage
  ) => {
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) => {
        const updatedTasks = job.tasks.map((task) =>
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
        );

        const sortedTasks = sortTasksByDueDateProximity(updatedTasks);

        return {
          ...job,
          tasks: sortedTasks,
          due_date: sortedTasks?.[0]?.due_date || null,
        };
      })
    );

    setShowUpdateTaskModal(false);

    try {
      const response = await updateTask(newData, taskId);

      if (response.res) {
        // fetchJobs();
        setCurrentPage(1);
        if (newData?.updatedTask?.status === "completed") {
          const name = localStorage.getItem("user");
          addNotification("success", `Task Completed by ${name}`);
        } else {
          // addNotification("success", "Task Updated");
        }

        console.log(
          "Task Update successful",
          newData?.updatedTask,
          response.res
        );
      } else {
        throw new Error(response.error?.message || "Failed to Update the task");
      }
    } catch (error) {
      console.error("Task Update failed:", error.message);
      toast.error(error.message);
    }
  };

  const handleCreateTask = async (newData, taskId) => {
    console.log(newData?.newTask?.title);

    // Temporarily add the task to the UI with sorting and due_date update
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job.id !== taskId) return job;

        const updatedTasks = sortTasksByDueDateProximity([
          {
            id: "temp",
            title: newData.newTask.title,
            due_date: newData.newTask.due_date,
            status: newData.newTask.status,
            description: newData.newTask.description,
          },
          ...(job.tasks || []),
        ]);

        return {
          ...job,
          tasks: updatedTasks,
          due_date: updatedTasks?.[0]?.due_date || null,
        };
      })
    );

    setShowAddTaskModal(false);

    // Send API request to create task
    try {
      const response = await createTask(newData.newTask, taskId);

      if (response.res) {
        const { task } = response.res;

        // Replace temp task with actual task, re-sort, and update due_date
        setFilteredJobs((prevJobs) =>
          prevJobs.map((job) => {
            if (job.id !== taskId) return job;

            const updatedTasks = sortTasksByDueDateProximity([
              task,
              ...job.tasks.filter((t) => t.id !== "temp"),
            ]);

            return {
              ...job,
              tasks: updatedTasks,
              due_date: updatedTasks?.[0]?.due_date || null,
            };
          })
        );

        addNotification("success", "Task Created");
        toast.success("Task added successfully!");
      } else {
        throw new Error(response.error?.message || "Failed to add the task");
      }
    } catch (error) {
      console.error("Task create failed:", error.message);
      toast.error(error.message);
      addNotification("error", "Task Creation Failed");

      // Rollback: Remove the temporary task if API fails
      setFilteredJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.id !== taskId) return job;

          const updatedTasks = job.tasks.filter((t) => t.id !== "temp");
          return {
            ...job,
            tasks: updatedTasks,
            due_date: updatedTasks?.length
              ? sortTasksByDueDateProximity(updatedTasks)?.[0]?.due_date
              : null,
          };
        })
      );
    }
  };

  const handleTaskDelete = async (task) => {
    try {
      const response = await deleteTask(task.id);
      if (response.res) {
        addNotification("success", "Task Deleted");
        console.log("task delete successful", response.res);
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
          prevJobs.map((job) => {
            if (job?.tasks?.some((task) => task?.id === updatedTask?.id)) {
              const updatedTasks = job.tasks.map((task) =>
                task?.id === updatedTask?.id
                  ? { ...task, title: updatedTask?.title }
                  : task
              );

              const sortedTasks = sortTasksByDueDateProximity(updatedTasks);

              return {
                ...job,
                tasks: sortedTasks,
                due_date: sortedTasks?.[0]?.due_date || null,
              };
            }
            return job;
          })
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
    const rightRows = document.querySelectorAll(".table_right .tableEntries");
    const leftRows = document.querySelectorAll(".table_left .tableEntries");

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
        console.log("jobId response", response.res);
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
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) => {
        if (job?.job_num === task?.job_num) {
          const updatedTasks = [...(job.tasks || []), { ...task, id: "temp" }];
          const sortedTasks = sortTasksByDueDateProximity(updatedTasks);
          return {
            ...job,
            tasks: sortedTasks,
            due_date: sortedTasks?.[0]?.due_date || null,
          };
        }
        return job;
      })
    );

    setShowNewJobAddTaskModal(false);
    const jobToUpdate = await handleJobId(task.job_num);
    const taskToUpdate = { ...task, job_id: jobToUpdate?.id };
    var response = await createTask(taskToUpdate, jobToUpdate?.id);
    if (response.res) {
      const { task: createdTask } = response.res;

      setFilteredJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job?.job_num === task?.job_num) {
            const updatedTasks = job?.tasks?.map((t) =>
              t.id === "temp" ? createdTask : t
            );
            const sortedTasks = sortTasksByDueDateProximity(updatedTasks);
            return {
              ...job,
              tasks: sortedTasks,
              due_date: sortedTasks?.[0]?.due_date || null,
            };
          }
          return job;
        })
      );

      addNotification("success", "Task Created");
      console.log("Task create successful", taskToUpdate, response.res);
    } else {
      addNotification("error", "Task Creation Failed");
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

  const handleRemoveFilter = async (fq) => {
    const prevQuery = filteredQuery;
    const updatedQuery = { ...prevQuery, page: 1 };

    // Remove specific filter type from temp query
    if (fq?.type === "status") {
      updatedQuery.statuses = prevQuery.statuses?.filter(
        (status) => status !== fq.value
      );
      if (!updatedQuery.statuses?.length) delete updatedQuery.statuses;
    }

    if (fq?.type === "collaborator_ids") {
      updatedQuery.collaborator_ids = prevQuery.collaborator_ids?.filter(
        (id) => id !== fq.value
      );
      if (!updatedQuery.collaborator_ids?.length)
        delete updatedQuery.collaborator_ids;
    }

    if (fq?.type === "due") {
      updatedQuery.due = prevQuery.due?.filter((item) => item !== fq.value);
      if (!updatedQuery.due?.length) delete updatedQuery.due;
    }

    let sortValue = undefined;

    // If type is not "sort", retain sort and pass it to FilterJobs
    if (fq?.type !== "sort" && prevQuery?.sort) {
      sortValue = prevQuery.sort;
    }

    delete updatedQuery.sort;

    setFilteredQuery((prev) => {
      const newQuery = { ...prev };
      if (fq.type === "status") {
        newQuery.statuses = newQuery.statuses?.filter(
          (status) => status !== fq.value
        );
        if (!newQuery.statuses?.length) delete newQuery.statuses;
      }

      if (fq.type === "collaborator_ids") {
        newQuery.collaborator_ids = newQuery.collaborator_ids?.filter(
          (id) => id !== fq.value
        );
        if (!newQuery.collaborator_ids?.length)
          delete newQuery.collaborator_ids;
      }

      if (fq.type === "due") {
        newQuery.due = newQuery.due?.filter((item) => item !== fq.value);
        if (!newQuery.due?.length) delete newQuery.due;
      }

      if (fq.type === "sort") {
        delete newQuery.sort;
      }

      return newQuery;
    });

    const updatedFilterStr = filteredString.filter(
      (item) => item.filter !== fq?.filter
    );
    setFilteredString(updatedFilterStr);
    console.log("updatedQuery", updatedQuery, updatedFilterStr);

    try {
      setLoading(true);

      if (!updatedFilterStr || updatedFilterStr?.length === 0) {
        setFilteredQuery({});
        setReload(!reload);
      } else {
        const response = await FilterJobs(updatedQuery, sortValue);
        if (!response.error) {
          setFilteredJobs(response?.res?.data);
        }
      }
    } catch (error) {
      console.error("Error in applying filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenJobWithTask = async (job) => {
    console.log("handleOpenJobWithTask job", job);
    setActiveJob(job);
    setUpdateJobId(job.id);
    setShowNewJobModalWithTasks(true);
  };

  const handleErrorToastClose = () => {
    console.log("handleErrorToastClose");
    setNewJobId(["", "", "", "", ""]);
    setNewJobIdExist(false);
  };

  const handleJobOpenWhileCreating = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      const day = String(new Date().getDate()).padStart(2, "0");
      let formattedDueDate = `${year}-${month}-${day}`;
      const reqBody = {
        job_num: newJobIdNumber,
        title: addJobName,
        collaborators: newJobCollaboratorsListId,
        due_date: selectedNewJobDueDate || formattedDueDate,
        status: selectNewJobStatus || "not-started",
      };

      // API call to create job
      const response = await createJobs(reqBody);
      console.log("request body for create job", response);

      if (response?.res?.message) {
        console.log(`${response.res.message}`);
        const { job } = response.res;
        setNewJob(true);
        handleOpenJobWithTask(job);
        const sortedJobs = job.map((job) => {
          const sortedTasks = sortTasksByDueDateProximity(job?.tasks || []);
          const nearestDueDate = sortedTasks?.[0]?.due_date || null;

          return {
            ...job,
            tasks: sortedTasks,
            due_date: nearestDueDate,
          };
        });
        setFilteredJobs((prevJobs) => [sortedJobs, ...prevJobs]);
        addNotification("success", "Job Created");
      } else {
        toast.error(`${response?.error?.message || "Error occurred"}`);
      }
    } catch (error) {
      console.log("error in updating jobs", error);
    } finally {
      handleCancelAddJob(); // Reset state after action
      setLoading(false);
    }
  };

  const handleAddCustomLocation = async () => {
    const { location, state } = customLocation;
    if (!location || !state) {
      toast.error("Please fill all the fields");
      return;
    }
    let tmpLocations = [...locations];
    tmpLocations.push({
      location,
      state,
    });
    setLocations(tmpLocations);
    setCustomLocation({
      location: "",
      state: "",
    });
    setIsCustomLocation(false);
  };

  const handleLocationUpdate = (value) => {
    setActiveJobField("");
    setFilteredJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === activeJob?.id
          ? { ...job, location: value?.location, state: value?.state }
          : job
      )
    );
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
          usersList={fullUsersList}
          handleClose={async (isUpdateRequired) => {
            setGetJob();
            setActiveJob(null);
            setShowNewJobModal(false);
            if (isUpdateRequired && activeJob) {
              await handleUpdateJobDesc(
                activeJob.id,
                activeJob.description,
                activeJob.tasks
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
            setGetJob();
            setActiveJob(null);
            setShowNewJobModal(false);
          }}
        />
      )}

      {showNewJobModalWithTasks && (
        <NewJobModalWithTasks
          usersList={fullUsersList}
          job={activeJob}
          newJob={newJob}
          handleClose={async (isUpdateRequired = false) => {
            setGetJob();
            setActiveJob(null);
            setShowNewJobModalWithTasks(false);
            if (isUpdateRequired && activeJob) {
              await handleUpdateJobDesc(
                activeJob.id,
                activeJob.description,
                activeJob.tasks
              );
            }

            setNewJob(false);
          }}
          fetchJobs={fetchJobs}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
          handleDelete={() => {
            console.log("active job id to be deleted", activeJob);
            setFilteredJobs((prevJobs) =>
              prevJobs.filter((job) => job.id !== activeJob.id)
            );
            setGetJob();
            setActiveJob(null);
            setShowNewJobModalWithTasks(false);
            setNewJob(false);
          }}
        />
      )}

      {showNewJobAddTaskModal && (
        <NewTaskModal
          usersList={fullUsersList}
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
          usersList={fullUsersList}
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
                tasks: job.tasks.filter((task) => task?.id !== activeTask?.id),
              }))
            );

            setShowAddTaskModal(false);
          }}
        />
      )}

      {showUpdateTaskModal && (
        <UpdateTaskModal
          usersList={fullUsersList}
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
                tasks: job.tasks.filter((task) => task?.id !== activeTask?.id),
              }))
            );
            handleTaskDelete(activeTask);
            setShowUpdateTaskModal(false);
          }}
        />
      )}

      {showJobModal && (
        <NewJobModal
          job={getJob?.data}
          usersList={fullUsersList}
          handleClose={async (isDeleting = false, description) => {
            setGetJob();
            setActiveJob(null);
            setShowJobModal(false);
            if (!isDeleting && getJob?.data) {
              await handleUpdateJobDesc(getJob.data?.id, description);
            }
            if (isDeleting) {
              setFilteredJobs((prevJobs) =>
                prevJobs.filter((job) => job?.id !== getJob?.data?.id)
              );
            }
          }}
          fetchJobs={fetchJobs}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
          handleDelete={() => {
            setFilteredJobs((prevJobs) =>
              prevJobs.filter((job) => job?.id !== getJob?.data?.id)
            );
            setIsDeleting(true);
          }}
        />
      )}

      <div className="jobsBg">
        <div
          className="JobsHeading position-relative d-flex justify-content-between align-items-center gap-3 flex-wrap"
          style={{ zIndex: "2", justifyContent: "space-between" }}
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
                        if (searchedInput) {
                          fetchJobs();
                        }
                      }}
                    >
                      <CloseIcon />
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div
              className="d-flex  gap-3 align-items-baseline addNewTaskDiv position-relative"
              style={{ cursor: "pointer" }}
              ref={filterRef}
            >
              <div
                className="d-flex align-items-center gap-2  "
                onClick={() => {
                  setShowSort(false);
                  setShowFilter(!showFilter);
                }}
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
                  filteredQuery={filteredQuery}
                />
              )}
              <div
                className="d-flex align-items-center gap-2  "
                onClick={() => {
                  setShowFilter(false);
                  setShowSort(!showSort);
                }}
              >
                <SortIcon />
                <p style={{ color: "#E2E31F", fontSize: "14px", margin: "0" }}>
                  Sort
                </p>
              </div>
              {showSort && (
                <Sort
                  setFilteredString={setFilteredString}
                  setFilteredQuery={setFilteredQuery}
                  filteredQuery={filteredQuery}
                  setFilteredJobs={setFilteredJobs}
                  setLoading={setLoading}
                  closeFilter={() => setShowSort(false)}
                />
              )}
            </div>
          </div>
          <div className="d-flex gap-3 flex-wrap align-items-center">
            <div className="addjobs addJobsMobile" style={{ gap: "16px" }}>
              <div
                className={`d-flex align-items-center`}
                style={{ gap: "8px", cursor: "pointer" }}
                onClick={() => {
                  setShowAddJobRow(true);
                  handleAddJobScroll();
                }}
              >
                <div className={`addJobIcon ${showAddJoRow && "active"}`}>
                  <AddIcon />
                </div>
                <span style={{ color: `${showAddJoRow ? "#fff" : "#e2e31f"}` }}>
                  Add Job
                </span>
              </div>
              <div
                className="d-flex align-items-center"
                style={{ gap: "8px", cursor: "pointer" }}
                onClick={() => setNotificationDropDown(true)}
              >
                <div className="notifyIcon notificationWhite mx-0">
                  {notifications?.length > 0 && (
                    <div className="activeNotification"></div>
                  )}
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
                                  <div
                                    className={`notificationClass ${
                                      notification.class
                                    }-class ${
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
        <div
          className="JobsHeading d-flex align-items-center justify-content-between"
          style={{ justifyContent: "space-between" }}
        >
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
                    {selectSearchOptions === "job_num" && (
                      <>
                        Enter the number of the ‘Job’ you would like to search
                        for.
                      </>
                    )}
                    {selectSearchOptions === "title" && (
                      <>
                        Enter the name of the ‘Job Name’ you would like to
                        search for.
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
                  !showSearchOptions &&
                  selectSearchOptions === "" &&
                  "Showing All Jobs"
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="pagination-container job-section">
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
                        <th scope="col" style={{ width: "135px" }}>
                          <div className="headerDiv">Job No.</div>
                        </th>
                        <th scope="col">
                          <div className="headerDiv">Job Name</div>
                        </th>
                        {/* <th scope="col" style={{ width: "185px" }}>
                          <div className="headerDiv">Collaborators</div>
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="table_left">
                      {showAddJoRow && (
                        <tr
                          className="addNewJobRow transition left"
                          style={{ borderRight: "none" }}
                          ref={addJobRowRefLeft}
                        >
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
                              <>
                                <div className="d-flex">
                                  <input
                                    className="clickBoxInput"
                                    placeholder="Enter Job Name"
                                    type="text"
                                    value={addJobName}
                                    onChange={(e) =>
                                      setAddJobName(e.target.value)
                                    }
                                    onFocus={handleFocus}
                                    onKeyDown={handleKeyDown}
                                  />
                                  {addJobName?.trim() !== "" &&
                                    newJobIdFilled &&
                                    !newJobIdExist && (
                                      <span
                                        onClick={() => {
                                          setNewJobActiveBoxLeft("");
                                          handleJobOpenWhileCreating();
                                        }}
                                      >
                                        <ArrowRight />
                                      </span>
                                    )}
                                </div>
                              </>
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
                            <td
                              className="text-center"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setActiveJob(job);
                              }}
                            >
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
                                  setActiveJobField("");
                                  // setShowNewJobModal(true);
                                  handleOpenJobWithTask(job);
                                }}
                              >
                                <ArrowRight />
                              </span>
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
                <div className="right-side-table">
                  <div className="job_table_outer_div">
                    <table className="table table-borderless text-light">
                      <thead className="sticky-header-right">
                        <tr>
                          <th scope="col" style={{ width: "185px" }}>
                            <div className="headerDiv">Collaborators</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Status</div>
                          </th>
                          {/* <th scope="col">
                            <div className="headerDiv">Due Date</div>
                          </th> */}
                          <th scope="col">
                            <div className="headerDiv">Days Left</div>
                          </th>
                          <th scope="col" colSpan={2}>
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
                          <th scope="col">
                            <div className="headerDiv">Location</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="table_right">
                        {showAddJoRow && (
                          <tr
                            className="addNewJobRow transition right"
                            style={{ borderLeft: "none" }}
                            ref={addJobRowRefRight}
                          >
                            <td
                              className={`text-center clickBox collab ${
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
                                          const initials = user?.initials;

                                          return (
                                            <div
                                              key={index}
                                              className={`collaboratorsBoxUser`}
                                              style={{
                                                minWidth: "40px",
                                                zIndex: index,
                                                cursor: "pointer",
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
                                <div
                                  className={`newJobItemDropBoxtwo`}
                                  style={{
                                    minWidth: "415px",
                                    maxWidth: "max-content",
                                  }}
                                >
                                  {newJobCollaboratorsList.length > 0 && (
                                    <div className="addedCollabs">
                                      {newJobCollaboratorsList.map(
                                        (user, index) => {
                                          const initials = user?.initials;

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
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                  {usersList
                                    ? usersList.map((user, index) => {
                                        const initials = user?.initials;

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
                            <td
                              className={`text-center clickBox ${
                                newJobActiveBoxRight === "SelectStatus" &&
                                "active"
                              }`}
                              style={{ borderLeft: "none" }}
                            >
                              <div
                                className={`clickBoxtext`}
                                onClick={() => {
                                  setNewJobActiveBoxRight("SelectStatus");
                                  setNewJobActiveBoxLeft("");
                                }}
                              >
                                {selectNewJobStatus ? (
                                  <span
                                    className={`statusBox ${selectNewJobStatus.replace(
                                      /\s+/g,
                                      ""
                                    )}`}
                                    style={{
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {selectNewJobStatus}
                                  </span>
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
                                  <div
                                    className="selectCollaboratorsBox"
                                    onClick={() => {
                                      setNewJobActiveBoxRight("");
                                      setSelectNewJobStatus("completed");
                                    }}
                                  >
                                    <div className="statusBox Completed">
                                      Completed
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="text-center">
                              {selectedNewJobDueDate ? (
                                moment(selectedNewJobDueDate)
                                  .startOf("day")
                                  .isBefore(moment().startOf("day")) ? (
                                  "0 days"
                                ) : (
                                  (() => {
                                    const diff = moment(selectedNewJobDueDate)
                                      .startOf("day")
                                      .diff(moment().startOf("day"), "days");
                                    return `${diff} day${
                                      diff === 1 ? "" : "s"
                                    }`;
                                  })()
                                )
                              ) : (
                                <div className="clickBox">
                                  <span className="clickBoxtext">N/A</span>
                                </div>
                              )}
                            </td>
                            <td
                              className={`px-3 clickBox ${
                                newJobActiveBoxRight === "AddTask" && "active"
                              }`}
                              colSpan={2}
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
                                Add Task +
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
                              <td
                                className={`text-center clickBox collab`}
                                onClick={() => handleCollaboratorClick(job)}
                              >
                                <div className="collaboratorsBox">
                                  <div className=" d-flex align-items-center justify-content-center">
                                    {job?.collaborators?.length > 0 && (
                                      <>
                                        {job?.collaborators
                                          .slice(0, 3)
                                          .map((user, index) => {
                                            const initials = user?.initials;

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

                                        {job?.collaborators?.length > 3 && (
                                          <div
                                            className={`collaboratorsBoxUser`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex:
                                                job?.collaborators?.length || 4,
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
                                    <div
                                      className={`newJobItemDropBoxtwo`}
                                      style={{
                                        minWidth: "415px",
                                        maxWidth: "max-content",
                                      }}
                                    >
                                      {newJobCollaboratorsList.length > 0 && (
                                        <div className="addedCollabs">
                                          {newJobCollaboratorsList.map(
                                            (user, index) => {
                                              const initials = user?.initials;

                                              return (
                                                <div
                                                  className="selectCollaboratorsBox"
                                                  key={index}
                                                  onClick={() =>
                                                    handleRemoveCollaborator(
                                                      user
                                                    )
                                                  }
                                                >
                                                  <div
                                                    className={`collaboratorsBoxUser`}
                                                    style={{
                                                      minWidth: "40px",
                                                      border:
                                                        "1px solid #767676",
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
                                                </div>
                                              );
                                            }
                                          )}
                                        </div>
                                      )}
                                      {usersList
                                        ? usersList.map((user, index) => {
                                            const initials = user?.initials;

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
                                        <div className="statusBox Completed">
                                          Completed
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </td>

                              <td className="text-center">
                                {moment(job?.due_date || new Date())
                                  .startOf("day")
                                  .isBefore(moment().startOf("day"))
                                  ? "0 days"
                                  : (() => {
                                      const diff = moment(
                                        job?.due_date || new Date()
                                      )
                                        .startOf("day")
                                        .diff(moment().startOf("day"), "days");
                                      return `${diff} day${
                                        diff === 1 ? "" : "s"
                                      }`;
                                    })()}
                              </td>
                              <td
                                style={{
                                  borderRight: "none",
                                  width: "calc(100% - 110px)",
                                }}
                              >
                                <div
                                  className="d-flex align-items-center "
                                  style={{ gap: "8px" }}
                                >
                                  {job?.tasks?.length > 0 && (
                                    <>
                                      {job?.tasks
                                        .slice(
                                          0,
                                          1
                                          // showAllTasks ? job?.tasks.length : 3
                                        )
                                        .map((task, index) => {
                                          return (
                                            <span
                                              key={index}
                                              style={{
                                                cursor: "pointer",
                                              }}
                                              className={`statusBtn mx-0 ${task.status}`}
                                              onClick={() => {
                                                if (!task.id) {
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
                                              {task?.title?.replace(
                                                /\b\w/g,
                                                (char) => char.toUpperCase()
                                              )}
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
                                      Add Task +
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td
                                style={{ width: "110px", textAlign: "center" }}
                              >
                                <div className="task-view-more">
                                  {job?.tasks?.length > 0 && (
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
                                  {job?.comments?.length > 0
                                    ? renderComment(
                                        job?.comments[job?.comments?.length - 1]
                                      )
                                    : renderComment(null)}
                                </div>
                              </td>
                              <td className="px-3">
                                <div className={`px-3 clickBox`}>
                                  <div
                                    className={`clickBoxtext text-center`}
                                    onClick={() => handleLocationClick(job)}
                                  >
                                    {job.location ? (
                                      <span
                                        style={{
                                          color: "#fff",
                                        }}
                                      >
                                        {job.location}
                                      </span>
                                    ) : (
                                      <span>Add Location +</span>
                                    )}
                                  </div>
                                  {activeJob?.id === job.id &&
                                    activeJobField === "Location" && (
                                      <div
                                        className={`newJobItemDropBox location`}
                                      >
                                        <div className="locationlist">
                                          {locations.map((location, index) => {
                                            return (
                                              <div
                                                key={index}
                                                className="selectCollaboratorsBox"
                                                onClick={() =>
                                                  handleLocationUpdate(location)
                                                }
                                              >
                                                <span>{location.location}</span>
                                                <span>{location.state}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        <div className="custom-task">
                                          {isCustomLocation ? (
                                            <div className="customLocation-container">
                                              <hr />
                                              <div className="location-cntr">
                                                <input
                                                  type="text"
                                                  className="location"
                                                  placeholder="Location Name"
                                                  value={
                                                    customLocation.location
                                                  }
                                                  onChange={(e) =>
                                                    setCustomLocation({
                                                      ...customLocation,
                                                      location: e.target.value,
                                                    })
                                                  }
                                                />
                                                <input
                                                  type="text"
                                                  className="state"
                                                  placeholder="State"
                                                  value={customLocation.state}
                                                  onChange={(e) =>
                                                    setCustomLocation({
                                                      ...customLocation,
                                                      state: e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>
                                              <div
                                                className="d-flex align-items-center justify-content-start"
                                                onClick={
                                                  handleAddCustomLocation
                                                }
                                              >
                                                <div
                                                  className="add-btn"
                                                  style={{ minWidth: "40px" }}
                                                >
                                                  <TickIcon />
                                                </div>{" "}
                                                Confirm New Custom Location
                                              </div>
                                              <div
                                                className="d-flex align-items-center justify-content-start cancel-cntr"
                                                onClick={() => {
                                                  setIsCustomLocation(false);
                                                  setCustomLocation({
                                                    location: "",
                                                    state: "",
                                                  });
                                                }}
                                              >
                                                <div
                                                  className="cancel-btn"
                                                  style={{ minWidth: "40px" }}
                                                >
                                                  <CrossIcon />
                                                </div>{" "}
                                                Cancel Location
                                              </div>
                                            </div>
                                          ) : (
                                            <div
                                              className="d-flex align-items-center justify-content-start "
                                              onClick={() => {
                                                setCustomLocation({
                                                  location: "",
                                                  state: "",
                                                });
                                                setIsCustomLocation(true);
                                              }}
                                            >
                                              <div
                                                className="add-btn"
                                                style={{ minWidth: "40px" }}
                                              >
                                                <AddIcon />
                                              </div>{" "}
                                              Create Custom Location
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
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
