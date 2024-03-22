import React, { useState } from 'react'
import { ClosedEye, Key, OpenedEye, User } from '../../../assets/svg';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn } from '../../../services/auth';
import { Bars } from 'react-loader-spinner'

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (inputEmail) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(inputEmail);
  };
  const validatePassword = (inputPassword) => {
    const capitalRegex = /[A-Z]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const numberRegex = /[0-9]/;

    return (
      inputPassword.length >= 8 &&
      capitalRegex.test(inputPassword) &&
      specialCharRegex.test(inputPassword) &&
      numberRegex.test(inputPassword)
    );
  };
  const handleEmailChange = (e) => {
    const inputValue = e.target.value;
    setEmail(inputValue);
    if (!inputValue) {
      setEmailError('');
    } else if (validateEmail(inputValue)){
      setEmailError('');
    }
  };
  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;
    setPassword(inputValue);

    if (!inputValue) {
      setPasswordError('');
    } else if (validatePassword(inputValue)){
      setPasswordError('');
    }
  };
  
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return
    }else if (!validatePassword(password)) {
      setPasswordError('Please enter a valid password');
      return
    } 
    try {
      setLoading(true);
      let response = await LogIn({
        email: email,
        password: password,
      });
  
      if (response.res) {
        console.log('Logged-in successful',response);
        localStorage.setItem('authToken', response.res.access_token);
        localStorage.setItem('loggedIn', 'true');
        toast.success('Logged-in successful', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        navigate('/dashboard');
        } else {
          console.error('Logged-in failed:', response.error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('loggedIn');
          toast.error(`Logged-in failed - ${response.error.message}`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
      }
    } catch (error) {
      console.error('There was an error:', error);
    } finally {
      setLoading(false); 
    }
  };
  return (<>
  {loading &&  <div className='loaderDiv'>
    <Bars
      height="80"
      width="80"
      color="#4fa94d"
      ariaLabel="bars-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  </div>}
  
    <div className='SignUpSection'>
      <div>
        <h2>Welcome Back</h2>
        <p>Please sign in to continue</p>
        <form>
          <div className={`customInput ${emailError !== '' && 'errorClass'}`}>
              <div className='IconBox'><User /></div>
              <input name='email' placeholder='Email' value={email} onChange={handleEmailChange}/>
          </div>
          <div className={`customInput ${passwordError !== '' && 'errorClass'}`}>
              <div className='IconBox'><Key /></div>
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
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