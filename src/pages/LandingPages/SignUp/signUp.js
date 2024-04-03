import React, { useState } from 'react'
import { ClosedEye, ClosedLock, Email, OpenedEye, OpenedLock, User } from '../../../assets/svg';
import { SignIn } from '../../../services/auth';
import { useNavigate  } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Bars } from 'react-loader-spinner'

function SignUp() {
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  const handleNameChange = (e) => {
    const inputValue = e.target.value;
    const isValid = /^[a-zA-Z\s]*$/.test(inputValue); // Regular expression to allow only letters and spaces
    
    if (!isValid) {
      setNameError('Name can only contain letters and spaces');
    } else {
      setFullName(inputValue);
      setNameError('');
    }
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
  const handleConfirmPasswordChange = (e) => {
    const inputValue = e.target.value;
    setConfirmPassword(inputValue);

    if (!inputValue){
      setConfirmPasswordError('Password can not be empty');
    } else {
      setConfirmPasswordError('')
    }
  };

  const handleSignUp = async () => {
    if (fullName === '') {
      setNameError('Name can not be empty');
      setTimeout(function() {
        setNameError('');
      }, 500);
      return
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      setTimeout(function() {
        setEmailError('');
      }, 500);
      return
    }else if (!validatePassword(password)) {
      setPasswordError('Please enter a valid password');
      setTimeout(function() {
        setPasswordError('');
      }, 500);
      return
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Password does not match');
      setTimeout(function() {
        setPasswordError('');
      }, 500);
      return
    } 
    try {
      setLoading(true);
      let response = await SignIn({
        name: fullName,
        email: email,
        password: password,
        role: 'assignee'
      });
      console.log('Sign-in --',response);
      if (response.res) {
        console.log('Sign-in successful',response);
        toast.success(<>
          <div >
            <h3>Welcome Aboard!</h3>
          </div>
          <p>Your sign-up was successful. You can now explore your new account.</p>
        </>, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        navigate('/login');
        } else {
          console.error('Sign-in failed:', response.error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('loggedIn');

          toast.error(<>
            <div >
              <h3>Oops! There's a Hitch.</h3>
            </div>
            <p>We couldn't create your account due to a hiccup. Please double-check your information and try again. If the problem persists, reach out to our support team for help.</p>
          </>, {
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
      }finally {
      setLoading(false); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSignUp();
    }
  };
  
  return (
  <>
  {loading &&  <div className='loaderDiv'>
    <Bars
      height="80"
      width="80"
      color="#E2E31F"
      ariaLabel="bars-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  </div>}
    <div className='SignUpSection'>
      <div>
        <h2>Welcome To <span className='colorHeading'>Plan</span> <span className='textStroke'>A</span></h2>
        <p>Please sign up to continue</p>
        <form>
          <div className={`customInput ${nameError !== '' && 'errorClass'}`}>
            <div className='IconBox'><User /></div>
            <input name='fullName' placeholder='Full Name' value={fullName} onChange={handleNameChange} onKeyDown={handleKeyDown}/>
          </div>
          <div className={`customInput ${emailError !== '' && 'errorClass'}`}>
            <div className='IconBox'><Email /></div>
            <input name='email' placeholder='Email' value={email} onChange={handleEmailChange} onKeyDown={handleKeyDown}/>
          </div>
          <div className={`customInput ${passwordError !== '' && 'errorClass'}`}>
            <div className='IconBox'><OpenedLock /></div>
            <input 
              type={showPassword ? 'text' : 'password'}
              id="signUpPassword"
              name="signUpPassword"
              value={password}
              onChange={handlePasswordChange}
              placeholder='Password'
              autoComplete="password"
              className='passwordInput'
              onKeyDown={handleKeyDown}/>
            <span
              className={`toggle-eye-icon ${showPassword ? 'show' : ''}`}
              onClick={handleTogglePassword}
            > 
              {showPassword ? <OpenedEye /> : <ClosedEye /> }
            </span>
          </div>
          <div className={`customInput ${confirmPasswordError !== '' && 'errorClass'}`}>
            <div className='IconBox'><ClosedLock /></div>
            <input 
              type={showPassword ? 'text' : 'password'}
              id="confirmSignUpPassword"
              name="confirmSignUpPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder='Confirm Password'
              autoComplete="password"
              className='passwordInput'
              onKeyDown={handleKeyDown}/>
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