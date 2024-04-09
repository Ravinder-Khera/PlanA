import React, { useState } from 'react'
import { Bars } from 'react-loader-spinner'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

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
      <FullCalendar
        timeZone= 'UTC'
        plugins={[ dayGridPlugin ]}
        themeSystem= 'bootstrap5'
        initialView="dayGridWeek"
        headerToolbar={
          {
            left:  'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }
        }
        events={[
          { title: 'event 1', date: new Date() },
          { title: 'event 2', date: new Date(
            new Date().getFullYear(),
            new Date().getMonth() ,
            new Date().getDate() +1
          ) },
          { title: 'event 3', date: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1 ,
            new Date().getDate() +1
          ) }
        ]}
      />
    </div>
    </div>
  </>)
}

export default TimelinePage