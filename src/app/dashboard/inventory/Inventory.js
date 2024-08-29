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
import InventoryView from "./InventoryView";
import StockFilter from "@/common-components/StockFilter";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const Inventory = () => {
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

  async function getStatusWiseMaterialList({
    page = 1,
    searchString,
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
      const serverResponse = await communication.getInventoryMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.stock);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }
  async function executeChangeMaterialStatus(materialData, quantity) {
    try {
      setLoader(true);
      const serverResponse = await communication.stockOutMaterial({
        stockId: materialData._id,
        quantity: quantity,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        getStatusWiseMaterialList({ page: 1, searchString });
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
  const changeMaterialStatus = async (materialData) => {
    if (materialData.quantity > 1) {
      Swal.fire({
        text: "Please Enter Quantity.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#5149E4",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, sell it",
        cancelButtonText: "No, cancel",
        reverseButtons: true,
        input: "text",
        inputAttributes: {
          required: "true",
          name: "Quantity",
          placeholder: "Enter Quantity",
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          await executeChangeMaterialStatus(materialData, Number(result.value));
          // getStatusWiseMaterialList()
        }
      });
    } else {
      await executeChangeMaterialStatus(materialData, 1);
    }
    // {
    //   showModal.modal && (
    //     <CustomResponseHandlerModal
    //       status="warning"
    //       // show={showModal}
    //       message="Are you sure you want to delete this block?"
    //       successHandler={successHandler}
    //       cancelHandler={cancelHandler}
    //     />
    //   )
    // }
  };
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getStatusWiseMaterialList({ page: 1, searchString: e.target.value, isSearch, ...filter });
      setCurrentPage(1);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    getStatusWiseMaterialList({ page: currentPage, searchString, isFirstCall: true });
  }, [isPageUpdated]);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      {modalStates?.filter && (
        <StockFilter
          setModalStates={setModalStates}
          apiCall={getStatusWiseMaterialList}
          filter={filter}
          setFilter={setFilter}
        />
      )}
      <div className="top_header">
        <div className="tab_title">Inventory Look</div>
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
                getStatusWiseMaterialList();
              }}
              style={{ padding: "0px", minWidth: "120px" }}
            />
          </div>
        }
      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section inventory_table_res" style={{ minWidth: "2000px" }}>
            <div className="table_header">
              <div className="col_15p">
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
                <h5>Box Item</h5>
              </div>
              <div className="col_45p">
                <h5>Block Name</h5>
              </div>
              <div className="col_45p">
                <h5>Rack Name</h5>
              </div>
              <div className="col_50p">
                <h5>Partation Name</h5>
              </div>
              <div className="col_35p">
                <h5>Serial No.</h5>
              </div>
              <div className="col_35p">
                <h5>Status</h5>
              </div>
              <div className="col_35p">
                <h5>QTY</h5>
              </div>
              <div className="col_35p">
                <h5>Reamaining Quantity</h5>
              </div>
              {/* <div className="col_40p">
                <h5 className="action_wrraper">Action</h5>
              </div> */}
            </div>
            {material?.length > 0 ? (
              <>
                {material?.map((materialDetails, index) => {
                  return (
                    <div className="table_data" key={index}>
                      <div className="col_15p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_60p">
                        <h6>
                          <strong
                            onClick={() =>
                              setModalStates((prev) => ({
                                ...prev,
                                modal: true,
                                type: "update",
                                id: materialDetails?._id,
                              }))
                            }
                          >
                            {materialDetails?.categoryId?.name}
                          </strong>
                        </h6>
                      </div>
                      <div className="col_50p">
                        <h6>{materialDetails?.brandId?.name}</h6>
                      </div>
                      <div className="col_50p">
                        <h6>
                          {materialDetails?.modelId?.name ? materialDetails?.modelId?.name : "-"}
                        </h6>
                      </div>
                      <div className="col_55p">
                        <h6>{materialDetails?.locationId?.name}</h6>
                      </div>
                      <div className="col_45p">
                        <h6>{materialDetails?.itemCode ? materialDetails?.itemCode : "--"}</h6>
                      </div>
                      <div className="col_45p">
                        <h6>{materialDetails?.blockId?.blockNo}</h6>
                      </div>

                      <div className="col_45p">
                        <h6>{materialDetails?.rack ? materialDetails?.rack : "--"}</h6>
                      </div>
                      <div className="col_50p">
                        <h6>{materialDetails?.partitionName ? materialDetails?.partitionName : "--"}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.serialNo ? materialDetails?.serialNo : "--"}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.status}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.quantity}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.reamainingQuantity}</h6>
                      </div>
                      {/* <div className="col_40p">
                    <h6 className="action_wrraper">
                      {/* <CustomBtn 
                    name={"Sell"}
                    onClick={() => { setModalStates((prev) => ({ ...prev, modal: true, type: "sell" })) }}
                   /> */}
                      {/* <button
                        className="actionbtn sell_btn"
                        onClick={(e) => changeMaterialStatus(materialDetails)}
                      >
                        Sell
                      </button>
                      <button
                        className="actionbtn sell_btn"
                        style={{ background: "green" }}
                        onClick={() =>
                          setModalStates((prev) => ({
                            ...prev,
                            modal: true,
                            type: "update",
                            id: materialDetails?._id,
                          }))
                        }
                      >
                        View
                      </button>
                    </h6> 
                  </div> */}
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
      {/* {pageCount > 1 && (
        <div className="pagination_wrapper">
          
        </div>
      )} */}
      {modalStates?.modal && <InventoryView data={{ modalStates, setModalStates }} />}
    </>
  );
};

export default Inventory;
