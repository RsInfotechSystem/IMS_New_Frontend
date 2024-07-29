"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { getCookiesData } from "@/utilities/getCookiesData";
// import CreateCategory from "./CreateCategory";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import Link from "next/link";
import CreateTransferMaterial from "./CreateTrasferMaterial";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
const TransferMaterialList = () => {
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

  //get transfer material list on initial Load
  async function getTransferMaterial(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getTransferMaterial({ page, searchString });
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterialList(serverResponse?.data?.transferMaterial);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        toast.info(serverResponse.data.message)
        router.push("/");
      } else {
        setMaterialList([]);
      }
      setLoader(false);
    } catch (error) {
           toast.info(error?.response?.data?.message || error.message)

      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getTransferMaterial("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    // getTransferMaterial(currentPage, searchString);
    getTransferMaterial(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title">Transfer Material</div>
      </div>
      <div className="search_btn_wrapper">
        <Search value={searchString} onChange={handleSearch} placeholder={"Search"} />
        {
          <div className="buttons_wrapper">
            <CustomBtn
              name={"Transfer"}
              // onClick={() => {
              //   setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
              // }}
              onClick={() => {
                router.push("./transfer-material/transfer-material-form");
              }}
              svg={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9V11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15V12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
                    fill="#F3F8FF"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                    fill="#F3F8FF"
                  />
                </svg>
              }
            />
            {/* <CustomBtn
              name={"Delete"}
              // onClick={() => {
              //   setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
              // }}
              svg={<FontAwesomeIcon icon={faTrash} />}
              onClick={deletecategory}
            />
            {showModal.modal && (
              <CustomResponseHandlerModal
                status="warning"
                // show={showModal}
                message="Are you sure you want to delete this role?"
                successHandler={successHandler}
                cancelHandler={cancelHandler}
              />
            )} */}
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
                <h5>Transfer ID</h5>
              </div>
              <div className="col_30p">
                <h5>From Loaction</h5>
              </div>
              <div className="col_30p">
                <h5>To Location</h5>
              </div>
              <div className="col_30p">
                <h5>Transfer By</h5>
              </div>
              <div className="col_30p">
                <h5>Status</h5>
              </div>
              <div className="col_30p">
                <h5>Date</h5>
              </div>
            </div>

            {materialList?.length > 0 ? (
              materialList?.map((modelData, index) => {
                return (
                  <>
                    <div className="table_data" key={index}>
                      <div className="col_10p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>
                        <Link
                          href={`./transfer-material/transfer-material-details?materialId=${modelData._id}`}
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
                        <h6>{modelData?.status}</h6>
                      </div>{" "}
                      <div className="col_30p">
                        <h6>{new Date(modelData?.createdAt).toLocaleDateString("hi")}</h6>
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

export default TransferMaterialList;
