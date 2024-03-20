import React, { useState } from 'react'
import { ClosedEye, ClosedLock, Email, OpenedEye, OpenedLock, User } from '../../../assets/svg';
import { SignIn } from '../../../services/auth';
import { useNavigate  } from 'react-router-dom';
import { toast } from 'react-toastify';

function SignUp() {
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = async () => {
    try {
      let response = await SignIn({
        fullname: fullName,
        email: email,
        password: password,
      });
  
      if (response.res) {
        console.log('Sign-in successful',response.res.message);
        localStorage.setItem('userName', response.res.username);
        localStorage.setItem('SignUpToken', response.res.token);
        toast.success('Sign-in successful', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        navigate('/login');
        } else {
          console.error('Sign-in failed:', response.error.error);
          toast.error('Sign-in failed', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
      }
      } catch (error) {
        console.error('There was an error:', error);
    }
  };

  return (
  <>
  {/* <ToastContainer /> */}
    <div className='SignUpSection'>
      <div>
        <h2>Welcome To <span className='colorHeading'>Plan</span> <span className='textStroke'>A</span></h2>
        <p>Please sign up to continue</p>
        <form>
          <div className='customInput'>
            <div className='IconBox'><User /></div>
            <input name='fullName' placeholder='Full Name' value={fullName} onChange={(e) => {setFullName(e.target.value); }}/>
          </div>
          <div className='customInput'>
            <div className='IconBox'><Email /></div>
            <input name='email' placeholder='Email' value={email} onChange={(e) => {setEmail(e.target.value); }}/>
          </div>
          <div className='customInput'>
            <div className='IconBox'><OpenedLock /></div>
            <input 
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              autoComplete="password"
              className='passwordInput'/>
            <span
              className={`toggle-eye-icon ${showPassword ? 'show' : ''}`}
              onClick={handleTogglePassword}
            > 
              {showPassword ? <OpenedEye /> : <ClosedEye /> }
            </span>
          </div>
          <div className='customInput'>
            <div className='IconBox'><ClosedLock /></div>
            <input 
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='Confirm Password'
              autoComplete="password"
              className='passwordInput'/>
            <span
              className={`toggle-eye-icon ${showPassword ? 'show' : ''}`}
              onClick={handleTogglePassword}
            > 
              {showPassword ? <OpenedEye /> : <ClosedEye /> }
            </span>
          </div>
        </form>
        <div className='btnDiv'>
          <button className='signupButton' onClick={handleSignUp}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  </>)
}

export default SignUp