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
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
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
  async function acceptRejectMaterial(id, status, remark = "") {
    try {
      setLoader(true);
      const serverResponse = await communication.acceptRejectMaterial({
        materialId: id,
        status: status,
        remark: remark,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        fetchReturnMaterialList(currentPage, searchString);

        // setMaterial(serverResponse?.data.material);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else if (serverResponse.data.status == "FAILED") {
        Swal.fire({
          text: serverResponse?.data?.message,
          icon: "warning",
        });
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
  async function onSubmit(id, status, remark = "") {
    try {
      setLoader(true);
      const serverResponse = await communication.acceptRejectMaterial({
        materialId: id,
        status: status,
        remark: remark,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        fetchReturnMaterialList(currentPage, searchString);

        // setMaterial(serverResponse?.data.material);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else if (serverResponse.data.status == "FAILED") {
        Swal.fire({
          text: serverResponse?.data?.message,
          icon: "warning",
        });
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
        Swal.fire({ text: response.data.message, icon: "success" });
        fetchReturnMaterialList(1, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({
          text: response?.data?.message,
          icon: "warning",
        });
      }
      setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
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
          Swal.fire({
            icon: "error",
            text: "Remark required if you want to reject.",
          });
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
          // configAccess?.access === "Write" &&
          //   <div className="buttons_wrapper">
          //     <CustomBtn
          //       name={"Create"}
          //       onClick={() => {
          //         setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
          //       }}
          //       svg={
          //         <svg
          //           width="24"
          //           height="24"
          //           viewBox="0 0 24 24"
          //           fill="none"
          //           xmlns="http://www.w3.org/2000/svg"
          //         >
          //           <path
          //             d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9V11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15V12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
          //             fill="#F3F8FF"
          //           />
          //           <path
          //             fill-rule="evenodd"
          //             clip-rule="evenodd"
          //             d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
          //             fill="#F3F8FF"
          //           />
          //         </svg>
          //       }
          //     />
          //   </div>
        }
      </div>
      {/* table  */}
      <div className="table_wrapper" >
        <div className="table_main">
          <div className="table_section"  style={{minWidth: "1500px"}}>
            <div className="table_header">
              <div className="col_20p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_50p">
                <h5>Category Name</h5>
              </div>
              <div className="col_45p">
                <h5>Brand Name</h5>
              </div>
              <div className="col_55p">
                <h5>Location Name</h5>
              </div>
              <div className="col_50p">
                <h5>Model Name</h5>
              </div>
              <div className="col_35p">
                <h5>Item Code</h5>
              </div>
              <div className="col_35p">
                <h5>Serial No.</h5>
              </div>
              <div className="col_35p">
                <h5>Block Name</h5>
              </div>
              <div className="col_35p">
                <h5>Rack Name</h5>
              </div>
              <div className="col_45p">
                <h5>Condition Type</h5>
              </div>
              <div className="col_55p">
                <h5>Assigned Quantity</h5>
              </div>
              <div className="col_50p">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {material?.map((materialDetails, index) => {
              return (
                <div className="table_data" key={index}>
                  <div className="col_20p">
                    <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                  </div>
                  <div className="col_50p">
                    <h6>{materialDetails?.categoryId?.name}</h6>
                  </div>
                  <div className="col_45p">
                    <h6>{materialDetails?.brandId?.name}</h6>
                  </div>
                  <div className="col_55p">
                    <h6>{materialDetails?.locationId.name}</h6>
                  </div>
                  <div className="col_50p">
                    <h6>{materialDetails?.modelId?.name}</h6>
                  </div>
                  <div className="col_35p">
                    <h6>{materialDetails?.itemCode}</h6>
                  </div>
                  <div className="col_35p">
                    <h6>{materialDetails?.serialNo}</h6>
                  </div>
                  <div className="col_35p">
                    <h6>{materialDetails?.blockId?.blockNo}</h6>
                  </div>
                  <div className="col_35p">
                    <h6> {materialDetails?.rackId?.rackName ? materialDetails?.rackId?.rackName : "-"}</h6>
                  </div>
                  <div className="col_45p">
                    <h6>{materialDetails?.conditionType}</h6>
                  </div>
                  <div className="col_55p">
                    <h6>{materialDetails?.assignQuantity}</h6>
                  </div>
                  <div className="col_50p">
                    <h6 className="action_wrraper">
                      <button className="btn btn-success"  onClick={() => router.push(`/dashboard/stock-management/accept-material?stockId=${materialDetails._id}`)}>accept</button>
                      <button className="btn btn-danger" 
                      onClick={(e) =>showInputDialog(materialDetails?._id, "reject")}
                      // onClick={() => { setModalStates((prev) => ({ ...prev, modal: true,id: materialDetails?._id, status : "reject" })) }}
                      >reject</button>
                    </h6>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {pageCount >= 1 && (
        <div className="pagination_wrapper">
          <Pagination
            isPageUpdated={isPageUpdated}
            setIsPageUpdated={setIsPageUpdated}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageCount={pageCount}
          />
        </div>
      )}
      {modalStates?.modal && <RejectModel data={{ modalStates, setModalStates}} />}
      
    </>
  );
};

export default StockManagement;
