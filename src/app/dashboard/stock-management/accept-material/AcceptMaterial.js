"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import SelectBox from "@/common-components/Select";

import { getBrands, getCategory, getCategoryWiseBrand, getLocations, getLocationWiseBlock, getParameter, getRackPartation } from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import ButtonLoader from "@/common-components/ButtonLoader";
import Loader from "@/common-components/Loader";
import Swal from "sweetalert2";
import { stockStatus } from "@/helper/stockStatusArray";

const AcceptMaterial = () => {
  const router = useRouter();
  const [brandName,setBrandName] = useState("")
  const [loader, setLoader] = useState(false);
  const [isPartationPresent, setIsPartationPresent] = useState("");
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);
  const searchParams = useSearchParams();
  const [rackPartation, setRackPartation] = useState([]);
  const [partition, setPartition] = useState("");

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
      };
      let response = await communication.updateStockBeforeAccept(dataToSend);
      if (response?.data?.status === "SUCCESS") {
         toast.success(response?.data?.message);
        // acceptMaterial();
        router.push("/dashboard/stock-management");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message)
        router.push("/");
      } else if (response?.data?.status == "FAILED") {
        toast.info(response?.data?.message)
      } else {
        toast.info(response.data.message)
      }
      setLoader(false);
    } catch (error) {
              toast.info(error?.response?.data?.message || error.message)

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
        getCategoryWiseBrand(stockData?.categoryId?._id, setLoader, router, setBrandsData)
        setPartition(stockData.partitionName);
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.info(responseFromServer?.data?.message)
        router.push("/login");
      } else {
        toast.info(responseFromServer?.data?.message)
      }
    } catch (error) {
              toast.info(error?.response?.data?.message || error.message)

    } finally {
      setLoader(false);
    }
  }

  // useEffect(() => {
  //   setValue("partitionName", isPartationPresent);
  // }, [rackPartation && rackPartation.length >= 1]);
  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      const parameterDetails = category.find((ele) => ele.categoryId === id);
      setValue("parameterId", parameterDetails?._id);
      setParameter(parameterDetails?.parameter ?? []);
      getCategoryWiseBrand(id, setLoader, router, setBrandsData)
    } else {
      setParameter([]);
      setValue("parameterId", "");
    }
  }, [categoryId]);

  // useEffect(()=>{
  //   const id = getValues("categoryId");
  //   if (id) {
  //     getCategoryWiseBrand(id, setLoader, router, setBrandsData)
  //   }
  // },[categoryId])

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
      </div>
      <div className="form_layout">
        <div className="form_tabs_wrapper">
          
        </div>
        <>
          <div className="form_main" style={{ height: "70%" }}>
            <div className="row">
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Select Location </label>
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
                      <option
                        className="small text-capitalize"
                        value={ele._id}
                        key={index}
                      >
                        {" "}
                        {ele.name}
                      </option>
                    );
                  })}
                </select>
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
                      <option
                        className="small text-capitalize"
                        value={ele._id}
                        key={index}
                      >
                        {" "}
                        {ele.blockNo}
                      </option>
                    );
                  })}
                </select>
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
                      <option
                        className="small text-capitalize"
                        value={ele._id}
                        key={index}
                      >
                        {" "}
                        {ele.rackName}
                      </option>
                    );
                  })}
                </select>
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
                      <option
                        className="small text-capitalize"
                        value={ele._id}
                        key={index}
                      >
                        {" "}
                        {ele.partitionName}
                      </option>
                    );
                  })}
                </select>
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
                <InputBox
                  value={brandName}
                  disable
                />
                {/* <select
                  name="brandId"
                  className="form-control custom_input"
                  style={{ width: "100%" }}
                  {...register("brandId", {
                    required: "Brand is required",
                  })}
                >
                  <option>{brandName}</option> */}
                  {/* <option value="" className="text-secondary text-lowercase">
                    Select Brand
                  </option>
                  {brandsData.map((ele, index) => {
                    return (
                      <option
                        className="small text-capitalize"
                        value={ele._id}
                        key={index}
                      >
                        {" "}
                        {ele.name}
                      </option>
                    );
                  })} */}
                {/* </select> */}
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
                      <option
                        className="small text-capitalize"
                        value={ele}
                        key={index}
                      >
                        {" "}
                        {ele}
                      </option>
                    );
                  })}
                </select>
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
                <label>Quantity </label>
                <InputBox
                  register={{
                    ...register("quantity", { required: "Quantity is required" }),
                  }}
                  errors={errors.quantity}
                  disable
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Model Name  </label>
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
            <CustomBtn
              name="Accept"
              onClick={handleSubmit(onSubmit)}
            />
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

export default AcceptMaterial;
