"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import React, { useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import { toast } from "react-toastify";
import CreateStockIn from "./CreateStockIn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import showIcon from "../../../../public/images/showIcon.png";
import password from "../../../../public/images/password.png";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { getLocations, getParameter } from "@/services/commonApis";
import filterIcon from "../../../../public/images/filter.png";
import InventoryView from "../inventory/InventoryView";
import { formatDate } from "@/helper/formatDate";
import StockFilter from "@/common-components/StockFilter";

const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const StockInList = () => {
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "", filter: false, isView: false });
  const [respondHandlerModalState, setRespondHandlerModalState] = useState({
    state: false,
    deleteId: "",
  });
  const [respondHandlerActiveModalState, setRespondHandlerActiveModalState] = useState({
    action: "disable",
    state: false,
    userId: "",
  });

  const router = useRouter();
  const fileInputRef = useRef(null);

  const [timeoutId, setTimeoutId] = useState();

  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  const [searchString, setSearchString] = useState("");
  const [stock, setStock] = useState([]);
  const [rackPartation, setRackPartation] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [brandsData, setBrandsData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);

  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);
  const [model, setModel] = useState();
  const [checkedStatus, setCheckedStatus] = useState({});

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
  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const rack = watch("blockId");
  const _rackIdForPrtn = watch("rackId");
  const brandId = watch("brandId");

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    setSelectAllChecked((!selectedCheckboxes.includes(checkboxId) && (selectedCheckboxes.length + 1 === stock?.length)))
    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(checkboxId)) {
        // If the checkbox is already in the array, remove it
        return prevSelected.filter((id) => id !== checkboxId);
      } else {
        // If the checkbox is not in the array, add it
        return [...prevSelected, checkboxId];
      }
    });

  };
  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);

    // Update the array of selected checkboxes based on the "Select All" checkbox
    setSelectedCheckboxes((prevSelected) =>
      e.target.checked ? stock.map((brandDetails) => brandDetails._id) : []
    );
  };


  const [filter, setFilter] = useState({});



  async function getStockList({ page = 1, searchString, isSearch = false, isFirstCall, location, categoryId, brandId, modelId } = {}) {
    try {
      setLoader(true);
      let payload = {
        page,
        searchString: searchString,
        location,
        categoryId,
        brandId,
        modelId
      };
      const serverResponse = await communication.getStockList(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        // console.log("serverResponse?.data", serverResponse?.data);
        setStock(serverResponse?.data.stock);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
        const initialCheckedStatus = {};

        serverResponse?.data.stock.forEach((user) => {
          initialCheckedStatus[user._id] = user.isActive || false;
        });
        setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse?.data?.status === "FAILED") {
        // Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        setStock([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        setStock([]);
      }
      setLoader(false);
    } catch (error) {
      // Swal.fire({
      //   text: error?.response?.data?.message || error.message,
      //   icon: "warning",
      // });
      setLoader(false);
    }
  }
  const getExportStock = async () => {
    try {
      Swal.fire({
        text: "Are you sure you want to Export the Data?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5149E4",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true,
      }).then(async function (result) {
        if (result.isConfirmed) {
          const serverResponse = await communication.getExportStock();
          if (serverResponse?.data) {
            const file = new Blob([serverResponse.data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            FileSaver.saveAs(file, "stock.xlsx");
          } else {
            Swal.fire({
              text: "Failed to export data in excel",
              icon: "warning",
            });
          }
        } else {
          return;
        }
      });
    } catch (error) { }
  };
  const handleFileChange = (event) => {
    alert("Under Maintainance");
    return;

    const selectedFile = event.target.files[0];

    Swal.fire({
      text: "Are you sure you want to import the file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5149E4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
    }).then(async function (result) {
      if (result.isConfirmed) {
        importData(selectedFile);
      } else {
        return;
      }
    });
  };
  const importData = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append("users", selectedFile);
      const serverResponse = await communication.importExcelStockData(formData);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse?.data?.message, icon: "success" });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse?.data?.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: serverResponse?.data?.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error?.message,
        icon: "error",
      });
    }
  };
  async function changeStockStatus(stockId) {
    try {
      setLoader(true);

      let response = await communication.changeStockStatus({
        stockId: stockId,
      });
      if (response?.data?.status === "SUCCESS") {
        // Swal.fire({ text: response.data.message, icon: "success" });
        toast.success(response.data.message);
        setCheckedStatus((prevStatus) => ({
          ...prevStatus,
          [stockId]: true,
        }));
        setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
        await getStockList({ currentPage, searchString });
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        router.push("/");
      } else {
        setRespondHandlerModalState((prev) => ({ ...prev, state: false }));

        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  }

  const cancelHandler = () => {
    setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
  };
  const cancelHandlerActive = () => {
    setRespondHandlerActiveModalState({ status: false });
  };
  const handleDelete = async (userIds) => {
    try {
      setLoader(true);
      let payload = {
        stockIds: [...userIds],
      };
      let response = await communication.deleteStock(payload);
      if (response?.data?.status === "SUCCESS") {
        setSelectedCheckboxes([]);
        toast.success(response.data.message, {
          autoClose: 1500, // 1.5 seconds
        });
        setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
        await getStockList({ currentPage, searchString });
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message, {
          autoClose: 1500, // 1.5 seconds
        });
        router.push("/");
      } else {
        toast.info(response.data.message, {
          autoClose: 1500, // 1.5 seconds
        });
      }
    } catch (error) {
      toast.info(response.data.message, {
        autoClose: 1500, // 1.5 seconds
      });
    } finally {
      setLoader(false);
    }
  };
  const deleteStock = async () => {
    if (selectedCheckboxes.length <= 0) {
      toast.info("Please select which stock you want to delete", {
        autoClose: 1500, // 1.5 seconds
      });
    } else {
      setRespondHandlerModalState({ state: true, deleteId: selectedCheckboxes });
    }
    // Swal.fire({
    //   text: "Are you sure you want to delete this stock?",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#5149E4",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it",
    //   cancelButtonText: "No, cancel",
    //   reverseButtons: true,
    // }).then(async function (result) {
    //   if (result.isConfirmed) {
    //   } else {
    //   }
    // });
  };
  async function getBrandWiseModel() {
    try {
      // props.setLoader(true);
      const payload = {
        brandId: brandId,
      };
      const serverResponse = await communication.brandWiseModel(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setModel(serverResponse?.data?.model);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        props.setLoader(false);
      } else {
        setModel([]);
      }
      // props.setLoader(false);
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
      // props.setLoader(false);
    }
  }
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getStockList({
        page: 1,
        searchString: e.target.value,
        isSearch,
        ...filter
      });
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  // useEffect(() => {
  //   getStockList(currentPage, searchString);
  // }, [isPageUpdated]);


  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      getLocationWiseBlock(id, setLoader, router, setBlocks);
    }
  }, [location]);
  useEffect(() => {
    const id = getValues("brandId");
    if (id) {
      getBrandWiseModel(id);
    }
  }, [brandId]);

  useEffect(() => {
    const id = getValues("blockId");
    if (id) {
      const rackDetails = blocks.find((ele) => ele._id === id);
      setRacks(rackDetails?.rackId ?? []);
    } else {
      setRacks([]);
    }
  }, [rack]);

  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      const parameterDetails = category.find((ele) => ele.categoryId === id);
      console.log(parameterDetails, "rrrr paramter details");
      setValue("parameterId", parameterDetails?._id);
      setParameter(parameterDetails.parameter ?? []);
    } else {
      setParameter([]);
      setValue("parameterId", "");
    }
  }, [categoryId]);
  useEffect(() => {
    const id = getValues("rackId");
    if (id) {
      getRackPartation(id, setLoader, router, setRackPartation);
    } else {
      setRackPartation([]);
    }
  }, [_rackIdForPrtn]);
  useEffect(() => {
    getLocations(setLoader, router, setLocations);
    getParameter(setLoader, router, setCategory);
    // getBrands(setLoader, router, setBrands);
    // getAllModels(setLoader, router, setModelList);
  }, []);
  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      getCategoryWiseBrand(id, setLoader, router, setBrandsData);
    }
  }, [categoryId]);
  useEffect(() => {
    getStockList({ page: currentPage, searchString, isFirstCall: true });
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
          successHandler={() => changeStockStatus(respondHandlerActiveModalState.userId)}
        />
      )}
      {loader && <Loader text="Fetching Data..." />}
      {modalStates?.filter && <StockFilter setModalStates={setModalStates} apiCall={getStockList} filter={filter} setFilter={setFilter} />}

      <div className="top_header">
        <div className="tab_title">Stock In</div>
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

        <div className="buttons_wrapper">
          <CustomBtn
            name={"Filter"}
            onClick={() => {
              setModalStates((prev) => ({ ...prev, filter: true }));
            }}
            svg={
              <svg xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 512 512" fill="#fff">
                <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
              </svg>
            }
          />

          <CustomBtn
            name={"Create"}
            onClick={() => {
              setModalStates((prev) => ({ ...prev, modal: true, type: "create", isView: false }));
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
            // onClick={deleteUser}
            onClick={deleteStock}
            svg={<FontAwesomeIcon icon={faTrash} />}
          />
        </div>
      </div>
      {/* table  */}
      <div className="table_wrapper ">
        <div className="table_main" style={{ minWidth: "2100px" }}>
          {/* Rename the class name "employee_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
          <div className="table_section ">
            {/* {![undefined, null, 0]?.includes(user) && <div className="table_badge_wrapper">
              <button className="table_badge">
                <h5>Total User</h5>
                <div className="badge_count">
                  <h6>{user.length}</h6>
                </div>
              </button>
            </div>} */}

            <div className="table_header">
              <div className="col_7p">
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={(e) => handleSelectAllChange(e)}
                  checked={selectAllChecked}
                />
              </div>
              <div className="col_10p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_50p">
                <h5>Category</h5>
              </div>
              <div className="col_40p">
                <h5>Brand</h5>
              </div>
              <div className="col_50p">
                <h5>Location</h5>
              </div>
              <div className="col_50p">
                <h5>Model Name</h5>
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
              <div className="col_50p">
                <h5>Stock In Date</h5>
              </div>
              <div className="col_50p action_wrraper">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {stock.length > 0 ? (
              <>
                {stock?.map((stockDetails, index) => (
                  <div className="table_data" key={index}>
                    <div className="col_7p">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={stockDetails._id}
                        onChange={(e) => handleCheckboxChange(e)}
                        checked={selectedCheckboxes.includes(stockDetails._id)}
                      />
                    </div>
                    <div className="col_10p">
                      <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                    </div>
                    <div className="col_50p">
                      <h6
                        style={{ color: "#0000FF", cursor: "pointer" }}
                        // onClick={() =>
                        //   router.push(
                        //     `/admin/dashboard/stock/update-stock?stockId=${
                        //       stockDetails._id
                        //     }&isView=${true}`
                        //   )
                        // }
                        onClick={() =>
                          setModalStates((prev) => ({
                            ...prev,
                            modal: true,
                            type: "update",
                            id: stockDetails?._id,
                            isView: true,
                          }))
                        }
                      >
                        {stockDetails?.categoryId?.name}
                      </h6>{" "}
                    </div>
                    <div className="col_40p">
                      <h6>{stockDetails?.brandId?.name}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>{stockDetails?.locationId.name}</h6>
                    </div>
                    <div className="col_50p">
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
                      <h6>{formatDate(stockDetails?.createdAt)}</h6>
                    </div>
                    <div className="col_50p">
                      <h6 className="action_wrraper">
                        <div
                          title="edit"
                          onClick={() =>
                            setModalStates((prev) => ({
                              ...prev,
                              modal: true,
                              type: "update",
                              id: stockDetails?._id,
                              isView: false,
                            }))
                          }
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
                        </div>
                        <div className="form-check form-switch " title="enable/disable">
                          <input
                            class="form-check-input cursor-pointer"
                            type="checkbox"
                            checked={stockDetails?.isActive}
                            id={`toggleSwitch${stockDetails._id}`}
                            // onChange={(event) =>
                            //     changeUserStatus(event, stockDetails._id, stockDetails.isActive)
                            // }
                            onChange={() =>
                              setRespondHandlerActiveModalState({
                                state: true,
                                action: stockDetails?.isActive ? "disable" : "enable",
                                userId: stockDetails?._id,
                              })
                            }
                            style={{ width: "35px", height: "15px" }}
                          />
                        </div>
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

      {modalStates?.modal && (
        <CreateStockIn
          data={{ modalStates, setModalStates, CreateStockIn, locations, getStockList }}
        />
      )}
    </>
  );
};

export default StockInList;
