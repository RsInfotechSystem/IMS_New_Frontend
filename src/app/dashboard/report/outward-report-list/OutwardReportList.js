"use client";
import CustomBtn from "@/common-components/CustomBtn";
import Loader from "@/common-components/Loader";
import Search from "@/common-components/Search";
import { communication } from "@/services/communication";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";

const OutwardReportList = () => {
  const router = useRouter();
  const [reportDetails, setReportDetails] = useState([]);
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const [timeoutId, setTimeoutId] = useState();
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);

  const getReportMaterialList = async () => {
    try {
      setLoader(true);
      const serverResponse = await communication.getOutWardReport();
      if (serverResponse?.data?.status === "SUCCESS") {
        setReportDetails(serverResponse?.data?.stockArray);
        setData(serverResponse?.data?.stockArray);
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
      const lowerQuery = e?.target?.value?.toLowerCase() ?? "";
      if (lowerQuery) {
        const searchData = data.filter(item =>
          item.locationId.name.toLowerCase().includes(lowerQuery) ||
          item.brandId.name.toLowerCase().includes(lowerQuery) ||
          item.categoryId.name.toLowerCase().includes(lowerQuery) ||
          item.conditionType.toLowerCase().includes(lowerQuery) ||
          item.status.toLowerCase().includes(lowerQuery) ||
          item.modelId.name.toLowerCase().includes(lowerQuery)
        );
        setReportDetails(searchData)
      } else {
        setReportDetails(data);
      }

    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    getReportMaterialList();
  }, []);


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

                        <div className="col_30p">
                          <h6>{data?.locationId?.name}</h6>
                        </div>


                        <div className="col_25p">
                          <h6>{data?.conditionType}</h6>
                        </div>


                        <div className="col_20p">
                          <h6>{data?.quantity}</h6>
                        </div>

                        <div className="col_20p">
                          <h6>{data?.stockOutBy?.name}</h6>
                        </div>
                      </div>
                    </>
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
