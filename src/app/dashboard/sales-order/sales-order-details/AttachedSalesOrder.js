"use client";
import Button from "@/common-components/Button";
import CustomBtn from "@/common-components/CustomBtn";
import Loader from "@/common-components/Loader";
import { getCategory, getCategoryWiseBrand } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { faAngleDown, faCaretLeft, faCaretRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCookie } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ViewSalesOrder from "../create-sales-order/ViewSalesOrderPdf";
const AttachedSalesOrder = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const searchParams = useSearchParams();
  const [_description, _setDiscription] = useState([]);
  const [material, setMaterial] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [payloadIds, setPayloadIds] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [stock, setStock] = useState([]);
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [location, setLocation] = useState();
  const [modalState, setModalStates] = useState({
    viewPdf: false,
    data: "",
    viewPrintBill: false,
  });
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const _location = watch("locationId");
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    materials: [],
  });
  const [checkBox, setCheckBox] = useState("");
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectedList, setSelectedList] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [parameter, setParameter] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [model, setModel] = useState([]);
  const [expandedModals, setExpandedModals] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [attachedMaterials, setAttachedMaterials] = useState([]);
  const [materialsPayload, setMaterialPayload] = useState([]);
  const [materialDetails, setMaterialDetails] = useState([]);
  const [materialIDS, setMaterialIDS] = useState(null);
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  const modelId = watch("modelId");
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
  useEffect(() => {
    const id = getValues("brandId");
    if (id) {
      getBrandWiseModel(id);
    }
  }, [brandId]);
  const handleCategory = async () => {
    if (getValues("categoryId")) {
      setBrandsData(
        await getCategoryWiseBrand(getValues("categoryId"), setLoader, router, setBrandsData)
      );
    } else {
      setBrandsData([]);
    }
  };

  useMemo(() => {
    handleCategory();
  }, [categoryId]);



  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);

    // Update the array of selected checkboxes based on the "Select All" checkbox
    setSelectedCheckboxes((prevSelected) =>
      e.target.checked ? modelList?.materialDetails.map((material) => material._id) : []
    );
  };

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    console.log(e.target.id);
    setCheckBox(checkboxId);

    setSelectAllChecked(
      !selectedCheckboxes.includes(checkboxId) && selectedCheckboxes.length + 1 === stock?.length
    );
    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(checkboxId)) {
        // If the checkbox is already in the array, remove it
        return prevSelected.filter((id) => id !== checkboxId);
      } else {
        // If the checkbox is not in the array, add it
        return [...prevSelected, checkboxId];
      }
    });
  };
  // console.log("checkboxId", selectedCheckboxes);
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
  }, [categoryId]);
  const toggleModal = (modelName) => {
    setExpandedModals((prevExpandedModals) => {
      if (prevExpandedModals.includes(modelName)) {
        return prevExpandedModals.filter((modal) => modal !== modelName);
      } else {
        return [...prevExpandedModals, modelName];
      }
    });
  };
  // ________________________API FOR USER__________________________________
  async function getSalesOrderById() {
    try {
      setLoader(true);
      let payload = {
        orderId: searchParams.get("orderId"),
      };
      const serverResponse = await communication.getSalesOrderById(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setModelList(serverResponse?.data?.salesorder);
        _setDiscription(
          serverResponse?.data?.salesorder?.materialDetails?.map(
            (item) => item?.materialDescription
          )
        );
        setLocation(serverResponse?.data?.salesorder?.orderLocation?._id);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        setModelList([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      // Swal.fire({
      //   text: error?.response?.data?.message || error.message,
      //   icon: "warning",
      // });
      setLoader(false);
    }
  }
  async function getLocationWiseMaterial({ isFirstCall } = {}) {
    try {
      setLoader(true);
      let payload = {
        locationId: location,
        categoryId: categoryId,
        brandId: brandId,
        modelId: modelId,
        parameters: Object.keys(selectedModels).map((modelName) => ({
          modelName,
          parameterList: selectedModels[modelName],
        })),
      };
      const serverResponse = await communication.getLocationWiseMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.stock);
        // setPageCount(serverResponse?.data?.totalPages);
        setState({ materialLists: serverResponse?.data.material });
        // if (isFirstCall) {
        //   setState({
        //     category: Array.from(
        //       new Set(
        //         serverResponse?.data.material.map((item) =>
        //           JSON.stringify({ categoryId: item.categoryId, category: item.category })
        //         )
        //       )
        //     ).map((item) => JSON.parse(item)),
        //     brand: Array.from(
        //       new Set(
        //         serverResponse?.data.material.map((item) =>
        //           JSON.stringify({ brandId: item.brandId, brand: item.brand })
        //         )
        //       )
        //     ).map((item) => JSON.parse(item)),
        //     modelName: Array.from(
        //       new Set(
        //         serverResponse?.data.material.map((item) =>
        //           JSON.stringify({ modelId: item?.modelId?._id, modelName: item?.modelId?.name })
        //         )
        //       )
        //     ).map((item) => JSON.parse(item)),
        //     location: Array.from(
        //       new Set(
        //         serverResponse?.data.material.map((item) =>
        //           JSON.stringify({ locationId: item.locationId, location: item.location })
        //         )
        //       )
        //     ).map((item) => JSON.parse(item)),
        //   });
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        toast.info(serverResponse.data.message);
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  }

  async function sendReadyMaterial(values) {
    try {
      if (attachedMaterials.length === 0) {
        toast.info("Please attach materials.");
        return;
      }
      // if (payloadIds.length !== modelList?.materialDetails?.length) {
      //   toast.info("Please attached all material.");
      //   return;
      // }
      setLoader(true);
      setMaterialPayload(attachedMaterials.map((_id) => _id._id));
      let payload = {
        orderId: searchParams.get("orderId"),
        materialDetails: materialDetails,
      };
      console.log("payload", payload);
      // console.log("payload", payload);
      const serverResponse = await communication.sendReadyMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse?.data?.message);
        setLoader(false);
        setModelList([]);
        router.push("/admin/dashboard/sales-order");
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        toast.info(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  }
  const handleChange = (modelData, value) => {
    // console.log("valueRRRRR", modelData, value);
    setPayloadIds([...payloadIds, { detailId: modelData._id, materialId: value }]);
  };
  useEffect(() => {
    setRoleName(getCookie("role"));
  }, []);
  useEffect(() => {
    getSalesOrderById();
    // getMaterialById();
  }, []);
  useEffect(() => {
    if (location) getLocationWiseMaterial({ isFirstCall: true });
  }, [_location]);
  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));
  }
  const handleCheckboxSelect = (e, modalName, param) => {
    const { checked } = e.target;

    setSelectedModels((prevSelectedModels) => {
      const modalSelectedModels = prevSelectedModels[modalName] || [];

      if (checked) {
        return {
          ...prevSelectedModels,
          [modalName]: [...modalSelectedModels, param],
        };
      } else {
        return {
          ...prevSelectedModels,
          [modalName]: modalSelectedModels.filter((model) => model !== param),
        };
      }
    });
  };
  const handleMaterialSelect = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId) ? prev.filter((id) => id !== materialId) : [...prev, materialId]
    );
  };

  const handleAttachMaterials = () => {
    const newAttachedMaterials = material.filter((m) => selectedMaterials.includes(m._id));
    setAttachedMaterials((prev) => [...prev, ...newAttachedMaterials]);
    setSelectedMaterials([]);
    setMaterialIDS(
      material.filter((m) => selectedMaterials.includes(m._id)).map((item) => item._id)
    );
    setTimeout(() => {
      setCheckBox("");
      setMaterialIDS(null);
    }, 600);
  };
  // console.log("sssss", attachedMaterials);
  const handleRemoveAttachedMaterial = (materialId) => {
    setAttachedMaterials((prev) => prev.filter((m) => m._id !== materialId));
    // let materialArray = materialDetails.map((data) =>
    //   data.materialIds.filter((material) => materialId !== material)
    // );
    // setMaterialDetails(materialDetails.map((data) => !data.materialIds.includes(materialId)));
    // console.log(materialArray, "materialArray");
  };

  useEffect(() => {
    initialAPICall();
  }, []);
  useEffect(() => {
    if (materialIDS) {
      setMaterialDetails((prev) => [...prev, { detailId: checkBox, materialIds: materialIDS }]);
    }
  }, [materialIDS]);
  useEffect(() => {
    if (location && categoryId && selectedModels) getLocationWiseMaterial({ isFirstCall: true });
  }, [location, categoryId, selectedModels]);
  return (
    <>
      {loader && <Loader text={"Loading..."} />}
      {modalState.viewPdf && (
        <ViewSalesOrder pdfData={modalState?.data} setModalStates={setModalStates} />
      )}

      {/* ------------------------------- top header ----------------------------------------------- */}
      <div className="top_header">
        <div className="tab_title">Attach Ready Material for Sales Order</div>
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
      {/* ------------------------------- top header end ----------------------------------------------- */}
      {/* ---------------------------sales order list of discription----------------------------------------------------------*/}
      <div className="form_list_layout_wrapper my-4">
        <div className="d-flex align-items-center justify-content-between">
          <p>Sales Order List</p>
        </div>
        {/* table  */}
        <div className="table_wrapper my-3">
          <div className="table_main">
            <div className="table_section pi_product_table">
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

                {/* <div className="col_20p">
                  <h5 className="action_wrraper">Remove</h5>
                </div> */}
              </div>
              {modelList?.materialDetails?.length > 0 ? (
                modelList?.materialDetails?.map((product, index) => {
                  return (
                    <div className="table_data" key={index}>
                      <div className="col_20p">
                        {" "}
                        <div className="check_box">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={product._id}
                            onChange={(e) => handleCheckboxChange(e)}
                            checked={selectedCheckboxes.includes(product._id)}
                            // checked={selectedList.some((item) => item._id === product._id)}
                          />
                        </div>
                      </div>
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
                      {/* <div className="col_20p">
                        <h6 className="action_wrraper ">
                          <FontAwesomeIcon
                            icon={faTrash}
                            // onClick={() => deleteProduct(index)}
                            className="trash"
                          />
                        </h6>
                      </div> */}
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
      {/* ---------------------------sales order list of discription end----------------------------------------------------------*/}
      <form>
        <div>
          {/* ---------------------------filter for material----------------------------------------------------------*/}
          <div className="form_list_layout_wrapper">
            <div className="d-flex align-items-center justify-content-between py-2">
              <div className="form_layout">
                <div className="row d-flex align-items-end">
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <label>category Name *</label>
                    <div className="position-relative">
                      <select
                        // disabled={modalStates.isView}
                        // name="categoryId"
                        className="form-control custom_input"
                        style={{ width: "100%" }}
                        {...register("categoryId", {
                          required: "Category is required",
                        })}
                      >
                        <option value="" className="text-secondary text-lowercase"></option>
                        {CategoryMapData?.map((ele, index) => {
                          return (
                            <option value={ele._id} key={index}>
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
                    <label>Brand *</label>
                    <div className="position-relative">
                      <select
                        name="brandId"
                        // disabled={modalStates.isView}
                        className="form-control custom_input"
                        style={{ width: "100%" }}
                        {...register("brandId", {
                          // required: "Brand is required",
                        })}
                      >
                        <option value="" className="text-secondary text-lowercase"></option>
                        {brandsData?.map((ele, index) => {
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
                      {errors.brandId && (
                        <p className="text-danger text-start" style={{ fontSize: "0.7rem" }}>
                          {errors.brandId.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <label>Model Name *</label>
                    <div className="position-relative">
                      <select
                        // disabled={modalStates.isView}/
                        {...register("modelId", {
                          // required: "modelId is required",
                        })}
                        className="form-control custom_input"
                        style={{ width: "100%" }}
                      >
                        <option value=""></option>
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
                  <div className="col-lg-3 col-md-6 mb-4">
                    <button
                      type="button"
                      className="btn"
                      style={{ backgroundColor: "#184965", color: "#FFF" }}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12" style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                                <input
                                  type="checkbox"
                                  className="me-3"
                                  id={`modelName:${modal?.modelName}value:${param}`}
                                  onChange={(e) => handleCheckboxSelect(e, modal.modelName, param)}
                                />
                                {param}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* ---------------------------list of material----------------------------------------------------------*/}
                <div className="form_list_layout_wrapper my-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <p>Sales Order Item Preview</p>
                  </div>
                  {/* table */}
                  <div className="table_wrapper my-3">
                    <div className="table_main">
                      <div className="table_section pi_product_table">
                        <div className="table_header">
                          <div className="col_20p">
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                // id="selectAllCheckbox"
                                // onChange={(e) => handleSelectAllChange(e)}
                                // checked={selectAllChecked}
                              />
                            </div>
                          </div>
                          <div className="col_25p">
                            <h5>Sr. No.</h5>
                          </div>
                          <div className="col_25p">
                            <h5>Category</h5>
                          </div>
                          <div className="col_25p">
                            <h5>Brand</h5>
                          </div>
                          <div className="col_25p">
                            <h5>Model</h5>
                          </div>
                          <div className="col_25p">
                            <h5 className="action_wrraper">Serial No</h5>
                          </div>
                          <div className="col_20p">
                            <h5 className="action_wrraper">Item Code</h5>
                          </div>
                        </div>
                        {material?.length > 0 ? (
                          material?.map((product, index) => {
                            return (
                              <div className="table_data" key={index}>
                                <div className="col_20p">
                                  {" "}
                                  <div className="check_box">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={selectedMaterials.includes(product._id)}
                                      onChange={() => handleMaterialSelect(product._id)}
                                      // id={product._id}
                                      // onChange={(e) => handleCheckboxChange(e)}
                                      // checked={selectedCheckboxes.includes(product._id)}
                                      // checked={selectedList.some((item) => item._id === product._id)}
                                    />
                                  </div>
                                </div>
                                <div className="col_25p">
                                  <h6>{index + 1}</h6>
                                </div>

                                <div className="col_25p">
                                  <h6>{product?.category}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.brand}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.modelId}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6 className="action_wrraper">{product?.serialNo}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6 className="action_wrraper ">{product?.itemCode}</h6>
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
                <Button
                  onClick={handleAttachMaterials}
                  disabled={selectedMaterials.length === 0}
                  name={" Attach Selected Materials"}
                ></Button>
                {/* <div className="col-lg-3 col-md-6">
                  <button
                    type="button"
                    className="btn btn-success"
                  >
                    Add
                  </button>
                </div> */}
              </div>
            </div>
          </div>
          {/* ---------------------------filter for material end----------------------------------------------------------*/}
          {/* ---------------------------attached material----------------------------------------------------------*/}

          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Sales Order Item Preview</p>
            </div>
            {/* table */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                <div className="table_section pi_product_table">
                  <div className="table_header">
                    <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          // id="selectAllCheckbox"
                          // onChange={(e) => handleSelectAllChange(e)}
                          // checked={selectAllChecked}
                        />
                      </div>
                    </div>
                    <div className="col_25p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Category</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Brand</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Model</h5>
                    </div>
                    <div className="col_25p">
                      <h5 className="action_wrraper">Serial No</h5>
                    </div>
                    <div className="col_20p">
                      <h5 className="action_wrraper">Item Code</h5>
                    </div>
                    <div className="col_20p">
                      <h5 className="action_wrraper">Action</h5>
                    </div>
                  </div>
                  {console.log(attachedMaterials,"erfe")}
                  {attachedMaterials?.length > 0 ? (
                    attachedMaterials?.map((item, index) => {
                      return (
                        <div className="table_data" key={index}>
                          <div className="col_20p">
                            {" "}
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                // checked={selectedMaterials.includes(product._id)}
                                // onChange={() => handleMaterialSelect(product._id)}
                                // id={product._id}
                                // onChange={(e) => handleCheckboxChange(e)}
                                // checked={selectedCheckboxes.includes(product._id)}
                                // checked={selectedList.some((item) => item._id === product._id)}
                              />
                            </div>
                          </div>
                          <div className="col_25p">
                            <h6>{index + 1}</h6>
                          </div>

                          <div className="col_25p">
                            <h6>{item?.category}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{item?.brand}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{item?.modelId}</h6>
                          </div>
                          <div className="col_25p">
                            <h6 className="action_wrraper">{item?.serialNo}</h6>
                          </div>
                          <div className="col_20p">
                            <h6 className="action_wrraper ">{item?.itemCode}</h6>
                          </div>
                          <div className="col_20p">
                            <Button
                              onClick={() => handleRemoveAttachedMaterial(item._id)}
                              name={"Delete"}
                              className="btn-danger"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
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
          {/* ---------------------------attached material end----------------------------------------------------------*/}

          {/* ---------------------------send attached material----------------------------------------------------------*/}
          <div className="d-flex align-items-center justify-content-center gap-3 my-3">
            <Button
              onClick={handleSubmit(sendReadyMaterial)}
              // onClick={sendReadyMaterial}
              className="btn-success"
              disabled={attachedMaterials.length === 0}
              name={"Send Material"}
            ></Button>
          </div>
        </div>
        {/* )} */}
      </form>
    </>
  );
};

export default AttachedSalesOrder;
