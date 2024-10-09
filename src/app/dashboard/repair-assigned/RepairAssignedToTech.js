"use client";

import Pagination from "@/common-components/Pagination";
import { useRouter } from "next/navigation";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faClipboardCheck,
    faFilter,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@/common-components/Button";
import { stockRepairStatus } from "@/helper/repairStockStatus";
import Search from "@/common-components/Search";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const RepairTask = () => {
    const [page, setPage] = useState(1);
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [loader, setLoader] = useState(false);
    const [material, setMaterial] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [rowData, setRowData] = useState([]);
    const [searchString, setSearchString] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [pageCount, setPageCount] = useState(1);
    const [responceFromCustomer, setResponceFromCustomer] = useState("")
    // const [rowData, setRowData] = useState(
    //     material.map(() => ({
    //         status: "",
    //         stockRequired: "",
    //         remark: "",
    //     }))
    // );
    const [modalStates, setModalStates] = useState({
        deleteTasks: false,
        modal: false,
        type: "",
        id: "",
    });

    async function RepairMaterialAssignedToTechList({
        page = 1,
        searchString,
        isSearch = false
    } = {}) {
        try {
            setLoader(true);
            let payload = {
                page,
                searchString: searchString,
            };
            const serverResponse = await communication.repairMaterialAssignedToTechList(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                const updatedMaterials = serverResponse?.data?.materials.map((material, index) => {
                    const modifiedMaterial = { ...material }; // Create a copy of each material object

                    // If stockRequired exists, rename it to stockRequired_{index}
                    if ("stockRequired" in modifiedMaterial) {
                        modifiedMaterial[`stockRequired_${index}`] = modifiedMaterial.stockRequired;
                        delete modifiedMaterial.stockRequired; // Remove the original stockRequired key
                    }

                    return modifiedMaterial; // Return the modified material object
                });

                // Set the modified materials array to state (assuming you're using React's useState hook)
                setMaterial(updatedMaterials);
                // setResponceFromCustomer(serverResponse?.data?.materials.map((item) => item?.sendResponse ))
                // setMaterial(serverResponse?.data?.materials.map((item) => {}));
                setRowData(
                    serverResponse?.data?.materials.map((item) => ({
                        status: item?.systemStatus || "",
                        stockRequired:
                            item?.stockRequired === true ? "Yes" : item?.stockRequired === false ? "No" : "",
                        remark: item?.remark || "",
                    }))
                );
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

    const handleRemarkChange = (e, index) => {
        const { name, value } = e.target;

        setRowData((prevData) => {
            const newData = [...prevData];
            newData[index] = { ...newData[index], [name]: value };
            return newData;
        });
    };
    const handleChange = (e, index) => {
        const { name, value } = e.target;
        setMaterial((prev) => {
            let preData = [...prev];
            preData[index] = { ...preData[index], [name]: value == "yes" ? true : false };
            return preData;
        });
        // setRowData((prevData) => {
        //   const newData = [...prevData];
        //   newData[index] = { ...newData[index], [name]: value };
        //   return newData;
        // });
        setRowData((prev) => {
            let preData = [...prev];
            preData[index] = { ...preData[index], [name]: value == "yes" ? true : false };
            return preData;
        });
    };

    const technicianRepairRemark = async (index) => {
        try {
            if (material[index][`stockRequired_${index}` === false]) {
                toast.info("Stock Required field is missing. Please provide a value.");
                return;
            }
            if (!rowData[index].remark) {
                toast.info("Remark field is empty. Please provide a remark.");
                return;
            }
            if (!rowData[index].status) {
                toast.info("Stock Status is missing. Please select a status.");
                return;
            }

            setLoader(true);
            const payload = {
                materiald: material[index]._id,
                systemStatus: rowData[index].status,
                stockRequired: material[index][`stockRequired_${index}`],
                remark: rowData[index].remark,
            };

            let response = await communication.technicianRepairRemark(payload);

            if (response?.data?.status === "SUCCESS") {
                setIsEditing(false);
                RepairMaterialAssignedToTechList({ page: currentPage, searchString });
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
    };
    const handleSearch = (e) => {
        setSearchString(e.target.value);
        let isSearch = true;
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            RepairMaterialAssignedToTechList({ page: 1, searchString: e.target.value, isSearch, });
            setCurrentPage(1);
        }, 2000);
        setTimeoutId(_timeOutId);
    };

    const handleEditClick = (index) => {
        setIsEditing(true);
        setEditingIndex(index);
    };

    useEffect(() => {
        RepairMaterialAssignedToTechList({ page: currentPage, searchString });
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
                <div className="tab_title">Repair Task</div>

                <Pagination
                    isPageUpdated={isPageUpdated}
                    setIsPageUpdated={setIsPageUpdated}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                />

            </div>
            <div className="search_btn_wrapper">
                <Search value={searchString} onChange={handleSearch} placeholder={"Search"} />

            </div>
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section inventory_table_res">
                        <div className="table_header">
                            <div className="col_20p">
                                <h5 className="text-center">Sr. No.</h5>
                            </div>
                            <div className="col_25p">
                                <h5 className="text-center">Serial Tag</h5>
                            </div>
                            <div className="col_25p">
                                <h5 className="text-center">Category</h5>
                            </div>
                            <div className="col_50p">
                                <h5 className="text-center">Description</h5>
                            </div>
                            <div className="col_50p">
                                <h5 className="text-center">Status</h5>
                            </div>
                            <div className="col_50p">
                                <h5 className="text-center">Stock Required</h5>
                            </div>
                            <div className="col_50p">
                                <h5 className="text-center">Remark</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Client Response</h5>
                            </div>
                            <div className="col_20p">
                                <h5 className="text-center">Action</h5>
                            </div>
                        </div>

                        {material?.length > 0 ? (
                            <>
                                {material?.map((stockDetails, index) => (
                                    <div className="table_data" key={index}>
                                        <div className="col_20p">
                                            <h6 className="text-center">{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                        </div>
                                        <div className="col_25p">
                                            <h6
                                                className="text-center"
                                                style={{ color: "#0000FF", cursor: "pointer" }}
                                                onClick={() => {
                                                    router.push(
                                                        `/dashboard/repair-assigned/repair-assigned-consumed?repairId=${stockDetails?._id}`
                                                    );
                                                }}
                                            >
                                                {stockDetails?.serialTag}
                                            </h6>
                                        </div>
                                        <div className="col_25p">
                                            <h6 className="text-center">{stockDetails?.category}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6 className="text-center">{stockDetails?.itemDescriptionNproblemObserved}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <div className="position-relative">
                                                <select
                                                    name="status"
                                                    value={rowData[index]?.status || stockDetails?.systemStatus}
                                                    onChange={(e) => handleRemarkChange(e, index)}
                                                    className="form-control custom_input"
                                                    style={{ width: "100%" }}
                                                    disabled={!isEditing || editingIndex !== index}
                                                >
                                                    <option value="" className="text-secondary text-lowercase">
                                                        Select Status
                                                    </option>
                                                    {stockRepairStatus?.map((ele, index) => {
                                                        return (
                                                            <option value={ele?.toLocaleLowerCase()} key={index}>
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
                                                    onChange={(e) => handleChange(e, index)}
                                                    type="radio" // Change to radio
                                                    name={`stockRequired_${index}`} // Unique name for each group
                                                    value="yes"
                                                    checked={stockDetails[`stockRequired_${index}`] === true} // Check if true for "Yes"
                                                />
                                                <label>Yes</label>
                                            </div>
                                            <div className="check_box me-1" style={{ gap: "0" }}>
                                                <input
                                                    onChange={(e) => handleChange(e, index)}
                                                    type="radio" // Change to radio
                                                    name={`stockRequired_${index}`} // Unique name for each group
                                                    value="no"
                                                    checked={stockDetails[`stockRequired_${index}`] === false} // Check if false for "No"
                                                />
                                                <label>No</label>
                                            </div>
                                            {/* <div className="col_50p">
                                                <label>
                                                    <input
                                                        onChange={(e) => handleChange(e, index)}
                                                        type="radio" // Change to radio
                                                        name={`stockRequired_${index}`} // Unique name for each group
                                                        value="yes"
                                                        checked={stockDetails[`stockRequired_${index}`] === true} // Check if true for "Yes"
                                                    />{" "}
                                                    Yes
                                                </label>
                                                <br />
                                                <label>
                                                    <input
                                                        onChange={(e) => handleChange(e, index)}
                                                        type="radio" // Change to radio
                                                        name={`stockRequired_${index}`} // Unique name for each group
                                                        value="no"
                                                        checked={stockDetails[`stockRequired_${index}`] === false} // Check if false for "No"
                                                    />{" "}
                                                    No
                                                </label>
                                            </div> */}
                                        </div>
                                        <div className="col_50p">
                                            <div className="custom_input_wrapper">
                                                <input
                                                    type="text"
                                                    name="remark"
                                                    disabled={!isEditing || editingIndex !== index}
                                                    value={rowData[index]?.remark || stockDetails?.remark}
                                                    onChange={(e) => handleRemarkChange(e, index)}
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
                                        <div className="col_30p">
                                            <h6 className="text-center">{stockDetails?.sendResponse ? stockDetails?.sendResponse : "--"}</h6>
                                        </div>
                                        <div className="col_20p d-flex justify-content-center align-items-center">
                                            {isEditing && editingIndex === index ? (
                                                <Button
                                                    name={"Save"}
                                                    type="button"
                                                    className=""
                                                    onClick={() => technicianRepairRemark(index)}
                                                ></Button>
                                            ) : (
                                                <div title="edit">
                                                    <svg
                                                        title="edit"
                                                        width="27"
                                                        height="27"
                                                        viewBox="0 0 25 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        onClick={() => handleEditClick(index)}
                                                    >
                                                        <g clip-path="url(#clip0_279_5204)">
                                                            <path
                                                                d="M17.5 15V17.5C17.5 17.8315 17.3683 18.1495 17.1339 18.3839C16.8995 18.6183 16.5815 18.75 16.25 18.75H7.5C7.16848 18.75 6.85054 18.6183 6.61612 18.3839C6.3817 18.1495 6.25 17.8315 6.25 17.5V8.75C6.25 8.41848 6.3817 8.10054 6.61612 7.86612C6.85054 7.6317 7.16848 7.5 7.5 7.5H10"
                                                                stroke="#0D6EFD"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                            />
                                                            <path
                                                                d="M12.8125 14.875L18.75 8.875L16.125 6.25L10.1875 12.1875L10 15L12.8125 14.875Z"
                                                                stroke="#0D6EFD"
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                            />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_279_5204">
                                                                <rect
                                                                    width="15"
                                                                    height="15"
                                                                    fill="white"
                                                                    transform="translate(5 5)"
                                                                />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </div>
                                            )}
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
