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
    const [modalStates, setModalStates] = useState({ modal: false, type: "" });
    const [activeTab, setActiveTab] = useState("inhand");
    const [loader, setLoader] = useState(false);
    const [filterValues, setFilterValues] = useState({
        startDate: "",
        endDate: ""
    });
    const [data, setData] = useState([["Category", "Condition Type", "Status", "Brand", "Model"], []]);
    const [pivotState, setPivotState] = useState({});
    const [category, setCategory] = useState("Server"); // Default category
    const [status, setStatus] = useState(""); // Default status
    const [categoryList, setCategoryList] = useState([]);
    const [arrayData, setArrayData] = useState([]);
    const [inwardData, setInwardData] = useState([]);
    const [showData, setShowData] = useState([]);



    const { register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm();

    let categoryId = watch("categoryId");
    async function getStockReport(id, index = null) {
        try {
            const serverResponse = await communication.getStockReport(id);
            if (serverResponse?.data?.status === "SUCCESS") {
                console.log("index", index);

                if (((index !== null) && (index >= 0))) {
                    setArrayData(pre => pre.map((ele, i) => i === index ? { ...ele, data: serverResponse.data.stockArray, pivotState: { rows: ['Category'] } } : ele))
                } else {
                    setData(serverResponse.data.stockArray);
                    setPivotState({ rows: ['Category'] })
                }
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
                setData([])
            }
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
        }
    }


    async function getStockInReport() {
        try {
            const serverResponse = await communication.getStockInReport();
            if (serverResponse?.data?.status === "SUCCESS") {
                setData(serverResponse.data.stockArray.map(ele => ({ ...ele, pivotState: { rows: ['Category'] } })));
                setArrayData(pre => serverResponse.data.stockArray.map((ele, i) => ({ data: ele.stocks, pivotState: { rows: ['Category', "Condition Type"] } })))
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                setData([])
            }

        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
        }
    }

    async function getInwardReport() {
        try {
            const serverResponse = await communication.getInwardReport();
            if (serverResponse?.data?.status === "SUCCESS") {
                setInwardData(serverResponse.data.stockArray.map(ele => ({ ...ele, pivotState: { rows: ['Category'] } })));
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                setInwardData([])
            }

        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
        }
    }

    // useEffect(() => {
    //     const id = getValues("categoryId");
    //     if (id) {
    //         getStockReport(id);
    //     }
    // }, [categoryId]);

    async function initialAPICall() {
        setCategoryList(await getCategory(setLoader, router,));
    }
    useEffect(() => {
        // initialAPICall()
        getStockInReport()
        getInwardReport()
    }, []);

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header" style={{ "marginBottom": "10px", height: "5%" }}>
                <div className="my-3 d-flex justify-content-start align-items-start gap-3">
                    <div className="tab_btn" onClick={() => { setActiveTab("inhand") }}
                        style={{ backgroundColor: activeTab == "inhand" ? "#184965" : "#184965a8", }}>
                        Stock In Hand
                    </div>
                    <div className="tab_btn" onClick={() => { setActiveTab("inward"); }}
                        style={{ backgroundColor: activeTab == "inward" ? "#184965" : "#184965a8", }} >
                        INWARD REPORT
                    </div>
                    <div className="tab_btn" onClick={() => { setActiveTab("outward"); }}
                        style={{ backgroundColor: activeTab == "outward" ? "#184965" : "#184965a8", }} >
                        OUTWARD REPORT
                    </div>
                    <div className="tab_btn" onClick={() => { setActiveTab("assign"); }}
                        style={{ backgroundColor: activeTab == "assign" ? "#184965" : "#184965a8", }} >
                        ENGINEER ASSIGN MATERIAL REPORTF
                    </div>
                </div>
            </div>



            <div className="table_wrapper" style={{ "height": "95%" }} >
                <div className="table_main">
                    <div className="table_section">
                        {activeTab === "inhand" &&
                            <div className="row" style={{
                                display: "flex", alignItems: "center",
                                alignContent: "center"
                            }}>
                                <div className="dropdown">
                                    <h5>Category</h5>
                                    <ul style={{ marginTop: "10px" }}>
                                        {data.map((ele, index) => (
                                            <li key={index} style={{ marginBottom: "10px" }}>
                                                <div>
                                                    <label style={{ textTransform: "uppercase", textDecoration: "underline", cursor: "pointer" }} onClick={() => setShowData(pre => pre.includes(ele.categoryId) ? pre.filter(e => ele.categoryId !== e) : [...pre, ele.categoryId])}>{ele?.category}</label>
                                                    {showData.includes(ele.categoryId) &&
                                                        <PivotTableUI
                                                            data={ele?.stocks ?? []}
                                                            onChange={(s) =>
                                                                setData((pre) =>
                                                                    pre.map((ele, i) => (i === index ? { ...ele, pivotState: s } : ele))
                                                                )
                                                            }
                                                            {...ele?.pivotState ?? {}}
                                                            aggregatorName="Sum"
                                                            vals={["Quantity"]}
                                                            rendererName="Table"
                                                            hiddenAttributes={["rendererName", "aggregatorName"]} // Hides dropdowns
                                                            showColumnTotals={false}
                                                            showRowTotals={false}
                                                        />
                                                      

                                                    }
                                                </div>
                                            </li>

                                        ))}
                                    </ul>
                                </div>

                            </div>
                        }

                        {activeTab === "inward" &&
                            <div className="row" style={{
                                display: "flex", alignItems: "center",
                                alignContent: "center"
                            }}>
                                <div className="dropdown">
                                    <h5>Category</h5>
                                    <ul style={{ marginTop: "10px" }}>
                                        {inwardData.map((ele, index) => (
                                            <li key={index} style={{ marginBottom: "10px" }}>
                                                <div>
                                                    <label style={{ textTransform: "uppercase", textUnderlinePosition: "from-font" }} onClick={() => setShowData(pre => pre.includes(ele.categoryId) ? pre.filter(e => ele.categoryId !== e) : [...pre, ele.categoryId])}>{ele?.category}</label>
                                                    {showData.includes(ele.categoryId) &&
                                                        <PivotTableUI
                                                            data={ele?.stocks ?? []}
                                                            onChange={(s) =>
                                                                setInwardData((pre) =>
                                                                    pre.map((ele, i) => (i === index ? { ...ele, pivotState: s } : ele))
                                                                )
                                                            }
                                                            {...ele?.pivotState ?? {}}
                                                            aggregatorName="Sum"
                                                            vals={["Quantity"]}
                                                            rendererName="Table"
                                                          
                                                            hiddenAttributes={["rendererName", "aggregatorName"]} // Hides dropdowns
                                                            showColumnTotals={false}
                                                            showRowTotals={false}
                                                        />

                                                    }
                                                </div>
                                            </li>

                                        ))}
                                    </ul>
                                </div>

                            </div>
                        }

                        {activeTab === "outward" &&
                            <div className="row" style={{
                                display: "flex", alignItems: "center",
                                alignContent: "center"
                            }}>
                                <div className="dropdown">
                                    <h5>Category</h5>
                                    <ul style={{ marginTop: "10px" }}>
                                        {inwardData.map((ele, index) => (
                                            <li key={index} style={{ marginBottom: "10px" }}>
                                                <div>
                                                    <label style={{ textTransform: "uppercase", textUnderlinePosition: "from-font" }} onClick={() => setShowData(pre => pre.includes(ele.categoryId) ? pre.filter(e => ele.categoryId !== e) : [...pre, ele.categoryId])}>{ele?.category}</label>
                                                    {showData.includes(ele.categoryId) &&
                                                        <PivotTableUI
                                                            data={ele?.stocks ?? []}
                                                            onChange={(s) =>
                                                                setInwardData((pre) =>
                                                                    pre.map((ele, i) => (i === index ? { ...ele, pivotState: s } : ele))
                                                                )
                                                            }
                                                            {...ele?.pivotState ?? {}}
                                                            aggregatorName="Sum"
                                                            vals={["Quantity"]}
                                                            rendererName="Table"
                                                            hiddenAttributes={["rendererName", "aggregatorName"]} // Hides dropdowns
                                                            showColumnTotals={false}
                                                            showRowTotals={false}
                                                        />

                                                    }
                                                </div>
                                            </li>

                                        ))}
                                    </ul>
                                </div>

                            </div>
                        }


                    </div>
                </div>
            </div>
        </>

    );
};

export default Report;
