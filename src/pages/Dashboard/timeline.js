import React, { useEffect, useState } from 'react'
import { Bars } from 'react-loader-spinner'
import Timeline from 'react-calendar-timeline'
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import { getJobs } from '../../services/auth'

const groups1 = [{ id: 1, title: 'group 1' }, { id: 2, title: 'group 2' }]
const items1 = [
  {
    id: 1,
    group: 1,
    title: 'item 1',
    start_time: moment(),
    end_time: moment().add(1, 'hour')
  },
  {
    id: 2,
    group: 2,
    title: 'item 2',
    start_time: moment().add(-0.5, 'hour'),
    end_time: moment().add(0.5, 'hour')
  },
  {
    id: 3,
    group: 1,
    title: 'item 3',
    start_time: moment().add(2, 'hour'),
    end_time: moment().add(3, 'hour')
  }
]

function TimelinePage() {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
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
        project.usersArray = usersArray;
      });
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
  
    const groups = jobs?.map((job) => ({
      id: job.id, title: job.title, stackItems: true, height: 110
    }));
  
    console.log('jobs', jobs, moment("2024-03-28", "YYYY-MM-DD"));
    console.log('items', items);
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
          {jobs &&
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
          }
        </div>
      </div>
  </>)
}

export default TimelinePage