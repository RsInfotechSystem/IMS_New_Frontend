"use client";

import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import React, { useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import { toast } from "react-toastify";
import filterIcon from "../../../../public/images/filter.png";
import { getCookie, getCookies } from "cookies-next";
// import ReturnMaterial from "./ReturnMaterial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faClipboardCheck, faFilter, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBtn from "@/common-components/CustomBtn";
import StockFilter from "@/common-components/StockFilter";
import { getCookiesData } from "@/utilities/getCookiesData";
import { stockStatus } from "@/helper/stockStatusArray";
import Button from "@/common-components/Button";
import InputBox from "@/common-components/InputBox";
import { stockRepairStatus } from "@/helper/repairStockStatus";
import { useForm } from "react-hook-form";
import InputBoxOnChange from "@/common-components/InputBoxOnChange";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const RepairTask = () => {
    const [respondHandlerModalState, setRespondHandlerModalState] = useState({
        state: false,
        deleteId: "",
    });
    const [respondHandlerActiveModalState, setRespondHandlerActiveModalState] = useState({
        action: "disable",
        state: false,
        userId: "",
    });
    const [filter, setFilter] = useState({});
    const [page, setPage] = useState(1);
    const router = useRouter();
    const [TechnicianList, setTechnicianList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [material, setMaterial] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [searchString, setSearchString] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [pageCount, setPageCount] = useState(1);
    const [roleName, setRoleName] = useState("");
    const [rowData, setRowData] = useState(
        material.map(() => ({
            status: "",
            stockRequired: "",
            remark: "",
        }))
    );
    const [modalStates, setModalStates] = useState({
        deleteTasks: false,
        modal: false,
        type: "",
        id: "",
    });


    async function RepairMaterialAssignedToTechList() {
        try {
            setLoader(true);
            const serverResponse = await communication.repairMaterialAssignedToTechList();
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data?.materials);
                // toast.success(serverResponse.data.message);
                setPageCount(serverResponse?.data?.totalPages);
                setPage(page);
            } else if (serverResponse?.data?.status === "FAILED") {
                // toast.info(serverResponse.data.message);
                setMaterial([]);
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
                setLoader(false);
            } else {
                // toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }
    const handleChange = (e, index) => {
        const { name, value } = e.target;
        console.log(e.target, "e.target");

        setRowData(prevData => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: value };
            return newData;
        });
    };

    const technicianRepairRemark = async (index) => {
        try {
            setLoader(true);
            const payload = {
                materiald: material[index]._id,
                status: rowData[index].status,
                stockRequired: rowData[index].stockRequired,
                remark: rowData[index].remark
            };
            console.log(payload, "payload");

            let response = await communication.technicianRepairRemark(payload);
            if (response?.data?.status === "SUCCESS") {
                toast.success(response?.data?.message);
                router.push("/dashboard/repair-assigned");
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message);
                router.push("/");
            } else {
                toast.info(response.data.message);
            }
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
        } finally {
            setLoader(false);
        }
    }



    useEffect(() => {
        RepairMaterialAssignedToTechList({ page: currentPage, searchString, });
    }, [isPageUpdated]);
    return (
        <>
            {modalStates.deleteTasks && (
                <CustomResponseHandlerModal
                    status="warning"
                    message={`Do you want to delete this task?`}
                    successHandler={() => {
                        handleDeleteMaterial(modalStates?.jobNo);
                    }}
                    cancelHandler={() => {
                        setModalStates((prev) => ({ ...prev, deleteTasks: false, jobNo: "" }));
                    }}
                />
            )}

            {loader && <Loader text="Fetching Data..." />}

            <div className="top_header">
                <div className="tab_title">Task Assigned</div>

                <Pagination
                    isPageUpdated={isPageUpdated}
                    setIsPageUpdated={setIsPageUpdated}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                />
            </div>
            <div className="table_wrapper">
                {console.log(rowData, "rowData")}

                <div className="table_main">
                    <div className="table_section inventory_table_res">
                        <div className="table_header">
                            <div className="col_20p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_25p">
                                <h5>Serial Tag</h5>
                            </div>
                            <div className="col_25p">
                                <h5>Category</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Description</h5>
                            </div>
                            <div className="col_50p">
                                <h5 className="text-center">Status</h5>
                            </div>
                            <div className="col_50p">
                                <h5 className="text-center">Stock Required</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Remark</h5>
                            </div>
                            <div className="col_20p text-center">
                                <h5>Action</h5>
                            </div>
                        </div>
                        {material?.length > 0 ? (
                            <>
                                {material?.map((stockDetails, index) => (
                                    <div className="table_data" key={index}>
                                        <div className="col_20p">
                                            <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                        </div>
                                        <div className="col_25p">
                                            <h6>{stockDetails?.serialTag}</h6>
                                        </div>
                                        <div className="col_25p">
                                            <h6>{stockDetails?.category}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.itemDescriptionNproblemObserved}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <div className="position-relative">
                                                <select
                                                    name="status"
                                                    value={rowData[index]?.status}
                                                    onChange={(e) => handleChange(e, index)}
                                                    className="form-control custom_input"
                                                    style={{ width: "100%" }}
                                                >
                                                    <option value="" className="text-secondary text-lowercase">
                                                        Select Status
                                                    </option>
                                                    {stockRepairStatus?.map((ele, index) => {
                                                        return (
                                                            <option value={ele} key={index}>
                                                                {ele}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <div className="select_box_arrow">
                                                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col_50p">
                                            <div className="check_box me-1" style={{ gap: "0" }}>
                                                <input
                                                    name="stockRequired"
                                                    value="Yes"
                                                    checked={rowData[index]?.stockRequired === "Yes"}
                                                    onChange={(e) => handleChange(e, index)}
                                                    className="form-check-input"
                                                    type="radio"
                                                />
                                                <label
                                                >
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="check_box me-1" style={{ gap: "0" }}>
                                                <input
                                                    name="stockRequired"
                                                    value="No"
                                                    checked={rowData[index]?.stockRequired === "No"}
                                                    onChange={(e) => handleChange(e, index)}
                                                    className="form-check-input"
                                                    type="radio"
                                                />
                                                <label
                                                >No</label>
                                            </div>
                                        </div>
                                        <div className="col_50p">

                                            <div className="custom_input_wrapper">
                                                <input
                                                    type="text"
                                                    name="remark"
                                                    value={rowData[index]?.remark}
                                                    onChange={(e) => handleChange(e, index)}
                                                    className="form_control_assign custom_input"
                                                    style={{ width: "100%" }}
                                                />

                                            </div>
                                            {/* <InputBoxOnChange
                                                name="remark"
                                                value={rowData[index]?.remark}
                                                onChange={(e) => handleChange(e, index)}
                                            /> */}
                                        </div>
                                        <div className="col_20p d-flex justify-content-center align-items-center">
                                            <Button name={"Save"} type="button" className="" onClick={() => technicianRepairRemark(index)} >
                                            </Button>
                                        </div>

                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="no_data">Data Not Available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* <div className="pagination_wrapper">
        
      </div> */}
        </>
    );
};

export default RepairTask;
