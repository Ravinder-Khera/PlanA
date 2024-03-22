import React, { useState } from 'react'
import { User } from '../../assets/svg'
import InvoicePopup from './invoicePopup';

function Invoice() {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const [isChecked, setIsChecked] = useState(null);

  const toggleCheckbox = (check) => {
      setIsChecked(check);
  };

    const handleOpenPopup = () => {
        setPopupOpen(true);
    };
    const handleClosePopup = () => {
      setPopupOpen(false);
  };

  const tableStyleStart = {
    borderBottom: '1px solid rgb(226, 227, 31, 0.15)',
    borderTop: 'none',
    borderLeft: 'none'
  }
  const tableStyle = {
    border: '1px solid rgb(226, 227, 31, 0.15)',
    borderTop: 'none'
  }
  const tableStyleEnd = {
    borderBottom: '1px solid rgb(226, 227, 31, 0.15)',
    borderTop: 'none',
    borderRight: 'none'
  }

  return (<>
  <div className='DashboardTopMenu'>
    <div className='DashboardHeading'>
      <h2>Invoicing</h2>
    </div>
  </div>
  <div className='container-fluid'>

    <div className="table-responsive table_outer_div  ">
      <table className="table table-borderless text-light">
        {/* <thead>
          <tr className='tableBgLines'>
            <th
              scope="col"
              style={{ minWidth: "192px", maxWidth: "200px" }}
            >
              Invoice No.
            </th>
            <th scope="col" style={{ minWidth: "150px" }}>
              Status
            </th>
            <th scope="col" style={{ minWidth: "150px" }}>
              Due Date
            </th>
            <th scope="col" className="text-start ">
              Comment
            </th>
            <th scope="col" className="text-end">
              <div className="lastCell">
                <div>Contact Details</div>{" "}
                <div className="IconBox">
                  <User />
                </div>
              </div>
            </th>
          </tr>
        </thead> */}
        <tbody>
          <tr>
            <th scope="row" style={tableStyleStart}>
              <label htmlFor="select_1">
                <input
                  type="checkbox"
                  checked={isChecked === 'select_1' ? true : false}
                  onChange={() => toggleCheckbox('select_1')}
                  id="select_1"
                  style={{ display: "none" }}
                />
                {isChecked === 'select_1' ? (
                  <div className="svg-box-2 mx-2">
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
                  <div className="svg-box mx-2"></div>
                )}
              </label>
              <span className="checkMark"></span>{" "}
              <span style={{ fontSize: "16px", fontWeight: "600", cursor: 'pointer' }} onClick={handleOpenPopup}>
                ONV001
              </span>
            </th>
            <td className="text-end"  style={tableStyleEnd}>
              <div className="d-flex align-items-center justify-content-end" style={{cursor:'pointer'}} onClick={handleOpenPopup}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    lineHeight: "1.1",
                  }}
                >
                  View
                </div>
                <div className="IconBox" style={{ minWidth: "40px" }}>
                  <User />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th scope="row" style={tableStyleStart}>
              <label htmlFor="select_2">
                <input
                  type="checkbox"
                  checked={isChecked === 'select_2' ? true : false}
                  onChange={() => toggleCheckbox('select_2')}
                  id="select_2"
                  style={{ display: "none" }}
                />
                {isChecked === 'select_2' ? (
                  <div className="svg-box-2 mx-2">
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
                  <div className="svg-box mx-2"></div>
                )}
              </label>
              <span className="checkMark"></span>{" "}
              <span style={{ fontSize: "16px", fontWeight: "600", cursor: 'pointer' }} onClick={handleOpenPopup}>
                ONV001
              </span>
            </th>
            <td className="text-end" style={tableStyleEnd}>
              <div className="d-flex align-items-center justify-content-end" style={{cursor:'pointer'}} onClick={handleOpenPopup}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    lineHeight: "1.1",
                  }}
                >
                  View
                </div>
                <div className="IconBox" style={{ minWidth: "40px" }}>
                  <User />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div className='invoicePopupContent'>
      <InvoicePopup isOpen={isPopupOpen} onClose={handleClosePopup} >
          This is A popUp
      </InvoicePopup>
    </div>
  </div>
  </>)
}

export default Invoice