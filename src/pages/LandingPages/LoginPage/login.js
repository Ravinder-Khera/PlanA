import React, { useState } from 'react'
import { ClosedEye, Key, OpenedEye, User } from '../../../assets/svg';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = () => {
    localStorage.setItem('loggedIn', 'true');
    navigate('/dashboard');
  };
  return (<>
    <div className='SignUpSection'>
      <div>
        <h2>Welcome Back</h2>
        <p>Please sign in to continue</p>
        <form>
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
          <button className='signupButton' onClick={handleLogin}>
              Login
          </button>
        </div>
      </div>
    </div>
  </>)
}

export default Login