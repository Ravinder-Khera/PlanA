import React, { useState } from 'react'
import refresh from '../../../assets/icons/refreshImg.svg'
import profileChat from '../../../assets/common/Frame 34.png'
import deleteImg from '../../../assets/common/delete.svg'
import attachments from '../../../assets/common/attachments.svg'
import cut from '../../../assets/common/cut.svg'
import pngFIle from '../../../assets/common/pngFile.svg'
import svgFile from '../../../assets/common/svg.svg'
import message from '../../../assets/icons/message.svg'
import file from '../../../assets/icons/file.svg'
import edit from '../../../assets/icons/edit.svg'
import download from '../../../assets/icons/download.svg'
const ChatAndAttachment = () => {
    const [currentTab, setCurrentTab] = useState("chats");

    return (
        <>
            <div className='chats-section'>
                <ul className="nav nav-pills mb-3 gap-2" id="pills-tab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true" onClick={() => setCurrentTab("chats")}>Chat</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false" onClick={() => setCurrentTab("attachment")}>Attachments</button>
                    </li>

                </ul>
                <div className="tab-content w-100" id="pills-tabContent">
                    <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                        <div className='mt-3'></div>
                        <div className='chats-content-reciever mb-3 '>
                            <div className='d-flex justify-content-between gap-3 align-items-center'>
                                <div className='reciver-chats'>
                                    <div className='position-absolute' style={{ top: "-10px", left: "16px" }}>
                                        <p className='text-name p-0 '>Adam Nagal</p>
                                    </div>
                                    <div className='position-absolute' style={{ top: "31px", right: "-14px" }}>
                                        <img src={profileChat} alt='' className='profileImg' />
                                    </div>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare in nibh vitae porttitor. Donec mattis velit vel nisi vehicula posuere.</p>
                                </div>


                                {/* <img src={refresh} alt='' className=''/> */}
                                <div className='msg-timing'>
                                    <p>sent</p>
                                    <p>8:01 am</p>
                                </div>
                            </div>
                        </div>

                        <div className='chats-content-reciever  '>
                            <div className='d-flex justify-content-between gap-3 align-items-center'>
                                <div className='reciver-chats'>
                                    <div className='position-absolute' style={{ top: "-10px", left: "16px" }}>
                                        <p className='text-name p-0 '>Adam Nagal</p>
                                    </div>
                                    <div className='position-absolute' style={{ top: "31px", right: "-14px" }}>
                                        <img src={profileChat} alt='' className='profileImg' />
                                    </div>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare in nibh vitae porttitor. Donec mattis velit vel nisi vehicula posuere.</p>
                                </div>


                                {/* <img src={refresh} alt='' className=''/> */}
                                <div className='msg-timing'>
                                    <p>sent</p>
                                    <p>8:01 am</p>
                                </div>
                            </div>
                        </div>

                        <div className='chats-content-sender mt-3'>
                            <div className='d-flex justify-content-between gap-3 align-items-center'>
                                <div className='msg-timing'>
                                    <p>sent</p>
                                    <p>8:01 am</p>
                                </div>

                                <div className='reciver-chats'>
                                    <div className='position-absolute' style={{ top: "-10px", right: "16px" }}>
                                        <p className='text-name p-0 '>You</p>
                                    </div>
                                    <div className='position-absolute' style={{ top: "31px", left: "-14px" }}>
                                        <img src={profileChat} alt='' className='profileImg' />
                                    </div>
                                    <p className='text-right'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ornare in nibh vitae porttitor. Donec mattis velit vel nisi vehicula posuere.</p>
                                </div>
                            </div>
                        </div>


                        <div className='sender-attachments w-100 mt-3'>
                            <div className='d-flex gap-2 justify-content-end '>
                                <img src={deleteImg} className='' alt='' />
                                <img src={attachments} className='' alt='' />
                            </div>
                            <div className='sender d-flex flex-wrap justify-content-end gap-3  mt-3 '>
                                <div >
                                    <div className='attachments-box d-flex  flex-column align-items-center'>
                                        <div className='d-flex pt-3 px-3 justify-content-end w-100'>
                                            <img src={cut} alt='' className='cut' />
                                        </div>
                                        <div className='file-apload'>
                                            <img src={pngFIle} className='' alt="" />
                                        </div>
                                        <h1>Attachment Title</h1>
                                    </div>
                                    <div className='d-flex justify-content-center gap-3 mt-3 mb-2 '>
                                        <img src={edit} alt='' className='' />
                                        <img src={download} alt='' className='' />
                                    </div>

                                </div>

                                <div >
                                    <div className='attachments-box d-flex  flex-column align-items-center'>
                                        <div className='d-flex pt-3 px-3 justify-content-end w-100'>
                                            <img src={cut} alt='' className='cut' />
                                        </div>
                                        <div className='file-apload'>
                                            <img src={svgFile} className='' alt="" />
                                        </div>
                                        <h1>Attachment Title</h1>
                                    </div>
                                    <div className='d-flex justify-content-center gap-3 mt-3 mb-2 '>
                                        <img src={edit} alt='' className='' />
                                        <img src={download} alt='' className='' />
                                    </div>

                                </div>
                            </div>

                            <div className='d-flex gap-2 justify-content-start '>
                                {/* <img src={deleteImg} className='' alt='' /> */}
                                <img src={attachments} className='' alt='' />
                            </div>

                            <div className='reciever d-flex flex-wrap justify-content-start gap-3  mt-3 '>
                                <div>
                                    <div className='attachments-box d-flex  flex-column align-items-center'>
                                        <div className='d-flex pt-3 px-3 justify-content-end w-100'>
                                            <img src={cut} alt='' className='cut' />
                                        </div>
                                        <div className='file-apload'>
                                            <img src={pngFIle} className='' alt="" />
                                        </div>
                                        <h1>Attachment Title</h1>
                                    </div>
                                    <div className='d-flex justify-content-center gap-3 mt-3 mb-2 '>
                                        <img src={download} alt='' className='' />
                                    </div>
                                </div>

                                <div>
                                    <div className='attachments-box d-flex  flex-column align-items-center'>
                                        <div className='d-flex pt-3 px-3 justify-content-end w-100'>
                                            <img src={cut} alt='' className='cut' />
                                        </div>
                                        <div className='file-apload'>
                                            <img src={svgFile} className='' alt="" />
                                        </div>
                                        <h1>Attachment Title</h1>
                                    </div>
                                    <div className='d-flex justify-content-center gap-3 mt-3 mb-2 '>
                                        <img src={download} alt='' className='' />
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">2</div>

                </div>
                {currentTab === "chats" &&
              <>
                <div className='bottom-line' style={{height:"1px", width:"88%", background:"#E2E31F"  }}></div>
                    <div className='w-100' style={{ padding: "0px 29px" ,marginTop:"27px" }}>
                        <div className='chat-buttons'>
                            <input type='text' placeholder='Add a comment...' />
                            <div className='d-flex gap-3 '>
                                <img src={file} className='' alt="" />
                                <img src={message} className='' alt="" />
                            </div>
                        </div>
                    </div>
              </>
                    }
            </div>

        </>
    )
}

export default ChatAndAttachment