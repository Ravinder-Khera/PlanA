import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import moment from "moment";
import { getJobs } from "../../services/auth";
import { User } from "../../assets/svg";
import { useNavigate } from "react-router-dom";

function Timeline({ timeFrame, loadNo }) {
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

  const [scrollPerformed, setScrollPerformed] = useState(false);
  const currentDayRef = useRef(null);

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

      // Adjust startDate to one month less
      const adjustedStartDate = new Date(minCreatedAt);
      adjustedStartDate.setDate(
        adjustedStartDate.getDate() - excessCalendarDate
      );

      // Adjust endDate to one month more
      const adjustedEndDate = new Date(maxDueDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + excessCalendarDate);

      // Set selectionRange
      setSelectionRange({
        startDate: adjustedStartDate,
        endDate: adjustedEndDate,
        key: "selection",
      });
    },
    [excessCalendarDate]
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

      // Adjust startDate to one month less
      const adjustedStartDate = new Date(minCreatedAt);
      adjustedStartDate.setDate(
        adjustedStartDate.getDate() - excessCalendarDate
      );

      // Adjust endDate to one month more
      const adjustedEndDate = new Date(maxDueDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + excessCalendarDate);

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
  }, [excessCalendarDate, setSelectionRangeFromJobs]);

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
        <div
          className="customTimeline"
          style={{
            maxHeight: `calc(100vh - ${
              timeFrame && timeFrame === "weekly"
                ? "375px"
                : timeFrame === "monthly"
                ? "210px"
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
                                    navigate("/jobs", { state: job });
                                  }}
                                >
                                  <div className="jobProgressDiv">
                                    Progress:{" "}
                                    <span>
                                      {job.progress % 1 !== 0
                                        ? job.progress.toFixed(2)
                                        : job.progress}
                                      %
                                    </span>
                                  </div>
                                  <div
                                    className="timeLineJobItemDiv"
                                    style={{
                                      width: `calc(${cellWidth}px * ${activeColumnsCount})`,
                                    }}
                                  >
                                    <div className="d-flex gap-2 align-items-center justify-content-between h-100 p-3">
                                      <div
                                        className="jobProgressBg"
                                        style={{
                                          width: `${job.progress}%`,
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
                                                        "" ? (
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
                                                            "" ? (
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
      </div>
    </>
  );
}

export default Timeline;
