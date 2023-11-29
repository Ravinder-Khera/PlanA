import React, { useState } from 'react'
import { ClosedEye, Key, OpenedEye } from '../../../assets/svg'

function PasswordReset() {
    const [passwordReset , setPasswordReset] = useState(false)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
      };
    return (<>
      
      {passwordReset ? 
        <div className='SignUpSection'>
        <h2>Reset Successful!</h2>
        <p>A reset link has been sent to your email.</p>
        <p className='resendLinkP mt-0'>Head to the <a className='resendLinkA' href='/login'> login page</a> and enter your new password! </p>
      </div>
      :
      <div className='SignUpSection'>
        <h2>Password Reset</h2>
        <p>Set a new password to continue your login process.</p>
        <form>
            <div className='customInput'>
                <div className='IconBox'><Key /></div>
                <input 
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password'
                    autoComplete="new-password"
                    className='passwordInput'
                />
                <span className={`toggle-eye-icon ${showPassword ? 'show' : ''}`} onClick={handleTogglePassword} > 
                    {showPassword ? <OpenedEye /> : <ClosedEye /> }
                </span>
            </div>
            <div className='customInput'>
                <div className='IconBox'><Key /></div>
                <input 
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm Password'
                    className='passwordInput'
                    autoComplete="new-password"
                />
                <span className={`toggle-eye-icon ${showPassword ? 'show' : ''}`} onClick={handleTogglePassword} > {showPassword ? <OpenedEye /> : <ClosedEye /> }</span>
            </div>
        </form>
        <div className='btnDiv'>
          <button className='signupButton' onClick={()=>setPasswordReset(true)}>
              Reset Password
          </button>
        </div>
      </div>
      }
    </>)
}

export default PasswordReset