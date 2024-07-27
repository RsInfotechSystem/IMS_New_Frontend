"use client";
import Image from "next/image";
// import { communication } from "@/apis/communication";
// import React, { useEffect, useReducer, useState } from "react";
// import edit from "../../../../../public/images/rolecreate/edit.png";
// import Swal from "sweetalert2";
// import { useRouter } from "next/navigation";
// import search from "../../../../../public/images/rolecreate/search.png";
// import Pagination from "@/reusable/Pagination";
// import { getCookie } from "cookies-next";
// import filterIcon from "../../../../../public/images/filter.png";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 4;

const DailyTask = () => {
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
        // Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        setMaterial([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
      }
      setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      setLoader(false);
    }
  }
  const technicianList = async () => {
    try {
      setLoader(true);

      let response = await communication.getTechnicianList();
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        setTechnicianList(response?.data.user);
        // await getRoleList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({ text: error.message, icon: "warning" });
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
    <div className="page_wrapper">
      {" "}
      <div className="d-flex gap-3">
        {/* <div className="col-lg-2 col-md-3 justify-content-center d-flex align-items-center"> */}
        <div className="border border-3  mb-2 border-solid border-color-#bababa ps-1 d-flex align-items-center w-25">
          <Image src={search} alt="serchIcon"></Image>
          <input
            type="text"
            value={searchString}
            onChange={handleSearch}
            placeholder="search"
            style={{
              background: "#f5f5f5",
              height: "30px",
              fontSize: 14,
              fontWeight: 500,
              width: "100%",
            }}
            className="ps-2"
          />
          {/* <button className="savebtn mb-1" onClick={() => getRoleList(1, searchString)}>Search</button> */}
        </div>
        {/* </div> */}
        {/* <div className="col-lg-2 col-md-3 justify-content-center d-flex align-items-center"> */}
        {roleName === "admin" && (
          <div
            className="border border-3 mb-2 border-solid border-color-#bababa d-flex align-items-center"
            style={{ background: "#f5f5f5", width: "15%" }}
          >
            <select
              className="inputBox"
              style={{
                height: "30px",
                background: "#f5f5f5",
                border: "none",
                width: "100%",
              }}
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
        {/* </div> */}
      </div>
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_container_inventory">
            <div className="table_header">
              <div className="sr_no">
                <h5>Sr. No.</h5>
              </div>
              {/* <div className="stock_out">
                <h5>Category</h5>
              </div>{" "} */}{" "}
              <div
                className="category_stock d-flex justify-content-between"
                style={{ width: "18%" }}
              >
                {state.categoryFilter ? (
                  <>
                    <select
                      className="selectBox text-capitalize"
                      style={{ width: "80%", cursor: "pointer" }}
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
                        // console.log("checkkk", state);
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
              {/* <div className="stock_out">
                <h5>Brand Name</h5>
              </div> */}{" "}
              <div className="commonBlock d-flex justify-content-between" style={{ width: "18%" }}>
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
              {/* <div className="stock_out">
                <h5>Location</h5>
              </div> */}
              <div className="item_code d-flex justify-content-between" style={{ width: "18%" }}>
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
              {/* <div className="stock_out">
                <h5>Model Name</h5>
              </div> */}
              <div className="commonBlock d-flex justify-content-between" style={{ width: "18%" }}>
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
                            keyCount: state.modelNameValue.keyCount + 1,
                          },
                        })
                      }
                      value={state.modelNameValue.keyId}
                    >
                      <option value="">Select All</option>
                      {state.modelName.map((item, index) => {
                        return (
                          <option value={item.modelId} key={index}>
                            {item.modelName}
                          </option>
                        );
                      })}
                    </select>
                    <Image
                      onClick={() => setState({ modelNameFilter: !state.modelNameFilter })}
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
              <div className="stock_out">
                <h5>Serial No.</h5>
              </div>
              <div className="stock_out">
                <h5>Item Code</h5>
              </div>
              <div className="stock_out">
                <h5>Condition Type</h5>
              </div>
              {/* <div className="stock_out">
                <h5>Status </h5>
              </div> */}
              <div className="stock_out">
                <h5>Assigned By</h5>
              </div>{" "}
              {roleName == "admin" && (
                <div className="stock_out">
                  <h5>Technician</h5>
                </div>
              )}
              <div className="stock_out">
                <h5>Assigned Quantity</h5>
              </div>
              <div className="stock_out">
                <h5>Assigned Date</h5>
              </div>
              <div className="stock_out_brand">
                <h5>Remark</h5>
              </div>
              {/* <div className="action_stock">
                <h5>Action</h5>
              </div> */}
            </div>
            <div className="table_data_wrapper">
              {material?.length > 0 ? (
                <>
                  {material?.map((materialDetails, index) => (
                    <div className="table_data" key={index}>
                      <div className="sr_no">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="category_stock" style={{ width: "18%" }}>
                        <h6
                          style={{ color: "#0000FF", cursor: "pointer" }}
                          onClick={() =>
                            router.push(
                              `/admin/dashboard/daily-task/return-material?materialId=${materialDetails._id}`
                            )
                          }
                        >
                          {materialDetails?.categoryId?.name}
                        </h6>
                      </div>
                      <div className="commonBlock" style={{ width: "18%" }}>
                        <h6>{materialDetails?.brandId?.name}</h6>
                      </div>
                      <div className="item_code" style={{ width: "18%" }}>
                        <h6>{materialDetails?.locationId?.name}</h6>
                      </div>
                      <div className="commonBlock" style={{ width: "18%" }}>
                        <h6>
                          {materialDetails?.modelId?.name ? materialDetails?.modelId?.name : "-"}
                        </h6>
                      </div>
                      <div className="stock_out">
                        <h6>{materialDetails?.serialNo ? materialDetails?.serialNo : "-"}</h6>
                      </div>
                      <div className="stock_out">
                        <h6>{materialDetails?.itemCode ? materialDetails?.itemCode : "-"}</h6>
                      </div>
                      <div className="stock_out">
                        <h6>{materialDetails?.conditionType}</h6>
                      </div>
                      {/* <div className="stock_out">
                        <h6>{materialDetails?.status}</h6>
                      </div> */}
                      <div className="stock_out">
                        <h6>{materialDetails?.assignedBy?.name}</h6>
                      </div>
                      {roleName == "admin" && (
                        <div className="stock_out">
                          <h6>{materialDetails?.userId?.name}</h6>
                        </div>
                      )}
                      <div className="stock_out">
                        <h6>{materialDetails?.assignQuantity}</h6>
                      </div>
                      <div className="stock_out">
                        <h6>{new Date(materialDetails.createdAt).toLocaleDateString()}</h6>
                      </div>
                      <div className="stock_out_brand" style={{ display: "flex" }}>
                        <h6>{materialDetails?.remark ?? "--"}</h6>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="data_not_available_wrapper">
                  <h5>Data Not Available</h5>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Pagination
        isPageUpdated={isPageUpdated}
        setIsPageUpdated={() => {}}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageCount={pageCount}
      />
    </div>
  );
};

export default DailyTask;
