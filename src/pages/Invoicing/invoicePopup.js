import React, { useEffect, useRef, useState } from "react";
import { TaskIcon, User } from "../../assets/svg";
import { Bars } from "react-loader-spinner";
import { Calendar } from "react-date-range";
import { createInvoice } from "../../services/auth";
import { toast } from "react-toastify";

const InvoicePopup = ({ handleClose }) => {
  const [state, setState] = useState([]);
  
  const [items, setItems] = useState([]);
  const [user, setUser] = useState({
    name: '',
    email: ''
  });
  const [itemState, setItemState] = useState({
    description: '',
    rate: null,
    hours: null,
    amount: null
  });
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [selectDueDate, setSelectDueDate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dropDownStatus, setDropDownStatus] = useState(false);
  const [selectUser, setSelectUser] = useState(false);
  const [loader, setLoading] = useState(false);

  const popUpRef = useRef(null);
  const billingToRef = useRef(null);
  const payToRef = useRef(null);
  const selectDueDateRef = useRef(null);
  const selectStatusRef = useRef(null);

  useEffect(() => {
    let handler = (e) => {
      if (
        popUpRef.current &&
        !popUpRef.current.contains(e.target)
      ) {
        handleClose()
      }
      if (
        selectStatusRef.current &&
        !selectStatusRef.current.contains(e.target)
      ) {
        setDropDownStatus(false)
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setItemState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      description: itemState.description,
      rate: itemState.rate,
      hours: itemState.hours,
      amount: itemState.rate*itemState.hours
    };
  
    // Check if any field is empty in the newItem object
    const hasEmptyValue = Object.values(newItem).some(value => value === '' || value === null);
  
    // If any field is empty, show an error toast and return early
    if (hasEmptyValue) {
      toast.error(`All values must be filled`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
  
    // If all fields are filled, add the new item to the items array
    setItems(prevItems => [...prevItems, newItem]);
    setItemState({
      description: '',
      rate: null,
      hours: null,
      amount: null
    });
  };
  

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUser = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }))
    
  };

  const validateUser = () => {
    if(validateEmail(user.email)){
      if (validateName(user.name)){
        setSelectUser(false)
      }else{
        toast.error(`Name can not contain number or special characters`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
    }}else{
      toast.error(`Enter A valid email`, {
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
  };

  const validateEmail = (email) => {
    // Email should not be empty and should match a valid email format
    return email.trim() !== '' && /^\S+@\S+\.\S+$/.test(email);
  };

  const validateName = (name) => {
    // Name should not be empty and should contain only letters and spaces
    return /^[a-zA-Z\s]+$/.test(name.trim());
  };

  const handleSelectDueDate = (date) => {
    setSelectDueDate(false);
    setSelectedDueDate(date);
  };

  let formattedDueDate = "";
  if (selectedDueDate) {
    const year = selectedDueDate.getFullYear();
    const month = String(selectedDueDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDueDate.getDate()).padStart(2, "0");
    formattedDueDate = `${year}-${month}-${day}`;
  } else {
    formattedDueDate = "";
  }

  const handleCreateInvoice = async () => {
    if (!state.to || state.to === "") {
      toast.error(`Billed To can not be empty`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (!state.from || state.from === '') {
      toast.error(`Pay To can not be empty`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (formattedDueDate === '') {
      toast.error(`Due Date can not be empty`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (items.length === 0) {
      toast.error(`Items can not be empty`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    } else if (!user.name || !user.email){
      toast.error(`Add User details`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setSelectUser(true);
      return;
    }
    try {
      setLoading(true);
      let response = await createInvoice(
        {
          to: state.to,
          from: state.from+' '+state.fromAddress,
          due_date: formattedDueDate,
          bank_name: state.bank_name,
          account_name: state.account_name,
          bsb: state.bsb,
          status: selectedStatus,
          account_number: state.account_number,
          items: items,
          contact: {
            name: user.name,
            email: user.email,
          }
        }
      );
      console.log("create Invoice --", response);
      if (response.res) {
        console.log("create Task successful", response);
        toast.success(response.message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        handleClose()
      } else {
        console.error("Invoice creation failed:", response.error);

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
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (str) => {
    const words = str.split(' ');
    const initials = words.map((word) => word.charAt(0)).join('').slice(0, 2);
    return initials;
  };

  return (
    <>
      {loader && (
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
      <div className="loaderDiv3 loaderDiv2">
        <div className="pop-wrapper">
          <div className="wrapper">
            <div className="container pop-container" ref={popUpRef} style={{maxWidth:'929px'}}>
              <div className="popup-content">
                <div className="popup-section-left">
                  <div
                    className="top-section"
                    style={{ position: "sticky", top: "0", zIndex: "2" }}
                  >
                    <div className="topsection-left invoice">
                      <div className="top-left-content align-items-center" style={{height:'auto'}}>
                        <div
                          onClick={handleClose}
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src="/assets/Frame 60.png"
                            alt=""
                            className="back-icon mt-0"
                          />
                        </div>
                        <div className="position w-100">
                          <div className="d-flex justify-content-between align-items-center gap-2">
                            <div className="title">
                              <div className="d-flex flex-column">
                                  <h1 >
                                    Invoice
                                  </h1>
                              </div>
                            </div>
                            <div className="d-flex gap-4">
                              <button
                                className={`stageBtn paid`}
                                style={{ cursor: "pointer" }}
                                onClick={handleCreateInvoice}
                              >
                                {'Save'}
                              </button>
                              <div className=" listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                <div className="addTaskJobDiv">
                                    <button
                                    className={`stageBtn ${selectedStatus}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setDropDownStatus(true);
                                    }}
                                  >
                                    {selectedStatus ? selectedStatus : 'Select'}
                                  </button>
                                  {dropDownStatus && 
                                    <div className="addTaskJobDropdown right" ref={selectStatusRef}>
                                      <div className="addInvoiceCContactDetails">
                                      <button
                                        className={`stageBtn paid`}
                                        style={{ cursor: "pointer" }}
                                        onClick={()=>setSelectedStatus('paid')}
                                      >
                                        Paid
                                      </button>
                                      <button
                                        className={`stageBtn unpaid m-2`}
                                        style={{ cursor: "pointer" }}
                                        onClick={()=>setSelectedStatus('unpaid')}
                                      >
                                        Unpaid
                                      </button>
                                      </div>
                                    </div>
                                  }
                                </div>
                              </div>
                              <div className=" listContent d-flex align-items-center gap-2 justify-content-center navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                                <div className="addTaskJobDiv">
                                  <div
                                    className="UserImg withAddBtn "
                                    onClick={() => {
                                      setSelectUser(true);
                                    }}
                                    style={{ minWidth: "40px" }}
                                  > 
                                    <div className="userName">
                                       {!user.name ? <User /> : getInitials(user.name)}
                                    </div>
                                  </div>
                                  {selectUser && 
                                    <div className="addTaskJobDropdown right">
                                      <div className="addInvoiceCContactDetails">
                                        <div className="userDetails">
                                          <div className="userProfile">
                                          {!user.name ? 'UN' : getInitials(user.name)}
                                          </div>
                                          <div className="userName">
                                            <h4>{!user.name ? 'User Name' : user.name}</h4>
                                            <span> {!user.email ? '[Empty Email]' : user.email}</span>
                                          </div>
                                        </div>
                                        <div className="userInput">
                                          <input
                                            onChange={handleUser}
                                            className="userInput"
                                            type="text"
                                            name="name"
                                            value={user.name}
                                            id="contactName"
                                            placeholder="Name"
                                          />
                                          <input
                                            onChange={handleUser}
                                            className="userInput"
                                            type="text"
                                            name="email"
                                            value={user.email}
                                            id="contactEmail"
                                            placeholder="Email"
                                          />
                                        </div>
                                        <div className="userSave">
                                          <button onClick={validateUser}>Save</button>
                                        </div>
                                      </div>
                                    </div>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                        <div className="progress-bar-container">
                        </div>
                  </div>
                  <div className="top-right-content ">
                    <div className="dueDateDiv addNewTaskDiv">
                      <div className="centerText  addTaskJobDiv">
                        <div
                          className="addTaskDueDateBtn"
                          onClick={() => setSelectDueDate(!selectDueDate)}
                        >
                          <TaskIcon /><span className="requiredSpan">*</span> {selectedDueDate ? formattedDueDate : 'Due Date'}
                        </div>
                        {selectDueDate && (
                          <div className="datePickerDiv" style={{right:'0',left:'auto'}} ref={selectDueDateRef}>
                            <Calendar
                              date={selectedDueDate}
                              onChange={handleSelectDueDate}
                              value={selectedDueDate}
                              calendarType="ISO 8601"
                              // minDate={new Date()}
                              rangeColors={["#E2E31F"]}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="billingDetails">
                      <div className="billingInfo">
                        <h3 className="BoldHeading heading">Billed To:<span className="requiredSpan">*</span></h3>
                        <input
                          onChange={handleOnChange}
                          className="addInput"
                          type="text"
                          name="to"
                          value={state.to}
                          id=""
                          ref={billingToRef}
                          placeholder="Add Name Here.."
                        />
                        <span>
                          <img
                            className="penImage"
                            src="/assets/pan.png"
                            alt=""
                            onClick={()=> billingToRef.current.focus()}
                          />
                        </span>
                      </div>
                      <div className="billingInfo">
                        <h3 className="BoldHeading heading">Pay To:<span className="requiredSpan">*</span></h3>
                        <input
                          onChange={handleOnChange}
                          className="addInput"
                          type="text"
                          name="from"
                          value={state.from}
                          ref={payToRef}
                          id=""
                          placeholder="Add Name Here.."
                        />
                        <span>
                          <img
                            className="penImage"
                            src="/assets/pan.png"
                            alt=""
                            onClick={()=> payToRef.current.focus()}
                          />
                        </span>
                      </div>
                      <div className="billingInfo">
                        <h3 className="BoldHeading heading"> </h3>
                        <textarea 
                          onChange={handleOnChange}
                          className="addInput"
                          type="text"
                          name="fromAddress"
                          value={state.fromAddress}
                          rows={2}
                          id=""
                          placeholder="Add Address Here.."
                        />
                      </div>

                      <div className="billingInfo">
                        <h3 className="heading">Bank:</h3>
                        <input
                          onChange={handleOnChange}
                          className="addInput"
                          type="text"
                          name="bank_name"
                          value={state.bank_name}
                          id=""
                          placeholder="Bank Name"
                        />
                      </div>

                      <div className="billingInfo">
                        <h3 className=" heading">Account Name:</h3>
                        <input
                          onChange={handleOnChange}
                          className="addInput"
                          type="text"
                          name="account_name"
                          value={state.account_name}
                          id=""
                          placeholder="Account Name"
                        />
                      </div>
                      <div className="billingInfo">
                        <h3 className=" heading">BSB:</h3>
                        <input
                          onChange={handleOnChange}
                          className="addInput"
                          type="text"
                          name="bsb"
                          value={state.bsb}
                          id=""
                          placeholder="0000-000"
                        />
                      </div>
                      <div className="billingInfo">
                        <h3 className=" heading">Account Number:</h3>
                        <input
                          onChange={handleOnChange}
                          className="addInput"
                          type="text"
                          name="account_number"
                          value={state.account_number}
                          id=""
                          placeholder="0000 0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="table-section position-relative " style={{zIndex:'0'}}>
                    <div className="table-main-section mt-4">
                      <ul className="invoiceItemUl ">
                        <li className="addItemInput itemHeading gap-0">
                          <div className="itemData">
                            <p>Description <span> (minimum 1 required)</span><span className="requiredSpan">*</span></p>
                          </div>
                          <div className="itemData">
                            <p>Rate</p>
                          </div>
                          <div className="itemData">
                            <p>Hours</p>
                          </div>
                          <div className="itemData">
                            <p>Amount</p>
                          </div>
                        </li>
                          {items.length > 0 &&
                            items.map((item, index) => (
                              <li key={index} className="addItemInput itemInput gap-0">
                                <div className="itemData">
                                  <p>{item['description']}</p>
                                </div>
                                <div className="itemData">
                                  <p>${item['rate']}/hr</p>
                                </div>
                                <div className="itemData">
                                  <p>{item['hours']}</p>
                                </div>
                                <div className="itemData">
                                  <p>{item['amount']}</p>
                                </div>
                              </li>
                          ))}
                        <li className="addItemInput gap-0">
                          <input
                            onChange={handleItemChange}
                            className="addInput"
                            type="text"
                            name="description"
                            value={itemState['description'] || ''}
                            id=""
                            placeholder="Add description here ..."
                          />
                          <input
                            onChange={handleItemChange}
                            className="addInput"
                            type="number"
                            name="rate"
                            value={itemState['rate'] || ''}
                            id=""
                            placeholder="$0/hr"
                          />
                          <input
                            onChange={handleItemChange}
                            className="addInput"
                            type="number"
                            name="hours"
                            value={itemState['hours'] || ''}
                            id=""
                            placeholder="0"
                          />
                          <input
                            onChange={handleItemChange}
                            className="addInput"
                            type="number"
                            readOnly
                            name="amount"
                            value={itemState['rate']* itemState['hours'] || ''}
                            id=""
                            placeholder="0.00"
                          />
                           <button onClick={handleAddItem}>
                            <svg xmlns="http://www.w3.org/2000/svg"  width="25" height="25" viewBox="0 0 15 15">
                                <rect width="100%" height="100%" fill="none" />
                                <path fill="none" stroke="inherit" d="M4 7.5L7 10l4-5" />
                              </svg>
                           </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePopup;