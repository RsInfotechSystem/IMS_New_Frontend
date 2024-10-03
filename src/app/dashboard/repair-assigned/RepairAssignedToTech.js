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
    const [modalStates, setModalStates] = useState({
        deleteTasks: false,
        modal: false,
        type: "",
        id: "",
    });
    useEffect(() => {
        setRoleName(getCookie("role"));
    }, []);
    async function fetchAssignMaterial({
        page = 1,
        searchString,
        userId,
        isSearch = false,
        isFirstCall,
        location,
        categoryId,
        brandId,
        modelId,
    } = {}) {
        try {
            setLoader(true);
            let payload = {
                page,
                searchString: searchString,
                location,
                categoryId,
                brandId,
                modelId,
            };
            if (userId) {
                payload.userId = userId;
            }
            const serverResponse = await communication.fetchAssignMaterial(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data.data);
                // toast.success(serverResponse.data.message);
                setPageCount(serverResponse?.data?.totalPages);
                setPage(page);
                if (isSearch) {
                    setCurrentPage(1);
                }
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

    async function acknowledgeMaterial(stockDetails) {
        try {
            setLoader(true);
            const serverResponse = await communication.acknowledgeMaterial({
                jobNo: stockDetails,
            });
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                fetchAssignMaterial(1, searchString);
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
                setLoader(false);
            } else {
                toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.error(error.message);
            setLoader(false);
        }
    }
    const technicianList = async () => {
        try {
            setLoader(true);

            let response = await communication.getTechnicianListMaterial();
            if (response?.data?.status === "SUCCESS") {
                //  toast.success(response?.data?.message);
                setTechnicianList(response?.data.user);
                // await getRoleList(currentPage, searchString);
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message);
                router.push("/");
            } else {
                toast.info(response.data.message);
            }
        } catch (error) {
            toast.info(error.message);
        } finally {
            setLoader(false);
        }
    };

    const handleDeleteMaterial = async (jobNo) => {
        try {
            setLoader(true);
            setModalStates((prev) => ({ ...prev, deleteTasks: false, jobNo: "" }));
            // const payload = {
            //   jobNo: jobNo,
            // };

            let response = await communication.deleteAssignMaterial({ jobNo: jobNo });
            if (response?.data?.status === "SUCCESS") {
                await fetchAssignMaterial(1, searchString);
                toast.success(response?.data?.message, { autoClose: 1500 });
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response?.data?.message, { autoClose: 1500 });
                router.push("/");
            } else {
                toast.info(response?.data?.message);
            }
        } catch (error) {
            toast.info(error?.message, { autoClose: 1500 });
        } finally {
            setLoader(false);
        }
    };
    const handleSearch = (e) => {
        setSearchString(e.target.value);
        let isSearch = true;
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            fetchAssignMaterial({ page: 1, searchString: e.target.value, isSearch, ...filter });
        }, 2000);
        setTimeoutId(_timeOutId);
    };
    useEffect(() => {
        technicianList();
    }, []);
    useEffect(() => {
        fetchAssignMaterial({ page: currentPage, searchString, isFirstCall: true, ...filter });
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
            {/* <div className="search_btn_wrapper">
                <Search value={searchString} onChange={handleSearch} placeholder={"Search"} />
                {roleName === "admin" && (
                    <div className="search_box">
                        <select
                            className="search_input"
                            onChange={(e) => fetchAssignMaterial({ page: currentPage, userId: e.target.value })}
                        >
                            <option value="">Select Technician</option>
                            {TechnicianList.map((ele, index) => {
                                return (
                                    <option value={ele._id} key={index}>
                                        {ele.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                )}
                <div className="buttons_wrapper">
                </div>
            </div> */}
            {/* table  */}
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section inventory_table_res">
                        <div className="table_header">
                            <div className="col_20p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Item Assigned</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Diagonise</h5>
                            </div>
                            <div className="col_25p">
                                <h5 style={{ textAlign: "center" }}>Status</h5>
                            </div>
                            <div className="col_70p">
                                <h5 className="action_wrraper">Stock Needed</h5>
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
                                        <div className="col_50p">
                                            {stockDetails?.taskStatus === "Complete" ? (<h6
                                            >
                                                {stockDetails?.jobNo}
                                            </h6>) : (<h6
                                                style={{ color: "#0000FF", cursor: "pointer" }}
                                                onClick={() =>
                                                    // router.push(
                                                    //     `/dashboard/daily-task/return-material?jobId=${stockDetails?.jobNo}`
                                                    // )
                                                    router.push(
                                                        `/dashboard/repair-assigned/repair-assigned-consumed`
                                                    )
                                                }
                                            >
                                                {stockDetails?.jobNo}
                                            </h6>)}
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.createdAt.split("T")[0]}</h6>
                                        </div>
                                        <div className="col_25p">
                                            <div className="position-relative">
                                                <select
                                                    // value={product?.status}
                                                    // onChange={(e) =>
                                                    //     handleChangeMaterial(e, index, "status", product)
                                                    // }
                                                    className="form-control custom_input"
                                                    style={{ width: "100%" }}
                                                >
                                                    <option value="" className="text-secondary text-lowercase">
                                                        Select Status
                                                    </option>
                                                    {stockStatus?.map((ele, index) => {
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
                                        <div className="col_70p">
                                            <div className="check_box me-1" style={{ gap: "0" }}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                // name={`selection-${product.materialId}`}
                                                // id={`dumpRadioMaterial-${product.materialId}`}
                                                // onChange={() =>
                                                //     handleRadioChangeMaterial(product.materialId, "Dump", product)
                                                // }
                                                // checked={rowSelectionsMaterial[product.materialId] === "Dump"}
                                                />
                                                <label
                                                // htmlFor={`dumpRadioMaterial-${product.materialId}`}
                                                >
                                                    Yes
                                                </label>
                                            </div>
                                            <div className="check_box me-1" style={{ gap: "0" }}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                // name={`selection-${product.materialId}`} // Unique name for each row
                                                // id={`storeRadioMaterial-${product.materialId}`}
                                                // onChange={() =>
                                                //     handleRadioChangeMaterial(
                                                //         product.materialId,
                                                //         "Store",
                                                //         product
                                                //     )
                                                // }
                                                // checked={rowSelectionsMaterial[product.materialId] === "Store"}
                                                />
                                                <label
                                                // htmlFor={`storeRadio-${product.materialId}`}
                                                >No</label>
                                            </div>
                                        </div>
                                        <div className="col_20p d-flex justify-content-center align-items-center">
                                            <Button name={"Return"} type="button" className="" >
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
            {modalStates?.modal && <ReturnMaterial data={{ modalStates, setModalStates }} />}
        </>
    );
};

export default RepairTask;
