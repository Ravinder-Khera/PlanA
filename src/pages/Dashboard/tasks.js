import React, { useEffect, useState } from 'react'
import { Bars } from 'react-loader-spinner';
import { AddIcon, TaskIcon, User } from '../../assets/svg';
import { getTasks } from '../../services/auth';


function TaskPage() {
    const [loading, setLoading] = useState(true);
    const [addTask, setAddTask] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isChecked, setIsChecked] = useState({});

    const toggleCheckbox = (id) => {
        setIsChecked((prevCheckboxes) => ({
          ...prevCheckboxes,
          [id]: !prevCheckboxes[id] 
        }));
      };

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const authToken = localStorage.getItem('authToken');
                const response = await getTasks(authToken); 
                if (response.res) {
                    setTasks(response.res.data); 
                    console.log('tasks-',response.res.data);
                } else {
                    console.error('Failed to fetch tasks:', response.error);
                    setLoading(false); 
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false); 
            }
        };

        fetchTasks();
    }, []);

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
      <div className='DashboardHeading d-flex justify-content-between align-items-center'>
        <h2>Tasks</h2>
        <div className='addNewTaskBtn d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none' onClick={()=>setAddTask(!addTask)}>
            New Task <div className="UserImg" style={{ minWidth: "40px" }}><AddIcon /></div>
        </div>
      </div>
      <div className='taskContainer'>
        <ul>
            <li className='heading'>
                <div className='listContent'>Title</div>
                <div className='listContent centerContent'>
                    <div className='centerText'>Stage</div>
                    <div className='centerText'>Due Date</div>
                </div>
                <div className='listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none'>
                    Assignee <div className="UserImg" style={{ minWidth: "40px" }}><User /></div>
                </div>
            </li>
            {addTask && (
                <li className='heading addNewTaskDiv'>
                    <div className='listContent'>
                        <div className='addNewTaskBtn d-flex align-items-center gap-2 justify-content-start navMenuDiv p-0 bg-transparent shadow-none'>
                            <div className="UserImg m-0" style={{ minWidth: "40px" }}><AddIcon /></div>
                            <div className='addTaskJobBtn'>+ Job No.</div>
                            <input className='addTaskTitleBtn' placeholder='Task Title'/>
                        </div>
                    </div>
                    <div className='listContent centerContent'>
                        <div className='centerText addTaskJobBtn'>+ Add Stage</div>
                        <div className='centerText addTaskDueDateBtn'><TaskIcon/> Due Date</div>
                    </div>
                    <div className='listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none'>
                        <div className="UserImg withAddBtn" style={{ minWidth: "40px" }}><User /></div>
                    </div>
                </li>
            )}
            {tasks && tasks.filter(task => task.job_id === 9).map((task) => (
                <li key={task.id} className={`stage_`+task.stage.title}>
                    <div className={`listContent listTitle `}>
                        <label htmlFor={`select_${task.id}`}>
                            <input
                                type="checkbox"
                                checked={isChecked[`select_${task.id}`]}
                                onChange={() => toggleCheckbox(`select_${task.id}`)}
                                id={`select_${task.id}`}
                                style={{ display: "none" }}
                            />
                            {isChecked[`select_${task.id}`] ? (
                                <div className="svg-box-selected mx-2">
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
                                <div className="svg-box-not-selected mx-2"></div>
                            )}
                        </label>
                        <p>| {task.job_id}|<span>{task.title}</span></p>
                    </div>
                    <div className='listContent centerContent'>
                        <div className={`centerText stageBtn btn_${task.stage.title}`}>{task.stage.title}</div>
                        <div className='centerText'>{task.due_date}</div>
                    </div>
                    <div className='listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none'>
                        <div className="UserImg" style={{ minWidth: "40px" }}><User /></div>
                    </div>
                </li>
            ))}
        </ul>
      </div>
    </div>
    </>)
}

export default TaskPage