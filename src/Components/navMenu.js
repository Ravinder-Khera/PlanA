import React from 'react'
import { BellIcon, Search, User } from '../assets/svg'

function NavMenu() {
  return (<>
    <nav className='container-fluid navMenuDiv'>
        <div className='d-flex justify-content-between'>
            <form>
                <div className='searchBox'>
                    <div className='IconBox'><Search /></div>
                    <input name='search' placeholder='Search'/>
                </div>
                <div className='selectBox'>
                    <select class="form-select" aria-label="Default select example">
                        <option selected>Select</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </select>
                </div>
            </form>
            <div>
            <div className="d-flex align-items-center justify-content-end"  style={{ minWidth: "250px" }}>
                <div style={{ textAlign: "end" }} >
                  <p>Jane Doe</p>
                  <span style={{ fontSize: "12px", fontWeight: "300" }}>
                  Town Planner
                  </span>
                </div>
                <div className="UserImg" style={{ minWidth: "40px" }}>
                  <User />
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