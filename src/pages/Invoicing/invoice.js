import React, { useEffect, useState, useRef } from "react";
import { AddIcon, DeleteIcon, Print } from "../../assets/svg";
import { Bars } from "react-loader-spinner";
import { deleteInvoices } from "../../services/auth";
import { toast } from "react-toastify";
import InvoicePopup from "./invoicePopup";

function Invoice() {
  const [isChecked, setIsChecked] = useState({});
  const [data, setData] = useState(null);
  const [pageUrls, setPageUrls] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addInvoice, setAddInvoice] = useState(false);
  const invoiceRef = useRef(null);

  const authToken = localStorage.getItem("authToken");

  const toggleCheckbox = (id) => {
    setIsChecked((prevCheckboxes) => ({
      ...prevCheckboxes,
      [id]: !prevCheckboxes[id],
    }));
  };
  
  const handleNextPage = (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (url) => {
    const pageNumber = parseInt(url.match(/page=(\d+)/)[1]);
    setCurrentPage(pageNumber)
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page) => {
    setLoading(true)
    try {
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };
      const response = await fetch(
        `${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/invoices?page=${page}`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      setData(jsonData.data);
      setTotalPages(jsonData.last_page)
      setPageUrls(jsonData.links.slice(1, -1))
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const downloadPdf = async (invoiceId) => {
    try {
      setLoading(true);
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };
      const response = await fetch(
        `${process.env.REACT_APP_USER_API_CLOUD_ENDPOINT}/invoice-pdf/${invoiceId}`,
        requestOptions
      );
      if (!response.ok) {
        setLoading(false);
        throw new Error("Failed to download PDF");
      }
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error downloading PDF:", error);
    }
  };

  const tableBorderBottom = {
    borderBottom: "1px solid rgb(226, 227, 31, 0.15)",
  };
  const tableActive = {
    boxShadow: "8px 0px 8px 0px rgba(0, 0, 0, 0.3)",
    background: "#353535",
    borderBottom: "1px solid transparent",
  };

  const selectedCount = Object.values(isChecked).filter(
    (value) => value
  ).length;

  const selectedIds = Object.keys(isChecked)
    .filter((key) => isChecked[key])
    .map((key) => parseInt(key.replace("select_", "")));

  const handleDeleteInvoices = async () => {
    try {
      setLoading(true);
      let response = await deleteInvoices({
        ids: selectedIds,
      });
      if (response.res) {
        console.log("invoice delete successful", response);

        toast.success(`${response.res.deletedCount} ${response.res.message}`, {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        console.error("invoice delete failed:", response.error);
        toast.error(`${response.error.message}`, {
          position: window.innerWidth < 992 ? 'bottom-center' : 'top-center',
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
      fetchData();
      const updatedIsChecked = { ...isChecked };
      selectedIds.forEach((id) => {
        const key = `select_${id}`;
        if (updatedIsChecked.hasOwnProperty(key)) {
          updatedIsChecked[key] = false;
        }
      });
      setIsChecked(updatedIsChecked);
    }
  };

  const handleInvoiceUpload = (e) => {
    const [{ type }] = e.target.files;
    console.log("file",type)
    if(type !== "application/pdf"){
      toast.error("Please select a PDF file for upload.")
      invoiceRef.current = null;
      return;
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
      {addInvoice && 
        <InvoicePopup handleClose={() => { setAddInvoice(false);}}/>
      }
      <div className="DashboardTopMenu">
        <div className="DashboardHeading d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div className="d-flex justify-content-start align-items-center gap-3 flex-wrap">
            <h2>Invoicing</h2>
            {Object.keys(isChecked).length > 0 &&
              Object.values(isChecked).some((value) => value === true) && (
                <div
                  className="invoiceDeleteDiv"
                  onClick={handleDeleteInvoices}
                >
                  <div className="iconBox">
                    <DeleteIcon />
                  </div>
                  <p>Delete {selectedCount} Item(s)</p>
                </div>
              )}
          </div>
          <div className="add-invoice">
            <span>Add Invoice</span>
            <div
              className="addIcon"
              onClick={() => {
                // if (invoiceRef.current) invoiceRef.current.click();
                setAddInvoice(true)
              }}
            >
              <AddIcon />
            </div>
            <input
              type="file"
              accept="application/pdf"
              name="invoice"
              ref={invoiceRef}
              className="d-none"
              onChange={handleInvoiceUpload}
            />
          </div>
        </div>
        <div className="pagination-container">
          <div
            className="table-responsive table_outer_div  "
            style={{ marginTop: "37px" }}
          >
            <table className="table table-borderless text-light">
              <tbody>
                {data &&
                  data.map((item) => (
                    <tr
                      key={item.id}
                      style={
                        isChecked[`select_${item.id}`]
                          ? tableActive
                          : tableBorderBottom
                      }
                    >
                      <th scope="row">
                        <label htmlFor={`select_${item.id}`}>
                          <input
                            type="checkbox"
                            checked={isChecked[`select_${item.id}`]}
                            onChange={() => toggleCheckbox(`select_${item.id}`)}
                            id={`select_${item.id}`}
                            style={{ display: "none" }}
                          />
                          {isChecked[`select_${item.id}`] ? (
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
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                          onClick={() => toggleCheckbox(`select_${item.id}`)}
                        >
                          {`INV-${String(item.id).padStart(4, "0")}`}
                        </span>
                      </th>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end">
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              lineHeight: "1.1",
                              cursor: "pointer",
                            }}
                            onClick={() => downloadPdf(item.id)}
                          >
                            View
                          </div>
                          <div
                            className="IconBox"
                            style={{ minWidth: "40px", cursor: "pointer" }}
                            onClick={() => downloadPdf(item.id)}
                          >
                            <Print />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="paginationDiv">
            <div className="paginationSections">
              <div className="btnDiv">
                <button className="prevBtn" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                <button className="prevBtn mobile" onClick={handlePrevPage} disabled={currentPage === 1}>{'<'}</button>
              </div>
              <div className="pageNoDiv">
                {pageUrls && currentPage >= 4 &&
                  <button disabled className='pageBtn pageDots' >...</button>
                }
                {pageUrls && pageUrls.filter((item, index) => Math.abs(index - currentPage + 1) <= (currentPage < 3 ? 3 : currentPage > pageUrls.length - 2 ? 3 : 2)).map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(link.url)}
                    className={`${link.active && 'activePageBtn'} pageBtn`}
                  >
                      {link.label}
                  </button>
                ))}
                {pageUrls && currentPage <= pageUrls.length - 3 &&
                  <button disabled className='pageBtn pageDots' >...</button>
                }
              </div>
              <div className="btnDiv">
                <button className="nextBtn" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                <button className="nextBtn mobile" onClick={handleNextPage} disabled={currentPage === totalPages}>{'>'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Invoice;
