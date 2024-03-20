import React, { useRef, useState } from 'react'
import { AaIcon, User } from '../../assets/svg'
import upload from '../../assets/icons/uploadImg.png'

function ProfileDetails() {
    return (<>
    <div className='ProfileDetailsSection'>
        <div className='contentDiv'>
            <h3 className='settingsHeading'>Hi Jane!</h3>
            <p>Please enter your details below:</p>
            <form>
                <div className='customInput'>
                    <input name='firstName' placeholder='First Name'/>
                </div>
                <div className='customInput'>
                    <input name='lastName' placeholder='Last Name'/>
                </div>
                <div className='my-5'></div>
                <div className='customInput'>
                    <input name='jobTitle' placeholder='Job Title'/>
                </div>
            </form>
            <div className='btnDiv'>
                <button className='signupButton' >
                Save Changes
                </button>
            </div>
        </div>
    </div>
    </>)
}

function ProfilePic() {
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];

        if (droppedFile && droppedFile.type.startsWith('image/')) {
        handleImageUpload(droppedFile);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleImageUpload = (file) => {
        const reader = new FileReader();
        reader.onload = () => {
        setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
        handleImageUpload(selectedFile);
        }
    };

    const handleClearImage = () => {
        setImage(null);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
        fileInputRef.current.click();
        }
    };

    return(<>
        <div className='ProfileDetailsSection'>
            <div className='contentDiv'>
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={handleUploadClick}
                    className='imgUploadArea'
                >
                    <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                    />
                    {image && (
                        <div className='uploadedImg'>
                            <img
                            src={image}
                            alt="Dropped"
                            style={{ maxWidth: '100%'}}
                            />
                            <button onClick={handleClearImage}>X</button>
                        </div>
                    )}
                </div>
                <div className='imgUploadTextArea' >
                    <img src={upload} className='img-fluid' alt='+' onClick={handleUploadClick}/>
                    <p>
                        <span onClick={handleUploadClick}>Click to upload</span>
                        or drag and drop SVG, PNG, JPG or GIF (max. 800x400px)
                    </p>
                </div>
            </div>
        </div>
    </>)
}

function SettingsPage() {
  return (<>
    {/* <div className='squareBg'></div> */}
  <div className='d-flex squareBg'>
    <div className='settingsPageSection'>
        <h3 className='settingsHeading'>Settings</h3>
        <ul className='pt-3 mx-auto px-1 settingsList'>
          <li className='active'>
            <a href='/dashboard'>
              <div className='iconBox'><AaIcon /></div>
              <div>
                <h6>Jane Doe</h6>
                <p>Edit your profile details.</p>
              </div>
            </a>
          </li>
          <li>
            <a href='/dashboard'>
              <div className='iconBox'><User /> </div>
              <div>
                <h6>Profile Picture</h6>
                <p>Update your profile picture.</p>
              </div>
            </a>
          </li>
        </ul>
    </div>
    <ProfileDetails />
    {/* <ProfilePic /> */}
  </div>
  </>)
}

export default SettingsPage