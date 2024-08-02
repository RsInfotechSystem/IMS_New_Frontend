import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import Loader from "@/common-components/Loader";
import { getBrands, getLocations, getLocationWiseBlock, getParameter } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCookie } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const ReturnMaterial = ({ data }) => {
  const { modalStates, setModalStates } = data;
  const [buttonLoader, setButtonLoader] = useState(false);

  const router = useRouter();
  const [roleName, setRoleName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    getValues,
    setValue,
    setError,
  } = useForm({
    defaultValues: {
      quantity: 1,
      parameterId: "",
      parameter: {},
    },
  });

  const [loader, setLoader] = useState(false);

  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brands, setBrands] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [blockValue, setBlockvalue] = useState("");
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);
  const searchParams = useSearchParams();
  const [dataToAddList, setDataToAddList] = useState([]);
  const [addedDataId, setAddedDataId] = useState([]);
  const [isShowMaterialList, setIsShowMaterialList] = useState(false);
  const [modelName, setModelName] = useState("");
  const [isRackExist, setIsRackExist] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [materialList, setMaterialList] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [materialIdList, setMaterialIdList] = useState([]);
  const [modelId, setModelId] = useState("");

  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const rack = watch("blockId");

  const handleMaterialChange = (event) => {
    setSelectedMaterial(event.target.value);
    const selectedIndex = event.target.selectedIndex;
    const materialId = event.target[selectedIndex].getAttribute("data-id");
    // setModelName(materialId);
  };
  const handleAddMaterial = () => {
    if (selectedMaterial) {
      const selectedIndex = dataToAddList.findIndex(
        (ele) => ele.categoryId.name === selectedMaterial
      );

      const materialId = dataToAddList[selectedIndex]._id;

      if (!materialList.includes(selectedMaterial)) {
        setMaterialList([...materialList, selectedMaterial]);
        setMaterialIdList([...materialIdList, materialId]);
      }

      setValue("materialId", "");
      setSelectedMaterial("");
      setError("materialId", {
        message: "",
      });
    } else {
      setError("materialId", {
        message: "Please enter material",
      });
    }
  };
  useEffect(() => {
    setValue("blockId", blockValue);
  }, [blocks.length > 0 && blockValue]);

  const handleRemoveMaterial = (index) => {
    setMaterialList((prevList) => prevList.filter((_, i) => i !== index));
    setMaterialIdList((prevList) => prevList.filter((_, i) => i !== index));
  };



  const onSubmit = async (values) => {
    try {
      setLoader(true);
      const dataToSend = {
        materialId: modalStates?.id,
        addedData: materialIdList,
      };

      let response = await communication.returnMaterial(dataToSend);
      if (response?.data?.status === "SUCCESS") {
         toast.success(response?.data?.message);
        router.push("/admin/dashboard/daily-task/");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message)
        router.push("/");
      } else {
        toast.info(response.data.message)
      }
    } catch (error) {
              toast.info(error?.response?.data?.message || error.message)

    } finally {
      setLoader(false);
    }
    // }
  };
  async function getModelList(page, searchString, isSearch = false) {
    try {
      // props.setLoader(true);
      const serverResponse = await communication.getModelList(page, searchString);
      if (serverResponse?.data?.status === "SUCCESS") {
        setModelList(serverResponse?.data?.model);
        // setBlockList(serverResponse?.data.block);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
        // const initialCheckedStatus = {};
        // serverResponse?.data.block.forEach((block) => {
        //   initialCheckedStatus[block._id] = block.isActive || false;
        // });
        // setCheckedStatus(initialCheckedStatus);
      } else if (serverResponse?.data?.status === "FAILED") {
        toast.info(serverResponse.data.message)
        // setBlockList([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message)
        router.push("/");
        // props.setLoader(false);
      } else {
        setBlockList([]);
      }
      // props.setLoader(false);
    } catch (error) {
              toast.info(error?.response?.data?.message || error.message)

      // props.setLoader(false);
    }
  }

  async function getMaterialById() {
    try {
      setLoader(true);
      const responseFromServer = await communication.getReturnMaterialById({
        materialId: modalStates?.id,
      });
      if (responseFromServer?.data?.status === "SUCCESS") {
        console.log(
          responseFromServer.data.materialData,
          "rrrrrrrrrrr sdata brand materialData?.brandId"
        );
        // Set default values for each form field
        setIsRackExist(responseFromServer?.data?.material.rackId._id);
        setDataToAddList(responseFromServer?.data?.material.dataToAddList);
        setModelName(responseFromServer?.data?.material.modelId);
        setIsShowMaterialList(
          responseFromServer?.data?.material?.categoryId?.isReplaceable !== true
        );
        const materialData = responseFromServer?.data?.material;
        setValue("locationId", materialData?.locationId._id);
        await getLocationWiseBlock(materialData?.locationId._id, setLoader, router, setBlocks);
        await getBrands(setLoader, router, setBrands);
        // await getModelList(result?.model?.name, setLoader, router, setModelList);
        setValue("parameterId", materialData?.parameterId);
        setModelId(materialData.modelId._id);
        setValue("conditionType", materialData?.conditionType);
        setValue("itemCode", materialData?.itemCode);
        setValue("parameter", materialData?.parameter);
        setValue("serialNo", materialData?.serialNo);
        setValue("status", materialData?.status);
        setValue("categoryId", materialData?.categoryId._id);
        setValue("rackId", materialData?.rackId._id);
        console.log(materialData?.brandId._id, "rrrrrr materialData?.brandId._id");
        setValue("brandId", materialData?.brandId._id);
        setValue("brandIds", materialData?.brandId.name);
        setBlockvalue(materialData?.blockId._id);
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
  // useEffect(() => {
  //   const id = getValues("modelName");
  //   if (id) {
  //     getModelList(id, setLoader, router, setModelList);
  //   }
  // }, [modelName]);
  useEffect(() => {
    const id = getValues("locationId");
    console.log("iddddddd", id);
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

  async function callAPIs(params) {
    await getLocations(setLoader, router, setLocations);
    await getParameter(setLoader, router, setCategory);
    await getMaterialById();
    getModelList();
  }

  useEffect(() => {
    setValue("modelName", modelId);
  }, [modelList?.length >= 1]);

  useEffect(() => {
    callAPIs();
    setRoleName(getCookie("role"));
  }, []);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal" style={{ width: "55%" }}>
          <div className="form_modal_header">
            <h5 className="title">
              {/* {modalStates?.type === "create" ? "Create Stock" : "Update Stock"} */}
              Return Material
            </h5>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
              className="close_modal_icon"
            />
          </div>
          <div className="form_modal_body">
            <form>
              <div className="row  ">
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Select Location</label>
                  <select
                    disabled
                    {...register("locationId", {
                      required: "Location is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select location</option>
                    {locations.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          key={index}
                          selected={ele._id === getValues("locationId") ? true : false}
                        >
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  {errors.locationId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.locationId.message}
                    </p>
                  )}
                </div>

                <div className="col-lg-3 col-md-6 input_wrapper">
                  {" "}
                  <label>Select Block</label>
                  <select
                    disabled
                    {...register("blockId", {
                      required: "Block is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Block</option>
                    {blocks.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          key={index}
                          selected={ele._id === getValues("blockId") ? true : false}
                        >
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

                {racks.length >= 1 && isRackExist && (
                  <>
                    {" "}
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Select Rack</label>
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
                            <option
                              value={ele._id}
                              key={index}
                              selected={ele._id === getValues("rackId") ? true : false}
                            >
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
                  </>
                )}
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Category</label>
                  <select
                    disabled
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Category</option>
                    {category.map((ele, index) => {
                      return (
                        <option
                          value={ele.categoryId}
                          key={index}
                          selected={ele.categoryId === getValues("categoryId") ? true : false}
                        >
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
                  <input
                    type="text"
                    disabled
                    {...register("brandIds", {
                      required: "Brand is required",
                    })}
                    className="form-control custom_input"
                  />
                  {/* <select
                    disabled
                    {...register("brandId", {
                      required: "Brand is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          key={index}
                          selected={ele._id === getValues("brandId") ? true : false}
                        >
                          {ele.name}
                        </option>
                      );
                    })}
                  </select> */}
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
                    disabled
                    {...register("conditionType", {
                      required: "condition is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Condition</option>
                    <option
                      value="new"
                      selected={"new" === getValues("conditionType") ? true : false}
                    >
                      New
                    </option>
                    <option
                      value="refurbished"
                      selected={"refurbished" === getValues("conditionType") ? true : false}
                    >
                      Refurbished
                    </option>
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.conditionType && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.conditionType.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* <div className="col-lg-1 col-md-1  mb-3  d-flex align-items-center">
                  <h6>Status</h6>
                </div>
                <div className="col-lg-2 col-md-3  mb-3">
                  <select
                    disabled
                    {...register("status", {
                      required: "Status is required",
                    })}
                    className="selectBox text-capitalize"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Status</option>
                    {stockStatus.map((ele, index) => {
                      return (
                        <option
                          value={ele}
                          key={index}
                          selected={ele === getValues("status") ? true : false}
                        >
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
                </div> */}
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Item Code</label>
                  <input
                    disabled
                    type="text"
                    {...register("itemCode", {
                      required: "Item code is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%", height: "31px" }}
                  />

                  <div style={{ height: "5px" }}>
                    {errors.itemCode && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.itemCode.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label className="me-1">Serial No</label>
                  <input
                    disabled
                    type="text"
                    {...register("serialNo", {
                      required: "SerialNo is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%", height: "31px" }}
                  />
                  <div style={{ height: "5px" }}>
                    {errors.serialNo && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.serialNo.message}
                      </p>
                    )}
                  </div>

                  {/* <input type="checkbox" style={{ width: "13px", backgroundColor: "#B9B9B9" }} /> */}
                </div>

                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Quantity</label>
                  <input
                    disabled
                    type="text"
                    {...register("quantity", {
                      required: "Quantity is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%", height: "31px" }}
                  />
                  <div style={{ height: "5px" }}>
                    {errors.quantity && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.quantity.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-lg-3 col-md-6 input_wrapper">
                  <label>Model Name</label>
                  <select
                    {...register("modelName", {
                      required: "Model Name is required",
                    })}
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    disabled
                  >
                    <option value="">Select Model Name</option>
                    {modelList?.map((ele, index) => {
                      return (
                        <option
                          value={ele._id}
                          selected={getValues("modelName") === ele._id ? true : false}
                          key={index}
                        >
                          {ele.name}
                        </option>
                      );
                    })}
                  </select>
                  <div style={{ height: "5px" }}>
                    {errors.modelName && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.modelName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-lg-2 col-md-3">
                  {/* <input
                    disabled
                    type="text"
                    {...register("modelName", {
                      required: "Model Name is required",
                    })}
                    className="inputBox"
                    style={{ width: "100%", height: "31px" }}
                  />
                  <div style={{ height: "5px" }}>
                    {errors.modelName && (
                      <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                        {errors.modelName.message}
                      </p>
                    )}
                  </div> */}
                </div>
              </div>
              <div className="row m-0 mt-3 mb-3 ">
                {parameter?.map((item) => (
                  <>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>{item}</label>
                      <input
                        disabled
                        type="text"
                        {...register(`parameter[${item}]`)}
                        className="form-control custom_input"
                        style={{ width: "100%", height: "31px" }}
                      />
                      <div style={{ height: "5px" }}>
                        {/* {errors.mobile && (
                <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                  {errors.mobile.message}
                </p>
              )} */}
                      </div>
                    </div>
                  </>
                ))}
              </div>

              <div className="row m-0 mt-3 mb-3">
                {isShowMaterialList && (
                  <>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Select Material</label>
                      <select
                        {...register("materialId")}
                        className="form-control custom_input"
                        style={{ width: "100%" }}
                        onChange={handleMaterialChange}
                        value={selectedMaterial} // Add value prop to control the selected value
                      >
                        <option value="">Select Material</option>
                        {dataToAddList.map((ele, index) => {
                          return (
                            <option
                              value={ele.categoryId.name}
                              key={index}
                              data-id={ele.categoryId._id} // Added data-id attribute
                            >
                              {`${ele.categoryId.name} (${ele.itemCode})`}
                            </option>
                          );
                        })}
                      </select>

                      <div style={{ height: "5px" }}>
                        {errors.materialId && (
                          <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                            {errors.materialId.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>&nbsp;</label>

                      <button
                        type="button"
                        className="mt-4 btn btn-success"
                        onClick={handleAddMaterial}
                        // style={{
                        //   height: "28px",
                        //   width: "35px",
                        //   border: "1px solid #BABABA",
                        //   marginBottom: "11px",
                        // }}
                      >
                        {/* <Image src={addIcon} alt="add-icon"></Image> */}add
                      </button>
                    </div>
                  </>
                )}
                {materialList.length > 0 && (
                  <div className="col-lg-12 mt-3">
                    <label>Selected Materials:</label>
                    <ul className="list-unstyled d-flex gap-2">
                      {materialList.map((material, index) => (
                        <li key={index}>
                          {material}
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(index)}
                            className="btn btn-link btn-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* <div className="form_button_wrapper"> */}
        <div className="d-flex align-items-center justify-content-center gap-3 my-3">

                {roleName != "admin" && (
                  <CustomBtn name={"Return"} onClick={handleSubmit(onSubmit)} />
                )}
                <CustomBtn
                  name={"Back"}
                  onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
                />

                {/* <CustomBtn name={buttonLoader ? <ButtonLoader /> :  handleSubmit(onSubmit) } /> */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnMaterial;
