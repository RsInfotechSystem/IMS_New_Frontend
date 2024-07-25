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
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const Inventory = () => {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
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

  async function getStatusWiseMaterialList({
    page = 1,
    searchString,
    isSearch = false,
    categoryValue,
    brandValue,
    isFirstCall,
  } = {}) {
    try {
      setLoader(true);
      let payload = {
        page,
        searchString: searchString,
        ...(state.categoryValue.keyType == "category" && { categoryId: state.categoryValue.keyId }),
        ...(state.brandValue.keyType == "brand" && { brandId: state.brandValue.keyId }),
        ...(state.locationValue.keyType == "location" && { location: state.locationValue.keyId }),
        ...(state?.modelNameValue?.keyType == "modelName" && {
          modelId: state?.modelNameValue?.keyId,
        }),
      };
      // console.log(categoryValue, brandValue, "rr");
      const serverResponse = await communication.getInventoryMaterial(payload);

      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.stock);
        setPageCount(serverResponse?.data?.totalPages);
        if (isFirstCall) {
          setState({
            category: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ categoryId: item.categoryId, category: item.category })
                )
              )
            ).map((item) => JSON.parse(item)),
            brand: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ brandId: item.brandId, brand: item.brand })
                )
              )
            ).map((item) => JSON.parse(item)),
            modelName: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ modelId: item?.modelId?._id, modelName: item?.modelId?.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            location: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ locationId: item.locationId, location: item.location })
                )
              )
            ).map((item) => JSON.parse(item)),
          });
        }
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
      } else {
        // Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        setMaterial([]);
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
      getStatusWiseMaterialList({ page: 1, searchString: e.target.value, isSearch });
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
      <div className="top_header">
        <div className="tab_title">Inventory</div>
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
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section">
            <div className="table_header">
              {/* <div className="col_20p">
                <div className="check_box">
                  <input
                    className="form-check-input"
                    type="checkbox"
                  //   checked={selectedTabs?.includes(tabsName)}
                  //   onChange={() => {
                  //     handleModuleAccess(tabsName);
                  //   }}
                  //   id={tabsName}
                  //   disabled={disabled}
                  />
                  <label className="form-check-label"></label>
                </div>
              </div> */}
              <div className="col_20p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_40p">
                <h5>Category Name</h5>{" "}
              </div>
              <div className="col_35p">
                <h5>Brand Name</h5>
              </div>
              <div className="col_35p">
                <h5>Product Name</h5>
              </div>{" "}
              <div className="col_35p">
                <h5>Location Name</h5>
              </div>{" "}
              <div className="col_35p">
                <h5>Block Name</h5>
              </div>{" "}
              <div className="col_35p">
                <h5>Retail Price</h5>
              </div>{" "}
              <div className="col_35p">
                <h5>Wholesale Price</h5>
              </div>{" "}
              <div className="col_35p">
                <h5>Display Price</h5>
              </div>
              <div className="col_35p">
                <h5>Quantity</h5>
              </div>{" "}
              <div className="col_35p">
                <h5>Date</h5>
              </div>
              <div className="col_20p">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {material?.map((materialDetails, index) => {
              return (
                <>
                  <div className="table_data" key={index}>
                    {/* <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                        //   checked={selectedTabs?.includes(tabsName)}
                        //   onChange={() => {
                        //     handleModuleAccess(tabsName);
                        //   }}
                        //   id={tabsName}
                        //   disabled={disabled}
                        />
                        <label className="form-check-label"></label>
                      </div>
                    </div> */}
                    <div className="col_20p">
                      <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                    </div>
                    <div className="col_40p user_profile_wrapper">
                      <Image
                        src={`${getServerUrl()}/getFiles/${
                          materialDetails?.modelId?.files[0]?.fileUrl
                        }`}
                        width={40}
                        height={40}
                        alt="Profile"
                      />
                      <h6>
                        <strong>{materialDetails?.categoryId?.name}</strong>
                      </h6>
                    </div>
                    <div className="col_35p">
                      <h6>{materialDetails?.brandId?.name}</h6>
                    </div>
                    <div className="col_35p">
                      <h6>
                        {materialDetails?.modelId?.name ? materialDetails?.modelId?.name : "-"}
                      </h6>
                    </div>
                    <div className="col_35p">
                      <h6>{materialDetails?.locationId.name}</h6>
                    </div>

                    <div className="col_35p">
                      <h6>{materialDetails?.blockId?.blockNo}</h6>
                    </div>
                    <div className="col_35p">
                      <h6>{materialDetails?.retailPrice}</h6>
                    </div>
                    <div className="col_35p">
                      <h6>{materialDetails?.wholeSalePrice}</h6>
                    </div>
                    <div className="col_35p">
                      <h6>{materialDetails?.displayPrice}</h6>
                      <div className="col_35p">
                        <h6>{materialDetails?.quantity}</h6>
                      </div>
                    </div>
                    <div className="col_35p">
                      {/* <h6>{materialDetails?.createdAt}</h6> */}
                      <h6>{formatDate(materialDetails?.createdAt)}</h6>
                    </div>
                    <div className="col_20p">
                      <h6 className="action_wrraper">
                        <div title="Update">
                          <svg
                            // onClick={() => {
                            //   setModalStates((prev) => ({
                            //     ...prev,
                            //     modal: true,
                            //     type: "update",
                            //     id: category?._id,
                            //   }));
                            // }}
                            onClick={() => {
                              router.push(
                                `/dashboard/inventory/inventory-update?stockId=${
                                  materialDetails?._id
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
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
      {pageCount > 1 && (
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
      {/* {modalStates?.modal && (
        <CreateRack data={{ modalStates, setModalStates, setIsPageUpdated }} />
      )} */}
    </>
  );
};

export default Inventory;
