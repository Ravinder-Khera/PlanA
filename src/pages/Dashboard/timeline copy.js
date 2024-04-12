import React, { useEffect, useRef, useState } from 'react'
import { Bars } from 'react-loader-spinner'
import moment from 'moment'
import { getJobs } from '../../services/auth'

import Calendar from '@event-calendar/core';
import TimeGrid from '@event-calendar/time-grid';
import '@event-calendar/core/index.css';


// const localizer = momentLocalizer(moment)
// const events= [
//   {
//     start: moment().toDate(),
//     end: moment()
//       .add(1, "days")
//       .toDate(),
//     title: "Some title"
//   }
// ]

function TimelinePage() {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState("");
    const calendarContainerRef = useRef(null);

    useEffect(() => {
      const ec = new Calendar({
        target: calendarContainerRef.current,
        props: {
          plugins: [TimeGrid],
          options: {
            view: 'timeGridWeek',
            events: createEvents()
          }
        }
      });
  
      return () => {
        ec.destroy();
      };
      function createEvents() {
        return jobs?.map((job, index) => 
        {
            const nearestStage = findNearestStage(job)
            const users = extractUsersFromStages(job)
            return {

              start: moment(job.created_at).startOf('day').add(9, 'hours').toDate(),
              end: moment(job.due_date).endOf('day').add(17, 'hours').toDate(),
              resourceId: index % 2 === 0 ? 1 : 2, // Assigning resourceId alternately
              title: { html: `${ job.title} </br> stage -${nearestStage} </br> assignee ${users}` },
              color: nearestStage === 'Application' ? "#3B923999" : nearestStage === 'default' ? "#35353599" : "red", 
              allDay: true
            }
        }) || [];
      }
    }, []);

    useEffect(() => {
      
    }, []);
  
    const _pad = (num) => {
      let norm = Math.floor(Math.abs(num));
      return (norm < 10 ? '0' : '') + norm;
    };
  


    function extractUsersFromStages(data) {
      if (!data) return;
      let usersArray;
     
        usersArray = [];
        data.stages?.forEach((stage) => {
          stage.tasks?.forEach((task) => {
            if (task.users) usersArray.push(...task.users);
          });
        });
        return usersArray?.length || 0
    }
  
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await getJobs();
        const data = res?.res?.data;
        setJobs(data);
        setFilteredJobs(data);
        if (data) {
          extractUsersFromStages(data);
          console.log("data", data);
        }
      } catch (error) {
        console.log("error while fetching jobs", error);
      } finally {
        setLoading(false);
      }
    };

    const findNearestStage = (data) => {
      let nearestStage = null;
      let nearestDueDate = Infinity;
  
      data?.stages?.forEach((stage) => {
        stage?.tasks?.forEach((task) => {
          const dueDate = new Date(task.due_date);
          const currentDate = new Date();
  
          const difference = dueDate - currentDate;
  
          if (difference > 0 && difference < nearestDueDate) {
            nearestDueDate = difference;
            nearestStage = stage;
          }
        });
      });
      return nearestStage ? nearestStage.title : "default";
    };
  
    useEffect(() => {
      fetchJobs();
    }, []);
  
    const items = jobs?.map((job) => ({
      id: job.id,
      group: job.id,
      title: job.title,
      start_time: moment(job.created_at).toDate(),
      end_time: moment(job.due_date).toDate(),
      className: 'timeLineJobItem ' + findNearestStage(job),
      itemProps: {
        'aria-hidden': true,
        onDoubleClick: () => { console.log('You clicked double!', job.id) },
        style: {
          height: '110px',
          border: 'none'
        }
      }
    }));
  
  return (<>
    {loading && <div className='loaderDiv'>
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
          {/* {jobs &&
            <Timeline
              leftSidebarWidth={0}
              sidebarWidth={0}
              groups={groups}
              bgColor='red'
              className='customTimeline'
              items={items}
              defaultTimeStart={moment().add(0, 'day')}
              defaultTimeEnd={moment().add(1, 'week')}
            />
          } */}
          <div ref={calendarContainerRef}></div>
          {/* <Calendar
            events={items}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
          /> */}
        </div>
      </div>
  </>)
}

export default TimelinePage