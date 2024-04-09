import React, { useEffect, useState } from 'react'
import { Bars } from 'react-loader-spinner'
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import { getJobs } from '../../services/auth'

const groups = [{ id: 1, title: 'group 1', stackItems: true, height: 130 }, { id: 2, title: 'group 2' }]

let createdDate = moment(new Date()).utc().format();
const items = [
  {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment(),
    end_time: moment().add(1, 'hour'),
    canMove: true,
    height: 100,
    bgColor: 'rgba(255, 0, 0, 0.6)',
    
  },
  {
    id: 2,
    group: 2,
    title: 'item 2',
    start_time: moment(),
    end_time: moment(createdDate).add(1, 'd'),
    height: 100,
    bgColor: 'rgba(255, 0, 0, 0.6)',
    className:'red',
    color: 'rgb(158, 14, 206)',
    selectedBgColor: 'rgba(225, 166, 244, 1)',
  },
  {
    id: 3,
    group: 1,
    title: 'item 3',
    start_time: moment().add(2, 'hour'),
    end_time: moment(createdDate).add(1, 'd'),
    className:'green'
  }
]

function TimelinePage() {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState();
    const [filteredJobs, setFilteredJobs] = useState("");

    function extractUsersFromStages(data) {
      if (!data) return;
      let usersArray;
      data?.forEach((project) => {
        usersArray = [];
        project.stages?.forEach((stage) => {
          stage.tasks?.forEach((task) => {
            if (task.users) usersArray.push(...task.users);
          });
          
        });
        project.usersArray = usersArray
      });
    }

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await getJobs();
        const data = res?.res?.data;
        setJobs(data);
        setFilteredJobs(data);
        // Extract users from stages
        if (data) {
          extractUsersFromStages(data);
          // Print the users array
          console.log("data", data);
          // setUsersList(users);
        }
      } catch (error) {
        console.log("error while fetching jobs", error);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchJobs();
    }, []);

    const items = jobs.map((job) => ({
      id: job.id,
      group: job.id,
      title: job.title,
      start_time: moment(job.start_time),
      end_time: moment(job.end_time),
      height: job.height || 100,
      bgColor: 'rgba(255, 0, 0, 0.6)',
      className: job.className || '',
      color: job.color || 'rgb(158, 14, 206)',
      selectedBgColor: job.selectedBgColor || 'rgba(225, 166, 244, 1)'
    }));

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
      {/* <Timeline
        leftSidebarWidth={0}
        sidebarWidth={0}
        groups={groups}
        bgColor='red'
        className='customTimeline'
        items={items}
        defaultTimeStart={moment().add(0, 'hour')}
        defaultTimeEnd={moment(createdDate).add(1, 'week')}
      /> */}
    </div>
  </div>
  </>)
}

export default TimelinePage