"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import { communication, getServerUrl } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { toast } from "react-toastify";
import { getCookiesData } from "@/utilities/getCookiesData";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/helper/formatDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import StockFilter from "@/common-components/StockFilter";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const NrMateial = () => {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({
    modal: false,
    type: "",
    id: "",
    filter: false,
    isView: false,
  });
  const [departmentList, setDepartmentList] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [loader, setLoader] = useState(false);
  // pagination states
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const [page, setPage] = useState(1);
  const [material, setMaterial] = useState([]);
  const [timeoutId, setTimeoutId] = useState();

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

  const [nrMaterial, setNrMaterial] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [showModal, setShowModal] = useState({ modal: false });
  const [filter, setFilter] = useState({});

  async function getNrMaterialList(
    page,
    searchString,
    isSearch = false,
    isFirstCall,
    location,
    categoryId,
    brandId,
    modelId
  ) {
    // async function getNrMaterialList({ page = 1, searchString, isSearch = false, isFirstCall, location, categoryId, brandId, modelId }) {
    try {
      setLoader(true);
      const serverResponse = await communication.getNrMaterialList({
        page: page,
        searchString: searchString,
        location,
        categoryId,
        brandId,
        modelId,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setNrMaterial(serverResponse?.data?.stock);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        setNrMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  }

  const sellStock = async (type, stockId) => {
    setShowModal((prev) => ({ ...prev, modal: false }));
    setLoader(true);
    try {
      setLoader(true);
      const serverResponse = await communication.sellNrMaterial({ type, stockId });
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        getNrMaterialList(1, "");
        setSelectAllChecked(false);
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
    } finally {
      setLoader(false);
    }
  };

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getNrMaterialList({ page: 1, searchString: e.target.value, isSearch, ...filter });
      setCurrentPage(1);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  const successHandler = async () => {
    setShowModal((prev) => ({ ...prev, modal: false }));
    setLoader(true);
    try {
      let response = await communication.sellNrMaterial(type, stockId);
      if (response?.data?.status === "SUCCESS") {
        setSelectedCheckboxes([]);
        toast.success(response.data.message);
        await getNrMaterialList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoader(false);
    }
  };

  const cancelHandler = () => {
    setShowModal((prev) => ({ ...prev, modal: false }));
  };

  useEffect(() => {
    getNrMaterialList(currentPage, searchString);
  }, [isPageUpdated]);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      {modalStates?.filter && (
        <StockFilter
          setModalStates={setModalStates}
          apiCall={getNrMaterialList}
          filter={filter}
          setFilter={setFilter}
        />
      )}
      <div className="top_header">
        <div className="tab_title">NR Material</div>
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
              name={"Reset Filter"}
              onClick={() => {
                getNrMaterialList();
              }}
              style={{ padding: "0px", minWidth: "100px" }}
            />
            <CustomBtn
              name={"Sell"}
              // onClick={() => {
              //   setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
              // }}
              // svg={<FontAwesomeIcon icon={faTrash} />}
              onClick={() => sellStock("all")}
            />
          </div>
        }
      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section inventory_table_res" style={{ minWidth: "1500px" }}>
            <div className="table_header">
              <div className="col_15p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_40p">
                <h5>Category Name</h5>
              </div>
              <div className="col_35p">
                <h5>Brand Name</h5>
              </div>
              <div className="col_35p">
                <h5>Location Name</h5>
              </div>
              <div className="col_35p">
                <h5>Model Name</h5>
              </div>
              <div className="col_35p">
                <h5>Item Code</h5>
              </div>
              <div className="col_35p">
                <h5>Block Name</h5>
              </div>
              <div className="col_35p">
                <h5>Rack Name</h5>
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
              <div className="col_20p">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {nrMaterial.length > 0 ? (
              <>
                {nrMaterial?.map((materialDetails, index) => {
                  return (
                    <div className="table_data" key={index}>
                      <div className="col_15p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_40p user_profile_wrapper">
                        {/* <Image
                                            src={`${getServerUrl()}/getFiles/${materialDetails?.modelId?.files[0]?.fileUrl
                                                }`}
                                            width={40}
                                            height={40}
                                            alt="Profile"
                                        /> */}
                        <h6
                          onClick={() => {
                            router.push(
                              `/dashboard/inventory/inventory-update?stockId=${materialDetails?._id}&type=view`
                            );
                          }}
                        >
                          <strong>{materialDetails?.categoryId?.name}</strong>
                        </h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.brandId?.name}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.locationId?.name}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>
                          {materialDetails?.modelId?.name ? materialDetails?.modelId?.name : "-"}
                        </h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.itemCode}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.blockId?.blockNo}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>
                          {materialDetails?.rackId?.rackName
                            ? materialDetails?.rackId?.rackName
                            : "-"}
                        </h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.serialNo}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.status}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{materialDetails?.quantity}</h6>
                      </div>
                      <div className="col_20p">
                        <div className="buttons_wrapper">
                          <CustomBtn
                            name={"Sell"}
                            // onClick={() => {
                            //   setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
                            // }}
                            // svg={<FontAwesomeIcon icon={faTrash} />}
                            onClick={(e) => sellStock("single", materialDetails._id)}
                          />
                          {showModal.modal && (
                            <CustomResponseHandlerModal
                              status="warning"
                              // show={showModal}
                              message="Are you sure you want to sell this stock?"
                              successHandler={successHandler}
                              cancelHandler={cancelHandler}
                            />
                          )}
                        </div>
                      </div>
                      {/* <div className="col_20p">
                                        <h6 className="action_wrraper">
                                            <div title="Update">
                                                <svg
                                                    onClick={() => {
                                                        router.push(
                                                            `/dashboard/inventory/inventory-update?stockId=${materialDetails?._id
                                                            }&isView=${true}`
                                                        );
                                                    }}
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
    </>
  );
};

export default NrMateial;
