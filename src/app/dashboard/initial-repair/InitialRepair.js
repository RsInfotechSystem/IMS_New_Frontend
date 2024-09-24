"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
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
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import StockFilterForDump from "@/common-components/StockFilterForDump";
import CreateInitialRepair from "./create-initial-repair/CreateInitialRepair";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const InitialRepair = () => {
    const router = useRouter();
    const [modalStates, setModalStates] = useState({ filter: false, modal: false });
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

    // async function getDumpMaterialList({
    //     page = 1,
    //     searchString,
    //     isSearch = false,
    //     categoryId,
    //     brandId,
    // } = {}) {
    //     try {
    //         setLoader(true);
    //         let payload = {
    //             page,
    //             searchString: searchString,
    //             categoryId,
    //             brandId,

    //         };
    //         const serverResponse = await communication.getDumpMaterial(payload);
    //         if (serverResponse?.data?.status === "SUCCESS") {
    //             setMaterial(serverResponse?.data.material);
    //             setPageCount(serverResponse?.data?.totalPages);
    //             setPage(page);
    //             if (isSearch) {
    //                 setCurrentPage(1);
    //             }
    //         } else if (serverResponse?.data?.status === "JWT_INVALID") {
    //             toast.info(serverResponse.data.message);
    //             router.push("/");
    //         } else {
    //             setMaterial([]);
    //         }
    //         setLoader(false);
    //     } catch (error) {
    //         toast.info(error?.response?.data?.message || error.message);
    //         setLoader(false);
    //     }
    // }

    // const handleSearch = (e) => {
    //     setSearchString(e.target.value);
    //     let isSearch = true;
    //     clearTimeout(timeoutId);
    //     let _timeOutId = setTimeout(() => {
    //         getDumpMaterialList({ page: 1, searchString: e.target.value, isSearch, ...filter });
    //         setCurrentPage(1);
    //     }, 2000);
    //     setTimeoutId(_timeOutId);
    // };
   
    // const handleSelectAllChange = (e) => {
    //     setSelectAllChecked(e.target.checked);

    //     // Update the array of selected checkboxes based on the "Select All" checkbox
    //     setSelectedCheckboxes((prevSelected) =>
    //         e.target.checked ? material.map((materialDetails) => materialDetails._id) : []
    //     );
    // };
    // const deleteDump = async () => {
    //     if (selectedCheckboxes.length > 0) {
    //         setShowModal((prev) => ({ ...prev, modal: true }));
    //     } else {
    //         toast.info("Please select which material you want to delete");
    //     }
    // };
    // const successHandler = async () => {
    //     setShowModal((prev) => ({ ...prev, modal: false }));
    //     setLoader(true);
    //     let payload = {
    //         dumpIds: [...selectedCheckboxes],
    //     };
    //     try {
    //         let response = await communication.deleteDumpMaterial(payload);
    //         if (response?.data?.status === "SUCCESS") {
    //             setSelectedCheckboxes([]);
    //             toast.success(response.data.message);
    //             await getDumpMaterialList(currentPage, searchString);
    //         } else if (response?.data?.status === "JWT_INVALID") {
    //             toast.info(response.data.message);
    //             router.push("/");
    //         } else {
    //             toast.info(response.data.message);
    //         }
    //     } catch (error) {
    //         toast.error(error.message);
    //     } finally {
    //         setLoader(false);
    //     }
    // };
    // const cancelHandler = () => {
    //     setShowModal((prev) => ({ ...prev, modal: false }));
    // };

    // useEffect(() => {
    //     getDumpMaterialList({ page: currentPage, searchString, ...filter });
    // }, [isPageUpdated]);

    return (
        <>
            {/* {loader && <Loader text="Fetching Data..." />}
            {modalStates?.filter && (
                <StockFilterForDump
                    setModalStates={setModalStates}
                    apiCall={getDumpMaterialList}
                    filter={filter}
                    setFilter={setFilter}
                />
            )} */}
            <div className="top_header">
                <div className="tab_title">Initial Repair</div>
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

                            name={"Filter"}
                            onClick={() => {
                                setModalStates((prev) => ({ ...prev, filter: true }));
                            }}
                            svg={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 512 512"
                                    fill="#fff"
                                >
                                    <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
                                </svg>
                            }
                        />
                        <CustomBtn
                            type="button"
                            name={"Reset Filter"}
                            onClick={() => {
                                getDumpMaterialList();
                            }}
                            style={{ padding: "0px", minWidth: "120px" }}
                        />
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
                        <CustomBtn
                            name={"Delete"}
                            // onClick={deleteDump}
                            svg={<FontAwesomeIcon icon={faTrash} />}
                        />
                        {showModal.modal && (
                            <CustomResponseHandlerModal
                                status="warning"
                                // show={showModal}
                                message="Are you sure you want to delete this material?"
                                successHandler={successHandler}
                                cancelHandler={cancelHandler}
                            />
                        )}
                    </div>
                }
            </div>
            {/* table  */}
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section inventory_table_res" >
                        <div className="table_header">
                            
                            <div className="col_15p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Client Name</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Diagonise
                                    tech name </h5>
                            </div>
                            <div className="col_30p">
                                <h5>Status</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Action</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Edit</h5>
                            </div>
                            {/* <div className="col_85p" style={{ justifyContent: "left" }}>
                                <div className="input_scroll" style={{ scrollbarWidth: "none" }}>
                                    <h5 style={{ textAlign: "center" }}>Parameter</h5>
                                </div>
                            </div> */}

                        </div>
                        {/* {material?.length > 0 ? ( */}
                            <>
                                {/* {material?.map((materialDetails, index) => { */}
                                    {/* return ( */}
                                        <div className="table_data">
                                      
                                         
                                            <div className="col_15p">
                                                {/* <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6> */}
                                                <h6>1</h6>
                                            </div>
                                            <div className="col_30p">
                                                <h6>
                                                    {/* {materialDetails?.categoryId?.name} */}
                                                   Ramesh
                                                </h6>
                                            </div>
                                            <div className="col_30p">
                                                {/* <h6>{materialDetails?.brandId?.name ? materialDetails?.brandId?.name : "--"}</h6> */}
                                                <h6>Rajwal Technician </h6>
                                            </div>
                                            <div className="col_30p">
                                                <h6>Status</h6>
                                            </div>
                                            <div className="col_30p">
                                                <h6>Action</h6>
                                            </div>
                                            <div className="col_30p">
                                                <h6>Edit</h6>
                                            </div>
                                        </div>
                                    {/* ); */}
                                {/* })} */}
                            </>
                        {/* ) : ( */}
                            {/* <p className="no_data">Data Not Available</p> */}
                        {/* )} */}
                    </div>
                </div>
            </div>
            {modalStates?.modal && (
        <CreateInitialRepair
        data={{ modalStates, setModalStates, setIsPageUpdated }}
        />
      )}

        </>
    );
};

export default InitialRepair;
