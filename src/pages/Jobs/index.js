import React, { useEffect, useRef, useState } from "react";
import { AddIcon, BellIcon, Search, User } from "../../assets/svg";
import "./Jobs.scss";
import { DeleteIcon } from "../../assets/svg";
import { getJobs } from "../../services/auth";
import { Bars } from "react-loader-spinner";
import moment from "moment";

const Jobs = () => {
  const [isChecked, setIsChecked] = useState({});
  const [jobs, setJobs] = useState();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const [divWidth, setDivWidth] = useState(0);

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
    window.addEventListener('resize', updateDivWidth);

    return () => {
        window.removeEventListener('resize', updateDivWidth);
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

  const toggleCheckbox = (id) => {
    setIsChecked((prevCheckboxes) => ({
      ...prevCheckboxes,
      [id]: !prevCheckboxes[id],
    }));
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
                <div class="jobtaskTab ">To Do</div>
                <div class="jobtaskTab active">Completed</div>
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
            <div className="searchUserImg">
              <DeleteIcon />
            </div>
            <div className="delete-item">Delete 1 Item(s)</div>
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
                        <label htmlFor={`select_1`}>
                          <input
                            type="checkbox"
                            checked={isChecked[`select_1`]}
                            onChange={() => toggleCheckbox(`select_1`)}
                            id={`select_1`}
                            style={{ display: "none" }}
                          />
                          {isChecked[`select_1`] ? (
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
                      jobs?.length &&
                      jobs?.map((job) => (
                        <tr key={job.id}>
                          <th scope="row" className="text-center">
                            {" "}
                            <label htmlFor={`select_1`}>
                              <input
                                type="checkbox"
                                checked={isChecked[`select_1`]}
                                onChange={() => toggleCheckbox(`select_1`)}
                                id={`select_1`}
                                style={{ display: "none" }}
                              />
                              {isChecked[`select_1`] ? (
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
                            <span className={`${job.id % 2 ? "blue" : "violet"}`}>
                              23-313
                            </span>
                          </td>
                          <td>
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
              <div className="table-responsive" style={{maxWidth: divWidth-800}}>

              <div className="job_table_outer_div"  >
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
                      jobs?.length &&
                      jobs?.map((job) => (
                        <tr key={job.id}>
                          <td className="text-center">
                            <div className="userImagesCol">
                              <div className="searchUserImg">
                                <User />
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="jobDescriptionTextDiv">
                              Latest update and comments will be listed here <br />
                            for the user to easily see without having to open a
                            project.
                            </div>
                          </td>
                          <td className="text-center">
                            <span
                              className={`${
                                job.status === "in-progress" ? "orange" : "violet"
                              }`}
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
