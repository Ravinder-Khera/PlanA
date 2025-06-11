import { useState } from "react";
import { FilterJobs } from "../../services/auth";

const Sort = ({
  setFilteredJobs,
  setFilteredString,
  setFilteredQuery,
  setLoading,
  closeFilter,
}) => {
  const [filterString, setfilterString] = useState({
    label: "Sort By",
    value: "",
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const statusFilterData = [
    {
      label: "Days Left",
      value: "",
    },
    {
      label: "Job Name - Alphabetical",
      value: "sort_by=job_name&sort_order=asc",
    },
    {
      label: "Job Number - Ascending",
      value: "sort_by=job_num&sort_order=asc",
    },
  ];

  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      const response = await FilterJobs({ perPage: 200 }, filterString.value);
      if (!response.error) {
        setFilteredJobs(response?.res?.data);
      }
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFilter = async () => {
    // setSelectedFilters([]);
    // setFiltersSeleted(false);
    setFilteredString({
      label: "Sort By",
      value: "",
    });
    closeFilter();
  };
  return (
    <>
      {" "}
      <div className="jobsortDropDown">
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
                        filterString.value === status.value ? "active" : ""
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
  );
};

export default Sort;
