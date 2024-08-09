'use client'
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight, faCircleUpRight } from "@fortawesome/free-solid-svg-icons";
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

const Report = () => {
    const router = useRouter();
    const [modalStates, setModalStates] = useState({ modal: false, type: "" });
    const [activeTab, setActiveTab] = useState("shift");
    const [loader, setLoader] = useState(false);
    const [filterValues, setFilterValues] = useState({
        startDate: "",
        endDate: ""
    });

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header" style={{ "marginBottom": "10px" }}>
                <div className="my-3 d-flex justify-content-start align-items-start gap-3">
                    <div className="tab_btn" onClick={() => {
                        setActiveTab("shift");
                    }}
                        style={{
                            backgroundColor:
                                activeTab == "shift" ? "#184965" : "#184965a8",
                        }}
                    >
                        Stock Analysis
                    </div>

                    <div className="tab_btn" onClick={() => { setActiveTab("attendance"); }}
                        style={{ backgroundColor: activeTab == "attendance" ? "#184965" : "#184965a8", }} >
                        Sell Report
                    </div>

                </div>
            </div>
            {/* <div className="search_btn_wrapper">
                <div className="my-3 d-flex justify-content-start align-items-start gap-3">
                    <div className="tab_btn" onClick={() => {
                        setActiveTab("shift");
                    }}
                        style={{
                            backgroundColor:
                                activeTab == "shift" ? "#184965" : "#184965a8",
                        }}
                    >
                        Stock Analysis
                    </div>

                    <div className="tab_btn" onClick={() => { setActiveTab("attendance"); }}
                        style={{ backgroundColor: activeTab == "attendance" ? "#184965" : "#184965a8", }} >
                        Sell Report
                    </div>

                </div>
            </div> */}
            <div className="table_wrapper" style={{ "height": "95%" }} >
                <div className="table_main">
                    <div className="table_section">
                        {activeTab === "attendance" &&
                            <>
                                <SellGraph />
                            </>
                        }
                        {activeTab === "shift" &&
                            <div className="shift_graph_wrapper">
                                <StockReportGraph />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>

    );
};

export default Report;
