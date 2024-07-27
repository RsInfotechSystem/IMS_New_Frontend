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
import AttendanceGraph from "./AttendanceGraph";
import ShiftGraph from "./ShiftGraph";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import { useRouter } from "next/navigation";
import Loader from "@/common-components/Loader";

const Report = () => {
    const router = useRouter();
    const [modalStates, setModalStates] = useState({ modal: false, type: "" });
    const [activeTab, setActiveTab] = useState("attendance");
    const [loader, setLoader] = useState(false);
    const [cardCounts, setCardCounts] = useState({});
    const [filterValues, setFilterValues] = useState({
        startDate: "",
        endDate: ""
    });


    //get employee counts on initial load
    // const fetchEmployeeCount = async () => {
    //     try {
    //         setLoader(true);
    //         const serverResponse = await communication.getEmployeeCounts();
    //         if (serverResponse?.data?.status === "SUCCESS") {
    //             setLoader(false);
    //             setCardCounts(serverResponse?.data);
    //         } else if (serverResponse?.data?.status === "JWT_INVALID") {
    //             toast.info(serverResponse?.data?.message);
    //             router.push("/");
    //         } else {
    //             setLoader(false);
    //             setCardCounts({})
    //         }
    //     } catch (error) {
    //         setLoader(false);
    //         toast.error(error?.message);
    //     }
    // }

    // useEffect(() => {
    //     fetchEmployeeCount();
    // }, []);

    return (
        <div>
            {loader && <Loader text="Fetching Data..." />}
           
            <div className="search_btn_wrapper">
                {/* tab wrapper */}
                <div className="my-3 d-flex justify-content-start align-items-start gap-3">
                    <div className="tab_btn" onClick={() => { setActiveTab("attendance"); }}
                        style={{ backgroundColor: activeTab == "attendance" ? "#184965" : "#D0D3D9", }} >
                        Sell History
                    </div>
                    <div className="tab_btn" onClick={() => {
                        setActiveTab("shift");
                    }}
                        style={{
                            backgroundColor:
                                activeTab == "shift" ? "#184965" : "#D0D3D9",
                        }}
                    >
                        Stock Analysis
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
                            <AttendanceGraph />
                                {/* <div className="dashboard_filter_wrapper">
                                    <div>
                                        <label>Start Date</label>
                                        <CustomDateInput value={filterValues?.startDate} onChange={(date) => { setFilterValues((prev) => ({ ...prev, startDate: date })) }} />
                                    </div>
                                    <div>
                                        <label>End Date</label>
                                        <CustomDateInput value={filterValues?.endDate} onChange={(date) => { setFilterValues((prev) => ({ ...prev, endDate: date })) }} />
                                    </div>
                                </div>

                                <div className="attendance_graph_wrapper">
                                    <div>
                                        <AttendanceGraph filterValues={filterValues} />
                                    </div>
                                </div> */}
                            </>
                        }
                        {activeTab === "shift" &&
                            <div className="shift_graph_wrapper">
                                <ShiftGraph />
                            </div>
                        }
                    </div>
                </div>
            </div>
            {/* {modalStates?.modal && <UpdateTime data={{ modalStates, setModalStates }} />} */}
        </div >

    );
};

export default Report;
