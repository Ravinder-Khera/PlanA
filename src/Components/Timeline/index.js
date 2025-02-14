import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bars } from "react-loader-spinner";
import moment from "moment";
import { getJobs, getTimelineJobs } from "../../services/auth";
import {
  AttachmentIcon,
  CommentIcon,
  FilterIcon,
  TaskIcon,
  User,
} from "../../assets/svg";
import { useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";
import { formatJobNumber } from "../../pages/Jobs";
import {
  CALENDAR_YEAR,
  MAX_CALENDAR_YEAR,
  MIN_CALENDAR_YEAR,
} from "../../helper";

function Timeline({
  timeFrame,
  loadNo,
  selectedJob,
  setSelectedJob,
  reloadTask,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [filterString, setfilterString] = useState({
    label: "Select Filter",
    value: "",
  });
 
  const [excessCalendarDate, setExcessCalendarDate] = useState(
    timeFrame === "weekly" ? 12 : timeFrame === "monthly" ? 20 : 1
  );

  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(
      new Date().setDate(new Date().getDate() - excessCalendarDate)
    ),
    endDate: new Date(
      new Date().setDate(new Date().getDate() + excessCalendarDate)
    ),
    key: "selection",
  });
  const [selectDate, setSelectDate] = useState(false);

  const [scrollPerformed, setScrollPerformed] = useState(false);
  const currentDayRef = useRef(null);
  const selectDateRef = useRef(null);
  const filterRef = useRef(null);
  const [dateChanged, setDateChanged] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const controllerRef = useRef(null);
  const controllerRef2 = useRef(null);
  const [applyClicked, setApplyClicked] = useState(false);

  const statusFilterData = [
    {
      label: " Not Started",
      value: "not-started",
    },
    {
      label: "In Progress",
      value: "in-progress",
    },
    {
      label: "On Hold",
      value: "on-hold",
    },
    { label: "Pending", value: "pending" },
    {
      label: "Completed",
      value: "completed",
    },
  ];

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
    const updateExcessCalendarDate = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth > 2100) {
        if (timeFrame === "weekly") {
          setExcessCalendarDate(20);
        } else if (timeFrame === "monthly") {
          setExcessCalendarDate(60);
        } else {
          setExcessCalendarDate(1);
        }
      } else {
        setExcessCalendarDate(
          timeFrame === "weekly" ? 12 : timeFrame === "monthly" ? 20 : 1
        );
      }
    };
    updateExcessCalendarDate();
    window.addEventListener("resize", updateExcessCalendarDate);

    return () => {
      window.removeEventListener("resize", updateExcessCalendarDate);
    };
  }, [timeFrame]);

  useEffect(() => {
    let handler = (e) => {
      if (selectDateRef.current && !selectDateRef.current.contains(e.target)) {
        setDateChanged((prevValue) => !prevValue);
        setSelectDate(false);
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

  // const setSelectionRangeFromJobs = useCallback(
  //   (jobs) => {
  //     if (jobs.length === 0) return;
  //     let minCreatedAt = new Date(jobs[0].created_at);
  //     let maxDueDate = new Date(jobs[0].due_date);

  //     jobs.forEach((job) => {
  //       const createdAt = new Date(job.created_at);
  //       const dueDate = new Date(job.due_date);

  //       if (createdAt < minCreatedAt) {
  //         minCreatedAt = createdAt;
  //       }

  //       if (dueDate > maxDueDate) {
  //         maxDueDate = dueDate;
  //       }
  //     });

  //     const currentDate = new Date();
  //     const adjustedStartDate = new Date(currentDate);
  //     const minsDaysAre =
  //       timeFrame !== undefined && timeFrame === "weekly"
  //         ? 6
  //         : timeFrame === "monthly"
  //         ? 15
  //         : 6;
  //     adjustedStartDate.setDate(currentDate.getDate() - minsDaysAre);

  //     // Adjust endDate to one month more
  //     let adjustedEndDate = new Date(maxDueDate);
  //     adjustedEndDate.setDate(adjustedEndDate.getDate() + excessCalendarDate);

  //     const differenceInDays =
  //       (adjustedEndDate - adjustedStartDate) / (1000 * 60 * 60 * 24);

  //     if (timeFrame !== undefined && timeFrame === "weekly") {
  //       if (differenceInDays < 10) {
  //         adjustedEndDate = new Date(
  //           adjustedEndDate.getTime() +
  //             (10 - differenceInDays) * 24 * 60 * 60 * 1000
  //         );
  //       }
  //     } else if (timeFrame !== undefined && timeFrame === "monthly") {
  //       if (differenceInDays < 60) {
  //         adjustedEndDate = new Date(
  //           adjustedEndDate.getTime() +
  //             (60 - differenceInDays) * 24 * 60 * 60 * 1000
  //         );
  //       }
  //     }

  //     // Set selectionRange
  //     setSelectionRange({
  //       startDate: adjustedStartDate,
  //       endDate: adjustedEndDate,
  //       key: "selection",
  //     });
  //   },
  //   [excessCalendarDate, timeFrame]
  // );


  const setSelectionRangeFromJobs = useCallback(
    (jobs) => {
      let minCreatedAt, maxDueDate;
  
      if (jobs.length > 0) {
        minCreatedAt = new Date(jobs[0].created_at);
        maxDueDate = new Date(jobs[0].due_date);
  
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
      } else {
        // No jobs case: Set default range from (current date - 7) to (current date + 60)
        const today = new Date();
        const defaultStartDate = new Date(today);
        defaultStartDate.setDate(today.getDate() - 7);
  
        const defaultEndDate = new Date(today);
        defaultEndDate.setDate(today.getDate() + 60);
  
        setSelectionRange({
          startDate: defaultStartDate,
          endDate: defaultEndDate,
          key: "selection",
        });
        return;
      }
  
      const currentDate = new Date();
      const adjustedStartDate = new Date(currentDate);
      const minsDaysAre =
        timeFrame !== undefined && timeFrame === "weekly"
          ? 6
          : timeFrame === "monthly"
          ? 15
          : 6;
      adjustedStartDate.setDate(currentDate.getDate() - minsDaysAre);
  
      // Adjust endDate to one month more
      let adjustedEndDate = new Date(maxDueDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + excessCalendarDate);
  
      const differenceInDays =
        (adjustedEndDate - adjustedStartDate) / (1000 * 60 * 60 * 24);
  
      if (timeFrame !== undefined && timeFrame === "weekly") {
        if (differenceInDays < 10) {
          adjustedEndDate = new Date(
            adjustedEndDate.getTime() +
              (10 - differenceInDays) * 24 * 60 * 60 * 1000
          );
        }
      } else if (timeFrame !== undefined && timeFrame === "monthly") {
        if (differenceInDays < 60) {
          adjustedEndDate = new Date(
            adjustedEndDate.getTime() +
              (60 - differenceInDays) * 24 * 60 * 60 * 1000
          );
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
      // Abort previous request if exists
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      controllerRef.current = new AbortController(); // Create a new controller
      const signal = controllerRef.current.signal;
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };
      try {
        const res = await getTimelineJobs(
          formatDate(selectionRange.startDate),
          formatDate(selectionRange.endDate),
          filterString.value,
          signal
        );
        const data = res?.res?.jobs;
        if (data) {
          setJobs(data);
          extractUsersFromStages(data);
          if (!dateChanged) setSelectionRangeFromJobs(data);
          console.log("data", data);
        }
      } catch (error) {
        console.log("error while fetching jobs", error);
      } finally {
        setLoading(false);
      }
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
  }, [excessCalendarDate, timeFrame, dateChanged, applyFilter]);

  useEffect(() => {
    // Abort previous request if exists
    if (controllerRef2.current) {
      controllerRef2.current.abort();
    }
    controllerRef2.current = new AbortController(); // Create a new controller
    const signal = controllerRef2.current.signal;
    const fetchJobs = async () => {
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };
      try {
        const res = await getTimelineJobs(
          formatDate(selectionRange.startDate),
          formatDate(selectionRange.endDate),
          filterString.value,
          signal
        );
        const data = res?.res?.jobs;
        if (data) {
          if (selectedJob) {
            const filteredData = data.filter(
              (job) => job.id === selectedJob.id
            );
            setSelectedJob(filteredData[0]);
          }
          setJobs(data);
          extractUsersFromStages(data);
          setSelectionRangeFromJobs(data);
        }
      } catch (error) {
        console.log("error while fetching jobs", error);
      }
    };
    fetchJobs();
  }, [reloadTask]);

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
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${year}-${month}-${day}`;
  };

  const formatJobDates = (date) => {
    const formattedJobDAte = formatJobDate(date);
    return formattedJobDAte;
  };

  const handleSelect = (ranges) => {
    let startDate = new Date(ranges.selection.startDate);
    let endDate = new Date(ranges.selection.endDate);
    setDateChanged(false);
    // Ensure local time by resetting to start of the day
    startDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    endDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    const differenceInMs = endDate.getTime() - startDate.getTime();
    const differenceInDays = differenceInMs / (1000 * 3600 * 24);
    const roundedDifference = Math.round(differenceInDays);

    if (timeFrame === "weekly" && roundedDifference < 10) {
      endDate = new Date(
        endDate.getTime() + (10 - roundedDifference) * 24 * 60 * 60 * 1000
      );
    } else if (timeFrame === "monthly" && roundedDifference < 40) {
      endDate = new Date(
        endDate.getTime() + (40 - roundedDifference) * 24 * 60 * 60 * 1000
      );
    }

    setSelectionRange({
      startDate,
      endDate,
      key: "selection",
    });
  };

  const handleApplyFilter = () => {
    setApplyClicked(true);
    setApplyFilter((prevValue) => !prevValue);
    setShowFilter(false);
  };

  const handleCancelFilter = () => {
    if (applyClicked) setApplyFilter((prevValue) => !prevValue);
    setShowFilter(false);
    setfilterString({
      label: "Select Filter",
      value: "",
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
                minDate={
                  new Date(
                    new Date().setFullYear(
                      new Date().getFullYear() - MIN_CALENDAR_YEAR
                    )
                  )
                }
                maxDate={
                  new Date(
                    new Date().setFullYear(
                      new Date().getFullYear() + MAX_CALENDAR_YEAR
                    )
                  )
                }
              />
            </div>
          )}
          <div
            className="d-flex  align-items-baseline addNewTaskDiv position-relative"
            style={{ cursor: "pointer" }}
            ref={filterRef}
          >
            <div
              className="d-flex align-items-center gap-2  "
              onClick={() => {
                if (filterString?.value) {
                  setApplyClicked(true);
                } else {
                  setApplyClicked(false);
                }
                setShowFilterDropdown(true);
                setShowFilter(!showFilter);
              }}
            >
              <FilterIcon />
              <p style={{ color: "#E2E31F", fontSize: "14px", margin: "0" }}>
                Filter
              </p>
            </div>
            {showFilter && (
              <>
                <div className="dashboardFilterDropDown">
                  <div className="dashboardFilterDropDownContent">
                    <div
                      className="selectFilterDiv"
                      onClick={() => {
                        setShowFilterDropdown(!showFilterDropdown);
                      }}
                    >
                      <div className="selectBox">{filterString.label}</div>
                      <button onClick={handleApplyFilter}>Apply</button>
                      {filterString?.value !== "" && (
                        <button onClick={handleCancelFilter}>Clear</button>
                      )}
                    </div>
                    {showFilterDropdown && (
                      <div className="filterOptionsDiv">
                        <div className="filterOptionsScroll">
                          {statusFilterData?.map((status) => {
                            return (
                              <div
                                className={`filterOption ${
                                  filterString.value === status.value
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() => {
                                  if (filterString.value === status.value) {
                                    setfilterString({
                                      label: "Select Filter",
                                      value: "",
                                    });
                                  } else setfilterString(status);
                                }}
                              >
                                {status.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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
                const [year, month] = monthKey?.split("-");
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
                        className={`jobCell ${i === 5 && "first"} ${
                          i === 10 && "last"
                        } ${
                          currentDate >= createdAt &&
                          currentDate <= dueDate &&
                          findNearestStage(job) + " active"
                        } ${isFirst ? "first" : ""} ${isLast ? "last" : ""} ${
                          isCurrentDay(currentDate) && "current-day"
                        } ${job.status}`}
                      >
                        {currentDate >= createdAt && currentDate <= dueDate ? (
                          <div className="timeLineJob">
                            {isLast && (
                              <>
                                <div
                                  className="timeLineJobItem"
                                  onClick={() => {
                                    setSelectedJob(job);
                                  }}
                                >
                                  <div
                                    className={`timeLineJobItemDiv ${
                                      timeFrame === "monthly" &&
                                      activeColumnsCount <= 2
                                        ? "hidden"
                                        : ""
                                    } ${
                                      timeFrame === "weekly" &&
                                      activeColumnsCount <= 1
                                        ? "hidden"
                                        : ""
                                    }`}
                                    style={{
                                      width: `calc(${cellWidth}px * ${activeColumnsCount})`,
                                      maxWidth: `${
                                        activeColumnsCount <= 2
                                          ? "20px"
                                          : "max-content"
                                      }`,
                                    }}
                                  >
                                    <div className="jobBox d-flex gap-2 align-items-start justify-content-between flex-column h-100 p-3">
                                      <div
                                        className="jobProgressBg"
                                        style={{
                                          minWidth: `100%`,
                                        }}
                                      ></div>
                                      <div className="d-flex gap-2 align-items-start justify-content-between">
                                        <div className="textDiv">
                                          <span>
                                            | {formatJobNumber(job.job_num)} |
                                          </span>
                                          <p>{job.title}</p>
                                        </div>
                                        <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                          <div className=" d-flex align-items-center justify-content-end">
                                            <div className="collaboratorsBox justify-content-end">
                                              <div className=" d-flex align-items-center justify-content-center">
                                                {job?.collaborators?.length >
                                                  0 && (
                                                  <>
                                                    {job?.collaborators
                                                      ?.slice(0, 3)
                                                      .map((user, index) => {
                                                        const initials = user
                                                          ?.split(" ")
                                                          .map((part) =>
                                                            part
                                                              .charAt(0)
                                                              .toUpperCase()
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

                                                    {job?.collaborators
                                                      ?.length > 3 && (
                                                      <div
                                                        className={`collaboratorsBoxUser`}
                                                        style={{
                                                          minWidth: "40px",
                                                          zIndex: 1,
                                                        }}
                                                      >
                                                        +
                                                        {job?.collaborators
                                                          .length - 3}
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                                {job.collaborators?.length ===
                                                  0 && (
                                                  <div
                                                    className="collaboratorsBoxUser disabled m-0"
                                                    style={{ minWidth: "40px" }}
                                                  >
                                                    N/A
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="d-flex gap-2 align-items-start justify-content-end w-100 commentsBox">
                                        <div>
                                          <AttachmentIcon />{" "}
                                          <span>{job.attachments_count}</span>
                                        </div>
                                        <div>
                                          <CommentIcon />{" "}
                                          <span>{job.comments_count}</span>
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
                  <div className={`jobCell ${job.status + " active"}`}>
                    <div className="timeLineJob">
                      <div
                        className="timeLineJobItem position-relative"
                        onClick={() => {
                          navigate("/jobs", { state: job });
                        }}
                      >
                        <div className={`jobDateDiv `}>
                          <span className="text">
                            {formatJobDates(new Date(job.created_at))} -{" "}
                            {formatJobDates(new Date(job.due_date))}
                          </span>
                        </div>
                        <div
                          className={`timeLineJobItemDiv d-flex align-items-center`}
                          style={{ minHeight: "140px" }}
                        >
                          <div className="d-flex gap-2 align-items-center justify-content-between w-100 p-3">
                            <div
                              className="jobProgressBg"
                              style={{
                                width: `100%`,
                              }}
                            ></div>
                            <div className="textDiv mobile">
                              <span>
                                |{formatJobNumber(job.job_num)}|{job.title}
                              </span>
                              <p>{job.description}</p>
                            </div>
                            
                             <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                          <div className=" d-flex align-items-center justify-content-end">
                                            <div className="collaboratorsBox justify-content-end">
                                              <div className=" d-flex align-items-center justify-content-center">
                                                {job?.collaborators?.length >
                                                  0 && (
                                                  <>
                                                    {job?.collaborators
                                                      ?.slice(0, 3)
                                                      .map((user, index) => {
                                                        const initials = user
                                                          ?.split(" ")
                                                          .map((part) =>
                                                            part
                                                              .charAt(0)
                                                              .toUpperCase()
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

                                                    {job?.collaborators
                                                      ?.length > 3 && (
                                                      <div
                                                        className={`collaboratorsBoxUser`}
                                                        style={{
                                                          minWidth: "40px",
                                                          zIndex: 1,
                                                        }}
                                                      >
                                                        +
                                                        {job?.collaborators
                                                          .length - 3}
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                                {job.collaborators?.length ===
                                                  0 && (
                                                  <div
                                                    className="collaboratorsBoxUser disabled m-0"
                                                    style={{ minWidth: "40px" }}
                                                  >
                                                    N/A
                                                  </div>
                                                )}
                                              </div>
                                            </div>
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
