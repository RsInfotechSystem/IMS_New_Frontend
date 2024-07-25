"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import { communication } from "@/apis/communication";
// import { tabsArray } from "@/utilities/tabsArray";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function CreateRole({ data }) {
  const { modalStates, setModalStates, setIsPageUpdated, getRoleList, currentPage, searchString } =
    data;
  const [buttonLoader, setButtonLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [roleId, setRoleId] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const onSubmit = async (values) => {
    try {
      const tab = [];
      for (const key in values) {
        if (key !== "role" && values[key]) {
          tab.push(key);
        }
      }

      if (tab.length === 0) {
        toast.info("Select at least one tab");
        // Swal.fire({ text: "Select at least one tab", icon: "warning" });
        return;
      }

      let payload = {
        role: values.role,
        tab,
      };
      setButtonLoader(true);
      const serverResponse = await communication.createRole(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        for (const key in values) {
          reset();
        }
        toast.success(serverResponse?.data?.message);
        await getRoleList(currentPage, searchString);
        setModalStates((prev) => ({ ...prev, modal: false, type: "create" }));
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse?.data?.message);
        router.push("/");
      } else {
        setButtonLoader(false);
        toast.info(serverResponse?.data?.message);
      }
      setButtonLoader(false);
    } catch (error) {
      setButtonLoader(false);
      toast.error(error.message);
    }
  };
  const getRoleById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getRoleById({
        roleId: modalStates?.id, // roleId: `${searchParams.get("roleId")}`,
        // roleId: roleId,}
      });
      if (response?.data?.status === "SUCCESS") {
        setLoader(false);
        setValue("role", response.data.role.role);
        response.data.role.tab.forEach((tab) => {
          setValue(tab, true);
        });
        setRoleId(response?.data?.role?._id);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response?.data?.message);
        router.push("/");
      } else {
        setButtonLoader(false);
        toast.info(response?.data?.message);
      }
      setLoader(false);
    } catch (error) {
      setButtonLoader(false);
      toast.error(error.message);
    }
  };
  const updateExistingRole = async (values) => {
    try {
      const tab = [];
      for (const key in values) {
        if (key !== "role" && values[key]) {
          tab.push(key);
        }
      }

      if (tab.length === 0) {
        toast.info("Select at least one tab");
        // Swal.fire({ text: "Select at least one tab", icon: "warning" });
        return;
      }

      let payload = {
        // roleId: searchParams.get("roleId"),
        roleId: roleId,
        role: values.role,
        tab,
      };
      setLoader(true);
      const serverResponse = await communication.updateRole(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        // for (const item of serverResponse?.data?.role.tab) {
        //   //   reset();
        //   // setValue()
        // }
        setModalStates((prev) => ({ ...prev, modal: false }));
        setIsPageUpdated((prev) => !prev);
        toast.success(serverResponse?.data?.message);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse?.data?.message);
        router.push("/");
      } else {
        setButtonLoader(false);
        toast.info(serverResponse?.data?.message);
      }
      setLoader(false);
    } catch (error) {
      setButtonLoader(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (modalStates?.type === "update") {
      getRoleById();
    }
  }, []);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal">
          <div className="form_modal_header">
            <h5 className="title">
              {modalStates?.type === "create" ? "Create Role" : "Update Role"}
            </h5>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
              className="close_modal_icon"
            />
          </div>
          <div className="form_modal_body row">
            <div className="input_wrapper col-6 ms-1 mb-4">
              <label>Role*</label>
              <InputBox
                type={"text"}
                register={{
                  ...register("role", {
                    required: "Role Name is required",
                  }),
                }}
                errors={errors.role}
              />
            </div>
            <div className="check_box col-12">
              {/* <div className="row">
                {" "}
                {tabsArray?.map((tabsName, index) => (
                  <div className="form-check col-4" key={index}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedTabs?.includes(tabsName)}
                      onChange={() => {
                        handleModuleAccess(tabsName);
                      }}
                      id={tabsName}
                      disabled={disabled}
                    />
                    <label className="form-check-label" htmlFor={tabsName}>
                      {tabsName}
                    </label>
                  </div>
                ))}
              </div> */}
              <div className="row m-0">
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="role"
                    {...register("Role Management")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="role">
                    Role Management
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="location"
                    {...register("Location")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="location">
                    Location
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="User Management"
                    type="checkbox"
                    {...register("User Management")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="User Management">
                    User Management
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Category"
                    type="checkbox"
                    {...register("Category")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Category">
                    Category
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input id="Brand" type="checkbox" {...register("Brand")} className="checkbox" />
                  <label className="fs-9" htmlFor="Brand">
                    Brand
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Block Management"
                    type="checkbox"
                    {...register("Block Management")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Block Management">
                    Block Management
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Name"
                    type="checkbox"
                    {...register("Product Name")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Name">
                    Product Name
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Stock In"
                    type="checkbox"
                    {...register("Stock In")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Stock In">
                    Stock In
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Inventory Look"
                    type="checkbox"
                    {...register("Inventory Look")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Inventory Look">
                    Inventory Look
                  </label>
                </div>

                {/* <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Approval"
                    type="checkbox"
                    {...register("Approval")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Approval">
                    Approval
                  </label>
                </div> */}

                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Stock Out"
                    type="checkbox"
                    {...register("Stock Out")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Stock Out">
                    Stock Out
                  </label>
                </div>
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="Po List"
                    type="checkbox"
                    {...register("Po List")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Po List">
                    Po List
                  </label>
                </div>
                {/* <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input
                    id="notification"
                    type="checkbox"
                    {...register("notification")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="notification">
                    Notification
                  </label>
                </div> */}
                <div className="col-lg-4 col-md-4 checkbox_main d-flex align-items-center">
                  <input id="report" type="checkbox" {...register("report")} className="checkbox" />
                  <label className="fs-9" htmlFor="report">
                    Report
                  </label>
                </div>
              </div>
            </div>
            <div className="form_button_wrapper">
              <CustomBtn
                name={
                  buttonLoader ? (
                    <ButtonLoader />
                  ) : modalStates?.type === "create" ? (
                    "Create"
                  ) : (
                    "Update"
                  )
                }
                onClick={
                  modalStates?.type === "create"
                    ? handleSubmit(onSubmit)
                    : handleSubmit(updateExistingRole)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateRole;
