import React, { useState } from 'react'
import { ClosedEye, Key, OpenedEye, User } from '../../../assets/svg';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn } from '../../../services/auth';

function Login() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
 

  const handleLogin = async () => {
    console.log(password);
    try {
      let response = await LogIn({
        username: userName,
        password: password,
      });
  
      if (response.res) {
        console.log('Logged-in successful',response);
        localStorage.setItem('authToken', response.res.token);
        localStorage.setItem('loggedIn', 'true');
        toast.success('Logged-in successful', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        navigate('/dashboard');
        } else {
          console.error('Logged-in failed:', response.error);
          toast.error('Logged-in failed', {
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
  return (<>
    <div className='SignUpSection'>
      <div>
        <h2>Welcome Back</h2>
        <p>Please sign in to continue</p>
        <form>
          <div className='customInput'>
              <div className='IconBox'><User /></div>
              <input name='fullName' placeholder='Full Name' value={userName} onChange={(e) => {setUserName(e.target.value); }}/>
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