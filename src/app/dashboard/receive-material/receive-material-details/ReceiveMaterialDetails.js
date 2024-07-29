"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { getCookiesData } from "@/utilities/getCookiesData";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import Link from "next/link";
import CreateTransferMaterial from "../../transfer-material/CreateTrasferMaterial";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
const ReceiveMaterialDetails = () => {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
  const [searchString, setSearchString] = useState("");
  const [loader, setLoader] = useState(false);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [timeoutId, setTimeoutId] = useState();
  const [page, setPage] = useState(1);
  const [material, setMaterial] = useState([]);
  const params = useSearchParams();
  //get transfer material list on initial Load
  async function getTransferMaterialDetails() {
    try {
      setLoader(true);
      const serverResponse = await communication.getTransferMaterialDetails({
        transferMaterialId: params.get("materialId"),
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        // console.log("serverResponse", serverResponse?.data?.transferMaterial);
        setMaterial(serverResponse?.data?.transferMaterial[0]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getTransferMaterialDetails("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getTransferMaterialDetails();
  }, []);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title">Receive Material Details</div>
      </div>
      <div className="search_btn_wrapper">
        <Search value={searchString} onChange={handleSearch} placeholder={"Search"} />
        {
          <div className="buttons_wrapper">
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
                      fill="#184965"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1564_1770">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Back
              </div>
           
            </div>
          </div>
        }
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
                <h5>From Location</h5>
              </div>{" "}
              <div className="col_30p">
                <h5>To Location</h5>
              </div>
              <div className="col_30p">
                <h5>Category</h5>
              </div>
              <div className="col_30p">
                <h5>Brand</h5>
              </div>
              <div className="col_30p">
                <h5>Model</h5>
              </div>
              <div className="col_30p">
                <h5>Item Code</h5>
              </div>{" "}
              <div className="col_30p">
                <h5>Serial No</h5>
              </div>
              <div className="col_30p">
                <h5>Quantity</h5>
              </div>
              <div className="col_30p">
                <h5>Remaning Quantity</h5>
              </div>
              <div className="col_30p">
                <h5>Status</h5>
              </div>
            </div>

            {material?.materialIds?.length > 0 ? (
              material?.materialIds?.map((transferItem, index) => {
                return (
                  <>
                    <div className="table_data" key={index}>
                      <div className="col_10p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{material?.fromLocation?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{material?.toLocation?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.categoryId?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.brandId?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.modelId?.name}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.itemCode}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.serialNo}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.quantity}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.reamainingQuantity}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{transferItem?.storeStatus}</h6>
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

export default ReceiveMaterialDetails;
