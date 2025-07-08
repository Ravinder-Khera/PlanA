import React from "react";
import { ToastCloseIcon, ToastErrorIcon } from "../assets/svg";
import "./toaster.scss"
const ErrorToast = ({ onClose, activeTab}) => {
  return (
      <div className="toast-body">
        <ToastErrorIcon />
        <p>Error: Job Number is already in use. Please enter a unique job number to continue creating a new {activeTab} job.</p>
        <ToastCloseIcon className="cross" onClick={()=>onClose()} />
    </div>
  );
};

export default ErrorToast;
