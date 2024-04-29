import React, { useRef, useEffect, useState } from "react";
import refresh from "../../../assets/icons/refreshImg.svg";
import profileChat from "../../../assets/common/Frame 34.png";
import deleteImg from "../../../assets/common/delete.svg";
import attachmentsIcon from "../../../assets/common/attachments.svg";
import cut from "../../../assets/common/cut.svg";
import pngFIle from "../../../assets/common/pngFile.svg";
import svgFile from "../../../assets/common/svg.svg";
import message from "../../../assets/icons/message.svg";
import file from "../../../assets/icons/file.svg";
import edit from "../../../assets/icons/edit.svg";
import download from "../../../assets/icons/download.svg";
import { toast } from "react-toastify";
import {
  addAttachments,
  deleteAttachments,
  getAttachments,
  getMessages,
  sendMessage,
} from "../../../services/chat_attachment";
import moment from "moment";
import { ColorRing } from "react-loader-spinner";
import Pusher from "pusher-js";
import eventEmitter from "../../../Event";
import { getProfile } from "../../../services/auth";

const ChatAndAttachment = ({ JobId }) => {
  const maxLength = 10;
  const [currentTab, setCurrentTab] = useState("chats");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState(null);
  const [body, setBody] = useState("");
  const attachmentRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [newMsg, setNewMsg] = useState({
    type: "",
    data: "",
  });
  const chatScroll = useRef()
  const [userDetails, setUserDetails] = useState();

  const fetchProfileData = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      let response = await getProfile(authToken);
      if (response.res) {
        console.log(response.res.user);
        setUserDetails(response.res.user);
      } else {
        console.error("profile error:", response.error);
      }
    } catch (error) {
      console.error("There was an error:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (chatScroll.current) {
      chatScroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_CLUSTER,
      encrypted: true,
    });
    const id = localStorage.getItem("jobId") || "x";

    const channel = pusher.subscribe(`job.${id}`);
    channel.bind("message.created", (data) => {
      const { message } = data;
      console.log("message", message, chats);
      if (message) {
        const tempChats = chats;
        console.log("tempChats before push", tempChats);
        tempChats?.push(message);
        console.log("tempChats after push", tempChats);
        setChats(tempChats);
      }
    });

    return () => {
      pusher.unsubscribe(`job.${id}`);
    };
  }, [chats]);

  eventEmitter.removeAllListeners("newMessage");
  eventEmitter.on("newMessage", (data) => {
    const tempChats = data;
    console.log("tempChats before push", tempChats);
    tempChats?.push(message);
    console.log("tempChats after push", tempChats);
    setChats(tempChats);
  });

  const fetchChats = async () => {
    try {
      setLoading(true);
      console.log("chats", chats);
      const response1 = await getMessages(JobId);
      const response2 = await getAttachments(JobId);
      // Combine both arrays
      if (!response1.error && !response2.error) {
        const combinedArray = [...response1.res, ...response2.res];
        const sortedMessages = combinedArray.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA - dateB;
        });

        const sortedAttachhment = response2.res?.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateA - dateB;
        });
        setChats(sortedMessages);
        setAttachments(sortedAttachhment);
      } else {
        setChats([]);
      }
    } catch (error) {
      setChats([]);
      console.log("error in fetching messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!body || body?.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }
    try {
      setLoading(true);
      const response = await sendMessage(JobId, { body });
      if (!response.error) {
        fetchChats();
        setBody("");
      }
    } catch (error) {
      console.log("error in sending messages", error);
    } finally {
      setLoading(false);
      if (chatScroll.current) {
        chatScroll.current.scrollIntoView({ behavior: "smooth" });
      }
      setNewMsg({
        type: "",
        data: "",
      });
    }
  };

  const handleFileUpload = (e) => {
    if (!e.target.files) return;
    const selectedFile = e.target?.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setNewMsg({
        type: "attachment",
        data: selectedFile,
      });
      handleImageUpload(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setNewMsg({
        type: "attachment",
        data: droppedFile,
      });
      handleImageUpload(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleImageUpload = async (file) => {
    console.log("file", file);
    const reader = new FileReader();
    reader.onload = async () => {
      const formData = new FormData();
      formData.append("attachment", file);
      try {
        setLoading(true);
        let response = await addAttachments(formData, JobId);
        console.log("response 123--->", response);
        if (response.res) {
          toast.success(response.res?.message);
          fetchChats();
        } else {
          toast.error(`${response.error}`);
        }
      } catch (error) {
        console.error("There was an error:", error);
        toast.error("An error occurred while uploading the attachment");
      } finally {
        setLoading(false);
        setNewMsg({
          type: "",
          data: "",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadFile = (fileUrl, docName) => {
    const link = document.createElement("a");
    link.href = `${process.env.REACT_APP_USER_API_CLOUD_ATTACHMENT_PATH}/${fileUrl}`;
    link.download = docName;
    link.target = "_blank";
    link.click();
  };

  const handleDeleteAttachment = async (id) => {
    try {
      setLoading(true);
      const response = await deleteAttachments(id);
      if (!response.error) {
        toast.success(response.res?.message);
        fetchChats();
      }
    } catch (error) {
      console.log("error in sending messages", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chats-section">
        <ul className="nav nav-pills mb-3 gap-2" id="pills-tab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="pills-home-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-home"
              type="button"
              role="tab"
              aria-controls="pills-home"
              aria-selected="true"
              onClick={() => setCurrentTab("chats")}
            >
              Chat
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="pills-profile-tab"
              data-bs-toggle="pill"
              data-bs-target="#pills-profile"
              type="button"
              role="tab"
              aria-controls="pills-profile"
              aria-selected="false"
              onClick={() => setCurrentTab("attachment")}
            >
              Attachments
            </button>
          </li>
        </ul>
        <div className="tab-content w-100" id="pills-tabContent">
          <div
            className="tab-pane fade show active"
            id="pills-home"
            role="tabpanel"
            aria-labelledby="pills-home-tab"
          >
            <div className="mt-3"></div>
            {chats &&
              chats?.length > 0 &&
              chats?.map((msg) => (
                <>
                  {msg.body && (
                    <>
                      {msg.user.name !== localStorage.getItem("user") && (
                        <div className="chats-content-reciever ">
                          <div className="d-flex justify-content-between gap-3 align-items-center">
                            <div className="reciver-chats">
                              <div
                                className="position-absolute"
                                style={{ top: "-10px", left: "16px" }}
                              >
                                <p className="text-name p-0 ">
                                  {msg.user.name}
                                </p>
                              </div>
                              <div
                                className="position-absolute receiverImg "
                              >
                                {msg.user?.profile_pic !== "" ? (
                                  <img
                                    alt={msg.user.name}
                                    src={
                                      process.env
                                        .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                      msg.user.profile_pic
                                    }
                                    className="profileImg"
                                    onError={(e) =>
                                      (e.target.src = `${profileChat}`)
                                    }
                                  />
                                ) : (
                                  <img
                                    src={profileChat}
                                    alt=""
                                    className="profileImg"
                                  />
                                )}
                              </div>
                              <p>{msg.body}</p>
                            </div>

                            <div className="msg-timing">
                              <p>sent</p>
                              <p>{moment(msg.created_at).format("h:mm a")}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.user.name === localStorage.getItem("user") && (
                        <div className="chats-content-sender ">
                          <div className="d-flex justify-content-between gap-3 align-items-center">
                            <div className="msg-timing">
                              <p>sent</p>
                              <p>{moment(msg.created_at).format("h:mm a")}</p>
                            </div>

                            <div className="reciver-chats">
                              <div
                                className="position-absolute"
                                style={{ top: "-10px", right: "16px" }}
                              >
                                <p className="text-name p-0 ">You</p>
                              </div>
                              <div
                                className="position-absolute receiverImg"
                              >
                                {msg.user?.profile_pic !== "" ? (
                                  <img
                                    alt={msg.user.name}
                                    src={
                                      process.env
                                        .REACT_APP_USER_API_CLOUD_IMG_PATH +
                                      msg.user.profile_pic
                                    }
                                    className="profileImg"
                                    onError={(e) =>
                                      (e.target.src = `${profileChat}`)
                                    }
                                  />
                                ) : (
                                  <img
                                    src={profileChat}
                                    alt=""
                                    className="profileImg"
                                  />
                                )}
                              </div>
                              <p className="text-right">{msg.body}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {!msg.body && (
                    <>
                      {msg.user.name !== localStorage.getItem("user") && (
                        <div className="sender-attachments w-100 my-3">
                          <div className="d-flex gap-2 justify-content-start ">
                            <img src={attachmentsIcon} className="" alt="" /> 1
                          </div>

                          <div className="reciever d-flex flex-wrap justify-content-start gap-3  mt-3 ">
                            <div>
                              <div className="attachments-box d-flex justify-content-center flex-column align-items-center">
                                {/* <div
                                  className="d-flex pt-3 px-3 justify-content-end w-100 cursor"
                                  onClick={() => handleDeleteAttachment(msg.id)}
                                >
                                  <img src={cut} alt="" className="cut" />
                                </div> */}
                                <div className="file-apload">
                                  <img src={pngFIle} className="" alt="" />
                                </div>
                                <h1>
                                  {msg.original_name?.length > maxLength
                                    ? `${msg.original_name.slice(
                                        0,
                                        maxLength
                                      )}...`
                                    : msg.original_name}
                                </h1>
                              </div>
                              <div
                                className="d-flex justify-content-center gap-3 mt-3 mb-2 cursor"
                                onClick={() =>
                                  handleDownloadFile(
                                    msg.filename,
                                    msg.original_name
                                  )
                                }
                              >
                                <img src={download} alt="" className="" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.user.name === localStorage.getItem("user") && (
                        <div className="sender-attachments w-100 my-3">
                          <div className="d-flex gap-2 justify-content-end ">
                            {/* <img src={deleteImg} className="" alt="" /> */}
                            <img src={attachmentsIcon} className="" alt="" /> 1
                          </div>
                          <div className="sender d-flex flex-wrap justify-content-end gap-3  mt-3 ">
                            <div>
                              <div className="attachments-box d-flex  flex-column align-items-center">
                                <div
                                  className="d-flex pt-3 px-3 justify-content-end w-100 cursor"
                                  onClick={() => handleDeleteAttachment(msg.id)}
                                >
                                  <img src={cut} alt="" className="cut" />
                                </div>
                                <div className="file-apload">
                                  <img src={pngFIle} className="" alt="" />
                                </div>
                                <h1>
                                  {msg.original_name?.length > maxLength
                                    ? `${msg.original_name.slice(
                                        0,
                                        maxLength
                                      )}...`
                                    : msg.original_name}
                                </h1>
                              </div>
                              <div
                                className="d-flex justify-content-center gap-3 mt-3 mb-2 cursor"
                                onClick={() =>
                                  handleDownloadFile(
                                    msg.filename,
                                    msg.original_name
                                  )
                                }
                              >
                                {/* <img src={edit} alt="" className="" /> */}
                                <img src={download} alt="" className="" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ))}
            {loading && newMsg.type === "msg" && (
              <div className="chats-content-sender my-3" ref={chatScroll}>
                <div className="d-flex justify-content-between gap-3 align-items-center">
                  <div className="msg-timing">
                    <p>sending</p>
                  </div>

                  <div className="reciver-chats">
                    <div
                      className="position-absolute"
                      style={{ top: "-10px", right: "16px" }}
                    >
                      <p className="text-name p-0 ">You</p>
                    </div>
                    <div
                      className="position-absolute"
                      style={{ top: "31px", left: "-14px" }}
                    >
                      {userDetails?.profile_pic !== "" ? (
                        <img
                          alt={userDetails.name}
                          src={
                            process.env.REACT_APP_USER_API_CLOUD_IMG_PATH +
                            userDetails.profile_pic
                          }
                          className="profileImg"
                          onError={(e) => (e.target.src = `${profileChat}`)}
                        />
                      ) : (
                        <img src={profileChat} alt="" className="profileImg" />
                      )}
                    </div>
                    <p className="text-right">{newMsg.data}</p>
                  </div>
                </div>
              </div>
            )}
            {loading && newMsg.type === "attachment" && (
              <div className="sender-attachments w-100 my-3">
                <div className="d-flex gap-2 justify-content-end ">
                  <img src={attachmentsIcon} className="" alt="" /> 1
                </div>
                <div className="sender d-flex flex-wrap justify-content-end gap-3  mt-3 ">
                  <div>
                    <div className="attachments-box d-flex  flex-column align-items-center">
                      <div className="d-flex pt-3 px-3 justify-content-end w-100 cursor">
                        <img src={cut} alt="" className="cut" />
                      </div>
                      <div className="file-apload">
                        <img src={pngFIle} className="" alt="" />
                      </div>
                      <h1>
                        {newMsg.data?.name?.length > maxLength
                          ? `${newMsg.data?.name?.slice(0, maxLength)}...`
                          : newMsg.data?.name}{" "}
                        sending
                      </h1>
                    </div>
                    <div className="d-flex justify-content-center gap-3 mt-3 mb-2 cursor">
                      <img src={download} alt="" className="" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!chats && <p className="loading">Loading Messages...</p>}
            {chats?.length === 0 && <p className="no-chats">No Messages yet</p>}
          </div>
          <div
            className="tab-pane fade"
            id="pills-profile"
            role="tabpanel"
            aria-labelledby="pills-profile-tab"
          >
            <div className="sender-attachments">
              <div className="sender d-flex flex-wrap justify-content-start gap-3  mt-3">
                {attachments?.length > 0 &&
                  attachments?.map((msg,i) => (
                    <div key={i}>
                      <div
                        className={`attachments-box d-flex  flex-column align-items-center ${
                          msg.user.name !== localStorage.getItem("user")
                            ? "justify-content-center"
                            : ""
                        }`}
                      >
                        {msg.user.name === localStorage.getItem("user") && (
                          <div
                            className="d-flex pt-3 px-3 justify-content-end w-100 cursor"
                            onClick={() => handleDeleteAttachment(msg.id)}
                          >
                            <img src={cut} alt="" className="cut" />
                          </div>
                        )}

                        <div className="file-apload">
                          <img src={pngFIle} className="" alt="" />
                        </div>
                        <h1>
                          {msg.original_name.length > maxLength
                            ? `${msg.original_name.slice(0, maxLength)}...`
                            : msg.original_name}
                        </h1>
                      </div>
                      <div
                        className="d-flex justify-content-center gap-3 mt-3 mb-2 cursor"
                        onClick={() =>
                          handleDownloadFile(msg.filename, msg.original_name)
                        }
                      >
                        {/* <img src={edit} alt="" className="" /> */}
                        <img src={download} alt="" className="" />
                      </div>
                    </div>
                  ))}
              </div>
              <div className="text-center">
                {attachments?.length === 0 && (
                  <p className="no-chats">No Attachments Found</p>
                )}
              </div>
            </div>
          </div>
        </div>
        {currentTab === "chats" && (
          <>
            <div
              className="bottom-line"
              style={{ height: "1px", width: "88%", background: "#E2E31F" }}
            ></div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleFileUpload}
              className="imgUploadArea w-100"
            >
              <div
                className="w-100"
                style={{ padding: "0px 29px", marginTop: "27px" }}
              >
                <div className="chat-buttons">
                  <form onSubmit={handleSendMessage} className="w-100">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      onChange={(e) => {
                        setBody(e.target.value);
                        setNewMsg({
                          type: "msg",
                          data: e.target.value,
                        });
                      }}
                      value={body}
                    />
                  </form>
                  <div className="d-flex gap-3 ">
                    <img
                      src={file}
                      className="cursor"
                      alt=""
                      onClick={() => {
                        if (attachmentRef.current) {
                          attachmentRef.current.click();
                          
                        }
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={attachmentRef}
                      className="d-none"
                      onChange={handleFileUpload}
                    />
                    <img
                      src={message}
                      className="cursor"
                      alt=""
                      onClick={handleSendMessage}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatAndAttachment;
