"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import SelectBox from "@/common-components/Select";

import {
  getCategory,
  getCategoryWiseBrand,
  getLocationWiseBlock,
  getParameter,
  getRackPartation,
} from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import ButtonLoader from "@/common-components/ButtonLoader";
import Loader from "@/common-components/Loader";
import { stockStatus } from "@/utilities/stock-status-array";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

const InventoryView = ({ data }) => {
  const { modalStates, setModalStates, setIsPageUpdated, locationsss, roleList, getStockList } =
    data;

  const router = useRouter();
  const params = useSearchParams();
  const [loader, setLoader] = useState(false);
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [productMapData, setProductMapData] = useState([]);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [blockId, setBlockId] = useState();
  const [blocks, setBlocks] = useState([]);
  const [racks, setRacks] = useState([]);
  const [rackPartation, setRackPartation] = useState([]);
  const [model, setModel] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [category, setCategory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isPartationPresent, setIsPartationPresent] = useState("");
  const [modelId, setModelId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    watch,
  } = useForm({
    defaultValues: {},
  });
  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  const rack = watch("blockId");
  const _rackIdForPrtn = watch("rackId");
  useEffect(() => {
    setValue("partitionName", isPartationPresent);
  }, [rackPartation && rackPartation.length >= 1]);
  useEffect(() => {
    const id = getValues("rackId");
    if (id) {
      getRackPartation(id, setLoader, router, setRackPartation);
    } else {
      setRackPartation([]);
    }
  }, [_rackIdForPrtn]);
  useEffect(() => {
    const id = getValues("blockId");
    if (id) {
      const rackDetails = blocks.find((ele) => ele._id === id);
      setRacks(rackDetails?.rackId ?? []);
    } else {
      setRacks([]);
    }
  }, [rack]);
  useEffect(() => {
    getLocations(setLoader, router, setLocations);
    getParameter(setLoader, router, setCategory);
    // getBrands(setLoader, router, setBrands);
    // getAllModels(setLoader, router, setModelList);
  }, []);
  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      const parameterDetails = category.find((ele) => ele.categoryId === id);
      setValue("parameterId", parameterDetails?._id);
      setParameter(parameterDetails?.parameter ?? []);
    } else {
      setParameter([]);
      setValue("parameterId", "");
    }
  }, [categoryId]);
  async function getLocations() {
    try {
      setLoader(true);
      const serverResponse = await communication.getLocations();
      if (serverResponse?.data?.status === "SUCCESS") {
        setLocationList(serverResponse?.data?.result);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        setLocationList([]);
      }
      setLoader(false);
    } catch (error) {
      toast.warn(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }
  async function getBrandWiseModel() {
    try {
      // props.setLoader(true);
      const payload = {
        brandId: brandId,
      };
      const serverResponse = await communication.brandWiseModel(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setModel(serverResponse?.data?.model);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        setModel([]);
      }
      // props.setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      // props.setLoader(false);
    }
  }
  const onSubmit = async (values) => {
    try {
      setLoader(true);
      const dataToSend = {
        stockId: modalStates?.id,
        ...values,
      };
      let response = await communication.updateStock(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        setButtonLoader(false);
        setModalStates((prev) => ({ ...prev, modal: false }));
        // setIsPageUpdated((prev) => !prev);
        getStockList();

        toast.success(response?.data?.message, {
          autoClose: 1500, // 1.5 seconds
        });
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response?.data?.message, {
          autoClose: 1500, // 1.5 seconds
        });
        router.push("/");
      } else {
        toast.info(response.data.message, {
          autoClose: 1500, // 1.5 seconds
        });
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message, {
        autoClose: 1500, // 1.5 seconds
      });
      // Swal.fire({
      //   text: error?.response?.data?.message || error.message,
      //   icon: "warning",
      // });
    } finally {
      setLoader(false);
    }
  };
  const stockInDetailsSubmit = async (values) => {
    try {
      setLoader(true);
      let response = await communication.stockIn(values);
      if (response?.data?.status === "SUCCESS") {
        setModalStates((prev) => ({ ...prev, modal: false }));
        reset();
        setValue("locationId", "");
        setValue("categoryId", "");
        setValue("modelId", "");
        setValue("blockId", "");
        setValue("quantity", "");
        setValue("retailPrice", "");
        setValue("wholeSalePrice", "");
        setValue("displayPrice", "");
        toast.success(response.data.message);
        // await getStockList({ currentPage, searchString });
        setLoader(false);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        router.push("/");
      } else {
        toast.warn(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoader(false);
    }
  };
  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));

    // if (modalStates?.type !== "create") {
    //   await getBrandById()
    // }
  }
  const handleCategory = async () => {
    if (getValues("categoryId")) {
      setBrandsData(
        await getCategoryWiseBrand(getValues("categoryId"), setLoader, router, setBrandsData)
      );
    } else {
      setBrandsData([]);
    }
  };

  useEffect(() => {
    const id = getValues("brandId");
    if (id) {
      getBrandWiseModel(id);
    }
  }, [brandId]);
  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      getLocationWiseBlock(id, setLoader, router, setBlocks);
    }
  }, [location]);

  useMemo(() => {
    handleCategory();
  }, [categoryId]);

  useEffect(() => {
    getLocations();
    initialAPICall();
  }, []);
  useEffect(() => {
    if (modalStates?.type === "update") {
      getStockById();
    }
  }, []);
  async function getStockById() {
    try {
      setLoader(true);
      const responseFromServer = await communication.getStockById(modalStates?.id);
      if (responseFromServer?.data?.status === "SUCCESS") {
        // Set default values for each form field
        setIsPartationPresent(responseFromServer?.data?.stock.partitionName);
        getRackPartation(
          responseFromServer?.data?.stock.rackId,
          setLoader,
          router,
          setRackPartation
        );
        const stockData = responseFromServer?.data?.stock;
        setValue("locationId", stockData?.locationId?._id);
        await getLocationWiseBlock(stockData?.locationId?._id, setLoader, router, setBlocks);
        setValue("parameterId", stockData?.parameterId);
        setValue("modelId", stockData?.modelId._id);
        setModelId(stockData?.modelId);
        setValue("conditionType", stockData?.conditionType);
        setValue("itemCode", stockData?.itemCode);
        setValue("parameter", stockData?.parameter);
        setValue("serialNo", stockData?.serialNo);
        setValue("status", stockData?.status);
        setValue("quantity", stockData?.quantity);
        setValue("categoryId", stockData?.categoryId._id);
        setValue("rackId", stockData?.rackId?._id);
        setValue("brandId", stockData?.brandId?._id);
        setValue("blockId", stockData?.blockId?._id);
        // setValue("partitionName", stockData?.partitionName);
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
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal" style={{ width: "55%" }}>
          <div className="form_modal_header">
            <h5 className="title">View Details</h5>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
              className="close_modal_icon"
            />
          </div>
          <div className="form_modal_body">
            {/* <div className="form_layout"> */}
            <>
              {/* <div className="form_main"> */}
              <div className="row">
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Select Location</label>
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
                    {locationList.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" value={ele._id} key={index}>
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Select Block</label>
                  {/* <SelectBox
                  options={blocks}
                  firstOption={"Select Block"}
                  displayName={"blockNo"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("blockId", {
                      required: "Select Block",
                    }),
                  }}
                  errors={errors.blockId}
                /> */}
                  <select
                    disabled
                    name="blockId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("blockId", {
                      required: "blockNo is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select block
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
                </div>
                {racks.length >= 1 && (
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <label>Select Rack *</label>

                    <select
                      disabled
                      {...register("rackId", {
                        required: "Rack is required",
                      })}
                      className="form-control custom_input"
                      style={{ width: "100%" }}
                    >
                      <option value="">Select Rack</option>
                      {racks.map((ele, index) => {
                        return (
                          <option value={ele._id} key={index}>
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
                )}
                {rackPartation?.length > 1 && (
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <label>Select Partation *</label>
                    <select
                      disabled
                      {...register("partitionName", {
                        required: "Partation is required",
                      })}
                      className="form-control custom_input"
                      style={{ width: "100%" }}
                    >
                      <option value="">Select Partation</option>
                      {rackPartation?.map((ele, index) => {
                        return (
                          <option value={ele.partitionName} key={index}>
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
                )}
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>category Name *</label>
                  {/* <SelectBox
                  options={CategoryMapData}
                  firstOption={"Select Category"}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("categoryId", {
                      required: "Select Category",
                    }),
                  }}
                  errors={errors.categoryId}
                /> */}
                  <select
                    disabled
                    // name="categoryId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("categoryId", {
                      required: "categoryId is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Category*
                    </option>
                    {category.map((ele, index) => {
                      return (
                        <option value={ele.categoryId} key={index}>
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
                  <label>Brand/Make *</label>
                  {/* <SelectBox
                  options={brandMapData}
                  firstOption={"Select Brand"}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("brandId", {
                      required: "Select Brand",
                    }),
                  }}
                  errors={errors.brandId}
                /> */}
                  <select
                    disabled
                    name="brandId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("brandId", {
                      required: "Brand is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Brand
                    </option>
                    {brandsData?.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" value={ele._id} key={index}>
                          {" "}
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.brandId && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.brandId.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Condition Type *</label>
                  {/* <SelectBox
                  options={brandMapData}
                  firstOption={"Select Brand"}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("brandId", {
                      required: "Select Brand",
                    }),
                  }}
                  errors={errors.brandId}
                /> */}
                  <select
                    disabled
                    {...register("conditionType", {
                      required: "condition is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
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
                  <label>Status *</label>

                  <select
                    disabled
                    {...register("status", {
                      required: "Status is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Status</option>
                    {stockStatus.map((ele, index) => {
                      return (
                        <option value={ele} key={index}>
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
                  <label>Serial No *</label>
                  <InputBox
                    disable={true}
                    register={{
                      ...register("serialNo", {
                        required: "serialNo is required",
                      }),
                    }}
                    errors={errors.serialNo}
                  />
                </div>{" "}
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Quantity *</label>
                  <InputBox
                    disable={true}
                    register={{
                      ...register("quantity", {
                        required: "Quantity is required",
                      }),
                    }}
                    errors={errors.quantity}
                  />
                </div>{" "}
                {/* <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Model Name *</label>
                <select
                  name="categoryId"
                  className="form-control custom_input"
                  style={{ width: "100%" }}
                  {...register("modelId", {
                    required: "modelId is required",
                  })}
                >
                  <option value="" className="text-secondary text-lowercase">
                    Select Model
                  </option>
                  {productMapData.map((ele, index) => {
                    return (
                      <option className="small text-capitalize" value={ele._id} key={index}>
                        {" "}
                        {ele.name}
                      </option>
                    );
                  })}
                </select>
              </div> */}
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Model Name *</label>
                  <div className="position-relative">

                  <select
                    disabled
                    {...register("modelId", {
                      required: "modelId is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                  >
                    <option value="">Model Name</option>
                    {model.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          key={index}
                          selected={ele._id === getValues("modelId")}
                        >
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
                    {errors.modelId && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.modelId.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Item Code *</label>
                  <InputBox
                    disable={true}
                    register={{
                      ...register("itemCode", {
                        required: "itemCode is required",
                      }),
                    }}
                    errors={errors.itemCode}
                  />
                </div>{" "}
                {/* <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Retail Price Per Item *</label>
                <InputBox
                  register={{
                    ...register("retailPrice", { required: "Retail Price is required" }),
                  }}
                  errors={errors.retailPrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Wholesale Price Per Item *</label>
                <InputBox
                  register={{
                    ...register("wholeSalePrice", { required: "Wholesale Price is required" }),
                  }}
                  errors={errors.wholeSalePrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Display Wholesale Price per item*</label>
                <InputBox
                  register={{
                    ...register("displayPrice", {
                      required: "Display Wholesale Price is required",
                    }),
                  }}
                  errors={errors.displayPrice}
                />
              </div> */}
                {parameter?.map((item, index) => (
                  <React.Fragment key={index}>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>{item}</label>
                      <input
                        disabled
                        type="text"
                        {...register(`parameter[${item}]`)}
                        className="form-control custom_input"
                        // style={{ width: "100%", height: "31px" }}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>
              {/* </div> */}
              <div className="form_button_wrapper gap-2">
                {/* <CustomBtn name="Save" onClick={handleSubmit(stockInDetailsSubmit)} /> */}
                {/* <CustomBtn
              name="Back"
              onClick={() => {
                router.back();
              }}
            /> */}
              </div>
            </>
            {/* </div> */}

            {/* <div className="form_button_wrapper">
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
                  modalStates?.type == "create"
                    ? handleSubmit(stockInDetailsSubmit)
                    : handleSubmit(onSubmit)
                }
              />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryView;
