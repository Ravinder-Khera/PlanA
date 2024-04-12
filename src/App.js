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
} from "./assets/svg";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Link,
} from "react-router-dom";
import Login from "./pages/LandingPages/LoginPage/login";
import SignUp from "./pages/LandingPages/SignUp/signUp";
import { ForgotPassword } from "./pages/LandingPages/Password/forgotPassword";
import PasswordReset from "./pages/LandingPages/Password/passwordReset";
import Dashboard from "./pages/Dashboard/dashboard";
import { useEffect, useState } from "react";
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

function DashboardMenuList() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    localStorage.removeItem("authToken");
    localStorage.removeItem("jobId")
    setIsLoggedIn(false);
  };

  return (
    <>
      <div
        className={`loginScreenItems container ${
          isLoggedIn ? "d-none" : "d-flex"
        } align-items-center flex-column`}
      >
        <a href="/" className="mx-auto siteLogo">
          <img src={logo} className="img-fluid" alt="Plan a" />
        </a>
        <ul className=" mx-auto px-1 menuList">
          <li className={location.pathname.includes("/login") ? "active" : ""}>
            <Link to="/login">
              <div className="iconBox">
                <Key />
              </div>
              <p>Login</p>
            </Link>
          </li>
          <li className={location.pathname.includes("/signup") ? "active" : ""}>
            <Link to="/signup">
              <div className="iconBox">
                <Lock />{" "}
              </div>
              <p>Sign Up</p>
            </Link>
          </li>
        </ul>
      </div>
      <div className={`forgotPasswordMenu ${isLoggedIn ? "d-none" : ""}`}>
        <Link to="/forgot-password">
          <ForgotPswd /> Forgot Password?
        </Link>
      </div>
      <div
        className={`loginScreenItems container ${
          isLoggedIn ? "d-flex" : "d-none"
        } align-items-center flex-column`}
      >
        <a href="/" className="mx-auto siteLogo">
          <img src={logo} className="img-fluid" alt="Plan a" />
        </a>
        <ul className=" dashboardMenuList">
          <li
            className={location.pathname.includes("/dashboard") ? "active" : ""}
          >
            <Link to="/dashboard">
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
                <Link to="/dashboard/timeline">
                  <TimelineIcon />
                  <p>Timeline</p>
                </Link>
              </li>
              <li
                className={location.pathname.includes("/tasks") ? "active" : ""}
              >
                <Link to="/dashboard/tasks">
                  <TaskIcon />
                  <p>Tasks</p>
                </Link>
              </li>
            </div>
          )}
          <li className={location.pathname.includes("/Jobs") ? "active" : ""}>
            <Link to="/Jobs">
              <JobsIcon />
              <p>Jobs</p>
            </Link>
          </li>
          <li
            className={location.pathname.includes("/invoice") ? "active" : ""}
          >
            <Link to="/invoice">
              <InvoiceIcon /> <p>Invoicing</p>
            </Link>
          </li>
          <li
            className={location.pathname.includes("/settings") ? "active" : ""}
          >
            <Link to="/settings">
              <SettingsIcon /> <p>Settings</p>
            </Link>
          </li>
        </ul>
      </div>
      <div className={`forgotPasswordMenu ${isLoggedIn ? "" : "d-none"}`}>
        <a href="/login" onClick={handleLogout}>
          <LogoutIcon /> Log Out
        </a>
      </div>
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
    <div className="RightSide">
      {isLoggedIn ? (
        <>
          {pathname !== "/Jobs" && <NavMenu />}
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
