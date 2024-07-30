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
import { getCookie } from "cookies-next";
import ReturnMaterial from "./ReturnMaterial";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const DailyTask = () => {
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
  const [respondHandlerModalState, setRespondHandlerModalState] = useState({
    state: false,
    deleteId: "",
  });
  const [respondHandlerActiveModalState, setRespondHandlerActiveModalState] = useState({
    action: "disable",
    state: false,
    userId: "",
  });

  const [page, setPage] = useState(1);
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [TechnicianList, setTechnicianList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [roles, setRoles] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [searchString, setSearchString] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [roleName, setRoleName] = useState("");
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    categoryFilter: false,
    brandFilter: false,
    locationFilter: false,
    modelNameFilter: false,
    category: [],
    brand: [],
    modelName: [],
    location: [],
    categoryValue: { keyType: "", keyId: "", keyCount: 0 },
    brandValue: { keyType: "", keyId: "", keyCount: 0 },
    modelNameValue: { keyType: "", keyId: "", keyCount: 0 },
    locationValue: { keyType: "", keyId: "", keyCount: 0 },
  });
  async function fetchAssignMaterial({
    page,
    searchString,
    userId,
    isSearch = false,
    categoryValue,
    brandValue,
    isFirstCall,
  } = {}) {
    try {
      setLoader(true);
      let payload = {
        page: page,
        searchString: searchString,
        ...(state.categoryValue.keyType == "category" && { categoryId: state.categoryValue.keyId }),
        ...(state.brandValue.keyType == "brand" && { brandId: state.brandValue.keyId }),
        ...(state.locationValue.keyType == "location" && { location: state.locationValue.keyId }),
        ...(state.modelNameValue.keyType == "modelName" && {
          modelId: state.modelNameValue.keyId,
        }),
      };
      if (userId) {
        payload.userId = userId;
      }
      const serverResponse = await communication.fetchAssignMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.material);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isFirstCall) {
          setState({
            category: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({
                    categoryId: item.categoryId?._id,
                    category: item.categoryId?.name,
                  })
                )
              )
            ).map((item) => JSON.parse(item)),
            brand: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({ brandId: item.brandId?._id, brand: item.brandId?.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            modelName: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({ modelId: item.modelId?._id, modelName: item.modelId?.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            location: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({
                    locationId: item.locationId?._id,
                    location: item.locationId?.name,
                  })
                )
              )
            ).map((item) => JSON.parse(item)),
          });
        }
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "FAILED") {
        toast.info(serverResponse.data.message)
        setMaterial([]);
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
  useEffect(() => {
    technicianList();
    setRoleName(getCookie("role"));
  }, []);

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      fetchAssignMaterial({ page: currentPage, searchString: e.target.value, isSearch });
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    let isSearch = true;
    // clearTimeout(timeoutId);
    // let _timeOutId = setTimeout(() => {
    fetchAssignMaterial({
      page: 1,
      isSearch,
    });
    // }, 2000);
    // setTimeoutId(_timeOutId);
  }, [
    state.categoryValue.keyId,
    state.brandValue.keyId,
    state.locationValue.keyId,
    state.modelNameValue.keyId,
  ]);
  useEffect(() => {
    fetchAssignMaterial({ page: currentPage, searchString, isFirstCall: true });
  }, [isPageUpdated]);
  return (
    <>
      {respondHandlerModalState.state && (
        <CustomResponseHandlerModal
          status="warning"
          message="Are you sure you want to delete this Stock?"
          cancelHandler={cancelHandler}
          successHandler={() => handleDelete(respondHandlerModalState.deleteId)}
        />
      )}
      {respondHandlerActiveModalState.state && (
        <CustomResponseHandlerModal
          status="warning"
          message={`Are you sure you want to ${respondHandlerActiveModalState.action} the status?`}
          cancelHandler={cancelHandlerActive}
          successHandler={() => changeUserStatus(respondHandlerActiveModalState.userId)}
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
        {roleName === "admin" && (
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
        )}
        <div className="buttons_wrapper"></div>
      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main" style={{ width: "1500px" }}>
          {/* Rename the class name "employee_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
          <div className="table_section inventory_table_res">
            {/* {![undefined, null, 0]?.includes(user) && <div className="table_badge_wrapper">
              <button className="table_badge">
                <h5>Total User</h5>
                <div className="badge_count">
                  <h6>{user.length}</h6>
                </div>
              </button>
            </div>} */}

            <div className="table_header">
              <div className="col_20p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_70p">
                {state.categoryFilter ? (
                  <>
                    <select
                      className="selectBox text-capitalize"
                      style={{ width: "80%" }}
                      // onChange={(e) => filterSearch(e, "category")}
                      onChange={(e) =>
                        setState({
                          categoryValue: {
                            keyType: "category",
                            keyId: e.target.value,
                            keyCount: state.categoryValue.keyCount + 1,
                          },
                        })
                      }
                      value={state.categoryValue.keyId}
                    >
                      <option value="">Select All</option>
                      {state.category.map((item, index) => {
                        console.log("checkkk", state.category);
                        return (
                          <option value={item.categoryId} key={index}>
                            {item.category}
                          </option>
                        );
                      })}
                    </select>
                    <Image
                      onClick={() => setState({ categoryFilter: !state.categoryFilter })}
                      className="cursor-pointer"
                      src={filterIcon}
                      width={15}
                      height={15}
                      alt="filter-icon"
                    ></Image>
                  </>
                ) : (
                  <>
                    <h5>Category</h5>
                    <div>
                      <Image
                        onClick={() => setState({ categoryFilter: true })}
                        className="cursor-pointer"
                        src={filterIcon}
                        width={15}
                        height={15}
                        alt="filter-icon"
                      ></Image>
                    </div>
                  </>
                )}
              </div>
              <div className="col_50p">
                {state.brandFilter ? (
                  <>
                    <select
                      className="selectBox text-capitalize"
                      style={{ width: "80%" }}
                      // onChange={(e) => filterSearch(e, "brand")}
                      onChange={(e) =>
                        setState({
                          brandValue: {
                            keyType: "brand",
                            keyId: e.target.value,
                            keyCount: state.brandValue.keyCount + 1,
                          },
                        })
                      }
                      value={state.brandValue.keyId}
                    >
                      <option value="">Select All</option>
                      {state.brand.map((item, index) => {
                        return (
                          <option value={item.brandId} key={index}>
                            {item.brand}
                          </option>
                        );
                      })}
                    </select>
                    <Image
                      onClick={() => setState({ brandFilter: !state.brandFilter })}
                      className="cursor-pointer"
                      src={filterIcon}
                      width={15}
                      height={15}
                      alt="filter-icon"
                    ></Image>
                  </>
                ) : (
                  <>
                    <h5>Brand</h5>
                    <div>
                      <Image
                        onClick={() => setState({ brandFilter: true })}
                        className="cursor-pointer"
                        src={filterIcon}
                        width={15}
                        height={15}
                        alt="filter-icon"
                      ></Image>
                    </div>
                  </>
                )}
              </div>
              <div className="col_70p">
                {state.locationFilter ? (
                  <>
                    <select
                      className="selectBox text-capitalize"
                      style={{ width: "80%" }}
                      // onChange={(e) => filterSearch(e, "brand")}
                      onChange={(e) =>
                        setState({
                          locationValue: {
                            keyType: "location",
                            keyId: e.target.value,
                            keyCount: state.locationValue.keyCount + 1,
                          },
                        })
                      }
                      value={state.locationValue.keyId}
                    >
                      <option value="">Select All</option>
                      {state.location.map((item, index) => {
                        return (
                          <option value={item.locationId} key={index}>
                            {item.location}
                          </option>
                        );
                      })}
                    </select>
                    <Image
                      onClick={() => setState({ locationFilter: !state.locationFilter })}
                      className="cursor-pointer"
                      src={filterIcon}
                      width={15}
                      height={15}
                      alt="filter-icon"
                    ></Image>
                  </>
                ) : (
                  <>
                    <h5>Location</h5>
                    <div>
                      <Image
                        onClick={() => setState({ locationFilter: true })}
                        className="cursor-pointer"
                        src={filterIcon}
                        width={15}
                        height={15}
                        alt="filter-icon"
                      ></Image>
                    </div>
                  </>
                )}
              </div>
              <div className="col_60p">
                {state.modelNameFilter ? (
                  <>
                    <select
                      className="selectBox text-capitalize"
                      style={{ width: "80%" }}
                      // onChange={(e) => filterSearch(e, "brand")}
                      onChange={(e) =>
                        setState({
                          modelNameValue: {
                            keyType: "modelName",
                            keyId: e.target.value,
                            keyCount: state?.modelNameValue?.keyCount + 1,
                          },
                        })
                      }
                      value={state.modelNameValue.keyId}
                    >
                      <option value="">Select All</option>
                      {state.modelName.map((item, index) => {
                        return (
                          <option value={item?.modelId} key={index}>
                            {item?.modelName}
                          </option>
                        );
                      })}
                    </select>
                    <Image
                      onClick={() => setState({ modelNameFilter: !state?.modelNameFilter })}
                      className="cursor-pointer"
                      src={filterIcon}
                      width={15}
                      height={15}
                      alt="filter-icon"
                    ></Image>
                  </>
                ) : (
                  <>
                    <h5>Model Name</h5>
                    <div>
                      <Image
                        onClick={() => setState({ modelNameFilter: true })}
                        className="cursor-pointer"
                        src={filterIcon}
                        width={15}
                        height={15}
                        alt="filter-icon"
                      ></Image>
                    </div>
                  </>
                )}
              </div>
              <div className="col_50p">
                <h5>Item Code</h5>
              </div>
              <div className="col_50p">
                <h5>Quantity</h5>
              </div>
              <div className="col_50p">
                <h5>Remaining Quantity</h5>
              </div>
              <div className="col_50p">
                <h5>Block</h5>
              </div>
              <div className="col_50p">
                <h5>Rack</h5>
              </div>
              <div className="col_50p">
                <h5>Serial No.</h5>
              </div>
              <div className="col_50p">
                <h5>Condition Type</h5>
              </div>
              <div className="col_50p">
                <h5>Status</h5>
              </div>
              {/* <div className="col_50p action_wrraper">
                <h5 className="action_wrraper">Action</h5>
              </div> */}
              <div className="col_50p">
                <h5>Assigned By</h5>
              </div>
              {roleName == "admin" && (
                <div className="col_50p">
                  <h5>Technician</h5>
                </div>
              )}
              <div className="col_50p">
                <h5>Assigned Quantity</h5>
              </div>
              <div className="col_50p">
                <h5>Assigned Date</h5>
              </div>
              <div className="col_50p">
                <h5>Remark</h5>
              </div>
            </div>
            {material.length > 0 ? (
              <>
                {material?.map((stockDetails, index) => (
                  <div className="table_data" key={index}>
                    <div className="col_20p">
                      <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                    </div>
                    <div className="col_70p">
                      <h6
                        style={{ color: "#0000FF", cursor: "pointer" }}
                        onClick={() =>
                          setModalStates((prev) => ({
                            ...prev,
                            modal: true,
                            type: "update",
                            id: stockDetails?._id,
                          }))
                        }
                      >
                        {stockDetails?.categoryId?.name}
                      </h6>{" "}
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.brandId?.name}</h6>
                    </div>
                    <div className="col_70p">
                      <h6>{stockDetails?.locationId.name}</h6>
                    </div>
                    <div className="col_60p">
                      <h6>{stockDetails?.modelId?.name ? stockDetails?.modelId?.name : "-"}</h6>{" "}
                    </div>
                    {/* <div className="col_50p">
                      <h6>{stockDetails?.mobile}</h6>
                    </div> */}
                    <div className="col_50p">
                      <h6>{stockDetails?.itemCode ? stockDetails?.itemCode : "-"}</h6>
                      {/* <h6>
                          {roleDetails?.tab?.join(', ')}
                        </h6> */}
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.quantity ? stockDetails?.quantity : "-"}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>
                        {stockDetails?.reamainingQuantity ? stockDetails?.reamainingQuantity : "-"}
                      </h6>{" "}
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.blockId?.blockNo}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.rackId.rackName ? stockDetails?.rackId.rackName : "-"}</h6>{" "}
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.serialNo ? stockDetails?.serialNo : "-"}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.conditionType}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.status}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.assignedBy?.name}</h6>
                    </div>
                    {roleName == "admin" && (
                      <div className="col_50p">
                        <h6>{stockDetails?.userId?.name}</h6>
                      </div>
                    )}
                    <div className="col_50p">
                      <h6>{stockDetails?.assignQuantity}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{new Date(stockDetails.createdAt).toLocaleDateString()}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.remark ?? "--"}</h6>
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

export default DailyTask;
