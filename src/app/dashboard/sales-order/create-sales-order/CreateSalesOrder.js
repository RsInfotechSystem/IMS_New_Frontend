"use client";

import Button from "@/common-components/Button";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import SelectBox from "@/common-components/Select";
import { statesArray } from "@/utilities/statesArray";
import { communication } from "@/services/communication";
import { fetchAllCategoriesData, getLocations } from "@/services/commonApis";
import { toast } from "react-toastify";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CustomBtn from "@/common-components/CustomBtn";
import ButtonLoader from "@/common-components/ButtonLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import ViewSalesOrder from "./ViewSalesOrderPdf";
import CustomDateInput from "@/common-components/CustomDateInput";
import { Ruthie } from "next/font/google";
gsap.registerPlugin(useGSAP);

const CreateOrder = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [orderCompleteDateError, setOrderCompleteDateError] = useState("");
  const [orderDateError, setOrderDateError] = useState("");

  const [activeTab, setActiveTab] = useState("INFO");
  const [loader, setLoader] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
    setValue,
  } = useForm();
  const [allCategory, setAllCategory] = useState([]);
  const [supplyItems, setSupplyItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [user, setUser] = useState([]);
  // State to store the values of the selected category
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [_locationId, _setLocationId] = useState("");
  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    materials: [],
  });
  const [modalState, setModalStates] = useState({
    viewPdf: false,
    data: "",
    viewPrintBill: false,
    status: "",
    remainingAmount: 0,
  });
  const [filterValues, setFilterValues] = useState({
    orderDate: "",
    orderCompleteDate: "",
  });

  // Get all categories list
  const createOrder = async (values) => {
    // if (values.description == "") {
    //   toast.info("description is required");
    //   return;
    // }
    try {
      if (!filterValues.orderDate || !filterValues.orderCompleteDate) {
        toast.info("Date is required");
        return;
      }

      setLoader(true);
      const dataToSend = {
        salesOrderNo: values.orderNo,
        orderDate: filterValues.orderDate,
        completeBy: filterValues.orderCompleteDate,
        materialDetails: state.materials,
        orderLocation: values.locationId,
        assignTo: values.userId,
        customerName: values.name,
        customerNo: values?.mobile,
        customerAddress: values.address,
        contactPerson: values.contactPerson,
        // remark: values.remark,
      };
      let response = await communication.createSalesOrder(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response?.data?.message);
        router.push("/dashboard/sales-order");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response.data.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
    // }
  };
  const getalluser = async () => {
    try {
      const payload = {
        locationId: _locationId,
      };
      let response = await communication.getalluser(payload);
      if (response?.data?.status === "SUCCESS") {
        setUser(response?.data?.users);
      }
    } catch (error) {
      toast.warn(error.message);
      //   Swal.fire({ text: error.message, icon: "warning" });
    }
  };

  const addMaterial = () => {
    const { description, quantity, warranty, note, remarks } = getValues();
    // console.log('====================================');
    // console.log(description,quantity);
    // console.log('====================================');
    if (!description || !quantity) {
      toast.info("Add Material");
      return;
    } else {
      setState({
        materials: [
          ...state.materials,
          {
            materialDescription: description,
            quantity: quantity,
            warranty: warranty,
            note: note,
            // remarks: remarks,
          },
        ],
      });
      // Clear the input fields after adding
      setValue("description", "");
      setValue("quantity", "");
      setValue("warranty", "");
      setValue("note", "");
      setValue("remarks", "");
    }
  };
  async function callAPIs(params) {
    await getLocations(setLoader, router, setLocations);
  }
  useEffect(() => {
    // const id = getValues("locationId");
    if (_locationId) {
      getalluser();
    }
  }, [_locationId]);

  useEffect(() => {
    callAPIs();
  }, []);

  const deleteProduct = (id) => {
    setState({ materials: state.materials.filter((_, index) => index !== id) });
  };

  const employeeDetailSubmit = (data) => {
    if (filterValues?.orderDate === "") {
      toast.info("OrderDate is required");
      return;
    }
    if (filterValues?.orderCompleteDate === "") {
      toast.info("Order Complete Date is required");
      return;
    }
    try {
      // setFormTabArray((prev) => prev?.map((ele, ind) => ele.tabName === "Working" ? { ...ele, isFormSubmitted: true } : ele));
      setActiveTab("SUPPLY");
    } catch (error) {
      toast.info(error.message);
    }
  };

  return (
    <>
      {loader && <Loader text={"Loading..."} />}
      {modalState.viewPdf && (
        <ViewSalesOrder pdfData={modalState?.data} setModalStates={setModalStates} />
      )}

      {/* top header  */}
      <div className="top_header">
        <div className="tab_title">Create Sales Order</div>
        <div
          className="back_btn"
          onClick={() => {
            activeTab === "INFO" ? router.push("/dashboard/sales-order") : setActiveTab("INFO");
            // router.back();
            // router.push("/dashboard/sales-order");
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
          </div>
          <div>Back</div>
        </div>
      </div>
      {/* tab wrapper */}
      <div className="my-3 d-flex justify-content-start align-items-start gap-3">
        <div
          className="tab_btn"
          onClick={() => {
            setActiveTab("INFO");
          }}
          style={{ backgroundColor: activeTab == "INFO" ? "#184965" : "#D0D3D9" }}
        >
          Order Information
        </div>
        <div
          //   onClick={handleSubmit(handleVendorInformation)}
          className="tab_btn"
          style={{ backgroundColor: activeTab == "SUPPLY" ? "#184965" : "#D0D3D9" }}
        >
          {" "}
          Order Item
        </div>
      </div>
      {activeTab === "INFO" && (
        <div id="vendor-information">
          {/* point of contact person */}
          <div className="form_wrapper">
            <div className="form_heading">
              <div>
                <svg
                  width="21"
                  height="22"
                  viewBox="0 0 21 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.32617 4.64625H3.60367V6.165H2.32617V15.9587H3.56117V17.355H2.32617V20.8512H17.1974V1H2.32617V4.64625ZM6.55617 6.49C6.59367 6.46 6.89492 6.235 7.00242 6.15375L6.99492 6.15125C7.00492 6.1475 7.00992 6.14625 7.01617 6.1425C7.02242 6.135 7.04242 6.12125 7.04617 6.1175L7.05117 6.12375C7.23367 6.01625 7.42242 5.94125 7.63742 5.90875C8.21492 5.82375 8.63617 6.42375 8.90992 6.7675C9.18367 7.1075 9.56367 7.65 9.51742 8.02125C9.48992 8.245 9.23367 8.45125 8.99117 8.65375L8.98242 8.64125C8.91617 8.7125 8.62367 9.01125 8.59867 9.05125C8.46492 9.27375 8.31117 9.7775 8.52617 10.1575C8.72992 10.5262 9.13242 11.1237 9.51367 11.6225C9.91617 12.1062 10.4099 12.635 10.7224 12.9187C11.0499 13.215 11.5887 13.1937 11.8412 13.1212C11.8899 13.1087 12.2837 12.875 12.3349 12.85C12.5962 12.67 12.8599 12.48 13.0937 12.5087C13.4724 12.5562 13.9137 13.0512 14.1874 13.3925C14.4612 13.735 14.9537 14.2825 14.7287 14.8075C14.6424 15.0062 14.5174 15.165 14.3624 15.3138L14.3674 15.3188L14.3399 15.3387C14.3349 15.3438 14.3324 15.3488 14.3324 15.3488L14.3274 15.35C14.2249 15.4275 13.9224 15.6587 13.8849 15.6862C13.4649 15.9575 12.5524 16.2962 11.2699 15.5425C10.3187 14.9812 9.27492 14.0287 8.27867 12.8387L8.27367 12.8425C8.22742 12.7837 8.18367 12.725 8.13992 12.6663C8.09367 12.6088 8.04492 12.555 7.99742 12.495L8.00242 12.4913C7.06742 11.2575 6.37992 10.035 6.05742 8.99625C5.62367 7.59625 6.18492 6.82 6.55617 6.49Z"
                    fill="#434343"
                  />
                  <path d="M2.22375 4.75H1V5.99H2.22375V4.75Z" fill="#434343" />
                  <path d="M2.22125 16H1V17.1787H2.22125V16Z" fill="#434343" />
                  <path d="M19.645 3.5H18.5V7.09375H19.645V3.5Z" fill="#434343" />
                  <path d="M19.6088 14.75H18.5V18.3088H19.6088V14.75Z" fill="#434343" />
                  <path d="M19.6263 8.5H18.5V13.3688H19.6263V8.5Z" fill="#434343" />
                </svg>
              </div>
              <div className="heading">Customer Details</div>
            </div>
            <div className="row">
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Name*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("name", {
                      required: "Name is required",
                    }),
                  }}
                  errors={errors.name}
                  placeholder={""}
                  disable={false}
                />
              </div>
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Contact Number*</label>
                <InputBox
                  // type={"number"}
                  register={{
                    ...register("mobile", {
                      required: "contact number is required",
                      minLength: { value: 10, message: "contact number must be 10 digit long" },
                      maxLength: {
                        value: 10,
                        message: "contact number cannot be grater than 10 digits",
                      },
                    }),
                  }}
                  errors={errors.mobile}
                  placeholder={""}
                  disable={false}
                />
              </div>
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Address*</label>
                <InputBox
                  // type={"text"}
                  register={{
                    ...register("address", {
                      required: "address is required",
                      // minLength: { value: 10, message: "contact number must be 10 digit long" },
                      // maxLength: {
                      //   value: 10,
                      //   message: "contact number cannot be grater than 10 digits",
                      // },
                    }),
                  }}
                  errors={errors.address}
                  placeholder={""}
                  disable={false}
                />
              </div>
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Contact Person*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("contactPerson", {
                      required: "contact Person is required",
                    }),
                  }}
                  errors={errors.contactPerson}
                  placeholder={""}
                  disable={false}
                />
              </div>
            </div>
          </div>
          {/* order  detail form */}
          <div className="form_wrapper">
            <div className="form_heading">
              <div>
                {/* <svg
                    width="21"
                    height="22"
                    viewBox="0 0 21 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M2.32617 4.64625H3.60367V6.165H2.32617V15.9587H3.56117V17.355H2.32617V20.8512H17.1974V1H2.32617V4.64625ZM6.55617 6.49C6.59367 6.46 6.89492 6.235 7.00242 6.15375L6.99492 6.15125C7.00492 6.1475 7.00992 6.14625 7.01617 6.1425C7.02242 6.135 7.04242 6.12125 7.04617 6.1175L7.05117 6.12375C7.23367 6.01625 7.42242 5.94125 7.63742 5.90875C8.21492 5.82375 8.63617 6.42375 8.90992 6.7675C9.18367 7.1075 9.56367 7.65 9.51742 8.02125C9.48992 8.245 9.23367 8.45125 8.99117 8.65375L8.98242 8.64125C8.91617 8.7125 8.62367 9.01125 8.59867 9.05125C8.46492 9.27375 8.31117 9.7775 8.52617 10.1575C8.72992 10.5262 9.13242 11.1237 9.51367 11.6225C9.91617 12.1062 10.4099 12.635 10.7224 12.9187C11.0499 13.215 11.5887 13.1937 11.8412 13.1212C11.8899 13.1087 12.2837 12.875 12.3349 12.85C12.5962 12.67 12.8599 12.48 13.0937 12.5087C13.4724 12.5562 13.9137 13.0512 14.1874 13.3925C14.4612 13.735 14.9537 14.2825 14.7287 14.8075C14.6424 15.0062 14.5174 15.165 14.3624 15.3138L14.3674 15.3188L14.3399 15.3387C14.3349 15.3438 14.3324 15.3488 14.3324 15.3488L14.3274 15.35C14.2249 15.4275 13.9224 15.6587 13.8849 15.6862C13.4649 15.9575 12.5524 16.2962 11.2699 15.5425C10.3187 14.9812 9.27492 14.0287 8.27867 12.8387L8.27367 12.8425C8.22742 12.7837 8.18367 12.725 8.13992 12.6663C8.09367 12.6088 8.04492 12.555 7.99742 12.495L8.00242 12.4913C7.06742 11.2575 6.37992 10.035 6.05742 8.99625C5.62367 7.59625 6.18492 6.82 6.55617 6.49Z"
                      fill="#434343"
                    />
                    <path d="M2.22375 4.75H1V5.99H2.22375V4.75Z" fill="#434343" />
                    <path d="M2.22125 16H1V17.1787H2.22125V16Z" fill="#434343" />
                    <path d="M19.645 3.5H18.5V7.09375H19.645V3.5Z" fill="#434343" />
                    <path d="M19.6088 14.75H18.5V18.3088H19.6088V14.75Z" fill="#434343" />
                    <path d="M19.6263 8.5H18.5V13.3688H19.6263V8.5Z" fill="#434343" />
                  </svg> */}
                <div className="heading">Order Details</div>
              </div>
            </div>

            <div className="row">
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Sales Order No*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("orderNo", {
                      required: "order No. is required",
                    }),
                  }}
                  errors={errors.orderNo}
                  placeholder={""}
                  disable={false}
                />
              </div>
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Order Date*</label>
                {/* <InputBox
                    type={"number"}
                    register={{
                      ...register("mobile", {
                        required: "contact number is required",
                        minLength: { value: 10, message: "contact number must be 10 digit long" },
                        maxLength: {
                          value: 10,
                          message: "contact number cannot be grater than 10 digits",
                        },
                      }),
                    }}
                    errors={errors.mobile}
                    placeholder={""}
                    disable={false}
                  /> */}
                <CustomDateInput
                  value={filterValues?.orderDate}
                  maxDate={`31 - 12 - ${new Date()?.getFullYear()}`}
                  onChange={(date) => {
                    setFilterValues((prev) => ({ ...prev, orderDate: date }));
                  }}
                />
                {/* {orderDateError && (
                    <p className="text-danger text-start" style={{ fontSize: "13px" }}>
                      {orderDateError}
                    </p>
                  )} */}
              </div>
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Complete Date*</label>
                {/* <InputBox
                    type={"email"}
                    register={{
                      ...register("email", {
                        required: "email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      }),
                    }}
                    errors={errors.email}
                    placeholder={""}
                    disable={false}
                  /> */}
                <CustomDateInput
                  maxDate={`31 - 12 - ${new Date()?.getFullYear()}`}
                  value={filterValues?.orderCompleteDate}
                  onChange={(date) => {
                    setFilterValues((prev) => ({ ...prev, orderCompleteDate: date }));
                  }}
                />
                {/* {orderCompleteDateError && (
                    <p className="text-danger text-start" style={{ fontSize: "13px" }}>
                      {orderCompleteDateError}
                    </p>
                  )} */}
              </div>
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Order Taken By*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("orderTakenBy", {
                      required: "Order Taken By is required",
                    }),
                  }}
                  errors={errors.orderTakenBy}
                  placeholder={""}
                  disable={false}
                />
              </div>
              {/* <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Completion Time</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("gstNumber"),
                  }}
                  placeholder={""}
                  disable={false}
                  className={"text-uppercase"}
                />
              </div> */}
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Select Location*</label>
                <SelectBox
                  options={locations}
                  firstOption={"Select Location"}
                  displayName={"name"}
                  value={"_id"}
                  register={{
                    ...register("locationId", {
                      required: "Select Location",
                    }),
                  }}
                  onChange={(e) => _setLocationId(e.target.value)}
                  errors={errors.locationId}
                />
              </div>
              <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                <label>Select User*</label>
                <SelectBox
                  options={user}
                  firstOption={"select user"}
                  value={"_id"}
                  displayName={"name"}
                  disable={false}
                  //   defaultValue={""} //selected value
                  register={{
                    ...register("userId", {
                      required: "user  is required",
                    }),
                  }}
                  errors={errors.userId}
                />
              </div>
            </div>
          </div>

          {/* next btn  */}
          <div className="d-flex align-items-center justify-content-center">
            <Button
              name={"Save & Next"}
              onClick={handleSubmit(employeeDetailSubmit)}
              // onClick={() => {
              //   setActiveTab("SUPPLY");
              // }}
            />
          </div>
        </div>
      )}

      {activeTab === "SUPPLY" && (
        <div>
          {loader && <Loader />}
          {/* create add recipe order form  */}
          <div className="">
            <div className="form_list_layout_wrapper">
              <div className="d-flex align-items-center justify-content-between py-2">
                <div className="form_layout">
                  <div className="row"></div>
                  <div className="row d-flex align-items-end">
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Description</label>
                      <textarea
                        {...register("description")}
                        className="form-control custom_input"
                        rows="1"
                      ></textarea>
                    </div>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Quantity*</label>
                      <InputBox
                        // type={"text"}
                        register={{
                          ...register("quantity", {
                            // required: "quantity is required",
                          }),
                        }}
                        errors={errors.quantity}
                      />
                    </div>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>warranty *</label>
                      <InputBox
                        // type={"number"}
                        register={{
                          ...register("warranty", {
                            // required: "warranty is required",
                          }),
                        }}
                        errors={errors.warranty}
                      />
                    </div>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Note *</label>
                      <InputBox
                        // type={"number"}
                        register={{
                          ...register("note", {
                            // required: "note is required",
                          }),
                        }}
                        errors={errors.note}
                      />
                    </div>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Remarks *</label>
                      <InputBox
                        // type={"number"}
                        register={{
                          ...register("remarks", {
                            // required: "Remarks is required",
                          }),
                        }}
                        errors={errors.remarks}
                      />
                    </div>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <Button name={"Add"} type="button" className="" onClick={addMaterial}>
                        {/* Add */}
                      </Button>
                    </div>
                  </div>
                  <div className="row d-flex align-items-end"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Sales Order Preview */}
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Sales Order Item Preview</p>
            </div>
            {/* table  */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                {/* Rename the class name "pi_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                <div className="table_section pi_product_table">
                  <div className="table_header">
                    <div className="col_25p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Description</h5>
                    </div>

                    <div className="col_25p">
                      <h5>QTY</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Warranty</h5>
                    </div>
                    <div className="col_25p">
                      <h5 className="action_wrraper">Note</h5>
                    </div>

                    <div className="col_20p">
                      <h5 className="action_wrraper">Remove</h5>
                    </div>
                  </div>
                  {state.materials?.length > 0 ? (
                    state.materials?.map((product, index) => {
                      return (
                        <div className="table_data" key={index}>
                          <div className="col_25p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.materialDescription}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.quantity ? product?.quantity : "--"}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.warranty ? product?.warranty : "--"}</h6>
                          </div>
                          <div className="col_25p">
                            <h6 className="action_wrraper">
                              {product?.note ? product?.note : "--"}
                            </h6>
                          </div>
                          <div className="col_20p">
                            <h6 className="action_wrraper ">
                              <FontAwesomeIcon
                                icon={faTrash}
                                onClick={() => deleteProduct(index)}
                                className="trash"
                              />
                            </h6>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <small className="text-center text-secondary p-2 small d-block">
                      Add order to see list
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-3 my-3">
            <Button
              name={"Save"}
              type="submit"
              className="btn btn-success"
              onClick={handleSubmit(createOrder)}
              // onClick={() => handleSubmit(createOrder)}
            ></Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateOrder;
