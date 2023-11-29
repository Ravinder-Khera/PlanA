import React, { useState } from 'react'
import { ClosedEye, ClosedLock, Email, OpenedEye, OpenedLock, User } from '../../../assets/svg';

function SignUp() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
  <>
    <div className='SignUpSection'>
      <h2>Welcome To <span className='colorHeading'>Plan</span> <span className='textStroke'>A</span></h2>
      <p>Please sign up to continue</p>
      <form>
        <div className='customInput'>
          <div className='IconBox'><User /></div>
          <input name='fullName' placeholder='Full Name'/>
        </div>
        <div className='customInput'>
          <div className='IconBox'><Email /></div>
          <input name='email' placeholder='Email'/>
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
        <button className='signupButton'>
          Sign Up
        </button>
      </div>
    </div>
  </>)
}

export default SignUp