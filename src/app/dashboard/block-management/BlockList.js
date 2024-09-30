"use client";
import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { getCookiesData } from "@/utilities/getCookiesData";
import CreateBlock from "./CreateBlock";
import { toast } from "react-toastify";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
const BlockList = () => {
  const router = useRouter();
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
  const [departmentList, setDepartmentList] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [loader, setLoader] = useState(false);
  const [isEnableDisable, setIsEnableDisable] = useState({
    action: "disable",
    modal: false,
    blockId: "",
  });
  // pagination states
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [blockList, setBlockList] = useState([]);
  const [rackList, setRackList] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [page, setPage] = useState(1);
  const [locations, setLocations] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [propertyType, setPropertyType] = useState([]);
  const [checkedStatus, setCheckedStatus] = useState({});
  const [errorForRackFlag, setErrorRackFlag] = useState("");
  const [showModal, setShowModal] = useState({ modal: false });

  async function getBlockList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getBlockList(page, searchString);
      if (serverResponse?.data?.status === "SUCCESS") {
        setBlockList(serverResponse?.data.block);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
        const initialCheckedStatus = {};

        serverResponse?.data.block.forEach((block) => {
          initialCheckedStatus[block._id] = block.isActive || false;
        });
        setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse?.data?.status === "FAILED") {
        setBlockList([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message)
        router.push("/");
        //setLoader(false);
      } else {
        setBlockList([]);
      }
      setLoader(false);
    } catch (error) {
      // Swal.fire({
      //   text: error?.response?.data?.message || error.message,
      //   icon: "warning",
      // });
      toast.warn(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }


  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    setSelectAllChecked((!selectedCheckboxes.includes(checkboxId) && (selectedCheckboxes.length + 1 === blockList?.length)))
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
      e.target.checked ? blockList.map((brandDetails) => brandDetails._id) : []
    );
  };
  const handleEnableDisable = async (blockId) => {
    try {
      const serverResponse = await communication.changeBlockStatus({ blockId: blockId });
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse?.data?.message);

        // setCheckedStatus((prevStatus) => ({
        //   ...prevStatus,
        //   [blockId]: true,
        // }));
        getBlockList(page, searchString);
        setIsEnableDisable((prev) => ({ ...prev, modal: false }));
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse?.data?.message);
        router.push("/");
      } else {
        toast.info(serverResponse?.data?.message);
        setIsEnableDisable((prev) => ({ ...prev, modal: false }));
      }
    } catch (error) { }
  };
  const deleteRole = async () => {
    if (selectedCheckboxes.length > 0) {
      setShowModal((prev) => ({ ...prev, modal: true }));
    } else {
      toast.info("Please select which block you want to delete");
    }
  };
  const successHandler = async () => {
    setShowModal((prev) => ({ ...prev, modal: false }));
    setLoader(true);
    let payload = {
      blockIds: [...selectedCheckboxes],
    };
    try {
      let response = await communication.deleteBlock(payload);
      if (response?.data?.status === "SUCCESS") {
        setSelectedCheckboxes([]);
        toast.success(response.data.message);
        await getBlockList(currentPage, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoader(false);
    }
  };

  const cancelHandler = () => {
    setShowModal((prev) => ({ ...prev, modal: false }));
  };
  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getBlockList("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  useEffect(() => {
    getBlockList(currentPage, searchString);
  }, [isPageUpdated]);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      {isEnableDisable.modal && (
        <CustomResponseHandlerModal
          status="warning"
          message={`Do you want to ${isEnableDisable.action} block?`}
          successHandler={() => {
            handleEnableDisable(isEnableDisable?.blockId);
          }}
          cancelHandler={() => {
            setIsEnableDisable((prev) => ({ ...prev, modal: false }));
          }}
        />
      )}
      <div className="top_header">
        <div className="tab_title">Block Management</div>
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
          value={searchString}
          onChange={handleSearch}
          // onChange={(event) => {
          //   setSearchString(event?.target?.value);
          //   setCurrentPage(1);
          // }}
          placeholder={"Search"}
        />
        {
          // configAccess?.access === "Write" &&
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
              // onClick={() => {
              //   setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
              // }}
              svg={<FontAwesomeIcon icon={faTrash} />}
              onClick={deleteRole}
            />
            {showModal.modal && (
              <CustomResponseHandlerModal
                status="warning"
                // show={showModal}
                message="Are you sure you want to delete this block?"
                successHandler={successHandler}
                cancelHandler={cancelHandler}
              />
            )}
          </div>
        }
      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section employee_table">
            <div className="table_header">
              <div className="col_20p">
                <div className="check_box">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllCheckbox"
                    onChange={(e) => handleSelectAllChange(e)}
                    checked={selectAllChecked}
                  />
                  <label className="form-check-label"></label>
                </div>
              </div>
              <div className="col_20p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_35p">
                <h5>Location Name</h5>
              </div>
              <div className="col_35p">
                <h5>Block Name</h5>
              </div>
              <div className="col_35p">
                <h5>Rack Name</h5>
              </div>
              <div className="col_20p">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {blockList?.length > 0 ? (<>

              {blockList?.map((blockDetails, index) => {
                return (
                  <>
                    <div className="table_data" key={index}>
                      <div className="col_20p">
                        <div className="check_box">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={blockDetails?._id}
                            onChange={(e) => handleCheckboxChange(e)}
                            checked={selectedCheckboxes.includes(blockDetails?._id)}
                          />
                          <label className="form-check-label"></label>
                        </div>
                      </div>
                      <div className="col_20p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{blockDetails?.location}</h6>
                      </div>
                      <div className="col_35p">
                        <h6>{blockDetails?.blockNo}</h6>
                      </div>
                      <div className="col_35p">
                        {blockDetails?.rackId?.length > 0 ? (
                          <h6>
                            {blockDetails?.rackId?.map((item, index) => (
                              <span key={index}>{item?.rackName}{index !== blockDetails?.rackId?.length - 1 && <span>, </span>}</span>
                            ))}
                          </h6>
                        ) : (
                          <h6>-</h6>
                        )}
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
                                  id: blockDetails?._id,
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
                                  <rect
                                    width="15"
                                    height="15"
                                    fill="white"
                                    transform="translate(5 5)"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                          </div>
                          <div>
                            <input
                              type="checkbox"
                              id={"switch"}
                              value={blockDetails?._id}
                              className="toggle_input"
                              checked={blockDetails?.isActive}
                              onChange={(e) => {
                                setIsEnableDisable({
                                  modal: true,
                                  action: blockDetails?.isActive ? "disable" : "enable",
                                  blockId: e.target.value,
                                });
                              }}
                            />
                            <label
                              id="toggler"
                              htmlFor={"switch"}
                              className={blockDetails?.isActive ? "toggle_enable" : "toggle_disable"}
                            >
                              <div
                                className="toggle_switch"
                                style={{
                                  backgroundColor: blockDetails?.isActive ? "#fff" : "#48505E",
                                }}
                              ></div>
                            </label>
                          </div>
                        </h6>
                      </div>
                    </div>
                  </>
                );
              })}
            </>
            ) : (
              <p className="no_data">Data Not Available</p>
            )
            }
          </div>
        </div>
      </div>
      {/* {pageCount > 1 && (
        <div className="pagination_wrapper">
          
        </div>
      )} */}
      {modalStates?.modal && (
        <CreateBlock data={{ modalStates, setModalStates, setIsPageUpdated }} />
      )}
    </>
  );
};

export default BlockList;
