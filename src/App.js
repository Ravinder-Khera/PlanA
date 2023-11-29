import './App.scss';
import logo from './assets/common/LOGO.png'
import { ForgotPswd, Key, Lock } from './assets/svg';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/LandingPages/LoginPage/login';
import SignUp from './pages/LandingPages/SignUp/signUp';
import { ForgotPassword } from './pages/LandingPages/Password/forgotPassword';
import PasswordReset from './pages/LandingPages/Password/passwordReset';

function LeftSide() {
  const location = useLocation();
  const isLoginPage = location.pathname.includes('/login');
  const isSignupPage = location.pathname.includes('/signup');
  return (
    <div className='LeftSide'>
      <div className='loginScreenItems container d-flex align-items-center flex-column'>
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
      <div className='forgotPasswordMenu'>
        <a href='/forgotPassword'>
          <ForgotPswd />  Forgot Password?
        </a>
      </div>
    </div>
  );
}

function RightSide() {
  return (
    <div className='RightSide'>
      <Routes>
        <Route path="/" element={<Login />} />
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
        <LeftSide />
        <RightSide />
      </div>
    </Router>
  );
}

export default App;
