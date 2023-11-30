import './App.scss';
import logo from './assets/common/LOGO.png'
import { DashboardIcon, ForgotPswd, InvoiceIcon, JobsIcon, Key, Lock, LogoutIcon, SettingsIcon } from './assets/svg';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/LandingPages/LoginPage/login';
import SignUp from './pages/LandingPages/SignUp/signUp';
import { ForgotPassword } from './pages/LandingPages/Password/forgotPassword';
import PasswordReset from './pages/LandingPages/Password/passwordReset';
import Dashboard from './pages/Dashboard/dashboard';
import { useState } from 'react';



function DashboardMenuList() {
  const location = useLocation();
  const isLoginPage = location.pathname.includes('/login');
  const isSignupPage = location.pathname.includes('/dashboard');
  const isDashboardPage = location.pathname.includes('/dashboard');

  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const handleLogout = () => {
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
        <a href='/forgotPassword'>
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
              <DashboardIcon color='white' /><p>Dashboard</p>
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
  return (
    <div className='RightSide'>
      <Routes>
        <Route path="/" element={<Login /> } />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/forgotPassword" element={<ForgotPassword/>} />
        <Route path="/resetPassword" element={<PasswordReset/>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <div className='LeftSide'>
          <DashboardMenuList />
        </div>
        <RightSide />
      </div>
    </Router>
  );
}

export default App;
