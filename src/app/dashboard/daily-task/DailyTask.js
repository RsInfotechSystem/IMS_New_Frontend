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
import ReturnMaterial from "./ReturnMaterial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck, faFilter, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBtn from "@/common-components/CustomBtn";
import StockFilter from "@/common-components/StockFilter";
import { getCookiesData } from "@/utilities/getCookiesData";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const DailyTask = () => {
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
    console.log("rrrr", getCookie("role"));
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
        toast.success(serverResponse.data.message);
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
    // console.log(stockDetails, "stockDetails");
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

      let response = await communication.getTechnicianList();
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

      // console.log(payload, "payloadpayload");
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
        <div className="tab_title">Daily Task</div>
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
        {/* {roleName === "admin" && ( */}
        <div className="search_box">
          <select
            // className="inputBox"
            className="search_input"
            // style={{
            //   height: "30px",
            //   background: "#f5f5f5",
            //   border: "none",
            //   width: "100%",
            // }}
            // {...register("userId", {
            //   required: "Technician is required",
            // })}
            onChange={(e) => fetchAssignMaterial({ page: currentPage, userId: e.target.value })}
          >
            {/* <option>Roshan</option>
                  <option>Roshan 2</option> */}
            <option value="">Select Technician</option>
            {TechnicianList.map((ele, index) => {
              return (
                <option value={ele._id} key={index}>
                  {ele.name}
                </option>
              );
            })}
          </select>
          {/* <div style={{ height: "5px" }}>
                  {errors.userId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.userId.message}
                    </p>
                  )}
                </div> */}
        </div>
        {/* // )} */}
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
            name={"Reset Filter"}
            onClick={() => {
              fetchAssignMaterial();
            }}
          />
        </div>
      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main" style={{ width: "1500px" }}>
          <div className="table_section inventory_table_res">
            <div className="table_header">
              <div className="col_20p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_50p">
                <h5>Job No</h5>
              </div>
              <div className="col_50p">
                <h5>Date</h5>
              </div>
              <div className="col_70p">
                <h5>Assign To</h5>
              </div>
              <div className="col_70p">
                <h5>Assign By</h5>
              </div>
              <div className="col_50p">
                <h5>Location</h5>
              </div>
              <div className="col_50p">
                <h5>Task Status</h5>
              </div>
              {/* {roleName == "admin" && material.map((item) => item?.taskStatus) == "assigned" && ( */}
              <div className="col_20p">
                <h5>Action</h5>
              </div>
              {/* )} */}
              {/* {roleName !== "admin" && material.map((item) => item?.taskStatus) == "assigned" && (
                <div className="col_20p">
                  <h5>Action</h5>
                </div>
              )} */}
            </div>
            {material.length > 0 ? (
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
                            `/dashboard/daily-task/return-material?jobId=${stockDetails?.jobNo}`
                          )
                        }
                      >
                        {stockDetails?.jobNo}
                      </h6>{" "}
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.createdAt.split("T")[0]}</h6>
                    </div>
                    <div className="col_70p">
                      <h6>{stockDetails?.userId.name}</h6>
                    </div>
                    <div className="col_70p">
                      <h6>{stockDetails?.assignedBy?.name}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.locationId ? stockDetails?.locationId?.name : "-"}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.taskStatus}</h6>
                    </div>
                    <div className="col_20p d-flex justify-content-center align-items-center">
                      <h6 className="text-center  ">
                        {roleName == "admin" && stockDetails?.taskStatus == "assigned" && (
                          <div className="d-flex gap-2 justify-content-center align-items-center">
                            <div title="edit">
                              <svg
                                // title={`${stockDetails.isActive ? "Update" : ""}`}
                                // className={`${
                                //   stockDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                                // }`}
                                onClick={() =>
                                  router.push(`/dashboard/assign-material?isView=true`)
                                }
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
                            <div
                              title="Delete"
                              // onClick={() => handleDeleteMaterial(stockDetails?.jobNo)}
                              onClick={() =>
                                setModalStates((prev) => ({
                                  ...prev,
                                  deleteTasks: true,
                                  jobNo: stockDetails?.jobNo,
                                }))
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </div>
                          </div>
                        )}
                        {roleName == "admin" && stockDetails?.taskStatus == "acknowledge" && (
                          <div title="edit">
                            <svg
                              title={`${stockDetails.isActive ? "Update" : ""}`}
                              className={`${
                                stockDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                              }`}
                              onClick={() => router.push(`/dashboard/assign-material?isView=true`)}
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
                        )}
                        {roleName !== "admin" && stockDetails?.taskStatus == "assigned" && (
                          <div
                            title="Accept"
                            onClick={(e) => acknowledgeMaterial(stockDetails?.jobNo)}
                          >
                            <FontAwesomeIcon icon={faClipboardCheck} />
                          </div>
                        )}
                        {roleName !== "admin" && stockDetails?.taskStatus == "acknowledge" && "--"}
                      </h6>
                    </div>
                    {/* {roleName == "admin" && stockDetails?.taskStatus == "assigned" ? (
                      <div className="col_20p me-1">
                        <h6 className="action_wrraper">
                          <>
                            {" "}
                            <div title="edit">
                              <svg
                                title={`${stockDetails.isActive ? "Update" : ""}`}
                                className={`${
                                  stockDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                                }`}
                                onClick={() => router.push("/dashboard/assign-material")}
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
                            <div
                              title="Delete"
                              // onClick={() => handleDeleteMaterial(stockDetails?.jobNo)}
                              onClick={() =>
                                setModalStates((prev) => ({
                                  ...prev,
                                  deleteTasks: true,
                                  jobNo: stockDetails?.jobNo,
                                }))
                              }
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </div>
                          </>
                        </h6>
                      </div>
                    ) : (
                      <div className="col_20p me-1">
                        <h6 className="action_wrraper">--</h6>
                      </div>
                    )} */}

                    {/* {roleName !== "admin" && stockDetails?.taskStatus == "assigned" ? (
                      <div title="Accept" onClick={(e) => acknowledgeMaterial(stockDetails?.jobNo)}>
                        <FontAwesomeIcon icon={faClipboardCheck} />
                      </div>
                    ) : (
                      <div className="col_20p me-1">
                        <h6 className="action_wrraper">--</h6>
                      </div>
                    )} */}
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

export default DailyTask;
