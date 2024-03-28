import React, { useState } from 'react'
import { Bars } from 'react-loader-spinner'

function TimelinePage() {
    const [loading, setLoading] = useState(false);
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
  <div className='DashboardTopMenu'>
    <div className='DashboardHeading'>
      <h2>Timeline</h2>
    </div>
    </div>
  </>)
}

export default TimelinePage