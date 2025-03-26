"use client";
import logo from "../../../../public/images/rakshabandhan-new.png";
import currencyFormatter from "@/helper/currencyFormatter";
import { formatDate } from "@/helper/formatDate";
import Image from "next/image";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";

const ViewBill = ({ setModalStates, pdfData, toast }) => {
  const printPdfRef = useRef(null);

  // function to download html into pdf format
  // const handleDownloadPdf = () => {
  //     const pdfContent = printPdfRef.current;
  //     // Use html2canvas to capture the content of the DOM element
  //     html2canvas(pdfContent, {
  //         // You can customize options here if needed
  //     })
  //         .then((canvas) => {
  //             // Create a new jsPDF instance
  //             const pdf = new jsPDF({
  //                 unit: "in",
  //                 format: "letter",
  //                 orientation: "portrait",
  //             });
  //             // Calculate the aspect ratio to fit the content on the PDF
  //             const ratio = canvas.width / canvas.height;
  //             const width = 8.5; // Letter size width in inches
  //             const height = width / ratio;
  //             // Add the captured canvas to the PDF
  //             pdf.addImage(
  //                 canvas.toDataURL("image/jpeg", 1.0),
  //                 "JPEG",
  //                 0,
  //                 0,
  //                 width,
  //                 height
  //             );
  //             // Save the PDF
  //             pdf.save("quotation.pdf");
  //             toast.success("PDF downloaded Successfully!");
  //             setModelStates((prev) => ({ ...prev, viewPdf: false }));
  //         })
  //         .catch((error) => {
  //             toast.error("Error while downloading PDF:", error);
  //         });
  // };
  // function for print html document
  const handlePrint = useReactToPrint({
    content: () => printPdfRef.current,
  });

  return (
    <div className="form_modal_wrapper z-3 fade_animation">
      <div className="form_modal bg-white" style={{ width: "60%" }}>
        <div className="form_modal_header">
          <div className="">
            <button className="btn btn-success fw-medium mx-1" onClick={handlePrint}>
              Print
            </button>
          </div>
          <div
            className="px-2 cursor_pointer"
            title="close"
            onClick={() => {
              setModalStates((prev) => ({ ...prev, viewPdf: false }));
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z"
                stroke="#198754"
                stroke-width="2.5"
              />
              <path
                d="M21.75 14.25L14.25 21.75M14.25 14.25L21.75 21.75"
                stroke="#198754"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>
        <div className="kitchen_req_pdf_main p-4" ref={printPdfRef}>
          <div className="pdf_header_wrapper">
            <div className="logo_div">
              <Image src={logo} width={80} height={60} alt="ohno logo" />
            </div>
            <div className="header_details">
              <h5>Anand Computer Systems</h5>
              <h6>Swamipuram,Building- 2160/B Sadashiv Peth, Pune 411030</h6>
            </div>
          </div>

          <div className="heading_div">
            <p>{formatDate(pdfData?.createdAt)}</p>
            <h2>Invoice</h2>
          </div>

          <div className="req_details">
            <div className="left_details">
              <h4>Customer Name : {pdfData?.name}</h4>
              <h4>Sell Type : {pdfData?.type}</h4>
            </div>
            <div className="right_details">
              <h4>#{pdfData?.orderId}</h4>
            </div>
          </div>

          <div className="req_table_main">
            <div className="table_main_heading">
              <h3>Product List</h3>
            </div>
            <div className="table_head">
              <div className=" data_col col_10p">
                <h5>Sr. No.</h5>
              </div>
              <div className=" data_col col_35p">
                <h5>Item</h5>
              </div>
              <div className=" data_col col_25p">
                <h5>Rate</h5>
              </div>
              <div className=" data_col col_25p">
                <h5>QTY</h5>
              </div>
              <div className=" data_col col_25p">
                <h5>Amount</h5>
              </div>
            </div>

            {pdfData?.item?.map((data, index) => {
              return (
                <div key={index} className="table_data">
                  <div className=" data_col col_10p">
                    <h6>{index + 1}</h6>
                  </div>
                  <div className=" data_col col_35p">
                    <h6>{data?.description}</h6>
                  </div>
                  <div className=" data_col col_25p">
                    <h6>{data?.price}</h6>
                  </div>
                  <div className=" data_col col_25p">
                    <h6>{data?.quantity}</h6>
                  </div>
                  <div className=" data_col col_25p">
                    <h6>{currencyFormatter(data?.amount)}</h6>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="req_table_main">
            <div className="table_data">
              <div className=" data_col top_border col_25p">
                <div>
                  <h6>Paid Amount </h6>
                  <h6>₹{pdfData?.paidAmount ?? pdfData?.totalAmount}</h6>
                </div>
              </div>
              <div className=" data_col top_border col_25p">
                <div>
                  <h6>Remaining Amount</h6>
                  <h6>{pdfData?.reamainingAmount ?? "--"}</h6>
                </div>
              </div>
              {/* <div className=" data_col top_border col_25p">
                                <div>
                                    <h6>Discount</h6>
                                    <h6>{pdfData?.discount}%</h6>
                                </div>
                            </div> */}
              <div className=" data_col top_border col_50p">
                <div>
                  <h6>Final Amount</h6>
                  <h6>{currencyFormatter(pdfData?.totalAmount)}</h6>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="note_wrapper">
                        <h6>Note: </h6>
                        <p className="text-secondary fw-normal">{pdfData?.note}</p>
                    </div> */}

          <div className="row">
            <div className="customer_sign mt-auto col-6">
              <p>(Customer sign)</p>
            </div>
            <div className="authorized_wrapper mt-auto col-6">
              <p>(Authorized by)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBill;
