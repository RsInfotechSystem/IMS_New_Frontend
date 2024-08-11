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
import ButtonLoader from "@/common-components/ButtonLoader";
import Loader from "@/common-components/Loader";
import Swal from "sweetalert2";
import { stockStatus } from "@/helper/stockStatusArray";
import { faAngleDown, faCartArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/common-components/Button";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";

const AcceptMaterial = () => {
  const router = useRouter();
  const [nonMaterial, setNonMaterial] = useState([]);
  const params = useSearchParams();
  const [brandName, setBrandName] = useState("");
  const [loader, setLoader] = useState(false);
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [parameter, setParameter] = useState([]);
  const searchParams = useSearchParams();
  const [partition, setPartition] = useState("");
  const [material, setMaterial] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedNonMaterials, setSelectedNonMaterials] = useState([]);
  const [allMaterialsSelected, setAllMaterialsSelected] = useState(false);
  const [allNonMaterialsSelected, setAllNonMaterialsSelected] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [NonMaterialId, setNonMaterialId] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [racks, setRacks] = useState([]);
  const [rackPartation, setRackPartation] = useState([]);
  const [locationId, setLocationId] = useState();
  const [materialList, setMaterialList] = useState([]);
  const [rejectItem, setRejectItem] = useState("");
  const [parameterKeys, setparameterKeys] = useState([]);
  const [consumedMaterials, setConsumedMaterials] = useState([]);
  const [cartParameter, setCartParameter] = useState([]);
  const [respondHandlerModalState, setRespondHandlerModalState] = useState({
    state: false,
    jobNo: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [dumpMaterial, setDumpMaterial] = useState([]);
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

  const acceptMaterial = async (index) => {
    try {
      setLoader(true);
      const dataToSend = {
        jobNo: params.get("jobId"),
        material: savedMaterials,
        dump: dumpMaterial,
      };
      console.log(dataToSend, "dataToSend");
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
  const handleChange = (e, index, field) => {
    const { value } = e.target;
    console.log(value, "value");

    setNonMaterial((prevList) =>
      prevList.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };
  const handleChangeMaterial = (e, index, field) => {
    const { value } = e.target;
    console.log(value, "value");

    setMaterial((prevList) =>
      prevList.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };
  async function returnmaterialByJob({ page = 1, searchString } = {}) {
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
            itemCode: material.itemCode || "",
            serialNo: material.serialNo || "",
            parameter: material.parameter
              ? Object.entries(material.parameter).map(([key, value]) => ({ key, value }))
              : [],
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
            quantity: material.quantity || 1,
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
  const handleMaterialCheckboxChange = (e, productId) => {
    if (e.target.checked) {
      setSelectedMaterials((prev) => [...prev, productId]);
    } else {
      setSelectedMaterials((prev) => prev.filter((id) => id !== productId));
    }
    setAllMaterialsSelected(selectedMaterials.length + 1 === material.length);
  };

  const handleNonMaterialCheckboxChange = (e, productId) => {
    if (e.target.checked) {
      // console.log("dfgrfe",e,target);

      setRejectItem(productId);
      setSelectedNonMaterials((prev) => [...prev, productId]);
      setNonMaterialId(productId);
    } else {
      setSelectedNonMaterials((prev) => prev.filter((id) => id !== productId));
    }
    setAllNonMaterialsSelected(selectedNonMaterials.length + 1 === nonMaterial.length);
  };
  const handleSelectAllMaterials = (e) => {
    const isChecked = e.target.checked;
    setAllMaterialsSelected(isChecked);
    if (isChecked) {
      setSelectedMaterials(material.map((item) => item._id));
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

  // const handleAttachMaterials = () => {
  //   const selectedItems = nonMaterial.filter((item) => selectedNonMaterials.includes(item._id));
  //   setCartItems((prevItems) => [...prevItems, ...selectedItems]);

  //   // Clear the selection after adding to cart
  //   setSelectedNonMaterials([]);
  // };
  const cancelHandler = () => {
    setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
  };
  const rejectMaterial = async (id, status, remark = "") => {
    try {
      setLoader(true);
      const dataToSend = {
        materialId: id,
        // status: status,
        // remark: remark,
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

  const showInputDialog = (id, status) => {
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
          rejectMaterial(id);
        } else {
          toast.info("Remark required if you want to reject.");
        }
      }
    });
  };
  // async function dumpMaterial() {
  //   try {
  //     setLoader(true);
  //     let payload = { orderId: searchParams.get("orderId") };
  //     const serverResponse = await communication.allMaterialOrderSells(payload);
  //     if (serverResponse?.data?.status === "SUCCESS") {
  //       toast.success(serverResponse.data.message);
  //       router.back();
  //     } else if (serverResponse?.data?.status === "JWT_INVALID") {
  //       toast.info(serverResponse.data.message);
  //       router.push("/");
  //       setLoader(false);
  //     } else {
  //       toast.info(serverResponse.data.message);
  //     }
  //     setLoader(false);
  //   } catch (error) {
  //     toast.info(error?.response?.data?.message || error.message);
  //     setLoader(false);
  //   }
  // }
  const handleConsumeClick = (material) => {
    console.log("Material to Consume:", material);

    // Add the material ID to the consumedMaterials state
    setConsumedMaterials((prev) => [...prev, material.materialId]);
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
        setLocationId(stockData?.locationId?._id);
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

  // useEffect(() => {
  //   setValue("partitionName", isPartationPresent);
  // }, [rackPartation && rackPartation.length >= 1]);
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

  // useEffect(()=>{
  //   const id = getValues("categoryId");
  //   if (id) {
  //     getCategoryWiseBrand(id, setLoader, router, setBrandsData)
  //   }
  // },[categoryId])

  useEffect(() => {
    const id = getValues("locationId");

    if (locationId) {
      getLocationWiseBlock(locationId, setLoader, router, setBlocks);
    }
  }, [locationId]);

  // useEffect(() => {
  //   const id = getValues("blockId");
  //   if (id) {
  //     const rackDetails = blocks?.find((ele) => ele._id === id);
  //     setRacks(rackDetails?.rackId ?? []);
  //   } else {
  //     setRacks([]);
  //   }
  // }, [rack]);

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
    returnmaterialByJob();
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
  // useEffect(() => {
  //   const id = getValues("blockId");
  //   if (id) {
  //     const rackDetails = blocks?.find((ele) => ele._id === id);
  //     setRacks(rackDetails?.rackId ?? []);
  //   } else {
  //     setRacks([]);
  //   }
  // }, [rack]);
  const handleChangeParameter = (e, productIndex, index, parameter) => {
    let updatedNonMaterial = [...nonMaterial];
    updatedNonMaterial[productIndex].parameter[index] = {
      ...parameter,
      value: e.target.value,
    };
    setNonMaterial(updatedNonMaterial);
  };
  const handleAttachMaterials = (product) => {
    // Create a deep copy of the product object
    const productCopy = JSON.parse(JSON.stringify(product));

    // Add the copied product to the selectedItems state
    setCartItems((prevItems) => [...prevItems, productCopy]);
  };
  const handleEditClick = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
  };
  const handleSaveClick = (index) => {
    const materialToSave = {
      ...nonMaterial[index],
      consume: consumedMaterials, // Add the consumed material IDs to the save payload
    };

    setSavedMaterials((prevMaterials) => [...prevMaterials, materialToSave]);

    // Clear the consumedMaterials state after saving
    setConsumedMaterials([]);

    setIsEditing(false);
    setEditingIndex(null);
  };
  const handleReturnClick = (material) => {
    console.log("Material to Return:", material);

    // Add the returned material to the savedMaterials state as an object
    const materialToReturn = {
      ...material,
      materialStatus: "RETURNED", // Update status or any other property if needed
    };

    setSavedMaterials((prevMaterials) => [...prevMaterials, materialToReturn]);
  };
  const handleDumpClick = () => {
    // Extract the IDs from each nonMaterial item
    const materialIds = nonMaterial.map((material) => material._id);

    // Update the savedMaterials state with the array of IDs
    setDumpMaterial((prevMaterials) => [...prevMaterials, ...materialIds]);
  };
  // const handleSaveClick = (index) => {
  //   const materialToSave = nonMaterial[index];
  //   setSavedMaterials((prevMaterials) => [...prevMaterials, materialToSave]);
  //   // updateMaterial(index); // Your existing save logic
  //   setIsEditing(false);
  //   setEditingIndex(null);
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
        {console.log(savedMaterials, "savedMaterials")}
        <div className="form_layout">
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Material List</p>
            </div>
            {/* table */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                <div className="table_section pi_product_table" style={{ minWidth: "2500px" }}>
                  <div className="table_header">
                    {/* <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          // id="selectAllCheckbox"
                          id="selectAllMaterialCheckbox"
                          onChange={handleSelectAllMaterials}
                          checked={allMaterialsSelected}
                        />
                      </div>
                    </div> */}
                    <div className="col_20p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Location</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Block</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Rack</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Partation</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Status</h5>
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
                      <h5>Serial No</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Item Code</h5>
                    </div>
                    <div className="col_50p">
                      <h5 className="action_wrraper">Action</h5>
                    </div>
                  </div>
                  {material?.length > 0 ? (
                    material?.map((product, index) => {
                      return (
                        <div className="table_data" key={index}>
                          {/* <div className="col_20p">
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={product._id}
                                onChange={(e) => handleMaterialCheckboxChange(e, product._id)}
                                checked={selectedMaterials.includes(product._id)}
                                // id={product._id}
                                // onChange={(e) => handleCheckboxChange(e)}
                                // checked={selectedCheckboxes.includes(product._id)}
                                // disabled={attachedDescriptions.includes(product._id)}
                              />
                            </div>
                          </div> */}
                          <div className="col_20p">
                            <h6>{index + 1}</h6>
                          </div>
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
                                // {...register("blockId", {
                                //   required: "blockNo is required",
                                // })}
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
                                // {...register("rackId", {
                                //   required: "Rack is required",
                                // })}
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
                            {/* <h6>{product?.rackId?.rackName}</h6> */}
                          </div>
                          <div className="col_25p">
                            {/* <h6>{product?.partitionName}</h6> */}
                            <div className="position-relative">
                              <select
                                // {...register("partitionName", {
                                //   required: "Partation is required",
                                // })}
                                className="form-control custom_input"
                                style={{ width: "100%" }}
                                value={product?.partitionName}
                                onChange={(e) => handleChangeMaterial(e, index, "partitionName")}
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
                                // {...register("status", {
                                //   required: "Status is required",
                                // })}
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
                          <div className="col_25p">
                            <h6>{product?.categoryName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.brand}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.modelName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.serialNo}</h6>
                          </div>{" "}
                          <div className="col_25p">
                            <h6>{product?.itemCode}</h6>
                          </div>
                          <div className="col_50p">
                            <h6 className="action_wrraper">
                              <CustomBtn
                                name={"Consume"}
                                type="button"
                                onClick={() => handleConsumeClick(product)}
                                disabled={consumedMaterials.includes(product.materialId)}
                                style={{
                                  backgroundColor: consumedMaterials.includes(product.materialId)
                                    ? "#ccc"
                                    : "#007bff",
                                  color: consumedMaterials.includes(product.materialId)
                                    ? "#666"
                                    : "#fff",
                                  cursor: consumedMaterials.includes(product.materialId)
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                              />
                              <CustomBtn
                                name={"Return"}
                                type="button"
                                onClick={() => handleReturnClick(product)}
                                disabled={consumedMaterials.includes(product._id)}
                                style={{
                                  backgroundColor: consumedMaterials.includes(product._id)
                                    ? "#ccc"
                                    : "#007bff",
                                  color: consumedMaterials.includes(product._id) ? "#666" : "#fff",
                                  cursor: consumedMaterials.includes(product._id)
                                    ? "not-allowed"
                                    : "pointer",
                                }}
                              />
                            </h6>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <small className="text-center text-secondary p-2 small d-block">
                      Data not available
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
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
                      <h5>Cart</h5>
                    </div>
                    {/* <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllNonMaterialCheckbox"
                          onChange={handleSelectAllNonMaterials}
                          checked={allNonMaterialsSelected}
                        />
                      </div>
                    </div> */}
                    <div className="col_20p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Location</h5>
                    </div>{" "}
                    <div className="col_40p">
                      <h5>Status</h5>
                    </div>
                    <div className="col_40p">
                      <h5>Block</h5>
                    </div>
                    <div className="col_40p">
                      <h5>Rack</h5>
                    </div>
                    <div className="col_40p">
                      <h5>Partation</h5>
                    </div>
                    <div className="col_30p">
                      <h5>Category</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Brand</h5>
                    </div>
                    <div className="col_30p">
                      <h5>Model</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Serial No</h5>
                    </div>{" "}
                    <div className="col_25p">
                      <h5>Item Code</h5>
                    </div>
                    {parameterKeys.map((key, idx) => (
                      <div className="col_25p" key={idx}>
                        <h5>{key}</h5> {/* Use keys as headers */}
                      </div>
                    ))}
                    <div className="col_20p">
                      <h5 className="action_wrraper">Action</h5>
                    </div>
                  </div>
                  {nonMaterial?.length > 0 ? (
                    nonMaterial?.map((product, index) => {
                      return (
                        <div className="table_data" key={index}>
                          <div className="col_20p">
                            <FontAwesomeIcon
                              icon={faCartArrowDown}
                              onClick={() => handleAttachMaterials(product)}
                              disabled={selectedNonMaterials.length === 0}
                            />
                          </div>
                          {/* <div className="col_20p">
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={product._id}
                                onChange={(e) => handleNonMaterialCheckboxChange(e, product._id)}
                                checked={selectedNonMaterials.includes(product._id)}
                              />
                            </div>
                          </div> */}
                          <div className="col_20p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.location}</h6>
                          </div>
                          <div className="col_40p">
                            <div className="position-relative">
                              <select
                                // {...register("status", {
                                //   required: "Status is required",
                                // })}
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
                          <div className="col_40p">
                            <div className="position-relative">
                              <select
                                name="blockId"
                                className="form-control custom_input"
                                style={{ width: "100%" }}
                                value={product?.blockId}
                                onChange={(e) => handleChange(e, index, "block")}
                                disabled={!isEditing || editingIndex !== index}
                                // {...register("blockId", {
                                //   required: "blockNo is required",
                                // })}
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
                                // {...register("rackId", {
                                //   required: "Rack is required",
                                // })}
                                value={product?.rack}
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
                            {/* <h6>{product?.rackId?.rackName}</h6> */}
                          </div>
                          <div className="col_40p">
                            {/* <h6>{product?.partitionName}</h6> */}
                            <div className="position-relative">
                              <select
                                // {...register("partitionName", {
                                //   required: "Partation is required",
                                // })}
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
                          <div className="col_30p">
                            <h6>{product?.categoryName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.brand}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{product?.modelName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.serialNo}</h6>
                          </div>{" "}
                          <div className="col_25p">
                            <h6>{product?.itemCode}</h6>
                          </div>
                          {product.parameter.map((m, indexTwo) => (
                            <div className="col_25p" key={indexTwo}>
                              <InputBox
                                value={m.value || ""}
                                onChange={(e) => {
                                  // setNonMaterial((prev)=>[...prev,parameter:[]])
                                  handleChangeParameter(e, index, indexTwo, m);
                                }}
                                disabled={!isEditing || editingIndex !== index}
                              />
                            </div>
                          ))}
                          <div className="col_20p">
                            {isEditing && editingIndex === index ? (
                              <h6 className="action_wrraper">
                                <CustomBtn
                                  name={"Save"}
                                  type="button"
                                  onClick={() => handleSaveClick(index)}
                                  // onClick={() => updateMaterial(index)}
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
                        </div>
                      );
                    })
                  ) : (
                    <small className="text-center text-secondary p-2 small d-block">
                      Data not available
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <div className="form_list_layout_wrapper my-4">
        <div className="d-flex align-items-center justify-content-between">
          <p>Cart Item</p>
        </div>
        {/* table */}
        <div className="table_wrapper my-3">
          <div className="table_main">
            <div className="table_section pi_product_table" style={{ minWidth: "1000px" }}>
              <div className="table_header">
                <div className="col_20p">
                  <div className="check_box">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </div>
                <div className="col_25p">
                  <h5>Sr. No.</h5>
                </div>
                {parameterKeys.map((key, idx) => (
                  <div className="col_25p" key={idx}>
                    <h5>{key}</h5> {/* Use keys as headers */}
                  </div>
                ))}
                {/* <div className="col_25p">
                  <h5>Category</h5>
                </div>
                <div className="col_25p">
                  <h5>Brand</h5>
                </div>
                <div className="col_25p">
                  <h5>Model</h5>
                </div>
                <div className="col_25p">
                  <h5>Serial No</h5>
                </div>
                <div className="col_20p">
                  <h5>Item Code</h5>
                </div> */}
                <div className="col_40p">
                  <h5>Status</h5>
                </div>
                {/* <div className="col_40p">
                  <h5>Block</h5>
                </div>
                <div className="col_40p">
                  <h5>Rack</h5>
                </div>
                <div className="col_40p">
                  <h5>Partation</h5>
                </div> */}
                <div className="col_35p">
                  <h5>Action</h5>
                </div>
              </div>
              {cartItems?.length > 0 ? (
                cartItems?.map((item, index) => {
                  console.log(cartItems, "cartItems");
                  return (
                    <div className="table_data" key={index}>
                      <div className="col_20p">
                        {" "}
                        <div className="check_box">
                          <input className="form-check-input" type="checkbox" />
                        </div>
                      </div>
                      <div className="col_25p">
                        <h6>{index + 1}</h6>
                      </div>
                      {item?.parameter?.map((m, indexTwo) => (
                        <div className="col_25p" key={indexTwo}>
                          {console.log(m, "mmmmmm")}

                          <h6>{m.value || ""}</h6>
                        </div>
                      ))}
                      {/* <div className="col_25p">
                        <h6>{item?.categoryName}</h6>
                      </div>

                      <div className="col_25p">
                        <h6>{item?.brand}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{item?.modelName}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{item?.serialNo}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{item?.itemCode}</h6>
                      </div> */}
                      <div className="col_40p">
                        <div className="position-relative">
                          <select
                            value={item?.status}
                            onChange={(e) => handleChange(e, index, "status")}
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
                      {/* <div className="col_40p">
                        <div className="position-relative">
                          <select
                            name="blockId"
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                            value={item?.block}
                            onChange={(e) => handleChange(e, index, "block")}
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
                      </div> */}
                      {/* <div className="col_40p">
                        <div className="position-relative">
                          <select
                            
                            value={item?.rack}
                            onChange={(e) => handleChange(e, index, "rack")}
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Rack
                            </option>
                            {racks[item.block]?.map((rack, idx) => (
                              <option value={rack._id} key={idx}>
                                {rack.rackName}
                              </option>
                            ))}
                          </select>
                          <div className="select_box_arrow">
                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                          </div>
                        </div>
                      </div> */}
                      {/* <div className="col_40p">
                        <div className="position-relative">
                          <select
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                            value={item?.partitionName}
                            onChange={(e) => handleChange(e, index, "partitionName")}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Partation
                            </option>
                            {rackPartation[item.rack]
                              ? rackPartation[item.rack].map((partition, idx) => (
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
                      </div> */}
                      <div className="col_35p">
                        <h6 className="action_wrraper">
                          <button
                            className="actionbtn sell_btn"
                            onClick={() => {
                              handleDumpClick();
                              setRespondHandlerModalState({ state: true, id: item._id });
                            }}
                          >
                            Dump
                          </button>
                          {/* <button
                            className="actionbtn sell_btn"
                            // onClick={() => showInputDialog(materialDetails._id)}
                          >
                            Store
                          </button> */}
                        </h6>
                      </div>
                    </div>
                  );
                })
              ) : (
                <small className="text-center text-secondary p-2 small d-block">
                  {/* {console.log(NonMaterialId, "NonMaterialId")} */}
                  Data not available
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ---------------------------attached material end----------------------------------------------------------*/}

      {/* ---------------------------send attached material----------------------------------------------------------*/}
      <div className="d-flex align-items-center justify-content-center gap-3 my-3">
        {/* <Button
          className="btn-success"
          name={"Accept Material"}
          onClick={() => {
            router.push(
              `/dashboard/stock-management/accept-material/accept-material-model?stockId=${NonMaterialId}`
            );
          }}
        ></Button> */}
        {/* <Button className="btn-success" name={"Reject Material"}></Button> */}
        <Button
          className="btn-success"
          name={"Accept"}
          type="button"
          onClick={acceptMaterial}
        ></Button>
        <Button
          className="btn-success"
          name={"Reject"}
          onClick={(e) => rejectMaterial(rejectItem, "reject")}
        ></Button>
      </div>
    </>
  );
};

export default AcceptMaterial;
