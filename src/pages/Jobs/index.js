import React, { useEffect, useRef, useState } from "react";
import { AddIcon, BellIcon, FilterIcon, Search, User } from "../../assets/svg";
import "./Jobs.scss";
import { DeleteIcon } from "../../assets/svg";
import { getJobs, getJobsByFilter } from "../../services/auth";
import { Bars } from "react-loader-spinner";
import { toast } from "react-toastify";
import moment from "moment";

const Jobs = () => {
  const [jobs, setJobs] = useState();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [status, setStatus] = useState("current-jobs");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs();
      const data = res?.res?.data;
      setJobs(data);
    } catch (error) {
      console.log("error while fetching jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const findNearestStage = (data) => {
    let nearestStage = null;
    let nearestDueDate = Infinity;

    data?.stages.forEach((stage) => {
      stage?.tasks.forEach((task) => {
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
      const ids = jobs.map(({ id }) => id);
      setSelectedJobs(ids);
    } else {
      setSelectedJobs([]);
    }
  };

  const handleDelete = () => {
    console.log("delete ids===>", selectedJobs);
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
        </>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );
      return;
    }
  };

  const handleStatusFilter = async (_status) => {
    setLoading(true);
    try {
      const filterString = `status=${_status}`;
      const res = await getJobsByFilter(filterString);
      console.log("res of filtered job", res);
      const { data } = res?.res;
      setJobs(data);
    } catch (error) {
      console.log("error while filtering", error);
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
      <div className="jobsBg">
        <div className="JobsHeading d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div className="d-flex leftGap align-items-center">
            <h2>Jobs</h2>
            <div className="navSearchDiv">
              <form>
                <div className="searchBox">
                  <div className="IconBox">
                    <Search />
                  </div>
                  <input
                    name="search"
                    placeholder="Search"
                    onChange={(e) => e.preventDefault}
                  />
                </div>
                <div className="searchUserImg">
                  <User />
                </div>
              </form>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="navSearchTab">
              <div class="jobsTaskTabsDiv">
                <div
                  class={`jobtaskTab ${
                    status === "current-jobs" ? "active" : ""
                  }`}
                  onClick={() => {
                    setStatus("current-jobs");
                    handleStatusFilter("in-progress");
                  }}
                >
                  Current Jobs
                </div>
                <div
                  class={`jobtaskTab ${status === "completed" ? "active" : ""}`}
                  onClick={() => {
                    setStatus("completed");
                    handleStatusFilter("completed");
                  }}
                >
                  Completed
                </div>
              </div>
            </div>
            <div className="addjobs">
              <span>Add Job</span>
              <div className="addJobIcon">
                <AddIcon />
              </div>
              <div className="notifyIcon">
                <BellIcon />
              </div>
            </div>
          </div>
        </div>
        <div className="JobsHeading d-flex justify-content-between">
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
          <div className="job-filters">
            <FilterIcon /> <span>Filter</span>
          </div>
        </div>
        <div className="JobsContainer d-flex" ref={containerRef}>
          <div className="left-side">
            <div className="first-table">
              <div className="job_table_outer_div  ">
                <table class="table table-borderless text-light">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">
                        <label htmlFor={`select_all`}>
                          <input
                            type="checkbox"
                            checked={
                              selectedJobs &&
                              (selectedJobs?.length === jobs?.length)
                            }
                            id={`select_all`}
                            onChange={handleSelectAll}
                            style={{ display: "none" }}
                          />
                          {(selectedJobs?.length === jobs?.length) ? (
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
                    {jobs &&
                      jobs?.length > 0 &&
                      jobs?.map((job, index) => (
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
                              <h4>{job.title}</h4>
                              <h6>{job.description}</h6>
                            </div>
                          </td>
                          <td className="text-center">
                            {moment(job.due_date).local().format("L")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="right-side flex-1 w-100">
            <div className="first-table">
              <div
                className="table-responsive"
                style={{ maxWidth: divWidth - 800 }}
              >
                <div className="job_table_outer_div">
                  <table class="table table-borderless text-light">
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
                      {jobs &&
                        jobs?.length > 0 &&
                        jobs?.map((job) => (
                          <tr key={job.id}>
                            <td className="text-center">
                              <div className="userImagesCol">
                                <div className="searchUserImg">
                                  <User />
                                </div>
                              </div>
                            </td>

                            <td className="px-3">
                              <div className="jobDescriptionTextDiv">
                                {job.latest_update}
                              </div>
                            </td>
                            <td className="text-center">
                              <span
                                className={`statusBtn
                                ${job.status}`}
                              >
                                {job.status}
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
      </div>
    </>
  );
};

export default Jobs;
