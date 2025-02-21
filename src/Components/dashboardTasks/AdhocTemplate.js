import React, { useEffect, useRef, useState } from "react";
import {
  AttachmentIcon,
  CommentIcon,
  CrossIcon,
  EditIcon,
  ModifiedRightArrow,
  RightArrow,
  UploadIcon,
} from "../../assets/svg";
import pngFIle from "../../assets/common/pngFile.svg";

import { adHoc, CollaboratorBorders } from "../../helper";
import EditorComponent from "./Editor";
import { Bars } from "react-loader-spinner";
import { sendEmail } from "../../services/chat_attachment";
import { formatJobNumber } from "../../pages/Jobs";


const AdhocTaskCompletionPopup = React.forwardRef(({ job, handleClose }, ref) => {
  console.log("jobs", job)
  const [showDetails, setShowDetails] = useState(0);
  const [emailDetails, setEmailDetails] = useState(null);
  const [loading, setLoading] = useState(false);
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



  const handleReturn = (e) => {
    handleClose();
    setShowDetails(0);
  };

  const onSave = async ({ subject, htmlContent, attachments, to, cc }) => {
    try {
      setLoading(true);
      const requestBody = {
        subject,
        body: htmlContent ? htmlContent : emailDetails?.content,
        to,
        cc,
        attachments,
      };
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
          ref={ref}
        />
      )}
      {showDetails == 2 && <NotificationSent handleClose={handleClose} ref={ref} />}
      {!showDetails && (
        <div className="task-completion-overlay" ref={ref} onClick={(e) => e.stopPropagation()}>
          <div
            className="task-container adhoc"
            ref={popupRef}
            style={{ width: "100%", maxWidth: "546px", padding: "20px" }}
          >
            <h4>Send Email</h4>
            <p>
              Select which ad-hoc email you would like to send in relation to
              this job.
            </p>

            <div
              className="contentBox Application d-flex align-items-start justify-content-between flex-column h-100"
              style={{ padding: "19px 18px 8px 19px" }}
            >
              <div className="w-100 d-flex gap-2 align-items-start justify-content-between">
                {job?.job_num ? (
                  <div className="textDiv">
                    <span>| {formatJobNumber(job?.job_num)} |</span>
                    <p className="job-title text-start mb-0">{job?.title}</p>
                  </div>
                ) : (
                  "Loading..."
                )}
                <div className="listContent d-flex align-items-center gap-2 justify-content-end navMenuDiv p-0 bg-transparent shadow-none addNewTaskDiv">
                  <div className=" d-flex align-items-center justify-content-end">
                    <div className="collaboratorsBox justify-content-end">
                      <div className=" d-flex align-items-center justify-content-center">
                        {job?.collaborators?.length > 0 && (
                          <>
                            {job?.collaborators
                              ?.slice(0, 3)
                              .map((user, index) => {
                                const initials =  user?.name ?  user?.name
                                  ?.split(" ")
                                  ?.map((part) => part.charAt(0).toUpperCase())
                                  ?.join("") :  user?.split(" ")
                                  ?.map((part) => part.charAt(0).toUpperCase())
                                  ?.join("")

                                return (
                                  <div
                                    key={index}
                                    className={`collaboratorsBoxUser`}
                                    style={{
                                      minWidth: "40px",
                                      zIndex: index,
                                       border: CollaboratorBorders[user.id] || "1px solid rgb(105, 103, 103)",
                                    }}
                                  >
                                    {initials}
                                  </div>
                                );
                              })}

                            {job?.collaborators?.length > 3 && (
                              <div
                                className={`collaboratorsBoxUser`}
                                style={{
                                  minWidth: "40px",
                                  zIndex: job?.collaborators?.length || 4,
                                }}
                              >
                                +{job?.collaborators.length - 3}
                              </div>
                            )}
                          </>
                        )}
                        {job?.collaborators?.length === 0 && (
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
              <div className="d-flex gap-2 align-items-start justify-content-end w-100 commentsBox">
                <div>
                  <AttachmentIcon /> <span>{job?.attachments_count || 0}</span>
                </div>
                <div>
                  <CommentIcon /> <span>{job?.comments_count || 0}</span>
                </div>
              </div>
            </div>
            <div className="email-container">
              <h3>Select Email:</h3>
              <div className="list">
                <div className="innerscroll">
                  {adHoc.map((data, index) => (
                    <div
                      key={index}
                      className="list-row"
                      onClick={() => {
                        setShowDetails(1);
                        setEmailDetails(data);
                      }}
                    >
                      <div className="title">{data?.emailType}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="bottom-text">
              <span onClick={handleReturn}>Return</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
});

export const ExpandedTaskPopup = React.forwardRef(({ emailDetails, onSave, onReturn }, ref) => {
  const { emailType, receiver, content } = emailDetails;
  const [attachments, setAttachments] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");

  const [subject, setSubject] = useState("RE:" + emailType);
  const attachmentRef = useRef(null);
  const popupRef = useRef(null);

  const generateEmailAddresses = (receiver) => {
    const emailMap = {
      Client: "client@yopmail.com",
      Council: "council@yopmail.com",
    };

    const sendToEmail = emailMap[receiver] || emailMap["Client"];
    const ccEmail = sendToEmail.replace("@yopmail.com", "-cc@yopmail.com");

    const initials = receiver
      .split(" ")
      .map((name) => name.charAt(0))
      .join("");

    return {
      sendTo: [
        { name: receiver, email: sendToEmail, initials, selected: true },
      ],
      cc: [
        {
          name: `${receiver} CC`,
          email: ccEmail,
          initials: `${initials}C`,
          selected: true,
        },
      ],
    };
  };

  const { sendTo, cc } = generateEmailAddresses(receiver);
  const [selectedSendTo, setSelectedSendTo] = useState(sendTo);
  const [selectedCC, setSelectedCC] = useState(cc);
  const toggleSelectRecipient = (index, type) => {
    if (type === "sendTo") {
      setSelectedSendTo((prev) => {
        const newSendTo = [...prev];
        newSendTo[index].selected = !newSendTo[index].selected;
        return newSendTo;
      });
    } else if (type === "cc") {
      setSelectedCC((prev) => {
        const newCC = [...prev];
        newCC[index].selected = !newCC[index].selected;
        return newCC;
      });
    }
  };

  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleReturn();
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
    console.log("dropped file " + droppedFile);
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

  useEffect(() => {
    console.log(attachments);
  }, [attachments]);

  const handleSaveEmail = () => {
    const to = selectedSendTo?.map((to) => to.email)
    const cc = selectedCC?.map((cc) => cc.email)
    onSave({ subject, htmlContent, attachments, to, cc });
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
    <div className="task-completion-overlay" ref={ref}>
      <div
        className="task-container "
        style={{ width: "540px" }}
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
                {selectedSendTo?.length > 0 &&
                  selectedSendTo?.map((to, index) => {
                    const isSelected = to?.selected
                    return (
                      <div className="list-row" key={index}>
                        <div
                          className={`checkbox ${isSelected ? 'active' : ''}`}
                          // onClick={() => toggleSelectRecipient(index, "sendTo")}
                        >
                         
                        </div>
                        <div className="initials">{to?.initials}</div>
                        <div className="title">
                          {to?.name} <span>{to?.email}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="send-to">
            <h3>CC:</h3>
            <div className="send-to-email">
              <div className="innerscroll">
                {selectedCC?.length > 0 &&
                  selectedCC?.map((to, index) => {
                    const isSelected = to?.selected
                    return (
                      <div className="list-row" key={index}>
                        
                        <div
                          className={`checkbox ${isSelected ? 'active' : ''}`}
                          // onClick={() => toggleSelectRecipient(index, "cc")}
                        >
                        </div>
                        <div className="initials">{to?.initials}</div>
                        <div className="title">
                          {to?.name} <span>{to?.email}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="save-email"
            onClick={handleSaveEmail}
            style={{ margin: "24px 0 16px 0" }}
          >
            Send Email <ModifiedRightArrow color="#000" />
          </button>
          <p className="bottom-text">
            <span onClick={handleReturn}>Return</span>
          </p>
        </div>
      </div>
    </div>
  );
});

export const NotificationSent = React.forwardRef(({ handleClose }, ref) => {
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
    <div className="task-completion-overlay" ref={ref}>
      <div
        className="task-container"
        ref={popupRef}
        style={{ maxWidth: "546px", width: "100%", padding: "20px" }}
      >
        <h4>Email Notification Sent</h4>
        <p>
          This email has been sent to the selected recipients. Click to return.
        </p>
        <button
          type="button"
          className="save-email"
          onClick={handleClose}
          style={{ margin: "8px 0 0 0 " }}
        >
          Return <RightArrow color="#000" />
        </button>
      </div>
    </div>
  );
});

export default AdhocTaskCompletionPopup;
