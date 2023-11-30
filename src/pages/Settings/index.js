import React from 'react'
import { AaIcon, User } from '../../assets/svg'

function SettingsPage() {
  return (<>
    <div className='settingsPageSection'>
        <h3 className='settingsHeading'>Settings</h3>
        <ul className='pt-3 mx-auto px-1 settingsList'>
          <li className='active'>
            <a href='/login'>
              <div className='iconBox'><AaIcon /></div>
              <div>
                <h6>Jane Doe</h6>
                <p>Edit your profile details.</p>
              </div>
            </a>
          </li>
          <li>
            <a href='/signup'>
              <div className='iconBox'><User /> </div>
              <h6>Profile Picture</h6>
              <p>Update your profile picture.</p>
            </a>
          </li>
        </ul>
    </div>
  </>)
}

export default SettingsPage