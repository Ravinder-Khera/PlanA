import React, { useEffect, useRef, useState } from "react";
import { AaIcon, User } from "../../assets/svg";
import upload from "../../assets/icons/uploadImg.png";
import { getProfile, updateProfile, updateProfilePicture } from "../../services/auth";
import { toast } from "react-toastify";
import { Bars } from "react-loader-spinner";

function ProfileDetails({userName,fetchProfileData}) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleFirstNameChange = (e) => {
    const inputValue = e.target.value;
    setFirstName(inputValue);
    if (!inputValue) {
      setNameError('Name can not be empty');
    } else {
      setNameError('');
    }
  };
  const handleUpdateProfile = async () => {   
    if(firstName === ''){
      setNameError('Name can not be empty');
      return
    }
    try {
      setLoading(true);
      let response = await updateProfile({
        name: firstName+' '+lastName,
      });
  
      if (response.res) {
        console.log('update successful',response);
        toast.success('profile update successful', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        localStorage.removeItem('user');
        fetchProfileData();
        window.location.reload();
        } else {
          console.error('profile update failed:', response.error);
          toast.error(`profile update failed - ${response.error.message}`, {
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
    } finally {
      setLoading(false); 
    }
  };
  return (
    <>
    {loading &&  <div className='loaderDiv'>
      <Bars
        height="80"
        width="80"
        color="#4fa94d"
        ariaLabel="bars-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>}
      <div className="ProfileDetailsSection">
        <div className="contentDiv">
          <h3 className="settingsHeading">Hi {userName}!</h3>
          <p>Please enter your details below:</p>
          <form>
            <div className={`customInput ${nameError !== '' && 'errorClass'}`}>
              <input name="firstName" placeholder="First Name" value={firstName} onChange={handleFirstNameChange}/>
            </div>
            <div className="customInput">
              <input name="lastName" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)}/>
            </div>
            <div className="my-5"></div>
            <div className="customInput">
              <input name="jobTitle" placeholder="Job Title" />
            </div>
          </form>
          <div className="btnDiv">
            <button className="signupButton" onClick={handleUpdateProfile}>Save Changes</button>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfilePic() {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      const formData = new FormData();
      formData.append('profile_pic', file );
      updateProfilePicture(formData);
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

  return (
    <>
      <div className="ProfileDetailsSection">
        <div className="contentDiv">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleUploadClick}
            className="imgUploadArea"
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
              or drag and drop SVG, PNG, JPG or GIF (max. 800x400px)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}


function SettingsPage() {
  const [settingsPage, setSettingsPage]= useState('ProfileDetails');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('');
  const [firstName, setFirstName] = useState('');

  useEffect(()=>{
    const fetchData = async () => {
      try {
        setLoading(true);
        let response = await getProfile();
        if (response.res) {
          setUser(response.res.user.name);
          localStorage.setItem('user', response.res.user.name);
          setFirstName(response.res.user.name.split(' ')[0])
          } else {
            setLoading(false); 
            console.error('profile error:', response.error);
        }
      } catch (error) {
        console.error('There was an error:', error);
      } finally {
        setLoading(false); 
      }
    }
    fetchData();
  },[])

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      let response = await getProfile();
      if (response.res) {
        setUser(response.res.user.name);
        localStorage.setItem('user', response.res.user.name);
        setFirstName(response.res.user.name.split(' ')[0])
        window.location.href = '/settings';
      } else {
        console.error('profile error:', response.error);
      }
    } catch (error) {
      console.error('There was an error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="d-flex squareBg">
        <div className="settingsPageSection">
          <h3 className="settingsHeading">Settings</h3>
          <ul className="pt-3 mx-auto px-1 settingsList">
            <li className={`${settingsPage === 'ProfileDetails' && "active"}`} onClick={()=>setSettingsPage('ProfileDetails')}>
              <button >
                <div className="iconBox">
                  <AaIcon />
                </div>
                <div className="text-start">
                  <h6>{user}</h6>
                  <p>Edit your profile details.</p>
                </div>
              </button>
            </li>
            <li className={`${settingsPage === 'ProfilePic' && "active"}`} onClick={()=>setSettingsPage('ProfilePic')}>
              <button >
                <div className="iconBox">
                  <User />{" "}
                </div>
                <div className="text-start">
                  <h6>Profile Picture</h6>
                  <p>Update your profile picture.</p>
                </div>
              </button>
            </li>
          </ul>
        </div>
        {settingsPage === 'ProfileDetails' && <ProfileDetails userName={firstName} fetchProfileData={fetchProfileData} />}
        {settingsPage === 'ProfilePic' && <ProfilePic/>}
      </div>
    </>
  );
}

export default SettingsPage;
