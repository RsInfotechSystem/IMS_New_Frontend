"use client";

import { communication } from "@/services/communication";
import { useEffect, useMemo, useReducer, useState } from "react";
import { getCategory, getCategoryWiseBrand, getCategoryWiseParameter } from "@/services/commonApis";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Loader from "@/common-components/Loader";
import { stockStatus } from "@/utilities/stock-status-array";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBtn from "@/common-components/CustomBtn";
import { toast } from "react-toastify";
import FilterStructure from "@/common-components/FilterForAssignMaterial";

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
  const [selectedParameters, setSelectedParameters] = useState({});
  const [_material, _setMaterial] = useState();
  const router = useRouter();
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    // categoryFilter: true,
    // brandFilter: true,
    // locationFilter: false,
    // modelNameFilter: false,
    statusFilter: false,
    conditionTypeFilter: false,
    _conditionType: "",
    _status: "",
    // category: [],
    // brand: [],
    // modelName: [],
    // location: [],
    conditionTypeList: [],
    conditionType: { keyType: "", keyId: "", keyCount: 0 },
    status: { keyType: "", keyId: "", keyCount: 0 },
    // brandValue: { keyType: "", keyId: "", keyCount: 0 },
    // modelNameValue: { keyType: "", keyId: "", keyCount: 0 },
    // locationValue: { keyType: "", keyId: "", keyCount: 0 },
    filterListori: [],
    filterListCondition: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    categoryId: "",
    brandId: "",
    modelId: "",
  });
  const [selectedModels, setSelectedModels] = useState([]);
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
        ...(state.status.keyType === "status" && { status: state.status.keyId }),
        ...(state.status.keyType === "conditionType" && { status: state.conditionType.keyId }),
      };
      // Fetch the data
      const serverResponse = await communication.getMaterialList(payload);

      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse.data.stock);
        setState({ filterListori: serverResponse.data.stock });
        setState({ filterListCondition: serverResponse.data.stock });
        toast.success(serverResponse.data.message);

        if (isFirstCall) {
          const stock = serverResponse.data.stock || [];

          setState({
            status: Array.from(
              new Set(
                stock.map((item) =>
                  JSON.stringify({
                    status: item.status || "unknown",
                  })
                )
              )
            ).map((item) => JSON.parse(item)),

            conditionTypeList: Array.from(
              new Set(
                stock.map((item) =>
                  JSON.stringify({ conditionType: item.conditionType || "unknown" })
                )
              )
            ).map((item) => JSON.parse(item)),
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
    let filteredList = state.filterListori;

    if (state._status) {
      filteredList = filteredList.filter((i) =>
        i.status.toLocaleLowerCase().includes(state._status.toLocaleLowerCase())
      );
    }

    if (state._conditionType) {
      filteredList = filteredList.filter((i) =>
        i.conditionType.toLocaleLowerCase().includes(state._conditionType.toLocaleLowerCase())
      );
    }

    setMaterial(filteredList);
  }, [state._status, state._conditionType]);

  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      setState({ statusFilter: true });
      let isSearch = true;
      getMaterialList({
        page: 1,
        isSearch,
      });
    }
  }, [state?.status?.keyId]);
  // console.log(state, "state");

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
      (!selectedFilters.categoryId || item.categoryId._id === selectedFilters.categoryId) &&
      (!selectedFilters.brandId || item.brandId._id === selectedFilters.brandId) &&
      (!selectedFilters.modelId || item.modelId._id === selectedFilters.modelId)
  );
  // const filteredMaterial = useMemo(() => {
  //   return material.filter(
  //     (item) =>
  //       (!selectedFilters.categoryId || item.categoryId._id === selectedFilters.categoryId) &&
  //       (!selectedFilters.brandId || item.brandId._id === selectedFilters.brandId) &&
  //       (!selectedFilters.modelId || item.modelId._id === selectedFilters.modelId) &&
  //       (!state.statusFilter || item.status === state.statusFilter)
  //   );
  // }, [material, selectedFilters, state.statusFilter]);
  // useEffect(() => {
  //   getMaterialList({ isFirstCall: true });
  // }, []);

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
  const handleParameterSelect = (modelName, param) => {
    setSelectedParameters((prev) => ({
      ...prev,
      [modelName]: {
        ...(prev[modelName] || {}),
        [param]: !(prev[modelName] && prev[modelName][param]),
      },
    }));
  };
  // console.log(_material, "_material");

  // useEffect(() => {
  //   // const id = getValues("categoryId");
  //   const id = formValues.categoryId;
  //   if (id) {
  //     getCategoryWiseBrand(id, setLoader, router, setBrandsData);
  //     fetchMaterial(id);
  //   }
  // }, [formValues.categoryId]);
  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        // <div className=" page_wrapper">
        <div className="kitchen_wrapper">
          {console.log(state, "statestate")}
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
                              {locationList.map((ele, index) => {
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
                            <div className="select_box_arrow">
                              <FontAwesomeIcon icon={faAngleDown} className="icon" />
                            </div>
                          </div>
                          <div style={{ height: "5px" }}>
                            {errors.locationId && (
                              <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                                {errors.locationId.message}
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
                              onChange={(e) => setUserId(e.target.value)}
                            >
                              <option value="" className="text-secondary text-lowercase"></option>
                              {TechnicianList.map((ele, index) => {
                                return (
                                  <option
                                    className="small text-capitalize"
                                    value={ele._id}
                                    key={index}
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
                            {errors.locationId && (
                              <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                                {errors.locationId.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="custom_input_wrapper col-lg-12 col-md-6">
                          <label>Serial No./Item Code</label>
                          <input
                            type="text"
                            name="searchString"
                            value={formValues.searchString}
                            onChange={handleChange}
                            className="form_control_assign custom_input"
                            style={{ width: "100%" }}
                          />
                          <div style={{ height: "25px" }}>
                            {errors.searchString && (
                              <p className="validation_message" style={{ fontSize: "0.7rem" }}>
                                {errors.searchString}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <div className="mt-4 p-2" style={{ backgroundColor: "white" }}>
                    <div style={{ color: "black" }}>
                      <h6>Parameters</h6>
                    </div>
                    <div className="mt-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {parameter?.length > 0 ? (
                        parameter?.map((modal, index) => (
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
                                    <input
                                      type="checkbox"
                                      className="me-3"
                                      id={`modelName:${modal?.modelName}value:${param}`}
                                      // onChange={(e) =>
                                      //   handleCheckboxSelect(e, modal.modelName, param)
                                      // }
                                      onChange={(e) =>
                                        handleParameterSelect(modal.modelName, param)
                                      }
                                      checked={
                                        selectedParameters[modal.modelName]?.[param] || false
                                      }
                                    />
                                    {param}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))
                      ) : (
                        <div>
                          <p>Data is not available</p>
                        </div>
                      )}
                    </div>
                  </div> */}
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
                {state?.statusFilter ? (
                  <div className="col-lg-6 col-md-6 input_wrapper">
                    <label>Select Status</label>
                    <div className="position-relative">
                      <select
                        name="status"
                        className="form-control custom_input"
                        style={{ width: "100%" }}
                        onChange={(e) => setState({ _status: e.target.value })}
                        // onChange={(e) => {
                        //   console.log(state.filterListori, "rrrr rahul");
                        //   console.log(
                        //     state.filterListori.filter((item) => item.status == e.target.value),
                        //     "rrrrr rahul"
                        //   );

                        //   setMaterial(
                        //     state.filterListori.filter(
                        //       (i) =>
                        //         i.status
                        //           .toLocaleLowerCase()
                        //           .search(e.target.value.toLocaleLowerCase()) !== -1
                        //     )
                        //   );
                        // }}
                      >
                        <option value="" className="text-secondary text-lowercase"></option>
                        {state?.status?.map((ele, index) => {
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
                    <div style={{ height: "5px" }}>
                      {errors.locationId && (
                        <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                          {errors.locationId.message}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="col-lg-6 col-md-6 input_wrapper">
                    <label>Select Status</label>
                    <div className="position-relative">
                      <select
                        name="status"
                        className="form-control custom_input"
                        style={{ width: "100%" }}
                        onChange={(e) =>
                          setState({
                            status: {
                              keyType: "status",
                              keyId: e.target.value,
                              keyCount: state.status.keyCount + 1,
                            },
                          })
                        }
                        value={state.status.keyId}
                      >
                        <option value="" className="text-secondary text-lowercase"></option>
                        {/* {state?.status.map((ele, index) => {
                        return (
                          <option className="small text-capitalize" value={ele} key={index}>
                            {" "}
                            {ele}
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
                )}

                <div className="col-lg-6 col-md-6 input_wrapper">
                  <label>Select Condition</label>
                  <div className="position-relative">
                    <select
                      name="conditiontype"
                      className="form-control custom_input"
                      style={{ width: "100%" }}
                      onChange={(e) => setState({ _conditionType: e.target.value })}
                      // onChange={(e) =>
                      //   setMaterial(
                      //     state.filterListori.filter(
                      //       (i) =>
                      //         i.conditionType
                      //           .toLocaleLowerCase()
                      //           .search(e.target.value.toLocaleLowerCase()) !== -1
                      //     )
                      //   )
                      // }
                    >
                      <option value="" className="text-secondary text-lowercase"></option>
                      {state.conditionTypeList.map((item, index) => (
                        <option
                          className="small text-capitalize"
                          value={item.conditionType}
                          key={index}
                        >
                          {item.conditionType}
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
                            <h5>Item Code</h5>
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
                          <div className="col_20p">
                            <h5>Quantity</h5>
                          </div>
                        </div>
                        {/* <div className="table_data_wrapper"> */}
                        {filteredMaterial.length > 0 ? (
                          <>
                            {filteredMaterial.length > 0 ? (
                              <>
                                {filteredMaterial.map((materialData, index) => (
                                  <div className="table_data" key={index}>
                                    {console.log(materialData, "materialData")}

                                    <div className="col_5p">
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
                                      <h6>{materialData?.itemCode}</h6>
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
                                      <h6>{materialData?.categoryId.name}</h6>
                                    </div>
                                    <div className="col_20p">
                                      <h6>{materialData?.brandId.name}</h6>
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
                <div className="row d-flex justify-content-center px-5" style={{ height: "10%" }}>
                  <div className="form_button_wrapper col-lg-4 col-md-4">
                    <CustomBtn name="Assign material" onClick={() => handleAssign()} />
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
