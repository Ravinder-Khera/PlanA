import "./App.scss";
import "./Components/toaster.scss";
import logo from "./assets/common/LOGO.png";
import {
  DashboardIcon,
  ForgotPswd,
  InvoiceIcon,
  JobsIcon,
  Key,
  Lock,
  LogoutIcon,
  SettingsIcon,
  TaskIcon,
  TimelineIcon,
  User,
} from "./assets/svg";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/LandingPages/LoginPage/login";
import SignUp from "./pages/LandingPages/SignUp/signUp";
import { ForgotPassword } from "./pages/LandingPages/Password/forgotPassword";
import PasswordReset from "./pages/LandingPages/Password/passwordReset";
import Dashboard from "./pages/Dashboard/dashboard";
import { useEffect, useRef, useState } from "react";
import NavMenu from "./Components/navMenu";
import SettingsPage from "./pages/Settings/settings";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Invoice from "./pages/Invoicing/invoice";
import TaskPage from "./pages/Dashboard/tasks";
import TimelinePage from "./pages/Dashboard/timeline";
import Jobs from "./pages/Jobs";
import Pusher from "pusher-js";
import eventEmitter from "./Event";
import { getProfile } from "./services/auth";
import { Bars } from "react-loader-spinner";

function DashboardMenuList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState("");
  const [userImg, setUserImg] = useState("");
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);
  const menuRefLoggedIn = useRef(null);
  
  const handleMenuOpen = () => {
    if(isMenuOpen){
      setIsMenuOpen(false)
    } else if (menuRef && menuRef.current) {
      const menu = menuRef.current;
      if (typeof menu.classList !== 'undefined') {
        menu.classList.add('show');
        setIsMenuOpen(true)
      } else {
        console.error("menuRef.current doesn't have classList property");
      }
    } else if (menuRefLoggedIn && menuRefLoggedIn.current) {
      const menu = menuRefLoggedIn.current;
      if (typeof menu.classList !== 'undefined') {
        menu.classList.add('show');
        setIsMenuOpen(true)
      } else {
        console.error("menuRef.current doesn't have classList property");
      }
    } else {
      console.error("menuRef or menuRef.current is undefined");
    }
  };

  const handleMenuClose = () => {
    if (menuRef && menuRef.current) {
      const menu = menuRef.current;
      if (typeof menu.classList !== 'undefined') {
        menu.classList.remove('show');
        setIsMenuOpen(true)
      } else {
        console.error("menuRef.current doesn't have classList property");
      }
    } else if (menuRefLoggedIn && menuRefLoggedIn.current) {
      const menu = menuRefLoggedIn.current;
      if (typeof menu.classList !== 'undefined') {
        menu.classList.remove('show');
        setIsMenuOpen(true)
      } else {
        console.error("menuRef.current doesn't have classList property");
      }
    } else {
      console.error("menuRef or menuRef.current is undefined");
    }
  };

  useEffect(() => {
    let handler = (e) => {
        if (isMenuOpen &&
          menuRef.current &&
          !menuRef.current.contains(e.target)
        ) {
          console.log('clicked');
            menuRef.current.classList.remove('show');
        }else if ( isMenuOpen &&
          menuRefLoggedIn.current &&
          !menuRefLoggedIn.current.contains(e.target)
        ) {
            menuRefLoggedIn.current.classList.remove('show');
        }
    };
    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };

  }, [isMenuOpen]);

  useEffect(() => {
    const checkAuthToken = () => {
      const authToken = localStorage.getItem("authToken");
      setIsLoggedIn(!!authToken);
    };

    checkAuthToken();
    const interval = setInterval(checkAuthToken, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    try {
      setLoading(true);
      localStorage.removeItem("authToken");
      localStorage.removeItem("jobId");
      const authToken = localStorage.getItem("authToken");
      if(!authToken){
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false); 
      handleMenuClose(); 
      navigate('/login')
    }
  };  

  const fetchProfileData = async (isLoggedIn) => {
    if(isLoggedIn){
      try {
        setLoading(true);
        const authToken = localStorage.getItem("authToken");
        let response = await getProfile(authToken);
        if (response.res) {
          setUser(response.res.user.name);
          setUserImg(response.res.user.profile_pic);
          localStorage.setItem("user", response.res.user.name);
          const passwordLastChangedDate = new Date(response.res.user.password_last_changed);
          // Calculate the target dates
          const currentDate = new Date();
          const sixMonthsAgoPlusThirtyDays = new Date(passwordLastChangedDate);
          sixMonthsAgoPlusThirtyDays.setMonth(sixMonthsAgoPlusThirtyDays.getMonth() + 6);
          sixMonthsAgoPlusThirtyDays.setDate(sixMonthsAgoPlusThirtyDays.getDate() - 30);

          const fiveDaysBeforeSixMonths = new Date(passwordLastChangedDate);
          fiveDaysBeforeSixMonths.setMonth(fiveDaysBeforeSixMonths.getMonth() + 6);
          fiveDaysBeforeSixMonths.setDate(fiveDaysBeforeSixMonths.getDate() - 5);

          const OneDayBeforeSixMonths = new Date(passwordLastChangedDate);
          OneDayBeforeSixMonths.setMonth(OneDayBeforeSixMonths.getMonth() + 6);
          OneDayBeforeSixMonths.setDate(OneDayBeforeSixMonths.getDate() - 1);
          if(currentDate.toDateString() === OneDayBeforeSixMonths.toDateString()){
            const notificationData = {
              class: "info",
              message: 'Your Password Is About To Expire!',
              span: 'You have 1 Day left to change your password.'
            };
            const existingNotificationsJSON = localStorage.getItem('notifications');
            let existingNotifications = [];
            if (existingNotificationsJSON) {
              existingNotifications = JSON.parse(existingNotificationsJSON);
            }
            existingNotifications.push(notificationData);
        
            localStorage.setItem('notifications', JSON.stringify(existingNotifications));
          } else if(currentDate.toDateString() === fiveDaysBeforeSixMonths.toDateString()){
            const notificationData = {
              class: "info",
              message: 'Your Password Is About To Expire!',
              span: 'You have 5 Days left to change your password.'
            };
            const existingNotificationsJSON = localStorage.getItem('notifications');
            let existingNotifications = [];
            if (existingNotificationsJSON) {
              existingNotifications = JSON.parse(existingNotificationsJSON);
            }
            existingNotifications.push(notificationData);
        
            localStorage.setItem('notifications', JSON.stringify(existingNotifications));
          } else if(currentDate.toDateString() === sixMonthsAgoPlusThirtyDays.toDateString()){
            const notificationData = {
              class: "info",
              message: 'Your Password Is About To Expire!',
              span: 'You have 30 Days left to change your password.'
            };
            const existingNotificationsJSON = localStorage.getItem('notifications');
            let existingNotifications = [];
            if (existingNotificationsJSON) {
              existingNotifications = JSON.parse(existingNotificationsJSON);
            }
            existingNotifications.push(notificationData);
        
            localStorage.setItem('notifications', JSON.stringify(existingNotifications));
          }
        } else {
          console.error("profile error:", response.error);
        }
      } catch (error) {
        console.error("There was an error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfileData(isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (location.pathname !== '/task') {
      localStorage.removeItem('filterString');
    }

    const unListen = () => {};

    return () => {
      unListen();
    };
  }, [location]);

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
      
      {isLoggedIn ?
      <>
        <div
          className={`loginScreenItems container-md ${
            isLoggedIn ? "d-flex" : "d-none"
          } align-items-center flex-column`}
        >

          <nav className="navbar navbar-expand-lg bg-transparent w-100">
            <div className="container-fluid navContainer  p-0">
              <a href="/" className=" siteLogo">
                <img src={logo} className="img-fluid" alt="Plan a" />
              </a>
              <button className="navbar-toggler" type="button" onClick={handleMenuOpen}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                  <rect width="24" height="24" fill="none" />
                  <path fill="none" stroke="#E2E31F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17h14M5 12h14M5 7h14" />
                </svg>
              </button>
              <div className="collapse navbar-collapse" id="navbarSupportedContent1" ref={menuRefLoggedIn}>
                <ul className=" dashboardMenuList">
                  <li className="backBtn">
                    <div onClick={handleMenuClose}>
                      <p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024">
                          <rect width="1024" height="1024" fill="none" />
                          <path fill="#E2E31F" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64" />
                          <path fill="#E2E31F" d="m237.248 512l265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z" />
                        </svg> Back
                      </p>
                    </div>
                  </li>
                  <li
                    className={location.pathname.includes("/dashboard") ? "active" : ""}
                  >
                    <Link to="/dashboard" onClick={handleMenuClose}>
                      <DashboardIcon />
                      <p>Dashboard</p>
                    </Link>
                  </li>
                  {location.pathname.includes("/dashboard") && (
                    <div className="dropDownMenu">
                      <li
                        className={
                          location.pathname.includes("/timeline") ? "active" : ""
                        }
                      >
                        <Link to="/dashboard/timeline" onClick={handleMenuClose}>
                          <TimelineIcon />
                          <p>Timeline</p>
                        </Link>
                      </li>
                      <li
                        className={location.pathname.includes("/tasks") ? "active" : ""}
                      >
                        <Link to="/dashboard/tasks" onClick={handleMenuClose}>
                          <TaskIcon />
                          <p>Tasks</p>
                        </Link>
                      </li>
                    </div>
                  )}
                  <li className={location.pathname.includes("/Jobs") ? "active" : ""}>
                    <Link to="/Jobs" onClick={handleMenuClose}>
                      <JobsIcon />
                      <p>Jobs</p>
                    </Link>
                  </li>
                  <li
                    className={location.pathname.includes("/invoice") ? "active" : ""}
                  >
                    <Link to="/invoice" onClick={handleMenuClose}>
                      <InvoiceIcon /> <p>Invoicing</p>
                    </Link>
                  </li>
                  <li
                    className={location.pathname.includes("/settings") ? "active" : ""}
                  >
                    <Link to="/settings" onClick={handleMenuClose}>
                      <SettingsIcon /> <p>Settings</p>
                    </Link>
                  </li>
                </ul>
                <div className={`forgotPasswordMenu mobile ${isLoggedIn ? "" : "d-none"}`}>
                <div
                  className="d-flex align-items-center navMenuDiv justify-content-between"
                >

                  {isLoggedIn && 
                    <Link className="d-flex" style={{textDecoration:'none'}} to="/settings" onClick={handleMenuClose}>
                      
                      <div className="UserImg m-0" style={{ minWidth: "40px" }}>
                        {userImg && userImg !== 'default-profile-pic.jpg' ? (
                          <img
                            className="img-fluid"
                            alt={userImg}
                            src={
                              process.env.REACT_APP_USER_API_CLOUD_IMG_PATH + userImg
                            }
                          />
                        ) : (
                          <User />
                        )}
                      </div>
                      <div
                        className="d-flex flex-column justify-content-center ms-1"
                      >
                        <p>{[user]}</p>
                        <span style={{ fontSize: "12px", fontWeight: "300" }}>
                        {[user?.job_title]}
                        </span>
                      </div>
                    </Link>
                  }
                  <a href="/login" onClick={handleLogout}>
                    <LogoutIcon />
                  </a>
                </div>
                </div>
              </div>
            </div>
          </nav>

        </div>
        <div className={`forgotPasswordMenu ${isLoggedIn ? "" : "d-none"}`}>
          <a href="/login" onClick={handleLogout}>
            <LogoutIcon /> Log Out
          </a>
        </div>
      </>:<>
        <div
          className={`loginScreenItems container-md ${
            isLoggedIn ? "d-none" : "d-flex"
          } align-items-center flex-column`}
        >

          <nav className="navbar navbar-expand-lg bg-transparent w-100">
            <div className="container-fluid navContainer p-0">
              <a href="/" className="siteLogo">
                <img src={logo} className="img-fluid" alt="Plan a" />
              </a>
              <button className="navbar-toggler" type="button" onClick={handleMenuOpen}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
                  <rect width="24" height="24" fill="none" />
                  <path fill="none" stroke="#E2E31F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17h14M5 12h14M5 7h14" />
                </svg>
              </button>
              <div className="collapse navbar-collapse" id="navbarSupportedContent" ref={menuRef}>
                <ul className=" mx-auto px-1 menuList">
                  <li className="backBtn">
                    <div onClick={handleMenuClose}>
                      <p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1024 1024">
                          <rect width="1024" height="1024" fill="none" />
                          <path fill="#E2E31F" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64" />
                          <path fill="#E2E31F" d="m237.248 512l265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z" />
                        </svg> Back
                      </p>
                    </div>
                  </li>
                  <li className={location.pathname.includes("/login") ? "active" : ""}>
                    <Link to="/login" onClick={handleMenuClose}>
                      <div className="iconBox">
                        <Key />
                      </div>
                      <p>Login</p>
                    </Link>
                  </li>
                  <li className={location.pathname.includes("/signup") ? "active" : ""}>
                    <Link to="/signup" onClick={handleMenuClose}>
                      <div className="iconBox">
                        <Lock />{" "}
                      </div>
                      <p>Sign Up</p>
                    </Link>
                  </li>
                </ul>
                <div className={`forgotPasswordMenu mobile ${isLoggedIn ? "d-none" : ""}`}>
                  <Link to="/forgot-password" onClick={handleMenuClose}>
                    <ForgotPswd /> Forgot Password?
                  </Link>
                </div>
              </div>
            </div>
          </nav>

        </div>
        <div className={`forgotPasswordMenu `}>
          <Link to="/forgot-password">
            <ForgotPswd /> Forgot Password?
          </Link>
        </div>
      </>}
    </>
  );
}

function RightSide() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const checkAuthToken = () => {
      const authToken = localStorage.getItem("authToken");
      setIsLoggedIn(!!authToken);
    };

    checkAuthToken();
    const interval = setInterval(checkAuthToken, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="RightSide " id="rightSCroll">
      {isLoggedIn ? (
        <>
          {pathname.toLowerCase() !== "/jobs" && <NavMenu />}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard"  />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/timeline" element={<TimelinePage />} />
            <Route path="/dashboard/tasks" element={<TaskPage />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_CLUSTER,
      encrypted: true,
    });
    const id = localStorage.getItem("jobId");
    console.log("job id", id);
    const channel = pusher.subscribe(`job.${id}`);
    channel.bind("message.created", (data) => {
      console.log("data in messages", data);
      const { message } = data;
      if (message > 0) {
        eventEmitter.emit("newMessage", message);
      }
    });

    return () => {
      pusher.unsubscribe(`job.${id}`);
    };
  }, []);
  
  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
      <Router>
        <div className="LeftSide">
          <DashboardMenuList />
        </div>
        <RightSide />
      </Router>
    </div>
  );
}

export default App;
