import React, { useEffect, useState } from "react";
import { BellIcon, Search, User } from "../assets/svg";
import { getProfile } from "../services/auth";
import { Bars } from "react-loader-spinner";
import eventEmitter from "../Event";
import { Link } from "react-router-dom";

function NavMenu() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [userImg, setUserImg] = useState("");
  const [selectedValue, setSelectedValue] = useState('');

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      let response = await getProfile(authToken);
      if (response.res) {
        setUser(response.res.user.name);
        setUserImg(response.res.user.profile_pic);
        localStorage.setItem("user", response.res.user.name);
      } else {
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

  eventEmitter.removeAllListeners("updateProfile");
  eventEmitter.on("updateProfile", fetchProfileData);

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
      <nav className="container-fluid navMenuDiv">
        <div className="d-flex justify-content-between">
          <form>
            <div className="searchBox">
              <div className="IconBox">
                <Search />
              </div>
              <input
                name="search"
                placeholder="Search"
                onChange={(e) => e.preventDefault}
              />
            </div>
            <div className="selectBox">
              <select
                className="form-select"
                aria-label="Default select example"
                placeholder="Select"
                value={selectedValue}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Job">Job</option>
                <option value="Task">Task</option>
                <option value="Invoice">Invoice</option>
              </select>
            </div>
          </form>
          <div>
            <div
              className="d-flex align-items-center justify-content-end"
              style={{ minWidth: "250px" }}
            >
              <Link className="d-flex" style={{textDecoration:'none'}} to="/settings">
                <div
                  style={{ textAlign: "end" }}
                  className="d-flex flex-column justify-content-center"
                >
                  <p>{[user]}</p>
                  <span style={{ fontSize: "12px", fontWeight: "300" }}>
                  {[user?.job_title]}
                  </span>
                </div>
                <div className="UserImg" style={{ minWidth: "40px" }}>
                  {userImg ? (
                    <img
                      alt={userImg}
                      src={
                        process.env.REACT_APP_USER_API_CLOUD_IMG_PATH + userImg
                      }
                    />
                  ) : (
                    <User />
                  )}
                </div>
              </Link>
              <div className="bellIcon">
                <BellIcon />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const authToken = localStorage.getItem("authToken");
    const data = await getProfile(authToken);
    return { props: { data } };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { props: { data: null } };
  }
}

export default NavMenu;
