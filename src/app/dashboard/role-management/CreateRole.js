"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import { communication } from "@/services/communication";
import { tabsArray } from "@/utilities/tabsArray";
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

              <div className="row m-0">
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
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
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    type="checkbox"
                    id="Location"
                    {...register("Location")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Location">
                    Location
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
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
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
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
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Brand"
                    type="checkbox"
                    {...register("Brand Management")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Brand Management">
                    Brand
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Parameters"
                    type="checkbox"
                    {...register("Parameters")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Parameters">
                    Parameters
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Rack Management"
                    type="checkbox"
                    {...register("Rack Management")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Rack Management">
                    Rack Management
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
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
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Model Details"
                    type="checkbox" {...register("Model Details")}
                    className="checkbox" />
                  <label className="fs-9" htmlFor="Model Details">
                    Model Details
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
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
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Assign Material"
                    type="checkbox"
                    {...register("Assign Material")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Assign Material">
                    Assign Material
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Daily Task"
                    type="checkbox"
                    {...register("Daily Task")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Daily Task">
                    Daily Task
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Stock Management"
                    type="checkbox"
                    {...register("Stock Management")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Stock Management">
                    Stock Management
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
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
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Sales Order"
                    type="checkbox"
                    {...register("Sales Order")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Sales Order">
                    Sales Order
                  </label>
                </div>

                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Transfer Material"
                    type="checkbox"
                    {...register("Transfer Material")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Transfer Material">
                    Transfer Material
                  </label>
                </div>

                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Receive  Material"
                    type="checkbox"
                    {...register("Receive  Material")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Receive  Material">
                    Receive  Material
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Approval"
                    type="checkbox"
                    {...register("Approval")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Approval">
                    Approval
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="NR Material"
                    type="checkbox"
                    {...register("NR Material")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="NR Material">
                    NR Material
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
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

                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Notification"
                    type="checkbox"
                    {...register("Notification")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Notification">
                    Notification
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Report"
                    type="checkbox"
                    {...register("Report")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Report">
                    Report
                  </label>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 checkbox_main d-flex align-items-center">
                  <input
                    id="Dump Material"
                    type="checkbox"
                    {...register("Dump Material")}
                    className="checkbox"
                  />
                  <label className="fs-9" htmlFor="Dump Material">
                    Dump Material
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
