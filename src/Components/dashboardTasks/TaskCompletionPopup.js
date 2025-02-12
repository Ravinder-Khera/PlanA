import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CrossIcon,
  EditIcon,
  ModifiedRightArrow,
  RightArrow,
  UploadIcon,
} from "../../assets/svg";
import pngFIle from "../../assets/common/pngFile.svg";
import moment from "moment";
import { getEmailsByStageAndTitle } from "../../helper";
import EditorComponent from "./Editor";
import { Bars } from "react-loader-spinner";
import { sendEmail } from "../../services/chat_attachment";

const TaskCompletionPopup = ({ task, handleClose, handleFinalClose }) => {
  const [showDetails, setShowDetails] = useState(0);
  const [emailDetails, setEmailDetails] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const emailData = useMemo(() => {
    return getEmailsByStageAndTitle(task?.stage?.title, task?.title);
  }, [task?.stage?.title, task?.title]);
  const [requestBody, setRequestBody] = useState({});
  const [emailRead, setEmailRead] = useState(1);
  const [loading, setLoading] = useState(false);
  const trimmedTitle =
    task?.title?.length > 35
      ? task?.title.substring(0, 35) + "..."
      : task?.title;
  const popupRef = useRef(null);

  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (emailData?.length) {
      setEmailRead(new Array(emailData.length).fill(false));
    }
  }, [emailData]);

  // Check if all values in emailRead are true
useEffect(() => {
  if (emailRead.length > 0 && emailRead.every(Boolean)) {
    setEmailSuccess(true);
  } else {
    setEmailSuccess(false);
  }
}, [emailRead]);

  const onSave = ({ subject, htmlContent, attachments }) => {
    setRequestBody({
      subject,
      body: htmlContent ? htmlContent : emailDetails?.content,
      to: ["client@yopmail.com"],
      cc: ["cc-client@yopmail.com"],
      attachments,
    });
    setShowDetails(0);
  };

  const handleSubmitEmail = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      console.log("request body", requestBody);
      formData.append("subject", requestBody?.subject);
      formData.append("body", requestBody?.body);

      requestBody?.to.forEach((to, index) => {
        formData.append(`to[]`, to);
      });
      requestBody?.cc.forEach((cc, index) => {
        formData.append(`cc[]`, cc);
      });
      // Append attachments if available
      if (requestBody?.attachments && requestBody?.attachments?.length > 0) {
        requestBody?.attachments.forEach((file, index) => {
          formData.append(`attachments[]`, file);
        });
      }
      let response = await sendEmail(formData);
      if (response.res) {
        setShowDetails(2);
        setLoading(false);
      } else {
        setLoading(false);
        console.error("send email error:", response.error);
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setLoading(false);
    }
  };

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
      {showDetails == 1 && (
        <ExpandedTaskPopup
          emailDetails={emailDetails}
          onSave={onSave}
          onReturn={() => setShowDetails(0)}
        />
      )}
      {showDetails == 2 && <NotificationSent handleClose={handleFinalClose} />}
      {!showDetails && (
        <div className="task-completion-overlay">
          <div
            className="task-container"
            ref={popupRef}
            style={{
              padding: "20px",
            }}
          >
            <h4>Task Complete</h4>
            <p>
              You have successfully completed this task. Well done! Click to
              manage email notifications.
            </p>
            <div className={`tasksDiv ${task?.stage?.title} `}>
              <div
                className="d-flex align-items-center justify-content-between"
                style={{ gap: "32px" }}
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
                      {task?.users?.length > 0 && (
                        <>
                          {task?.users.slice(0, 3).map((user, index) => {
                            const initials = user?.name
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
                                zIndex: task?.users?.length,
                              }}
                            >
                              +{task?.users.length - 3}
                            </div>
                          )}
                        </>
                      )}
                      {task.users?.length === 0 && (
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
                  {emailData.map((data, index) => (
                    <div
                      key={index}
                      className="list-row"
                      onClick={() => {
                        setEmailRead((prev) => {
                          const updatedRead = [...prev]; // Create a shallow copy
                          updatedRead[index] = true; // Update the specific index
                          return updatedRead;
                        });
                        setShowDetails(1);
                        setEmailDetails(data);
                      }}
                    >
                      <div className="edit-icon">
                        <EditIcon />
                      </div>
                      <div
                        className={`centerText stageBtn btn_${task.stage?.title}`}
                      >
                        {task.stage?.title}
                      </div>
                      <div className="title">{data?.emailType}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {emailSuccess && (
              <button
                type="button"
                className="save-email"
                onClick={handleSubmitEmail}
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
  const { emailType, receiver, content } = emailDetails;
  const [attachments, setAttachments] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");

  const [subject, setSubject] = useState("RE:" + emailType);
  const attachmentRef = useRef(null);
  const popupRef = useRef(null);

  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onReturn();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setAttachments((prevFiles) => [...(prevFiles || []), droppedFile]); // Ensure prevFiles is always an array
    }

    // Reset input value safely
    if (attachmentRef.current) {
      attachmentRef.current.value = "";
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target?.files?.[0]; // Safe optional chaining
    console.log(selectedFile);
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setAttachments((prevFiles) => [...(prevFiles || []), selectedFile]);
    }

    // Reset input value safely
    if (attachmentRef.current) {
      attachmentRef.current.value = "";
    }
  };

  const handleSaveEmail = () => {
    onSave({ subject, htmlContent, attachments });
  };
  const handleReturn = () => {
    onReturn();
  };

  const handleContentChange = (updatedHtml) => {
    setHtmlContent(updatedHtml);
  };

  const handleDeleteAttachment = (index) => {
    setAttachments((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="task-completion-overlay">
      <div
        className="task-container "
        style={{ width: "100%", maxWidth: "546px" }}
        ref={popupRef}
      >
        <h4>{emailType}</h4>
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
            <EditorComponent
              content={content}
              onContentChange={handleContentChange}
            />
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
                        {msg?.name?.length > 3
                          ? `${msg?.name?.slice(0, 3)}...${msg?.name?.slice(
                              -3
                            )}`
                          : msg.name}
                      </h5>
                      <span onClick={() => handleDeleteAttachment(i)}>
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
                    Client <span>client@yopmail.com</span>
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
                    Client <span>client.cc@yopmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="save-email"
            onClick={handleSaveEmail}
            style={{
              margin: "24px 0 16px 0",
            }}
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
  const popupRef = useRef(null);

  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="task-completion-overlay">
      <div
        className="task-container"
        ref={popupRef}
        style={{ padding: "20px", maxWidth: "546px", width: "100%" }}
      >
        <h4>Email Notification Sent</h4>
        <p>
          Your selected recipients have been sent an email notifying them to
          action the next steps
          <br /> in this job. Click to return.
        </p>
        <button
          type="button"
          className="save-email"
          onClick={handleClose}
          style={{
            margin: "8px 0 0px 0",
          }}
        >
          Return <RightArrow color="#000" />
        </button>
      </div>
    </div>
  );
};

export default TaskCompletionPopup;
