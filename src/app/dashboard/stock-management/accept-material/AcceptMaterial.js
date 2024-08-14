"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import {
  getCategory,
  getLocations,
  getLocationWiseBlock,
  getParameter,
  getRackPartation,
} from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import ButtonLoader from "@/common-components/ButtonLoader";
import Loader from "@/common-components/Loader";
import Swal from "sweetalert2";
import { stockStatus } from "@/helper/stockStatusArray";
import { faAngleDown, faCartArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/common-components/Button";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import SelectBox from "@/common-components/Select";

const AcceptMaterial = () => {
  const router = useRouter();
  const [nonMaterial, setNonMaterial] = useState([]);
  const params = useSearchParams();
  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedNonMaterials, setSelectedNonMaterials] = useState([]);
  const [allMaterialsSelected, setAllMaterialsSelected] = useState(false);
  const [allNonMaterialsSelected, setAllNonMaterialsSelected] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [NonMaterialId, setNonMaterialId] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [blocksCart, setBlocksCart] = useState([]);
  const [racks, setRacks] = useState([]);
  const [Cartracks, setCartRacks] = useState([]);
  const [rackPartation, setRackPartation] = useState([]);
  const [rackPartationCart, setRackPartationCart] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [rejectItem, setRejectItem] = useState("");
  const [parameterKeys, setparameterKeys] = useState([]);
  const [consumedMaterials, setConsumedMaterials] = useState([]);
  const [cartParameter, setCartParameter] = useState([]);
  const [respondHandlerModalState, setRespondHandlerModalState] = useState({
    state: false,
    jobNo: "",
  });
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [_parameter, __setParameter] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [dumpMaterial, setDumpMaterial] = useState([]);
  const [materialToReturn, setMaterialToReturn] = useState();
  const [disabledButtons, setDisabledButtons] = useState({});
  const [rowSelections, setRowSelections] = useState({});
  const [_category, _setCategory] = useState("");
  const [isChangeLocationChecked, setIsChangeLocationChecked] = useState("");
  const [isChangeLocationCheckedMaterial, setIsChangeLocationCheckedMaterial] = useState("");
  const [rowSelectionsMaterial, SetRowSelectionsMaterial] = useState({});
  const [isStoreSelected, setIsStoreSelected] = useState(false);
  const [addToCart, setAddToCart] = useState([]);
  const [cartTable, setCartTable] = useState([
    {
      categoryId: "",
      parameter: {},
      locationId: "",
      blockId: "",
      rackId: "",
      partitionName: "",
      status: "",
      // Add any other properties you want to include
    },
  ]);
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
  const categoryId = watch("categoryId");
  const rack = watch("blockId");
  const _rackIdForPrtn = watch("rackId");
  const locationCart = watch("locationIdCart");
  // ------------------------ACCEPT MATERIAL------------------------------------------
  const acceptMaterial = async (index) => {
    try {
      setLoader(true);
      const dataToSend = {
        jobNo: params.get("jobId"),
        material: savedMaterials,
        dump: dumpMaterial,
      };
      // console.log(dataToSend, "dataToSend");
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
  // ------------------------Retuned MATERIAL data------------------------------------------
  async function returnedMaterialByJobNo({ page = 1, searchString } = {}) {
    try {
      setLoader(true);
      let payload = {
        // page,
        // searchString: searchString,
        jobNo: params.get("jobId"),
      };
      const serverResponse = await communication.getReturnMaterialByJob(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        const NonMaterial = serverResponse?.data?.material?.nonMaterials;

        const parameterKeys = Array.from(
          new Set(
            NonMaterial.flatMap((material) =>
              material.parameter ? Object.keys(material.parameter) : []
            )
          )
        );
        // console.log(parameterKeys, "parameterKeyValuePairs");
        setparameterKeys(parameterKeys);
        if (NonMaterial.length > 0) {
          const allMaterials = NonMaterial.flatMap((material) => ({
            materialId: material._id,
            categoryId: material.categoryId?._id || "",
            blockId: material.blockId?._id || "",
            blockName: material.blockId?.blockNo || "",
            rackId: material.rackId?._id || "",
            rackName: material.rackId?.rackName || "",
            partitionName: material.partitionName || "",
            categoryName: material.categoryId?.name || "",
            locationId: material.locationId?._id || "",
            location: material.locationId?.name || "",
            brandId: material.brandId?._id || "",
            brand: material.brandId?.name || "",
            modelName: material.modelId?.name || "",
            status: material.status || "",
            itemCode: material.itemCode || "",
            serialNo: material.serialNo || "",
            parameter: material.parameter,
            // parameter: material.parameter
            //   ? Object.entries(material.parameter).map(([key, value]) => ({ key, value }))
            //   : [],
            quantity: material.quantity || 1,
          }));

          setNonMaterial(allMaterials);
          setCartParameter(allMaterials);
        }
        const material = serverResponse?.data?.material?.materials;
        if (material.length > 0) {
          const allMaterials = material.flatMap((material) => ({
            materialId: material._id,
            categoryId: material.categoryId?._id || "",
            blockId: material.blockId?._id || "",
            blockName: material.blockId?.blockNo || "",
            rackId: material.rackId?._id || "",
            rackName: material.rackId?.rackName || "",
            partitionName: material.partitionName || "",
            categoryName: material.categoryId?.name || "",
            locationId: material.locationId?._id || "",
            location: material.locationId?.name || "",
            brandId: material.brandId?._id || "",
            brand: material.brandId?.name || "",
            modelName: material.modelId?.name || "",
            itemCode: material.itemCode || "",
            serialNo: material.serialNo || "",
            parameterMaterial: material.parameter,
            quantity: material.quantity || 1,
            status: material.status || "",
          }));

          setMaterial(allMaterials);
        }

        toast.success(serverResponse.data.message);
      } else if (serverResponse?.data?.status === "FAILED") {
        // toast.info(serverResponse.data.message);
        setMaterial([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        // toast.info(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }
  const handleChange = (e, index, field) => {
    const { value } = e.target;
    // console.log(value, "value");
    setNonMaterial((prevList) =>
      prevList.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };
  const handleChangeMaterial = (e, index, field) => {
    const { value } = e.target;
    // console.log(value, "value");
    setMaterial((prevList) =>
      prevList.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleMaterialCheckboxChange = (e, productId) => {
    if (e.target.checked) {
      setSelectedMaterials((prev) => [...prev, productId]);
      setSelectedItems((prev) => [...prev, productId]);
    } else {
      setSelectedMaterials((prev) => prev.filter((id) => id !== productId));
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
    }
    setAllMaterialsSelected(selectedMaterials.length + 1 === material.length);
    // console.log("Current selected materials:", productId);
  };

  const handleNonMaterialCheckboxChange = (e, productId) => {
    if (e.target.checked) {
      // console.log("dfgrfe",e,target);
      setRejectItem(productId);
      setSelectedNonMaterials((prev) => [...prev, productId]);
      setNonMaterialId(productId);
      setSelectedItems((prev) => [...prev, productId]);
    } else {
      setSelectedNonMaterials((prev) => prev.filter((id) => id !== productId));
      setSelectedItems((prev) => prev.filter((id) => id !== productId));
    }
    setAllNonMaterialsSelected(selectedNonMaterials.length + 1 === nonMaterial.length);
  };
  const handleSelectAllMaterials = (e) => {
    const isChecked = e.target.checked;
    setAllMaterialsSelected(isChecked);
    if (isChecked) {
      setSelectedMaterials(material.map((item) => item?.materialId));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleSelectAllNonMaterials = (e) => {
    const isChecked = e.target.checked;
    setAllNonMaterialsSelected(isChecked);
    if (isChecked) {
      setSelectedNonMaterials(nonMaterial.map((item) => item._id));
    } else {
      setSelectedNonMaterials([]);
    }
  };

  const cancelHandler = () => {
    setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
  };
  const rejectMaterial = async (id, status, remark = "") => {
    try {
      setLoader(true);
      const dataToSend = {
        jobNo: params.get("jobId"),
        material: selectedItems,
        // status: status,
        remark: remark,
      };
      let response = await communication.rejectMaterial(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response?.data?.message);
        fetchReturnMaterialList(1, searchString);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response?.data?.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  };

  const showInputDialog = () => {
    Swal.fire({
      html: '<input placeholder="Enter Remark for Rejection" type="text" id="remarkInput" class="swal2-input">',
      showCancelButton: true,
      confirmButtonText: "Submit",
      preConfirm: () => {
        const remarkInput = document.getElementById("remarkInput");
        return remarkInput.value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const remark = result.value;
        if (remark) {
          rejectMaterial(remark);
        } else {
          toast.info("Remark required if you want to reject.");
        }
      }
    });
  };

  useEffect(() => {
    returnedMaterialByJobNo();
  }, []);
  useEffect(() => {
    const uniqueLocationIds = [...new Set(nonMaterial.map((material) => material.locationId))];
    uniqueLocationIds.forEach((locationId) => {
      if (locationId) {
        getLocationWiseBlock(locationId, setLoader, router, setBlocks);
      }
    });
  }, [nonMaterial]);
  useEffect(() => {
    nonMaterial.forEach((material) => {
      if (material.blockId) {
        const rackDetails = blocks?.find((ele) => ele._id === material.blockId);
        setRacks((prevRacks) => ({
          ...prevRacks,
          [material.blockId]: rackDetails?.rackId ?? [],
        }));
      }
    });
  }, [nonMaterial, blocks]);
  useEffect(() => {
    nonMaterial.forEach((material) => {
      if (material.rackId) {
        getRackPartation(material.rackId, setLoader, router, (partitions) => {
          setRackPartation((prevPartitions) => ({
            ...prevPartitions,
            [material.rackId]: partitions,
          }));
        });
      }
    });
  }, [nonMaterial]);
  useEffect(() => {
    const uniqueLocationIds = [...new Set(material.map((material) => material.locationId))];
    uniqueLocationIds.forEach((locationId) => {
      if (locationId) {
        getLocationWiseBlock(locationId, setLoader, router, setBlocks);
      }
    });
  }, [material]);
  useEffect(() => {
    material.forEach((material) => {
      if (material.blockId) {
        const rackDetails = blocks?.find((ele) => ele._id === material.blockId);
        setRacks((prevRacks) => ({
          ...prevRacks,
          [material.blockId]: rackDetails?.rackId ?? [],
        }));
      }
    });
  }, [material, blocks]);
  useEffect(() => {
    material.forEach((material) => {
      if (material.rackId) {
        getRackPartation(material.rackId, setLoader, router, (partitions) => {
          setRackPartation((prevPartitions) => ({
            ...prevPartitions,
            [material.rackId]: partitions,
          }));
        });
      }
    });
  }, [material]);
  const handleChangeParameter = (e, productIndex, parameterIndex, parameter) => {
    const { value } = e.target; // Get the new value from the input

    // Update the nonMaterial state
    setNonMaterial((prev) => {
      // Create a shallow copy of the previous state
      const updatedNonMaterial = [...prev];
      // Update the specific parameter for the specific product
      updatedNonMaterial[productIndex] = {
        ...updatedNonMaterial[productIndex],
        parameter: {
          ...updatedNonMaterial[productIndex].parameter,
          [parameter.key]: value, // Use the key to update the correct parameter
        },
      };
      return updatedNonMaterial; // Return the updated state
    });
  };

  const handleEditClick = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
  };
  const handleSaveClick = (index) => {
    const materialToSave = {
      ...nonMaterial[index],
      // consume: consumedMaterials, // Add the consumed material IDs to the save payload
    };
    setSavedMaterials((prevMaterials) => [...prevMaterials, materialToSave]);
    // Clear the consumedMaterials state after saving
    setConsumedMaterials([]);
    setIsEditing(false);
    setEditingIndex(null);
  };
  // consume click handler
  const handleConsumeClick = () => {
    // console.log("Material to Consume:", material);
    // Add the material ID to the consumedMaterials state
    setConsumedMaterials(selectedMaterials);
  };
  const handleReturnClick = (material) => {
    // console.log("Material to Return:", material);
    // Add the returned material to the savedMaterials state as an object
    if (!material.status || material.status === "") {
      // You can customize this message or alert as needed
      alert("Please select a status before returning the material.");
      return; // Prevent the function from executing further
    }
    const materialToReturn = {
      ...material,
      materialStatus: "RETURNED", // Update status or any other property if needed
    };
    setDisabledButtons((prevState) => ({
      ...prevState,
      [material.materialId]: true,
    }));
    setMaterialToReturn(materialToReturn);
    setSavedMaterials((prevMaterials) => [...prevMaterials, materialToReturn]);
  };

  const handleDumpClick = () => {
    // Extract the IDs from each nonMaterial item
    const materialIds = nonMaterial.map((material) => material._id);
    // Update the savedMaterials state with the array of IDs
    setDumpMaterial((prevMaterials) => [...prevMaterials, ...materialIds]);
  };
  // Function to handle the checkbox change
  const handleCheckboxChange = (materialId) => {
    setIsChangeLocationChecked((prevState) => ({
      ...prevState,
      [materialId]: !prevState[materialId],
    }));
  };
  const isAnyCheckboxChecked = () => {
    return Object.values(isChangeLocationChecked).some((isChecked) => isChecked);
  };
  const handleRadioChange = (materialId, value) => {
    setRowSelections((prevSelections) => ({
      ...prevSelections,
      [materialId]: value,
    }));
  };
  // Function to handle the checkbox change
  const handleCheckboxChangeInMaterial = (materialId) => {
    setIsChangeLocationCheckedMaterial((prevState) => ({
      ...prevState,
      [materialId]: !prevState[materialId],
    }));
  };
  const isAnyCheckboxCheckedMaterial = () => {
    return Object.values(isChangeLocationCheckedMaterial).some((isChecked) => isChecked);
  };
  const handleRadioChangeMaterial = (materialId, value) => {
    SetRowSelectionsMaterial((prevSelections) => ({
      ...prevSelections,
      [materialId]: value,
    }));
  };
  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));
  }
  useEffect(() => {
    // initialAPICall();
    getParameter(setLoader, router, setCategoryMapData);
  }, []);
  useEffect(() => {
    const id = _category;
    // const id = getValues("categoryId");
    if (id) {
      const parameterDetails = CategoryMapData.find((ele) => ele._id === id);
      setValue("parameterId", parameterDetails?._id);
      // console.log(parameterDetails, "parameterDetails");

      __setParameter(parameterDetails?.parameter ?? []);
    } else {
      __setParameter([]);
      setValue("parameterId", "");
    }
  }, [_category]);
  useEffect(() => {
    getLocations(setLoader, router, setLocationList);
  }, []);
  useEffect(() => {
    const id = getValues("locationIdCart");
    if (id) {
      getLocationWiseBlock(id, setLoader, router, setBlocksCart);
    }
  }, [locationList.length >= 1 && locationCart]);
  useEffect(() => {
    const id = getValues("blockId");
    if (id) {
      const rackDetails = blocksCart.find((ele) => ele._id === id);
      setCartRacks(rackDetails?.rackId ?? []);
    } else {
      setCartRacks([]);
    }
  }, [rack]);
  useEffect(() => {
    const id = getValues("rackId");
    if (id) {
      getRackPartation(id, setLoader, router, setRackPartationCart);
    } else {
      setRackPartationCart([]);
    }
  }, [_rackIdForPrtn]);
  const handleRadioChangeCart = (value) => {
    setIsStoreSelected(value === "Store");
  };
  // const handleAddRow = () => {
  //   setCartTable((prevRows) => [
  //     ...prevRows.map((row) => ({ ...row, disabled: true })), // Disable all previous rows
  //     { disabled: false }, // Add a new row
  //   ]);
  // };
  const handleAddRow = () => {
    const newMaterial = {
      categoryId: "",
      parameter: {},
      locationId: "",
      blockId: "",
      rackId: "",
      partitionName: "",
      status: "",
      // Add any other properties you want to include
    };

    setCartTable((prevCartTable) => [...prevCartTable, newMaterial]);
  };
  const handleInputChangeCart = (index, field, value) => {
    const updatedCartTable = [...cartTable];
    updatedCartTable[index][field] = value;
    setCartTable(updatedCartTable);
  };
  // const handleInputChangeCart = (index, field, value) => {
  //   const updatedCart = [...addToCart];
  //   if (!updatedCart[index]) {
  //     updatedCart[index] = {
  //       locationId: "",
  //       blockId: "",
  //       categoryId: "",
  //       brandId: "",
  //       conditionType: "",
  //       status: "",
  //       serialNo: "",
  //       quantity: "1",
  //       modelId: "",
  //       itemCode: "",
  //       partitionName: "",
  //       parameterId: "",
  //       rackId: "",
  //       parameter: {},
  //     };
  //   }
  //   updatedCart[index][field] = value;
  //   setAddToCart(updatedCart);
  // };

  return (
    <>
      {loader && <Loader />}
      {respondHandlerModalState.state && (
        <CustomResponseHandlerModal
          status="warning"
          message="Are you sure you want to dump this material?"
          cancelHandler={cancelHandler}
          successHandler={() => dumpMaterial()}
        />
      )}

      <div className="top_header">
        <div className="tab_title">Returned Material</div>
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
      <form>
        {/* {console.log(savedMaterials, "savedMaterials")} */}
        {/* {console.log(consumedMaterials, "consumedMaterials")} */}
        <div className="form_layout">
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Non-Material List</p>
            </div>
            {/* table  */}
            {/* {console.log(nonMaterial, "nonMaterial")} */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                <div className="table_section pi_product_table" style={{ minWidth: "2500px" }}>
                  <div className="table_header">
                    <div className="col_20p">
                      <h5 style={{ textAlign: "center" }}>Action</h5>
                    </div>
                    <div className="col_7p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Serial No</h5>
                    </div>{" "}
                    <div className="col_25p">
                      <h5>Item Code</h5>
                    </div>{" "}
                    <div className="col_30p">
                      <h5>Category</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Brand</h5>
                    </div>
                    <div className="col_30p">
                      <h5>Model</h5>
                    </div>
                    <div className="col_85p">
                      <div className="input_scroll" style={{ scrollbarWidth: "none" }}>
                        <h5 style={{ textAlign: "center" }}>Parameter</h5>
                      </div>
                    </div>
                    <div className="col_40p">
                      <h5 className="action_wrraper">Change Location</h5>
                    </div>
                    {isAnyCheckboxChecked() && (
                      <>
                        <div className="col_40p">
                          <h5 className="action_wrraper">Change Area</h5>
                        </div>
                        {nonMaterial.some(
                          (product) => rowSelections[product.materialId] === "Store"
                        ) && (
                          <>
                            <div className="col_25p">
                              <h5>Location</h5>
                            </div>
                            <div className="col_40p">
                              <h5 style={{ textAlign: "center" }}>Block</h5>
                            </div>
                            <div className="col_40p">
                              <h5 style={{ textAlign: "center" }}>Rack</h5>
                            </div>
                            <div className="col_40p">
                              <h5 style={{ textAlign: "center" }}>Partation</h5>
                            </div>
                          </>
                        )}
                      </>
                    )}
                    <div className="col_40p">
                      <h5 style={{ textAlign: "center" }}>Status</h5>
                    </div>
                  </div>
                  {nonMaterial?.length > 0 ? (
                    nonMaterial?.map((product, index) => {
                      const statusClass =
                        product?.status === "assigned"
                          ? "status-assigned"
                          : product.status === "returned"
                          ? "status-returned"
                          : product.status === "accepted"
                          ? "status-accepted"
                          : "";
                      return (
                        <div className={`table_data ${statusClass}`} key={index}>
                          {/* {console.log(product, "product")} */}
                          <div className="col_20p">
                            {isEditing && editingIndex === index ? (
                              <h6 className="action_wrraper">
                                <CustomBtn
                                  name={"Save"}
                                  type="button"
                                  onClick={() => handleSaveClick(index)}
                                />
                              </h6>
                            ) : (
                              <div title="edit">
                                <svg
                                  title="edit"
                                  width="27"
                                  height="27"
                                  viewBox="0 0 25 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  onClick={() => handleEditClick(index)}
                                >
                                  <g clip-path="url(#clip0_279_5204)">
                                    <path
                                      d="M17.5 15V17.5C17.5 17.8315 17.3683 18.1495 17.1339 18.3839C16.8995 18.6183 16.5815 18.75 16.25 18.75H7.5C7.16848 18.75 6.85054 18.6183 6.61612 18.3839C6.3817 18.1495 6.25 17.8315 6.25 17.5V8.75C6.25 8.41848 6.3817 8.10054 6.61612 7.86612C6.85054 7.6317 7.16848 7.5 7.5 7.5H10"
                                      stroke="#0D6EFD"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                    <path
                                      d="M12.8125 14.875L18.75 8.875L16.125 6.25L10.1875 12.1875L10 15L12.8125 14.875Z"
                                      stroke="#0D6EFD"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_279_5204">
                                      <rect
                                        width="15"
                                        height="15"
                                        fill="white"
                                        transform="translate(5 5)"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="col_7p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.serialNo ? product?.serialNo : "--"}</h6>
                          </div>{" "}
                          <div className="col_25p">
                            <h6>{product?.itemCode ? product?.itemCode : "--"}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{product?.categoryName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.brand}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{product?.modelName}</h6>
                          </div>
                          <div className="col_85p">
                            <div className="input_scroll">
                              {Object.entries(product.parameter).map(([key, value], indexTwo) => (
                                <div
                                  className="col_60p"
                                  key={indexTwo}
                                  style={{ display: "block" }}
                                >
                                  <label>{key}</label>
                                  <InputBox
                                    value={value} // Set the input value to the corresponding value from the object
                                    onChange={(e) =>
                                      handleChangeParameter(e, index, indexTwo, { key, value })
                                    }
                                    disabled={!isEditing || editingIndex !== index} // Disable based on edit state
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* checkBox for yes */}
                          <div className="col_40p">
                            <div className="check_box me-1" style={{ gap: "0" }}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`changeLocationCheckbox-${product.materialId}`}
                                onChange={() => handleCheckboxChange(product.materialId)}
                                checked={isChangeLocationChecked[product.materialId] || false}
                                disabled={!isEditing || editingIndex !== index}
                              />
                              {/* {console.log(rowSelections, "rowSelections")} */}
                              <label htmlFor={`changeLocationCheckbox-${product.materialId}`}>
                                Yes
                              </label>
                            </div>
                          </div>
                          {isChangeLocationChecked[product.materialId] && (
                            <>
                              <div className="col_40p">
                                <div className="check_box me-1" style={{ gap: "0" }}>
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`selection-${product.materialId}`}
                                    id={`dumpRadio-${product.materialId}`}
                                    onChange={() => handleRadioChange(product.materialId, "Dump")}
                                    checked={rowSelections[product.materialId] === "Dump"}
                                  />
                                  <label htmlFor={`dumpRadio-${product.materialId}`}>Dump</label>
                                </div>
                                <div className="check_box me-1" style={{ gap: "0" }}>
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`selection-${product.materialId}`} // Unique name for each row
                                    id={`storeRadio-${product.materialId}`}
                                    onChange={() => handleRadioChange(product.materialId, "Store")}
                                    checked={rowSelections[product.materialId] === "Store"}
                                  />
                                  <label htmlFor={`storeRadio-${product.materialId}`}>Store</label>
                                </div>
                              </div>
                              {rowSelections[product.materialId] === "Store" && (
                                <>
                                  <div className="col_25p">
                                    <h6>{product?.location}</h6>
                                  </div>
                                  <div className="col_40p">
                                    <div className="position-relative">
                                      <select
                                        value={product?.rackId}
                                        onChange={(e) => handleChange(e, index, "rack")}
                                        disabled={!isEditing || editingIndex !== index}
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Rack
                                        </option>
                                        {racks[product.blockId]?.map((rack, idx) => (
                                          <option value={rack._id} key={idx}>
                                            {rack.rackName}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col_40p">
                                    <div className="position-relative">
                                      <select
                                        name="blockId"
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                        value={product?.blockId}
                                        onChange={(e) => handleChange(e, index, "block")}
                                        disabled={!isEditing || editingIndex !== index}
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Block
                                        </option>
                                        {blocks.map((block, idx) => {
                                          return (
                                            <option
                                              className="small text-capitalize"
                                              value={block._id}
                                              key={idx}
                                            >
                                              {block.blockNo}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col_40p">
                                    <div className="position-relative">
                                      <select
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                        value={product?.partitionName}
                                        onChange={(e) => handleChange(e, index, "partitionName")}
                                        disabled={!isEditing || editingIndex !== index}
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Partation
                                        </option>
                                        {rackPartation[product.rackId]
                                          ? rackPartation[product.rackId].map((partition, idx) => (
                                              <option value={partition.partitionName} key={idx}>
                                                {partition.partitionName}
                                              </option>
                                            ))
                                          : null}
                                      </select>
                                      <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          <div className="col_40p">
                            <div className="position-relative">
                              <select
                                value={product?.status}
                                onChange={(e) => handleChange(e, index, "status")}
                                disabled={!isEditing || editingIndex !== index}
                                className="form-control custom_input"
                                style={{ width: "100%" }}
                              >
                                <option value="" className="text-secondary text-lowercase">
                                  Select Status
                                </option>
                                {stockStatus.map((ele, index) => {
                                  return (
                                    <option value={ele} key={index}>
                                      {ele}
                                    </option>
                                  );
                                })}
                              </select>
                              <div className="select_box_arrow">
                                <FontAwesomeIcon icon={faAngleDown} className="icon" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <small className="text-center text-secondary p-2 small d-block">
                      Data Not Available
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Material List</p>
              <div className="search_btn_wrapper">
                <div className="buttons_wrapper">
                  <CustomBtn
                    name={"Consume"}
                    type="button"
                    onClick={() => handleConsumeClick()}
                    svg={
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9V11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15V12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
                          fill="#F3F8FF"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                          fill="#F3F8FF"
                        />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>
            {/* table */}

            <div className="table_wrapper my-3">
              <div className="table_main">
                <div className="table_section pi_product_table" style={{ minWidth: "1800px" }}>
                  <div className="table_header">
                    <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllMaterialCheckbox"
                          onChange={handleSelectAllMaterials}
                          checked={allMaterialsSelected}
                        />
                      </div>
                    </div>
                    {/* {console.log("Current selected materials:", selectedItems)} */}
                    <div className="col_7p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Serial No</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Item Code</h5>
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
                    <div className="col_85p">
                      <div className="input_scroll" style={{ scrollbarWidth: "none" }}>
                        <h5 style={{ textAlign: "center" }}>Parameter</h5>
                      </div>
                    </div>
                    <div className="col_40p">
                      <h5 className="action_wrraper">Change Place</h5>
                    </div>
                    {isAnyCheckboxCheckedMaterial() && (
                      <>
                        <div className="col_40p">
                          <h5 className="action_wrraper">Change Area</h5>
                        </div>
                        {material.some(
                          (product) => rowSelectionsMaterial[product.materialId] === "Store"
                        ) && (
                          <>
                            <div className="col_25p">
                              <h5>Location</h5>
                            </div>
                            <div className="col_25p">
                              <h5 style={{ textAlign: "center" }}>Block</h5>
                            </div>
                            <div className="col_25p">
                              <h5 style={{ textAlign: "center" }}>Rack</h5>
                            </div>
                            <div className="col_25p">
                              <h5 style={{ textAlign: "center" }}>Partation</h5>
                            </div>
                            <div className="col_25p">
                              <h5 style={{ textAlign: "center" }}>Status</h5>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {material?.length > 0 ? (
                    material?.map((product, index) => {
                      return (
                        <div className="table_data" key={index}>
                          {/* {console.log(product, "product")} */}
                          <div className="col_20p">
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={product._id}
                                onChange={(e) =>
                                  handleMaterialCheckboxChange(e, product.materialId)
                                }
                                checked={selectedMaterials.includes(product.materialId)}
                              />
                            </div>
                          </div>
                          <div className="col_7p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.serialNo ? product?.serialNo : "--"}</h6>
                          </div>{" "}
                          <div className="col_25p">
                            <h6>{product?.itemCode ? product?.itemCode : "--"}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.categoryName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.brand}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.modelName}</h6>
                          </div>
                          <div className="col_85p">
                            <div className="input_scroll">
                              {Object.entries(product.parameterMaterial).map(
                                ([key, value], indexOne) => (
                                  <div
                                    className="col_60p"
                                    key={indexOne}
                                    style={{ display: "block" }}
                                  >
                                    <label>{key}</label>
                                    <InputBox
                                      value={value} // Set the input value to the corresponding value from the object
                                      // disabled={!isEditing || editingIndex !== index} // Disable based on edit state
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                          <div className="col_40p">
                            <div className="check_box me-1" style={{ gap: "0" }}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`changeLocationCheckboxMaterial-${product.materialId}`}
                                onChange={() => handleCheckboxChangeInMaterial(product.materialId)}
                                checked={
                                  isChangeLocationCheckedMaterial[product.materialId] || false
                                }
                                // onClick={() => handleEditClick(index)}
                              />
                              {/* {console.log(rowSelections, "rowSelections")} */}
                              <label
                                htmlFor={`changeLocationCheckboxMaterial-${product.materialId}`}
                              >
                                Yes
                              </label>
                            </div>
                          </div>
                          {isChangeLocationCheckedMaterial[product.materialId] && (
                            <>
                              <div className="col_40p">
                                <div className="check_box me-1" style={{ gap: "0" }}>
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`selection-${product.materialId}`}
                                    id={`dumpRadioMaterial-${product.materialId}`}
                                    onChange={() =>
                                      handleRadioChangeMaterial(product.materialId, "Dump")
                                    }
                                    checked={rowSelectionsMaterial[product.materialId] === "Dump"}
                                  />
                                  <label htmlFor={`dumpRadioMaterial-${product.materialId}`}>
                                    Dump
                                  </label>
                                </div>
                                <div className="check_box me-1" style={{ gap: "0" }}>
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`selection-${product.materialId}`} // Unique name for each row
                                    id={`storeRadioMaterial-${product.materialId}`}
                                    onChange={() =>
                                      handleRadioChangeMaterial(product.materialId, "Store")
                                    }
                                    checked={rowSelectionsMaterial[product.materialId] === "Store"}
                                  />
                                  <label htmlFor={`storeRadio-${product.materialId}`}>Store</label>
                                </div>
                              </div>
                              {rowSelectionsMaterial[product.materialId] === "Store" && (
                                <>
                                  <div className="col_25p">
                                    <h6>{product?.location}</h6>
                                  </div>
                                  <div className="col_25p">
                                    <div className="position-relative">
                                      <select
                                        name="blockId"
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                        value={product?.blockId}
                                        onChange={(e) => handleChangeMaterial(e, index, "block")}
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Block
                                        </option>
                                        {blocks.map((block, idx) => {
                                          return (
                                            <option
                                              className="small text-capitalize"
                                              value={block._id}
                                              key={idx}
                                            >
                                              {block.blockNo}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col_25p">
                                    <div className="position-relative">
                                      <select
                                        value={product?.rackId}
                                        onChange={(e) => handleChangeMaterial(e, index, "rack")}
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Rack
                                        </option>
                                        {racks[product.blockId]?.map((rack, idx) => (
                                          <option value={rack._id} key={idx}>
                                            {rack.rackName}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col_25p">
                                    <div className="position-relative">
                                      <select
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                        value={product?.partitionName}
                                        onChange={(e) =>
                                          handleChangeMaterial(e, index, "partitionName")
                                        }
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Partation
                                        </option>
                                        {rackPartation[product.rackId]
                                          ? rackPartation[product.rackId].map((partition, idx) => (
                                              <option value={partition.partitionName} key={idx}>
                                                {partition.partitionName}
                                              </option>
                                            ))
                                          : null}
                                      </select>
                                      <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col_25p">
                                    <div className="position-relative">
                                      <select
                                        value={product?.status}
                                        onChange={(e) => handleChangeMaterial(e, index, "status")}
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Status
                                        </option>
                                        {stockStatus.map((ele, index) => {
                                          return (
                                            <option value={ele} key={index}>
                                              {ele}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      <div className="select_box_arrow">
                                        <FontAwesomeIcon icon={faAngleDown} className="icon" />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <small className="text-center text-secondary p-2 small d-block">
                      Data Not Available
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      {console.log(cartTable, "cartTable")}
      <div className="form_list_layout_wrapper my-4">
        <div className="d-flex align-items-center justify-content-between">
          <p>Cart Item</p>

          <div className="search_btn_wrapper">
            <div className="buttons_wrapper">
              <CustomBtn
                name={"Add New"}
                type="button"
                // onClick={handleAddRow}
                onClick={() => handleAddRow()}
                svg={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9V11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15V12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
                      fill="#F3F8FF"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                      fill="#F3F8FF"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
        {/* table */}
        <div className="table_wrapper my-3">
          <div className="table_main">
            <div
              className="table_section pi_product_table"
              style={{
                minWidth: _category ? "2000px" : "",
                width: !_category ? "auto" : "",
              }}
            >
              <div className="table_header">
                {/* <div className="col_7p">
                  <div className="check_box">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </div> */}
                <div className="col_10p">
                  <h5>Sr. No.</h5>
                </div>
                <div className="col_50p">
                  <h5 style={{ textAlign: "center" }}>Category</h5>
                </div>
                {_category && (
                  <>
                    {" "}
                    <div className="col_85p">
                      <div className="input_scroll" style={{ scrollbarWidth: "none" }}>
                        <h5 style={{ textAlign: "center" }}>Parameter</h5>
                      </div>
                    </div>
                    <div className="col_40p">
                      <h5 className="action_wrraper">Change Area</h5>
                    </div>
                  </>
                )}

                {isStoreSelected && (
                  <>
                    {" "}
                    <div className="col_40p">
                      <h5 style={{ textAlign: "center" }}>Location</h5>
                    </div>
                    <div className="col_40p">
                      <h5 style={{ textAlign: "center" }}>Block</h5>
                    </div>
                    <div className="col_40p">
                      <h5 style={{ textAlign: "center" }}>Rack</h5>
                    </div>
                    <div className="col_40p">
                      <h5 style={{ textAlign: "center" }}>Partation</h5>
                    </div>
                    <div className="col_40p">
                      <h5 style={{ textAlign: "center" }}>Status</h5>
                    </div>
                  </>
                )}
              </div>
              {cartTable.map((newTable, index) => (
                <div className="table_data" key={index}>
                  <div className="col_10p"></div>
                  <div className="col_50p">
                    <SelectBox
                      options={CategoryMapData}
                      displayName={"name"}
                      value={"_id"}
                      firstOption={"Category"}
                      disabled={cartTable.disabled}
                      // register={{
                      //   ...register("category", {
                      //     required: "category is required",
                      //   }),
                      // }}
                      onChange={(e) => {
                        handleInputChangeCart(index, "categoryId", e.target.value);
                        _setCategory(e.target.value);
                      }}
                      errors={errors.category}
                      style={{ fontSize: "10px", color: "red" }}
                    />
                  </div>
                  {_category && (
                    <>
                      <div className="col_85p">
                        <div className="input_scroll">
                          {_parameter?.map((item, index) => (
                            <div className="col_60p" style={{ display: "block" }} key={index}>
                              <label>{item}</label>
                              <InputBox
                                type="text"
                                disabled={cartTable.disabled}
                                onChange={(e) => {
                                  const paramValue = e.target.value;
                                  setAddToCart((prev) => {
                                    const updatedCart = [...prev];
                                    if (!updatedCart[index]) {
                                      updatedCart[index] = { parameter: {} };
                                    }
                                    updatedCart[index].parameter[item] = paramValue;
                                    return updatedCart;
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col_40p">
                        <div className="check_box me-1" style={{ gap: "0" }}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="selectionCart"
                            id="dumpRadioCart"
                            onChange={() => handleRadioChangeCart("Dump")}
                          />
                          <label htmlFor={`dumpRadioCart`}>Dump</label>
                        </div>
                        <div className="check_box me-1" style={{ gap: "0" }}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="selectionCart"
                            id="dumpRadioCart"
                            onChange={() => handleRadioChangeCart("Store")}
                          />
                          <label htmlFor={`dumpRadioCart`}>Store</label>
                        </div>
                      </div>
                    </>
                  )}

                  {isStoreSelected && (
                    <>
                      {" "}
                      <div className="col_40p">
                        <div className="position-relative">
                          <select
                            name="locationId"
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                            {...register("locationIdCart", {
                              required: "locationId is required",
                            })}
                            onChange={(e) =>
                              handleInputChangeCart(index, "locationId", e.target.value)
                            }
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Location
                            </option>
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
                      </div>
                      <div className="col_40p">
                        <div className="position-relative">
                          <select
                            name="blockId"
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                            {...register("blockId", {
                              required: "blockNo is required",
                            })}
                            onChange={(e) =>
                              handleInputChangeCart(index, "blockId", e.target.value)
                            }
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Block
                            </option>
                            {blocksCart.map((ele, index) => {
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
                          <div className="select_box_arrow">
                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                          </div>
                        </div>
                      </div>
                      <div className="col_40p">
                        <div className="position-relative">
                          <select
                            {...register("rackId", {
                              required: "Rack is required",
                            })}
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                            onChange={(e) => handleInputChangeCart(index, "rackId", e.target.value)}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Rack
                            </option>
                            {Cartracks.map((ele, index) => {
                              return (
                                <option value={ele._id} key={index}>
                                  {ele.rackName}
                                </option>
                              );
                            })}
                          </select>
                          <div className="select_box_arrow">
                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                          </div>
                        </div>
                      </div>
                      <div className="col_40p">
                        <div className="position-relative">
                          <select
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                            {...register("partitionName", {
                              required: "Partation is required",
                            })}
                            onChange={(e) =>
                              handleInputChangeCart(index, "partitionName", e.target.value)
                            }
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Partation
                            </option>
                            {rackPartationCart?.map((ele, index) => {
                              return (
                                <option value={ele.partitionName} key={index}>
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
                      </div>
                      <div className="col_40p">
                        <div className="position-relative">
                          <select
                            {...register("status", {
                              required: "Status is required",
                            })}
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                            onChange={(e) => handleInputChangeCart(index, "status", e.target.value)}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Status
                            </option>
                            {stockStatus.map((ele, index) => {
                              return (
                                <option value={ele} key={index}>
                                  {ele}
                                </option>
                              );
                            })}
                          </select>
                          <div className="select_box_arrow">
                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ---------------------------attached material end----------------------------------------------------------*/}

      {/* ---------------------------send attached material----------------------------------------------------------*/}
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        <Button
          className="btn-success"
          name={"Accept"}
          type="button"
          onClick={acceptMaterial}
        ></Button>
        <Button
          className="btn-success"
          name={"Reject"}
          onClick={(e) => {
            // e.stopPropagation();
            showInputDialog("reject");
          }}
          // onClick={(e) => rejectMaterial(rejectItem, "reject")}
        ></Button>
      </div>
    </>
  );
};

export default AcceptMaterial;
