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

const ReturnMaterialUser = () => {
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
  const [selectedParameters, setSelectedParameters] = useState({});
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
  const [selectedModels, setSelectedModels] = useState([]);
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
    // console.log((materialData, "eleeeeeeeeeeeee"));
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

    // If changing searchString, clear other field errors
    if (name === "searchString" && value) {
      setErrors({});
    }
    // If changing other fields, clear searchString error
    else if (name !== "searchString") {
      setErrors({ ...errors, searchString: "" });
    }
  };

  // const validateForm = () => {
  //   const newErrors = {};

  //   // Validate form based on conditions
  //   if (
  //     !formValues.searchString &&
  //     (!formValues.categoryId ||
  //       !formValues.status ||
  //       !formValues.brandId ||
  //       !formValues.conditionType)
  //   ) {
  //     newErrors.searchString = "Serial No./Item Code is required";
  //     if (!formValues.categoryId) newErrors.categoryId = "Category is required";
  //     if (!formValues.status) newErrors.status = "Status is required";
  //     if (!formValues.brandId) newErrors.brandId = "Brand is required";
  //     if (!formValues.conditionType) newErrors.conditionType = "Condition is required";
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };
  const validateForm = () => {
    const newErrors = {};

    if (formValues.searchString) {
      // If searching by serial number, no other fields are required
      return true;
    } else {
      // If not searching by serial number, all other fields are required
      if (!formValues.categoryId) newErrors.categoryId = "Category is required";
      if (!formValues.brandId) newErrors.brandId = "Brand is required";
      // if (!formValues.status) newErrors.status = "Status is required";
      // if (!formValues.conditionType) newErrors.conditionType = "Condition is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = formValues.searchString
      ? { searchString: formValues.searchString }
      : {
          categoryId: formValues.categoryId,
          status: formValues.status,
          brandId: formValues.brandId,
          conditionType: formValues.conditionType,
          // parameters: Object.keys(selectedModels).map((modelName) => ({
          //   modelName,
          //   parameterList: selectedModels[modelName],
          // })),
          parametersToMatch: Object.entries(selectedParameters).flatMap(([modelName, params]) =>
            Object.entries(params)
              .filter(([_, isSelected]) => isSelected)
              .map(([param]) => ({ modelName, parameterList: [param] }))
          ),
          // parameter: selectedModels,
        };

    await submitForm(payload);
  };

  const submitForm = async (payload) => {
    setStockIds([]);
    try {
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
  useEffect(() => {
    if (categoryId && brandId) {
      submitForm();
    }
  }, [categoryId, brandId, selectedParameters]);

  const handleAssign = async () => {
    try {
      if (!userId) {
        toast.warn("Please Select Technician");
        return;
      }
      if (output.length <= 0) {
        toast.warn("Please Select At least one material");
        return;
      }
      setLoader(true);
      let payload = {
        materialDetails: output,
        userId: userId,
      };
      // console.log(payload, "payload");
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

  // const handleCheckboxSelect = (e, modalName, param) => {
  //   const { checked } = e.target;

  //   setSelectedModels((prevSelectedModels) => {
  //     const modalSelectedModels = prevSelectedModels[modalName] || [];

  //     if (checked) {
  //       return {
  //         ...prevSelectedModels,
  //         [modalName]: [...modalSelectedModels, param],
  //       };
  //     } else {
  //       return {
  //         ...prevSelectedModels,
  //         [modalName]: modalSelectedModels.filter((model) => model !== param),
  //       };
  //     }
  //   });
  // };

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="kitchen_wrapper">
          <div className="row">
            <div className="col-12 mb-1" style={{ height: "40dvh" }}>
              <div className="table_wrapper table_wrapper_assign">
                <div className="table_main p-0" style={{ minWidth: "1200px" }}>
                  <div className="table_section employee_table">
                    {/* <div className="table_container"> */}
                    <div className="table_header">
                      <div className="col_5p">
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
                            <div className="col_5p">
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
                            <div className="col_10p">
                              <h6>{index + 1}</h6>
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
                <div className="table_main p-0" style={{ minWidth: "1200px" }}>
                  <div className="table_section employee_table">
                    <div className="table_header">
                      <div className="col_5p">
                        <div className="check_box">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="_selectAllCheckbox"
                            // onChange={(e) => handleSelectAllChange(e)}
                            // checked={selectAllChecked}
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
                            <div className="col_5p">
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
            <div className="row d-flex px-5" style={{ height: "10%" }}>
              <div className="form_button_wrapper col-lg-4 col-md-4">
                <CustomBtn name="Return material" onClick={() => handleAssign()} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReturnMaterialUser;
