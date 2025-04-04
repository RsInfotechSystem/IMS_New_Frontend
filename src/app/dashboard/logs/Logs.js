"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Search from "@/common-components/Search";
import Loader from "@/common-components/Loader";
import getDateDescription from "@/helper/getDateDescription";
import { communication } from "@/services/communication";
import getTimeFromDate from "@/helper/getTimeFromDate";
import Pagination from "@/common-components/Pagination";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomBtn from "@/common-components/CustomBtn";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
gsap.registerPlugin(useGSAP);
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

function Logs() {
    const [currentPage, setCurrentPage] = useState(1);
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const router = useRouter();
    const [searchString, setSearchString] = useState("");
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [loader, setLoader] = useState(false);
    const [notification, setNotification] = useState([]);
    const [timeoutId, setTimeoutId] = useState();

    const handleSearch = (e) => {
        setSearchString(e.target.value);
        let isSearch = true;
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            getAllLogs("1", e.target.value, isSearch);
        }, 2000);
        setTimeoutId(_timeOutId);
    };


    async function getAllLogs(page = 1, searchString, isSearch = false) {
        try {
            setLoader(true);
            const serverResponse = await communication.getActionLogs(page, searchString);
            if (serverResponse?.data?.status === "SUCCESS") {
                setNotification(serverResponse?.data.logs);
                setPageCount(serverResponse?.data?.totalPages);
                setPage(page);
                if (isSearch) {
                    setCurrentPage(1);
                }
            } else if (serverResponse.data.status == "FAILED") {
                setNotification([]);
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message, {
                    autoClose: 1500 // 1.5 seconds
                });
                router.push("/");
                setLoader(false);
            } else {
                setNotification([]);
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message, {
                autoClose: 1500 // 1.5 seconds
            });
            setLoader(false);
        }
    }

    useEffect(() => {
        getAllLogs(currentPage, searchString);
    }, [isPageUpdated]);
    return (
        <>
            {loader && <Loader />}
            <div className="top_header p-2">
                <div className="tab_title">Logs</div>
                <div className="pagination_wrapper">
                    <Pagination
                        isPageUpdated={isPageUpdated}
                        setIsPageUpdated={setIsPageUpdated}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageCount={pageCount}
                    />
                </div>
            </div>
            <div className="search_btn_wrapper p-2">
                <Search
                    value={searchString}
                    onChange={handleSearch}
                    placeholder={"Search"}
                />


            </div>
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section">
                        <div className="table_header">
                            <div className="col_7p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_20p">
                                <h5> Title</h5>
                            </div>
                            <div className="col_45p">
                                <h5>Description</h5>
                            </div>
                            <div className="col_20p">
                                <h5 className="action_wrraper">Date</h5>
                            </div>
                        </div>
                        {notification?.map((data, index) => {
                            return (<>
                                <div
                                    className="table_data"
                                    key={index}
                                >

                                    <div className="col_7p">
                                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                    </div>

                                    <div className="col_20p">
                                        <h6>{data?.title}</h6>
                                    </div>

                                    <div className="col_45p">
                                        <h6>{data?.description}</h6>
                                    </div>

                                    <div className="col_20p">
                                        <h6 className="action_wrraper">
                                            {(data?.createdAt?.split("T")[0])}
                                        </h6>
                                    </div>
                                </div >
                            </>)
                        })}
                    </div>
                </div>
            </div >

        </>
    );
}

export default Logs;
