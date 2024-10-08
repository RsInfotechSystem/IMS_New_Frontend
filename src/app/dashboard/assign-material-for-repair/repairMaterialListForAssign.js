"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loader from "@/common-components/Loader";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const RepairMaterialListForAssign = () => {
    const router = useRouter();
    const params = useSearchParams()
    const [searchString, setSearchString] = useState("");
    const [TechnicianList, setTechnicianList] = useState([]);
    const [loader, setLoader] = useState(false);
    // pagination states
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [page, setPage] = useState(1);
    const [material, setMaterial] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [filter, setFilter] = useState({});
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

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
    async function repairMaterialList({
        page = 1,
        searchString,
        userId,
        isSearch = false
    } = {}) {

        try {
            let payload = {
                page,
                searchString: searchString,
            };
            setLoader(true);
            const serverResponse = await communication.repairMaterialAssignedToTechList(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data?.materials);
                // toast.success(serverResponse.data.message);

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
    async function assignTaskToTech() {
        const repairMaterials = selectedCheckboxes?.map((materialId) => ({
            materialId: materialId,
            materialAssignTo: selectedTechnician
        }));
        try {
            if (selectedCheckboxes?.length == 0) {
                toast.info("Select at least one checkbox.")
                return
            }
            if (!selectedTechnician) {
                toast.info("Please Select Technician.")
                return
            }
            setLoader(true);
            let payload = {
                repairMaterials: repairMaterials
            };
            {
                console.log(payload, "payload")
            }
            const serverResponse = await communication.assignRepairToTech(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                setSelectedCheckboxes([])
                setSelectAllChecked([])
                repairMaterialList({ page, searchString });
                // router.back();
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
                setLoader(false);
            } else {
                toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }
    const showInputDialog = (id) => {
        Swal.fire({
            html: `<p>Do you want move forward with this order ?</p>`,
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            customClass: {
                confirmButton: 'custom-button',
                cancelButton: 'custom-button'
            }
        }).then((result) => {

            if (result.isConfirmed) {
                // yes== go ahead
                const flag = "goahead"; // Set the flag to true
                responseToTech(flag, id);
            } else {
                // const flag = "";
                // responseToTech(flag);
            }
        });
    };
    async function responseToTech(flag = "", id) {
        try {

            setLoader(true);
            let payload = {
                materiald: id,
                sendResponse: flag
            };
            const serverResponse = await communication.responseToTech(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                repairMaterialList();
                // router.back();
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
                setLoader(false);
            } else {
                toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }

    async function closeRepairMaterial(materialId) {
        try {
            setLoader(true);
            let payload = {
                materiald: materialId,
            };
            const serverResponse = await communication.closeRepairMaterial(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                repairMaterialList();
                // router.back();
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
                setLoader(false);
            } else {
                toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }
    const handleSearch = (e) => {
        setSearchString(e.target.value);
        let isSearch = true;
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            repairMaterialList({ page: 1, searchString: e.target.value, isSearch, ...filter });
        }, 2000);
        setTimeoutId(_timeOutId);
    };
    const handleCheckboxChange = (e) => {
        const checkboxId = e.target.id;
        setSelectAllChecked(
            !selectedCheckboxes.includes(checkboxId) &&
            selectedCheckboxes.length + 1 === material?.length
        );
        setSelectedCheckboxes((prevSelected) => {
            if (prevSelected.includes(checkboxId)) {
                // If the checkbox is already in the array, remove it
                return prevSelected.filter((id) => id !== checkboxId);
            } else {
                // If the checkbox is not in the array, add it
                return [...prevSelected, checkboxId];
            }
        });
    };
    const handleSelectAllChange = (e) => {
        setSelectAllChecked(e.target.checked);

        // Update the array of selected checkboxes based on the "Select All" checkbox
        setSelectedCheckboxes((prevSelected) =>
            e.target.checked ? material.map((brandDetails) => brandDetails._id) : []
        );
    };
    useEffect(() => {
        technicianList();
    }, []);
    useEffect(() => {
        repairMaterialList({ page: currentPage, searchString, isFirstCall: true, ...filter });
    }, [isPageUpdated]);


    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header">
                <div className="tab_title">Repair Material List</div>
                {/* <div
                    className="back_btn"
                    onClick={() => {
                        router.back();
                    }}
                >
                    <div>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clip-path="url(#clip0_1564_1770)">
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M3.07615 5.61732C3.23093 5.24364 3.59557 5 4.00003 5H14C17.866 5 21 8.13401 21 12C21 15.866 17.866 19 14 19H5.00003C4.44774 19 4.00003 18.5523 4.00003 18C4.00003 17.4477 4.44774 17 5.00003 17H14C16.7615 17 19 14.7614 19 12C19 9.23858 16.7615 7 14 7H6.41424L8.20714 8.79289C8.59766 9.18342 8.59766 9.81658 8.20714 10.2071C7.81661 10.5976 7.18345 10.5976 6.79292 10.2071L3.29292 6.70711C3.00692 6.42111 2.92137 5.99099 3.07615 5.61732Z"
                                    fill="#184965"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_1564_1770">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div>Back</div>
                </div> */}
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
                <div className="search_box">
                    <select
                        className="search_input"
                        onChange={(e) => {
                            setSelectedTechnician(e.target.value);
                            repairMaterialList({ materialAssignTo: e.target.value });
                        }}
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
                <div className="buttons_wrapper">
                    <CustomBtn
                        name={"Assign Task"}
                        onClick={() => {
                            assignTaskToTech();
                        }}
                    />
                </div>
            </div >
            {/* table  */}
            < div className="table_wrapper" >
                <div className="table_main">
                    <div className="table_section inventory_table_res" style={{ minWidth: "1700px" }}>
                        <div className="table_header">
                            <div className="col_20p">
                                <div className="check_box">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        onChange={(e) => handleSelectAllChange(e)}
                                        checked={selectAllChecked}
                                    />
                                    <label className="form-check-label"></label>
                                </div>
                            </div>
                            <div className="col_20p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Serial Tag</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Category</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Description</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Action Taken</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Stock Required</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Technician Remark</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Status</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Technician Name</h5>
                            </div>
                            <div className="col_70p">
                                <h5 className="action_wrraper">Assign</h5>
                            </div>
                            <div className="col_70p">
                                <h5 className="action_wrraper">Action</h5>
                            </div>
                        </div>

                        {material?.length > 0 ? (
                            <>
                                {material?.map((stockDetails, index) => (
                                    <div className="table_data" key={index}>
                                        <div className="col_20p">
                                            <div className="check_box">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={stockDetails._id}
                                                    onChange={(e) => handleCheckboxChange(e)}
                                                    checked={selectedCheckboxes.includes(stockDetails._id)}
                                                />
                                                <label className="form-check-label"></label>
                                            </div>
                                        </div>
                                        <div className="col_20p">
                                            <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.serialTag}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.category}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6>{stockDetails?.itemDescriptionNproblemObserved}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6>{stockDetails?.actionTaken ? stockDetails?.actionTaken : "--"}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6>{stockDetails?.stockRequired == true ? "Yes" : stockDetails?.stockRequired == false ? "No" : "--"}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6>{stockDetails?.remark ? stockDetails?.remark : "--"}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.materialStatus == "commented" ? "Inprocess" : stockDetails?.materialStatus ? stockDetails?.materialStatus : "--"}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.materialAssignTo?.name ? stockDetails?.materialAssignTo?.name : "--"}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6 className="action_wrraper">
                                                {/* {
                                                    stockDetails?.materialStatus == "assigned" || !stockDetails?.stockRequired == true ?
                                                        "--"
                                                        :
                                                        <div
                                                            title="edit"
                                                            onClick={() => {
                                                                router.push(`/dashboard/initial-repair/assign-technician?repairId=${stockDetails?._id}`);
                                                            }}
                                                        >
                                                            <svg
                                                                width="27"
                                                                height="27"
                                                                viewBox="0 0 25 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
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
                                                } */}
                                                {
                                                    stockDetails?.materialStatus == "assigned" ?
                                                        "--"
                                                        :
                                                        <div
                                                            title="edit"
                                                            onClick={() => {
                                                                router.push(`/dashboard/assign-material-for-repair/assign-material?materialId=${stockDetails?._id}&assignTo=${stockDetails?.materialAssignTo?._id}`);
                                                            }}
                                                        >
                                                            <svg
                                                                width="27"
                                                                height="27"
                                                                viewBox="0 0 25 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
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
                                                }
                                            </h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6 className="action_wrraper">
                                                {
                                                    stockDetails?.materialStatus == "consumed" || stockDetails?.materialStatus == "assigned" || stockDetails?.materialStatus == "closed" ? <CustomBtn name={"Go Ahead"} onClick={(e) => showInputDialog(stockDetails?._id)} disabled style={{
                                                        backgroundColor: "#d3d3d3",
                                                        cursor: "not-allowed"
                                                    }} /> : <CustomBtn name={"Go Ahead"} onClick={(e) => showInputDialog(stockDetails?._id)} />
                                                }
                                                {stockDetails?.materialStatus == "closed" ? <CustomBtn name={"Close"} onClick={(e) => closeRepairMaterial(stockDetails?._id)} disabled style={{
                                                    backgroundColor: "#d3d3d3",
                                                    cursor: "not-allowed"
                                                }} />
                                                    :
                                                    <CustomBtn name={"Close"} onClick={(e) => closeRepairMaterial(stockDetails?._id)} />
                                                }
                                            </h6>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="no_data">Data Not Available</p>
                        )}
                    </div>
                </div>
            </div >

        </>
    );
};

export default RepairMaterialListForAssign;
