"use client";
import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faFileInvoice, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loader from "@/common-components/Loader";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import { formatDate } from "@/helper/formatDate";
import { getPIDetailById } from "@/apis/common-apis";
import { getCookiesData } from "@/utilities/getCookiesData";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import ViewPo from "../po-management/ViewPo";
import ViewBill from "../po-management/ViewBill";

const StockOut = () => {
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT;
  const router = useRouter();
  const [poList, setPoList] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [loader, setLoader] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [modalState, setModalStates] = useState({
    viewPO: false,
    viewPdf: false,
    data: "",
    deletePo: false,
    poId: "",
  });

  // pagination states
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);

  // Fetch purchase order list on initial load
  const getPOList = async (page, searchString) => {
    try {
      setLoader(true);
      const serverResponse = await communication.getStockOutMaterial({ page, searchString });
      if (serverResponse?.data?.status === "SUCCESS") {
        setPoList(serverResponse?.data?.po);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        setLoader(false);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse?.data?.message);
        router.push("/");
        setLoader(false);
      } else {
        setPoList([]);
        setLoader(false);
      }
    } catch (error) {
      if (error?.name === "CanceledError") {
        // api cancelled
      } else {
        toast.error(error?.message);
        setLoader(false);
      }
    }
  };

  async function deletePo(poId) {
    try {
      setLoader(true);
      setModalStates((prev) => ({ ...prev, deletePo: false, poId: "" }));
      const serverResponse = await communication.deleteCompletedPo(poId);
      if (serverResponse?.data?.status === "SUCCESS") {
        await getPOList(1, searchString);
        toast.success(serverResponse?.data?.message);
        setLoader(false);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse?.data?.message);
        router.push("/");
        setLoader(false);
      } else {
        setPoList([]);
        setLoader(false);
      }
    } catch (error) {
      toast.error(error?.message);
      setLoader(false);
    }
  }

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getPOList(1, e.target.value);
      setCurrentPage(1);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    getPOList(currentPage, searchString);
  }, [isPageUpdated]);

  return (
    <>
      {loader && <Loader text={"Fetching Data..."} />}

      {modalState.deletePo && (
        <CustomResponseHandlerModal
          status="warning"
          message={`Do you want to delete?`}
          successHandler={() => {
            deletePo(modalState?.poId);
          }}
          cancelHandler={() => {
            setModalStates((prev) => ({ ...prev, deletePo: false, poId: "" }));
          }}
        />
      )}

      {modalState.viewPO && <ViewPo data={modalState?.data} setModalStates={setModalStates} />}

      {modalState.viewPdf && (
        <ViewBill pdfData={modalState?.data} setModalStates={setModalStates} />
      )}

      {/* top header  */}
      <div className="top_header">
        <div className="tab_title">Stock Out</div>
      </div>
      <div className="search_btn_wrapper">
        <Search value={searchString} onChange={(e) => handleSearch(e)} placeholder={"Search"} />
      </div>

      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          {/* Rename the class name "purchase_indent_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
          <div className="table_section purchase_indent_table">
            <div className="table_header z-2">
              <div className="col_10p">
                <h5>Sr. No.</h5>
              </div>

              <div className="col_20p">
                <h5>Order Id</h5>
              </div>

              <div className="col_20p">
                <h5>Customer Name</h5>
              </div>

              <div className="col_15p">
                <h5>Type</h5>
              </div>

              <div className="col_20p">
                <h5>Generated By</h5>
              </div>
              <div className="col_15p">
                <h5>Date</h5>
              </div>

              <div className="col_30p">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {poList?.length > 0 ? (
              poList?.map((data, index) => {
                return (
                  <div className="table_data" key={index}>
                    <div className="col_10p">
                      <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.orderId}</h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.name}</h6>
                    </div>

                    <div className="col_15p">
                      <h6>{data?.type}</h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.createdBy?.name}</h6>
                    </div>

                    <div className="col_15p">
                      <h6>{formatDate(data?.createdAt)}</h6>
                    </div>

                    <div className="col_30p">
                      <h6 className="action_wrraper">
                        <div
                          title="view"
                          onClick={() =>
                            setModalStates((pre) => ({ ...pre, viewPO: true, data: data }))
                          }
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M12.0001 5.25C9.22586 5.25 6.79699 6.91121 5.12801 8.44832C4.28012 9.22922 3.59626 10.0078 3.12442 10.5906C2.88804 10.8825 2.70368 11.1268 2.57736 11.2997C2.51417 11.3862 2.46542 11.4549 2.43187 11.5029C2.41509 11.5269 2.4021 11.5457 2.393 11.559L2.38227 11.5747L2.37911 11.5794L2.10547 12.0132L2.37809 12.4191L2.37911 12.4206L2.38227 12.4253L2.393 12.441C2.4021 12.4543 2.41509 12.4731 2.43187 12.4971C2.46542 12.5451 2.51417 12.6138 2.57736 12.7003C2.70368 12.8732 2.88804 13.1175 3.12442 13.4094C3.59626 13.9922 4.28012 14.7708 5.12801 15.5517C6.79699 17.0888 9.22586 18.75 12.0001 18.75C14.7743 18.75 17.2031 17.0888 18.8721 15.5517C19.72 14.7708 20.4039 13.9922 20.8757 13.4094C21.1121 13.1175 21.2964 12.8732 21.4228 12.7003C21.4859 12.6138 21.5347 12.5451 21.5682 12.4971C21.585 12.4731 21.598 12.4543 21.6071 12.441L21.6178 12.4253L21.621 12.4206L21.6224 12.4186L21.9035 12L21.622 11.5809L21.621 11.5794L21.6178 11.5747L21.6071 11.559C21.598 11.5457 21.585 11.5269 21.5682 11.5029C21.5347 11.4549 21.4859 11.3862 21.4228 11.2997C21.2964 11.1268 21.1121 10.8825 20.8757 10.5906C20.4039 10.0078 19.72 9.22922 18.8721 8.44832C17.2031 6.91121 14.7743 5.25 12.0001 5.25ZM4.29022 12.4656C4.14684 12.2885 4.02478 12.1311 3.92575 12C4.02478 11.8689 4.14684 11.7115 4.29022 11.5344C4.72924 10.9922 5.36339 10.2708 6.14419 9.55168C7.73256 8.08879 9.80369 6.75 12.0001 6.75C14.1964 6.75 16.2676 8.08879 17.8559 9.55168C18.6367 10.2708 19.2709 10.9922 19.7099 11.5344C19.8533 11.7115 19.9753 11.8689 20.0744 12C19.9753 12.1311 19.8533 12.2885 19.7099 12.4656C19.2709 13.0078 18.6367 13.7292 17.8559 14.4483C16.2676 15.9112 14.1964 17.25 12.0001 17.25C9.80369 17.25 7.73256 15.9112 6.14419 14.4483C5.36339 13.7292 4.72924 13.0078 4.29022 12.4656ZM14.25 12C14.25 13.2426 13.2427 14.25 12 14.25C10.7574 14.25 9.75005 13.2426 9.75005 12C9.75005 10.7574 10.7574 9.75 12 9.75C13.2427 9.75 14.25 10.7574 14.25 12ZM15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92898 15.75 8.25005 14.0711 8.25005 12C8.25005 9.92893 9.92898 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12Z"
                              fill="#198754"
                            />
                          </svg>
                        </div>
                        <div
                          title="View Bill"
                          onClick={() =>
                            setModalStates((pre) => ({ ...pre, viewPdf: true, data: data }))
                          }
                        >
                          <FontAwesomeIcon icon={faFileInvoice} />
                        </div>
                        <div
                          title="delete"
                          onClick={() =>
                            setModalStates((prev) => ({ ...prev, deletePo: true, poId: data._id }))
                          }
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </div>
                      </h6>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="no_data">data not available</p>
            )}
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

export default StockOut;
