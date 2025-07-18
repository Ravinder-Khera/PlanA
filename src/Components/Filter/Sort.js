import { useState } from "react";
import { FilterJobs } from "../../services/api";

const Sort = ({
  setFilteredJobs,
  setOriginalJobs,
  setFilteredString,
  setFilteredQuery,
  filteredQuery,
  setLoading,
  closeFilter,
  setLoadTotalPage,
  setLoadMorePage,
  activeTab
}) => {
  const [filterString, setfilterString] = useState({
    label: "Sort By",
    value: "",
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const statusFilterData = [
    {
      label: "Days Left",
      value: "sort_by=days_left",
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
    if (!filterString.value) return;
    setLoading(true);
    try {
      const prevQuery = filteredQuery;
      const updatedQuery = { ...prevQuery, page: 1, perPage: 20 };
      delete updatedQuery.sort;
      const response = await FilterJobs(
        { ...updatedQuery },
        filterString.value,
         activeTab === "Jobs" ? 'job' : 'prospect'
      );
      if (!response.error) {
        setFilteredJobs(response?.res?.data);
        setOriginalJobs(response?.res?.data);
        setLoadMorePage(response?.res?.current_page + 1);
        setLoadTotalPage(response?.res?.last_page);
      }
      setFilteredQuery((prevQuery) => {
        const updatedQuery = { ...prevQuery, sort: filterString.value };
        return updatedQuery;
      });

      setFilteredString((prevString) => {
        const filteredWithoutSort = prevString.filter(
          (item) => item.type !== "sort"
        );

        return [
          ...filteredWithoutSort,
          {
            className: "filterStatusBox OnHold",
            filter: `${filterString.label}`,
            type: "sort",
            value: filterString.value,
          },
        ];
      });
    } catch (error) {
      console.log("error in applying filter", error);
    } finally {
      setLoading(false);
      closeFilter();
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
            {/* {filterString?.value !== "" && (
              <button onClick={handleCancelFilter}>Clear</button>
            )} */}
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
