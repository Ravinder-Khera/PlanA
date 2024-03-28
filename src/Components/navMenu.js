import React, { useEffect, useState } from 'react'
import { BellIcon, Search, User } from '../assets/svg'
import { getProfile } from '../services/auth';
import { Bars } from 'react-loader-spinner';

function NavMenu() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('');
  const [userImg, setUserImg] = useState('');

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      let response = await getProfile();
      if (response.res) {
        setUser(response.res.user.name);
        setUserImg(response.res.user.profile_pic);
        localStorage.setItem('user', response.res.user.name);
      } else {
        console.error('profile error:', response.error);
      }
    } catch (error) {
      console.error('There was an error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfileData ()

  }, []);
  
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
    <nav className='container-fluid navMenuDiv'>
        <div className='d-flex justify-content-between'>
            <form>
                <div className='searchBox'>
                    <div className='IconBox'><Search /></div>
                    <input name='search' placeholder='Search'/>
                </div>
                <div className='selectBox'>
                    <select className="form-select" aria-label="Default select example">
                        <option value={''}>Select</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </select>
                </div>
            </form>
            <div>
            <div className="d-flex align-items-center justify-content-end"  style={{ minWidth: "250px" }}>
                <div style={{ textAlign: "end" }} >
                  <p>{[user]}</p>
                  <span style={{ fontSize: "12px", fontWeight: "300" }}>
                  Town Planner
                  </span>
                </div>
                <div className="UserImg" style={{ minWidth: "40px" }}>
                  {userImg ? <img alt={userImg} src={process.env.REACT_APP_USER_API_CLOUD_IMG_PATH+userImg} /> :
                    <User />
                   }
                </div>
                <div className='bellIcon'>
                    <BellIcon />
                </div>
              </div>
            </div>
        </div>
    </nav>
  </>)
}

export default NavMenu