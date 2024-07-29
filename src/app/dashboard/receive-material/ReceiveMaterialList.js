"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { getCookiesData } from "@/utilities/getCookiesData";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import Link from "next/link";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
const ReceiveMaterialList = () => {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
  const [searchString, setSearchString] = useState("");
  const [loader, setLoader] = useState(false);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [categoryList, setCategoryList] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [page, setPage] = useState(1);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [errorForRackFlag, setErrorRackFlag] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [showModal, setShowModal] = useState({ modal: false });
  const [materialList, setMaterialList] = useState([]);
  const [receiveMaterial, setReceiveMaterial] = useState([]);
  //get transfer material list on initial Load
  async function getReceiveMaterial(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getReceiveMaterial({ page, searchString });
      if (serverResponse?.data?.status === "SUCCESS") {
        setReceiveMaterial(serverResponse?.data?.transferMaterial);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        setReceiveMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }

  useEffect(() => {
    getReceiveMaterial(currentPage, searchString);
  }, [isPageUpdated]);
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getTransferMaterial("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title">Receive Material</div>
      </div>
      <div className="search_btn_wrapper">
        <Search value={searchString} onChange={handleSearch} placeholder={"Search"} />
        { }
      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section">
            <div className="table_header">
              <div className="col_10p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_30p">
                <h5>Receive ID</h5>
              </div>
              <div className="col_30p">
                <h5>From Loaction</h5>
              </div>
              <div className="col_30p">
                <h5>To Location</h5>
              </div>
              <div className="col_30p">
                <h5>Received By</h5>
              </div>
              <div className="col_30p">
                <h5>Action</h5>
              </div>
            </div>

            {receiveMaterial?.length > 0 ? (
              receiveMaterial?.map((modelData, index) => {
                return (
                  <>
                    <div className="table_data" key={index}>
                      <div className="col_10p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>
                          <Link
                            href={`./receive-material/receive-material-details?materialId=${modelData._id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <h6 style={{ color: "#0000FF" }}>{modelData?.transferId}</h6>
                          </Link>
                        </h6>
                      </div>
                      <div className="col_30p">
                        <h6>{modelData?.fromLocation?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{modelData?.toLocation?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{modelData?.transferBy?.name}</h6>
                      </div>
                      <div className="col_30p">
                        {modelData?.acceptedBy?.name ? (
                         "--"
                        ) : (
                          <h6 >
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                router.push(
                                  `/dashboard/receive-material/receive-material-action?reciveMaterialId=${modelData?._id}`
                                )
                              }
                            >
                              Receive
                            </button>
                          </h6>
                        )}
                      </div>
                    </div>
                  </>
                );
              })
            ) : (
              <p className="no_data">Data Not Available</p>
            )}
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
      {modalStates?.modal && (
        <CreateTransferMaterial data={{ modalStates, setModalStates, setIsPageUpdated }} />
      )}
    </>
  );
};

export default ReceiveMaterialList;
