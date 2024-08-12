"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import {
  getCategoryWiseBrand,
  getLocations,
  getLocationWiseBlock,
  getParameter,
  getRackPartation,
} from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import Loader from "@/common-components/Loader";
import { stockStatus } from "@/helper/stockStatusArray";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AcceptMaterialModel = () => {
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [loader, setLoader] = useState(false);
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);
  const searchParams = useSearchParams();
  const [rackPartation, setRackPartation] = useState([]);
  const [partition, setPartition] = useState("");
  const [jobNo, setJobNo] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      quantity: 1,
      parameterId: "",
      parameter: {},
    },
  });
  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const rack = watch("blockId");
  const _rackIdForPrtn = watch("rackId");
  const rackId = watch("rackId");
  const brandId = watch("brandId");

  const onSubmit = async (value) => {
    try {
      setLoader(true);
      const dataToSend = {
        materialId: searchParams.get("stockId"),
        rackId: value.rackId,
        blockId: value.blockId,
        partitionName: value.partitionName,
        status: value.status,
        jobNo: jobNo,
      };
      let response = await communication.updateStockBeforeAccept(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response?.data?.message);
        // acceptMaterial();
        router.push("/dashboard/stock-management");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else if (response?.data?.status == "FAILED") {
        toast.info(response?.data?.message);
      } else {
        toast.info(response.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  };

  async function getStockById() {
    try {
      setLoader(true);
      const responseFromServer = await communication.getReturnMaterialById({
        materialId: searchParams.get("stockId"),
      });
      if (responseFromServer?.data?.status === "SUCCESS") {
        // Set default values for each form field
        const stockData = responseFromServer?.data?.material;

        setJobNo(stockData?.jobNo);
        // setIsPartationPresent(responseFromServer?.data?.material?.partitionName);
        getRackPartation(stockData.rackId._id, setLoader, router, setRackPartation);
        setValue("locationId", stockData?.locationId?._id);
        await getLocationWiseBlock(stockData?.locationId._id, setLoader, router, setBlocks);
        setValue("parameterId", stockData?.parameterId);
        setValue("modelName", stockData?.modelId.name);
        setValue("conditionType", stockData?.conditionType);
        setValue("itemCode", stockData?.itemCode);
        setValue("parameter", stockData?.parameter);
        setValue("serialNo", stockData?.serialNo);
        setValue("status", "");
        setValue("categoryId", stockData?.categoryId?._id);
        setValue("rackId", stockData?.rackId._id);
        setValue("brandId", stockData?.brandId._id);
        setValue("blockId", stockData?.blockId._id);
        setValue("partitionName", stockData?.partitionName);
        setBrandName(stockData?.brandId?.name);
        getCategoryWiseBrand(stockData?.categoryId?._id, setLoader, router, setBrandsData);
        setPartition(stockData.partitionName);
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.info(responseFromServer?.data?.message);
        router.push("/login");
      } else {
        toast.info(responseFromServer?.data?.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  }

  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      const parameterDetails = category.find((ele) => ele.categoryId === id);
      setValue("parameterId", parameterDetails?._id);
      setParameter(parameterDetails?.parameter ?? []);
      getCategoryWiseBrand(id, setLoader, router, setBrandsData);
    } else {
      setParameter([]);
      setValue("parameterId", "");
    }
  }, [categoryId]);

  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      getLocationWiseBlock(id, setLoader, router, setBlocks);
    }
  }, [location]);

  useEffect(() => {
    const id = getValues("blockId");
    if (id) {
      const rackDetails = blocks?.find((ele) => ele._id === id);
      setRacks(rackDetails?.rackId ?? []);
    } else {
      setRacks([]);
    }
  }, [rack]);

  useEffect(() => {
    const id = getValues("rackId");
    if (id) {
      getRackPartation(id, setLoader, router, setRackPartation);
    } else {
      setRackPartation([]);
    }
  }, [_rackIdForPrtn]);

  async function callAPIs(params) {
    await getLocations(setLoader, router, setLocations);
    await getParameter(setLoader, router, setCategory);
    // await getBrands(setLoader, router, setBrands);
    await getStockById();
  }
  useEffect(() => {
    setValue("partitionName", partition);
  }, [rackPartation.length >= 1, partition]);

  useEffect(() => {
    callAPIs();
  }, []);

  return (
    <>
      {loader && <Loader />}
      <div className="top_header">
        <div className="tab_title">Accept Material </div>
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
      <div className="form_layout">
        <div className="form_tabs_wrapper"></div>
        <>
          <div className="form_main" style={{ height: "70%" }}>
            <div className="row">
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Select Location </label>
                <div className="position-relative">
                  <select
                    name="locationId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("locationId", {
                      required: "locationId is required",
                    })}
                    disabled
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Location
                    </option>
                    {locations.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" value={ele._id} key={index}>
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                </div>

                <div style={{ height: "5px" }}>
                  {errors.locationId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.locationId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Select Block </label>
                <div className="position-relative">
                  <select
                    name="blockId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("blockId", {
                      required: "Block is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Block
                    </option>
                    {blocks.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" value={ele._id} key={index}>
                          {" "}
                          {ele.blockNo}
                        </option>
                      );
                    })}
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                </div>
                <div style={{ height: "5px" }}>
                  {errors.blockId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.blockId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Select Rack </label>
                <div className="position-relative">
                  <select
                    name="rackId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("rackId", {
                      required: "Rack is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Rack
                    </option>
                    {racks?.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" value={ele._id} key={index}>
                          {" "}
                          {ele.rackName}
                        </option>
                      );
                    })}
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                </div>
                <div style={{ height: "5px" }}>
                  {errors.rackId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.rackId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Select Partation </label>
                <div className="position-relative">
                  <select
                    name="partitionName"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("partitionName", {
                      required: "Partition is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Partation
                    </option>
                    {rackPartation.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" value={ele._id} key={index}>
                          {" "}
                          {ele.partitionName}
                        </option>
                      );
                    })}
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                </div>
                <div style={{ height: "5px" }}>
                  {errors.partitionName && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.partitionName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Category </label>
                <div className="position-relative">
                  <select
                    name="categoryId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                    disabled
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Category
                    </option>
                    {category.map((ele, index) => {
                      return (
                        <option
                          className="small text-capitalize"
                          value={ele.categoryId}
                          key={index}
                        >
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                </div>
                <div style={{ height: "5px" }}>
                  {errors.categoryId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Brand/Make</label>
                <InputBox value={brandName} disable />

                <div style={{ height: "5px" }}>
                  {errors.brandId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.brandId.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Condition Type</label>
                <div className="position-relative">
                  <select
                    name="conditionType"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("conditionType", {
                      required: "Condition is required",
                    })}
                    disabled
                  >
                    <option value="">Select Condition</option>
                    <option value="new">New</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                </div>
                <div style={{ height: "5px" }}>
                  {errors.conditionType && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.conditionType.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Status </label>
                <div className="position-relative">
                  <select
                    name="status"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("status", {
                      required: "Status is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Status
                    </option>
                    {stockStatus.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" value={ele} key={index}>
                          {" "}
                          {ele}
                        </option>
                      );
                    })}
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                </div>
                <div style={{ height: "5px" }}>
                  {errors.status && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Serial No </label>
                <InputBox
                  register={{
                    ...register("serialNo", {
                      required: "SerialNo is required",
                    }),
                  }}
                  disable
                  errors={errors.serialNo}
                />
              </div>{" "}
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>QTY </label>
                <InputBox
                  register={{
                    ...register("quantity", { required: "Quantity is required" }),
                  }}
                  errors={errors.quantity}
                  disable
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Model Name </label>
                <InputBox
                  register={{
                    ...register("modelName", { required: "Model Name Price is required" }),
                  }}
                  errors={errors.modelName}
                  disable
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Item Code</label>
                <InputBox
                  register={{
                    ...register("itemCode", {
                      required: "Item Code is required",
                    }),
                  }}
                  disable
                  errors={errors.itemCode}
                />
              </div>
              {/* <div className="row m-0 mt-2 mb-3 ps-5"> */}
              {parameter?.map((item, index) => (
                <div className="col-lg-3 col-md-6 input_wrapper" key={index}>
                  <label>{item}</label>
                  <InputBox
                    register={{
                      ...register(`parameter[${item}]`),
                    }}
                    disable
                  />
                </div>
              ))}
              {/* </div> */}
              {/* <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Processor Details </label>
                <InputBox
                  register={{
                    ...register("itemCode", {
                      required: "Item Code is required",
                    }),
                  }}
                  errors={errors.itemCode}
                />
              </div>{" "}
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>No. of Cores per Processor </label>
                <InputBox
                  register={{
                    ...register("retailPrice", { required: "Retail Price is required" }),
                  }}
                  errors={errors.retailPrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>No. of Processors</label>
                <InputBox
                  register={{
                    ...register("wholeSalePrice", { required: "Wholesale Price is required" }),
                  }}
                  errors={errors.wholeSalePrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Total No. of Cores</label>
                <InputBox
                  register={{
                    ...register("displayPrice", {
                      required: "Display Wholesale Price is required",
                    }),
                  }}
                  errors={errors.displayPrice}
                />
              </div>

              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Ram </label>
                <InputBox
                  register={{
                    ...register("quantity", {
                      required: "Quantity is required",
                    }),
                  }}
                  errors={errors.quantity}
                />
              </div>{" "}
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Storage Details</label>
                <InputBox
                  register={{
                    ...register("displayPrice", {
                      required: "Display Wholesale Price is required",
                    }),
                  }}
                  errors={errors.displayPrice}
                />
              </div>

              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Raid Card </label>
                <InputBox
                  register={{
                    ...register("quantity", {
                      required: "Quantity is required",
                    }),
                  }}
                  errors={errors.quantity}
                />
              </div>{" "}
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Console Port </label>
                <InputBox
                  register={{
                    ...register("retailPrice", { required: "Retail Price is required" }),
                  }}
                  errors={errors.retailPrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Power Supply Details/Part No. </label>
                <InputBox
                  register={{
                    ...register("wholeSalePrice", { required: "Wholesale Price is required" }),
                  }}
                  errors={errors.wholeSalePrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Bays Description </label>
                <InputBox
                  register={{
                    ...register("retailPrice", { required: "Retail Price is required" }),
                  }}
                  errors={errors.retailPrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Fan Unit/Part No.</label>
                <InputBox
                  register={{
                    ...register("wholeSalePrice", { required: "Wholesale Price is required" }),
                  }}
                  errors={errors.wholeSalePrice}
                />
              </div> */}
            </div>
          </div>
          <div className="form_button_wrapper gap-2">
            <CustomBtn name="Accept" onClick={handleSubmit(onSubmit)} />
            <CustomBtn
              name="Back"
              onClick={() => {
                router.back();
              }}
            />
          </div>
        </>
      </div>
    </>
  );
};

export default AcceptMaterialModel;
