"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Search from "@/common-components/Search";
import Loader from "@/common-components/Loader";
import getDateDescription from "@/helper/getDateDescription";
import { communication } from "@/services/communication";
import getTimeFromDate from "@/helper/getTimeFromDate";
import Pagination from "@/common-components/Pagination";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomBtn from "@/common-components/CustomBtn";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
gsap.registerPlugin(useGSAP);
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

function Notification() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [searchString, setSearchString] = useState("");
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [loader, setLoader] = useState(false);
  const [notification, setNotification] = useState([]);
  const [roles, setRoles] = useState([]);
  const [timeoutId, setTimeoutId] = useState();

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getAllNotification("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };
  useEffect(() => {
    getAllNotification(currentPage, searchString);
  }, [isPageUpdated]);

 
  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    setSelectAllChecked((!selectedCheckboxes.includes(checkboxId) && (selectedCheckboxes.length + 1 === notification?.length)))
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
      e.target.checked ? notification.map((brandDetails) => brandDetails._id) : []
    );
  };

  const deleteSelectedNotification = async () => {
    if (selectedCheckboxes.length <= 0) {
      toast.info("Please select which notification you want to delete",{
        autoClose: 1500 // 1.5 seconds
      });
      return;
    }
    try {
      setLoader(true);
      let payload = {
        notificationIds: selectedCheckboxes,
      };
      let response = await communication.deleteSelectedNotification(payload);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        getAllNotification(currentPage);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        router.push("/");
      } else {
        toast.info(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
      }
    } catch (error) {
      toast.info(error.message,{
        autoClose: 1500 // 1.5 seconds
      });
    } finally {
      setLoader(false);
    }
  };
  const deleteNotification = async (id) => {
    try {
      setLoader(true);
      let payload = {
        notificationId: id,
      };
      let response = await communication.deleteNotification(payload);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        getAllNotification(currentPage);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        router.push("/");
      } else {
        toast.info(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
      }
    } catch (error) {
      toast.info(error.message,{
        autoClose: 1500 // 1.5 seconds
      });
    } finally {
      setLoader(false);
    }
  };

  const deleteAllNotification = async () => {
    try {
      setLoader(true);
      let response = await communication.deleteAllNotification();
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        getAllNotification(currentPage);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        router.push("/");
      } else {
        toast.info(response.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
      }
    } catch (error) {
      toast.info(error.message,{
        autoClose: 1500 // 1.5 seconds
      });
    } finally {
      setLoader(false);
    }
  };
  async function getAllNotification(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getAllNotification({
        page: 1,
        searchString: searchString,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        setNotification(serverResponse?.data.notification);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse.data.status == "FAILED") {
        setNotification([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        router.push("/");
        setLoader(false);
      } else {
        setNotification([]);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message,{
        autoClose: 1500 // 1.5 seconds
      });
      setLoader(false);
    }
  }
  async function getNotificationCount() {
    try {
      setLoader(true);
      const serverResponse = await communication.getNotificationCount();
      if (serverResponse?.data?.status === "SUCCESS") {
        // toast.fire({ text: serverResponse.data.message, icon: "success" });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
        router.push("/");
        setLoader(false);
      } else {
        toast.info(serverResponse.data.message,{
            autoClose: 1500 // 1.5 seconds
          });
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message,{
        autoClose: 1500 // 1.5 seconds
      });
      setLoader(false);
    }
  }

  return (
    <>
      {loader && <Loader />}
      <div className="top_header p-2">
        <div className="tab_title">Notification</div>
      </div>
      <div className="search_btn_wrapper p-2">
        <Search
          value={searchString}
          onChange={handleSearch}
          placeholder={"Search"}
        />
        <CustomBtn
            name={"Delete"}
            onClick={() =>
                selectAllChecked ? deleteAllNotification() : deleteSelectedNotification()
            }
            svg={<FontAwesomeIcon icon={faTrash} />}
          />
       
      </div>
      <div className="table_wrapper">
        <div className="table_main">
          <div className="table_section">
            <div className="table_header">
              <div className="col_7p">
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
              <div className="col_7p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_20p">
                <h5> Title</h5>
              </div>
              <div className="col_45p">
                <h5>Description</h5>
              </div>
              <div className="col_20p">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {notification?.map((data, index) => {
              return (<>
                <div
                  className="table_data"
                  key={index}
                >
                  <div className="col_7p">
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
                  <div className="col_7p">
                    <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                  </div>

                  <div className="col_20p">
                    <h6>{data?.title}</h6>
                  </div>

                  <div className="col_45p">
                    <h6>{data?.description}</h6>
                  </div>

                  <div className="col_20p">
                    <h6 className="action_wrraper">
                      <div title="Delete">
                      <FontAwesomeIcon icon={faTrash}/>
                      </div>
                    </h6>
                  </div>
                </div >
              </>)
            })}
          </div>
        </div>
      </div >
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
}

export default Notification;
