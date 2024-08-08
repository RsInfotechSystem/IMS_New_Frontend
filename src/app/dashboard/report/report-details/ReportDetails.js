"use client";
import CustomBtn from "@/common-components/CustomBtn";
import Loader from "@/common-components/Loader";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import StockFilter from "@/common-components/StockFilter";
import { communication } from "@/services/communication";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ReportDetails = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportDetails, setReportDetails] = useState();
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [timeoutId, setTimeoutId] = useState();
  const [reportType, setReportType] = useState();
  const [loader, setLoader] = useState(false);
  const [filter, setFilter] = useState({});
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "", filter: false, isView: false });
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    reportId: "",
    reportType: "",
  });
  const [stateFilter, setStateFilter] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
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
    }
  );

  function formatDate(dateString) {
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    // Split the date string into parts
    const parts = dateString.split(" ");

    // Extract the day, month, and year
    const day = parts[0].padStart(2, "0");
    const month = months[parts[1]];
    const year = parts[2];

    // Return the formatted date
    return `${year}-${month}-${day}`;
  }

  const getReportMaterialList = async ({
    page = 1,
    searchString,
    userId,
    isSearch = false, isFirstCall, location, categoryId, brandId, modelId,
  } = {}) => {
    try {
      let payload = {
        type: searchParams.get("reportType"),
        searchString: searchString,
        page,
        location,
        categoryId,
        brandId,
        modelId,
      };
      if (searchParams.get("reportType") === "brand") {
        payload.brandId = searchParams.get("reportData");
      }

      if (searchParams.get("reportType") === "location") {
        payload.location = searchParams.get("reportData");
      }

      if (searchParams.get("reportType") === "category") {
        payload.categoryId = searchParams.get("reportData");
      }

      if (searchParams.get("reportType") === "status") {
        payload.status = searchParams.get("reportData");
      }

      if (searchParams.get("reportType") === "graph") {
        payload.date = searchParams.get("reportData");
      }
      setLoader(true);

      const serverResponse = await communication.getReportMaterialList(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setReportDetails(serverResponse?.data?.material);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isFirstCall) {
          setStateFilter({
            category: Array.from(
              new Set(
                serverResponse?.data.material?.map((item) =>
                  JSON.stringify({
                    categoryId: item.categoryId._id,
                    category: item.categoryId.name,
                  })
                )
              )
            )?.map((item) => JSON.parse(item)),
            brand: Array.from(
              new Set(
                serverResponse?.data?.material?.map((item) =>
                  JSON.stringify({ brandId: item.brandId._id, brand: item.brandId.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            modelName: Array.from(
              new Set(
                serverResponse?.data?.material?.map((item) =>
                  JSON.stringify({ modelId: item.modelId._id, modelName: item.modelId.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            location: Array.from(
              new Set(
                serverResponse?.data?.material?.map((item) =>
                  JSON.stringify({
                    locationId: item.locationId._id,
                    location: item.locationId.name,
                  })
                )
              )
            ).map((item) => JSON.parse(item)),
          });
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        toast.info(serverResponse.data.message);
        setReportDetails([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  };
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getReportMaterialList({
        reportId: state.reportId,
        reportType: state.reportType,
        searchString: e.target.value,
        page: 1,
        isSearch,
        ...filter
      });
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    let isSearch = true;
    // clearTimeout(timeoutId);
    // let _timeOutId = setTimeout(() => {
    getReportMaterialList({
      page: 1,
      isSearch,
      reportId: searchParams.get("reportData"),
      reportType: searchParams.get("reportType"),
      searchString,
      ...filter
    });
    // }, 2000);
    // setTimeoutId(_timeOutId);
  }, [
    stateFilter.categoryValue.keyId,
    stateFilter.brandValue.keyId,
    stateFilter.locationValue.keyId,
    stateFilter.modelNameValue.keyId,
  ]);
  useEffect(() => {
    getReportMaterialList({
      reportId: searchParams.get("reportData"),
      reportType: searchParams.get("reportType"),
      page: currentPage,
      searchString,
      isFirstCall: true,
      ...filter
    });
  }, [isPageUpdated]);
  useEffect(() => {
    setReportType(searchParams.get("reportType"));
  }, []);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      {modalStates?.filter && <StockFilter setModalStates={setModalStates} apiCall={getReportMaterialList} filter={filter} setFilter={setFilter} />}

      <div className="top_header">
        <div className="tab_title" style={{ textTransform: "capitalize" }}>
          {searchParams?.get("reportType") === "graph"
            ? `${searchParams.get("reportData")} Stock Out List`
            : `${searchParams.get("selectedType")} stock List`}
        </div>
      
      </div>
      <div className="search_btn_wrapper">
        <Search onChange={(e) => handleSearch(e)} placeholder={"Search"} />
        <div className="pagination_wrapper">
          <Pagination
            isPageUpdated={isPageUpdated}
            setIsPageUpdated={setIsPageUpdated}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageCount={pageCount}
          />
          
        
           <div className="buttons_wrapper mt-2">
            
        <CustomBtn
            name={"Filter"}
            onClick={() => {
              setModalStates((prev) => ({ ...prev, filter: true }));
            }}
            svg={
              <svg xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 512 512" fill="#fff">
                <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
              </svg>
            }
          />
        <CustomBtn
            name={"Reset Filter"}
            onClick={() => {
              getReportMaterialList();
            }}
            style={{padding:"0px",minWidth:"120px"}}
          />
           <CustomBtn
              name="Back"
              onClick={() => {
                router.back();
              }}
            />
        </div>
        </div>
      </div>
      

      {/* table  */}
      <div className="table_wrapper mt-3">
        <div className="table_main">
          <div className="table_section employee_table">
            <div className="table_header">
              <div className="col_15p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_20p">
                <h5>Category</h5>
              </div>
              <div className="col_20p">
                <h5>Brand</h5>
              </div>
              <div className="col_20p">
                <h5>Model Name</h5>
              </div>
              <div className="col_20p">
                <h5>Location</h5>
              </div>
              <div className="col_20p">
                <h5>Block Name</h5>
              </div>
              <div className="col_25p">
                <h5>Condition Type</h5>
              </div>
              <div className="col_20p">
                <h5>Serial No.</h5>
              </div>

              <div className="col_20p">
                <h5>Quantity</h5>
              </div>
              {searchParams?.get("reportType") === "graph" ? (
                <div className="col_25p">
                  <h5>Stock Out By</h5>
                </div>
              ) : (
                <div className="col_25p">
                  <h5>Stock Status</h5>
                </div>
              )}
            </div>
            {reportDetails?.map((data, index) => {
              return (
                <>
                  <div className="table_data">
                    <div className="col_15p">
                      <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                    </div>
                    <div className="col_20p">
                      <h6>{data?.categoryId?.name}</h6>
                    </div>
                    <div className="col_20p">
                      <h6>{data?.brandId?.name}</h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.modelId?.name}</h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.locationId?.name}</h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.blockId?.blockNo}</h6>
                    </div>

                    <div className="col_25p">
                      <h6>{data?.conditionType}</h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.serialNo ?? "--"}</h6>
                    </div>
                    {searchParams?.get("reportType") === "graph" ? (
                      <div className="col_20p">
                        <h6>{data?.quantity}</h6>
                      </div>
                    ) : (
                      <div className="col_20p">
                        <h6>{data?.reamainingQuantity}</h6>
                      </div>
                    )}

                    {searchParams?.get("reportType") === "graph" ? (
                      <div className="col_25p">
                        <h6>{data?.stockOutBy?.name}</h6>
                      </div>
                    ) : (
                      <div className="col_25p">
                        <h6>{data?.stockStatus}</h6>
                      </div>
                    )}
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportDetails;
