import React, { useEffect, useRef, useState } from "react";
import {
  AddIcon,
  BellIcon,
  CloseIcon,
  CrossIcon,
  FilterIcon,
  NewFilterIcon,
  NextIcon,
  OpenCloseIcon,
  Search,
  TickIcon,
  User,
} from "../../assets/svg";
import "./Jobs.scss";
import { DeleteIcon } from "../../assets/svg";
import {
  createJobs,
  deleteJobs,
  getJobs,
  getJobsByFilter,
  getUserByRole,
} from "../../services/auth";
import { Bars } from "react-loader-spinner";
import { toast } from "react-toastify";
import moment from "moment";
import Filter from "../../Components/Filter/Filter";
import JobModal, { NewJobModal } from "../../Components/JobModal/Edit/JobModal";
import { StatusList } from "../../helper";
import Add from "../../Components/JobModal/Add/Add";
import { useLocation } from "react-router-dom";
import { NotificationComponent } from "../../Components/navMenu";
import { Calendar } from "react-date-range";

const Jobs = () => {
  const containerRef = useRef(null);
  const location = useLocation();

  const [jobs, setJobs] = useState();
  const [divWidth, setDivWidth] = useState(0);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [status, setStatus] = useState("in-progress");
  const [filteredJobs, setFilteredJobs] = useState("");
  const [pageUrls, setPageUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [getJob, setGetJob] = useState({
    data: {},
    stage: "",
  });

  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddJoRow, setShowAddJobRow] = useState(false);
  const filterRef = useRef(null);
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [reloadTabs, setReloadTabs] = useState(false);
  const notificationRef = useRef(null);
  const taskMobileScrollRef = useRef(null);
  const [searchedInput, setSearchedInput] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [storageUpdated, setStorageUpdated] = useState(false);
  const [newJobActiveBoxLeft, setNewJobActiveBoxLeft] = useState("");
  const [newJobActiveBoxRight, setNewJobActiveBoxRight] = useState("");
  const [addJobNameBoxAdded, setAddJobNameAdded] = useState(false);
  const [addJobName, setAddJobName] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [newJobCollaboratorsList, setNewJobCollaboratorsList] = useState([]);
  const [selectNewJobStatus, setSelectNewJobStatus] = useState("");
  const [selectedNewJobDueDate, setSelectedNewJobDueDate] = useState(null);
  const [newJobId, setNewJobId] = useState(["", "", "", "", ""]);
  const [newJobIdFilled, setNewJobIdFilled] = useState(false);
  const [newJobIdExist, setNewJobIdExist] = useState(false);
  const [newJobIdNumber, setNewJobIdNumber] = useState(Number("00000"));
  const newJobIdInputRefs = useRef([]);

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

  const generateDummyArray = () => {
    const arr = [];
    for (let i = 0; i <= 99; i++) {
      arr.push(i.toString().padStart(5, "0"));
    }
    return arr;
  };

  const checkIfExists = (target, arr) => {
    return arr.includes(target);
  };

  const handleNewJobIdChange = (e, index) => {
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
      const arr = generateDummyArray();
      // Check if the target exists in the array
      const exists = checkIfExists(target, arr);
      if (exists) {
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
    const updateDivWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setDivWidth(width);
      }
    };

    updateDivWidth();
    window.addEventListener("resize", updateDivWidth);

    return () => {
      window.removeEventListener("resize", updateDivWidth);
    };
  }, []);

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

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs(currentPage);
      const data = res?.res?.data;
      setJobs(data);
      setFilteredJobs(data);
      const selectedJob = data.filter(
        (item) => item?.id === getJob?.data?.id || item?.id === state?.id
      );
      setGetJob({
        data: selectedJob[0],
        stage: findNearestStage(selectedJob[0]),
      });
      // Extract users from stages
      if (data) {
        extractUsersFromStages(data);
        // Print the users array
        // setUsersList(users);
        setTotalPages(res?.res.last_page);
        setPageUrls(res?.res.links.slice(1, -1));
        setReloadTabs(!reloadTabs);
      }
    } catch (error) {
      console.log("error while fetching jobs", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    if (checked) {
      const ids = filteredJobs?.map(({ id }) => id);
      setSelectedJobs(ids);
    } else {
      setSelectedJobs([]);
    }
  };

  const handleDelete = async () => {
    if (!selectedJobs.length) {
      toast.error(
        <>
          <div>
            <h3>Trouble Deleting Jobs?</h3>
          </div>
          <p>
            Please choose the jobs you want to delete. Currently, no jobs have
            been selected for deletion.
          </p>
        </>
      );
      return;
    }
    try {
      setLoading(true);
      let response = await deleteJobs({
        ids: selectedJobs,
      });
      console.log("jobs delete successful", response);
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
        console.error("jobs delete failed:", response.error);
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
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
      fetchJobs();
      setSelectedJobs([]);
    }
  };

  // const handleStatusFilter = async (_status) => {
  //   setLoading(true);
  //   try {
  //     const filterString = `status=${_status}`;
  //     const res = await getJobsByFilter(filterString);
  //     const { data } = res?.res;
  //     setFilteredJobs(data);
  //   } catch (error) {
  //     console.log("error while filtering", error);
  //   } finally {
  //     setLoading(false);
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
  }, [showJobModal,showNewJobModal]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(2);

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
  };

  const addJobRowRefLeft = useRef(null);
  const addJobRowRefRight = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addJobRowRefLeft.current &&
        !addJobRowRefLeft.current.contains(event.target)
      ) {
        setNewJobActiveBoxLeft("");
      }
      if (
        addJobRowRefRight.current &&
        !addJobRowRefRight.current.contains(event.target)
      ) {
        setNewJobActiveBoxRight("");
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectCollaborator = (user) => {
    setNewJobCollaboratorsList((prevList) => [...prevList, user]);
    setUsersList((prevList) => prevList.filter((u) => u.email !== user.email));
  };

  const handleRemoveSelectCollaborator = (user) => {
    setUsersList((prevList) => [...prevList, user]);
    setNewJobCollaboratorsList((prevList) =>
      prevList.filter((u) => u.email !== user.email)
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

  const handleAddNewJob = async () => {
    try {
      setLoading(true);
  
      // Request body with job details
      const reqBody = {
        title: addJobName,
        due_date: selectedNewJobDueDate || "", // Use empty string if no date is selected
        status: selectNewJobStatus || "", // Use empty string if no status is selected
      };
  
      // API call to create job
      const response = await createJobs(reqBody);
      console.log("request body for create job", response);
  
      if (response?.res?.message) {
        toast.success(`${response.res.message}`);
      } else {
        toast.error(`${response?.error?.message || "Error occurred"}`);
      }
    } catch (error) {
      console.log("error in updating jobs", error);
    } finally {
      setLoading(false);
      fetchJobs(); // Ensure this fetches the latest jobs
      handleCancelAddJob(); // Reset state after action
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
          job={addJobName}
          handleClose={() => {
            setGetJob();
            setShowNewJobModal(false);
          }}
          fetchJobs={fetchJobs}
          reloadTabs={reloadTabs}
          scrollRef={taskMobileScrollRef}
        />
      )}

      {showJobModal && (
        <JobModal
          job={getJob.data}
          stage={getJob.stage}
          handleClose={() => {
            setGetJob();
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
            {/* <div className="navSearchTab">
              <div className="jobsTaskTabsDiv">
                <div
                  className={`jobtaskTab ${
                    status === "in-progress" ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedJobs([]);
                    setStatus("in-progress");
                    handleStatusFilter("in-progress");
                  }}
                >
                  Current Jobs
                </div>
                <div
                  className={`jobtaskTab ${
                    status === "completed" ? "active" : ""
                  }`}
                  onClick={() => {
                    setSelectedJobs([]);
                    setStatus("completed");
                    handleStatusFilter("completed");
                  }}
                >
                  Completed
                </div>
              </div>
            </div> */}
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
                    <div
                      className="bellIcon addTaskJobDiv"
                      // style={{ cursor: "pointer" }}
                    >
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
          {!showAddJoRow ? (
            <div
              className="delete-box"
              style={{ cursor: "pointer", zIndex: 2 }}
              onClick={handleDelete}
            >
              <div className="searchUserImg">
                <DeleteIcon />
              </div>
              <div className="delete-item">
                Mark {selectedJobs.length} Item(s) complete
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-start gap-3">
              <div
                className="delete-box"
                style={{ cursor: "pointer", zIndex: 2 }}
                onClick={handleCancelAddJob}
              >
                <div className="searchUserImg">
                  <span style={{ rotate: "45deg" }}>
                    <AddIcon />
                  </span>
                </div>
                <div className="delete-item">Cancel</div>
              </div>
              {addJobNameBoxAdded && newJobIdFilled && (
                <div
                  className="delete-box"
                  style={{ cursor: "pointer", zIndex: 2 }}
                  onClick={handleAddNewJob}
                >
                  <div className="searchUserImg">
                    <TickIcon />
                  </div>
                  <div className="delete-item">Save</div>
                </div>
              )}
              {addJobNameBoxAdded && newJobIdFilled && (
                <div
                  className="delete-box"
                  style={{ cursor: "pointer", zIndex: 2 }}
                  onClick={() => setShowNewJobModal(true)}
                >
                  <OpenCloseIcon />
                  <div className="delete-item">Open</div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="pagination-container">
          <div className="JobsContainer desktop" ref={containerRef}>
            <div className="left-side">
              <div className="first-table">
                <div className="job_table_outer_div  ">
                  <table className="table table-borderless text-light">
                    <thead>
                      <tr>
                        <th scope="col" className="text-center">
                          <label htmlFor={`select_all`}>
                            <input
                              type="checkbox"
                              checked={
                                filteredJobs?.length &&
                                selectedJobs?.length &&
                                filteredJobs?.length === selectedJobs?.length
                              }
                              id={`select_all`}
                              onChange={handleSelectAll}
                              style={{ display: "none" }}
                              disabled={showAddJoRow}
                            />
                            {filteredJobs?.length &&
                            selectedJobs?.length &&
                            filteredJobs?.length === selectedJobs?.length ? (
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
                        </th>
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
                          <th scope="row" className="text-center"></th>
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
                              onClick={() =>
                                setNewJobActiveBoxLeft("AddCollaborators")
                              }
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
                                            onClick={() =>
                                              handleRemoveSelectCollaborator(
                                                user
                                              )
                                            }
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
                                onClick={() =>
                                  setNewJobActiveBoxLeft("AddCollaborators")
                                }
                              >
                                Add Collaborators
                              </div>
                            )}
                            {newJobActiveBoxLeft === "AddCollaborators" && (
                              <div className={`newJobItemDropBox`}>
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
                            key={index}
                            className={`${showAddJoRow && "disabled"}`}
                          >
                            <th scope="row" className="text-center">
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
                            </th>
                            <td className="text-center">
                              <span
                                className={`jobNoBtn btn_${findNearestStage(
                                  job
                                )}`}
                              >
                                {job.id}
                              </span>
                            </td>
                            <td className="px-3">
                              <div className="job-name">
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
                                {/* <h6>{job.description}</h6> */}
                              </div>
                            </td>
                            <td className="text-center">
                              {job?.operative_id && (
                                <div className="collaboratorsBox">
                                  <div className=" d-flex align-items-center justify-content-center">
                                    {job?.usersArray?.length > 0 && (
                                      <>
                                        {job?.usersArray
                                          .filter(
                                            (selectedId) =>
                                              selectedId !== job?.operative_id
                                          )
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

                                        {job?.usersArray?.length > 3 && (
                                          <div
                                            className={`collaboratorsBoxUser`}
                                            style={{
                                              minWidth: "40px",
                                              zIndex: index,
                                            }}
                                          >
                                            +
                                            {job?.usersArray.filter(
                                              (selectedId) =>
                                                selectedId !== job?.operative_id
                                            ).length - 3}
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {job.usersArray?.length === 0 && (
                                      <div
                                        className="collaboratorsBoxUser disabled m-0"
                                        style={{ minWidth: "40px" }}
                                      >
                                        N/A
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td></td>
                          <td className="text-center">
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
                            <div className="headerDiv">Progress</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Due Date</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Days Left</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Subtasks</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">
                              Client Last Contacted
                            </div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Comments</div>
                          </th>
                          {/* <th scope="col">
                            <div className="headerDiv">Job Manager</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Latest Update</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Archive</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Assessment Manager</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Latest Comment</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Operative</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">Created</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">EOFY</div>
                          </th>
                          <th scope="col">
                            <div className="headerDiv">LinkedIn Post</div>
                          </th> */}
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
                                onClick={() =>
                                  setNewJobActiveBoxRight("SelectStatus")
                                }
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
                                      setSelectNewJobStatus("Not Started");
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
                                      setSelectNewJobStatus("Pending");
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
                                      setSelectNewJobStatus("In Progress");
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
                                      setSelectNewJobStatus("On Hold");
                                    }}
                                  >
                                    <div className="statusBox OnHold">
                                      On Hold
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="text-center clickBox">
                              <div className={`clickBoxtext`}>
                                {selectNewJobStatus ? (
                                  <div
                                    className={`progressBox ${selectNewJobStatus.replace(
                                      /\s+/g,
                                      ""
                                    )}`}
                                  >
                                    0%
                                  </div>
                                ) : (
                                  "No Data To Show"
                                )}
                              </div>
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
                                onClick={() =>
                                  setNewJobActiveBoxRight("SetDueDate")
                                }
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
                            <td className="px-3 text-start clickBox">
                              <div className={`clickBoxtext`}>Add Subtasks</div>
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
                              key={job.id}
                              className={`${showAddJoRow && "disabled"}`}
                            >
                              <td className="text-center">
                                <span className={`statusBtn ${job.status}`}>
                                  {StatusList[job.status]}
                                </span>
                              </td>
                              <td className="text-center">
                                <span
                                  className={`statusBtn progressBtn ${job.status}`}
                                >
                                  <bar
                                    className="bar"
                                    style={{ width: `${job.progress}%` }}
                                  >
                                    <text
                                      className="text"
                                      style={{ color: "#ffffff99" }}
                                    >
                                      {job.progress >= 51 &&
                                        (job.progress % 1 !== 0
                                          ? job.progress.toFixed(1)
                                          : job.progress) + "%"}
                                    </text>
                                  </bar>
                                  {job.progress <= 50 && (
                                    <text className="text">
                                      {job.progress % 1 !== 0
                                        ? job.progress.toFixed(1)
                                        : job.progress}
                                      %
                                    </text>
                                  )}
                                </span>
                              </td>
                              <td className="text-center">
                                {moment(job.due_date).local().format("L")}
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
                              <td className="text-center">
                                <div
                                  className="d-flex align-items-center justify-content-center flex-wrap"
                                  style={{ gap: "8px" }}
                                >
                                  <span className={`statusBtn mx-0 pending`}>
                                    Lodge Application
                                  </span>
                                  <span
                                    className={`statusBtn mx-0 in-progress`}
                                  >
                                    Action Notice
                                  </span>
                                  <span className={`statusBtn mx-0 on-hold`}>
                                    Action Notice
                                  </span>
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

                              {/* <td className="text-center">
                                <div className="listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                  <div className=" d-flex align-items-center justify-content-center">
                                    {job?.usersArray?.length > 0 && (
                                      <>
                                        {job?.usersArray
                                          ?.slice(0, 1)
                                          ?.map((user, index) => (
                                            <div
                                              key={index}
                                              className={`UserImg addedUserImages`}
                                              style={{
                                                minWidth: "40px",
                                                zIndex: index,
                                              }}
                                              // onClick={() =>
                                              //   toggleUserDropdown(i)
                                              // }
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
                                      </>
                                    )}
                                    {job.usersArray?.length === 0 && (
                                      <div
                                        className="UserImg"
                                        // onClick={() => toggleUserDropdown(i)}
                                        style={{ minWidth: "40px" }}
                                      >
                                        <User />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3">
                                <div className="jobDescriptionTextDiv">
                                  {job.latest_update}
                                </div>
                              </td>
                              <td className="text-center">
                                {job.is_archive !== "0" && (
                                  <button
                                    className={`checkBtn h-100`}
                                    onClick={(e) => e.preventDefault}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="25"
                                      height="25"
                                      viewBox="0 0 15 15"
                                    >
                                      <rect
                                        width="100%"
                                        height="100%"
                                        fill="none"
                                      />
                                      <path
                                        fill="none"
                                        stroke="#71E26E"
                                        d="M4 7.5L7 10l4-5"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </td>

                              <td className="text-center ">
                                {job.assessment_manager}
                              </td>
                              <td className="text-center ">
                                {formatDate(job.latest_comment)}
                              </td>
                              <td className="text-center ">
                                {job?.operative_id && (
                                  <div className="listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                    <div className=" d-flex align-items-center justify-content-center">
                                      {job?.usersArray?.length > 0 && (
                                        <>
                                          {job?.usersArray
                                            .filter(
                                              (selectedId) =>
                                                selectedId !== job?.operative_id
                                            )
                                            ?.map((user, index) => (
                                              <div
                                                key={index}
                                                className={`UserImg addedUserImages`}
                                                style={{
                                                  minWidth: "40px",
                                                  zIndex: index,
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
                                        </>
                                      )}
                                      {job.usersArray?.length === 0 && (
                                        <div
                                          className="UserImg m-0"
                                          style={{ minWidth: "40px" }}
                                        >
                                          <User />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="text-center ">
                                {formatDate(job.created_at)}
                              </td>
                              <td className="text-center ">
                                {job.eofy !== "0" && (
                                  <button
                                    className={`checkBtn h-100`}
                                    onClick={(e) => e.preventDefault}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="25"
                                      height="25"
                                      viewBox="0 0 15 15"
                                    >
                                      <rect
                                        width="100%"
                                        height="100%"
                                        fill="none"
                                      />
                                      <path
                                        fill="none"
                                        stroke="#71E26E"
                                        d="M4 7.5L7 10l4-5"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </td>
                              <td className="text-center ">
                                {job.linkedin_post !== "0" && (
                                  <button
                                    className={`checkBtn h-100`}
                                    onClick={(e) => e.preventDefault}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="25"
                                      height="25"
                                      viewBox="0 0 15 15"
                                    >
                                      <rect
                                        width="100%"
                                        height="100%"
                                        fill="none"
                                      />
                                      <path
                                        fill="none"
                                        stroke="#71E26E"
                                        d="M4 7.5L7 10l4-5"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </td> */}
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

          <div className="JobsHeading paginationDiv">
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Jobs;
