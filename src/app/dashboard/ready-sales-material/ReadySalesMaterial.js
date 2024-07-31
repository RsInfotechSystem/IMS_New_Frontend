"use client";
import React from "react";
import Search from "@/common-components/Search";
import { useState, useEffect } from "react";
import Button from "@/common-components/Button";
// import RecipeListData from "./RecipeListData";
import CustomBtn from "@/common-components/CustomBtn";
// import AddRecipe from "./AddRecipe";
// import Logs from "./Logs";
// import UpLoad from "./UpLoad";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faCaretDown, faCaretUp, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
// import FileSaver from "file-saver";
// import { faFileExcel } from "@fortawesome/free-regular-svg-icons";
import { getCookiesData } from "@/utilities/getCookiesData";
// import ReadysalesData from "./ReadysalesData";
import Pagination from "@/common-components/Pagination";

const ReadySalesMaterial = () => {
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [_orderId, _setOrderId] = useState("");
  const [searchString, setSearchString] = useState("");
  const [loader, setLoader] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ready_sales_order");
  const [logsData, setLogsData] = useState([]);
  const [modalStates, setModalStates] = useState({
    modal: false,
    type: "",
    recipeId: "",
  });
  const [salesOrder, setSalesOrder] = useState([]);

  const [recipeUpdateData, setRecipeUpdateData] = useState({
    type: "",
    recipeId: "",
  });
  const [toggle, setToggle] = useState(false);
  const searchParams = useSearchParams();
  const [timeoutId, setTimeoutId] = useState();
  const [page, setPage] = useState(1);

  //export the excel template that will use for bulk upload
  async function getSalesOrderList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getSalesOrderList({ page, searchString });
      if (serverResponse?.data?.status === "SUCCESS") {
        setSalesOrder(serverResponse?.data?.salesorders);
        _setOrderId(serverResponse?.data?.salesorders?.map((data) => data._id));
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        setModelList([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }

  useEffect(() => {
    getSalesOrderList(currentPage, searchString);
  }, [isPageUpdated]);

  return (
    <div>
      {/* top header  */}
      <div className="top_header">
        <div className="tab_title">Ready Sales Material</div>
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
          //   value={searchString}
          //   onChange={handleSearch}

          placeholder={"Search"}
        />
        {
          // configAccess?.access === "Write" &&
          <div className="buttons_wrapper">
            <CustomBtn
              name={"Return To Inventory"}
              //   onClick={() => {
              //     setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
              //   }}
            />
            <CustomBtn
              name={"Sold"}
              // onClick={() => {
              //   setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
              // }}
              //   svg={<FontAwesomeIcon icon={faTrash} />}
              //   onClick={deleteRole}
            />
          </div>
        }
      </div>

      <div className="search_btn_wrapper">
        {/* tab wrapper */}
        <div className="my-3 d-flex justify-content-start align-items-start gap-3">
          <div
            className="tab_btn"
            onClick={() => {
              setActiveTab("ready_sales_order");
            }}
            style={{ backgroundColor: activeTab == "ready_sales_order" ? "#184965" : "#D0D3D9" }}
          >
            Ready sales order
          </div>
          <div
            onClick={() => {
              setActiveTab("sales_order");
            }}
            //   onClick={handleSubmit(handleVendorInformation)}
            className="tab_btn"
            style={{ backgroundColor: activeTab == "sales_order" ? "#184965" : "#D0D3D9" }}
          >
            Sales order
          </div>
        </div>
      </div>

      {/* Recipe List table*/}
      {activeTab === "ready_sales_order" && (
        <div className="table_wrapper">
          <div className="table_main kitchen_stock_table">
            <div className="table_section">
              <div className="table_header header_kitchen">
                {/* <div className="table_header z-2"> */}
                <div className="col_10p">
                  <h5>Sr. No.</h5>
                </div>
                <div className="col_20p">
                  <h5>Order No</h5>
                </div>
                <div className="col_20p">
                  <h5>Order Date</h5>
                </div>
                <div className="col_20p">
                  <h5>Taken By</h5>
                </div>
                <div className="col_25p">
                  <h5>Completion Date</h5>
                </div>
                <div className="col_20p">
                  <h5>Location</h5>
                </div>
                <div className="col_15p">
                  <h5>Status</h5>
                </div>
                <div className="col_15p">
                  <h5>Assign to</h5>
                </div>
              </div>
              {salesOrder.length > 0 ? (
                salesOrder.map((data, index) => (
                  <React.Fragment key={data._id}>
                    {data?.formStatus == "generate" && (
                      <>
                        <div className="table_data" key={index}>
                          <div className="col_10p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_20p">
                            <h6
                              onClick={() => {
                                router.push(
                                  `/dashboard/ready-sales-material/ready-material?orderId=${data._id}`
                                );
                              }}
                            >
                              <strong style={{ textDecoration: "none" }}>
                                {data?.salesOrderNo}
                              </strong>
                            </h6>
                          </div>
                          <div className="col_20p">
                            <h6>{data?.orderDate.split("T")[0]}</h6>
                          </div>
                          <div className="col_20p">
                            <h6>{data?.orderTakenBy?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{data?.completeBy.split("T")[0]}</h6>
                          </div>
                          <div className="col_20p">
                            <h6>{data?.orderLocation?.name}</h6>
                          </div>
                          <div className="col_15p">
                            <h6>{data?.formStatus}</h6>
                          </div>
                          <div className="col_15p">
                            <h6>{data.assignTo?.name ? data.assignTo?.name : "--"}</h6>
                          </div>
                        </div>
                      </>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="no_data">
                  <h6>No recipes found</h6>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "sales_order" && (
        <div className="table_wrapper">
          <div className="table_main kitchen_stock_table">
            <div className="table_section">
              <div className="table_header header_kitchen">
                {/* <div className="table_header z-2"> */}
                <div className="col_10p">
                  <h5>Sr. No.</h5>
                </div>
                <div className="col_20p">
                  <h5>Order No</h5>
                </div>
                <div className="col_20p">
                  <h5>Order Date</h5>
                </div>
                <div className="col_20p">
                  <h5>Taken By</h5>
                </div>
                <div className="col_25p">
                  <h5>Completion Date</h5>
                </div>
                <div className="col_20p">
                  <h5>Location</h5>
                </div>
                <div className="col_15p">
                  <h5>Status</h5>
                </div>
                <div className="col_15p">
                  <h5>Assign to</h5>
                </div>
              </div>
              {salesOrder.length > 0 ? (
                salesOrder.map((data, index) => (
                  <React.Fragment key={data._id}>
                    {data?.formStatus == "generate" && (
                      <>
                        <div className="table_data" key={index}>
                          <div className="col_10p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_20p">
                            <h6
                              onClick={() => {
                                router.push(
                                  `/dashboard/ready-sales-material/ready-material?orderId=${data._id}`
                                );
                              }}
                            >
                              <strong style={{ textDecoration: "none" }}>
                                {data?.salesOrderNo}
                              </strong>
                            </h6>
                          </div>
                          <div className="col_20p">
                            <h6>{data?.orderDate.split("T")[0]}</h6>
                          </div>
                          <div className="col_20p">
                            <h6>{data?.orderTakenBy?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{data?.completeBy.split("T")[0]}</h6>
                          </div>
                          <div className="col_20p">
                            <h6>{data?.orderLocation?.name}</h6>
                          </div>
                          <div className="col_15p">
                            <h6>{data?.formStatus}</h6>
                          </div>
                          <div className="col_15p">
                            <h6>{data.assignTo?.name ? data.assignTo?.name : "--"}</h6>
                          </div>
                        </div>
                      </>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="no_data">
                  <h6>No recipes found</h6>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadySalesMaterial;
