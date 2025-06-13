import { useEffect, useRef, useState } from "react";
import { CrossIcon, FilterCrossIcon, TickIcon } from "../../assets/svg";
import { StageListMapFromDB, StatusList } from "../../helper";
import {
  getJobsByFilter,
  getTasksByUser,
  getTaskStages
} from "../../services/api";
import "./style.scss";

const TaskFilter = ({
  setFilteredTasks,
  setFilteredString,
  setFilteredQuery,
  setLoading,
  closeFilter,
  isOn
}) => {
  const [showSelectFIlter, setSelectShowFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const [startDate, setStartDate] = useState("YYYY-MM-DD");
  const [endDate, setEndDate] = useState("YYYY-MM-DD");
  const [searchedInput, setSearchedInput] = useState("");
  const [selectedField, setSelectedField] = useState("");

  const [filtersSeleted, setFiltersSeleted] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [stageList, setStageList] = useState([]);
  const [dueThisWeek, setDueThisWeek] = useState(false)
  const [dueIn14Days, setDueIn14Days] = useState(false)
  const filterJobDropdownRef = useRef(null);

  const [filterQuery, setFilterQuery] = useState({ perPage: 100 });
  const fetchStages = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      let response = await getTaskStages(authToken);

      if (response.res) {
        console.log(response.res)
        let tempArray = response.res?.map(res => ({...res, title: StageListMapFromDB[res.title]}))
        console.log(tempArray)
        setStageList(tempArray);
      } else {
        console.error("Failed to fetch Users:", response.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    let handler = (e) => {
      if (
        filterJobDropdownRef.current &&
        !filterJobDropdownRef.current.contains(e.target)
      ) {
        setSelectShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handler);
    fetchStages();
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const handleResetFields = () => {
    setShowDatePicker(false);
    setStartDate("YYYY-MM-DD");
    setEndDate("YYYY-MM-DD");
    setSelectionRange({
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    });
    setSearchedInput("");
  };

  const handleApply = async () => {
    let filterString = "";
    if (selectedField === "due_date") {
      filterString = `start_date=${startDate}&end_date=${endDate}`;
    } else if (selectedField === "status") {
      const value = Object.keys(StatusList).find(
        (key) => StatusList[key] === searchedInput
      );
      filterString = `${selectedField}=${value}`;
    } else {
      filterString = `${selectedField}=${searchedInput}`;
    }
    setLoading(true);
    try {
      const response = await getJobsByFilter(filterString);
      if (!response.error) {
        setFilteredTasks(response?.res?.data);
        handleResetFields();
        closeFilter();
      }
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setSelectedFilters([]);
    setFiltersSeleted(false);
    setFilterQuery({});
    closeFilter();
  };

  const handleselectFilter = (type, value) => {
    console.log('type, value', type, value);
    setFilterQuery((prevQuery) => {
      if (type === "status") {
        return {
          ...prevQuery,
          status: [...(prevQuery.status || []), value],
        };
      }
      if (type === "due_this_week") {
        return {
          ...prevQuery,
          due_this_week: value,
        };
      }
      if (type === "due_in_14_days") {
        return {
          ...prevQuery,
          due_in_14_days: value,
        };
      }
      if (type === "stage_id") {
        return {
          ...prevQuery,
          stage_id: [...(prevQuery.stage_id || []), value],
        };
      }
      return prevQuery;
    });
  };

  const handleRemoveFilter = (type, value) => {
    setFilterQuery((prevQuery) => {
      if (type === "status") {
        return {
          ...prevQuery,
          status: prevQuery.status?.filter((status) => status !== value),
        };
      }

      if (type === "stage_id") {
        return {
          ...prevQuery,
          stage_id: prevQuery.stage_id?.filter(
            (id) => id !== value
          ),
        };
      }

      if (type === "due_in_14_days") {
        return {
          ...prevQuery,
          due_in_14_days: !value,
        };
      }
      if (type === "due_this_week") {
        return {
          ...prevQuery,
          due_this_week: !value,
        };
      }

      return prevQuery;
    });
  };

  const handleFilterClick = (filter, className, type, value) => {
    const filterObj = { filter, className, type, value };
    if (!selectedFilters.some((item) => item.filter === filter)) {
      setSelectedFilters([...selectedFilters, filterObj]);
      setFiltersSeleted(true);
    }
  };

  const handleFilterRemove = (value) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.filter((item) => item.value !== value)
    );

    if (selectedFilters.length === 1) {
      setFiltersSeleted(false);
    }
  };



  const handleFilterApply = async () => {
    setLoading(true);
    try {
      setFilteredString(selectedFilters);
      setFilteredQuery(filterQuery);
      const response = await getTasksByUser(filterQuery,isOn ? 'completed=true':'non_completed=true');
      if (!response.error) {
        setFilteredTasks(response?.res?.data);
        closeFilter();
      }
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="filterJobsDiv">
        <div
          className="filterJobsDivBg"
          style={{ maxHeight: `${filtersSeleted ? 394 : 180}px` }}
        >
          <div className="filterJobsDivHeading">Filter By</div>
          {filtersSeleted && (
            <>
              <div className="FilterBoxes selectedFilters">
                {selectedFilters.map((item, index) => (
                  <div
                    key={index}
                    className={`selectedFilterItem ${item.className}`}
                    onClick={() => {
                      handleFilterRemove(item.value);
                      handleRemoveFilter(item.type, item.value);
                    }}
                  >
                    {item.filter}
                    <FilterCrossIcon />
                  </div>
                ))}
              </div>
              <div className="divider" />
            </>
          )}
          <div className="FilterBoxes selectFilters">
          {!isOn && <>
            <div
              className="filterStatusBox NotStarted"
              onClick={() => {
                handleFilterClick(
                  "Not Started",
                  "filterStatusBox NotStarted",
                  "status",
                  "not-started"
                );
                handleselectFilter("status", "not-started");
              }}
            >
              Not Started
            </div>
           
            <div
              className="filterStatusBox InProgress"
              onClick={() => {
                handleFilterClick(
                  "In Progress",
                  "filterStatusBox InProgress",
                  "status",
                  "in-progress"
                );
                handleselectFilter("status", "in-progress");
              }}
            >
              In Progress
            </div></>
}
            {/* <div
              className="filterStatusBox OnHold"
              onClick={() => {
                handleFilterClick(
                  "On Hold",
                  "filterStatusBox OnHold",
                  "status",
                  "on-hold"
                );
                handleselectFilter("status", "on-hold");
              }}
            >
              On Hold
            </div> */}
            {isOn &&
            <div
              className="filterStatusBox Completed"
              onClick={() => {
                handleFilterClick(
                  "Completed",
                  "filterStatusBox Completed",
                  "status",
                  "completed"
                );
                handleselectFilter("status", "completed");
              }}
            >
              Completed
            </div>}

           
            {stageList?.length > 0 &&
              stageList?.map((stage) => {
                return (
                  <div
                    className={`filterStatusBox ${stage?.title?.includes("Design") ? "stage_Design" : `stage_${stage?.title}`}`}
                    onClick={() => {
                      handleFilterClick(
                        stage?.title,
                        `filterStatusBox ${stage?.title?.includes("Design") ? "stage_Design" : `stage_${stage?.title}`}`,
                        "stage_id",
                        stage?.id
                      );
                      handleselectFilter("stage_id", stage?.id);
                    }}
                  >
                    {stage.title}
                  </div>
                );
              })}
               <div
              className="filterProgressBox InProgress"
              onClick={() => {
                const tempValue = !dueThisWeek;
                setDueThisWeek(tempValue)
                handleFilterClick(
                  "Due This Week",
                  "filterProgressBox InProgress",
                  "due_this_week",
                  tempValue
                );
                handleselectFilter("due_this_week", tempValue);
              }}
            >
              Due This Week
            </div>
            <div
              className="filterProgressBox Undefined"
              onClick={() => {
                const tempValue = !dueIn14Days;
                setDueIn14Days(tempValue)
                handleFilterClick(
                  "<14 Days Left",
                  "filterProgressBox Undefined",
                  "due_in_14_days",
                  tempValue
                );
                handleselectFilter("due_in_14_days", tempValue);
              }}
            >
              {"<"}14 Days Left
            </div>
          </div>
          {filtersSeleted && (
            <>
              <div
                className="filterBtnBox confirmBox"
                onClick={handleFilterApply}
              >
                <span>
                  <TickIcon />
                </span>
                <p>Confirm Choices</p>
              </div>
              <div className="filterBtnBox cancelBox" onClick={handleCancel}>
                <span>
                  <CrossIcon />
                </span>
                <p>Cancel Filter</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskFilter;
