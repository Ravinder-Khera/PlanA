import React, { useEffect, useState } from "react";
import { Bars } from "react-loader-spinner";
import Timeline from "../../Components/Timeline";

function TimelinePage() {
  const [loading, setLoading] = useState(false);
  const [randomNumber, setRandomNumber] = useState(0);

  useEffect(() => {
    const newRandomNumber = Math.floor(Math.random() * 100); 
    setRandomNumber(newRandomNumber);
  }, []);

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
      <div className="DashboardTopMenu DashboardBgLines">
        <div className="DashboardHeading">
          <h2>Timeline</h2>
        </div>
        <Timeline timeFrame='monthly' loadNo={randomNumber} />
      </div>
    </>
  );
}

export default TimelinePage;
