"use client";
import logo from "../../../../../public/images/anand.png";
import { formatDate } from "@/helper/formatDate";
import Image from "next/image";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";

const CreateRepairPdf = ({ setModalStates, pdfData, toast }) => {
    const printPdfRef = useRef(null);


    // function for print html document
    const handlePrint = useReactToPrint({
        content: () => printPdfRef.current,
    });

    return (
        <div className="form_modal_wrapper z-3 fade_animation">
            <div className="form_modal bg-white" style={{ width: "60%" }}>
                <div className="form_modal_header">
                    <div className="">
                        <button className="custom_button" onClick={handlePrint}>
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
                                stroke="#184965"
                                stroke-width="2.5"
                            />
                            <path
                                d="M21.75 14.25L14.25 21.75M14.25 14.25L21.75 21.75"
                                stroke="#184965"
                                stroke-width="2.5"
                                stroke-linecap="round"
                            />
                        </svg>
                    </div>
                </div>
                <div className="kitchen_req_pdf_main p-4" ref={printPdfRef}>
                    <div className="pdf_header_wrapper">
                        <div className="logo_div">
                            <Image src={logo} width={80} height={60} alt="ims logo" />
                        </div>
                        <div className="header_details">
                            <h5>Aanand Computers</h5>
                            <h6>30/B Saurabh Nagar, Besa road, Ghogali, Nagpur 440034.</h6>
                        </div>
                    </div>
                    {/* <div>
                        <h6>Ticket No:{pdfData?.serviceTicketNo}</h6>
                        <h6>Support No:{pdfData?.supportNo}</h6>
                    </div> */}
                    <div className="heading_div">
                        <p>{formatDate(pdfData?.createdAt)}</p>
                        <h2>Repair Order</h2>
                    </div>

                    <div className="req_details">
                        <div className="left_details">
                            <h4>Customer Name : {pdfData?.clientName}</h4>
                            <h4>Customer Number : {pdfData?.clientNo}</h4>
                            <h4>Customer MailId : {pdfData?.clientMailId}</h4>
                            <h4>Order Location :{pdfData?.clientAddress}</h4>
                            <h4>Order Remark :{pdfData?.initialRemark}</h4>
                            <h4>Order Check By :{pdfData?.initialCheckedBy}</h4>
                        </div>
                        <div className="right_details">
                            <h4>#{pdfData?.serviceTicketNo}</h4>
                        </div>
                    </div>

                    <div className="req_table_main">
                        <div className="table_main_heading">
                            <h3>Item List</h3>
                        </div>
                        <div className="table_head">
                            <div className=" data_col col_10p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className=" data_col col_25p">
                                <h5>Serial Tag</h5>
                            </div>
                            <div className=" data_col col_25p">
                                <h5>Category</h5>
                            </div>
                            <div className=" data_col col_35p">
                                <h5>Item Description</h5>
                            </div>
                            <div className=" data_col col_25p">
                                <h5>Action Taken</h5>
                            </div>
                        </div>

                        {pdfData?.repairMaterials?.map((data, index) => {
                            return (
                                <div key={index} className="table_data">
                                    <div className=" data_col col_10p">
                                        <h6>{index + 1}</h6>
                                    </div>
                                    <div className=" data_col col_25p">
                                        <h6>{data?.serialTag}</h6>
                                    </div>
                                    <div className=" data_col col_25p">
                                        <h6>{data?.category}</h6>
                                    </div>
                                    <div className=" data_col col_35p">
                                        <h6>{data?.itemDescriptionNproblemObserved}</h6>
                                    </div>
                                    <div className=" data_col col_25p">
                                        <h6>{data?.remark}</h6>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* <div className="req_table_main">
                        <div className="table_data">
                            <div className=" data_col top_border col_50p">
                                <div>
                                    <h6>Remark</h6>
                                    <h6>{pdfData?.remark}</h6>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {/* <div className="req_table_main">
            <div className="table_data">
              <div className=" data_col top_border col_35p">
                <div>
                  <h6>Remark</h6>
                  <h6>{pdfData?.remark}</h6>
                </div>
              </div>
            </div>
          </div> */}

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

export default CreateRepairPdf;
