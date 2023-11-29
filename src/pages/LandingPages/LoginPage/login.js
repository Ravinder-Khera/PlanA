import React, { useState } from 'react'
import { ClosedEye, Key, OpenedEye, User } from '../../../assets/svg';

function Login() {
    const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  return (<>
    <div className='SignUpSection'>
      <h2>Welcome Back</h2>
      <p>Please sign in to continue</p>
      <div className='customInput'>
        <div className='IconBox'><User /></div>
        <input name='fullName' placeholder='Full Name'/>
      </div>
      <div className='customInput'>
        <div className='IconBox'><Key /></div>
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
      <div className='btnDiv'>
        <button className='signupButton'>
            Login
        </button>
      </div>
    </div>
  </>)
}

export default Login