"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import { faFileInvoice, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import CreateInitialRepair from "./create-initial-repair/CreateInitialRepair";
import CreateRepairPdf from "./create-initial-repair/CreatePDF";
import Loader from "@/common-components/Loader";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const InitialRepair = () => {
    const router = useRouter();
    const [modalState, setModalStates] = useState({
        filter: false, modal: false, viewPO: false,
        viewPdf: false,
        data: "",
        deleteTask: false,
        orderId: "",
    });
    const [searchString, setSearchString] = useState("");
    const [loader, setLoader] = useState(false);
    // pagination states
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [page, setPage] = useState(1);
    const [material, setMaterial] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [filter, setFilter] = useState({});

    async function RepairMaterialList({
        page = 1,
        searchString,
        userId,
        isSearch = false
    } = {}) {
        try {
            setLoader(true);
            let payload = {
                page,
                searchString: searchString,
            };
            if (userId) {
                payload.userId = userId;
            }
            const serverResponse = await communication.repairMaterialList(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data?.repair);
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



    const handleSearch = (e) => {
        setSearchString(e.target.value);
        let isSearch = true;
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            RepairMaterialList({ page: 1, searchString: e.target.value, isSearch, ...filter });
            setCurrentPage(1);
        }, 2000);
        setTimeoutId(_timeOutId);
    };

    const handleDeleteTask = async (jobNo) => {
        try {
            setLoader(true);
            setModalStates((prev) => ({ ...prev, deleteTasks: false, jobNo: "" }));

            const payload = {
                repairId: jobNo
            }
            let response = await communication.deleteRepairJob(payload);
            if (response?.data?.status === "SUCCESS") {
                toast.success(response.data.message);
                setModalStates(false)
                await RepairMaterialList(currentPage, searchString);
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message);
                router.push("/");
            } else {
                toast.info(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoader(false);
        }
    };

    async function closeRepairJob(repairId) {
        try {


            setLoader(true);
            let payload = {
                repairId: repairId,
            };
            const serverResponse = await communication.closeRepairJob(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
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

    useEffect(() => {
        RepairMaterialList({ page: currentPage, searchString, isFirstCall: true, ...filter });
    }, [isPageUpdated]);


    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            {modalState.viewPdf && (
                <CreateRepairPdf pdfData={modalState?.data} setModalStates={setModalStates} />
            )}
            <div className="top_header">
                <div className="tab_title">Repair Job List</div>
                <Pagination
                    isPageUpdated={isPageUpdated}
                    setIsPageUpdated={setIsPageUpdated}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                />
            </div>
            <div className="search_btn_wrapper">
                <Search
                    value={searchString}
                    onChange={(e) => {
                        handleSearch(e);
                    }}
                    placeholder={"Search"}
                />
                {
                    <div className="buttons_wrapper">
                        <CustomBtn
                            name={"Create"}
                            onClick={() => {
                                router.push("./initial-repair/create-initial-repair");
                            }}
                            svg={
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9V11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15V12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
                                        fill="#F3F8FF"
                                    />
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                                        fill="#F3F8FF"
                                    />
                                </svg>
                            }
                        />

                        {modalState.deleteTask && (
                            <CustomResponseHandlerModal
                                status="warning"
                                // show={showModal}
                                message="Are you sure you want to delete this material?"
                                successHandler={() => {
                                    handleDeleteTask(modalState?.jobNo)
                                }}
                                cancelHandler={() => {
                                    // setModalStates((prev) => ({ ...prev, deleteTasks: false, jobNo: "" }));
                                    setModalStates(false)
                                }}
                            />
                        )}
                    </div>
                }
            </div>
            {/* table  */}
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section inventory_table_res">
                        <div className="table_header">
                            <div className="col_20p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Job No</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Ticket No</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Support No</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Date</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Service Rec. From</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Client Name</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Client No.</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Initial Check</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Remark</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Status</h5>
                            </div>
                            <div className="col_30p">
                                <h5 className="action_wrraper">Action</h5>
                            </div>
                            <div className="col_50p">
                                <h5 className="action_wrraper">Close Job</h5>
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
                                            <h6
                                                style={{ color: "#0000FF", cursor: "pointer" }}
                                                onClick={() =>
                                                    router.push(
                                                        `/dashboard/initial-repair/all-initial-repair-item?repairId=${stockDetails?._id}`
                                                    )
                                                }
                                            >
                                                {stockDetails?.jobNo}
                                            </h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.supportNo}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.serviceTicketNo}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.createdAt.split("T")[0]}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6>{stockDetails?.serviceReqReceivedFrom}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6>{stockDetails?.clientName}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.clientNo ? stockDetails?.clientNo : "-"}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.initialCheckedBy}</h6>
                                        </div><div className="col_50p">
                                            <h6>{stockDetails?.initialRemark ? stockDetails?.initialRemark : "--"}</h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6>{stockDetails?.taskStatus == "commented" ? "Inprocess" : stockDetails?.taskStatus ? stockDetails?.taskStatus : "--"}</h6>
                                        </div>
                                        <div className="col_30p">
                                            <h6 className="action_wrraper">
                                                <div
                                                    className="mx-2"
                                                    title="View Order"
                                                    onClick={() =>
                                                        setModalStates((pre) => ({ ...pre, viewPdf: true, data: stockDetails }))
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={faFileInvoice} />
                                                </div>
                                                {/* <div
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
                                                </div> */}
                                                <div
                                                    title="delete"
                                                    onClick={() =>
                                                        setModalStates((prev) => ({ ...prev, deleteTask: true, jobNo: stockDetails._id }))
                                                    }
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </div>
                                            </h6>
                                        </div>
                                        <div className="col_50p">
                                            <h6 className="action_wrraper">
                                                <CustomBtn name={"Close"} onClick={(e) => closeRepairJob(stockDetails?._id)} />
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
            {modalState?.modal && (
                <CreateInitialRepair
                    data={{ modalState, setModalStates, setIsPageUpdated }}
                />
            )
            }

        </>
    );
};

export default InitialRepair;
