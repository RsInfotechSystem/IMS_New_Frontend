"use client";

import { communication } from "@/services/communication";
import { useEffect, useMemo, useReducer, useState } from "react";
import { getCategory, getCategoryWiseBrand, getCategoryWiseParameter } from "@/services/commonApis";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/common-components/Loader";
import { stockStatus } from "@/utilities/stock-status-array";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBtn from "@/common-components/CustomBtn";
import { toast } from "react-toastify";
import FilterStructure from "@/common-components/FilterForAssignMaterial";

const AssignMaterial = () => {
  const param = useSearchParams();
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
  const [_material, _setMaterial] = useState();
  const router = useRouter();
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    statusFilter: false,
    conditionTypeFilter: false,
    _conditionType: "",
    _status: "",
    conditionTypeList: [],
    statusArray: [],
    conditionType: { keyType: "", keyId: "", keyCount: 0 },
    status: { keyType: "", keyId: "", keyCount: 0 },
    filterListori: [],
    filterListCondition: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    categoryId: "",
    brandId: "",
    modelId: "",
  });
  const [expandedModals, setExpandedModals] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [formValues, setFormValues] = useState({
    searchString: "",
    categoryId: "",
    status: "",
    brandId: "",
    conditionType: "",
  });
  const [errors, setErrors] = useState({});
  const [assignedMaterial, setAssignedMaterial] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([])
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
  const searchString = watch("searchString");
  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  // get-location
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

  // get-material-list
  async function getMaterialList({ isFirstCall, id, brandId, categoryId } = {}) {
    try {
      setLoader(true);

      // Prepare the payload
      let payload = {
        searchString: "",
        location: id,
        ...(state?.status?.keyType === "status" && { status: state?.status?.keyId }),
        ...(state?.status?.keyType === "conditionType" && { status: state?.conditionType?.keyId }),
      };
      // Fetch the data
      const serverResponse = await communication.getMaterialList(payload);

      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data?.stock);
        setState({ filterListori: serverResponse?.data?.stock });
        setState({ filterListCondition: serverResponse?.data?.stock });
        // toast.success(serverResponse.data.message);

        if (isFirstCall) {
          const stock = serverResponse?.data?.stock || [];

          setState({
            statusArray: Array?.from(
              new Set(
                stock?.map((item) =>
                  JSON.stringify({
                    status: item?.status || "unknown",
                  })
                )
              )
            )?.map((item) => JSON.parse(item)),

            conditionTypeList: Array?.from(
              new Set(
                stock?.map((item) =>
                  JSON.stringify({ conditionType: item?.conditionType || "unknown" })
                )
              )
            )?.map((item) => JSON.parse(item)),
          });
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        toast.info(serverResponse.data.message || "An error occurred");
      }

      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }
  useEffect(() => {
    let filteredList = state?.filterListori;

    if (state?._status) {
      filteredList = filteredList.filter((i) =>
        i?.status?.toLocaleLowerCase()?.includes(state?._status?.toLocaleLowerCase())
      );
    }

    if (state?._conditionType) {
      filteredList = filteredList?.filter((i) =>
        i?.conditionType?.toLocaleLowerCase()?.includes(state?._conditionType?.toLocaleLowerCase())
      );
    }

    setMaterial(filteredList);
  }, [state?._status, state?._conditionType]);

  // useEffect(() => {
  //   const id = getValues("locationId");
  //   if (id) {
  //     setState({ statusFilter: true });
  //     let isSearch = true;
  //     getMaterialList({
  //       page: 1,
  //       isSearch,
  //     });
  //   }
  // }, [state?.status?.keyId]);

  const technicianList = async (id) => {
    try {
      setLoader(true);

      let response = await communication.getTechnicianList({ locationId: id });
      if (response?.data?.status === "SUCCESS") {
        // toast.success(response.data.message);
        setTechnicianList(response?.data.users);
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
    getLocations();
  }, []);
  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      technicianList(id);
    }
  }, [locationList.length >= 1 && location]);
  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      getMaterialList({ id, isFirstCall: true });
    }
  }, [locationList.length >= 1 && location]);
  const handleFiltersChange = (filters) => {
    setSelectedFilters(filters);
  };

  const filteredMaterial = material.filter(
    (item) =>
      (!selectedFilters?.categoryId || item.categoryId?._id === selectedFilters?.categoryId) &&
      (!selectedFilters?.brandId || item.brandId?._id === selectedFilters?.brandId) &&
      (!selectedFilters?.modelId || item.modelId?._id === selectedFilters?.modelId) &&
      (!selectedFilters?.parameter || item.parameter?._id === selectedFilters?.parameterId)
  );

  const handleDeleteMaterial = (id) => {
    setSelectedList(selectedList.filter((item) => item._id !== id));
    // setAssignedMaterial(assignedMaterial.filter((item) => item._id !== id));
  };

  // Handler for quantity change
  const handleQuantityChange = (materialData, newQuantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [materialData?._id]: newQuantity,
    }));

    setOutput((pre) =>
      pre?.map((ele) => {
        if (ele?.stockId === materialData?._id) {
          return {
            stockId: ele?.stockId,
            assignQuantity: newQuantity,
          };
        } else {
          return ele;
        }
      })
    );
  };

  // const toggleModal = (modelName) => {
  //   setExpandedModals((prevExpandedModals) => {
  //     if (prevExpandedModals.includes(modelName)) {
  //       return prevExpandedModals.filter((modal) => modal !== modelName);
  //     } else {
  //       return [...prevExpandedModals, modelName];
  //     }
  //   });
  // };
  //top table
  const handleCheckboxChange = (event, materialData) => {
    const isChecked = event?.target?.checked;

    if (isChecked) {
      // Add materialData to selectedList
      setSelectedList((prev) => [...prev, materialData]);
    } else {
      // Remove materialData from selectedList
      setSelectedList((prev) => prev?.filter((item) => item?._id !== materialData?._id));
      setStockIds((prev) => prev?.filter((item) => item !== materialData?._id));
      setOutput((pre) => pre?.filter((item) => item?.stockId !== materialData?._id));
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [materialData?._id]: 1,
      }));
    }
  };

  const handleSelectAllChange = (event) => {
    const isChecked = event?.target?.checked;

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

  //bottom table

  const handleSelectAllChangeGetStock = (event) => {
    const isChecked = event?.target?.checked;

    if (isChecked) {
      setSelectAllCheckedStock([...selectedList]);
      const allStockIds = selectedList?.map((item) => item?._id);

      const allOutput = selectedList.map((item) => ({
        stockId: item?._id,
        assignQuantity: quantities[item?._id],
      }));

      setStockIds(allStockIds);
      setOutput(allOutput);
    } else {
      setSelectAllCheckedStock(false);
      setStockIds([]);
      setOutput([]);
    }
  };
  const getStockIds = (event, materialData) => {
    const isChecked = event?.target?.checked;
    setSelectAllCheckedStock(
      !stockIds?.includes(isChecked) && stockIds?.length + 1 === material?.length
    );
    if (isChecked) {
      // Add materialData to selectedList
      setStockIds((prev) => [...prev, materialData?._id]);
      setOutput((pre) => [
        ...pre,
        { stockId: materialData?._id, assignQuantity: quantities[materialData?._id] },
      ]);
    } else {
      // Remove materialData from selectedList
      setStockIds((prev) => prev?.filter((item) => item !== materialData?._id));
      setOutput((pre) => pre?.filter((item) => item?.stockId !== materialData?._id));
      setSelectAllCheckedStock(false);
    }
  };

  ///new
  const handleCheckboxChangeStock = (e) => {
    const checkboxId = e?.target?.id;
    setSelectAllChecked(
      !selectedCheckboxes?.includes(checkboxId) && selectedCheckboxes?.length + 1 === user?.length
    );
    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected?.includes(checkboxId)) {
        // If the checkbox is already in the array, remove it
        return prevSelected?.filter((id) => id !== checkboxId);
      } else {
        // If the checkbox is not in the array, add it
        return [...prevSelected, checkboxId];
      }
    });
  };
  const handleSelectAllChangeStock = (e) => {
    setSelectAllChecked(e?.target?.checked);

    // Update the array of selected checkboxes based on the "Select All" checkbox
    setSelectedCheckboxes((prevSelected) =>
      e?.target?.checked ? user?.map((brandDetails) => brandDetails?._id) : []
    );
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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   if (value || value) {
  //     setFormValues({ ...formValues, [name]: value });
  //     setErrors({ ...errors, [name]: "" }); // Clear error message on input change
  //   } else {
  //     setParameter([]);
  //   }
  // };
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

    if (formValues?.searchString) {
      // If searching by serial number, no other fields are required
      return true;
    } else {
      // If not searching by serial number, all other fields are required
      if (!formValues?.categoryId) newErrors.categoryId = "Category is required";
      if (!formValues?.brandId) newErrors.brandId = "Brand is required";
      // if (!formValues.status) newErrors.status = "Status is required";
      // if (!formValues.conditionType) newErrors.conditionType = "Condition is required";
    }

    setErrors(newErrors);
    return Object?.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (value) => {
    // e.preventDefault();
    if (!validateForm()) return;
    const payload = formValues?.searchString
      ? { searchString: formValues?.searchString }
      : {
        categoryId: formValues?.categoryId,
        status: formValues?.status,
        brandId: formValues?.brandId,
        conditionType: formValues?.conditionType,

        parametersToMatch: Object?.entries(selectedParameters)?.flatMap(([modelName, params]) =>
          Object?.entries(params)
            .filter(([_, isSelected]) => isSelected)
            ?.map(([param]) => ({ modelName, parameterList: [param] }))
        ),
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
        // toast.success(response.data.message);
        reset();
        setMaterial(response?.data?.stock);
        setParameter(response?.data?.parameterId);
        // setQuantities(
        //   response?.data.stock.reduce((acc, material) => {
        //     acc[material._id] = 1;

        //     return acc;
        //   }, {})
        // );
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          ...response?.data?.stock?.reduce((acc, material) => {
            acc[material?._id] = 1;
            return acc;
          }, {}),
        }));
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data?.message);
        router.push("/");
      } else {
        toast.warn(response?.data?.message);
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.message);
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
      if (output?.length <= 0) {
        toast.warn("Please Select At least one material");
        return;
      }
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
        // router.back();
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response?.data?.message);
        router.push("/");
      } else {
        toast.warn(response?.data?.message);
      }
    } catch (error) {
      toast.error(response?.data?.message);
    } finally {
      setLoader(false);
    }
  };

  const handleUpdateAssign = async () => {
    try {
      if (!userId) {
        toast.warn("Please Select Technician");
        return;
      }
      if (output?.length <= 0) {
        toast.warn("Please Select At least one material");
        return;
      }
      setLoader(true);
      let payload = {
        materialDetails: output,
        userId: userId,
        jobNo: param?.get("JobNo"),
      };
      let response = await communication.UpdateAssignMaterial(payload);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message);
        setSelectedList([]);
        setMaterial([]);
        setParameter([]);
        setOutput([]);
        setStockIds([]);
        // reset()
        setUserId("");
        setValue("locationId", "");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response?.data?.message);
        router.push("/");
      } else {
        toast.warn(response?.data?.message);
      }
    } catch (error) {
      toast.error(response?.data?.message);
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
    const id = formValues?.categoryId;
    if (id) {
      getCategoryWiseBrand(id, setLoader, router, setBrandsData);
    }
  }, [formValues?.categoryId]);
  // const fetchMaterial = async (id) => {
  //   try {
  //     let payload = {
  //       categoryId: id,
  //     };
  //     if (id) {
  //       let response = await communication.getCategoryWiseParameter(payload);
  //       if (response?.data?.status === "SUCCESS") {
  //         setParameter(response?.data?.parameter);
  //       }
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  // const handleParameterSelect = (modelName, param) => {
  //   setSelectedParameters((prev) => ({
  //     ...prev,
  //     [modelName]: {
  //       ...(prev[modelName] || {}),
  //       [param]: !(prev[modelName] && prev[modelName][param]),
  //     },
  //   }));
  // };

  async function getAssignMaterialByJobNo() {
    try {
      setLoader(true);
      let payload = {
        // location: "66b0ad1b9d8190631daebeec",
        jobNo: param?.get("JobNo"),
      };
      const responseFromServer = await communication.getMaterialAssignByJob(payload); // bypass
      if (responseFromServer?.data?.status === "SUCCESS") {
        // const combinedMaterials = [...assignedMaterial, ...selectedList];
        // const combinedData = isView ? [...selectedList, ...assignedMaterial] : selectedList;
        // if (router.query.isView === "true") {
        setSelectedList(responseFromServer?.data?.material);
        setValue("locationId", responseFromServer?.data?.locationId);
        setUserId(responseFromServer?.data?.assignedTo);
        // }
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.info(responseFromServer?.data?.message);
        router.push("/login");
      } else {
        toast.info(responseFromServer?.data?.message);
        setAssignedMaterial([]);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  }
  useEffect(() => {
    if (param?.get("type") === "edit") {
      setIsEdit(true);
      getAssignMaterialByJobNo();
    } else {
      setIsEdit(false);
    }
  }, []);


  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <div className="kitchen_wrapper">
          <div className="row">
            <div className="col-12 col-lg-4 col-md-4">
              <div className="form_view pt-0">
                <form onSubmit={handleSubmit}>
                  <div style={{ maxHeight: "40dvh", overflowY: "auto" }}>
                    <div className="p-3" style={{ backgroundColor: "white" }}>
                      <div className="row">
                        <div className="col-lg-6 col-md-6 input_wrapper">
                          <label>Select Location*</label>
                          <div className="position-relative">
                            <select
                              name="locationId"
                              className="form-control custom_input"
                              style={{ width: "100%" }}
                              {...register("locationId", {
                                required: "locationId is required",
                              })}
                            // disabled={modalStates.isView}
                            >
                              <option value="" className="text-secondary text-lowercase"></option>
                              {locationList?.map((ele, index) => {
                                return (
                                  <option
                                    className="small text-capitalize"
                                    value={ele?._id}
                                    key={index}
                                  >
                                    {" "}
                                    {ele?.name}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="select_box_arrow">
                              <FontAwesomeIcon icon={faAngleDown} className="icon" />
                            </div>
                          </div>
                          <div style={{ height: "5px" }}>
                            {errors?.locationId && (
                              <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                                {errors?.locationId?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 input_wrapper">
                          <label>Select Technician*</label>
                          <div className="position-relative">
                            <select
                              name="locationId"
                              className="form-control custom_input"
                              style={{ width: "100%" }}
                              onChange={(e) => setUserId(e?.target?.value)}
                            >
                              <option value="" className="text-secondary text-lowercase"></option>
                              {TechnicianList?.map((ele, index) => {
                                return (
                                  <option
                                    className="small text-capitalize"
                                    value={ele?._id}
                                    key={index}
                                    selected={ele?._id === userId ? true : false}
                                  >
                                    {ele?.name}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="select_box_arrow">
                              <FontAwesomeIcon icon={faAngleDown} className="icon" />
                            </div>
                          </div>
                          <div style={{ height: "5px" }}>
                            {errors?.locationId && (
                              <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                                {errors?.locationId?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="custom_input_wrapper col-lg-12 col-md-6">
                          <label>Serial No.</label>
                          <input
                            type="text"
                            name="searchString"
                            value={formValues.searchString}
                            onChange={handleChange}
                            className="form_control_assign custom_input"
                            style={{ width: "100%" }}
                          />
                          <div style={{ height: "25px" }}>
                            {errors?.searchString && (
                              <p className="validation_message" style={{ fontSize: "0.7rem" }}>
                                {errors?.searchString}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-center">
                        <div className="form_button_wrapper col-lg-2 col-md-4">
                          <CustomBtn
                            name="Search"
                            onClick={handleChange}

                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  <div>
                    <FilterStructure
                      data={material}
                      selectedFilters={selectedFilters}
                      onFiltersChange={handleFiltersChange}
                    />
                  </div>

                </form>
              </div>
            </div>
            <div className="col-12 col-lg-8 col-md-8">
              <div className="row">
                <div className="col-lg-6 col-md-6 input_wrapper">
                  <label>Select Status</label>
                  <div className="position-relative">
                    <select
                      name="status"
                      className="form-control custom_input"
                      style={{ width: "100%" }}
                      onChange={(e) => setState({ _status: e?.target?.value })}
                    >
                      <option value="" className="text-secondary text-lowercase"></option>
                      {state?.statusArray?.map((ele, index) => {
                        return (
                          <option
                            className="small text-capitalize"
                            value={ele?.status}
                            key={index}
                          >
                            {ele?.status}
                          </option>
                        );
                      })}
                    </select>
                    <div className="select_box_arrow">
                      <FontAwesomeIcon icon={faAngleDown} className="icon" />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 input_wrapper">
                  <label>Select Condition</label>
                  <div className="position-relative">
                    <select
                      name="conditiontype"
                      className="form-control custom_input"
                      style={{ width: "100%" }}
                      onChange={(e) => setState({ _conditionType: e.target.value })}
                    >
                      <option value="" className="text-secondary text-lowercase"></option>
                      {state?.conditionTypeList?.map((item, index) => (
                        <option
                          className="small text-capitalize"
                          value={item?.conditionType}
                          key={index}
                        >
                          {item?.conditionType}
                        </option>
                      ))}
                      {/* <option value="" className="text-secondary text-lowercase"></option>
                      {TechnicianList.map((ele, index) => {
                        return (
                          <option className="small text-capitalize" value={ele._id} key={index}>
                            {ele.name}
                          </option>
                        );
                      })} */}
                    </select>
                    <div className="select_box_arrow">
                      <FontAwesomeIcon icon={faAngleDown} className="icon" />
                    </div>
                  </div>
                  {/* <div style={{ height: "5px" }}>
                      {errors.locationId && (
                        <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                          {errors.locationId.message}
                        </p>
                      )}
                    </div> */}
                </div>
              </div>
              <div className="row">
                <div className="col-12 mb-1" style={{ height: "40dvh" }}>
                  <div className="table_wrapper table_wrapper_assign">
                    <div className="table_main p-0" style={{ minWidth: "1200px" }}>
                      <div className="table_section employee_table">
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
                            <h5>Box NO</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Status</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Condition Type</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Model Name</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Category</h5>
                          </div>
                          <div className="col_20p">
                            <h5>Brand</h5>
                          </div>
                          <div className="col_45p">
                            <h5>Parameter</h5>
                          </div>
                          <div className="col_20p">
                            <h5>QTY</h5>
                          </div>
                        </div>
                        {/* <div className="table_data_wrapper"> */}
                        {filteredMaterial?.length > 0 ? (
                          <>
                            {filteredMaterial?.length > 0 ? (
                              <>
                                {filteredMaterial?.map((materialData, index) => (
                                  <div className="table_data" key={index}>

                                    <div className="col_5p">
                                      <div className="check_box">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={materialData?._id}
                                          onChange={(e) => handleCheckboxChange(e, materialData)}
                                          checked={selectedList.some(
                                            (item) => item?._id === materialData?._id
                                          )}
                                        />
                                      </div>
                                    </div>
                                    <div className="col_10p">
                                      <h6>{index + 1}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.locationId?.name}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.blockId?.blockNo}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>
                                        {materialData?.rackId?.rackName
                                          ? materialData?.rackId?.rackName
                                          : "-"}
                                      </h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>
                                        {materialData?.serialNo ? materialData?.serialNo : "-"}
                                      </h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>
                                        {materialData?.itemCode ? materialData?.itemCode : "-"}
                                      </h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.status}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.conditionType}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.modelId?.name}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.categoryId?.name}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.brandId?.name}</h6>
                                    </div>
                                    <div className="col_45p">
                                      <div className="input_scroll">
                                        {materialData?.parameter &&
                                          Object?.entries(materialData?.parameter)?.map(
                                            ([key, value], index, array) => (
                                              <h6 key={key}>
                                                {key}
                                                {index < array?.length - 1 && ", "}
                                              </h6>
                                            )
                                          )}
                                      </div>
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
                          </>
                        ) : (
                          <>
                            {" "}
                            {material?.length > 0 ? (
                              <>
                                {" "}
                                {material?.map((materialData, index) => (
                                  <div className="table_data" key={index}>
                                    <div className="col_5p">
                                      {" "}
                                      <div className="check_box">
                                        <input
                                          className="form-check-input"
                                          type="checkbox"
                                          id={materialData?._id}
                                          onChange={(e) => handleCheckboxChange(e, materialData)}
                                          checked={selectedList.some(
                                            (item) => item?._id === materialData?._id
                                          )}
                                        />
                                      </div>
                                    </div>
                                    <div className="col_10p">
                                      <h6>{index + 1}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.locationId?.name}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.blockId?.blockNo}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>
                                        {materialData?.rackId?.rackName
                                          ? materialData?.rackId?.rackName
                                          : "-"}
                                      </h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>
                                        {materialData?.serialNo ? materialData?.serialNo : "--"}
                                      </h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.modelId?.name}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.categoryId?.name}</h6>
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
                          </>
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
                                onChange={(e) => handleSelectAllChangeGetStock(e)}
                                checked={selectAllCheckedStock}
                              // onChange={(e) => handleSelectAllChangeStock(e)}
                              // checked={selectAllCheckedStock}
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
                            <h5>QTY</h5>
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
                        {selectedList?.length > 0 ? (
                          <>
                            {selectedList?.map((materialData, index) => (
                              <div className="table_data" key={index}>
                                <div className="col_5p">
                                  <div className="check_box">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={materialData?._id}
                                      onChange={(e) => getStockIds(e, materialData)}
                                      checked={stockIds?.some((item) => item === materialData?._id)}
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
                                  <h6>{materialData?.categoryId?.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.brandId?.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.locationId?.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData.blockId?.blockNo}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>
                                    {materialData?.rackId?.rackName
                                      ? materialData?.rackId?.rackName
                                      : "-"}
                                  </h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.serialNo ? materialData?.serialNo : "--"}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{materialData?.modelId?.name}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>
                                    {param.get("type") == "edit"
                                      ? materialData?.quantity
                                      : materialData?.reamainingQuantity}
                                  </h6>
                                </div>
                                <div className="col_20p">
                                  <h6>
                                    <input
                                      className="inputBox"
                                      style={{ width: "100%" }}
                                      value={quantities[materialData?._id]}
                                      onChange={(e) => {
                                        handleQuantityChange(materialData, e?.target?.value);
                                      }}
                                      onFocus={(e) => e?.target?.select()}
                                      onBlur={(e) => {
                                        let newQuantity = e?.target?.value;
                                        if (!/^\d+$/.test(newQuantity)) {
                                          // Swal.fire({
                                          //   text: "Please enter a valid number",
                                          //   icon: "warning",
                                          // });
                                          return;
                                        }
                                        if (newQuantity > materialData?.reamainingQuantity) {
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
                                    onClick={() => handleDeleteMaterial(materialData?._id)}
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
                <div className="row d-flex justify-content-center px-5" style={{ height: "10%" }}>
                  <div className="form_button_wrapper col-lg-2 col-md-4">
                    <CustomBtn
                      name="Assign material"
                      onClick={
                        param.get("type") === "edit"
                          ? () => handleUpdateAssign()
                          : () => handleAssign()
                      }
                    />
                  </div>
                  {param.get("type") === "edit" && (
                    <div className="form_button_wrapper col-lg-2 col-md-4">
                      <CustomBtn name="Back" onClick={() => router.back()} />
                    </div>
                  )}
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
