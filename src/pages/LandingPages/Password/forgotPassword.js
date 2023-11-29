import React, { useState } from 'react'
import { Email } from '../../../assets/svg'

export function ForgotPassword() {
  const [passwordReset , setPasswordReset] = useState(false)
  return (<>
    
    {passwordReset ? 
      <div className='SignUpSection'>
      <h2>Check Your Email!</h2>
      <p>A reset link has been sent to your email.</p>
      <p className='resendLinkP'>Didn’t Get A Link? <a className='resendLinkA' href='/forgotPassword'> Resend Here</a></p>
    </div>
    :
    <div className='SignUpSection'>
      <h2>Forgot Your Password?</h2>
      <p>Reset your password here.</p>
      <div className='customInput'>
        <div className='IconBox'><Email /></div>
        <input name='email' placeholder='Email'/>
      </div>
      <div className='btnDiv'>
        <button className='signupButton' onClick={()=>setPasswordReset(true)}>
            Reset Password
        </button>
      </div>
    </div>
    }
  </>)
}
