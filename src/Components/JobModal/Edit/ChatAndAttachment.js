import { debounce, throttle } from "lodash";
import moment from "moment";
import Pusher from "pusher-js";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import eventEmitter from "../../../Event";
import profileChat from "../../../assets/common/Frame 34.png";
import attachmentsIcon from "../../../assets/common/attachments.svg";
import cut from "../../../assets/common/cut.svg";
import pngFIle from "../../../assets/common/pngFile.svg";
import comment from "../../../assets/icons/comment.svg";
import download from "../../../assets/icons/download.svg";
import file from "../../../assets/icons/file.svg";
import message from "../../../assets/icons/message.svg";
import { CrossIcon, UploadIcon } from "../../../assets/svg";
import { getProfile } from "../../../services/auth";
import {
  addAttachments,
  deleteAttachments,
  getAttachments,
  getJobComments,
  getMessages,
  getTaskComments,
  sendComment,
  sendMessage,
} from "../../../services/chat_attachment";
import TaggedUser from "./TaggedUser";
import { CollaboratorBorders } from "../../../helper";

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
  const chatScroll = useRef();
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

  // useEffect(() => {
  //   const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
  //     cluster: process.env.REACT_APP_CLUSTER,
  //     encrypted: true,
  //   });
  //   const id = localStorage.getItem("jobId") || "x";

  //   const channel = pusher.subscribe(`job.${id}`);
  //   channel.bind("message.created", (data) => {
  //     const { message } = data;
  //     console.log("message", message, chats);
  //     if (message) {
  //       const tempChats = chats;
  //       console.log("tempChats before push", tempChats);
  //       tempChats?.push(message);
  //       console.log("tempChats after push", tempChats);
  //       setChats(tempChats);
  //     }
  //   });

  //   return () => {
  //     pusher.unsubscribe(`job.${id}`);
  //   };
  // }, [chats]);

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
      const response1 = await getMessages(JobId);
      const response2 = await getAttachments(JobId);

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
        setNewMsg({
          type: "",
          data: "",
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
        const notificationData = {
          class: "user",
          message: "New Comment:" + userDetails.name,
        };
        const existingNotificationsJSON = localStorage.getItem("notifications");
        let existingNotifications = [];
        if (existingNotificationsJSON) {
          existingNotifications = JSON.parse(existingNotificationsJSON);
        }
        existingNotifications.push(notificationData);

        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );
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
    const notificationData = {
      class: "success",
      message: "File Successfully Downloaded!",
    };
    const existingNotificationsJSON = localStorage.getItem("notifications");
    let existingNotifications = [];
    if (existingNotificationsJSON) {
      existingNotifications = JSON.parse(existingNotificationsJSON);
    }
    existingNotifications.push(notificationData);

    localStorage.setItem(
      "notifications",
      JSON.stringify(existingNotifications)
    );
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
                              <div className="position-absolute receiverImg ">
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
                              <div className="position-absolute receiverImg">
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
                  attachments?.map((msg, i) => (
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

export const AddNewJobChatAndAttachment = ({ JobId, usersList }) => {
  const maxLength = 10;
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState(null);
  const [body, setBody] = useState("");
  const attachmentRef = useRef(null);
  const attachmentRef2 = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [newMsg, setNewMsg] = useState({
    type: "",
    data: "",
  });
  const chatScroll = useRef();
  const [userDetails, setUserDetails] = useState();
  const abortControllerRef = useRef(null);
  const profileAbortControllerRef = useRef(null);
  const [showUserList, setShowUserList] = useState(false);
  const [userIds, setUserIds] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState(usersList);

  const handleUserSelect = (user) => {
    // Find the last occurrence of '@' in the body
    const lastAtIndex = body.lastIndexOf("@");

    // If '@' is found, replace the text from '@' to the next space or end of the string
    if (lastAtIndex !== -1) {
      const beforeAt = body.slice(0, lastAtIndex); // Text before '@'
      const afterAt = body.slice(lastAtIndex); // Text after '@'

      // Replace the old tag with the selected user's name
      const newBody = `${beforeAt}@${user.name} ${afterAt.replace(
        /@\S*$/,
        ""
      )}`; // Remove the old tag
      setBody(newBody);

      // Update newMsg data
      setNewMsg(() => ({
        type: "msg",
        data: newBody,
      }));

      setUserIds((prevValue) => {
        return [...prevValue, user.id];
      });
    }
    setShowUserList(false);
  };

  const fetchProfileData = async () => {
    try {
      if (profileAbortControllerRef.current) {
        profileAbortControllerRef.current.abort(); // Abort previous request
      }
      profileAbortControllerRef.current = new AbortController();
      const signal = profileAbortControllerRef.current.signal;
      const authToken = localStorage.getItem("authToken");
      const response = await getProfile(authToken, { signal });
      if (response.res) {
        setUserDetails(response.res.user);
      } else {
        console.error("Profile error:", response.error);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
    throttledFetchChats();
  }, []);

  useEffect(() => {
    if (chatScroll.current) {
      chatScroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  // useEffect(() => {
  //   const id = localStorage.getItem("jobId");
  //   if (!id) return;

  //   const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
  //     cluster: process.env.REACT_APP_CLUSTER,
  //     encrypted: true,
  //   });

  //   const channel = pusher.subscribe(`job.${id}`);

  //   const handleMessage = (data) => {
  //     const { message } = data;
  //     console.log("New message received:", message);

  //     if (message) {
  //       setChats((prevChats) => {
  //         console.log("Previous chats:", prevChats);
  //         return [...prevChats, message]; // Create a new array to trigger re-render
  //       });
  //     }
  //   };

  //   channel.bind("message.created", handleMessage);

  //   return () => {
  //     console.log("Unsubscribing from job:", id);
  //     channel.unbind("message.created", handleMessage);
  //     pusher.unsubscribe(`job.${id}`);
  //   };
  // }, []);

  eventEmitter.removeAllListeners("newMessage");
  eventEmitter.on("newMessage", (data) => {
    const tempChats = data;
    console.log("tempChats before push", tempChats);
    tempChats?.push(message);
    console.log("tempChats after push", tempChats);
    setChats(tempChats);
  });

  const fetchChats = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort previous request
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      const [response1, response2] = await Promise.all([
        getMessages(JobId, { signal }),
        getAttachments(JobId, { signal }),
      ]);

      if (!response1.error && !response2.error) {
        const combinedArray = [...response1.res, ...response2.res];
        const sortedMessages = combinedArray.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        const sortedAttachments = response2.res?.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        setChats(sortedMessages);
        setAttachments(sortedAttachments);
      } else {
        setChats([]);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching messages:", error);
        setChats([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSendMessage = debounce(async (body) => {
    try {
      setLoading(true);
      const response = await sendMessage(JobId, { body, ids: userIds });
      if (!response.error) {
        fetchChats();
        const notificationData = {
          class: "user",
          message: "New Comment: " + userDetails.name,
        };
        const existingNotifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        existingNotifications.push(notificationData);
        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );
        setBody("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      if (chatScroll.current) {
        chatScroll.current.scrollIntoView({ behavior: "smooth" });
      }
      setNewMsg({ type: "", data: "" });
    }
  }, 300);

  const throttledFetchChats = throttle(fetchChats, 1000); // 1 second throttle delay

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!body || body?.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }
    debouncedSendMessage(body);
  };

  const handleFileUpload = (e) => {
    if (!e.target.files) return;

    const selectedFile = e.target?.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setNewMsg({
        type: "attachment",
        data: selectedFile,
      });
      console.log("selectedFile: ", selectedFile);
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
          throttledFetchChats();
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
        if (attachmentRef.current) {
          attachmentRef.current.value = ""; // Reset the input value
        }
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
    const notificationData = {
      class: "success",
      message: "File Successfully Downloaded!",
    };
    const existingNotificationsJSON = localStorage.getItem("notifications");
    let existingNotifications = [];
    if (existingNotificationsJSON) {
      existingNotifications = JSON.parse(existingNotificationsJSON);
    }
    existingNotifications.push(notificationData);

    localStorage.setItem(
      "notifications",
      JSON.stringify(existingNotifications)
    );
  };

  const handleDeleteAttachment = async (id) => {
    try {
      setLoading(true);
      const response = await deleteAttachments(id);
      if (!response.error) {
        toast.success(response.res?.message);
        throttledFetchChats();
      }
    } catch (error) {
      console.log("error in sending messages", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (text) => {
    // Regular expression to match words enclosed in {}
    const regex = /{([^}]+)}/g;
    let result = [];
    let lastIndex = 0;
    let match;

    // Iterate through each match of text inside {}
    while ((match = regex.exec(text)) !== null) {
      // Push the text before the match (normal text)
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }
      // Push the name inside {} as TaggedUser component
      result.push(<TaggedUser userKey={match.index} name={match[1]} />);
      lastIndex = regex.lastIndex; // Update last matched index
    }

    // Push any remaining text after the last match
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  return (
    <>
      <div className="addJobPopUpAttachments">
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
            style={{ cursor: "pointer", zIndex: 2, minWidth: "max-content" }}
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
                    {msg.original_name.length > maxLength
                      ? `${msg.original_name.slice(0, maxLength)}...`
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

      <div className="addJobPopUpAttachments">
        <h3>Chat</h3>
        <div className="chatsDiv">
          {chats &&
            chats?.length > 0 &&
            chats?.map((msg) => {
              return (
                <>
                  {msg.body && (
                    <>
                      {msg.user.name !== localStorage.getItem("user") && (
                        <div className="chats-content-reciever-new ">
                          <div
                            className={`InitialsBoxUser`}
                            style={{
                              minWidth: "40px",
                            }}
                          >
                            {msg.user?.name
                              .split(" ")
                              .map((part) => part.charAt(0).toUpperCase())
                              .join("")}
                          </div>
                          <div className="msg-body">
                            <div className="msg">
                              <p className="name"> {msg.user.name}</p>
                              <span></span>
                              <p className="time">
                                {" "}
                                {moment(msg.created_at).isBefore(
                                  moment().subtract(1, "hour")
                                )
                                  ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                  : moment(msg.created_at)
                                      .fromNow()
                                      .replace("minute", "min")
                                      .replace("minutes", "mins")}
                              </p>
                            </div>
                            <p className="content">{renderMessage(msg.body)}</p>
                          </div>
                        </div>
                      )}
                      {msg.user.name === localStorage.getItem("user") && (
                        <div className="chats-content-sender-new ">
                          <div
                            className={`InitialsBoxUser`}
                            style={{
                              minWidth: "40px",
                            }}
                          >
                            {msg.user?.name
                              .split(" ")
                              .map((part) => part.charAt(0).toUpperCase())
                              .join("")}
                          </div>
                          <div className="msg-body">
                            <div className="msg">
                              <p className="name"> You</p>
                              <span></span>
                              <p className="time">
                                {" "}
                                {
                                  moment(msg.created_at).isBefore(
                                    moment().subtract(1, "hour")
                                  )
                                    ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                    : moment(msg.created_at)
                                        .fromNow()
                                        .replace("minute", "min")
                                        .replace("minutes", "mins") // Show relative time if within 1 hour
                                }
                              </p>
                            </div>
                            <p className="content">{renderMessage(msg.body)}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {!msg.body && (
                    <>
                      {msg.user.name !== localStorage.getItem("user") && (
                        <div className="chats-content-reciever-new ">
                          <div
                            className={`InitialsBoxUser`}
                            style={{
                              minWidth: "40px",
                            }}
                          >
                            {msg.user?.name
                              .split(" ")
                              .map((part) => part.charAt(0).toUpperCase())
                              .join("")}
                          </div>
                          <div className="msg-body">
                            <div className="msg">
                              <p className="name"> {msg.user.name}</p>
                              <span></span>
                              <p className="time">
                                {" "}
                                {
                                  moment(msg.created_at).isBefore(
                                    moment().subtract(1, "hour")
                                  )
                                    ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                    : moment(msg.created_at)
                                        .fromNow()
                                        .replace("minute", "min")
                                        .replace("minutes", "mins") // Show relative time if within 1 hour
                                }
                              </p>
                            </div>
                            <div className="attachments">
                              <div
                                className="download-icon"
                                onClick={() =>
                                  handleDownloadFile(
                                    msg.filename,
                                    msg.original_name
                                  )
                                }
                              >
                                <img src={download} alt="" className="" />
                              </div>
                              <div className="imgBox">
                                <img src={pngFIle} className="" alt="" />
                              </div>
                              <h5>
                                {msg.original_name.length > maxLength
                                  ? `${msg.original_name.slice(
                                      0,
                                      maxLength
                                    )}...`
                                  : msg.original_name}
                              </h5>
                            </div>
                          </div>
                        </div>
                      )}
                      {msg.user.name === localStorage.getItem("user") && (
                        <div className="chats-content-sender-new ">
                          <div
                            className={`InitialsBoxUser`}
                            style={{
                              minWidth: "40px",
                            }}
                          >
                            {msg.user?.name
                              .split(" ")
                              .map((part) => part.charAt(0).toUpperCase())
                              .join("")}
                          </div>
                          <div className="msg-body">
                            <div className="msg">
                              <p className="name"> You</p>
                              <span></span>
                              <p className="time">
                                {" "}
                                {
                                  moment(msg.created_at).isBefore(
                                    moment().subtract(1, "hour")
                                  )
                                    ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                    : moment(msg.created_at)
                                        .fromNow()
                                        .replace("minute", "min")
                                        .replace("minutes", "mins") // Show relative time if within 1 hour
                                }
                              </p>
                            </div>
                            <div className="attachments">
                              <div
                                className="download-icon"
                                onClick={() =>
                                  handleDownloadFile(
                                    msg.filename,
                                    msg.original_name
                                  )
                                }
                              >
                                <img src={download} alt="" className="" />
                              </div>
                              <div className="imgBox">
                                <img src={pngFIle} className="" alt="" />
                              </div>
                              <h5>
                                {msg.original_name.length > maxLength
                                  ? `${msg.original_name.slice(
                                      0,
                                      maxLength
                                    )}...`
                                  : msg.original_name}
                              </h5>
                              <span
                                onClick={() => handleDeleteAttachment(msg.id)}
                              >
                                <CrossIcon />
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })}
          {loading && newMsg.type === "msg" && (
            <div className="chats-content-sender-new " ref={chatScroll}>
              <div
                className={`InitialsBoxUser`}
                style={{
                  minWidth: "40px",
                }}
              >
                {localStorage
                  .getItem("user")
                  ?.split(" ")
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("")}
              </div>
              <div className="msg-body">
                <div className="msg">
                  <p className="name"> You</p>
                  <span></span>
                  <p className="time">
                    {" "}
                    {
                      moment().isBefore(moment().subtract(1, "hour"))
                        ? moment().format("h:mm a") // Show time if more than 1 hour ago
                        : moment()
                            .fromNow()
                            .replace("minute", "min")
                            .replace("minutes", "mins") // Show relative time if within 1 hour
                    }
                  </p>
                </div>
                <p className="content">sending</p>
              </div>
            </div>
          )}
          {loading && newMsg.type === "attachment" && (
            <div className="chats-content-sender-new ">
              <div
                className={`InitialsBoxUser`}
                style={{
                  minWidth: "40px",
                }}
              >
                {localStorage
                  .getItem("user")
                  ?.split(" ")
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("")}
              </div>
              <div className="msg-body">
                <div className="msg">
                  <p className="name"> You</p>
                  <span></span>
                  <p className="time">
                    {" "}
                    {
                      moment().isBefore(moment().subtract(1, "hour"))
                        ? moment().format("h:mm a") // Show time if more than 1 hour ago
                        : moment()
                            .fromNow()
                            .replace("minute", "min")
                            .replace("minutes", "mins") // Show relative time if within 1 hour
                    }
                  </p>
                </div>
                <div className="attachments">
                  <div className="imgBox">
                    <img src={pngFIle} className="" alt="" />
                  </div>
                  <h5>
                    {newMsg.data?.name?.length > maxLength
                      ? `${newMsg.data?.name?.slice(0, maxLength)}...`
                      : newMsg.data?.name}{" "}
                    sending
                  </h5>
                  <div></div>
                </div>
              </div>
            </div>
          )}
          {!chats && <p className="loading">Loading Messages...</p>}
          {chats?.length === 0 && (
            <p className="no-chats">
              No chats currently. Type a message to start the chat.
            </p>
          )}
        </div>
      </div>

      <>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleFileUpload}
          className="imgUploadArea addJobImgUploadArea"
        >
          <form onSubmit={handleSendMessage} className="position-relative">
            <input
              type="text"
              placeholder="Add a comment..."
              onChange={(e) => {
                const { value } = e.target;
                setBody(value);
                setNewMsg({
                  type: "msg",
                  data: value,
                });
                if (e?.target?.value.endsWith("@")) {
                  setFilteredUsers(usersList);
                  setShowUserList(true);
                } else if (value.includes("@")) {
                  // If there's an '@', filter the users based on the text after '@'
                  const searchTerm = value.split("@").pop().trim();
                  const filteredUsers = usersList?.filter((user) =>
                    user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  setFilteredUsers(filteredUsers);
                } else {
                  setShowUserList(false);
                }
              }}
              value={body}
            />

            {showUserList && (
              <div className="newJobItemDropBox chat-tag">
                {filteredUsers?.length > 0
                  ? filteredUsers.map((user, index) => {
                      const initials = user.name
                        .split(" ")
                        .map((part) => part.charAt(0).toUpperCase())
                        .join("");

                      return (
                        <div
                          className="selectCollaboratorsBox"
                          key={index}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div
                            className={`collaboratorsBoxUser`}
                            style={{
                              minWidth: "40px",
                            }}
                          >
                            {initials}
                          </div>
                          <div className="userName">{user.name}</div>
                          <div className="userMail">{user.email}</div>
                        </div>
                      );
                    })
                  : "No users found"}
              </div>
            )}
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
      </>
    </>
  );
};

// New component
export const ChatAndComment = ({ JobId, usersList }) => {
  const maxLength = 10;
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState(null);
  const [comments, setComments] = useState(null);
  const [body, setBody] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const attachmentRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [newMsg, setNewMsg] = useState({
    type: "",
    data: "",
  });
  const [newComment, setNewComment] = useState({
    type: "",
    data: "",
  });
  const chatScroll = useRef();
  const commentScroll = useRef();
  const [userDetails, setUserDetails] = useState();
  const abortControllerRef = useRef(null);
  const profileAbortControllerRef = useRef(null);
  const [showUserList, setShowUserList] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(usersList);
  const [showUserList2, setShowUserList2] = useState(false);
  const [filteredUsers2, setFilteredUsers2] = useState(usersList);
  const [userIds, setUserIds] = useState([]);
  const [userIds2, setUserIds2] = useState([]);

  const userRef = useRef(null);
  const userRef2 = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        const isToast =
          document.querySelector(".Toastify__toast") &&
          document.querySelector(".Toastify__toast").contains(event.target);
        if (!isToast) setShowUserList(false);
      }
      if (userRef2.current && !userRef2.current.contains(event.target)) {
        const isToast =
          document.querySelector(".Toastify__toast") &&
          document.querySelector(".Toastify__toast").contains(event.target);
        if (!isToast) setShowUserList2(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleUserSelect = (user) => {
    // Find the last occurrence of '@' in the body
    const lastAtIndex = body.lastIndexOf("@");

    // If '@' is found, replace the text from '@' to the next space or end of the string
    if (lastAtIndex !== -1) {
      const beforeAt = body.slice(0, lastAtIndex); // Text before '@'
      const afterAt = body.slice(lastAtIndex); // Text after '@'

      // Replace the old tag with the selected user's name
      const newBody = `${beforeAt}@${user.name} ${afterAt.replace(
        /@\S*$/,
        ""
      )}`; // Remove the old tag
      setBody(newBody);

      // Update newMsg data
      setNewMsg(() => ({
        type: "msg",
        data: newBody,
      }));

      setUserIds((prevValue) => {
        return [...prevValue, user.id];
      });
    }
    setShowUserList(false);
  };

  const handleUserSelect2 = (user) => {
    // Find the last occurrence of '@' in the body
    const lastAtIndex = commentBody.lastIndexOf("@");

    // If '@' is found, replace the text from '@' to the next space or end of the string
    if (lastAtIndex !== -1) {
      const beforeAt = commentBody.slice(0, lastAtIndex); // Text before '@'
      const afterAt = commentBody.slice(lastAtIndex); // Text after '@'

      // Replace the old tag with the selected user's name
      const newBody = `${beforeAt}@${user.name} ${afterAt.replace(
        /@\S*$/,
        ""
      )}`; // Remove the old tag
      setCommentBody(newBody);

      // Update newMsg data
      setNewComment(() => ({
        type: "msg",
        data: newBody,
      }));

      setUserIds2((prevValue) => {
        return [...prevValue, user.id];
      });
    }
    setShowUserList2(false);
  };

  const fetchProfileData = async () => {
    try {
      if (profileAbortControllerRef.current) {
        profileAbortControllerRef.current.abort(); // Abort previous request
      }
      profileAbortControllerRef.current = new AbortController();
      const signal = profileAbortControllerRef.current.signal;
      const authToken = localStorage.getItem("authToken");
      const response = await getProfile(authToken, { signal });
      if (response.res) {
        setUserDetails(response.res.user);
      } else {
        console.error("Profile error:", response.error);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
    throttledFetchChats();
    throttledFetchComments();
  }, []);

  useEffect(() => {
    if (chatScroll.current) {
      chatScroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);
  useEffect(() => {
    if (commentScroll.current) {
      commentScroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  useEffect(() => {
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`job.${JobId}`);

    const handleMessage = (data) => {
      const { message } = data;
      console.log("New message received:", message);

      if (message) {
        setChats((prevChats) => {
          console.log("Previous chats:", prevChats);
          return [...prevChats, message]; // Create a new array to trigger re-render
        });
      }
    };

    channel.bind("message.created", handleMessage);

    return () => {
      console.log("Unsubscribing from job:", JobId);
      channel.unbind("message.created", handleMessage);
      pusher.unsubscribe(`job.${JobId}`);
    };
  }, []);

  eventEmitter.removeAllListeners("newMessage");
  eventEmitter.on("newMessage", (data) => {
    const tempChats = data;
    tempChats?.push(message);
    setChats(tempChats);
  });

  const fetchChats = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort previous request
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      const [response1, response2] = await Promise.all([
        getMessages(JobId, { signal }),
        getAttachments(JobId, { signal }),
      ]);

      if (!response1.error && !response2.error) {
        const combinedArray = [...response1.res, ...response2.res];
        const sortedMessages = combinedArray.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        const sortedAttachments = response2.res?.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        setChats(sortedMessages);
        setAttachments(sortedAttachments);
      } else {
        setChats([]);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching messages:", error);
        setChats([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort previous request
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      const [response1] = await Promise.all([
        getJobComments(JobId, { signal }),
      ]);

      if (!response1.error) {
        const combinedArray = [...response1.res];
        const sortedMessages = combinedArray.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        setComments(sortedMessages);
      } else {
        setComments([]);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching messages:", error);
        setComments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSendMessage = debounce(async (body) => {
    try {
      setLoading(true);
      const response = await sendMessage(JobId, { body, ids: userIds });
      if (!response.error) {
        fetchChats();
        const notificationData = {
          class: "user",
          message: "New Comment: " + userDetails.name,
        };
        const existingNotifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        existingNotifications.push(notificationData);
        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );
        setBody("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      if (chatScroll.current) {
        chatScroll.current.scrollIntoView({ behavior: "smooth" });
      }
      setNewMsg({ type: "", data: "" });
    }
  }, 300);

  const throttledFetchChats = throttle(fetchChats, 1000); // 1 second throttle delay

  const debouncedSendComment = debounce(async (commentBody) => {
    try {
      setLoading(true);
      const response = await sendComment({
        body: commentBody,
        job_id: JobId,
        ids: userIds2,
      });
      if (!response.error) {
        setComments((prevComments) => [
          ...prevComments,
          { ...response.res, user: { name: localStorage.getItem("user") } },
        ]);

        setNewComment({
          type: "",
          data: "",
        });
        setCommentBody("");
        const notificationData = {
          class: "user",
          message: "New Comment: " + userDetails.name,
        };
        const existingNotifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        existingNotifications.push(notificationData);
        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      if (chatScroll.current) {
        chatScroll.current.scrollIntoView({ behavior: "smooth" });
      }
      setNewComment({ type: "", data: "" });
    }
  }, 300);

  const throttledFetchComments = throttle(fetchComments, 1000);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!body || body?.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }
    debouncedSendMessage(body);
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentBody || commentBody?.trim() === "") {
      toast.error("Comment cannot be empty");
      return;
    }
    debouncedSendComment(commentBody);
  };

  const handleFileUpload = (e) => {
    if (!e.target.files) return;

    const selectedFile = e.target?.files[0];

    if (selectedFile) {
      if (
        selectedFile.type.startsWith("image/") ||
        selectedFile.type === "application/pdf"
      ) {
        setNewMsg({
          type: "attachment",
          data: selectedFile,
        });

        console.log("selectedFile: ", selectedFile);

        handleImageUpload(selectedFile);
      } else {
        if (attachmentRef.current) {
          attachmentRef.current.value = ""; // Reset the input value
        }
        toast.error("Invalid file type. Please upload an image or PDF.");
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if(droppedFile){

      if (
        (droppedFile && droppedFile.type.startsWith("image/")) ||
        droppedFile.type.startsWith("application/pdf")
      ) {
        setNewMsg({
          type: "attachment",
          data: droppedFile,
        });
        handleImageUpload(droppedFile);
      } else {
        if (attachmentRef.current) {
          attachmentRef.current.value = ""; // Reset the input value
        }
        toast.error("Invalid file type. Please upload an image or PDF.");
      }
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
      // formData.append("type", 'job');
      try {
        setLoading(true);
        let response = await addAttachments(formData, JobId);
        console.log("response 123--->", response);
        if (response.res) {
          toast.success(response.res?.message);
          throttledFetchChats();
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
        if (attachmentRef.current) {
          attachmentRef.current.value = ""; // Reset the input value
        }
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
    const notificationData = {
      class: "success",
      message: "File Successfully Downloaded!",
    };
    const existingNotificationsJSON = localStorage.getItem("notifications");
    let existingNotifications = [];
    if (existingNotificationsJSON) {
      existingNotifications = JSON.parse(existingNotificationsJSON);
    }
    existingNotifications.push(notificationData);

    localStorage.setItem(
      "notifications",
      JSON.stringify(existingNotifications)
    );
  };

  const handleDeleteAttachment = async (id) => {
    try {
      setLoading(true);
      const response = await deleteAttachments(id);
      if (!response.error) {
        toast.success(response.res?.message);
        throttledFetchChats();
      }
    } catch (error) {
      console.log("error in sending messages", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (text) => {
    // Regular expression to match words enclosed in {}
    const regex = /{([^}]+)}/g;
    let result = [];
    let lastIndex = 0;
    let match;

    // Iterate through each match of text inside {}
    while ((match = regex.exec(text)) !== null) {
      // Push the text before the match (normal text)
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }
      // Push the name inside {} as TaggedUser component
      result.push(<TaggedUser userKey={match.index} name={match[1]} />);
      lastIndex = regex.lastIndex; // Update last matched index
    }

    // Push any remaining text after the last match
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  return (
    <>
      <div className="addJobPopUpAttachments">
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
            style={{ cursor: "pointer", zIndex: 2, minWidth: "max-content" }}
            onClick={() => {
              if (attachmentRef.current) {
                attachmentRef.current.click();
              }
            }}
          >
            <input
              type="file"
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
                    {msg.original_name.length > maxLength
                      ? `${msg.original_name.slice(0, maxLength)}...`
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
      <div className="addJobPopUpAttachments">
        <div className="addJobPopUpAttachments border-bottom-0 p-0">
          <div className="chatsDiv">
            <div className="inner-scroll">
              {comments &&
                comments?.length > 0 &&
                comments?.map((msg) => {
                  return (
                    <>
                      {msg.body && (
                        <>
                          {msg.user.name !== localStorage.getItem("user") && (
                            <div className="chats-content-reciever-new ">
                              <div
                                className={`InitialsBoxUser`}
                                style={{
                                  minWidth: "40px",
                                }}
                              >
                                {msg.user?.name
                                  .split(" ")
                                  .map((part) => part.charAt(0).toUpperCase())
                                  .join("")}
                              </div>
                              <div className="msg-body">
                                <div className="msg">
                                  <p className="name"> {msg.user.name}</p>
                                  <span></span>
                                  <p className="time">
                                    {" "}
                                    {moment(msg.created_at).isBefore(
                                      moment().subtract(1, "hour")
                                    )
                                      ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                      : moment(msg.created_at)
                                          .fromNow()
                                          .replace("minute", "min")
                                          .replace("minutes", "mins")}
                                  </p>
                                </div>
                                <p className="content">
                                  {renderMessage(msg.body)}
                                </p>
                              </div>
                            </div>
                          )}
                          {msg.user.name === localStorage.getItem("user") && (
                            <div className="chats-content-sender-new ">
                              <div
                                className={`InitialsBoxUser`}
                                style={{
                                  minWidth: "40px",
                                }}
                              >
                                {msg.user?.name
                                  .split(" ")
                                  .map((part) => part.charAt(0).toUpperCase())
                                  .join("")}
                              </div>
                              <div className="msg-body">
                                <div className="msg">
                                  <p className="name"> You</p>
                                  <span></span>
                                  <p className="time">
                                    {" "}
                                    {
                                      moment(msg.created_at).isBefore(
                                        moment().subtract(1, "hour")
                                      )
                                        ? moment(msg.created_at).format(
                                            "h:mm a"
                                          ) // Show time if more than 1 hour ago
                                        : moment(msg.created_at)
                                            .fromNow()
                                            .replace("minute", "min")
                                            .replace("minutes", "mins") // Show relative time if within 1 hour
                                    }
                                  </p>
                                </div>
                                <p className="content">
                                  {renderMessage(msg.body)}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })}
              {loading && newComment.type === "msg" && (
                <div className="chats-content-sender-new " ref={commentScroll}>
                  <div
                    className={`InitialsBoxUser`}
                    style={{
                      minWidth: "40px",
                    }}
                  >
                    {localStorage
                      .getItem("user")
                      ?.split(" ")
                      .map((part) => part.charAt(0).toUpperCase())
                      .join("")}
                  </div>
                  <div className="msg-body">
                    <div className="msg">
                      <p className="name"> You</p>
                      <span></span>
                      <p className="time">
                        {" "}
                        {
                          moment().isBefore(moment().subtract(1, "hour"))
                            ? moment().format("h:mm a") // Show time if more than 1 hour ago
                            : moment()
                                .fromNow()
                                .replace("minute", "min")
                                .replace("minutes", "mins") // Show relative time if within 1 hour
                        }
                      </p>
                    </div>
                    <p className="content">sending</p>
                  </div>
                </div>
              )}
              {!comments && <p className="loading">Loading Comments...</p>}
              {comments?.length === 0 && (
                <p className="no-chats">No Comments Available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-start comment-inputBox">
          <div
            className={`InitialsBoxUser`}
            style={{
              minWidth: "40px",
            }}
          >
            {localStorage
              .getItem("user")
              .split(" ")
              .map((part) => part.charAt(0).toUpperCase())
              .join("")}
          </div>
          <div className="imgUploadArea addJobImgUploadArea2">
            <form onSubmit={handleSendComment} className="position-relative">
              <input
                type="text"
                placeholder="Add a comment..."
                onChange={(e) => {
                  const { value } = e.target;
                  setCommentBody(value);
                  setNewComment({
                    type: "msg",
                    data: value,
                  });
                  if (e?.target?.value.endsWith("@")) {
                    setFilteredUsers2(usersList);
                    setShowUserList2(true);
                  } else if (value.includes("@")) {
                    // If there's an '@', filter the users based on the text after '@'
                    const searchTerm = value.split("@").pop().trim();
                    const filteredUsers = usersList?.filter((user) =>
                      user?.name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    );
                    setFilteredUsers2(filteredUsers);
                  } else {
                    setShowUserList2(false);
                  }
                }}
                value={commentBody}
              />

              {showUserList2 && (
                <div className="newJobItemDropBox chat-tag" ref={userRef2}>
                  {filteredUsers2?.length > 0
                    ? filteredUsers2.map((user, index) => {
                        const initials = user.name
                          .split(" ")
                          .map((part) => part.charAt(0).toUpperCase())
                          .join("");

                        return (
                          <div
                            className="selectCollaboratorsBox"
                            key={index}
                            onClick={() => handleUserSelect2(user)}
                          >
                            <div
                              className={`collaboratorsBoxUser`}
                              style={{
                                minWidth: "40px",
                                border:
                                  CollaboratorBorders[user.id] ||
                                  "1px solid rgb(105, 103, 103)",
                              }}
                            >
                              {initials}
                            </div>
                            <div className="userName">{user.name}</div>
                            <div className="userMail">{user.email}</div>
                          </div>
                        );
                      })
                    : "No users found"}
                </div>
              )}
            </form>

            <div
              className="d-flex gap-1 align-items-center justify-content-center comment-text cursor"
              onClick={handleSendComment}
            >
              <img src={comment} className="cursor" alt="Comment" />
              <span>Comment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="addJobPopUpAttachments">
        <h3>Chat</h3>
        <div className="chatsDiv">
          <div className="inner-scroll">
            {chats &&
              chats?.length > 0 &&
              chats?.map((msg) => {
                return (
                  <>
                    {msg.body && (
                      <>
                        {msg.user.name !== localStorage.getItem("user") && (
                          <div className="chats-content-reciever-new ">
                            <div
                              className={`InitialsBoxUser`}
                              style={{
                                minWidth: "40px",
                              }}
                            >
                              {msg.user?.name
                                .split(" ")
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("")}
                            </div>
                            <div className="msg-body">
                              <div className="msg">
                                <p className="name"> {msg.user.name}</p>
                                <span></span>
                                <p className="time">
                                  {" "}
                                  {moment(msg.created_at).isBefore(
                                    moment().subtract(1, "hour")
                                  )
                                    ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                    : moment(msg.created_at)
                                        .fromNow()
                                        .replace("minute", "min")
                                        .replace("minutes", "mins")}
                                </p>
                              </div>
                              <p className="content">
                                {renderMessage(msg.body)}
                              </p>
                            </div>
                          </div>
                        )}
                        {msg.user.name === localStorage.getItem("user") && (
                          <div className="chats-content-sender-new ">
                            <div
                              className={`InitialsBoxUser`}
                              style={{
                                minWidth: "40px",
                              }}
                            >
                              {msg.user?.name
                                .split(" ")
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("")}
                            </div>
                            <div className="msg-body">
                              <div className="msg">
                                <p className="name"> You</p>
                                <span></span>
                                <p className="time">
                                  {" "}
                                  {
                                    moment(msg.created_at).isBefore(
                                      moment().subtract(1, "hour")
                                    )
                                      ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                      : moment(msg.created_at)
                                          .fromNow()
                                          .replace("minute", "min")
                                          .replace("minutes", "mins") // Show relative time if within 1 hour
                                  }
                                </p>
                              </div>
                              <p className="content">
                                {renderMessage(msg.body)}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {!msg.body && (
                      <>
                        {msg.user.name !== localStorage.getItem("user") && (
                          <div className="chats-content-reciever-new ">
                            <div
                              className={`InitialsBoxUser`}
                              style={{
                                minWidth: "40px",
                              }}
                            >
                              {msg.user?.name
                                .split(" ")
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("")}
                            </div>
                            <div className="msg-body">
                              <div className="msg">
                                <p className="name"> {msg.user.name}</p>
                                <span></span>
                                <p className="time">
                                  {" "}
                                  {
                                    moment(msg.created_at).isBefore(
                                      moment().subtract(1, "hour")
                                    )
                                      ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                      : moment(msg.created_at)
                                          .fromNow()
                                          .replace("minute", "min")
                                          .replace("minutes", "mins") // Show relative time if within 1 hour
                                  }
                                </p>
                              </div>
                              <div className="attachments">
                                <div
                                  className="download-icon"
                                  onClick={() =>
                                    handleDownloadFile(
                                      msg.filename,
                                      msg.original_name
                                    )
                                  }
                                >
                                  <img src={download} alt="" className="" />
                                </div>
                                <div className="imgBox">
                                  <img src={pngFIle} className="" alt="" />
                                </div>
                                <h5>
                                  {msg.original_name.length > maxLength
                                    ? `${msg.original_name.slice(
                                        0,
                                        maxLength
                                      )}...`
                                    : msg.original_name}
                                </h5>
                              </div>
                            </div>
                          </div>
                        )}
                        {msg.user.name === localStorage.getItem("user") && (
                          <div className="chats-content-sender-new ">
                            <div
                              className={`InitialsBoxUser`}
                              style={{
                                minWidth: "40px",
                              }}
                            >
                              {msg.user?.name
                                .split(" ")
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("")}
                            </div>
                            <div className="msg-body">
                              <div className="msg">
                                <p className="name"> You</p>
                                <span></span>
                                <p className="time">
                                  {" "}
                                  {
                                    moment(msg.created_at).isBefore(
                                      moment().subtract(1, "hour")
                                    )
                                      ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                      : moment(msg.created_at)
                                          .fromNow()
                                          .replace("minute", "min")
                                          .replace("minutes", "mins") // Show relative time if within 1 hour
                                  }
                                </p>
                              </div>
                              <div className="attachments">
                                <div
                                  className="download-icon"
                                  onClick={() =>
                                    handleDownloadFile(
                                      msg.filename,
                                      msg.original_name
                                    )
                                  }
                                >
                                  <img src={download} alt="" className="" />
                                </div>
                                <div className="imgBox">
                                  <img src={pngFIle} className="" alt="" />
                                </div>
                                <h5>
                                  {msg.original_name.length > maxLength
                                    ? `${msg.original_name.slice(
                                        0,
                                        maxLength
                                      )}...`
                                    : msg.original_name}
                                </h5>
                                <span
                                  onClick={() => handleDeleteAttachment(msg.id)}
                                >
                                  <CrossIcon />
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })}
            {loading && newMsg.type === "msg" && (
              <div className="chats-content-sender-new " ref={chatScroll}>
                <div
                  className={`InitialsBoxUser`}
                  style={{
                    minWidth: "40px",
                  }}
                >
                  {localStorage
                    .getItem("user")
                    ?.split(" ")
                    .map((part) => part.charAt(0).toUpperCase())
                    .join("")}
                </div>
                <div className="msg-body">
                  <div className="msg">
                    <p className="name"> You</p>
                    <span></span>
                    <p className="time">
                      {" "}
                      {
                        moment().isBefore(moment().subtract(1, "hour"))
                          ? moment().format("h:mm a") // Show time if more than 1 hour ago
                          : moment()
                              .fromNow()
                              .replace("minute", "min")
                              .replace("minutes", "mins") // Show relative time if within 1 hour
                      }
                    </p>
                  </div>
                  <p className="content">sending</p>
                </div>
              </div>
            )}
            {loading && newMsg.type === "attachment" && (
              <div className="chats-content-sender-new ">
                <div
                  className={`InitialsBoxUser`}
                  style={{
                    minWidth: "40px",
                  }}
                >
                  {localStorage
                    .getItem("user")
                    ?.split(" ")
                    .map((part) => part.charAt(0).toUpperCase())
                    .join("")}
                </div>
                <div className="msg-body">
                  <div className="msg">
                    <p className="name"> You</p>
                    <span></span>
                    <p className="time">
                      {" "}
                      {
                        moment().isBefore(moment().subtract(1, "hour"))
                          ? moment().format("h:mm a") // Show time if more than 1 hour ago
                          : moment()
                              .fromNow()
                              .replace("minute", "min")
                              .replace("minutes", "mins") // Show relative time if within 1 hour
                      }
                    </p>
                  </div>
                  <div className="attachments">
                    <div className="imgBox">
                      <img src={pngFIle} className="" alt="" />
                    </div>
                    <h5>
                      {newMsg.data?.name?.length > maxLength
                        ? `${newMsg.data?.name?.slice(0, maxLength)}...`
                        : newMsg.data?.name}{" "}
                      sending
                    </h5>
                    <div></div>
                  </div>
                </div>
              </div>
            )}
            {!chats && <p className="loading">Loading Messages...</p>}
            {chats?.length === 0 && (
              <p className="no-chats">
                No chats currently. Type a message to start the chat.
              </p>
            )}
          </div>
        </div>
      </div>

      <>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleFileUpload}
          className="imgUploadArea addJobImgUploadArea"
        >
          <form onSubmit={handleSendMessage} className="position-relative">
            <input
              type="text"
              placeholder="Type a message in the chat..."
              onChange={(e) => {
                const { value } = e.target;
                setBody(value);
                setNewMsg({
                  type: "msg",
                  data: value,
                });
                if (e?.target?.value.endsWith("@")) {
                  setFilteredUsers(usersList);
                  setShowUserList(true);
                } else if (value.includes("@")) {
                  // If there's an '@', filter the users based on the text after '@'
                  const searchTerm = value.split("@").pop().trim();
                  const filteredUsers = usersList?.filter((user) =>
                    user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  setFilteredUsers(filteredUsers);
                } else {
                  setShowUserList(false);
                }
              }}
              value={body}
            />

            {showUserList && (
              <div className="newJobItemDropBox chat-tag" ref={userRef}>
                {filteredUsers?.length > 0
                  ? filteredUsers.map((user, index) => {
                      const initials = user.name
                        .split(" ")
                        .map((part) => part.charAt(0).toUpperCase())
                        .join("");

                      return (
                        <div
                          className="selectCollaboratorsBox"
                          key={index}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div
                            className={`collaboratorsBoxUser`}
                            style={{
                              minWidth: "40px",
                              border:
                                CollaboratorBorders[user.id] ||
                                "1px solid rgb(105, 103, 103)",
                            }}
                          >
                            {initials}
                          </div>
                          <div className="userName">{user.name}</div>
                          <div className="userMail">{user.email}</div>
                        </div>
                      );
                    })
                  : "No users found"}
              </div>
            )}
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
      </>
    </>
  );
};

export const CommentBox = ({ taskId, JobId, usersList }) => {
  const maxLength = 10;
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState(null);
  const [body, setBody] = useState("");
  const attachmentRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [newMsg, setNewMsg] = useState({
    type: "",
    data: "",
  });
  const chatScroll = useRef();
  const [userDetails, setUserDetails] = useState();
  const abortControllerRef = useRef(null);
  const profileAbortControllerRef = useRef(null);
  const [showUserList, setShowUserList] = useState(false);
  const [userIds, setUserIds] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState(usersList);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        const isToast =
          document.querySelector(".Toastify__toast") &&
          document.querySelector(".Toastify__toast").contains(event.target);
        if (!isToast) setShowUserList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user) => {
    // Find the last occurrence of '@' in the body
    const lastAtIndex = body.lastIndexOf("@");

    // If '@' is found, replace the text from '@' to the next space or end of the string
    if (lastAtIndex !== -1) {
      const beforeAt = body.slice(0, lastAtIndex); // Text before '@'
      const afterAt = body.slice(lastAtIndex); // Text after '@'

      // Replace the old tag with the selected user's name
      const newBody = `${beforeAt}@${user.name} ${afterAt.replace(
        /@\S*$/,
        ""
      )}`; // Remove the old tag
      setBody(newBody);

      // Update newMsg data
      setNewMsg(() => ({
        type: "msg",
        data: newBody,
      }));

      setUserIds((prevValue) => {
        return [...prevValue, user.id];
      });
    }
    setShowUserList(false);
  };

  const fetchProfileData = async () => {
    try {
      if (profileAbortControllerRef.current) {
        profileAbortControllerRef.current.abort(); // Abort previous request
      }
      profileAbortControllerRef.current = new AbortController();
      const signal = profileAbortControllerRef.current.signal;
      const authToken = localStorage.getItem("authToken");
      const response = await getProfile(authToken, { signal });
      if (response.res) {
        setUserDetails(response.res.user);
      } else {
        console.error("Profile error:", response.error);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchProfileData();
    throttledFetchChats();
  }, []);

  useEffect(() => {
    if (chatScroll.current) {
      chatScroll.current.scrollIntoView({ behavior: "smooth" });
    }
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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Abort previous request
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      const [response1, response2] = await Promise.all([
        getTaskComments(taskId, { signal }),
        getAttachments(JobId, { signal }),
      ]);
      if (!response1.error && !response2.error) {
        const sortedMessages = response1.res.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        const sortedAttachments = response2.res?.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setChats(sortedMessages);
        setAttachments(sortedAttachments);
      } else {
        setChats([]);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching messages:", error);
        setChats([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const debouncedSendMessage = debounce(async (body) => {
    try {
      setLoading(true);
      const response = await sendComment({
        body,
        task_id: taskId,
        ids: userIds,
      });
      if (!response.error) {
        setChats((prevComments) => [
          ...prevComments,
          { ...response.res, user: { name: localStorage.getItem("user") } },
        ]);
        const notificationData = {
          class: "user",
          message: "New Comment: " + userDetails.name,
        };
        const existingNotifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        existingNotifications.push(notificationData);
        localStorage.setItem(
          "notifications",
          JSON.stringify(existingNotifications)
        );
        setBody("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      if (chatScroll.current) {
        chatScroll.current.scrollIntoView({ behavior: "smooth" });
      }
      setNewMsg({ type: "", data: "" });
    }
  }, 300);

  const throttledFetchChats = throttle(fetchChats, 500); // 1 second throttle delay

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!taskId) return;
    if (!body || body?.trim() === "") {
      toast.error("Message cannot be empty");
      return;
    }
    debouncedSendMessage(body);
  };

  const handleFileUpload = (e) => {
    if (!e.target.files) return;

    const selectedFile = e.target?.files[0];

   

    if (selectedFile) {
      if (
        selectedFile.type.startsWith("image/") ||
        selectedFile.type === "application/pdf"
      ) {
        setNewMsg({
          type: "attachment",
          data: selectedFile,
        });

        console.log("selectedFile: ", selectedFile);

        handleImageUpload(selectedFile);
      } else {
        if (attachmentRef.current) {
          attachmentRef.current.value = ""; // Reset the input value
        }
        toast.error("Invalid file type. Please upload an image or PDF.");
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!JobId) return;
    const droppedFile = e.dataTransfer.files[0];
if(droppedFile){

  if (
    (droppedFile && droppedFile.type.startsWith("image/")) ||
    droppedFile.type.startsWith("application/pdf")
  ) {
    setNewMsg({
      type: "attachment",
      data: droppedFile,
    });
    handleImageUpload(droppedFile);
  } else {
    if (attachmentRef.current) {
      attachmentRef.current.value = ""; // Reset the input value
    }
    toast.error("Invalid file type. Please upload an image or PDF.");
  }
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
        if (response.res) {
          toast.success(response.res?.message);
          throttledFetchChats();
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
        if (attachmentRef.current) {
          attachmentRef.current.value = ""; // Reset the input value
        }
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
    const notificationData = {
      class: "success",
      message: "File Successfully Downloaded!",
    };
    const existingNotificationsJSON = localStorage.getItem("notifications");
    let existingNotifications = [];
    if (existingNotificationsJSON) {
      existingNotifications = JSON.parse(existingNotificationsJSON);
    }
    existingNotifications.push(notificationData);

    localStorage.setItem(
      "notifications",
      JSON.stringify(existingNotifications)
    );
  };

  const handleDeleteAttachment = async (id) => {
    try {
      setLoading(true);
      const response = await deleteAttachments(id);
      if (!response.error) {
        toast.success(response.res?.message);
        throttledFetchChats();
      }
    } catch (error) {
      console.log("error in sending messages", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (text) => {
    // Regular expression to match words enclosed in {}
    const regex = /{([^}]+)}/g;
    let result = [];
    let lastIndex = 0;
    let match;

    // Iterate through each match of text inside {}
    while ((match = regex.exec(text)) !== null) {
      // Push the text before the match (normal text)
      if (match.index > lastIndex) {
        result.push(text.slice(lastIndex, match.index));
      }
      // Push the name inside {} as TaggedUser component
      result.push(<TaggedUser userKey={match.index} name={match[1]} />);
      lastIndex = regex.lastIndex; // Update last matched index
    }

    // Push any remaining text after the last match
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  return (
    <div className="comment-box">
      <div className="addJobPopUpAttachments">
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
            style={{ cursor: "pointer", zIndex: 2, minWidth: "max-content" }}
            onClick={() => {
              if (!JobId) return;
              if (attachmentRef.current) {
                attachmentRef.current.click();
              }
            }}
            title={!JobId ? "Please add the task first" : ""}
          >
            <input
              type="file"
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
                    {msg.original_name.length > maxLength
                      ? `${msg.original_name.slice(0, maxLength)}...`
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
      <div className="addJobPopUpAttachments ">
        <div className="chatsDiv">
          <div className="inner-scroll">
            {chats &&
              chats?.length > 0 &&
              chats?.map((msg) => {
                return (
                  <>
                    {msg.body && (
                      <>
                        {msg.user.name !== localStorage.getItem("user") && (
                          <div className="chats-content-reciever-new ">
                            <div
                              className={`InitialsBoxUser`}
                              style={{
                                minWidth: "40px",
                              }}
                            >
                              {msg.user?.name
                                .split(" ")
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("")}
                            </div>
                            <div className="msg-body">
                              <div className="msg">
                                <p className="name"> {msg.user.name}</p>
                                <span></span>
                                <p className="time">
                                  {" "}
                                  {moment(msg.created_at).isBefore(
                                    moment().subtract(1, "hour")
                                  )
                                    ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                    : moment(msg.created_at)
                                        .fromNow()
                                        .replace("minute", "min")
                                        .replace("minutes", "mins")}
                                </p>
                              </div>
                              <p className="content">
                                {renderMessage(msg.body)}
                              </p>
                            </div>
                          </div>
                        )}
                        {msg.user.name === localStorage.getItem("user") && (
                          <div className="chats-content-sender-new ">
                            <div
                              className={`InitialsBoxUser`}
                              style={{
                                minWidth: "40px",
                              }}
                            >
                              {msg.user?.name
                                .split(" ")
                                .map((part) => part.charAt(0).toUpperCase())
                                .join("")}
                            </div>
                            <div className="msg-body">
                              <div className="msg">
                                <p className="name"> You</p>
                                <span></span>
                                <p className="time">
                                  {" "}
                                  {
                                    moment(msg.created_at).isBefore(
                                      moment().subtract(1, "hour")
                                    )
                                      ? moment(msg.created_at).format("h:mm a") // Show time if more than 1 hour ago
                                      : moment(msg.created_at)
                                          .fromNow()
                                          .replace("minute", "min")
                                          .replace("minutes", "mins") // Show relative time if within 1 hour
                                  }
                                </p>
                              </div>
                              <p className="content">
                                {renderMessage(msg.body)}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })}
            {loading && newMsg?.type === "msg" && (
              <div className="chats-content-sender-new " ref={chatScroll}>
                <div
                  className={`InitialsBoxUser`}
                  style={{
                    minWidth: "40px",
                  }}
                >
                  {localStorage
                    .getItem("user")
                    ?.split(" ")
                    .map((part) => part.charAt(0).toUpperCase())
                    .join("")}
                </div>
                <div className="msg-body">
                  <div className="msg">
                    <p className="name"> You</p>
                    <span></span>
                    <p className="time">
                      {" "}
                      {
                        moment().isBefore(moment().subtract(1, "hour"))
                          ? moment().format("h:mm a") // Show time if more than 1 hour ago
                          : moment()
                              .fromNow()
                              .replace("minute", "min")
                              .replace("minutes", "mins") // Show relative time if within 1 hour
                      }
                    </p>
                  </div>
                  <p className="content">sending</p>
                </div>
              </div>
            )}
            {!chats && <p className="loading">Loading Comments...</p>}
            {chats?.length === 0 && (
              <p className="no-chats">No Comments Available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-start comment-inputBox">
        <div
          className={`InitialsBoxUser`}
          style={{
            minWidth: "40px",
          }}
        >
          {localStorage
            .getItem("user")
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase())
            .join("")}
        </div>
        <div className="imgUploadArea addJobImgUploadArea2">
          <form onSubmit={handleSendMessage} className="position-relative">
            <input
              type="text"
              placeholder="Add a comment..."
              onChange={(e) => {
                const { value } = e.target;
                setBody(value);
                setNewMsg({
                  type: "msg",
                  data: value,
                });
                if (e?.target?.value.endsWith("@")) {
                  setFilteredUsers(usersList);
                  setShowUserList(true);
                } else if (value.includes("@")) {
                  // If there's an '@', filter the users based on the text after '@'
                  const searchTerm = value.split("@").pop().trim();
                  const filteredUsers = usersList?.filter((user) =>
                    user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  setFilteredUsers(filteredUsers);
                } else {
                  setShowUserList(false);
                }
              }}
              title={!taskId ? "Please add the task first" : ""}
              value={body}
              disabled={!taskId}
            />

            {showUserList && (
              <div className="newJobItemDropBox chat-tag" ref={userRef}>
                {filteredUsers?.length > 0
                  ? filteredUsers.map((user, index) => {
                      const initials = user.name
                        .split(" ")
                        .map((part) => part.charAt(0).toUpperCase())
                        .join("");

                      return (
                        <div
                          className="selectCollaboratorsBox"
                          key={index}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div
                            className={`collaboratorsBoxUser`}
                            style={{
                              minWidth: "40px",
                              border:
                                CollaboratorBorders[user.id] ||
                                "1px solid rgb(105, 103, 103)",
                            }}
                          >
                            {initials}
                          </div>
                          <div className="userName">{user.name}</div>
                          <div className="userMail">{user.email}</div>
                        </div>
                      );
                    })
                  : "No users found"}
              </div>
            )}
          </form>

          <div
            className="d-flex gap-1 align-items-center justify-content-center comment-text cursor"
            onClick={handleSendMessage}
            title={!taskId ? "Please add the task first" : ""}
          >
            <img src={comment} className="cursor" alt="Comment" />
            <span>Comment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAndAttachment;
