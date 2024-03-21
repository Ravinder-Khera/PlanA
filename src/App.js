import './App.scss';
import logo from './assets/common/LOGO.png'
import { DashboardIcon, ForgotPswd, InvoiceIcon, JobsIcon, Key, Lock, LogoutIcon, SettingsIcon } from './assets/svg';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/LandingPages/LoginPage/login';
import SignUp from './pages/LandingPages/SignUp/signUp';
import { ForgotPassword } from './pages/LandingPages/Password/forgotPassword';
import PasswordReset from './pages/LandingPages/Password/passwordReset';
import Dashboard from './pages/Dashboard/dashboard';
import { useEffect, useState } from 'react';
import NavMenu from './Components/navMenu';
import SettingsPage from './pages/Settings';
 import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function DashboardMenuList() {
  const location = useLocation();
  const isLoginPage = location.pathname.includes('/login');
  const isSignupPage = location.pathname.includes('/signup');
  const isDashboardPage = location.pathname.includes('/dashboard');

  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedOut(true)
  };
  return (<>
      <div className={`loginScreenItems container ${isLoggedOut || !isDashboardPage ? 'd-flex' : 'd-none'} align-items-center flex-column`}>
        <a href='/' className='mx-auto my-4'>
          <img src={logo} className='img-fluid' alt='Plan a'/>
        </a>
        <ul className='pt-3 mx-auto px-1 menuList'>
          <li className={isLoginPage ? 'active' : ''}>
            <a href='/login'>
              <div className='iconBox'><Key /></div>
              <p>Login</p>
            </a>
          </li>
          <li className={isSignupPage ? 'active' : ''}>
            <a href='/signup'>
              <div className='iconBox'><Lock /> </div>
              <p>Sign Up</p>
            </a>
          </li>
        </ul>
      </div>
      <div className={`forgotPasswordMenu ${isLoggedOut || !isDashboardPage ? '' :'d-none'}`}>
        <a href='/forgot-password'>
          <ForgotPswd />  Forgot Password?
        </a>
      </div>
      <div className={`loginScreenItems container ${isLoggedOut || !isDashboardPage ? 'd-none': 'd-flex'} align-items-center flex-column`}>
        <a href='/' className='mx-auto my-4'>
          <img src={logo} className='img-fluid' alt='Plan a'/>
        </a>
        <ul className='pt-3 mx-auto px-1 dashboardMenuList'>
          <li className='active'>
            <a href='/dashboard'>
              <DashboardIcon color='black' /><p>Dashboard</p>
            </a>
          </li>
          <li >
            <a href='/dashboard'>
              <JobsIcon color={'white'} /><p>Jobs</p>
            </a>
          </li>
          <li >
            <a href='/dashboard'>
              <InvoiceIcon color={'white'} /> <p>Invoicing</p>
            </a>
          </li>
          <li >
            <a href='/dashboard'>
              <SettingsIcon color={'white'} /> <p>Settings</p>
            </a>
          </li>
        </ul>
      </div>
      <div className={`forgotPasswordMenu ${isLoggedOut || !isDashboardPage ? 'd-none': ''}`}>
        <a href='/login' onClick={handleLogout}>
          <LogoutIcon /> Log Out
        </a>
      </div>
  </>);
}

function RightSide() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthToken = () => {
      const authToken = localStorage.getItem('authToken');
      setIsLoggedIn(!!authToken); 
    };

    checkAuthToken();
    const interval = setInterval(checkAuthToken, 1000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='RightSide'>
      {isLoggedIn ? <>
        <NavMenu />
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </> :
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      }
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <Router>
        <div className='LeftSide'>
          <DashboardMenuList />
        </div>
        <RightSide />
      </Router>
    </div>
  );
}

export default App;
