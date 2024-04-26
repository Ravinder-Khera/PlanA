import React, { useEffect, useRef, useState } from "react";
import { AddIcon, BellIcon, CrossIcon, FilterIcon, Search, User } from "../../assets/svg";
import "./Jobs.scss";
import { DeleteIcon } from "../../assets/svg";
import { deleteJobs, getJobs, getJobsByFilter } from "../../services/auth";
import { Bars } from "react-loader-spinner";
import { toast } from "react-toastify";
import moment from "moment";
import Filter from "../../Components/Filter/Filter";
import JobModal from "../../Components/JobModal/Edit/JobModal";
import { StatusList } from "../../helper";
import Add from "../../Components/JobModal/Add/Add";
import { useLocation } from "react-router-dom";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const filterRef = useRef(null);
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [reloadTabs, setReloadTabs] = useState(false);
  const notificationRef = useRef(null);
  const taskMobileScrollRef = useRef(null);
  const [searchedInput, setSearchedInput] = useState("");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      time: '1 min',
      icon: 'user',
      type: 'fullColor',
      heading: 'Notification Heading',
      description: 'Notification Description goes here',
    },
    {
      id: 2,
      time: '1 hour ',
      icon: 'info',
      type: 'password',
      heading: 'Notification Heading',
      description: 'Notification Description goes here',
    },
    {
      id: 3,
      time: '2 hours',
      icon: 'fail',
      type: 'failed',
      heading: 'Notification Heading',
      description: 'Notification Description goes here',
    },
  ]);

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  useEffect(() => {
    if (showJobModal && taskMobileScrollRef.current) {
      handleTScroll();
    }
  }, [showJobModal]);

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
    setCurrentPage(pageNumber)
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
        setTotalPages(res?.res.last_page)
        setPageUrls(res?.res.links.slice(1, -1))
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
        toast.success(`${response.res.message}`);
      } else {
        console.error("jobs delete failed:", response.error);
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

  const handleStatusFilter = async (_status) => {
    setLoading(true);
    try {
      const filterString = `status=${_status}`;
      const res = await getJobsByFilter(filterString);
      const { data } = res?.res;
      setFilteredJobs(data);
    } catch (error) {
      console.log("error while filtering", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const bodyScroll = document.getElementById('rightSCroll')
    if (showJobModal) {
      bodyScroll.style.overflow = "hidden";
    } else {
      bodyScroll.style.overflow = "auto"; 
    }

    return () => {
      bodyScroll.style.overflow = "auto";
    };
  }, [showJobModal]);

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

      {showJobModal && (
        <JobModal
          data={getJob.data}
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
        <div className="JobsHeading position-relative d-flex justify-content-between align-items-center gap-3 flex-wrap" style={{zIndex:'2'}}>
          <div className="d-flex gap-3 flex-wrap leftGap align-items-center">
            <h2>Jobs</h2>
            <div className="navSearchDiv jobSearchDiv">
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
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="d-flex gap-3 flex-wrap align-items-center">
            <div className="navSearchTab">
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
            </div>
            <div className="addjobs addJobsMobile">
              <span>Add Job</span>
              <div className="addJobIcon" onClick={() => setShowAddModal(true)}>
                <AddIcon />
              </div>
              <div className="notifyIcon">
                <div className="addNewTaskDiv">
                  <div className="bellIcon addTaskJobDiv" style={{cursor:'pointer'}}>
                    <div onClick={()=>setNotificationDropDown(!notificationDropDown)}>
                      <BellIcon />
                    </div>
                    {notificationDropDown && (
                      <div
                        className="addTaskJobDropdown notificationDropdown right"
                        ref={notificationRef}
                      >
                        <div className="addTaskJobListScroll">
                          <div className="addTaskJobListItems">
                            {notifications.length > 0 ? notifications.map((notification) => (
                                <div key={notification.id} className={`notificationItems ${notification.type}`}>
                                  <div className="notificationTime">{notification.time}<br/>Ago</div>
                                  <div className="notificationContent">
                                    <div className={`notificationIcon ${notification.icon}`}>{notification.icon === 'user' ? <User /> : '!'}</div>
                                    <div className="notificationText">
                                      <h3>{notification.heading}</h3>
                                      <span>{notification.description}</span>
                                    </div>
                                    <div className="notificationCrossIcon" onClick={() => removeNotification(notification.id)}>
                                      <CrossIcon />
                                    </div>
                                  </div>
                                </div>
                              ))
                            : 
                                <div className={`notificationItems `}>
                                  <div className="notificationContent empty w-100">
                                    <div className="notificationTime"></div>
                                    <div className="notificationText">
                                      <h3>No Notification</h3>
                                    </div>
                                  </div>
                                </div>}

                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="JobsHeading d-flex align-items-center justify-content-between">
          <div className="delete-box">
            <div
              className="searchUserImg"
              style={{ cursor: "pointer", zIndex: 2 }}
              onClick={handleDelete}
            >
              <DeleteIcon />
            </div>
            <div className="delete-item">
              Delete {selectedJobs.length} Item(s)
            </div>
          </div>
          <div
            className="d-flex  align-items-baseline pe-md-4 addNewTaskDiv "
            style={{ cursor: "pointer" }}
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
                        <div className="headerDiv">Due/FUP On</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs &&
                      filteredJobs?.length > 0 ?
                      filteredJobs?.map((job, index) => (
                        <tr key={index}>
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
                              className={`stageBtn btn_${findNearestStage(
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
                              <h6>{job.description}</h6>
                            </div>
                          </td>
                          <td className="text-center">
                            {moment(job.due_date).local().format("L")}
                          </td>
                        </tr>
                      )) :
                      <tr>
                        <td></td>
                        <td className="text-center">
                            <span
                              className={`stageBtn btn_`}
                            >
                              No Results Found
                            </span>
                          </td>
                        </tr>
                      }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="right-side">
            <div className="first-table">
              <div
                className="table-responsive"
                style={{ maxWidth: divWidth - 800 }}
              >
                <div className="job_table_outer_div">
                  <table className="table table-borderless text-light">
                    <thead>
                      <tr>
                        <th scope="col">
                          <div className="headerDiv">Job Manager</div>
                        </th>
                        <th scope="col">
                          <div className="headerDiv">Latest Update</div>
                        </th>
                        <th scope="col">
                          <div className="headerDiv">Status</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs &&
                        filteredJobs?.length > 0 &&
                        filteredJobs?.map((job) => (
                          <tr key={job.id}>
                            <td className="text-center">
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
                            <td className="text-center d-flex align-items-center">
                              <span className={`statusBtn ${job.status}`}>
                                {StatusList[job.status]}
                              </span>
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
                {filteredJobs &&
                  filteredJobs?.length > 0 ?
                    filteredJobs?.map((job, index) => (
                      <li key={index}>
                        <div className="jobBox">
                          <div className="jobItem">
                          <div className="jobHeading">Select </div>
                            <div  className="text-center">
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
                          <div className="jobItem" style={{minHeight:'40px'}}>
                            <div className="jobHeading">Job No.</div>
                            <div className="text-center">
                              <span
                                className={`stageBtn btn_${findNearestStage(
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
                    )):
                  <li className="text-center">
                    <span
                      className={`stageBtn btn_`}
                    >
                      No Results Found
                    </span>
                  </li>
                }
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="JobsHeading paginationDiv">
          <div className="paginationSections">
            <div className="btnDiv">
              <button className="prevBtn" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
              <button className="prevBtn mobile" onClick={handlePrevPage} disabled={currentPage === 1}>{'<'}</button>
            </div>
            <div className="pageNoDiv">
              {pageUrls && currentPage >= 4 &&
                <button disabled className='pageBtn pageDots' >...</button>
              }
              {pageUrls && pageUrls.filter((item, index) => Math.abs(index - currentPage + 1) <= (currentPage < 3 ? 3 : currentPage > pageUrls.length - 2 ? 3 : 2)).map((link, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(link.url)}
                  className={`${link.active && 'activePageBtn'} pageBtn`}
                >
                    {link.label}
                </button>
              ))}
              {pageUrls && currentPage <= pageUrls.length - 3 &&
                <button disabled className='pageBtn pageDots' >...</button>
              }
            </div>
            <div className="btnDiv">
              <button className="nextBtn" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
              <button className="nextBtn mobile" onClick={handleNextPage} disabled={currentPage === totalPages}>{'>'}</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Jobs;
