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
import { useForm } from "react-hook-form";
import RejectModel from "./RejectModel";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const StockManagement = () => {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [blocks, setBlocks] = useState([]);
  const [racks, setRacks] = useState([]);
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [roles, setRoles] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [searchString, setSearchString] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
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
  async function fetchReturnMaterialList({
    page,
    searchString,
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
      const serverResponse = await communication.fetchReturnMaterialList(payload);
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
                  JSON.stringify({ modelId: item.modelId._id, modelName: item.modelId.name })
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
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else if (serverResponse?.data?.status == "FAILED") {
        setMaterial([]);

        // Swal.fire({
        //   text: res?.data?.message,
        //   icon: "warning",
        // });
      } else {
        setMaterial([]);

        toast.info(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  }
  async function acceptRejectMaterial(id, status, remark = "") {
    try {
      setLoader(true);
      const serverResponse = await communication.acceptRejectMaterial({
        materialId: id,
        status: status,
        remark: remark,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse?.data?.message);
        fetchReturnMaterialList(currentPage, searchString);

        // setMaterial(serverResponse?.data.material);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else if (serverResponse.data.status == "FAILED") {
        toast.info(serverResponse?.data?.message);
      } else {
        toast.info(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  }
  async function onSubmit(id, status, remark = "") {
    try {
      setLoader(true);
      const serverResponse = await communication.acceptRejectMaterial({
        materialId: id,
        status: status,
        remark: remark,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse?.data?.message);
        fetchReturnMaterialList(currentPage, searchString);

        // setMaterial(serverResponse?.data.material);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else if (serverResponse.data.status == "FAILED") {
        toast.info(serverResponse?.data?.message);
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
      fetchReturnMaterialList({ page: currentPage, searchString: e.target.value, isSearch });
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    let isSearch = true;
    // clearTimeout(timeoutId);
    // let _timeOutId = setTimeout(() => {
    fetchReturnMaterialList({
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
  const rejectMaterial = async (id, status, remark = "") => {
    try {
      setLoader(true);
      const dataToSend = {
        materialId: id,
        status: status,
        remark: remark,
      };
      let response = await communication.rejectMaterial(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response?.data?.message);
        fetchReturnMaterialList(1, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response?.data?.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      quantity: 1,
      parameterId: "",
      parameter: {},
    },
  });

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
          rejectMaterial(id, status, remark);
        } else {
          toast.info("Remark required if you want to reject.");
        }
      }
    });
  };

  // useEffect(() => {
  //   getActiveBlock();
  //   getActiveRack();
  // }, []);
  useEffect(() => {
    fetchReturnMaterialList({ page: currentPage, searchString, isFirstCall: true });
  }, [isPageUpdated]);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title">Stock Management</div>
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
      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section" style={{ minWidth: "1500px" }}>
            <div className="table_header">
              <div className="col_20p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_50p">
                <h5>Job No</h5>
              </div>
              <div className="col_30p">
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
              <div className="col_30p">
                <h5>Action</h5>
              </div>
            </div>
            {material.length > 0 ? (
              <>
                {material?.map((materialDetails, index) => {
                  return (
                    <div className="table_data" key={index}>
                      <div className="col_20p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_50p">
                        <h6
                          style={{ color: "#0000FF", cursor: "pointer" }}
                          onClick={() => router.push("/dashboard/stock-management/accept-material")}
                        >
                          {stockDetails?.brandId?.name}
                        </h6>
                      </div>
                      <div className="col_30p">
                        <h6>{stockDetails?.categoryId?.name}</h6>{" "}
                      </div>
                      <div className="col_70p">
                        <h6>{stockDetails?.locationId.name}</h6>
                      </div>
                      <div className="col_70p">
                        <h6>{stockDetails?.modelId?.name ? stockDetails?.modelId?.name : "-"}</h6>{" "}
                      </div>
                      <div className="col_50p">
                        <h6>{stockDetails?.itemCode ? stockDetails?.itemCode : "-"}</h6>
                      </div>
                      <div className="col_50p">
                        <h6>{stockDetails?.blockId?.blockNo}</h6>
                      </div>
                      <div className="col_30p">
                        <h6 className="action_wrraper">
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
                          <div className="form-switch ">
                            <input
                              class="form-check-input cursor-pointer"
                              type="checkbox"
                              checked={stockDetails.isActive || false}
                              id={`toggleSwitch${stockDetails._id}`}
                              onChange={(event) =>
                                setModalStates((pre) => ({
                                  ...pre,
                                  action: stockDetails.isActive ? "disable" : "enable",
                                  locationId: stockDetails._id,
                                  deleteLocation: true,
                                }))
                              }
                              style={{ width: "35px", height: "15px" }}
                            />
                          </div>
                        </h6>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="no_data">Data Not Available</p>
            )}
          </div>
        </div>
      </div>
      {/* {pageCount >= 1 && (
        <div className="pagination_wrapper">
          
        </div>
      )} */}
      {modalStates?.modal && <RejectModel data={{ modalStates, setModalStates }} />}
    </>
  );
};

export default StockManagement;
