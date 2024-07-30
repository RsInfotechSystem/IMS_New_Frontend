"use client"

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import { toast } from "react-toastify";
import CreateUser from "./CreateUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import showIcon from "../../../../public/images/showIcon.png"
import password from "../../../../public/images/password.png"
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;


const UserManagement = () => {
  const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
  const [respondHandlerModalState, setRespondHandlerModalState] = useState({ state: false, deleteId: "" });
  const [respondHandlerActiveModalState, setRespondHandlerActiveModalState] = useState({action: "disable", state: false, userId: "" });
  const router = useRouter();
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [user, setUser] = useState([]);
  const [loader, setLoader] = useState(false);
  const [locations, setLocations] = useState([]);
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [timeoutId, setTimeoutId] = useState();
  const [roleList, setRoleList] = useState([]);
  const [checkedStatus, setCheckedStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handlePasswordToggle = (userId) => {
    setPasswordVisibility((prevVisibility) => {
      const newVisibility = {};

      // Set all other users visibility to false
      Object.keys(prevVisibility).forEach((id) => {
        newVisibility[id] = false;
      });
      // Toggle the visibility for the current user
      newVisibility[userId] = !prevVisibility[userId];

      return newVisibility;
    });
  };

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    setSelectAllChecked((!selectedCheckboxes.includes(checkboxId) && (selectedCheckboxes.length + 1 === user?.length)))
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
      e.target.checked ? user.map((brandDetails) => brandDetails._id) : []
    );
  };

  async function getUserList(page, searchString, isSearch = false) {
    try {
      setLoader(true);
      const serverResponse = await communication.getUserList(page, searchString);
      if (serverResponse?.data?.status === "SUCCESS") {
        setUser(serverResponse?.data.user);
        setPageCount(serverResponse?.data?.totalPages);
        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
        const initialCheckedStatus = {};

        serverResponse?.data.user.forEach((user) => {
          initialCheckedStatus[user._id] = user.isActive || false;
        });
        setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse.data.status == "FAILED") {
        toast.info(serverResponse?.data?.message,{
          autoClose: 1500 // 1.5 seconds
        });
        setUser([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message,{
          autoClose: 1500 // 1.5 seconds
        });
        router.push("/");
        setLoader(false);
      } else {
        setUser([]);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message,{
        autoClose: 1500 // 1.5 seconds
      });
      setLoader(false);
    }
  }


  const deleteUser = async () => {
    if (selectedCheckboxes.length > 0) {
      setRespondHandlerModalState({ state: true, deleteId: selectedCheckboxes });
    } else {
      toast.info("Please select which user you want to delete",{
        autoClose: 1500 // 1.5 seconds
      });
    }
  };

  const handleDelete = async (userIds) => {
    try {
      setLoader(true);
      let payload = { userIds: [...userIds] };
      let response = await communication.deleteUser(payload);
      if (response?.data?.status === "SUCCESS") {
        setSelectedCheckboxes([]);
        toast.success(response.data.message,{
          autoClose: 1500 // 1.5 seconds
        });
        await getUserList(currentPage, searchString);
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
      setRespondHandlerModalState({ state: false, deleteId: "" });
    }
  };


  const cancelHandler = () => {
    setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
  };
  const cancelHandlerActive = () => {
    setRespondHandlerActiveModalState({ status: false })
  }

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    let isSearch = true;
    clearTimeout(timeoutId);
    let _timeOutId = setTimeout(() => {
      getUserList("1", e.target.value, isSearch);
    }, 2000);
    setTimeoutId(_timeOutId);
  };

  const getActiveRole = async () => {
    try {
      setLoader(true);
      let response = await communication.getActiveRole();
      if (response?.data?.status === "SUCCESS") {
        // toast.fire({ text: response.data.message, icon: "success" });
        setRoleList(response?.data.role);
        // await getRoleList(currentPage, searchString);
      } else if (response?.data?.status === "FAILED") {
        toast.info(response.data.message,{
          autoClose: 1500 // 1.5 seconds
        });
        setRoleList([]);
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



  const changeUserStatus = async (userId) => {
    try {
      setLoader(true);
      let response = await communication.changeUserStatus({
        userId: userId,
      });

      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message,{
          autoClose: 1500 // 1.5 seconds
        });
        setCheckedStatus((prevStatus) => ({
          ...prevStatus,
          [userId]: true,
        }));
        getUserList(currentPage, searchString);
        setRespondHandlerActiveModalState({ status: false })
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
  }


  async function getLocations() {
    try {
      setLoader(true);
      const serverResponse = await communication.getLocations();
      if (serverResponse?.data?.status === "SUCCESS") {
        setLocations(serverResponse?.data?.result);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message,{
          autoClose: 1500 // 1.5 seconds
        });
        router.push("/");
        setLoader(false);
      } else {
        setLocations([]);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message,{
          autoClose: 1500 // 1.5 seconds
        });
      setLoader(false);
    }
  }
  useEffect(() => {
    getUserList(currentPage, searchString);
    getActiveRole();
    getLocations();
  }, [isPageUpdated]);

  return (
    <>
      {respondHandlerModalState.state && (
        <CustomResponseHandlerModal
          status="warning"
          message="Are you sure you want to delete this user?"
          cancelHandler={cancelHandler}
          successHandler={() => handleDelete(respondHandlerModalState.deleteId)}
        />
      )}
      {respondHandlerActiveModalState.state && (
        <CustomResponseHandlerModal
          status="warning"
          message={`Are you sure you want to ${respondHandlerActiveModalState.action} the status?`}
          cancelHandler={cancelHandlerActive}
          successHandler={() => changeUserStatus(respondHandlerActiveModalState.userId)}
        />
      )}
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title">User Management</div>
        <div className="pagination_wrapper">
        <Pagination
          isPageUpdated={isPageUpdated}
          setIsPageUpdated={setIsPageUpdated}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
        />
      </div>
      </div>
      <div className="search_btn_wrapper">
        <Search value={searchString}
          onChange={handleSearch} placeholder={"Search"} />

        <div className="buttons_wrapper">
          <CustomBtn
            name={"Create"}
            onClick={() => { setModalStates((prev) => ({ ...prev, modal: true, type: "create" })) }}
            svg={<svg
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
            </svg>} />

          <CustomBtn
            name={"Delete"}
            // onClick={deleteUser}
            onClick={deleteUser}
            svg={<FontAwesomeIcon icon={faTrash} />}
          />
        </div>



      </div>
      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main">
          {/* Rename the class name "employee_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
          <div className="table_section">
            {/* {![undefined, null, 0]?.includes(user) && <div className="table_badge_wrapper">
              <button className="table_badge">
                <h5>Total User</h5>
                <div className="badge_count">
                  <h6>{user.length}</h6>
                </div>
              </button>
            </div>} */}

            <div className="table_header">
              <div className="col_7p">
                <input type="checkbox" className="form-check-input" onChange={(e) => handleSelectAllChange(e)}
                  checked={selectAllChecked} />
              </div>
              <div className="col_10p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_15p">
                <h5>User ID</h5>
              </div>
              <div className="col_30p">
                <h5>User Name</h5>
              </div>
            
              <div className="col_15p">
                <h5>Role Type</h5>
              </div>
              <div className="col_35p">
                <h5>Email</h5>
              </div>
              <div className="col_20p">
                <h5>Contact No.</h5>
              </div>
              <div className="col_20p">
                <h5>Location</h5>
              </div>
              <div className="password">
                <h5>Password</h5>
              </div>
              <div className="col_20p action_wrraper">
                <h5 className="action_wrraper">Action</h5>
              </div>
            </div>
            {user.length > 0 ? (
              <>
            {user?.map((userDetails, index) => (
              <div className="table_data" key={index}>
                <div className="col_7p">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={userDetails._id}
                    onChange={(e) => handleCheckboxChange(e)}
                    checked={selectedCheckboxes.includes(userDetails._id)} />
                </div>
                <div className="col_10p">
                  <h6>{((Number(pageLimit) * (page - 1))) + (index + 1)}</h6>
                </div>
                <div className="col_15p">
                  <h6>{userDetails?.userId}</h6>
                </div>
                <div className="col_30p">
                  <h6>{userDetails?.name}</h6>
                </div>
                <div className="col_15p">
                  <h6>{userDetails?.role}</h6>
                </div>
                <div className="col_35p" >
                  <h6 style={{ textTransform: "lowercase" }}>{userDetails?.email}</h6>
                </div>
                <div className="col_20p">
                  <h6>{userDetails?.mobile}</h6>
                </div>
                <div className="col_20p">
                  <h6>
                    {userDetails?.locationId?.map((ele) => (ele.name))?.join(', ')}
                  </h6>
                  {/* <h6>
                          {roleDetails?.tab?.join(', ')}
                        </h6> */}
                </div>
                <div className="password">
                  {
                    passwordVisibility[userDetails._id] ?
                         <h6 style={{ display: 'inline-flex', alignItems: 'center' }}>
                         {userDetails.password} 
                         <FontAwesomeIcon
                           icon={faEye}
                           style={{ marginLeft: '10px', cursor: 'pointer' }}
                           onClick={() => handlePasswordToggle(userDetails._id)}
                         />
                       </h6>
                      :
                      <h6>******** 
                        <FontAwesomeIcon
                          icon={faEyeSlash}
                          onClick={() => handlePasswordToggle(userDetails._id)}
                          style={{ marginLeft: '10px', cursor: 'pointer' }} 
                        />
                      </h6>
                  }
                </div>
                <div className="col_20p">
                  <h6 className='action_wrraper'>
                    <div title="edit" onClick={() => setModalStates((prev) => ({ ...prev, modal: true, type: "update", id: userDetails?._id }))}>
                      <svg width="27" height="27" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_279_5204)">
                          <path d="M17.5 15V17.5C17.5 17.8315 17.3683 18.1495 17.1339 18.3839C16.8995 18.6183 16.5815 18.75 16.25 18.75H7.5C7.16848 18.75 6.85054 18.6183 6.61612 18.3839C6.3817 18.1495 6.25 17.8315 6.25 17.5V8.75C6.25 8.41848 6.3817 8.10054 6.61612 7.86612C6.85054 7.6317 7.16848 7.5 7.5 7.5H10" stroke="#0D6EFD" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M12.8125 14.875L18.75 8.875L16.125 6.25L10.1875 12.1875L10 15L12.8125 14.875Z" stroke="#0D6EFD" stroke-linecap="round" stroke-linejoin="round" />
                        </g>
                        <defs>
                          <clipPath id="clip0_279_5204">
                            <rect width="15" height="15" fill="white" transform="translate(5 5)" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div className="form-check form-switch " title="enable/disable" >
                      <input
                        class="form-check-input cursor-pointer"
                        type="checkbox"
                        checked={userDetails?.isActive}
                        id={`toggleSwitch${userDetails._id}`}
                        // onChange={(event) =>
                        //     changeUserStatus(event, userDetails._id, userDetails.isActive)
                        // }
                        onChange={() => setRespondHandlerActiveModalState({ state: true,  action: userDetails?.isActive ? "disable" : "enable", userId: userDetails?._id })}
                        style={{ width: "35px", height: "15px" }}
                      />
                    </div>
                  </h6>
                </div>
              </div>
             
            ))}
            </> 
            ) : (
              <p className="no_data">Data Not Available</p>
            )}
          </div>

        </div>
      </div>
      
      {modalStates?.modal && <CreateUser data={{ modalStates, setModalStates, CreateUser, locations, roleList, getUserList, currentPage, searchString }} />}
    </>
  )
}

export default UserManagement