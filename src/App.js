import './App.scss';
import logo from './assets/common/LOGO.png'
import { ForgotPswd, Key, Lock } from './assets/svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/LandingPages/LoginPage/login';
import SignUp from './pages/LandingPages/SignUp/signUp';
import { ForgotPassword } from './pages/LandingPages/Password/forgotPassword';
import PasswordReset from './pages/LandingPages/Password/passwordReset';

function App() {
  return (
    <div className="App">
      <div className='LeftSide'>
        <div className='loginScreenItems container d-flex align-items-center flex-column'>
          <a href='/' className='mx-auto my-4'>
            <img src={logo} className='img-fluid' alt='Plan a'/>
          </a>
          <ul className='pt-3 mx-auto px-1 menuList'>
            <li>
              <a href='/login'>
                <div className='iconBox'><Key /></div>
                <p>Login</p>
              </a>
            </li>
            <li>
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
      <div className='RightSide'>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/forgotPassword" element={<ForgotPassword/>} />
          <Route path="/resetPassword" element={<PasswordReset/>} />
        </Routes>
      </Router>
      </div>
    </div>
  );
}

export default App;
