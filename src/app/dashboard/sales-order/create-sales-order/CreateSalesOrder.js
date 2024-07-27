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
gsap.registerPlugin(useGSAP);

const CreateOrder = () => {
  const router = useRouter();
  const params = useSearchParams();

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
  // Get all categories list
  const createOrder = async (values) => {
    try {
      if (!dateFilter.orderDate || !dateFilter.completeDate) {
        Swal.fire({ text: "Date is required", icon: "warning" });
        return;
      }
      setLoader(true);
      const dataToSend = {
        salesOrderNo: values.orderNo,
        orderDate: dateFilter.orderDate,
        completeBy: dateFilter.completeDate,
        // materialDetails: [
        //   {
        //     materialDescription: values.description,
        //     quantity: values.quantity,
        //     note: values.note,
        //     warranty: values.warranty,
        //   },
        // ],
        materialDetails: state.materials,
        orderLocation: values.locationId,
        assignTo: values.userId,
        customerName: values.name,
        customerNo: values.mobile,
        cusotmerAddress: values.adress,
        contactPerson: values.contactPerson,
        remark: values.remark,
      };
      let response = await communication.createSalesOrder(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        Swal.fire({ text: response.data.message, icon: "success" });
        router.push("/admin/dashboard/sales-order");
      } else if (response?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        Swal.fire({ text: response.data.message, icon: "warning" });
      }
    } catch (error) {
      Swal.fire({
        text: error?.response?.data?.message || error.message,
        icon: "warning",
      });
    } finally {
      setLoader(false);
    }
    // }
  };
  const getalluser = async () => {
    try {
      const payload = {
        locationId: location,
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
    const { description, quantity, warrenty, note } = getValues();
    if (!description || !quantity) {
      Swal.fire({ text: "Add Material", icon: "warning" });
      return;
    } else {
      setState({
        materials: [
          ...state.materials,
          {
            materialDescription: description,
            quantity: quantity,
            warranty: warrenty,
            note: note,
          },
        ],
      });
      // Clear the input fields after adding
      setValue("description", "");
      setValue("quantity", "");
      setValue("warrenty", "");
      setValue("note", "");
    }
  };
  async function callAPIs(params) {
    await getLocations(setLoader, router, setLocations);
  }
  console.log("iddddd", getValues("locationId"));
  useEffect(() => {
    const id = getValues("locationId");

    if (id) {
      getalluser();
    }
  }, [location]);

  useEffect(() => {
    callAPIs();
  }, []);
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
                  fill="#198754"
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
          style={{ backgroundColor: activeTab == "INFO" ? "#198754" : "#D0D3D9" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_330_3549)">
              <path
                d="M12.0004 22.8274C17.98 22.8274 22.8279 17.9795 22.8279 11.9999C22.8279 6.0203 17.98 1.17285 12.0004 1.17285C6.02079 1.17285 1.17285 6.0203 1.17285 11.9999C1.17285 17.9795 6.02079 22.8274 12.0004 22.8274Z"
                stroke="#F3F8FF"
                stroke-width="0.600238"
              />
              <path
                d="M13.8457 18.917V9.58105H8.625V10.6008H10.1532V18.917H8.625V19.9363H15.3739V18.917H13.8457Z"
                fill="#F3F8FF"
              />
              <path
                d="M11.9991 8.52502C13.2654 8.52502 14.2916 7.4988 14.2916 6.23248C14.2916 4.96617 13.2654 3.93945 11.9991 3.93945C10.7323 3.93945 9.70605 4.96617 9.70605 6.23248C9.70605 7.4988 10.7323 8.52502 11.9991 8.52502Z"
                fill="#F3F8FF"
              />
            </g>
            <defs>
              <clipPath id="clip0_330_3549">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Order Information
        </div>
        <div
          //   onClick={handleSubmit(handleVendorInformation)}
          className="tab_btn"
          style={{ backgroundColor: activeTab == "SUPPLY" ? "#198754" : "#D0D3D9" }}
        >
          {" "}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_330_3557)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M22 7L12 2L2 7V17L12 22L22 17V7Z"
                stroke="#F3F8FF"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
              <path
                d="M2 7L12 12"
                stroke="#F3F8FF"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 22V12"
                stroke="#F3F8FF"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M22 7L12 12"
                stroke="#F3F8FF"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 4.5L7 9.5"
                stroke="#F3F8FF"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_330_3557">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Order Item
        </div>
      </div>
      <form>
        {activeTab === "INFO" && (
          <div id="vendor-information">
            {/* vendor personal detail form */}
            <div className="form_wrapper">
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
                  <InputBox
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
                  />
                </div>
                <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                  <label>Complete Date*</label>
                  <InputBox
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
                  />
                </div>
                <div className="col-lg-3 d-none d-lg-block"></div>
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
                <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                  <label>Order Taken By*</label>
                  <InputBox
                    type={"text"}
                    register={{
                      ...register("orderTakenBy", {
                        required: "Order Taken By is required",
                      }),
                    }}
                    errors={errors.city}
                    placeholder={""}
                    disable={false}
                  />
                </div>
              </div>
            </div>
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
                  />
                </div>
                <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                  <label>Address*</label>
                  <InputBox
                    type={"text"}
                    register={{
                      ...register("adress", {
                        required: "Adress is required",
                        // minLength: { value: 10, message: "contact number must be 10 digit long" },
                        // maxLength: {
                        //   value: 10,
                        //   message: "contact number cannot be grater than 10 digits",
                        // },
                      }),
                    }}
                    errors={errors.adress}
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
            {/* vendor bank details form */}
            {/* <div className="form_wrapper">
              <div className="form_heading">
                <div>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6.84375C12.5695 6.84375 13.0312 6.38204 13.0312 5.8125C13.0312 5.24296 12.5695 4.78125 12 4.78125C11.4305 4.78125 10.9688 5.24296 10.9688 5.8125C10.9688 6.38204 11.4305 6.84375 12 6.84375Z"
                      fill="#48505E"
                    />
                    <path
                      d="M2.375 9.59375H21.625C22.2417 9.59375 22.7827 9.18331 22.9491 8.58931C23.1155 7.99531 22.8659 7.3635 22.339 7.04347L12.714 1.19972C12.4943 1.06634 12.2472 1 12 1C11.7528 1 11.5057 1.06634 11.2864 1.19972L1.66137 7.04347C1.1344 7.3635 0.884496 7.99566 1.05121 8.58931C1.21725 9.18331 1.75831 9.59375 2.375 9.59375ZM12 4.09375C12.9494 4.09375 13.7187 4.86306 13.7187 5.8125C13.7187 6.76194 12.9494 7.53125 12 7.53125C11.0506 7.53125 10.2812 6.76194 10.2812 5.8125C10.2812 4.86306 11.0506 4.09375 12 4.09375Z"
                      fill="#48505E"
                    />
                    <path d="M15.4375 10.2812H12.6875V18.875H15.4375V10.2812Z" fill="#48505E" />
                    <path d="M19.5625 10.2812H16.8125V18.875H19.5625V10.2812Z" fill="#48505E" />
                    <path d="M11.3125 10.2812H8.5625V18.875H11.3125V10.2812Z" fill="#48505E" />
                    <path d="M7.1875 10.2812H4.4375V18.875H7.1875V10.2812Z" fill="#48505E" />
                    <path
                      d="M2.375 20.9375H21.625C21.625 20.1782 21.0093 19.5625 20.25 19.5625H3.75C2.99066 19.5625 2.375 20.1782 2.375 20.9375Z"
                      fill="#48505E"
                    />
                    <path
                      d="M22.8092 21.625H1.19078C1.07253 21.8282 1 22.0609 1 22.3125V23H23V22.3125C23 22.0609 22.9275 21.8282 22.8092 21.625Z"
                      fill="#48505E"
                    />
                  </svg>
                </div>
                <div className="heading">Bank Details</div>
              </div>
              <div className="row">
                <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                  <label>Account Holder Name</label>
                  <InputBox
                    type={"text"}
                    register={{
                      ...register("accountHolderName"),
                    }}
                    placeholder={""}
                    disable={false}
                  />
                </div>
                <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                  <label>Bank Name</label>
                  <InputBox
                    type={"text"}
                    register={{
                      ...register("bankName"),
                    }}
                    placeholder={""}
                    disable={false}
                  />
                </div>
                <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                  <label>Account Number</label>
                  <InputBox
                    register={{
                      ...register("accountNumber"),
                    }}
                    type={"number"}
                    placeholder={""}
                    disable={false}
                  />
                </div>
                <div className="col-lg-3 d-none d-lg-block"></div>
                <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                  <label>IFSC Code</label>
                  <InputBox
                    register={{
                      ...register("IFSCCode"),
                    }}
                    className={"text-uppercase"}
                    type={"text"}
                    placeholder={""}
                    disable={false}
                  />
                </div>
              </div>
            </div> */}
            {/* next btn  */}
            <div className="d-flex align-items-center justify-content-center">
              <Button
                name={"Next"}
                //   onClick={handleSubmit(handleVendorInformation)}
                onClick={() => {
                  setActiveTab("SUPPLY");
                }}
              />
            </div>
          </div>
        )}
        {activeTab === "SUPPLY" && (
          <div>
            {loader && <Loader />}
            {/* create add recipe order form  */}
            <div className="form_wrapper">
              <div className="form_list_layout_wrapper">
                <div className="d-flex align-items-center justify-content-between py-2">
                  <div className="form_layout">
                    <div className="row">
                      <div className="input_wrapper col-12 col-md-12 col-lg-6 ">
                        <label>Description</label>
                        <textarea
                          {...register("description")}
                          className="form-control custom_input"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                    <div className="row d-flex align-items-end">
                      <div className="col-lg-3 col-md-6 input_wrapper">
                        <label>Quantity*</label>
                        <InputBox
                          // type={"text"}
                          register={{
                            ...register("quantity", {
                              // required: "quantity Name is required",
                            }),
                          }}
                          errors={errors.quantity}
                        />
                      </div>
                      <div className="col-lg-3 col-md-6 input_wrapper">
                        <label>Warranty *</label>
                        <InputBox
                          // type={"number"}
                          register={{
                            ...register("warrenty", {
                              // required: "warrenty Name is required",
                            }),
                          }}
                          errors={errors.warrenty}
                        />
                      </div>
                      <div className="col-lg-3 col-md-6 input_wrapper">
                        <label>Note *</label>
                        <InputBox
                          // type={"number"}
                          register={{
                            ...register("note", {
                              // required: "note Name is required",
                            }),
                          }}
                          errors={errors.note}
                        />
                      </div>
                      <div className="col-lg-3 col-md-6 input_wrapper">
                        <button type="button" className="btn btn-success" onClick={addMaterial}>
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="row d-flex align-items-end"></div>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-center gap-3 my-3">
                {/* <button type="button" onClick={""} className="btn btn-success">
                 Send
               </button> */}

                <CustomBtn
                  name={"Save"}
                  // name={
                  //   buttonLoader ? (
                  //     <ButtonLoader />
                  //   ) : [undefined, null, ""]?.includes(recipeId) ? (
                  //     "Create"
                  //   ) : (
                  //     "Update"
                  //   )
                  // }
                  type="submit"
                  className="btn btn-success"
                  onClick={() => handleSubmit(createOrder)}
                ></CustomBtn>
              </div>
            </div>
            {/*// Sales Order Preview*/}
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
                        <h5>Quantity</h5>
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
                              <h6>{product?.note ? product?.note : "--"}</h6>
                            </div>
                            <div className="col_25p">
                              <h6 className="action_wrraper">
                                {product?.warranty ? product?.warranty : "--"}
                              </h6>
                            </div>
                            <div className="col_20p">
                              <h6 className="action_wrraper ">
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  // onClick={() => deleteProduct(index)}
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
          </div>
        )}
      </form>
    </>
  );
};

export default CreateOrder;
