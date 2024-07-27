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
        <div>
            {loader && <Loader text="Fetching Data..." />}

            <div className="search_btn_wrapper">
                {/* tab wrapper */}
                <div className="my-3 d-flex justify-content-start align-items-start gap-3">
                    <div className="tab_btn" onClick={() => {
                        setActiveTab("shift");
                    }}
                        style={{
                            backgroundColor:
                                activeTab == "shift" ? "#79080a" : "#D0D3D9",
                        }}
                    >
                        Stock Analysis
                    </div>

                    <div className="tab_btn" onClick={() => { setActiveTab("attendance"); }}
                        style={{ backgroundColor: activeTab == "attendance" ? "#79080a" : "#D0D3D9", }} >
                        Sell Report
                    </div>

                </div>
            </div>
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section">
                        {/* <div className="dashboard_filter">
                            <FontAwesomeIcon icon={faCaretLeft} onClick={() => prevDateHandler()} />
                            <div className="calender_wrapper">
                                <h6>{new Date(FilteredDate)?.toLocaleDateString("hi") === new Date()?.toLocaleDateString("hi") ? "Today" : new Date(FilteredDate)?.toLocaleDateString("hi")}</h6>
                                <DatePicker
                                    id='picker'
                                    onChange={(date) => setFilteredDate(date)}
                                    value={FilteredDate}
                                    maxDate={new Date()}
                                    clearIcon={null}
                                    calendarIcon={null}
                                />
                            </div>
                            {new Date(FilteredDate)?.toLocaleDateString("hi") !== new Date()?.toLocaleDateString("hi") && <FontAwesomeIcon icon={faCaretRight} onClick={() => nextDateHandler()} />}
                        </div> */}
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
        </div >

    );
};

export default Report;
