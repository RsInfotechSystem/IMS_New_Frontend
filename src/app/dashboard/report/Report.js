'use client'
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faCaretLeft, faCaretRight, faCircleUpRight, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import InputBox from "@/common-components/InputBox";
// import UpdateTime from "../../admin/hrm/UpdateTime";
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import CustomDateInput from "@/common-components/CustomDateInput";
import SellGraph from "./SellGraph";
import StockReportGraph from "./StockReportGraph";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import { useRouter } from "next/navigation";
import Loader from "@/common-components/Loader";
import LocationWiseGraph from "./LocationWiseStock";


import { getCategory } from "@/services/commonApis";
import { useForm } from "react-hook-form";
import dynamic from "next/dynamic";

// Load pivot table only on client-side
const PivotTableUI = dynamic(() => import("react-pivottable/PivotTableUI"), {
    ssr: false, // Disables SSR
});
import "react-pivottable/pivottable.css";

const Report = () => {
    const router = useRouter();

    return (
        <>

            <div className="top_header" style={{ "height": "3%" }}></div>
            <div className="table_wrapper" style={{ "height": "97%" }}>
                <div className="table_main">
                    <div className="table_section">
                        <div className="report-grid">
                            {[
                                { title: "STOCK IN HAND", link: "/dashboard/report/inhand-report" },
                                { title: "INWARD REPORT", link: "/dashboard/report/report-details" },
                                { title: "OUTWARD REPORT", link: "/dashboard/report/outward-report" },
                                { title: "ENGINEER ASSIGN MATERIAL REPORT", link: "/dashboard/report/engineer-report" },
                            ].map((report, index) => (
                                <div key={index} className="report-card" onClick={() => router.push(report.link)}>
                                    <h6>{report.title}</h6>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
            <style jsx>{`
                .report-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    width: 60%;
                    max-width: 800px;
                    margin: auto;
                    margin-top: 40px;
                }
                .report-card {
                    background-color: #0d6efd;
                    color: white;
                    font-size: 25px;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 180px;
                    border-radius: 12px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.3s ease-in-out;
                    text-align: center;
                    padding: 10px;
                }
                .report-card:hover {
                    background-color: #0b5ed7;
                    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
                }
            `}</style>

        </>

    );
};

export default Report;
