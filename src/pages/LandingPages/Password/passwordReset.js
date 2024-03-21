import React, { useEffect, useState } from 'react'
import { ClosedEye, Key, OpenedEye } from '../../../assets/svg'
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckToken, resetPassword } from '../../../services/auth';
import { toast } from 'react-toastify';

function PasswordReset() {
    const navigate = useNavigate();
    const [passwordReset , setPasswordReset] = useState(false)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
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
  
      if (inputValue !== password) {
        setConfirmPasswordError('Password does not match');
      } else if (!inputValue){
        setConfirmPasswordError('Password can not be empty');
      } else {
        setConfirmPasswordError('')
      }
    };

    const handlePasswordReset = async () => {
      if (!validatePassword(password)) {
        setPasswordError('Please enter a valid password');
        return
      } else if (confirmPassword !== '' || password !== confirmPassword) {
        return
      } 
      try {
        let response = await resetPassword({
          token : token,
          email : email,
          password : password,
          password_confirmation : confirmPassword
        });
    
        if (response.res) {
          console.log('Password reset successful',response.res);
          toast.success(`Password reset successful-${response.res.status} `, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          setPasswordReset(true)
          } else {
            console.error('Password reset failed:', response.error);
            toast.error(`Password reset failed `, {
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
      }
    };

    return (<>
      
      {passwordReset ? 
        <div className='SignUpSection'>
          <div>
            <h2>Reset Successful!</h2>
            <p>A reset link has been sent to your email.</p>
            <p className='resendLinkP mt-0'>Head to the <a className='resendLinkA' href='/login'> login page</a> and enter your new password! </p>
          </div>
      </div>
      :
      <div className='SignUpSection'>
        <div>
          <h2>Password Reset</h2>
          <p>Set a new password to continue your login process.</p>
          <form>
              <div className={`customInput ${passwordError !== '' && 'errorClass'}`}>
                  <div className='IconBox'><Key /></div>
                  <input 
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder='Password'
                      autoComplete="new-password"
                      className='passwordInput'
                  />
                  <span className={`toggle-eye-icon ${showPassword ? 'show' : ''}`} onClick={handleTogglePassword} > 
                      {showPassword ? <OpenedEye /> : <ClosedEye /> }
                  </span>
              </div>
              <div className={`customInput ${confirmPasswordError !== '' && 'errorClass'}`}>
                  <div className='IconBox'><Key /></div>
                  <input 
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder='Confirm Password'
                      className='passwordInput'
                      autoComplete="new-password"
                  />
                  <span className={`toggle-eye-icon ${showPassword ? 'show' : ''}`} onClick={handleTogglePassword} > {showPassword ? <OpenedEye /> : <ClosedEye /> }</span>
              </div>
          </form>
          <div className='btnDiv'>
            <button className='signupButton' onClick={handlePasswordReset}>
                Reset Password
            </button>
          </div>
        </div>
      </div>
      }
    </>)
}

export default PasswordReset