"use client";
import CustomBtn from "@/common-components/CustomBtn";
import Loader from "@/common-components/Loader";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { communication } from "@/services/communication";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const VendorReportList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportDetails, setReportDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);

  const getReportMaterialList = async (page = 1, searchString = "") => {
    try {
      setLoader(true);
      const serverResponse = await communication.getVendorWiseStockList(
        searchParams.get("vendorId"),
        page,
        searchString
      );

      console.log('searchParams.get("vendorId"), : ', searchParams.get("vendorId"))
      if (serverResponse?.data?.status === "SUCCESS") {
        const flattenedRecords = serverResponse?.data?.result?.flatMap(
          (cat) => cat?.stocks || []
        );
        setReportDetails(flattenedRecords);
        setData(flattenedRecords);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
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
    clearTimeout(timeoutId);
    const _timeOutId = setTimeout(() => {
      const query = e.target.value?.toLowerCase() ?? "";
      if (query) {
        const filtered = data.filter((item) => {
          return (
            item?.location?.name?.toLowerCase()?.includes(query) ||
            item?.brand?.name?.toLowerCase()?.includes(query) ||
            item?.category?.name?.toLowerCase()?.includes(query) ||
            item?.conditionType?.toLowerCase()?.includes(query) ||
            item?.status?.toLowerCase()?.includes(query) ||
            item?.model?.name?.toLowerCase()?.includes(query)
          );
        });
        setReportDetails(filtered);
      } else {
        setReportDetails(data);
      }
    }, 1000);
    setTimeoutId(_timeOutId);
  };


  useEffect(() => {
    getReportMaterialList(currentPage, searchString);
  }, [isPageUpdated, searchString]);


  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title" style={{ textTransform: "capitalize" }}>
          {"Vendor Report"}
        </div>
        <Pagination
          isPageUpdated={isPageUpdated}
          setIsPageUpdated={setIsPageUpdated}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
        />
      </div>
      <div className="search_btn_wrapper">
        <Search onChange={(e) => handleSearch(e)} placeholder={"Search"} />
        <div className="pagination_wrapper">
          <div className="buttons_wrapper mt-2">
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
              <div className="col_30p">
                <h5>Location</h5>
              </div>
              <div className="col_25p">
                <h5>Condition Type</h5>
              </div>
              <div className="col_20p">
                <h5>QTY</h5>
              </div>
              <div className="col_20p">
                <h5>Status</h5>
              </div>
            </div>
            {reportDetails?.length > 0 ? (
              <>
                {reportDetails?.map((data, index) => {
                  return (
                    <div className="table_data" key={data?._id}>
                      <div className="col_15p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.category?.name ?? "--"}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.brand?.name ?? "--"}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.model?.name ?? "--"}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{data?.location?.name ?? "--"}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{data?.conditionType ?? "--"}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.quantity ?? "--"}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.status ?? "--"}</h6>
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
    </>
  );
};

export default VendorReportList;
