import React from 'react';
import zxcvbn from 'zxcvbn';
import './PasswordStrengthMeter.scss'

function PasswordStrengthMeter({password}) {
    const testedResult = zxcvbn(password);
    const createPasswordLabel = (result) => {
        switch (result.score) {
          case 0:
            return 'Weak';
          case 1:
            return 'Weak';
          case 2:
            return 'Fair';
          case 3:
            return 'Good';
          case 4:
            return 'Strong';
          default:
            return 'Weak';
        }
      }
    return (
    <div className="password-strength-meter">
        <progress
            className={`password-strength-meter-progress strength-${createPasswordLabel(testedResult)}`}
            value={testedResult.score}
            max="4"
        />
        <br />
        <label
          className="password-strength-meter-label"
        >
           {password && (
            <>
              <strong>Password Strength:</strong> {createPasswordLabel(testedResult)}
            </>
          )}
        </label>
      </div>
    );
}

export default PasswordStrengthMeter;