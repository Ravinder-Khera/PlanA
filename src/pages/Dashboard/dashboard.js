import React, { useEffect, useState } from 'react'
import CountUp from 'react-countup';
import { Bars } from 'react-loader-spinner';
import { getDashboardSummary } from '../../services/auth';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!data) {
      setLoading(true);
      fetchData();
    }
  }, [data]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      let response = await getDashboardSummary(authToken);
      if (response.res) {
        setData(response.res);
        setLoading(false)
        } else {
          setLoading(false); 
          console.error('dashboard error:', response.error);
      }
    } catch (error) {
      console.error('There was an error:', error);
    } finally {
      setLoading(false); 
    }
  }

  console.log('dashboard Data',data);

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
      <h2>Dashboard</h2>
    </div>
    <div className='dashboardBoxes'>
      <div className='custom_box'>
        
        <h3><CountUp start={0} end={data ? data.total_tasks : 0} duration={2} decimals={0} /></h3>
        <p>Total Tasks</p>
      </div>
      <div className='custom_box'>
        <h3><CountUp start={0} end={data ? data.tasks_due : 0} duration={2} decimals={0} /></h3>
        <p>Tasks Due</p>
      </div>
      <div className='custom_box'>
        <h3><CountUp start={0} end={data ? data.follow_up_jobs : 0} duration={2} decimals={0} /></h3>
        <p>Follow Up Jobs</p>
      </div>
      <div className='custom_box'>
        <h3><CountUp start={0} end={data ? data.total_jobs : 0} duration={2} decimals={0} /></h3>
        <p>Total Jobs</p>
      </div>
    </div>
  </div>
  </>)
}

export async function getServerSideProps() {
  try {
    const authToken = localStorage.getItem('authToken');
    const data = await getDashboardSummary(authToken);
    return { props: { data } };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { props: { data: null } };
  }
}

export default Dashboard