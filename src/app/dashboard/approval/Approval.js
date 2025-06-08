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
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const Approval = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [trasferMaterial, setTrasferMaterial] = useState([]);
  const [activeTab, setActiveTab] = useState("shift");
  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();
  const [activeButton, setActiveButton] = useState("transferList");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
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
    isShowSellList: true,
    // isShowTransferList: false,
  });
  const [filter, setFilter] = useState({});
  const [modalStates, setModalStates] = useState({
    modal: false,
    type: "",
    id: "",
    filter: false,
    isView: false,
  });
  // ----------------------SELL API------------------------------------
  async function getMaterialForApproval({
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
      const serverResponse = await communication.getMaterialForApproval(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.stock);
        setTrasferMaterial([]);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isFirstCall) {
          setState({
            category: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({
                    categoryId: item.categoryId?._id,
                    category: item.categoryId?.name,
                  })
                )
              )
            ).map((item) => JSON.parse(item)),
            brand: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ brandId: item.brandId?._id, brand: item.brandId?.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            modelName: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ modelId: item.modelId._id, modelName: item.modelId.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            location: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
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
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        // toast.info(serverResponse.data.message);
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.message);
      setLoader(false);
    }
  }

  async function approvedOrReject(materialData, quantity) {
    try {
      setLoader(true);
      const serverResponse = await communication.acceptRejectMaterial({
        materialId: materialData._id,
        status: "approved",
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        getMaterialForApproval(1, searchString);
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
  // const changeMaterialStatus = async (materialData) => {
  //   if (materialData.quantity > 1) {
  //     Swal.fire({
  //       text: "Please Enter Quantity.",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#5149E4",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Yes, sell it",
  //       cancelButtonText: "No, cancel",
  //       reverseButtons: true,
  //       input: "text",
  //       inputAttributes: {
  //         required: "true",
  //         name: "Quantity",
  //         placeholder: "Enter Quantity",
  //       },
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         await approvedOrReject(materialData, Number(result.value));
  //       }
  //     });
  //   } else {
  //     await approvedOrReject(materialData, 1);
  //   }
  // };

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getMaterialForApproval({
        page: 1,
        searchString: e.target.value,
        isSearch,
        ...filter,
      });
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    let isSearch = true;
    getMaterialForApproval({
      page: 1,
      isSearch,
    });
  }, [
    state?.categoryValue?.keyId,
    state?.brandValue?.keyId,
    state?.locationValue?.keyId,
    state?.modelNameValue?.keyId,
  ]);

  useEffect(() => {
    getMaterialForApproval({ currentPage, searchString, isFirstCall: true });
  }, [isPageUpdated]);

  // ----------------------TRANSFER API------------------------------------
  const handleClick = (buttonName) => {
    setActiveButton(buttonName);
    if (buttonName === "transferList") {
      getMaterialForApproval({ currentPage, searchString, isFirstCall: true });
      setState({ isShowSellList: true });
      setActiveTab("shift");
    } else {
      approveTransferMaterial({ currentPage, searchString });
      setState({ isShowSellList: false });
      setActiveTab("attendance");
    }
  };

  async function approveTransferMaterial() {
    try {
      let payload = {
        page,
        searchString: searchString,
        ...(state.categoryValue.keyType == "category" && { categoryId: state.categoryValue.keyId }),
        ...(state.brandValue.keyType == "brand" && { brandId: state.brandValue.keyId }),
        ...(state.locationValue.keyType == "location" && { locationId: state.locationValue.keyId }),
        ...(state.modelNameValue.keyType == "modelName" && {
          modelId: state.modelNameValue.keyId,
        }),
      };
      const serverResponse = await communication.getTransferMaterialToApprove(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial([]);
        setTrasferMaterial(serverResponse?.data?.material);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        toast.info(serverResponse.data.message);
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }

  const rejectTransferMaterial = async (id, remark = "") => {
    try {
      setLoader(true);
      const dataToSend = {
        transferMaterialId: id,
        remark: remark,
      };
      let response = await communication.rejectTransferMaterial(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message);
        approveTransferMaterial({ currentPage, searchString });
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(response.data.message);
      setLoader(false);
    }
  };
  const showInputDialog = (id, status) => {
    Swal.fire({
      html: '<input placeholder="Enter Remark for Rejection" type="text" id="remarkInput" class="swal2-input">',
      showCancelButton: true,
      confirmButtonText: "Submit",
      preConfirm: () => {
        const remarkInput = document.getElementById("remarkInput");
        return remarkInput.value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const remark = result.value;
        if (remark) {
          rejectTransferMaterial(id, remark);
        } else {
          toast.info("Remark required if you want to reject.");
        }
      }
    });
  };

  async function approvedTransferMaterials(id) {
    try {
      setLoader(true);
      const serverResponse = await communication.approvedTransferMaterials({
        transferMaterialId: id,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        approveTransferMaterial({ currentPage, searchString });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        toast.info(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.error(response?.data?.message || error.message);
      setLoader(false);
    }
  }

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      {modalStates?.filter && (
        <StockFilter
          setModalStates={setModalStates}
          apiCall={getMaterialForApproval}
          filter={filter}
          setFilter={setFilter}
        />
      )}
      <div className="top_header">
        <div className="tab_title">Approval</div>
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
              getMaterialForApproval();
            }}
            style={{ padding: "0px", minWidth: "100px" }}
          />
          <div
            className="tab_btn"
            onClick={() => handleClick("transferList")}
            style={{
              padding: "0px", minWidth: "70px", fontSize: "13px",
              backgroundColor:
                activeTab == "shift" ? "#184965" : "#184965a8",
            }}
          >Sell List</div>
          <div
            className="tab_btn"
            name={"Transfer List"}
            onClick={() => handleClick("anotherButton")}
            style={{
              padding: "0px", minWidth: "110px", fontSize: "13px",
              backgroundColor: activeTab == "attendance" ? "#184965" : "#184965a8",
            }}
          >Transfer List</div>
        </div>
      </div>

      {/* ============================== Sell Approval================================= */}
      {state.isShowSellList && (
        <div className="table_wrapper">
          <div className="table_main">
            <div className="table_section inventory_table_res">
              <div className="table_header">
                <div className="col_20p">
                  <h5>Sr. No.</h5>
                </div>
                <div className="col_60p">
                  <h5>Category Name</h5>
                </div>
                <div className="col_50p">
                  <h5>Brand Name</h5>
                </div>
                <div className="col_50p">
                  <h5>Modal Name</h5>
                </div>
                <div className="col_55p">
                  <h5>Location Name</h5>
                </div>
                <div className="col_45p">
                  <h5>Item Code</h5>
                </div>
                <div className="col_35p">
                  <h5>Serial No.</h5>
                </div>
                <div className="col_35p">
                  <h5>Condition Type</h5>
                </div>
                <div className="col_35p">
                  <h5>QTY</h5>
                </div>
                <div className="col_20p">
                  <h5 className="action_wrraper">Action</h5>
                </div>
              </div>
              {material?.map((materialDetails, index) => {
                return (
                  <div className="table_data" key={index}>
                    <div className="col_20p">
                      <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                    </div>
                    <div className="col_60p">
                      <h6>
                        <strong>{materialDetails?.categoryId?.name}</strong>
                      </h6>
                    </div>
                    <div className="col_50p">
                      <h6>{materialDetails?.brandId?.name}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{materialDetails?.modelId?.name ? materialDetails?.modelId?.name : "-"}</h6>
                    </div>
                    <div className="col_55p">
                      <h6>{materialDetails?.locationId.name}</h6>
                    </div>
                    <div className="col_45p">
                      <h6>{materialDetails?.itemCode}</h6>
                    </div>

                    <div className="col_35p">
                      <h6>{materialDetails?.serialNo
                      }</h6>
                    </div>
                    <div className="col_35p">
                      <h6>{materialDetails?.conditionType}</h6>
                    </div>
                    <div className="col_35p">
                      <h6>{materialDetails?.quantity}</h6>
                    </div>
                    <div className="col_20p">
                      <h6 className="action_wrraper">
                        <button
                          className="actionbtn sell_btn"
                          onClick={(e) => approvedOrReject(materialDetails)}
                        >
                          Approve
                        </button>
                      </h6>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================== Transfer Approval================================= */}

      {!state.isShowSellList && (
        <div className="table_wrapper">
          <div className="table_main">
            <div className="table_section inventory_table_res">
              <div className="table_header">
                <div className="col_20p">
                  <h5>Sr. No.</h5>
                </div>
                <div className="col_35p">
                  <h5>From Location</h5>
                </div>
                <div className="col_35p">
                  <h5>To Location</h5>
                </div>
                <div className="col_35p">
                  <h5>Transfer By</h5>
                </div>
                <div className="col_35p">
                  <h5>Remark</h5>
                </div>
                <div className="col_35p">
                  <h5>Status</h5>
                </div>

                <div className="col_35p">
                  <h5 className="action_wrraper">Action</h5>
                </div>
              </div>
              {trasferMaterial?.length > 0 ? (
                trasferMaterial?.map((materialDetails, index) => {
                  return (
                    <>
                      <div className="table_data" key={index}>
                        <div className="col_20p">
                          <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                        </div>
                        <div className="col_35p">
                          <h6>{materialDetails?.fromLocation?.name}</h6>
                        </div>{" "}
                        <div className="col_35p">
                          <h6>{materialDetails?.toLocation?.name}</h6>
                        </div>
                        <div className="col_35p">
                          <h6>{materialDetails?.transferBy?.name}</h6>
                        </div>
                        <div className="col_35p">
                          <h6>{materialDetails?.remark ? materialDetails?.remark : "-"}</h6>
                        </div>
                        <div className="col_35p">
                          <h6>{materialDetails?.status}</h6>
                        </div>
                        <div className="col_35p">
                          <h6 className="action_wrraper">
                            <button
                              className="actionbtn sell_btn"
                              onClick={() => approvedTransferMaterials(materialDetails._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="actionbtn sell_btn"
                              onClick={() => showInputDialog(materialDetails._id)}
                            >
                              Reject
                            </button>
                          </h6>
                        </div>
                      </div>
                    </>
                  );
                })
              ) : (
                <p className="no_data">Data Not Available</p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* {
        pageCount > 1 && (
          <div className="pagination_wrapper">
            
          </div>
        )
      } */}
    </>
  );
};

export default Approval;
