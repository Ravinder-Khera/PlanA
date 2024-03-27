import React, { useState } from 'react'
import { Email } from '../../../assets/svg'
import { forgotPassword } from '../../../services/auth';
import { toast } from 'react-toastify';
import { Bars } from 'react-loader-spinner'

export function ForgotPassword() {
  const [passwordReset , setPasswordReset] = useState(false)
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (inputEmail) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(inputEmail);
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

  const handlePasswordReset = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return
    }
    try {
      setLoading(true);
      let response = await forgotPassword({
        email: email
      });
      
      if (response.res) {     
        setPasswordReset(true)
        console.log('mail sent successfully',response.res.status,response.res);
        toast.success('mail sent successfully', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        } else {
          setPasswordReset(false)
          console.error('mail failed:', response.error);
          toast.error(`${Object.values(response.error.errors)[0][0]}`,{
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
          <h2>Check Your Email!</h2>
          <p>A reset link has been sent to your email.</p>
          <p className='resendLinkP'>Didn’t Get A Link? <span className='resendLinkA' onClick={handlePasswordReset}> Resend Here</span></p>
          <p className='resendLinkP mt-0'> <a className='resendLinkA' href='/forgot-password'> Back</a></p>
        </div>
    </div>
    :
    <div className='SignUpSection'>
      <div>
        <h2>Forgot Your Password?</h2>
        <p>Reset your password here.</p>
        <div className={`customInput ${emailError !== '' && 'errorClass'}`}>
          <div className='IconBox'><Email /></div>
          <input name='email' placeholder='Email' value={email} onChange={handleEmailChange}/>
        </div>
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
