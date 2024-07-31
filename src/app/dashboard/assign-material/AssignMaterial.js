"use client";

import { communication } from "@/services/communication";
import { useEffect, useMemo, useState } from "react";
import { getCategory, getCategoryWiseBrand, getCategoryWiseParameter } from "@/services/commonApis";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Loader from "@/common-components/Loader";
import { stockStatus } from "@/utilities/stock-status-array";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBtn from "@/common-components/CustomBtn";
import { toast } from "react-toastify";

const AssignMaterial = () => {
  const [selectedList, setSelectedList] = useState([]);
  const [material, setMaterial] = useState([]);
  const [TechnicianList, setTechnicianList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [parameter, setParameter] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllCheckedStock, setSelectAllCheckedStock] = useState(false);
  const [stockIds, setStockIds] = useState([]);
  const [userId, setUserId] = useState("");
  const [output, setOutput] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [brandMapData, setBrandMapData] = useState([]);
  const router = useRouter();
  const {
    register,
    // handleSubmit,
    reset,
    // formState: { errors },
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
  const brandId = watch("brandId");

  const searchString = watch("searchString");
  const [expandedModals, setExpandedModals] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [formValues, setFormValues] = useState({
    searchString: "",
    categoryId: "",
    status: "",
    brandId: "",
    conditionType: "",
  });
  const [errors, setErrors] = useState({});
  const handleDeleteMaterial = (id) => {
    setSelectedList(selectedList.filter((item) => item._id !== id));
  };
  // Handler for quantity change
  const handleQuantityChange = (materialData, newQuantity) => {
    console.log((materialData, "eleeeeeeeeeeeee"));
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [materialData._id]: newQuantity,
    }));

    // console.log("quaa", quantities);
    setOutput((pre) =>
      pre.map((ele) => {
        if (ele.stockId === materialData._id) {
          return {
            stockId: ele.stockId,
            assignQuantity: newQuantity,
          };
        } else {
          return ele;
        }
      })
    );
  };

  const toggleModal = (modelName) => {
    setExpandedModals((prevExpandedModals) => {
      if (prevExpandedModals.includes(modelName)) {
        return prevExpandedModals.filter((modal) => modal !== modelName);
      } else {
        return [...prevExpandedModals, modelName];
      }
    });
  };

  const handleCheckboxChange = (event, materialData) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add materialData to selectedList
      setSelectedList((prev) => [...prev, materialData]);
    } else {
      // Remove materialData from selectedList
      setSelectedList((prev) => prev.filter((item) => item._id !== materialData._id));
      setStockIds((prev) => prev.filter((item) => item !== materialData._id));
      setOutput((pre) => pre.filter((item) => item.stockId !== materialData._id));
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [materialData._id]: 1,
      }));
    }
  };
  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Select all checkboxes
      setSelectedList([...material]);
    } else {
      // Deselect all checkboxes
      setSelectedList([]);
      setStockIds([]);
      setSelectAllCheckedStock(false);
    }
    setSelectAllChecked(isChecked);
  };
  const handleSelectAllChangeStock = (event) => {
    const isChecked = event.target.checked;
    setSelectAllCheckedStock(isChecked);
    if (isChecked) {
      // If "Select All" is checked, select all checkboxes
      const allMaterialIds = selectedList.map((item) => item._id);
      setStockIds(allMaterialIds);
    } else {
      // If "Select All" is unchecked, deselect all checkboxes
      setStockIds([]);
    }
  };

  const getStockIds = (event, materialData) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add materialData to selectedList
      setStockIds((prev) => [...prev, materialData._id]);
      setOutput((pre) => [
        ...pre,
        { stockId: materialData._id, assignQuantity: quantities[materialData?._id] },
      ]);
    } else {
      // Remove materialData from selectedList
      setStockIds((prev) => prev.filter((item) => item !== materialData._id));
      setOutput((pre) => pre.filter((item) => item.stockId !== materialData._id));
    }
  };
  useEffect(() => {
    const fetchMaterial = async () => {
      const id = getValues("categoryId");

      try {
        let payload = {
          categoryId: id,
        };
        if (id) {
          let response = await communication.getCategoryWiseParameter(payload);
          if (response?.data?.status === "SUCCESS") {
            setParameter(response?.data?.parameter);
          }
        }
      } catch (error) {
        toast.warn(error.message);
      }
    };
    fetchMaterial();
  }, [formValues.categoryId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error message on input change
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate form based on conditions
    if (
      !formValues.searchString &&
      (!formValues.categoryId ||
        !formValues.status ||
        !formValues.brandId ||
        !formValues.conditionType)
    ) {
      newErrors.searchString = "Serial No./Item Code is required";
      if (!formValues.categoryId) newErrors.categoryId = "Category is required";
      if (!formValues.status) newErrors.status = "Status is required";
      if (!formValues.brandId) newErrors.brandId = "Brand is required";
      if (!formValues.conditionType) newErrors.conditionType = "Condition is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    if (!validateForm()) return;

    const payload = formValues.searchString
      ? { searchString: formValues.searchString }
      : {
          categoryId: formValues.categoryId,
          status: formValues.status,
          brandId: formValues.brandId,
          conditionType: formValues.conditionType,
        };

    await submitForm(payload);
  };

  const submitForm = async (payload) => {
    setStockIds([]);
    try {
      // let payload = {};
      // if (values.searchString) {
      //   payload.searchString = values.searchString;
      // } else {
      //   if (values.categoryId && values.status && values.brandId && values.conditionType) {
      //     payload.categoryId = values.categoryId;
      //     payload.status = values.status;
      //     payload.brandId = values.brandId;
      //     payload.conditionType = values.conditionType;
      //   }
      // }
      setLoader(true);
      let response = await communication.getMaterialList(payload);
      if (response?.data?.status === "SUCCESS") {
        setFormValues({
          searchString: "",
          categoryId: "",
          status: "",
          brandId: "",
          conditionType: "",
        });
        toast.success(response.data.message);
        reset();
        setMaterial(response?.data.stock);
        setParameter(response?.data?.parameters);
        // setQuantities(
        //   response?.data.stock.reduce((acc, material) => {
        //     acc[material._id] = 1;

        //     return acc;
        //   }, {})
        // );
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          ...response?.data.stock.reduce((acc, material) => {
            acc[material._id] = 1;
            return acc;
          }, {}),
        }));
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        router.push("/");
      } else {
        toast.warn(response.data.message);
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error.message);
      setLoader(false);
    }
  };

  const technicianList = async () => {
    try {
      setLoader(true);

      let response = await communication.getTechnicianList();
      if (response?.data?.status === "SUCCESS") {
        // toast.success(response.data.message);
        setTechnicianList(response?.data.user);
        // await getRoleList(currentPage, searchString);
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
  useEffect(() => {
    technicianList();
  }, []);

  const handleAssign = async () => {
    try {
      if (!userId) {
        toast.warn("Please Select Technician");
        return;
      }
      // if (output.length <= 0) {
      //   toast.warn("Please Select At least one material");
      //   return;
      // }
      setLoader(true);
      let payload = {
        materialDetails: output,
        userId: userId,
      };
      let response = await communication.AssignMaterial(payload);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message);
        setSelectedList([]);
        setMaterial([]);
        setParameter([]);
        setOutput([]);
        setStockIds([]);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        router.push("/");
      } else {
        toast.warn(response.data.message);
      }
    } catch (error) {
      toast.error(response.data.message);
    } finally {
      setLoader(false);
    }
  };
  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));
    // if (modalStates?.type !== "create") {
    //   await getBrandById();
    // }
  }
  useEffect(() => {
    initialAPICall();
  }, []);

  useEffect(() => {
    const id = formValues.categoryId;
    if (id) {
      getCategoryWiseBrand(id, setLoader, router, setBrandsData);
    }
  }, [formValues.categoryId]);
  const fetchMaterial = async (id) => {
    try {
      let payload = {
        categoryId: id,
      };
      if (id) {
        let response = await communication.getCategoryWiseParameter(payload);
        if (response?.data?.status === "SUCCESS") {
          setParameter(response?.data?.parameter);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    // const id = getValues("categoryId");
    const id = formValues.categoryId;
    if (id) {
      getCategoryWiseBrand(id, setLoader, router, setBrandsData);
      fetchMaterial(id);
    }
  }, [formValues.categoryId]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        // <div className=" page_wrapper">
        <div className="kitchen_wrapper">
          <div className="row">
            <div className="col-12 col-lg-4 col-md-4">
              <div className="form_view pt-0">
                <form onSubmit={handleSubmit}>
                
                  <div style={{ maxHeight: "40dvh", overflowY: "auto" }}>

                    <div className="px-3 py-1" style={{ backgroundColor: "white" }}>
                      {/* <div className="form_modal_body w-75 py-3"></div> */}
                      <div className="pb-2">
                    <h6>Select Material</h6>
                  </div>
                      <div className="row">
                        <div class="col-lg-6 col-md-5 d-flex align-items-center">
                          <label>Serial No./Item Code</label>
                        </div>
                        <div className="custom_input_wrapper col-lg-6 col-md-5">
                          <input
                            type="text"
                            name="searchString"
                            value={formValues.searchString}
                            onChange={handleChange}
                            className="form_control_assign custom_input"
                            style={{ width: "100%" }}
                            // style={{ paddingLeft: lefIcon ? 45 : "auto" }}
                            // className={`form_control_assign custom_input ${className}`}
                          />
                          <div style={{ height: "5px" }}>
                            {errors.searchString && (
                              <p className="validation_message" style={{ fontSize: "0.7rem" }}>
                                {errors.searchString}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <h6 className="d-flex align-items-center justify-content-center assign_or_font">OR</h6>
                      </div>
                      <div class="row">
                        <div className="input_wrapper col-6">
                          <label>Select Category</label>
                        </div>
                        <div class="col-lg-6 col-md-7 ">
                          <select
                            name="categoryId"
                            value={formValues.categoryId}
                            onChange={handleChange}
                            className="form_control_assign custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Category
                            </option>
                            {CategoryMapData.map((ele, index) => {
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
                            {errors.categoryId && (
                              <p
                                className="validation_message"
                                style={{ fontSize: "0.7rem", color: "red" }}
                              >
                                {errors.categoryId}
                              </p>
                            )}
                          </div>
                          <div className="select_box_arrow">
                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="input_wrapper col-6">
                          <label>Brand</label>
                        </div>
                        <div className="col-lg-6 col-md-7">
                          <select
                            // {...register("brandId", {
                            //   // required: "Brand is required",
                            // })}
                            name="brandId"
                            value={formValues.brandId}
                            onChange={handleChange}
                            className="form_control_assign custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Brand
                            </option>
                            {brandsData?.map((ele, index) => {
                              return (
                                <option
                                  value={ele._id}
                                  key={index}
                                  className="small text-capitalize"
                                >
                                  {console.log(ele, "ele")} {ele?.name}
                                </option>
                              );
                            })}
                          </select>
                          <div style={{ height: "5px" }}>
                            {errors.brandId && (
                              <p className="validation_message" style={{ fontSize: "0.7rem" }}>
                                {errors.brandId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-md-5 d-flex align-items-center ">
                          <label>Select Status</label>
                        </div>
                        <div className="col-lg-6 col-md-7">
                          <select
                            name="status"
                            value={formValues.status}
                            onChange={handleChange}
                            className="form_control_assign custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Status
                            </option>
                            {stockStatus.map((ele, index) => {
                              return (
                                <option value={ele} key={index} className="small text-capitalize">
                                  {" "}
                                  {ele}
                                </option>
                              );
                            })}
                          </select>
                          <div style={{ height: "5px" }}>
                            {errors.status && (
                              <p className="validation_message" style={{ fontSize: "0.7rem" }}>
                                {errors.status}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-md-5 d-flex align-items-center">
                          <label>Condition Type</label>
                        </div>
                        <div className="col-lg-6 col-md-7 mt-2">
                          <select
                            // {...register("conditionType", {
                            //   // required: "condition is required",
                            // })}
                            name="conditionType"
                            value={formValues.conditionType}
                            onChange={handleChange}
                            className="form_control_assign custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Condition
                            </option>
                            <option
                              value="new"
                              selected={"new" === getValues("conditionType") ? true : false}
                              className="small text-capitalize"
                            >
                              New
                            </option>
                            <option
                              value="refurbished"
                              selected={"refurbished" === getValues("conditionType") ? true : false}
                              className="small text-capitalize"
                            >
                              Refurbished
                            </option>
                          </select>
                          <div style={{ height: "5px" }}>
                            {errors.conditionType && (
                              <p className="validation_message" style={{ fontSize: "0.7rem" }}>
                                {errors.conditionType}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12 d-flex align-items-center justify-content-center">
                          <div className="pt-1 gap-2">
                            <CustomBtn name="Search" onClick={() => handleSubmit()} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-2" style={{ backgroundColor: "white" }}>
                    <div style={{ color: "black" }}>
                      <h6>Parameters</h6>
                    </div>
                    <div className="mt-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {parameter.map((modal, index) => (
                        <div key={index} className="modal-container">
                          <div className="d-flex gap-2 mb-2">
                            <div
                              onClick={() => toggleModal(modal?.modelName)}
                              style={{ cursor: "pointer" }}
                            >
                              {expandedModals.includes(modal?.modelName) ? "-" : "+"}
                            </div>

                            <div
                              onClick={() => toggleModal(modal?.modelName)}
                              style={{ cursor: "pointer" }}
                            >
                              {modal?.modelName}
                            </div>
                          </div>

                          {expandedModals.includes(modal?.modelName) && (
                            <ul className="parameter-list" style={{ listStyle: "none" }}>
                              {modal.parameterList.map((param, paramIndex) => (
                                <li key={paramIndex}>
                                  <input type="checkbox" className="me-3" />
                                  {param}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-12 col-lg-8 col-md-8">
              <div className="row">
                <div className="col-12 mb-1"  style={{ height: "40dvh" }}>
                  <div className="table_wrapper table_wrapper_assign">
                    <div className="table_main" style={{ minWidth: "1200px" }}>
                      <div className="table_section employee_table">
                        {/* <div className="table_container"> */}
                        <div className="table_header">
                          <div className="col_20p">
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="selectAllCheckbox"
                                onChange={(e) => handleSelectAllChange(e)}
                                checked={selectAllChecked}
                              />
                            </div>
                          </div>
                          <div className="col_20p">
                            <h5>Sr. No.</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Location</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Block Name</h5>
                          </div>{" "}
                          <div className="col_20p">
                            <h5>Rack Name</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Serial No.</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Model Name</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Category</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Quantity</h5>
                          </div>
                        </div>
                        {/* <div className="table_data_wrapper"> */}
                        {material.length > 0 ? (
                          <>
                            {" "}
                            {material.map((materialData, index) => (
                              <div className="table_data" key={index}>
                                <div className="col_20p">
                                  {" "}
                                  <div className="check_box">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={materialData._id}
                                      onChange={(e) => handleCheckboxChange(e, materialData)}
                                      checked={selectedList.some(
                                        (item) => item._id === materialData._id
                                      )}
                                    />
                                  </div>
                                </div>
                                <div className="col_20p">
                                  <h6>{index + 1}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.locationId.name}</h6>
                                </div>{" "}
                                <div className="col_20p">
                                  <h6>{materialData.blockId.blockNo}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>
                                    {materialData?.rackId.rackName
                                      ? materialData?.rackId.rackName
                                      : "-"}
                                  </h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.serialNo}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.modelId?.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.categoryId.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.reamainingQuantity}</h6>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className="no_data">Data Not Available</p>
                        )}

                        {/* </div> */}
                        {/* </div> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 mb-2 mt-4">
                  <div className="table_wrapper" style={{ height: "30dvh" }}>
                    <div className="table_main" style={{ minWidth: "1200px" }}>
                      <div className="table_section employee_table">
                        <div className="table_header">
                          <div className="col_8p">
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="selectAllCheckbox"
                                onChange={(e) => handleSelectAllChange(e)}
                                checked={selectAllChecked}
                              />
                            </div>
                          </div>
                          <div className="col_10p">
                            <h5>Sr. No.</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Category</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Brand</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Location</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Block Name</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Rack Name</h5>
                          </div>{" "}
                          <div className="col_20p">
                            <h5>Serial No.</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Model Name</h5>
                          </div>{" "}
                          <div className="col_20p">
                            <h5>Quantity</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Assign Quantity</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Action</h5>
                          </div>
                          {/* <div className="assign_column">
                            <h5>Assign Quantity</h5>
                          </div>{" "} */}
                        </div>
                        {/* <div className="table_data_wrapper"> */}
                        {selectedList.length > 0 ? (
                          <>
                            {" "}
                            {selectedList.map((materialData, index) => (
                              <div className="table_data" key={index}>
                                <div className="col_8p">
                                  <div className="check_box">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={materialData?._id}
                                      onChange={(e) => getStockIds(e, materialData)}
                                      // checked={selectedList.includes(materialData._id)}
                                      checked={stockIds.some((item) => item === materialData?._id)}
                                    />
                                  </div>
                                </div>
                                <div className="col_10p">
                                  <h6>
                                    {index + 1}
                                    {/* {Number(pageLimit) * (page - 1) + (index + 1)} */}
                                  </h6>
                                </div>

                                <div className="col_20p">
                                  <h6>{materialData?.categoryId.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.brandId.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.locationId.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData.blockId.blockNo}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>
                                    {materialData?.rackId.rackName
                                      ? materialData?.rackId.rackName
                                      : "-"}
                                  </h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.serialNo}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.modelId?.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.reamainingQuantity}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>
                                    <input
                                      className="inputBox"
                                      style={{ width: "100%" }}
                                      value={quantities[materialData?._id]}
                                      onChange={(e) => {
                                        handleQuantityChange(materialData, e.target.value);
                                      }}
                                      onFocus={(e) => e.target.select()}
                                      onBlur={(e) => {
                                        let newQuantity = e.target.value;
                                        if (!/^\d+$/.test(newQuantity)) {
                                          // Swal.fire({
                                          //   text: "Please enter a valid number",
                                          //   icon: "warning",
                                          // });
                                          return;
                                        }
                                        if (newQuantity > materialData.reamainingQuantity) {
                                          // Swal.fire({
                                          //   text: "Assign quantity cannot greater than quantity",
                                          //   icon: "warning",
                                          // });
                                        } else if (newQuantity < 1) {
                                          // Swal.fire({
                                          //   text: "It should be at least one or more",
                                          //   icon: "warning",
                                          // });
                                        }
                                        // newQuantity > materialData.reamainingQuantity || newQuantity < 1 ? 1 :
                                      }}
                                    />
                                  </h6>
                                </div>
                                <div className="col_20p">
                                  <button
                                    type="button"
                                    title="delete"
                                    style={{ border: "none" }}
                                    onClick={() => handleDeleteMaterial(materialData._id)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className="no_data">Data Not Available</p>
                        )}

                        {/* </div> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row d-flex m-0 ps-5" style={{ height: "10%" }}>
                  <div className="col-lg-5 col-md-4 justify-content-center d-flex align-items-center select_tech">
                    <h6 className="">Select Technician</h6>
                  </div>
                  <div className="col-lg-3 col-md-4 d-flex align-items-center pt-3">
                    <select
                      className="inputBox"
                      style={{
                        background: "#f5f5f5",
                        fontSize: "15px",
                        border: "0.5px solid grey",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor:"pointer",
                      }}
                      // {...register("userId", {
                      //   required: "Technician is required",
                      // })}
                      onChange={(e) => setUserId(e.target.value)}
                    >
                      {/* <option>Roshan</option>
                  <option>Roshan 2</option> */}
                      <option value="" className="">Select Technician</option>
                      {TechnicianList.map((ele, index) => {
                        return (
                          <option className="" style={{ fontSize: "14px" }} value={ele._id} key={index}>
                            {ele.name}
                          </option>
                        );
                      })}
                    </select>
                    {/* <div style={{ height: "5px" }}>
                  {errors.userId && (
                    <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                      {errors.userId.message}
                    </p>
                  )}
                </div> */}
                  </div>
                  {/* <div className="col-lg-4 col-md-4 d-flex align-items-center ">
                <button
                  onClick={
                    () => (stockIds.length >= 1 ? handleAssign() : "")
                    //   Swal.fire({ text: "Please Select Stock", icon: "warning" })
                  }
                  className="savebtn_assign mb-1 pt-3 pb-3"
                  type="submit"
                  style={{ height: "50%" }}
                >
                  <Image src={saveIcon} alt="saveIcon"></Image>
                  Assign material
                </button>
              </div> */}
                  <div className="form_button_wrapper gap-2 col-lg-4 col-md-4 d-flex align-items-center">
                    <CustomBtn
                      name="Assign material"
                  
                      onClick={() => handleAssign()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        // {/* </div> */}
      )}
    </>
  );
};

export default AssignMaterial;
