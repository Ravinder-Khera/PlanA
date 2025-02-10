import React, { useRef, useState } from "react";
import {
  ArrowRight,
  CrossIcon,
  EditIcon,
  ModifiedRightArrow,
  RightArrow,
  UploadIcon,
} from "../../assets/svg";
import pngFIle from "../../assets/common/pngFile.svg";
import moment from "moment";
import { emailConfig } from "../../helper";
import Editor from "./Editor";
import EditorComponent from "./Editor";

const TaskCompletionPopup = ({ task, handleClose }) => {
  
  const [showDetails, setShowDetails] = useState(0);
  const [emailDetails, setEmailDetails] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const emailData = emailConfig[task.stage];
  console.log('emailData', emailData);
  const trimmedTitle =
    task?.title?.length > 35
      ? task?.title.substring(0, 35) + "..."
      : task?.title;

  const onSave = () => {
    setShowDetails(0);
    setEmailSuccess(true);
  };
  return (
    <>
      {showDetails == 1 && (
        <ExpandedTaskPopup emailDetails={emailDetails} onSave={onSave} onReturn={() => setShowDetails(0)} />
      )}
      {showDetails == 2 && <NotificationSent handleClose={handleClose} />}
      {!showDetails && (
        <div className="task-completion-overlay">
          <div className="task-container">
            <h4>Task Complete</h4>
            <p>
              You have successfully completed this task. Well done! Click to
              manage email notifications.
            </p>
            <div className={`tasksDiv ${task.stage} `}>
              <div
                className="d-flex align-items-center justify-content-between"
                style={{ gap: "20px" }}
              >
                <div
                  className="d-flex align-items-center justify-content-between"
                  style={{ gap: "20px" }}
                >
                  <div className={`markTaskComplete active `}></div>
                  <div>
                    <div className="taskHeading">| {task.id} |</div>
                    <div className="taskHeading">{trimmedTitle}</div>
                    <div className="taskDate">
                      <span>Due Date</span>
                      <span>
                        {moment(task.due_date).local().format("DD MMMM, YYYY")}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                    <div className=" d-flex align-items-center collaboratorsBox justify-content-end">
                      {task?.collaborators?.length > 0 && (
                        <>
                          {task?.collaborators
                            .slice(0, 3)
                            .map((user, index) => {
                              const initials = user
                                .split(" ")
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("");

                              return (
                                <div
                                  key={index}
                                  className={`collaboratorsBoxUser`}
                                  style={{
                                    minWidth: "40px",
                                    zIndex: index,
                                  }}
                                >
                                  {initials}
                                </div>
                              );
                            })}

                          {task?.collaborators?.length > 3 && (
                            <div
                              className={`collaboratorsBoxUser`}
                              style={{
                                minWidth: "40px",
                                zIndex: 1,
                              }}
                            >
                              +{task?.collaborators.length - 3}
                            </div>
                          )}
                        </>
                      )}
                      {task.collaborators?.length === 0 && (
                        <div
                          className="collaboratorsBoxUser disabled m-0"
                          style={{ minWidth: "40px" }}
                        >
                          N/A
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="email-container">
              <h3>Customise Email Notifications:</h3>
              <div className="list">
                <div className="innerscroll">
                {Object.entries(emailData).map(([category, emails], index) => (
                  <div
                    className="list-row"
                    onClick={() => {
                      setShowDetails(true);
                      setEmailDetails({
                        category,
                        emails,
                      });
                    }}
                  >
                    <div className="edit-icon">
                      <EditIcon />
                    </div>
                    <div className={`centerText stageBtn btn_${task.stage}`}>
                      {task.stage}
                    </div>
                    <div className="title">
                      {category}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>
            {emailSuccess && (
              <button
                type="button"
                className="save-email"
                onClick={() => {
                  setShowDetails(2);
                }}
              >
                Submit & Notify <ModifiedRightArrow color="#000" />
              </button>
            )}
            <p className="bottom-text">
              Not ready to submit? <span onClick={handleClose}>Return</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export const ExpandedTaskPopup = ({ emailDetails, onSave, onReturn }) => {
  const { category, emails} = emailDetails;
  const [attachments, setAttachments] = useState([]);
  const [subject, setSubject] = useState("RE:"+category)
  const attachmentRef = useRef(null);
  const handleDragOver = () => {};
  const handleDrop = (e) => {
    e.preventDefault();
    setAttachments([...attachments, ...e.dataTransfer.files]);
  };
  const handleFileUpload = (e) => {};
  const handleDeleteAttachment = () => {};
  const handleSaveEmail = () => {
    onSave();
  };
  const handleReturn = () => {
    onReturn();
  };
  return (
    <div className="task-completion-overlay">
      <div className="task-container " style={{ width: "540px" }}>
        <h4>{category}</h4>
        <p>Customise this email message and the recipients.</p>
        <div className="scrollable-content">
          <div className="email-subject">
            <h3>Email Subject:</h3>
            <input
              type="text"
              placeholder="Subject"
              className="subject-input"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
              }}
            />
          </div>
          <div className="email-details">
            <h3>Customise Email Message:</h3>
              <EditorComponent content={emails.content}/>
            {/* <textarea
              rows="5"
              cols="30"
              placeholder="Email Content"
              value={`Information Request Client Council  

 

Hi xxxx

 

Further to the receipt of Council’s information request on xxxx, under Part 3 Section 13 of the DA Rules, please find attached our formal response to Council’s Information Request for xxxx.

 

            The attached documents include the following:`}
            ></textarea> */}
          </div>
          <div className="email-addJobPopUpAttachments">
            <h3>Attachments</h3>
            <div
              className="attachmentsBox"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div
                className={`delete-box ${
                  attachments?.length == 0 && "no-attachments"
                }`}
                style={{
                  cursor: "pointer",
                  zIndex: 2,
                  minWidth: "max-content",
                }}
                onClick={() => {
                  if (attachmentRef.current) {
                    attachmentRef.current.click();
                  }
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  ref={attachmentRef}
                  className="d-none"
                  onChange={handleFileUpload}
                />
                <div className="deletBg" style={{ padding: "6px" }}>
                  <UploadIcon />
                </div>
                <div className="delete-item">Upload Attachment</div>
              </div>
              <div className="uploadedAttachments">
                {attachments?.length > 0 &&
                  attachments?.map((msg, i) => (
                    <div key={i} className="attachments">
                      <div className="imgBox">
                        <img src={pngFIle} className="" alt="" />
                      </div>
                      <h5>
                        {msg.original_name.length > 3
                          ? `${msg.original_name.slice(0, 3)}...`
                          : msg.original_name}
                      </h5>
                      <span onClick={() => handleDeleteAttachment(msg.id)}>
                        <CrossIcon />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="send-to">
            <h3>Send To:</h3>
            <div className="send-to-email">
              <div className="innerscroll">
                <div className="list-row">
                  <div className="checkbox active"></div>
                  <div className="initials">WA</div>
                  <div className="title">
                    Client <span>client.surname@clientcompany.com.au</span>
                  </div>
                </div>
                <div className="list-row">
                  <div className="checkbox "></div>
                  <div className="initials">WA</div>
                  <div className="title">
                    Client <span>client.surname@clientcompany.com.au</span>
                  </div>
                </div>
                <div className="list-row">
                  <div className="checkbox "></div>
                  <div className="initials">WA</div>
                  <div className="title">
                    Client <span>client.surname@clientcompany.com.au</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="send-to">
            <h3>CC:</h3>
            <div className="send-to-email">
              <div className="innerscroll">
                <div className="list-row">
                  <div className="checkbox active"></div>
                  <div className="initials">WA</div>
                  <div className="title">
                    Client <span>client.surname@clientcompany.com.au</span>
                  </div>
                </div>
                <div className="list-row">
                  <div className="checkbox "></div>
                  <div className="initials">WA</div>
                  <div className="title">
                    Client <span>client.surname@clientcompany.com.au</span>
                  </div>
                </div>
                <div className="list-row">
                  <div className="checkbox "></div>
                  <div className="initials">WA</div>
                  <div className="title">
                    Client <span>client.surname@clientcompany.com.au</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="save-email"
            onClick={handleSaveEmail}
          >
            Save Email <RightArrow color="#000" />
          </button>
          <p className="bottom-text">
            Not ready to submit? <span onClick={handleReturn}>Return</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const NotificationSent = ({ handleClose }) => {
  return (
    <div className="task-completion-overlay">
      <div className="task-container">
        <h4>Email Notification Sent</h4>
        <p>
          Your selected recipients have been sent an email notifying them to
          action the next steps in this job. Click to return.
        </p>
        <button type="button" className="save-email" onClick={handleClose}>
          Return <RightArrow color="#000" />
        </button>
      </div>
    </div>
  );
};

export default TaskCompletionPopup;
