import React, { useEffect, useRef, useState } from 'react'
import { Bars } from 'react-loader-spinner';
import { AddIcon, NextIcon, PrevIcon, RedoIcon, Search, TaskIcon, User } from '../../assets/svg';
import { createTask, getJobIds, getTasks, getUserByRole, updateTask } from '../../services/auth';

import { DateRangePicker, Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { toast } from 'react-toastify';

function TaskPage() {
    const [loading, setLoading] = useState(true);
    const [addTask, setAddTask] = useState(false);
    const [taskTab, setTaskTab] = useState('todo');
    const [addTaskJobDropdown, setAddTaskJobDropdown] = useState(false);
    const [addTaskJobStageDropdown, setAddTaskJobStageDropdown] = useState(false);
    const [addTaskJobUserDropdown, setAddTaskJobUserDropdown] = useState(false);
    const [selectDate, setSelectDate] = useState(false);
    const [selectDueDate, setSelectDueDate] = useState(false);
    const [selectedDueDate, setSelectedDueDate] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [tasksToDo, setTasksToDo] = useState([]);
    const [tasksCompleted, setTasksCompleted] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchJobList, setSearchJobList] = useState('');
    const [selectedSearchJob, setSelectedSearchJob] = useState('');
    const [searchJobStages, setSearchJobStages] = useState([]);
    const [selectedSearchJobStage, setSelectedSearchJobStage] = useState('');
    const [selectedSearchJobStageId, setSelectedSearchJobStageId] = useState('');
    const [createTaskTitle, setCreateTaskTitle] = useState('');
    const [isChecked, setIsChecked] = useState({});

    const addTaskJobDropdownRef = useRef(null);
    const addTaskJobStageDropdownRef = useRef(null);
    const selectDateRef = useRef(null);
    const selectDueDateRef = useRef(null);
    const selectUserRef = useRef(null);
    
    const fetchTasksToDo = async () => {
        try {
            setLoading(true); 
            const authToken = localStorage.getItem('authToken');
            const requestOptions = {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${authToken}`,
                },
            };
            let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks/by-status-and-date?status=to-do&start_date=${selectionRange.startDate.toISOString().slice(0, 10)}&end_date=${selectionRange.endDate.toISOString().slice(0, 10)}&perPage=10`, requestOptions);
            const isJson = response.headers.get("content-type")?.includes("application/json");
            const data = isJson && (await response.json());
            setTasksToDo(data.data);
            if(response.status === 200){
                setLoading(false); 
                return { res: data, error: null } ;
            }else{
                return { res: null, error: data } ;
            }
        } catch (error) {
            console.error('Error fetching Tasks:', error);
        } finally {
            setLoading(false); 
        }
    };

    const fetchTasksCompleted = async () => {
        try {
            setLoading(true); 
            const authToken = localStorage.getItem('authToken');
            const requestOptions = {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${authToken}`,
                },
            };
            let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks/by-status-and-date?status=completed&start_date=${selectionRange.startDate.toISOString().slice(0, 10)}&end_date=${selectionRange.endDate.toISOString().slice(0, 10)}&perPage=10`, requestOptions);
            const isJson = response.headers.get("content-type")?.includes("application/json");
            const data = isJson && (await response.json());
            
            setTasksCompleted(data.data);
            if(response.status === 200){
                setLoading(false); 
                return { res: data, error: null } ;
            }else{
                return { res: null, error: data } ;
            }
        } catch (error) {
            console.error('Error fetching Tasks:', error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        let handler = (e) => {
          if (addTaskJobDropdownRef.current && !addTaskJobDropdownRef.current.contains(e.target)) {
            setAddTaskJobDropdown(false);
          }
          if (addTaskJobStageDropdownRef.current && !addTaskJobStageDropdownRef.current.contains(e.target)) {
            setAddTaskJobStageDropdown(false);
          }
          if (selectDateRef.current && !selectDateRef.current.contains(e.target)) {
            setSelectDate(false);
          }
          if (selectDueDateRef.current && !selectDueDateRef.current.contains(e.target)) {
            setSelectDueDate(false);
          }
          if (selectUserRef.current && !selectUserRef.current.contains(e.target)) {
            setAddTaskJobUserDropdown(false);
          }
        };
      
        document.addEventListener("mousedown", handler);
      
        return () => {
          document.removeEventListener("mousedown", handler);
        };
    }, []);

    const [selectionRange, setSelectionRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth()- 1 , new Date().getDate()),
        endDate: new Date(),
        key: 'selection',
    });

    const handleSelect = (ranges) => {
        setSelectionRange(ranges.selection);
        handleSubmit()
    };

    const handleSelectDueDate = (date) => {
        setSelectDueDate(false)
        setSelectedDueDate(date); 
    };

    const handleSubmit = () => {
        const apiUrl = `${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/tasks/by-status-and-date?status=to-do&start_date=${selectionRange.startDate.toISOString().slice(0, 10)}&end_date=${selectionRange.endDate.toISOString().slice(0, 10)}&perPage=4`;
    
        console.log('date range',apiUrl);
    };

    const toggleCheckbox = async (taskId) => {
        try {
            const cleanedTaskId = taskId.replace(/^select_/, '');
            const authToken = localStorage.getItem('authToken');
            setIsChecked(prevState => ({
                ...prevState,
                [taskId]: true 
            }));
            setLoading(true);
            const response = await updateTask({ status: 'completed' }, authToken, cleanedTaskId);
            console.log('update Task --',response);
            if (response.res) {
                const listItem = document.querySelector(`#stage_${cleanedTaskId}`);
                if (listItem) {
                    listItem.classList.add('addCompleted');
                }
                setTimeout(() => {
                    fetchTasksToDo();
                }, 1000);
                toast.success('Task moved to Completed', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
            } else {
                console.error('Task update failed:', response.error);
        
                toast.error(`${response.error.message}`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            }
            } catch (error) {
                console.error('There was an error:', error);
            }finally {
            setLoading(false); 
        }
    };

    const handleRevert = async (taskId) => {
        try {
            const cleanedTaskId = taskId.replace(/^select_/, '');
            const authToken = localStorage.getItem('authToken');
            setLoading(true);
            const response = await updateTask({ status: 'to-do' }, authToken, cleanedTaskId);
            console.log('update Task --',response);
            if (response.res) {
                const listItem = document.querySelector(`#stage_${cleanedTaskId}`);
                if (listItem) {
                    listItem.classList.add('addTodo');
                }
                setTimeout(() => {
                    fetchTasksCompleted();
                }, 1000);
                toast.success('Task Moved to To Do', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            } else {
                console.error('Task update failed:', response.error);
        
                toast.error(`${response.error.message}`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            }
            } catch (error) {
                console.error('There was an error:', error);
            }finally {
            setLoading(false); 
        }
    };

    const fetchJobStages = async (job_id) => {
        try {
            setLoading(true); 
            const authToken = localStorage.getItem('authToken');
            const requestOptions = {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${authToken}`,
                },
            };
            let response = await fetch(`${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/jobs/${job_id}/stages`, requestOptions);;
            const isJson = response.headers.get("content-type")?.includes("application/json");
            const data = isJson && (await response.json());
            setSearchJobStages(data);
            setSelectedSearchJob(job_id);
            setAddTaskJobDropdown(false)
            if(response.status === 200){
                setLoading(false); 
                return { res: data, error: null } ;
            }else{
                return { res: null, error: data } ;
            }
        } catch (error) {
            console.error('Error fetching jo stages:', error);
        } finally {
            setLoading(false); 
        }
    };

    const handleCreateTask = async () => {
        if (createTaskTitle === '') {
            toast.error(`Task title can not be empty`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
          return
        } else if (!selectedDueDate ) {
            toast.error(`Select Task Due Date`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
          return
        } else if (selectedSearchJob === '') {
            toast.error(`Select Job Id`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
              });
          return
        } else if (selectedSearchJobStage === '') {
            toast.error(`Select Stage `, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
          return
        } else if (selectedUsers.length <= 0) {
            toast.error(`Add Assignee to Task`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
          return
        } 
        try {
            const authToken = localStorage.getItem('authToken');
            setLoading(true);
            let response = await createTask({
                job_id: selectedSearchJob,
                stage_id: selectedSearchJobStageId,
                title: createTaskTitle,
                due_date: formattedDueDate,
                assignee_ids: selectedUsers
            },authToken);
            console.log('create Task --',response);
            if (response.res) {
                console.log('create Task successful',response);
                toast.success('Task created successful', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
                setSelectedDueDate(null);
                setJobList([]);
                setSelectedUsers([]);
                setSearchJobList('');
                setSelectedSearchJob('');
                setSearchJobStages([]);
                setSelectedSearchJobStage('');
                setSelectedSearchJobStageId('');
                setCreateTaskTitle('');
                } else {
                console.error('Task creation failed:', response.error);
        
                toast.error(`${Object.values(response.error.errors)[0][0]}`, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                });
            }
            } catch (error) {
                console.error('There was an error:', error);
            }finally {
            setLoading(false); 
        }
    };

    const handleUserClick = (userId) => {
        const isSelected = selectedUsers.includes(userId);

        if (isSelected) {
            setSelectedUsers(prevUsers => prevUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers(prevUsers => [...prevUsers, userId]);
        }
    };
    
    const formattedStartDate = selectionRange.startDate.toLocaleDateString('en-US', {  day: 'numeric',month: 'short', year: 'numeric' });
    const formattedEndDate = selectionRange.endDate.toLocaleDateString('en-US', {  day: 'numeric',month: 'short', year: 'numeric' });
    
    let formattedDueDate = '';
    if (selectedDueDate) {
        const year = selectedDueDate.getFullYear();
        const month = String(selectedDueDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDueDate.getDate()).padStart(2, '0');
        formattedDueDate = `${year}-${month}-${day}`;
    } else {
        formattedDueDate = '';
    }

    
    useEffect(() => {
        const fetchJobIds = async () => {
            try {
                const authToken = localStorage.getItem('authToken');
                const response = await getJobIds(authToken); 
                if (response.res) {
                    setJobList(response.res); 
                    console.log('jobs-',response.res);
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

        const fetchJobUsers = async () => {
            try {
                setLoading(true); 
                const authToken = localStorage.getItem('authToken');
                let response = await getUserByRole(authToken);
                if (response.res) {
                    setUsersList(response.res); 
                    console.log('users-',response.res);
                } else {
                    console.error('Failed to fetch Users:', response.error);
                    setLoading(false); 
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false); 
            }
        };

        fetchTasksToDo();
        fetchTasksCompleted();
        fetchJobUsers();
        fetchJobIds();
    }, [selectionRange.endDate, selectionRange.startDate]);

    console.log('task ToDo ',tasksToDo,'task completed ',tasksCompleted,'start date ',selectionRange.startDate.toISOString().slice(0, 10),'end date ',selectionRange.endDate.toISOString().slice(0, 10));

    const handleNextMonth = () => {
        setSelectionRange(prevState => {
            const nextMonthStartDate = new Date(prevState.startDate);
            const nextMonthEndDate = new Date(prevState.endDate);
            nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() + 1);
            nextMonthEndDate.setMonth(nextMonthEndDate.getMonth() + 1);
            return {
                ...prevState,
                startDate: nextMonthStartDate,
                endDate: nextMonthEndDate
            };
        });
    };

    const handlePrevMonth = () => {
        setSelectionRange(prevState => {
            const nextMonthStartDate = new Date(prevState.startDate);
            const nextMonthEndDate = new Date(prevState.endDate);
            nextMonthStartDate.setMonth(nextMonthStartDate.getMonth() - 1);
            nextMonthEndDate.setMonth(nextMonthEndDate.getMonth() - 1);
            return {
                ...prevState,
                startDate: nextMonthStartDate,
                endDate: nextMonthEndDate
            };
        });
    };

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
        <div className='DashboardHeading d-flex justify-content-start align-items-center position-relative'>
            <div className='datePickerText addNewTaskBtn d-flex align-items-center gap-0 justify-content-end navMenuDiv p-0 bg-transparent shadow-none' style={{marginTop:'40px'}}>
                <div className='selectPrevNextMonthIcon' onClick={handlePrevMonth}>
                    <PrevIcon />
                </div>
                <div onClick={()=>setSelectDate(!selectDate)}>
                    <TaskIcon />
                    {formattedStartDate}-{formattedEndDate}
                </div>
                <div className='selectPrevNextMonthIcon' style={{marginLeft:'7px'}} onClick={handleNextMonth}>
                    <NextIcon />
                </div>
            </div>
            {selectDate && (
                <div className='datePickerDiv' ref={selectDateRef}>
                    <DateRangePicker
                        moveRangeOnFirstSelection={false}
                        editableDateInputs={false}
                        ranges={[selectionRange]}
                        onChange={handleSelect}
                        rangeColors={["#E2E31F"]}
                    />
                </div>
            )}
        </div>

        <div className='DashboardHeading d-flex justify-content-start align-items-center position-relative'>
            <div className='taskTabsDiv'>
                <div className={`taskTab tasksTodo ${taskTab === 'todo' && 'active'}`} onClick={()=>setTaskTab('todo')}>To Do</div>
                <div className={`taskTab tasksCompleted ${taskTab === 'completed' && 'active'}`} onClick={()=>setTaskTab('completed')}>Completed</div>
            </div>
        </div>
        
        {taskTab === 'todo' && (
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
                                    <div className="UserImg m-0" style={{ minWidth: "40px" }} onClick={handleCreateTask}><AddIcon /></div>
                                    <div className='addTaskJobDiv'>
                                        <div className='addTaskJobBtn' 
                                            onClick={()=> {
                                                setAddTaskJobDropdown(true);
                                                setAddTaskJobStageDropdown(false)}}
                                        >+ Job No.{selectedSearchJob && ` (${selectedSearchJob})`}</div>
                                        {addTaskJobDropdown && 
                                            <div className='addTaskJobDropdown' ref={addTaskJobDropdownRef}>
                                                <div className='addTaskJobSearchDiv'>
                                                    <div className='searchBox'>
                                                        <div className='IconBox'><Search /></div>
                                                        <input name='search' placeholder='Search “Job No.” or  “Name”' value={searchJobList} onChange={(e)=>setSearchJobList(e.target.value)}/>
                                                    </div>
                                                    <div className='divider' />
                                                    <button className='colorOutlineBtn' 
                                                        onClick={()=>{
                                                            if(searchJobList ===  ''){
                                                                toast.error('Select a Job Id to search', {
                                                                    position: "top-center",
                                                                    autoClose: 5000,
                                                                    hideProgressBar: true,
                                                                    closeOnClick: true,
                                                                    pauseOnHover: true,
                                                                    draggable: true,
                                                                    progress: undefined,
                                                                    theme: "colored",
                                                                });
                                                            }else{
                                                                fetchJobStages(searchJobList)
                                                            }
                                                        }}>Apply</button>
                                                </div>
                                                <div className='addTaskJobListScroll'>
                                                    <div className='addTaskJobListItems'>
                                                        {jobList && jobList
                                                            .filter(job => searchJobList ? job.id.toString() === searchJobList.toString() : true) 
                                                            .map((job) => (
                                                                <div key={job.id} 
                                                                    className={`addTaskJobListItem ${searchJobList === job.id && 'active'}`} 
                                                                    onClick={() => setSearchJobList(job.id)} >
                                                                    {job.id}
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        }

                                    </div>
                                    <input className='addTaskTitleBtn' value={createTaskTitle} onChange={(e)=>setCreateTaskTitle(e.target.value)} placeholder='Task Title'/>
                                </div>
                            </div>
                            <div className='listContent centerContent'>
                                <div className='centerText addTaskJobDiv '>
                                   <div className={`addTaskJobBtn ${selectedSearchJobStage}`} 
                                    onClick={()=> {
                                        setAddTaskJobDropdown(false);
                                        setAddTaskJobStageDropdown(!addTaskJobStageDropdown)
                                        if(searchJobStages.length <= 0){
                                            toast.error('Select a Job Id first', {
                                                position: "top-center",
                                                autoClose: 5000,
                                                hideProgressBar: true,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: "colored",
                                            });
                                        }
                                    }}
                                        
                                    >{selectedSearchJobStage ? selectedSearchJobStage : '+ Add Stage' }</div>
                                    {addTaskJobStageDropdown && searchJobStages.length > 0 && 
                                        <div className='addTaskJobDropdown' ref={addTaskJobStageDropdownRef}>
                                            <div className='addTaskJobListScroll'>
                                                <div className='addTaskJobListItems'>
                                                    {searchJobStages && searchJobStages.map((stage) => (
                                                        <div key={stage.id} 
                                                            className={`addTaskJobStageItem ${stage.title}`}
                                                            onClick={()=>{
                                                                setSelectedSearchJobStage(stage.title);
                                                                setSelectedSearchJobStageId(stage.id);
                                                                setAddTaskJobStageDropdown(false);
                                                            }} >
                                                            {stage.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className='centerText addTaskJobDiv'>
                                    <div className='addTaskDueDateBtn' onClick={()=>setSelectDueDate(!selectDueDate)}>
                                        <TaskIcon/> {selectedDueDate ? formattedDueDate : 'Due Date' }</div>
                                        {selectDueDate && (
                                            <div className='datePickerDiv' ref={selectDueDateRef}>
                                                <Calendar
                                                    date={selectedDueDate}
                                                    onChange={handleSelectDueDate} 
                                                    value={selectedDueDate} 
                                                    calendarType="ISO 8601" 
                                                    minDate={new Date()} 
                                                    rangeColors={["#E2E31F"]} 
                                                />
                                            </div>
                                        )}
                                    </div>
                            </div>
                            <div className='listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none'>
                                <div className='addTaskJobDiv d-flex align-items-center justify-content-end'>
                                    {selectedUsers.length > 0 ? (<>
                                        {selectedUsers.map((user,index) => (
                                            <>
                                            <div key={index} className={`UserImg addedUserImages ${index}`} 
                                                style={{ minWidth: "40px" ,zIndex: index }}>
                                                <User />
                                            </div>
                                            </>
                                        )) }
                                        <div className="UserImg withAddBtn m-0" 
                                            onClick={()=>setAddTaskJobUserDropdown(!addTaskJobUserDropdown)}
                                            style={{ minWidth: "40px",zIndex: '999' }}>
                                            <User />
                                        </div>
                                    </>
                                    ): 
                                        <div className="UserImg withAddBtn" 
                                            onClick={()=>setAddTaskJobUserDropdown(!addTaskJobUserDropdown)}
                                            style={{ minWidth: "40px" }}>
                                            <User />
                                        </div>
                                    }
                                    {addTaskJobUserDropdown && 
                                        <div className='addTaskJobDropdown right' ref={selectUserRef}>
                                            <div className='addTaskJobListScroll'>
                                                <div className='addTaskJobListItems'>
                                                    {usersList && usersList.map((user) => (
                                                        <div key={user.id} 
                                                            className={`addTaskJobListItem ${selectedUsers.includes(user.id) && 'active' }`}
                                                            onClick={() => handleUserClick(user.id)} >
                                                            {user.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </li>
                    )}
                    {tasksToDo && tasksToDo
                    .map((task) => (
                        <li key={task.id} id={`stage_`+task.id} className={`stage_`+task.stage.title}>
                            <div className={`listContent listTitle `}>
                                <label htmlFor={`select_${task.id}`}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked[task.id] || false} 
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
                                <div className="UserImg withAddBtn" style={{ minWidth: "40px" }}><User /></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        {taskTab === 'completed' && (
            <div className='taskContainer'>
                <ul>
                    {tasksCompleted && tasksCompleted.map((task) => (
                        <li key={task.id} id={`stage_`+task.id} className={`heading completeStage`}>
                            <div className={`listContent listTitle `}>
                                <div className='me-2 revertToDo' onClick={() => handleRevert(`select_${task.id}`)}>
                                    <RedoIcon/>
                                </div>
                                <p>| {task.job_id}|<span>{task.title}</span></p>
                            </div>
                            <div className='listContent centerContent'>
                                <div className={`centerText stageBtn btn_${task.stage.title}`}>{task.stage.title}</div>
                                <div className='centerText'>{task.due_date}</div>
                            </div>
                            <div className='listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none'>
                                <div className="UserImg withAddBtn" style={{ minWidth: "40px" }}><User /></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
    </>)
}

export default TaskPage