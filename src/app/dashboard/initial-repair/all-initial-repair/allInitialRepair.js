"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { communication, getServerUrl } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { getCookiesData } from "@/utilities/getCookiesData";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/helper/formatDate";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import StockFilter from "@/common-components/StockFilter";
import InputBox from "@/common-components/InputBox";
import { faFileInvoice, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import StockFilterForDump from "@/common-components/StockFilterForDump";
import Button from "@/common-components/Button";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const AllInitialRepair = () => {
    const router = useRouter();
    const params = useSearchParams()
    const [modalState, setModalStates] = useState({
        filter: false, modal: false, viewPO: false,
        viewPdf: false,
        data: "",
        deletePo: false,
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
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [showModal, setShowModal] = useState({ modal: false });

    async function repairMaterialById() {
        const payload = {
            repairId: params.get("repairId")
        }
        try {
            setLoader(true);
            const serverResponse = await communication.getRepairMaterialById(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data?.repair);
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
    const showInputDialog = () => {
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
                const flag = "go ahead"; // Set the flag to true
                responseToTech(flag);
            } else {
                // const flag = "";
                // responseToTech(flag);
            }
        });
    };
    async function responseToTech(flag = "") {
        try {

            setLoader(true);
            let payload = {
                materiald: params.get("repairId"),
                sendResponse: flag
            };
            const serverResponse = await communication.responseToTech(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                repairMaterialById();
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
        repairMaterialById({ page: currentPage, searchString, isFirstCall: true, ...filter });
    }, [isPageUpdated]);


    return (
        <>
            <div className="top_header">
                <div className="tab_title">Initial Repair</div>
                <div
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
                </div>
                {/* <Pagination
                    isPageUpdated={isPageUpdated}
                    setIsPageUpdated={setIsPageUpdated}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                /> */}
            </div>
            <div className="search_btn_wrapper">
                <Search
                    value={searchString}
                    onChange={(e) => {
                        handleSearch(e);
                    }}
                    placeholder={"Search"}
                />

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
                                <h5>Serial Tag</h5>
                            </div>
                            <div className="col_50p">
                                <h5>Category</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Description</h5>
                            </div>
                            <div className="col_70p">
                                <h5>Remark</h5>
                            </div>
                            <div className="col_70p">
                                <h5 className="action_wrraper">Action</h5>
                            </div>

                        </div>

                        {material?.repairMaterials?.length > 0 ? (
                            <>
                                {material?.repairMaterials?.map((stockDetails, index) => (
                                    <div className="table_data" key={index}>
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
                                            <h6>{stockDetails?.remark}</h6>
                                        </div>
                                        <div className="col_70p">
                                            <h6 className="action_wrraper">
                                                <CustomBtn name={"Go Ahed"} onClick={(e) => showInputDialog()} />
                                                <CustomBtn name={"Close"} />
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
            </div>

        </>
    );
};

export default AllInitialRepair;
