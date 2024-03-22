import React from 'react'

function Dashboard() {
  return (<>
  <div className='DashboardTopMenu'>
    <div className='DashboardHeading'>
      <h2>Dashboard</h2>
    </div>
    <div className='dashboardBoxes'>
      <div className='custom_box'>
        <h3>12</h3>
        <p>Total Tasks</p>
      </div>
      <div className='custom_box'>
        <h3>3</h3>
        <p>Tasks Due</p>
      </div>
      <div className='custom_box'>
        <h3>5</h3>
        <p>Follow Up Jobs</p>
      </div>
      <div className='custom_box'>
        <h3>17</h3>
        <p>Total Jobs</p>
      </div>
    </div>
  </div>
  </>)
}

export default Dashboard