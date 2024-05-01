import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import moment from "moment";
import { getJobs } from "../../services/auth";
import { TaskIcon, User } from "../../assets/svg";
import { useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";

function Timeline({ timeFrame, loadNo ,setSelectedJob }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const excessCalendarDate =
    timeFrame !== undefined && timeFrame === "weekly"
      ? 3
      : timeFrame === "monthly"
      ? 7
      : 1;
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(new Date().getDate() - excessCalendarDate),
    endDate: new Date(new Date().getDate() + excessCalendarDate),
    key: "selection",
  });
  const [selectDate, setSelectDate] = useState(false);

  const [scrollPerformed, setScrollPerformed] = useState(false);
  const currentDayRef = useRef(null);
  const selectDateRef = useRef(null);

  useEffect(() => {
    if (loadNo && !scrollPerformed) {
      if (currentDayRef.current) {
        currentDayRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setScrollPerformed(true);
      }
    }
  }, [loadNo, scrollPerformed]);

  useEffect(() => {
    let handler = (e) => {
      if (selectDateRef.current && !selectDateRef.current.contains(e.target)) {
        setSelectDate(false);
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

  const setSelectionRangeFromJobs = useCallback(
    (jobs) => {
      if (jobs.length === 0) return;
      let minCreatedAt = new Date(jobs[0].created_at);
      let maxDueDate = new Date(jobs[0].due_date);

      jobs.forEach((job) => {
        const createdAt = new Date(job.created_at);
        const dueDate = new Date(job.due_date);

        if (createdAt < minCreatedAt) {
          minCreatedAt = createdAt;
        }

        if (dueDate > maxDueDate) {
          maxDueDate = dueDate;
        }
      });

      const currentDate = new Date();
      const adjustedStartDate = new Date(currentDate);
      const minsDaysAre = timeFrame !== undefined && timeFrame === "weekly" ? 3 : timeFrame === "monthly" ? 7 : 3 ;
      adjustedStartDate.setDate(currentDate.getDate() - minsDaysAre);

      // Adjust endDate to one month more
      let adjustedEndDate = new Date(maxDueDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + excessCalendarDate);

      const differenceInDays = (adjustedEndDate - adjustedStartDate) / (1000 * 60 * 60 * 24);

      if(timeFrame !== undefined && timeFrame === "weekly"){
        if (differenceInDays < 10) {
          adjustedEndDate = new Date(adjustedEndDate.getTime() + (10 - differenceInDays) * 24 * 60 * 60 * 1000);
        }
      } else if(timeFrame !== undefined && timeFrame === "monthly") {
        if (differenceInDays < 40) {
          adjustedEndDate = new Date(adjustedEndDate.getTime() + (40 - differenceInDays) * 24 * 60 * 60 * 1000);
        }
      }

      // Set selectionRange
      setSelectionRange({
        startDate: adjustedStartDate,
        endDate: adjustedEndDate,
        key: "selection",
      });
    },
    [excessCalendarDate, timeFrame]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await getJobs();
        const data = res?.res?.data;
        if (data) {
          setJobs(data);
          extractUsersFromStages(data);
          setSelectionRangeFromJobs(data);
          console.log("data", data);
        }
      } catch (error) {
        console.log("error while fetching jobs", error);
      } finally {
        setLoading(false);
      }
    };
    const setSelectionRangeFromJobs = (jobs) => {
      if (jobs.length === 0) return;
      let minCreatedAt = new Date(jobs[0].created_at);
      let maxDueDate = new Date(jobs[0].due_date);

      jobs.forEach((job) => {
        const createdAt = new Date(job.created_at);
        const dueDate = new Date(job.due_date);

        if (createdAt < minCreatedAt) {
          minCreatedAt = createdAt;
        }

        if (dueDate > maxDueDate) {
          maxDueDate = dueDate;
        }
      });

    const currentDate = new Date();
    const adjustedStartDate = new Date(currentDate);
    const minsDaysAre = timeFrame !== undefined && timeFrame === "weekly" ? 3 : timeFrame === "monthly" ? 7 : 3 ;
    adjustedStartDate.setDate(currentDate.getDate() - minsDaysAre);

      // Adjust endDate to one month more
      let adjustedEndDate = new Date(maxDueDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + excessCalendarDate);

      const differenceInDays = (adjustedEndDate - adjustedStartDate) / (1000 * 60 * 60 * 24);

      if(timeFrame !== undefined && timeFrame === "weekly"){
        if (differenceInDays < 10) {
          adjustedEndDate = new Date(adjustedEndDate.getTime() + (10 - differenceInDays) * 24 * 60 * 60 * 1000);
        }
      } else if(timeFrame !== undefined && timeFrame === "monthly") {
        if (differenceInDays < 40) {
          adjustedEndDate = new Date(adjustedEndDate.getTime() + (40 - differenceInDays) * 24 * 60 * 60 * 1000);
        }
      }

      // Set selectionRange
      setSelectionRange({
        startDate: adjustedStartDate,
        endDate: adjustedEndDate,
        key: "selection",
      });
    };
    try {
      fetchJobs();
    } catch (error) {
      console.log(error);
    } finally {
      if (currentDayRef.current) {
        currentDayRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [excessCalendarDate, setSelectionRangeFromJobs, timeFrame]);

  const formatDate = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = days[date.getDay()];
    return [date.getDate(), day];
  };

  const isCurrentDay = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const getAllDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const selectedDates = getAllDatesInRange(
    selectionRange.startDate,
    selectionRange.endDate
  );

  const countDatesByMonth = (dates) => {
    const monthCounts = {};

    dates.forEach((date) => {
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthCounts[monthKey]) {
        monthCounts[monthKey] = 1;
      } else {
        monthCounts[monthKey]++;
      }
    });

    return monthCounts;
  };

  const datesByMonthCount = countDatesByMonth(selectedDates);

  const jobIdsForDates = selectedDates.map((date) => {
    const relevantJobs = jobs.filter((job) => {
      const jobStartDate = moment(job.created_at);
      const jobEndDate = moment(job.due_date);
      return (
        jobStartDate.isSameOrBefore(date, "day") &&
        jobEndDate.isSameOrAfter(date, "day")
      );
    });
    return relevantJobs.map((job) => job.id);
  });

  const maxLength = Math.max(...jobIdsForDates.map((arr) => arr.length));

  const rows = [];

  for (let i = 0; i < maxLength; i++) {
    const row = [];
    selectedDates.forEach((date, index) => {
      const jobId = jobIdsForDates[index].find((id) => {
        const jobStartDate = moment(
          jobs.find((job) => job.id === id).created_at
        );
        const jobEndDate = moment(jobs.find((job) => job.id === id).due_date);
        return (
          jobStartDate.isSameOrBefore(date, "day") &&
          jobEndDate.isSameOrAfter(date, "day")
        );
      });

      row.push(jobId || 0);
    });
    rows.push(row);
  }

  const adjustedRows = [];
  rows.forEach((row) => {
    const newRow = [];
    let jobIdFound = false;
    row.forEach((id) => {
      if (id !== 0 && !jobIdFound) {
        newRow.push(id);
        jobIdFound = true;
      } else {
        newRow.push(0);
      }
    });
    adjustedRows.push(newRow);
  });

  const jobCellActive = document.querySelector(".jobCell.active");
  const cellWidth =
    timeFrame !== undefined && timeFrame === "weekly"
      ? 140
      : timeFrame === "monthly"
      ? 40
      : jobCellActive?.offsetWidth;

    const formattedStartDate = selectionRange.startDate.toLocaleDateString(
      "en-AU",
      { day: "numeric", month: "short", year: "numeric" }
    );
    const formattedEndDate = selectionRange.endDate.toLocaleDateString("en-Au", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const formatJobDate = (dateString) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    };
    
    const formatJobDates = (date) => {
      const formattedJobDAte = formatJobDate(date);
      return formattedJobDAte;
    };

    const handleSelect = (ranges) => {
      setSelectionRange(ranges.selection);
      const startDate = ranges.selection.startDate;
      let endDate = ranges.selection.endDate;
      
      const differenceInMs = endDate.getTime() - startDate.getTime();
      const differenceInDays = differenceInMs / (1000 * 3600 * 24);

      const roundedDifference = Math.round(differenceInDays);
      if(timeFrame !== undefined && timeFrame === "weekly"){
        if (roundedDifference < 10) {
          endDate = new Date(endDate.getTime() + (10 - roundedDifference) * 24 * 60 * 60 * 1000);
        }
      } else if(timeFrame !== undefined && timeFrame === "monthly") {
        if (roundedDifference < 40) {
          endDate = new Date(endDate.getTime() + (40 - roundedDifference) * 24 * 60 * 60 * 1000);
        }
      }
      
      setSelectionRange({
        startDate: startDate,
        endDate: endDate,
        key: "selection",
      });
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
      <div className="mapContainerDiv">
        <div className="DashboardHeading d-flex justify-content-between align-items-center position-relative">
          <div className="datePickerText addNewTaskBtn d-flex align-items-center gap-0 justify-content-end navMenuDiv p-0 bg-transparent shadow-none">
            <div onClick={() => setSelectDate(!selectDate)}>
              <TaskIcon />
              {formattedStartDate}-{formattedEndDate}
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
        </div>
        <div
          className="customTimeline"
          style={{
            height: `calc(100vh - ${
              timeFrame && timeFrame === "weekly"
                ? "410px"
                : timeFrame === "monthly"
                ? "245px"
                : ""
            })`,
          }}
        >
          <div className="timeLineFixedTop">
            <div className="timelineHeader timelineMonthsRow">
              {Object.entries(datesByMonthCount).map(([monthKey, count]) => {
                const [year, month] = monthKey.split("-");
                const monthName = new Date(year, month, 1).toLocaleString(
                  "default",
                  { month: "long" }
                );
                return (
                  <div
                    key={`month-${year}-${month}`}
                    className="monthLabel"
                    style={{
                      minWidth: `calc(${count} * ${
                        timeFrame !== undefined && timeFrame === "weekly"
                          ? 140
                          : timeFrame === "monthly"
                          ? 40
                          : ""
                      }px)`,
                    }}
                  >
                    {monthName}-{year}
                  </div>
                );
              })}
            </div>
            <div className="timelineHeader timelineDaysRow">
              {selectedDates.map((date) => (
                <div
                  key={date}
                  style={{
                    minWidth:
                      timeFrame && timeFrame === "weekly"
                        ? "140px"
                        : timeFrame === "monthly"
                        ? "40px"
                        : "",
                  }}
                  ref={isCurrentDay(date) ? currentDayRef : null}
                  className={`timeLineDateDiv ${
                    isCurrentDay(date) && "current-day"
                  }`}
                >
                  <div className="timeLineDate">{formatDate(date)[0]}</div>
                  <div className="timeLineDay">{formatDate(date)[1]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="timelineBody">
            {jobs.map((job) => {
              let activeColumnsCount = 0;
              return (
                <div key={job.id} className="jobRow">
                  {selectedDates.map((date, i) => {
                    const createdAt = new Date(job.created_at);
                    createdAt.setHours(0, 0, 0, 0);
                    const dueDate = new Date(job.due_date);
                    dueDate.setHours(0, 0, 0, 0);
                    const currentDate = new Date(date);
                    currentDate.setHours(0, 0, 0, 0);
                    const isFirst =
                      currentDate.getTime() === createdAt.getTime();
                    const isLast = currentDate.getTime() === dueDate.getTime();
                    if (currentDate >= createdAt && currentDate <= dueDate) {
                      activeColumnsCount++;
                    }
                    return (
                      <div
                        key={i}
                        style={{
                          minWidth:
                            timeFrame && timeFrame === "weekly"
                              ? "140px"
                              : timeFrame === "monthly"
                              ? "40px"
                              : "",
                        }}
                        className={`jobCell ${
                          currentDate >= createdAt &&
                          currentDate <= dueDate &&
                          findNearestStage(job) + " active"
                        } ${isFirst ? "first" : ""} ${isLast ? "last" : ""} ${
                          isCurrentDay(currentDate) && "current-day"
                        }`}
                      >
                        {currentDate >= createdAt && currentDate <= dueDate ? (
                          <div className="timeLineJob">
                            {isLast && (
                              <>
                                <div
                                  className="timeLineJobItem"
                                  onClick={() => { 
                                    if(timeFrame === "weekly"){
                                      setSelectedJob(job)
                                    }else{
                                      navigate("/jobs", { state: job })
                                    }
                                    }}>
                                  <div className={`jobProgressDiv ${timeFrame === "monthly" && activeColumnsCount <= 2 ? 'hidden' : ''}`}>
                                    <span className="text">
                                      Progress:{" "}
                                    </span>
                                    <span className="percentage">
                                      {job.progress % 1 !== 0
                                        ? job.progress.toFixed(2)
                                        : job.progress}
                                      %
                                    </span>
                                  </div>
                                  <div className={`jobDateDiv ${timeFrame === "monthly" && activeColumnsCount <= 2 ? 'hidden' : ''}`}>
                                    <span className="text">
                                      {formatJobDates(new Date(job.created_at))} - {formatJobDates(new Date(job.due_date))}
                                    </span>
                                  </div>
                                  <div
                                    className={`timeLineJobItemDiv ${timeFrame === "monthly" && activeColumnsCount <= 2 ? 'hidden' : ''} ${timeFrame === "weekly" && activeColumnsCount <= 1 ? 'hidden' : ''}`}
                                    style={{
                                      width: `calc(${cellWidth}px * ${activeColumnsCount})`,
                                    }}
                                  >
                                    <div className="jobBox d-flex gap-2 align-items-center justify-content-between h-100 p-3">
                                      <div
                                        className="jobProgressBg"
                                        style={{
                                          minWidth: `${job.progress}%`,
                                        }}
                                      ></div>
                                      <div className="textDiv">
                                        <span>
                                          |{job.id}|{job.title}
                                        </span>
                                        <p>{job.description}</p>
                                      </div>
                                      <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                        <div className=" d-flex align-items-center justify-content-end">
                                          {job.usersArray?.length > 0 ? (
                                            <>
                                              {job.usersArray?.length < 3 ? (
                                                <>
                                                  {job.usersArray.map(
                                                    (user, index) => (
                                                      <div
                                                        key={index}
                                                        className={` UserImg addedUserImages `}
                                                        style={{
                                                          minWidth: "40px",
                                                          zIndex: index,
                                                        }}
                                                      >
                                                        {user.profile_pic !==
                                                        "" && user.profile_pic !== 'default-profile-pic.jpg' ? (
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
                                                    )
                                                  )}
                                                </>
                                              ) : (
                                                <>
                                                  {job.usersArray
                                                    .slice(0, 3)
                                                    .map((user, index) => (
                                                      <div
                                                        key={index}
                                                        className={` UserImg addedUserImages ${
                                                          index === 2
                                                            ? "CountUsers"
                                                            : ""
                                                        }`}
                                                        style={{
                                                          minWidth: "40px",
                                                          zIndex: index,
                                                        }}
                                                      >
                                                        {index === 2 ? (
                                                          <>
                                                            {job.usersArray
                                                              .length - 2}
                                                            +
                                                          </>
                                                        ) : (
                                                          <>
                                                            {user.profile_pic !==
                                                            "" && user.profile_pic !== 'default-profile-pic.jpg' ? (
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
                                                          </>
                                                        )}
                                                      </div>
                                                    ))}
                                                </>
                                              )}
                                            </>
                                          ) : (
                                            ""
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                            <span className="timeLineDot">.</span>
                          </div>
                        ) : (
                          <div className="timeLineJob">
                            <span className="timeLineDot">.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="customTimeline mobile">
          <div className="timelineBody">
            {jobs.map((job) => {
              return (
                <div key={job.id} className="jobRow m-0 d-block">
                  <div className={`jobCell ${findNearestStage(job) + " active"}`}>
                    <div className="timeLineJob">
                      <div
                        className="timeLineJobItem position-relative"
                        onClick={() => {
                            navigate("/jobs", { state: job })
                          }}>
                        <div className={`jobProgressDiv `}>
                          <span className="text">
                            Progress:{" "}
                          </span>
                          <span className="percentage">
                            {job.progress % 1 !== 0
                              ? job.progress.toFixed(2)
                              : job.progress}
                            %
                          </span>
                        </div>
                        <div className={`timeLineJobItemDiv d-flex align-items-center`}  style={{minHeight:'140px'}}>
                          <div className="d-flex gap-2 align-items-center justify-content-between w-100 p-3">
                            <div
                              className="jobProgressBg"
                              style={{
                                width: `${job.progress}%`,
                              }}
                            ></div>
                            <div className="textDiv mobile">
                              <span>
                                |{job.id}|{job.title}
                              </span>
                              <p>{job.description}</p>
                            </div>
                            <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                              <div className=" d-flex align-items-center justify-content-end">
                                {job.usersArray?.length > 0 ? (
                                  <>
                                    {job.usersArray?.length < 3 ? (
                                      <>
                                        {job.usersArray.map(
                                          (user, index) => (
                                            <div
                                              key={index}
                                              className={` UserImg addedUserImages `}
                                              style={{
                                                minWidth: "40px",
                                                zIndex: index,
                                              }}
                                            >
                                              {user.profile_pic !==
                                              "" && user.profile_pic !== 'default-profile-pic.jpg' ? (
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
                                          )
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {job.usersArray
                                          .slice(0, 3)
                                          .map((user, index) => (
                                            <div
                                              key={index}
                                              className={` UserImg addedUserImages ${
                                                index === 2
                                                  ? "CountUsers"
                                                  : ""
                                              }`}
                                              style={{
                                                minWidth: "40px",
                                                zIndex: index,
                                              }}
                                            >
                                              {index === 2 ? (
                                                <>
                                                  {job.usersArray
                                                    .length - 2}
                                                  +
                                                </>
                                              ) : (
                                                <>
                                                  {user.profile_pic !==
                                                  "" && user.profile_pic !== 'default-profile-pic.jpg' ? (
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
                                                </>
                                              )}
                                            </div>
                                          ))}
                                      </>
                                    )}
                                  </>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Timeline;
