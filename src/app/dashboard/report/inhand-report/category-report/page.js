"use client"
import Loader from '@/common-components/Loader';
import { communication } from '@/services/communication';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import dynamic from "next/dynamic";
const PivotTableUI = dynamic(() => import("react-pivottable/PivotTableUI"), {
    ssr: false, // Disables SSR
});
import "react-pivottable/pivottable.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import InputBox from '@/common-components/InputBox';
import CustomBtn from '@/common-components/CustomBtn';

const page = () => {
    const router = useRouter();
    const [loader, setLoader] = useState(false);
    const [arrayData, setArrayData] = useState([]);
    const param = useSearchParams();


    async function getStockReport() {
        try {
            setLoader(true);
            const serverResponse = await communication.getStockReport(param.get("categoryId"));
            if (serverResponse?.data?.status === "SUCCESS") {
                // setArrayData(pre => pre.map((ele, i) => i === index ? { ...ele, data: serverResponse.data.stockArray, pivotState: { rows: ['Category'] } } : ele))
                setArrayData([{ data: serverResponse.data.stockArray, pivotState: { rows: ['Category'] } }])
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
                setArrayData([])
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }

    useEffect(() => {
        getStockReport();
    }, [])
    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header" style={{ "marginBottom": "10px", height: "3%" }}>
                <div className="tab_title">Stock In Hand Report</div>

                <div className="buttons_wrapper">
                    <CustomBtn name={"Back"} onClick={() => { router.push("/dashboard/report/inhand-report"); }} />
                </div>
            </div>
            <div className="table_wrapper" style={{ "height": "97%" }} >
                <div className='table_main'>
                    <div className='table_section'>
                        {arrayData.map((ele, index) => (
                            <div className="row" style={{
                                display: "flex", alignItems: "center",
                                alignContent: "center", marginBottom: "20px",
                            }} key={index}>
                                <div className="col-lg-3">
                                    <label onClick={() => { router.push("/dashboard/report/inhand-report"); }}>{"Category"}</label>
                                    <InputBox value={param?.get("category")?.toUpperCase() ?? ""} />
                                </div>
                                <div className="col-lg-4">
                                    <label></label>
                                    <FontAwesomeIcon icon={faPlus} title="Add" style={{ cursor: "pointer", marginLeft: "10px" }} size="2x" onClick={() => setArrayData(pre => [...pre, { categoryId: "", pivotState: { rows: ['Category'] }, data: pre[0].data }])} />
                                    {index !== 0 && <FontAwesomeIcon title="Remove Table" style={{ marginLeft: "10px", cursor: "pointer" }} icon={faTrash} size="2x" onClick={() => setArrayData(pre => pre.filter((e, i) => i !== index))} />}
                                </div>

                                <PivotTableUI
                                    data={ele?.data ?? []}
                                    onChange={(s) =>
                                        setArrayData((pre) =>
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
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </>
    )
}

export default page
