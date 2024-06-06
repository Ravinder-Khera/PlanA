import React, { useEffect, useState } from 'react'
import { ClosedEye, Key, OpenedEye } from '../../../assets/svg'
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../services/auth';
import { toast } from 'react-toastify';
import { Bars } from 'react-loader-spinner'
import PasswordStrengthMeter from '../../../Components/PasswordStrengthMeter';

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
    const [loading, setLoading] = useState(false);

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
        setTimeout(function() {
          setPasswordError('');
        }, 500);
        return
      } else if (password !== confirmPassword) {
        setTimeout(function() {
          setConfirmPasswordError('');
        }, 500);
        return
      } 
      try {
      setLoading(true);
      let response = await resetPassword({
          token : token,
          email : email,
          password : password,
          password_confirmation : confirmPassword
        });
    
        if (response.res) {
          console.log('Password reset successful',response.res);
          toast.success(<>
            <div >
              <h3>Password Reset Successfully</h3>
            </div>
            <p>Your password has been updated. You can now log in with your new password.</p>
          </>, {
            position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
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
            setPasswordReset(false)
            console.error('Password reset failed:', response.error);
            toast.error(<>
              <div >
                <h3>Reset Unsuccessful</h3>
              </div>
              <p>There was an issue resetting your password. Please try again or contact support.</p>
            </>, {
              position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
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
        handlePasswordReset();
      }
    };
    return (<>
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
                      id="resetPassword"
                      name="resetPassword"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder='Password'
                      autoComplete="new-password"
                      className='passwordInput'
                      onKeyDown={handleKeyDown}
                  />
                  <span className={`toggle-eye-icon ${showPassword ? 'show' : ''}`} onClick={handleTogglePassword} > 
                      {showPassword ? <OpenedEye /> : <ClosedEye /> }
                  </span>
              </div>
              <div className={`customInput ${confirmPasswordError !== '' && 'errorClass'}`}>
                  <div className='IconBox'><Key /></div>
                  <input 
                      type={showPassword ? 'text' : 'password'}
                      id="confirmResetPassword"
                      name="confirmResetPassword"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder='Confirm Password'
                      className='passwordInput'
                      autoComplete="new-password"
                      onKeyDown={handleKeyDown}
                  />
                  <span className={`toggle-eye-icon ${showPassword ? 'show' : ''}`} onClick={handleTogglePassword} > {showPassword ? <OpenedEye /> : <ClosedEye /> }</span>
              </div>
          </form>
          <PasswordStrengthMeter password={password}/>
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