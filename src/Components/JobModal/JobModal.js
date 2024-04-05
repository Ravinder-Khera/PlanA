import { useEffect, useState } from "react";
import "./style.scss";
import Slider from "react-slick";

const JobModal = ({ data, handleClose, stage }) => {
  const [tasks, setTasks] = useState({});
  const [filteredTasks, setFilteredTasks] = useState({});
  const [dueDate, setDueDate] = useState(null);
  const [latestUpdate, setLatestUpdate] = useState("");
  const [selectedTab, setSelectedTab] = useState("to-do");
  const [selectedStage, setSelectedStage] = useState();
  const [selectedTasks, setSelectedTasks] = useState();
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 3,
    speed: 500,
    arrow: true,
  };

  useEffect(() => {
    setLatestUpdate(data.latest_update);
    setDueDate(data.due_date);
    // Function to calculate the minimum due date for each stage
    function minDueDate(stage) {
      return stage.tasks.reduce(
        (min, task) => (task.due_date < min ? task.due_date : min),
        stage.tasks[0].due_date
      );
    }

    // Function to sort stages based on minimum due date
    function sortStages(stages) {
      const currentDate = new Date();
      stages.sort((a, b) => {
        const dueDateA = new Date(minDueDate(a));
        const dueDateB = new Date(minDueDate(b));
        const daysDifferenceA = Math.abs(
          (dueDateA - currentDate) / (1000 * 60 * 60 * 24)
        );
        const daysDifferenceB = Math.abs(
          (dueDateB - currentDate) / (1000 * 60 * 60 * 24)
        );
        return dueDateA - dueDateB || daysDifferenceA - daysDifferenceB;
      });
    }

    // Sorting stages
    sortStages(data.stages);

    // Function to sort tasks based on due date
    function sortTasks(tasks) {
      tasks.sort((a, b) => {
        const dueDateA = new Date(a.due_date);
        const dueDateB = new Date(b.due_date);
        return dueDateA - dueDateB;
      });
    }

    // Function to sort tasks in all stages
    function sortTasksInStages(stages) {
      stages.forEach((stage) => sortTasks(stage.tasks));
    }

    // Sorting tasks in all stages
    sortTasksInStages(data.stages);

    // Function to calculate days left for nearest task
    function daysLeftForNearestTask(tasks) {
      const currentDate = new Date();
      const nearestTask = tasks.find(
        (task) => new Date(task.due_date) >= currentDate
      );
      if (nearestTask) {
        const dueDate = new Date(nearestTask.due_date);
        const timeDiff = dueDate.getTime() - currentDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days and round up
      }
      return null; // If no task found
    }

    // Loop through stages to calculate days left for nearest task in each stage
    data.stages.forEach((stage) => {
      stage.daysLeftForNearestTask = daysLeftForNearestTask(stage.tasks);
    });

    const _tempTasks = createTaskArrayWithStageTitle(data);
    _tempTasks?.map((task) => task.status !== "completed");
    setTasks(_tempTasks);
    setFilteredTasks(_tempTasks);
  }, [data]);

  // Function to create task array with stageTitle field
  function createTaskArrayWithStageTitle(data) {
    const taskArray = [];
    data.stages.forEach((stage) => {
      const stageTitle = stage.title;
      stage.tasks.forEach((task) => {
        taskArray.push({ ...task, stageTitle });
      });
    });
    return taskArray;
  }

  useEffect(() => {
    let _tempTasks = tasks;
    if (!tasks.length) return;
    if (selectedTab === "to-do") {
      _tempTasks = tasks?.filter((task) => task.status !== "completed");
    } else {
      _tempTasks = tasks?.filter((task) => task.status === "completed");
    }
    console.log("temp tasks----->", _tempTasks);
    setFilteredTasks(_tempTasks);
  }, [selectedTab]);

  const handleStageCheckBoxSelect = (e, id) => {
    console.log("checked", e.target.checked, id);
    const { checked } = e.target;
    if (checked) {
      setSelectedStage((prevIds) => (prevIds ? [...prevIds, id] : [id]));
    } else {
      setSelectedStage((prevIds) =>
        prevIds ? prevIds.filter((selectedId) => selectedId !== id) : []
      );
    }
  };

  const handleTasksCheckBoxSelect = (e, id) => {
    console.log("checked", e.target.checked, id);
    const { checked } = e.target;
    if (checked) {
      setSelectedTasks((prevIds) => (prevIds ? [...prevIds, id] : [id]));
    } else {
      setSelectedTasks((prevIds) =>
        prevIds ? prevIds.filter((selectedId) => selectedId !== id) : []
      );
    }
  };

  return (
    <>
      <div className="loaderDiv2">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div className="container pop-container">
              <div className="popup-content">
                <div className="popup-section-left">
                  <div
                    className="top-section"
                    style={{ position: "sticky", top: "0", zIndex: "2" }}
                  >
                    <div className="topsection-left">
                      <div className="top-left-content">
                        <div
                          onClick={handleClose}
                          style={{ cursor: "pointer" }}
                        >
                          <img src="/assets/Frame 60.png" alt="" />
                        </div>
                        <div className="position w-100">
                          <div className="d-flex justify-content-between">
                            <div className="title">
                              <h1>
                                {data.title}{" "}
                                <span>
                                  <img
                                    className="penImage"
                                    src="/assets/pan.png"
                                    alt=""
                                  />
                                </span>
                              </h1>
                              <p>{data.location}</p>
                            </div>
                            <div className="d-flex gap-4">
                              <button className={`stageBtn btn_${stage}`}>
                                {stage}
                              </button>
                              <img
                                className="groupImage"
                                src="/assets/shortImage.png"
                                alt=""
                              />
                            </div>
                          </div>
                          <div className="progress-bar-container">
                            <div className="progress-upper">
                              <div className="progress-text">
                                <p>progress 25%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="top-right-content">
                    <div className="discription-heading text-start">
                      <h1>Description</h1>
                      <p>{data.description}</p>
                      {/* <p className="mt-3">
                        Donec eget lorem ultrices, condimentum magna feugiat,
                        pulvinar urna. Praesent quis cursus eros, vitae
                        vulputate dui. Etiam molestie nulla ac nibh ullamcorper
                        interdum. Morbi sit amet nulla vestibulum, lobortis orci
                        sed, vestibulum leo. Sed eget commodo turpis, sagittis
                        porttitor mauris...
                      </p>
                      <p className="read-more" style={{ color: "#E2E31F" }}>
                        Read more{" "}
                        <span className="downArrow">
                          <img src="/assets/downArrow.svg" alt="" />
                        </span>
                      </p> */}
                    </div>

                    <div className="slider-container">
                      <Slider {...settings}>
                        {data.stages.map((stage, index) => (
                          <div>
                            <div className="slider-box">
                              <label
                                htmlFor={`select_${index}`}
                                className="align-self-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`select_${index}`}
                                  style={{ display: "none" }}
                                  checked={selectedStage?.includes(stage.id)}
                                  onChange={(e) =>
                                    handleStageCheckBoxSelect(e, stage.id)
                                  }
                                />
                                {selectedStage?.includes(stage.id) ? (
                                  <div className="svg-box-2 mx-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="15"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                        fill="black"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="svg-box mx-2"></div>
                                )}
                              </label>
                              <div
                                className={`card-slider card_${stage.title}`}
                              >
                                <img
                                  src="/assets/Group 307 (1).png"
                                  className="card-image"
                                  alt=""
                                />
                                <h1 className="card-head mt-2">Applicant</h1>
                                <p className="card-para mt-2">
                                  {stage.tasks[0]?.title}
                                </p>
                                <p className="card-days-text mt-2">
                                  {stage.daysLeftForNearestTask} Days Left
                                </p>
                                <button
                                  className={`card-btn mt-2 btnn_${stage.title}`}
                                >
                                  <p className="btn-text">Jane Doe</p>
                                  <p
                                    className="btn-text"
                                    style={{ fontWeight: "300" }}
                                  >
                                    Assessment Manager
                                  </p>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>

                  <div className="table-section">
                    <div className="table-top-section">
                      <div className="tableTopLeft">
                        <h1>Tasks</h1>
                        <p>+ Add All Stages</p>
                      </div>
                      <div className="tableTopRight">
                        <button
                          className={`${
                            selectedTab === "to-do" ? "active" : ""
                          }`}
                          onClick={() => setSelectedTab("to-do")}
                        >
                          To Do
                        </button>
                        <img src="/assets/doubleArrow.png" alt="" />
                        <button
                          className={`${
                            selectedTab === "completed" ? "active" : ""
                          }`}
                          onClick={() => setSelectedTab("completed")}
                        >
                          Completed
                        </button>
                      </div>
                    </div>
                    <div className="table-main-section mt-4">
                      <ul>
                        {filteredTasks?.length > 0 &&
                          filteredTasks?.map((task, index) => (
                            <li key={index}>
                              <label
                                htmlFor={`task_select_${index}`}
                                className="align-self-center"
                              >
                                <input
                                  type="checkbox"
                                  id={`task_select_${index}`}
                                  style={{ display: "none" }}
                                  checked={selectedTasks?.includes(task.id)}
                                  onChange={(e) =>
                                    handleTasksCheckBoxSelect(e, task.id)
                                  }
                                />
                                {selectedTasks?.includes(task.id) ? (
                                  <div className="svg-box-2 mx-2">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="15"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <path
                                        d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
                                        fill="black"
                                      />
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="svg-box mx-2"></div>
                                )}
                              </label>
                              <div className="d-flex justify-content-between w-100 application-lodge">
                                <div className="d-flex gap-3 align-items-center ">
                                  <img
                                    src="/assets/Group 87.png"
                                    alt=""
                                    style={{ width: "18px", height: "18px" }}
                                  />
                                  <p className={`text_${task.stageTitle}`}>
                                    {task.title}
                                  </p>
                                </div>
                                <button className={`btn_${task.stageTitle}`}>
                                  {task.stageTitle === "Information Request"
                                    ? "Info Request"
                                    : task.stageTitle === "Public Notification"
                                    ? "Inform Public"
                                    : task.stageTitle}
                                </button>
                              </div>
                            </li>
                          ))}
                        {filteredTasks.length === 0 && <p>No task found</p>}
                      </ul>
                    </div>
                    <p className="read-more">
                      Hide Task{" "}
                      <span className="downArrow">
                        <img src="/assets/downArrow.svg" alt="" />
                      </span>
                    </p>
                  </div>

                  <div className="progressInputSection">
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Due/FUPOn</p>
                      <input
                        type="text"
                        name=""
                        id=""
                        placeholder="DD/MM/YYYY"
                        defaultValue={dueDate}
                        className="text-white"
                      />
                    </div>
                    <div
                      className="d-flex gap-3 "
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Latest Update</p>
                      <input
                        type="text"
                        name=""
                        id=""
                        placeholder="lorem ultrices, condimentum magna feugiat"
                        defaultValue={latestUpdate}
                        className="text-white"
                      />
                    </div>
                    <div
                      className="d-flex gap-3"
                      style={{ marginBottom: "6px" }}
                    >
                      <p>Status</p>
                      <button className={`btm-statusBtn ${data.status}`}>
                        {data.status}
                      </button>
                    </div>

                    <div className="d-flex gap-3 showMore  align-items-center ">
                      <img src="/assets/Frame 32.png" className="" alt="" />
                      <div className="showMoreLine ">
                        <p>Show More</p>
                        <p>+ Add Field</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="popup-section-right"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobModal;
