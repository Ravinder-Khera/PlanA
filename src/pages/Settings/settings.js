import React, { useEffect, useRef, useState } from "react";
import { AaIcon, ClosedEye, Key, OpenedEye, User } from "../../assets/svg";
import upload from "../../assets/icons/uploadImg.png";
import {
  changePassword,
  getProfile,
  resetPassword,
  updateProfile,
  updateProfilePicture,
} from "../../services/auth";
import { toast } from "react-toastify";
import { Bars } from "react-loader-spinner";
import eventEmitter from "../../Event";
import PasswordStrengthMeter from "../../Components/PasswordStrengthMeter";
import { useLocation, useNavigate } from "react-router-dom";

function ProfileDetails({ userFirstName, userLastName, userDesignation, fetchProfileData }) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [nameError, setNameError] = useState("");
  const [jobError, setJobError] = useState("");

  const handleFirstNameChange = (e) => {
    const inputValue = e.target.value;
    const isValid = /^[a-zA-Z\s]*$/.test(inputValue);
    if(isValid) {
      setFirstName(inputValue);
      setNameError("");
    } else if (!inputValue) {
      setNameError("Name can not be empty");
    } else {
      setNameError("");
    }
  };

  const handleJobTitleChange = (e) => {
    const inputValue = e.target.value;
    const isValid = /^[a-zA-Z\s]*$/.test(inputValue); // Allow empty string
    if (isValid) {
      setDesignation(inputValue);
      setJobError(""); 
    } else {
      setJobError("Please enter a valid job title.");
    }
  };  

  const handleUpdateProfile = async () => {
    if (firstName === "") {
      setNameError("Name can not be empty");
      return;
    } else if (designation === "") {
      setJobError("Job Title can not be empty");
      return;
    } else if (firstName === userFirstName && lastName === userLastName && designation === userDesignation ) {
      return;
    }
    try {
      const authToken = localStorage.getItem("authToken");
      setLoading(true);
      let response = await updateProfile(
        {
          name: firstName + " " + lastName,
          designation: designation
        },
        authToken
      );

      if (response.res) {
        console.log("update successful", response);
        toast.success("Profile updated successfully", {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        localStorage.removeItem("user");
        fetchProfileData();
        eventEmitter.emit("updateProfile");
      } else {
        console.error("profile update failed:", response.error);
        toast.error(`${response.error.message}`, {
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
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFirstName(userFirstName);
    setLastName(userLastName);
    setDesignation(userDesignation)
  }, [userFirstName, userLastName, userDesignation]);
  return (
    <>
      {loading && (
        <div className="loaderDiv">
          <Bars
            height="80"
            width="80"
            color="#E2E31F"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}
      <div className="ProfileDetailsSection">
        <div className="contentDiv">
          <h3 className="settingsHeading">Hi {userFirstName}!</h3>
          <p>Please enter your details below:</p>
          <form>
            <div className={`customInput ${nameError !== "" && "errorClass"}`}>
              <input
                name="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={handleFirstNameChange}
              />
            </div>
            <div className="customInput">
              <input
                name="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="my-5"></div>
            <div className={`customInput ${jobError !== "" && "errorClass"}`}>
              <input name="jobTitle" placeholder="Job Title" 
                value={designation}
                onChange={handleJobTitleChange} />
            </div>
          </form>
          <div className="btnDiv">
            <button className="signupButton" disabled={firstName === userFirstName && lastName === userLastName && designation === userDesignation && true} onClick={handleUpdateProfile}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfilePic({ userPicture, fetchProfileData }) {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile && droppedFile.type.startsWith("image/")) {
      handleImageUpload(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleImageUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      setImage(reader.result);
      const formData = new FormData();
      formData.append("profile_pic", file);
      try {
        const authToken = localStorage.getItem("authToken");
        setLoading(true);
        let response = await updateProfilePicture(formData, authToken);
        if (response.res) {
          console.log(response);
          toast.success(`${response.res.message}`, {
            position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          fetchProfileData();
          eventEmitter.emit("updateProfile");
        } else {
          toast.error(`${response.error.message}`, {
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
        console.error("There was an error:", error);
        toast.error("An error occurred while uploading the image", {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
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

  const backgroundImageStyle = userPicture && userPicture !== 'default-profile-pic.jpg'
    ? {
        backgroundImage: `url(${process.env.REACT_APP_USER_API_CLOUD_IMG_PATH + userPicture})`,
        backgroundSize: "cover",
      }
    : {};

  return (
    <>
      {loading && (
        <div className="loaderDiv">
          <Bars
            height="80"
            width="80"
            color="#E2E31F"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}
      <div className="ProfileDetailsSection">
        <div className="contentDiv">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleUploadClick}
            className="imgUploadArea"
            style={backgroundImageStyle}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
            {image && (
              <div className="uploadedImg">
                <img src={image} alt="Dropped" style={{ maxWidth: "100%" }} />
                <button onClick={handleClearImage}>X</button>
              </div>
            )}
          </div>
          <div className="imgUploadTextArea">
            <img
              src={upload}
              className="img-fluid"
              alt="+"
              onClick={handleUploadClick}
            />
            <p>
              <span onClick={handleUploadClick}>Click to upload</span>
              or drag and dropSVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function PasswordReset({fetchProfileData}) {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

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

  const handleOldPasswordChange = (e) => {
    const inputValue = e.target.value;
    setOldPassword(inputValue);

    if (!inputValue) {
      setOldPasswordError('');
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
  };

  const handlePasswordReset = async () => {
    if (!validatePassword(password)) {
      setPasswordError('Please enter a valid password');
      setTimeout(function() {
        setPasswordError('');
      }, 500);
      return
    } 
    if (confirmPassword !== password) {
      setConfirmPasswordError('Password does not match');
      return
    } else if (!confirmPassword){
      setConfirmPasswordError('Password can not be empty');
      return
    } else {
      setConfirmPasswordError('')
    }
    try {
    const authToken = localStorage.getItem("authToken");
    setLoading(true);
    let response = await changePassword(
        {
          current_password : oldPassword,
          new_password : password,
          new_password_confirmation : confirmPassword,
        },authToken
      );
  
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
        fetchProfileData()
        } else {
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

    <div className="ProfileDetailsSection">
      <div className="contentDiv">
        <div className='SignUpSection'>
          <div>
            <h2>Change Password</h2>
            <p>Set a new password to continue your login process.</p>
            <form>
              <div className={`customInput ${oldPasswordError !== '' && 'errorClass'}`}>
                  <div className='IconBox'><Key /></div>
                  <input 
                      type={showOldPassword ? 'text' : 'password'}
                      id="oldPassword"
                      name="oldPassword"
                      value={oldPassword}
                      onChange={handleOldPasswordChange}
                      placeholder='Old Password'
                      autoComplete="old-password"
                      className='passwordInput'
                      onKeyDown={handleKeyDown}
                  />
                  <span className={`toggle-eye-icon ${showOldPassword ? 'show' : ''}`} onClick={handleToggleOldPassword} > 
                      {showOldPassword ? <OpenedEye /> : <ClosedEye /> }
                  </span>
              </div>
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
      </div>
    </div>
  </>)
}

function SettingsPage() {
  const [settingsPage, setSettingsPage] = useState("ProfileDetails");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [userPicture, setUserPicture] = useState("");

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      let response = await getProfile(authToken);
      if (response.res) {
        setUser(response.res.user.name);
        localStorage.setItem("user", response.res.user.name);
        setFirstName(response.res.user.name.split(" ")[0]);
        const lastName = response.res.user.name.split(" ").slice(1).join(" ");
        setLastName(lastName);
        const userPic = response.res.user.profile_pic;
        setUserPicture(userPic);
        setDesignation(response.res.user.designation)
      } else {
        setLoading(false);
        console.error("profile error:", response.error);
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <>
      {loading && (
        <div className="loaderDiv">
          <Bars
            height="80"
            width="80"
            color="#E2E31F"
            ariaLabel="bars-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      )}
      <div className="squareBg settingPageFlex">
        <div className="settingsPageSection">
          <h3 className="settingsHeading">Settings</h3>
          <ul className="pt-3 mx-auto px-1 settingsList">
            <li
              className={`${settingsPage === "ProfileDetails" && "active"}`}
              onClick={() => setSettingsPage("ProfileDetails")}
            >
              <button>
                <div className="iconBox">
                  <AaIcon />
                </div>
                <div className="text-start">
                  <h6>{user}</h6>
                  <p>Edit your profile details.</p>
                </div>
              </button>
            </li>
            <li
              className={`${settingsPage === "ProfilePic" && "active"}`}
              onClick={() => setSettingsPage("ProfilePic")}
            >
              <button>
                <div className="iconBox">
                  <User />{" "}
                </div>
                <div className="text-start">
                  <h6>Profile Picture</h6>
                  <p>Update your profile picture.</p>
                </div>
              </button>
            </li>
            <li
              className={`${settingsPage === "PasswordReset" && "active"}`}
              onClick={() => setSettingsPage("PasswordReset")}
            >
              <button>
                <div className="iconBox">
                  <Key />{" "}
                </div>
                <div className="text-start">
                  <h6>Change Password</h6>
                  <p>Create a new password here.</p>
                </div>
              </button>
            </li>
          </ul>
        </div>
        {settingsPage === "ProfileDetails" && (
          <ProfileDetails
            userFirstName={firstName}
            userLastName={lastName}
            userDesignation={designation}
            fetchProfileData={fetchProfileData}
          />
        )}
        {settingsPage === "ProfilePic" && (
          <ProfilePic
            userPicture={userPicture}
            fetchProfileData={fetchProfileData}
          />
        )}

        {settingsPage === "PasswordReset" && (
          <PasswordReset
            fetchProfileData={fetchProfileData}
          />
        )}
      </div>
    </>
  );
}

export default SettingsPage;
