"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import CreateBrand from "./CreateBrand";
import { toast } from "react-toastify";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

const BrandList = () => {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({ deleteBrand: false, modal: false, type: "", id: "" });
  const [brandList, setBrandList] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [loader, setLoader] = useState(false);
  const [timeoutId, setTimeoutId] = useState();
  // pagination states
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

  //get brand on initial load
  const getBrandList = async (page, searchString) => {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllBrand({ page, searchString });
      if (serverResponse?.data?.status === "SUCCESS") {
        setBrandList(serverResponse?.data?.brand);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        setLoader(false);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse?.data?.message);
        router.push("/");
        setLoader(false);
      } else {
        setBrandList([]);
        setLoader(false);
      }
    } catch (error) {
      toast.error(error?.message);
      setLoader(false);
    }
  }

  const deleteBrand = async () => {
    try {
      setLoader(true);
      setModalStates((prev) => ({ ...prev, deleteBrand: false }));
      if (selectedCheckboxes.length === 0) {
        toast.info("Please select at lease one brand to delete");
        return false
      }
      let response = await communication.deleteBrand({
        brandIds: [...selectedCheckboxes],
      });
      if (response?.data?.status === "SUCCESS") {
        setSelectedCheckboxes([]);
       
        await getBrandList(1, "");
        toast.success(response?.data?.message);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response?.data?.message);
        router.push("/");
      } else {
        toast.info(response?.data?.message);
      }
    } catch (error) {
      toast.info(error?.message);
    } finally {
      setLoader(false);
    }
  };

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getBrandList(1, e.target.value);
      setCurrentPage(1);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    setSelectAllChecked((!selectedCheckboxes.includes(checkboxId) && (selectedCheckboxes.length + 1 === brandList.length)))
    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(checkboxId)) {
        // If the checkbox is already in the array, remove it
        return prevSelected.filter((id) => id !== checkboxId);
      } else {
        // If the checkbox is not in the array, add it
        return [...prevSelected, checkboxId];
      }
    });

  };

  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);

    // Update the array of selected checkboxes based on the "Select All" checkbox
    setSelectedCheckboxes((prevSelected) =>
      e.target.checked ? brandList.map((brandDetails) => brandDetails._id) : []
    );
  };

  useEffect(() => {
    getBrandList(currentPage, searchString);
  }, [isPageUpdated]);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      {
        modalStates.deleteBrand &&
        <CustomResponseHandlerModal
          status="warning"
          message={`Do you want to delete brand?`}
          successHandler={() => { deleteBrand() }}
          cancelHandler={() => { setModalStates((prev) => ({ ...prev, deleteBrand: false })) }}
        />
      }
      <div className="top_header">
        <div className="tab_title">Brands</div>
      </div>
      <div className="search_btn_wrapper">
        <Search value={searchString} onChange={(e) => handleSearch(e)} placeholder={"Search"} />

        <div className="buttons_wrapper">
          <CustomBtn
            name={"Create"}
            onClick={() => {
              setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
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
          <CustomBtn
            name={"Delete"}
            onClick={() => {
              setModalStates((prev) => ({ ...prev, deleteBrand: true }));
            }}
            svg={<FontAwesomeIcon icon={faTrash} />}
          />
        </div>

      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section">
            <div className="table_header">
              <div className="col_15p">
                <div className="check_box">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    onChange={(e) => handleSelectAllChange(e)}
                    checked={selectAllChecked}
                  />
                  <label className="form-check-label"></label>
                </div>
              </div>
              <div className="col_10p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_35p">
                <h5> Brand</h5>
              </div>
              <div className="col_35p">
                <h5>Category</h5>
              </div>
              <div className="col_20p">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {brandList?.map((data, index) => {
              return (<>
                <div
                  className="table_data"
                  key={index}
                >
                  <div className="col_15p">
                    <div className="check_box">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={data._id}
                        onChange={(e) => handleCheckboxChange(e)}
                        checked={selectedCheckboxes.includes(data._id)}
                      />
                      <label className="form-check-label"></label>
                    </div>
                  </div>
                  <div className="col_10p">
                    <h6>{((Number(pageLimit) * (page - 1))) + (index + 1)}</h6>
                  </div>

                  <div className="col_35p">
                    <h6>{data?.name}</h6>
                  </div>

                  <div className="col_35p">
                    <h6>{data?.categoryId?.name}</h6>
                  </div>

                  <div className="col_20p">
                    <h6 className="action_wrraper">
                      <div title="Update">
                        <svg
                          onClick={() => {
                            setModalStates((prev) => ({
                              ...prev,
                              modal: true,
                              type: "update",
                              id: data?._id,
                            }));
                          }}
                          width="27"
                          height="27"
                          viewBox="0 0 25 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_279_5204)">
                            <path
                              d="M17.5 15V17.5C17.5 17.8315 17.3683 18.1495 17.1339 18.3839C16.8995 18.6183 16.5815 18.75 16.25 18.75H7.5C7.16848 18.75 6.85054 18.6183 6.61612 18.3839C6.3817 18.1495 6.25 17.8315 6.25 17.5V8.75C6.25 8.41848 6.3817 8.10054 6.61612 7.86612C6.85054 7.6317 7.16848 7.5 7.5 7.5H10"
                              stroke="#0D6EFD"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M12.8125 14.875L18.75 8.875L16.125 6.25L10.1875 12.1875L10 15L12.8125 14.875Z"
                              stroke="#0D6EFD"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_279_5204">
                              <rect width="15" height="15" fill="white" transform="translate(5 5)" />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </h6>
                  </div>
                </div >
              </>)
            })}
          </div>
        </div>
      </div >
      {pageCount > 0 && (
        <div className="pagination_wrapper">
          <Pagination
            isPageUpdated={isPageUpdated}
            setIsPageUpdated={setIsPageUpdated}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageCount={pageCount}
          />
        </div>
      )
      }
      {
        modalStates?.modal && (
          <CreateBrand data={{ modalStates, setModalStates, setIsPageUpdated,getBrandList, searchString, currentPage}} />
        )
      }
    </>
  )
};

export default BrandList;
