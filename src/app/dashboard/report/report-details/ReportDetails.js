"use client";
import CustomBtn from '@/common-components/CustomBtn';
import Loader from '@/common-components/Loader';
import Pagination from '@/common-components/Pagination';
import Search from '@/common-components/Search';
import { communication } from '@/services/communication';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

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
    reportId,
    reportType,
    searchString = "",
    categoryValue,
    brandValue,
    isFirstCall,
  } = {}) => {
    try {
      let payload = {
        type: searchParams.get("reportType"),
        searchString: searchString,
        page
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
      setLoader(true)

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
      setLoader(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false)
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
        page: 1
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
    });
  }, [isPageUpdated]);
  useEffect(() => {
    setReportType(searchParams.get("reportType"));
  }, []);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}

      <div className="top_header">
        <div className="tab_title" style={{ textTransform: "capitalize" }}>{searchParams?.get("reportType") === "graph" ? `${searchParams.get("reportData")} Stock Out List` : `${searchParams.get("selectedType")} stock List`}</div>
        <div
          className="back_btn"
          onClick={() => {
            router.back();
          }}
        >
          <div>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1564_1770)">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3.07615 5.61732C3.23093 5.24364 3.59557 5 4.00003 5H14C17.866 5 21 8.13401 21 12C21 15.866 17.866 19 14 19H5.00003C4.44774 19 4.00003 18.5523 4.00003 18C4.00003 17.4477 4.44774 17 5.00003 17H14C16.7615 17 19 14.7614 19 12C19 9.23858 16.7615 7 14 7H6.41424L8.20714 8.79289C8.59766 9.18342 8.59766 9.81658 8.20714 10.2071C7.81661 10.5976 7.18345 10.5976 6.79292 10.2071L3.29292 6.70711C3.00692 6.42111 2.92137 5.99099 3.07615 5.61732Z"
                  fill="#79080a"
                />
              </g>
              <defs>
                <clipPath id="clip0_1564_1770">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div>Back</div>
        </div>
      </div>
      <div className="search_btn_wrapper">
        <Search onChange={(e) => handleSearch(e)} placeholder={"Search"} />
      </div>

      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main" >
          <div className="table_section employee_table">
            <div className="table_header" >

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
              {searchParams?.get("reportType") === "graph" ?
                <div className="col_25p">
                  <h5>Stock Out By</h5>
                </div>
                :
                <div className="col_25p">
                  <h5>Stock Status</h5>
                </div>
              }
            </div>
            {
              reportDetails?.map((data, index) => {
                return <>
                  <div className="table_data" >
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
                    {searchParams?.get("reportType") === "graph" ?
                      <div className="col_20p">
                        <h6>{data?.quantity}</h6>
                      </div>
                      :
                      <div className="col_20p">
                        <h6>{data?.reamainingQuantity}</h6>
                      </div>
                    }

                    {searchParams?.get("reportType") === "graph" ?
                      <div className="col_25p">
                        <h6>{data?.stockOutBy?.name}</h6>
                      </div>
                      :
                      <div className="col_25p">
                        <h6>{data?.stockStatus}</h6>
                      </div>
                    }
                  </div>
                </>
              })
            }

          </div>

        </div>
      </div>
      <div className="pagination_wrapper">
        <Pagination
          isPageUpdated={isPageUpdated}
          setIsPageUpdated={setIsPageUpdated}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
        />
      </div>
    </>
  );
};

export default ReportDetails;
