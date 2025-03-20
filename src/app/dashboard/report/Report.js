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
    const [activeTab, setActiveTab] = useState("shift");
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


    useEffect(() => {
        const id = getValues("categoryId");
        if (id) {
            getStockReport(id);
        }
    }, [categoryId]);

    async function initialAPICall() {
        setCategoryList(await getCategory(setLoader, router,));
    }
    useEffect(() => {
        initialAPICall()
    }, []);

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header" style={{ "marginBottom": "10px", height: "2%" }}>

            </div>

            <div className="table_wrapper" style={{ "height": "98%" }} >
                <div className="table_main">
                    <div className="table_section">
                        <div className="row" style={{
                            display: "flex", alignItems: "center",
                            alignContent: "center"
                        }}>

                            <div className="input_wrapper col-lg-4">
                                <label>Category*</label>
                                <div className="position-relative">
                                    <select
                                        name="categoryId"
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                        {...register("categoryId", {
                                            required: "Category is required",
                                        })}
                                    >
                                        <option value="" className="text-secondary text-lowercase">
                                            Select Category
                                        </option>
                                        {categoryList?.map((ele, index) => {
                                            return (
                                                <option className="small text-capitalize" value={ele._id} key={index}>
                                                    {" "}
                                                    {ele.name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                    </div>
                                </div>
                                <div style={{ height: "5px" }}>
                                    {errors.categoryId && (
                                        <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                                            {errors.categoryId.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <label></label>
                                <FontAwesomeIcon icon={faPlus} size="2x" title="Add" style={{ cursor: "pointer" }} onClick={() => setArrayData(pre => [...pre, { categoryId: "", pivotState: {}, data: [["Category", "Condition Type", "Status", "Brand", "Model"], []] }])} />
                            </div>

                            <PivotTableUI data={data} onChange={(s) => setPivotState(s)} {...pivotState}
                                aggregatorName="Sum"
                                vals={["Quantity"]}
                                rendererName="Table"
                                showColumnTotals={false}
                                showRowTotals={false}
                            />
                            <hr style={{ marginTop: "10px", height: "4px", backgroundColor: "#0d6efd", boxShadow: "0 0 10p #0d6efd", border: "none" }}></hr>
                        </div>
                        {arrayData?.map((ele, index) => (
                            <div className="row" style={{
                                display: "flex", alignItems: "center",
                                alignContent: "center",
                                marginTop: "20px"
                            }} key={index}>

                                <div className="input_wrapper col-lg-4">
                                    <label>Category*</label>
                                    <div className="position-relative">
                                        <select
                                            name="categoryId"
                                            className="form-control custom_input"
                                            style={{ width: "100%" }}
                                            onChange={e => getStockReport(e.target.value, index)}
                                        >
                                            <option value="" className="text-secondary text-lowercase">
                                                Select Category
                                            </option>
                                            {categoryList.map((category, index) => {
                                                return (
                                                    <option className="small text-capitalize" value={category._id} key={index}>
                                                        {" "}
                                                        {category.name}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <div className="select_box_arrow">
                                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <label></label>
                                    <FontAwesomeIcon icon={faPlus} title="Add" style={{ cursor: "pointer" }} size="2x" onClick={() => setArrayData(pre => [...pre, { categoryId: "", pivotState: {}, data: [["Category", "Condition Type", "Status", "Brand", "Model"], []] }])} />
                                    <FontAwesomeIcon title="Remove Table" style={{ marginLeft: "10px", cursor: "pointer" }} icon={faTrash} size="2x" onClick={() => setArrayData(pre => pre.filter((e, i) => i !== index))} />
                                </div>

                                <PivotTableUI data={ele?.data ?? []} onChange={(s) => setArrayData(pre => pre.map((ele, i) => i === index ? { ...ele, pivotState: s } : ele))} {...ele?.pivotState ?? {}}
                                    aggregatorName="Sum"
                                    vals={["Quantity"]}
                                    rendererName="Table"
                                    showColumnTotals={false}
                                    showRowTotals={false}
                                />
                                <hr style={{ marginTop: "10px", height: "4px", backgroundColor: "#0d6efd", boxShadow: "0 0 10p #0d6efd", border: "none" }}></hr>
                            </div>

                        ))
                        }

                    </div>
                </div>
            </div>
        </>

    );
};

export default Report;
