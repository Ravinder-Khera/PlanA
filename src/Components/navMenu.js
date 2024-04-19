import React, { useEffect, useRef, useState } from "react";
import { BellIcon, CrossIcon, Search, User } from "../assets/svg";
import { getJobs, getProfile, getTasks } from "../services/auth";
import { Bars } from "react-loader-spinner";
import eventEmitter from "../Event";
import { Link, useNavigate } from "react-router-dom";

function NavMenu() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [userImg, setUserImg] = useState("");
  const [selectedValue, setSelectedValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [notificationDropDown, setNotificationDropDown] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filteredInvoice, setFilteredInvoice] = useState([]);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const searchPopUpRef = useRef(null);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
    if(searchValue !== ''){
      setIsPopupOpen(true);
      if (event.target.value === ''){
        fetchJobs();
        fetchTasks();
        fetchInvoice();
      } else if(event.target.value === 'Job'){
        fetchJobs();
        setFilteredTasks([])
        setFilteredInvoice([])
      } else if (event.target.value === 'Task'){
        fetchTasks()
        setFilteredJobs([])
        setFilteredInvoice([])
      } else if (event.target.value === 'Invoice'){
        setFilteredJobs([])
        setFilteredTasks([])
        fetchInvoice()
      }  
    } else {
      setIsPopupOpen(false);
    }
  };

  const handleInputSearch = (e) => {
    setSearchValue(e.target.value);
    if(e.target.value !== ''){
      setIsPopupOpen(true);
      fetchJobs();
      fetchTasks();
      fetchInvoice();
    } else {
      setIsPopupOpen(false);
    }
  };

  useEffect(() => {
    let handler = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationDropDown(false);
      }
      if (
        searchPopUpRef.current &&
        !searchPopUpRef.current.contains(e.target)
      ) {
        setIsPopupOpen(false);
        setSearchValue('');
      }

    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    const bodyScroll = document.getElementById('rightSCroll')
    if (isPopupOpen) {
      bodyScroll.style.overflow = "hidden";
    } else {
      bodyScroll.style.overflow = "auto"; 
    }

    return () => {
      bodyScroll.style.overflow = "auto";
    };
  }, [isPopupOpen]);


  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      let response = await getProfile(authToken);
      if (response.res) {
        setUser(response.res.user.name);
        setUserImg(response.res.user.profile_pic);
        localStorage.setItem("user", response.res.user.name);
      } else {
        console.error("profile error:", response.error);
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  eventEmitter.removeAllListeners("updateProfile");
  eventEmitter.on("updateProfile", fetchProfileData);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs();
      const data = res?.res?.data;
      
      const lowerCaseQuery = searchValue.toLowerCase();
      const filtered = data.filter((job) => {
        // Check if job title or description contains the search query
        return (
          job.title.toLowerCase().includes(lowerCaseQuery) ||
          job.description.toLowerCase().includes(lowerCaseQuery) ||
          job.id.toString().includes(lowerCaseQuery)
        );
      });
      setFilteredJobs(filtered);
    } catch (error) {
      console.log("error while fetching jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };
      let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks`,requestOptions);
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const res = isJson && (await response.json());
      const data = res.data;
      const lowerCaseQuery = searchValue.toLowerCase();
      const filtered = data.filter((task) => {
        // Check if job title or description contains the search query
        return (
          task.title.toLowerCase().includes(lowerCaseQuery) ||
          task.id.toString().includes(lowerCaseQuery)
        );
      });
      setFilteredTasks(filtered);
      if (response.status === 200) {
        setLoading(false);
        return { res: data, error: null };
      } else {
        return { res: null, error: data };
      }
    } catch (error) {
      console.log("error while fetching jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };
      const response = await fetch(
        `${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/invoices`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      const data = jsonData.data;
      const lowerCaseQuery = searchValue.toLowerCase();
      const filtered = data.filter((Invoice) => {
        return (
          Invoice.to.toLowerCase().includes(lowerCaseQuery) ||
          Invoice.from.toLowerCase().includes(lowerCaseQuery) ||
          Invoice.id.toString().includes(lowerCaseQuery)
        );
      });
      setFilteredInvoice(filtered);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      <div className="position-relative" ref={searchPopUpRef}>
        <nav className="container-fluid navMenuDiv position-relative" style={{zIndex:'91'}}>
          <div className="d-flex justify-content-between">
            <form>
              <div className="searchBox">
                <div className="IconBox">
                  <Search />
                </div>
                <input
                  name="search"
                  placeholder="Search"
                  onChange={(e) => handleInputSearch(e)}
                  value={searchValue}
                />
              </div>
              <div className="selectBox">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  placeholder="Select"
                  value={selectedValue}
                  onChange={(event)=> handleChange(event)}
                >
                  <option value="">Select</option>
                  <option value="Job">Job</option>
                  <option value="Task">Task</option>
                  <option value="Invoice">Invoice</option>
                </select>
              </div>
            </form>
            <div>
              <div
                className="d-flex align-items-center justify-content-end"
                style={{ minWidth: "250px" }}
              >
                <Link className="d-flex" style={{textDecoration:'none'}} 
                onClick={()=> { 
                  setIsPopupOpen(false);
                  setSearchValue('');
                  }} to="/settings">
                  <div
                    style={{ textAlign: "end" }}
                    className="d-flex flex-column justify-content-center"
                  >
                    <p>{[user]}</p>
                    <span style={{ fontSize: "12px", fontWeight: "300" }}>
                    {[user?.job_title]}
                    </span>
                  </div>
                  <div className="UserImg" style={{ minWidth: "40px" }}>
                    {userImg ? (
                      <img
                        alt={userImg}
                        src={
                          process.env.REACT_APP_USER_API_CLOUD_IMG_PATH + userImg
                        }
                      />
                    ) : (
                      <User />
                    )}
                  </div>
                </Link>
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

                              <div className="notificationItems fullColor">
                                <div className="notificationTime">
                                  1 min<br/>Ago
                                </div>
                                <div className="notificationContent">
                                    <div className="notificationIcon user"> <User /> </div>
                                    <div className="notificationText">
                                      <h3>Notification Heading</h3>
                                      <span>Notification Description goes here</span>
                                    </div>
                                    <div className="notificationCrossIcon"><CrossIcon /> </div>
                                </div>
                              </div>
                              <div className="notificationItems password">
                                <div className="notificationTime">
                                  1 hour<br/>Ago
                                </div>
                                <div className="notificationContent">
                                    <div className="notificationIcon info">! </div>
                                    <div className="notificationText">
                                      <h3>Notification Heading</h3>
                                      <span>Notification Description goes here</span>
                                    </div>
                                    <div className="notificationCrossIcon"><CrossIcon /> </div>
                                </div>
                              </div>

                              <div className="notificationItems failed">
                                <div className="notificationTime">
                                  2 hours<br/>Ago
                                </div>
                                <div className="notificationContent">
                                    <div className="notificationIcon fail">! </div>
                                    <div className="notificationText">
                                      <h3>Notification Heading</h3>
                                      <span>Notification Description goes here</span>
                                    </div>
                                    <div className="notificationCrossIcon"><CrossIcon /> </div>
                                </div>
                              </div>

                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {isPopupOpen && (
          <div className="searchPagePopUp">
            <div className="DashboardTopMenu">
              <div className="DashboardHeading d-flex justify-content-between align-items-center">
                <h2>Search Results</h2>
              </div>
              <div className="resultContainer">
                {/* mapping here */}
                {filteredJobs && filteredJobs.map((job, index)=>(
                  <div className="resultMap" key={index} onClick={() => {
                    navigate("/jobs", { state: job }); setIsPopupOpen(false);setSearchValue('')
                  }}>
                      <div className="d-flex align-items-center" style={{gap:'16px'}}>
                        <div className="identityBadge">
                          Job
                          {/* Invoice */}
                          {/* Task */}
                        </div>
                        <div className="searchContext">
                          <h3>{job.title}</h3>
                          <span>{job.description}</span>
                        </div>
                      </div>
                  </div>
                ))}
                {filteredTasks && filteredTasks.map((Task, index)=>(
                  <div className="resultMap" key={index} onClick={() => {
                    navigate("/dashboard/tasks", { state: Task }); setIsPopupOpen(false);setSearchValue('');
                  }}>
                      <div className="d-flex align-items-center" style={{gap:'16px'}}>
                        <div className="identityBadge">
                          Task
                        </div>
                        <div className="searchContext">
                          <h3>|{Task.id}|{Task.title}</h3>
                        </div>
                      </div>
                  </div>
                ))}
                {filteredInvoice && filteredInvoice.map((Invoice, index)=>(
                  <div className="resultMap" key={index} onClick={() => {
                    navigate("/invoice", { state: Invoice }); setIsPopupOpen(false);setSearchValue('');
                  }}>
                      <div className="d-flex align-items-center" style={{gap:'16px'}}>
                        <div className="identityBadge">
                          Inv
                        </div>
                        <div className="searchContext">
                          <h3>{`INV-${String(Invoice.id).padStart(4, "0")}`}</h3>
                        </div>
                      </div>
                  </div>
                ))}
                {filteredJobs.length === 0 && filteredTasks.length === 0 && filteredInvoice.length === 0 && (
                  <p className="noREsult">No Results Found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const authToken = localStorage.getItem("authToken");
    const data = await getProfile(authToken);
    return { props: { data } };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { props: { data: null } };
  }
}

export default NavMenu;
