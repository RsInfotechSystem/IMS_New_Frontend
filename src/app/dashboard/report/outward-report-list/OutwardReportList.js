"use client";
import CustomBtn from "@/common-components/CustomBtn";
import Loader from "@/common-components/Loader";
import Search from "@/common-components/Search";
import { communication } from "@/services/communication";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";

const OutwardReportList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reportDetails, setReportDetails] = useState([]);
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);

  const getReportMaterialList = async (page = 1, searchString = "") => {
    try {
      setLoader(true);
      const serverResponse = await communication.getCategoryWiseOutwardReport(
        searchParams.get("categoryId"),
        page,
        searchString
      );

      if (serverResponse?.data?.status === "SUCCESS") {
        // Flatten all records from each category result
        const flattenedRecords = serverResponse?.data?.result?.flatMap((cat) =>
          cat?.records?.map((rec) => ({
            ...rec,
            category: cat.category, // set category string
          }))
        );
        setReportDetails(flattenedRecords);
        setData(flattenedRecords);
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
          const stock = item?.stock || {};
          return (
            stock?.location?.toLowerCase()?.includes(query) ||
            stock?.brand?.toLowerCase()?.includes(query) ||
            item?.category?.toLowerCase()?.includes(query) ||
            stock?.conditionType?.toLowerCase()?.includes(query) ||
            stock?.status?.toLowerCase()?.includes(query) ||
            stock?.modelId?.name?.toLowerCase()?.includes(query)
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
    getReportMaterialList(1, searchString);
  }, [searchString]);


  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title" style={{ textTransform: "capitalize" }}>
          {"Outward Report"}
        </div>
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
                <h5> Stock OutBy</h5>
              </div>
            </div>
            {reportDetails?.length > 0 ? (
              <>
                {reportDetails?.map((data, index) => {
                  const stock = data?.stock || {};
                  return (
                    <div className="table_data" key={data?._id}>
                      <div className="col_15p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.category}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{stock?.brand}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.model?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{stock?.location}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{stock?.conditionType}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.quantity}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{data?.stockOutBy}</h6>
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

export default OutwardReportList;
