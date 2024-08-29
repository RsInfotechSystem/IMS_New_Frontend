"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import {
  getBrandWiseModel,
  getCategory,
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
import SelectBox from "@/common-components/Select";
import ColorBox from "@/utilities/colorBox";
import InputBoxOnChange from "@/common-components/InputBoxOnChange";

const AcceptMaterial = () => {
  const router = useRouter();
  const [nonMaterial, setNonMaterial] = useState([]);
  const params = useSearchParams();
  const [loader, setLoader] = useState(false);
  const [material, setMaterial] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [allMaterialsSelected, setAllMaterialsSelected] = useState(false);
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
  const [cartSelectOption, setCartSelectOption] = useState({});
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [cardDataToMap, setCardDataToMap] = useState({
    block: {
      0: [],
    },
    rack: {
      0: [],
    },
    partition: {
      0: [],
    },
    brand: {
      0: [],
    },
    parameter: {
      0: [],
    },
    model: {
      0: [],
    },
  });
  const [_parameter, __setParameter] = useState([]);
  const [model, setModel] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [dumpMaterial, setDumpMaterial] = useState([]);
  const [_category, _setCategory] = useState("");
  const [isChangeLocationChecked, setIsChangeLocationChecked] = useState("");
  const [isChangeLocationCheckedMaterial, setIsChangeLocationCheckedMaterial] = useState("");
  const [rowSelectionsMaterial, SetRowSelectionsMaterial] = useState({});
  const [brandsData, setBrandsData] = useState([]);
  const [isStoreSelected, setIsStoreSelected] = useState(false);
  const [rowData, setRowData] = useState([{ blocks: [], racks: [], partitions: [] }]);
  const [dumpCount, setDumpCount] = useState(0);
  const [storeCount, setStoreCount] = useState(0);
  const [partitions, setPartitions] = useState([]);
  const [_cartParameter, _setCartParameter] = useState([]);
  const [rowSelections, setRowSelections] = useState({});
  const [rowCategories, setRowCategories] = useState({});
  const [rowParameters, setRowParameters] = useState({});
  const [savedDump, seSaveDump] = useState([]);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [cartData, setCartData] = useState([]);
  const { register, handleSubmit, setValue, watch, getValues } = useForm({
    defaultValues: {
      rows: [
        {
          serialNo: "",
          itemCode: "",
          quantity: "",
          categoryId: "",
          brandId: "",
          modelId: "",
          parameter: "",
          // selection: "",
          locationId: "",
          blockId: "",
          rackId: "",
          partitionName: "",
          conditionType: "",
          status: "",
        },
      ],
    },
  });
  const categoryId = watch("categoryId");
  const rack = watch("blockId");
  const _rackIdForPrtn = watch("rackId");
  const locationCart = watch("locationIdCart");
  const rows = watch("rows");
  // ------------------------ACCEPT MATERIAL------------------------------------------
  const acceptMaterial = async (index) => {
    try {

      if (savedMaterials.length === 0 && savedDump.length === 0 && consumedMaterials.length === 0 && rows.length <= 1) {
        toast.info("Please add material for Accept");
        return
      } else {
        setLoader(true);
        const dataToSend = {
          jobNo: params.get("jobId"),
          material:
            savedMaterials.filter((ele) => {
              if (ele.materialStatus) {
                delete ele.materialStatus;
                return ele;
              }
            }) ?? [],
          dump: [
            ...savedDump.map((ele) => ({
              materialId: ele.materialId,
              categoryId: ele.categoryId,
              parameterId: ele.parameterId,
              parameter: ele.parameter,
            })),
            ...rows?.filter((ele) => ele.type === "dump"),
          ],
          consume: consumedMaterials?.map((ele) => ({ materialId: ele })) ?? [],
          addToCart:
            rows?.filter((ele) => {
              if (ele.type === "store") {
                delete ele.type;
                return ele;
              }
            }) ?? [],
        };
        let response = await communication.updateStockBeforeAccept(dataToSend);
        if (response?.data?.status === "SUCCESS") {
          toast.success(response?.data?.message, { autoClose: 1500 });
          // acceptMaterial();
          setLoader(false);
          router.push("/dashboard/stock-management");
        } else if (response?.data?.status === "JWT_INVALID") {
          toast.info(response.data.message, { autoClose: 1500 });
          router.push("/");
        } else if (response?.data?.status == "FAILED") {
          toast.info(response?.data?.message, { autoClose: 1500 });
        } else {
          toast.info(response.data.message, { autoClose: 1500 });
        }
      }
      setLoader(false);
    }
    catch (error) {
      toast.info(error?.response?.data?.message || error.message, { autoClose: 1500 });

      setLoader(false);
    }
  };
  // ------------------------Retuned MATERIAL data List------------------------------------------
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
            status: material.stockStatus || "",
            itemCode: material.itemCode || "",
            serialNo: material.serialNo || "",
            parameter: material.parameter,
            // taskStatus: material.taskStatus || "",
            // parameter: material.parameter
            //   ? Object.entries(material.parameter).map(([key, value]) => ({ key, value }))
            //   : [],
            quantity: material.quantity || 1,
            // taskStatus: material.taskStatus || "",
            materialStatus: material.materialStatus || "",
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
            // taskStatus: material.taskStatus || "",
            quantity: material.quantity || 1,
            status: material.stockStatus || "",
            // taskStatus: material.taskStatus || "",
            materialStatus: material.materialStatus || "",
          }));

          setMaterial(allMaterials);
        }

        // toast.success(serverResponse.data.message, { autoClose: 1500 });
      } else if (serverResponse?.data?.status === "FAILED") {
        // toast.info(serverResponse.data.message);
        setMaterial([]);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message, { autoClose: 1500 });
        router.push("/");
        setLoader(false);
      } else {
        // toast.info(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message, { autoClose: 1500 });
      setLoader(false);
    }
  }
  useEffect(() => {
    returnedMaterialByJobNo();
  }, []);
  // ------------------------Retuned MATERIAL data List  end------------------------------------------
  // ------------------------Reject material------------------------------------------

  const rejectMaterial = async (remark) => {
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
        toast.success(response?.data?.message, { autoClose: 1500 });
        // fetchReturnMaterialList(1, searchString);
        router.push("/dashboard/stock-management");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message, { autoClose: 1500 });
        router.push("/");
      } else {
        toast.info(response?.data?.message, { autoClose: 1500 });
      }
      setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message, { autoClose: 1500 });

      setLoader(false);
    }
  };
  const cancelHandler = () => {
    setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
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
          toast.info("Remark required if you want to reject.", { autoClose: 1500 });
        }
      }
    });
  };
  // ------------------------Reject material------------------------------------------

  // ------------------------Non-material handle change------------------------------------------
  const handleChange = (e, index, field) => {
    const { value } = e.target;
    setNonMaterial((prevList) =>
      prevList.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };
  const handleChangeMaterial = (e, index, field, product) => {
    var { value } = e.target;
    if (rowSelections[product.materialId] == "Dump") {
      savedDump((prevList) =>
        prevList.map((item, idx) =>
          item.materialId === product.materialId ? { ...item, [field]: e.target.value } : item
        )
      );
    } else {
      setMaterial((prevList) =>
        prevList.map((item, idx) =>
          item.materialId === product.materialId ? { ...item, [field]: e.target.value } : item
        )
      );
      setSavedMaterials((prevList) =>
        prevList.map((item, idx) =>
          item.materialId === product.materialId ? { ...item, [field]: e.target.value } : item
        )
      );
    }
  };
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
  const handleEditClick = (index) => {
    setIsEditing(true);
    setEditingIndex(index);
  };
  const handleSaveClick = (index, product) => {
    if (rowSelections[product.materialId] == "Dump") {
      const materialToDump = {
        ...nonMaterial[index],
        // consume: consumedMaterials, // Add the consumed material IDs to the save payload
      };
      seSaveDump((prevMaterials) => [...prevMaterials, materialToDump]);
    } else {
      const materialToSave = {
        ...nonMaterial[index],
        // consume: consumedMaterials, // Add the consumed material IDs to the save payload
      };
      setSavedMaterials((prevMaterials) => [...prevMaterials, materialToSave]);
    }

    // Clear the consumedMaterials state after saving
    setConsumedMaterials([]);
    setIsEditing(false);
    setEditingIndex(null);
  };
  // ------------------------Non-material handle change end------------------------------------------

  // -----------------------------Material Checkbox-----------------------------------
  const handleSelectAllMaterials = (e) => {
    const isChecked = e.target.checked;
    setAllMaterialsSelected(isChecked);
    if (isChecked) {
      setSelectedMaterials(material.map((item) => item?.materialId));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleMaterialCheckboxChange = (materialId) => {
    setSelectedMaterials((prevSelected) => {
      let updatedSelected;

      if (prevSelected.includes(materialId)) {
        updatedSelected = prevSelected.filter((id) => id !== materialId);
      } else {
        updatedSelected = [...prevSelected, materialId];
      }

      // Update "Select All" checkbox
      setAllMaterialsSelected(updatedSelected.length === material.length);

      return updatedSelected;
    });
  };
  // consume click handler
  const handleConsumeClick = () => {
    setConsumedMaterials(selectedMaterials);
    toast.success("Materials consume.");
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
  const handleRadioChangeMaterial = (materialId, value, materialObj) => {
    if (value == "Dump") {
      seSaveDump((pevState) => [...pevState, materialObj]);
    } else {
      setSavedMaterials((pevState) => [...pevState, materialObj]);
    }
    SetRowSelectionsMaterial((prevSelections) => ({
      ...prevSelections,
      [materialId]: value,
    }));
  };
  // -----------------------------Material Checkbox end-----------------------------------
  // -----------------------------CART MATERIAL SECTION-----------------------------------

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

  // const handleReturnClick = (material) => {
  //   // console.log("Material to Return:", material);
  //   // Add the returned material to the savedMaterials state as an object
  //   if (!material.status || material.status === "") {
  //     // You can customize this message or alert as needed
  //     alert("Please select a status before returning the material.");
  //     return; // Prevent the function from executing further
  //   }
  //   const materialToReturn = {
  //     ...material,
  //     materialStatus: "RETURNED", // Update status or any other property if needed
  //   };
  //   setDisabledButtons((prevState) => ({
  //     ...prevState,
  //     [material.materialId]: true,
  //   }));
  //   setMaterialToReturn(materialToReturn);
  //   setSavedMaterials((prevMaterials) => [...prevMaterials, materialToReturn]);
  // };

  // const handleDumpClick = () => {
  //   // Extract the IDs from each nonMaterial item
  //   const materialIds = nonMaterial.map((material) => material._id);
  //   // Update the savedMaterials state with the array of IDs
  //   setDumpMaterial((prevMaterials) => [...prevMaterials, ...materialIds]);
  // };
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

  const handleRadioChange = (materialId, selection) => {
    const previousSelection = rowSelections[materialId];

    // Update rowSelections state here
    setRowSelections((prev) => ({
      ...prev,
      [materialId]: selection,
    }));

    // Update counts based on selection
    if (selection === "Dump") {
      if (previousSelection !== "Dump") {
        setDumpCount((prevCount) => prevCount + 1);
        if (previousSelection === "Store") {
          setStoreCount((prevCount) => prevCount - 1);
        }
      }
    } else if (selection === "Store") {
      if (previousSelection !== "Store") {
        setStoreCount((prevCount) => prevCount + 1);
        if (previousSelection === "Dump") {
          setDumpCount((prevCount) => prevCount - 1);
        }
      }
    }
  };

  useEffect(() => {
    getParameter(setLoader, router, setCategoryMapData);
  }, []);

  useEffect(() => {
    Object.entries(rowCategories).forEach(([index, categoryId]) => {
      if (categoryId) {
        const parameterDetails = CategoryMapData.find((ele) => ele._id === categoryId);
        setValue(`parameterId_${index}`, parameterDetails?._id);

        setRowParameters((prev) => ({
          ...prev,
          [index]: parameterDetails?.parameter ?? [],
        }));
      } else {
        setRowParameters((prev) => ({ ...prev, [index]: [] }));
        setValue(`parameterId_${index}`, "");
      }
    });
  }, [rowCategories, CategoryMapData]);

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
  const handleAddRow = () => {
    const newMaterial = {
      categoryId: "",
      parameter: {},
      parameterId: "",
      // selection: "",
      locationId: "",
      blockId: "",
      rackId: "",
      partitionName: "",
      status: "",
      blocks: [],
      racks: [],
      partitions: [],
      quantity: "",
    };

    setValue("rows", [...rows, newMaterial]);
    // setR((prevCartTable) => [...prevCartTable, newMaterial]);
  };


  // ______________________NEW___________________

  const handleCategoryChange = async (index, categoryId) => {

    setValue(`rows[${index}].categoryId`, categoryId);
    const fetchedBrand = await getCategoryWiseBrand(categoryId, setLoader, router, setBrandsData);

    setBrandsData(fetchedBrand);
    if (categoryId) {
      const parameterDetails = CategoryMapData?.find((ele) => ele?.categoryId === categoryId);
      setCardDataToMap((pre) => ({
        ...pre,
        brand: {
          ...pre.brand,
          [`${index}`]: fetchedBrand ?? [],
        },
        parameter: {
          ...pre.parameter,
          [`${index}`]: parameterDetails?.parameter ?? [],
        },
        model: {
          ...pre.model,
          [`${index}`]: [],
        },
      }));
      _setCartParameter(parameterDetails.parameter);
      // Update the parameter value for the row
      setValue(`rows[${index}].parameterId`, parameterDetails?._id ?? "");
    } else {
      setCardDataToMap((pre) => ({
        ...pre,
        brand: {
          ...pre.brand,
          [`${index}`]: [],
        },
        parameter: {
          ...pre.parameter,
          [`${index}`]: [],
        },
        model: {
          ...pre.model,
          [`${index}`]: [],
        },
      }));
      setValue(`rows[${index}].parameterId`, "");
    }

    // Reset dependent fields
    // setValue(`rows[${index}].model`, "");
  };

  const handleBrandChange = async (index, brandId) => {
    setValue(`rows[${index}].brandId`, brandId);
    if (brandId) {
      const fetchedModel = await getBrandWiseModel(brandId, setLoader, router, setModel, true);
      setModel(fetchedModel);
      setCardDataToMap((pre) => ({
        ...pre,
        model: {
          ...pre.model,
          [`${index}`]: fetchedModel ?? [],
        },
      }));
    } else {
      setCardDataToMap((pre) => ({
        ...pre,
        model: {
          ...pre.model,
          [`${index}`]: [],
        },
      }));
    }

    // Reset dependent fields
    // setValue(`rows[${index}].modelId`, "");
  };
  // useEffect(() => {
  //   // Update parameters for each row based on the categoryId
  //   rows.forEach((row, index) => {
  //     console.log(row, "row");

  //     const categoryId = row.categoryId;
  //     if (categoryId) {
  //       const parameterDetails = CategoryMapData.find((ele) => ele._id === categoryId);

  //       setValue(`rows[${index}].parameter`, parameterDetails?.parameter ?? []);
  //     } else {
  //       setValue(`rows[${index}].parameter`, []);
  //     }
  //   });
  // }, [rows, CategoryMapData]);

  useEffect(() => {
    // Function to fetch initial location data
    const fetchInitialLocations = async () => {
      const initialLocations = await getLocations(setLoader, router, setLocationList, true);
      setLocationList(initialLocations);
    };

    fetchInitialLocations();
  }, []); // Empty dependency array ensures this runs only on the first render

  // Handle location change and fetch dependent blocks
  const handleLocationChange = async (index, locationId) => {
    setValue(`rows[${index}].locationId`, locationId);
    let fetchedBlocks = [];
    if (locationId) {
      fetchedBlocks = await getLocationWiseBlock(
        locationId,
        setLoader,
        router,
        setBlocksCart,
        true
      );
    }
    setCardDataToMap((pre) => ({
      ...pre,
      block: {
        ...pre.block,
        [`${index}`]: fetchedBlocks ?? [],
      },
      rack: {
        ...pre.rack,
        [`${index}`]: [],
      },
      partition: {
        ...pre.partition,
        [`${index}`]: [],
      },
    }));

    // Reset dependent fields
    setValue(`rows[${index}].blockId`, "");
    setValue(`rows[${index}].rackId`, "");
    setValue(`rows[${index}].partitionName`, "");
  };
  // Handle block change and fetch dependent racks
  const handleBlockChange = async (index, blockId) => {
    setValue(`rows[${index}].blockId`, blockId);
    const fetchedRacks = cardDataToMap?.block[`${index}`]?.find((ele) => ele?._id === blockId);
    setCartRacks(fetchedRacks?.rackId ?? []);
    setCardDataToMap((pre) => ({
      ...pre,
      rack: {
        ...pre.rack,
        [`${index}`]: fetchedRacks?.rackId ?? [],
      },
      partition: {
        ...pre.partition,
        [`${index}`]: [],
      },
    }));

    // Reset dependent fields
    setValue(`rows[${index}].rackId`, "");
    setValue(`rows[${index}].partitionName`, "");
  };

  // Handle rack change and fetch dependent partitions
  const handleRackChange = async (index, rackId) => {
    let fetchedPartitions = [];
    if (rackId) {
      fetchedPartitions = await getRackPartation(rackId, setLoader, router, setPartitions, true);
    }

    setPartitions(fetchedPartitions);
    setCardDataToMap((pre) => ({
      ...pre,
      partition: {
        ...pre.partition,
        [`${index}`]: fetchedPartitions ?? [],
      },
    }));

    // Reset dependent field
    setValue(`rows[${index}].rackId`, rackId);
    setValue(`rows[${index}].partitionName`, "");
  };
  useEffect(() => {
    // Function to fetch initial location data
    const fetchInitialCategory = async () => {
      const initialCategory = await getParameter(setLoader, router, setCategoryMapData, true);
      setCategoryMapData(initialCategory);
    };

    fetchInitialCategory();
  }, []);
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

        <div className="form_layout">
          <ColorBox />
          {/* ------------------------NON MATERIAL LIST START----------------------------------------------- */}
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Non-Material List</p>
            </div>
            {/* table  */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                <div
                  className="table_section pi_product_table"
                  style={{
                    minWidth: nonMaterial.some(
                      (product) => rowSelections[product.materialId] === "Store"
                    )
                      ? "2500px"
                      : isAnyCheckboxChecked()
                        ? "2100px"
                        : "2000px",
                  }}
                >
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
                      <h5>Box NO</h5>
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
                      <h5 style={{ textAlign: "center" }}>Status</h5>
                    </div>
                    <div className="col_40p">
                      <h5 className="action_wrraper">Change Location</h5>
                    </div>
                    {isAnyCheckboxChecked() ? (
                      <>
                        <div className="col_40p">
                          <h5 className="action_wrraper">Change Area</h5>
                        </div>
                        {nonMaterial?.some(
                          (product) => rowSelections[product.materialId] === "Store"
                        ) ? (
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
                        ) : (
                          <>
                            <div className="col_25p"></div>
                            <div className="col_40p"></div>
                            <div className="col_40p"></div>
                            <div className="col_40p"></div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Render Blank Columns */}
                        <div
                          className="col_40p"
                          style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                        ></div>
                        <div
                          className="col_25p"
                          style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                        ></div>
                      </>
                    )}
                  </div>
                  {nonMaterial?.length > 0 ? (
                    nonMaterial?.map((product, index) => {
                      const statusClass =
                        product?.materialStatus === "accepted"
                          ? "status-accepted"
                          : product?.materialStatus === "returned"
                            ? "status-returned"
                            : "status-assigned";
                      return (
                        <div className={`table_data ${statusClass}`} key={index}>
                          <div className="col_20p">
                            {product?.materialStatus === "accepted" ||
                              product?.materialStatus === "assigned" ? (
                              ""
                            ) : (
                              <>
                                {" "}
                                {isEditing && editingIndex === index ? (
                                  <h6 className="action_wrraper">
                                    <CustomBtn
                                      name={"Save"}
                                      type="button"
                                      // rowSelections[product.materialId] === "Dump"}
                                      onClick={() => handleSaveClick(index, product)}
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
                                      // onClick={() =>
                                      //   product.materialStatus === "accepted"
                                      //     ? disabled
                                      //     : handleEditClick(index)
                                      // }
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
                              </>
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
                          {/* <div className="col_85p">
                            <div className="input_scroll ">
                              {Object.entries(product?.parameter).map(([key, value], indexTwo) => (
                                <div
                                  className="col_60p"
                                  key={indexTwo}
                                  style={{ display: "block" }}
                                >
                                  <label>{key}</label>
                                  <InputBox
                                    className="custom_input"
                                    value={value} // Set the input value to the corresponding value from the object
                                    onChange={(e) =>
                                      handleChangeParameter(e, index, indexTwo, { key, value })
                                    }
                                    disable={!isEditing || editingIndex !== index} // Disable based on edit state
                                  />
                                </div>
                              ))}
                            </div>
                          </div> */}
                          <div className="col_85p">
                            <div className="input_scroll" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                              {Object.entries(product?.parameter).map(([key, value], indexTwo) => (
                                <div
                                  className="col_60p"
                                  key={indexTwo}
                                  style={{ display: "inline-block", minWidth: "150px" }} // Ensure the div takes up enough space to allow scrolling
                                >
                                  <label>{key}</label>
                                  <InputBoxOnChange
                                    className="custom_input"
                                    value={value} // Set the input value to the corresponding value from the object
                                    onChange={(e) =>
                                      handleChangeParameter(e, index, indexTwo, { key, value })
                                    }
                                    disable={!isEditing || editingIndex !== index} // Disable based on edit state
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* <div className="col_85p">
                            <div className="input_scroll">
                              <div className="custom_input_wrapper">  <input className=" custom_input" style={{ lineHeight: 2.2 }}></input></div>
                            </div>
                          </div> */}
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
                                {stockStatus?.map((ele, index) => {
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
                              <label htmlFor={`changeLocationCheckbox-${product.materialId}`}>
                                Yes
                              </label>
                            </div>
                          </div>
                          {isChangeLocationChecked[product?.materialId] ? (
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
                              {rowSelections[product.materialId] === "Store" ? (
                                <>
                                  <div className="col_25p">
                                    <h6>{product?.location}</h6>
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
                                        {blocks?.map((block, idx) => {
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
                                          ? rackPartation[product.rackId]?.map((partition, idx) => (
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
                              ) : (
                                <>
                                  <div className="col_25p"></div>
                                  <div className="col_40p"></div>
                                  <div className="col_40p"></div>
                                  <div className="col_40p"></div>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Render Blank Columns */}
                              <div
                                className="col_40p"
                                style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                              ></div>
                              <div
                                className="col_25p"
                                style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                              ></div>
                              <div
                                className="col_40p"
                                style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                              ></div>
                              <div
                                className="col_40p"
                                style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                              ></div>
                              <div
                                className="col_40p"
                                style={{ display: `${isChangeLocationChecked ? "block" : "none"}` }}
                              ></div>
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
          {/* ------------------------NON MATERIAL LIST END----------------------------------------------- */}
          {/* ------------------------MATERIAL LIST START----------------------------------------------- */}
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
                    <div className="col_7p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Serial No</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Box NO</h5>
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
                    {isAnyCheckboxCheckedMaterial() ? (
                      <>
                        <div className="col_40p">
                          <h5 className="action_wrraper">Change Area</h5>
                        </div>
                        {material?.some(
                          (product) => rowSelectionsMaterial[product.materialId] === "Store"
                        ) ? (
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
                        ) : (
                          <>
                            {/* Render Blank Columns */}
                            {/* <div className="col_40p"></div>/ */}
                            <div className="col_25p"></div>
                            <div className="col_25p"></div>
                            <div className="col_25p"></div>
                            <div className="col_25p"></div>
                            <div className="col_25p"></div>
                            {/* <div className="col_40p"></div>
                            <div className="col_40p"></div>
                            <div className="col_40p"></div> */}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Render Blank Columns */}
                        <div
                          className="col_40p"
                          style={{
                            display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                          }}
                        ></div>
                        <div
                          className="col_25p"
                          style={{
                            display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                          }}
                        ></div>
                      </>
                    )}
                  </div>
                  {material?.length > 0 ? (
                    material?.map((product, index) => {

                      const statusClass =
                        product?.materialStatus === "accepted"
                          ? "status-accepted"
                          : product.materialStatus === "returned"
                            ? "status-returned"
                            : "status-assigned";
                      const isDisabled = consumedMaterials.includes(product.materialId);
                      return (
                        <div
                          className={`table_data ${statusClass} ${isDisabled ? "row-disabled" : ""
                            }`}
                          key={index}
                        >
                          <div className="col_20p">
                            {product?.materialStatus === "accepted" ||
                              product?.materialStatus === "assigned" ? (
                              ""
                            ) : (
                              <div className="check_box">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  key={product.materialId}
                                  checked={selectedMaterials.includes(product.materialId)}
                                  onChange={() => handleMaterialCheckboxChange(product.materialId)}
                                  disabled={isDisabled}
                                />
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
                            <div className="input_scroll" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                              {Object?.entries(product?.parameterMaterial)?.map(
                                ([key, value], indexOne) => (
                                  <div
                                    className="col_60p"
                                    key={indexOne}
                                    style={{ display: "inline-block", minWidth: "150px" }}
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
                                disabled={isDisabled}
                              // onClick={() => handleEditClick(index)}
                              />
                              <label
                                htmlFor={`changeLocationCheckboxMaterial-${product.materialId}`}
                              >
                                Yes
                              </label>
                            </div>
                          </div>
                          {isChangeLocationCheckedMaterial[product?.materialId] ? (
                            <>
                              <div className="col_40p">
                                <div className="check_box me-1" style={{ gap: "0" }}>
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name={`selection-${product.materialId}`}
                                    id={`dumpRadioMaterial-${product.materialId}`}
                                    onChange={() =>
                                      handleRadioChangeMaterial(product.materialId, "Dump", product)
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
                                      handleRadioChangeMaterial(
                                        product.materialId,
                                        "Store",
                                        product
                                      )
                                    }
                                    checked={rowSelectionsMaterial[product.materialId] === "Store"}
                                  />
                                  <label htmlFor={`storeRadio-${product.materialId}`}>Store</label>
                                </div>
                              </div>
                              {rowSelectionsMaterial[product.materialId] === "Store" ? (
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
                                        onChange={(e) =>
                                          handleChangeMaterial(
                                            e,
                                            index,
                                            "blockId",
                                            product,
                                            "blockName"
                                          )
                                        }
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Block
                                        </option>
                                        {blocks?.map((block, idx) => {
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
                                        onChange={(e) =>
                                          handleChangeMaterial(e, index, "rackId", product)
                                        }
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
                                          handleChangeMaterial(e, index, "partitionName", product)
                                        }
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Partation
                                        </option>
                                        {rackPartation[product.rackId]
                                          ? rackPartation[product.rackId]?.map((partition, idx) => (
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
                                        onChange={(e) =>
                                          handleChangeMaterial(e, index, "status", product)
                                        }
                                        className="form-control custom_input"
                                        style={{ width: "100%" }}
                                      >
                                        <option value="" className="text-secondary text-lowercase">
                                          Select Status
                                        </option>
                                        {stockStatus?.map((ele, index) => {
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
                              ) : (
                                <>
                                  {/* Render Blank Columns */}
                                  {/* <div className="col_40p"></div> */}
                                  <div className="col_25p"></div>
                                  <div className="col_25p"></div>
                                  <div className="col_25p"></div>
                                  <div className="col_25p"></div>
                                  <div className="col_25p"></div>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <div
                                className="col_40p"
                                style={{
                                  display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                                }}
                              ></div>
                              <div
                                className="col_25p"
                                style={{
                                  display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                                }}
                              ></div>
                              <div
                                className="col_40p"
                                style={{
                                  display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                                }}
                              ></div>
                              <div
                                className="col_40p"
                                style={{
                                  display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                                }}
                              ></div>
                              <div
                                className="col_40p"
                                style={{
                                  display: `${isChangeLocationCheckedMaterial ? "block" : "none"}`,
                                }}
                              ></div>
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
          {/* ------------------------MATERIAL LIST END----------------------------------------------- */}
        </div>
      </form>
      {/* ------------------------CART LIST START----------------------------------------------- */}

      <div className="form_list_layout_wrapper my-4">
        <div className="d-flex align-items-center justify-content-between">
          <p>Cart Item</p>
          <div className="search_btn_wrapper">
            <div className="buttons_wrapper">
              <CustomBtn
                name={"Add New"}
                type="button"
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
        {dumpCount > 0 && (
          <div>
            <p>Total Dump count is {dumpCount} ... You need to add that in cart</p>
          </div>
        )}

        {/* -------------------------------------------new------------------------------- */}
        <div className="table_wrapper my-3">
          <div className="table_main">
            <form>
              <div
                className="table_section pi_product_table"
                style={{
                  minWidth: Object.values(cartSelectOption).includes("store") ? "2500px" : "1500px",
                }}
              >
                <div className="table_header">
                  <div className="col_7p">
                    <h5>Sr. No.</h5>
                  </div>
                  <div className="col_40p">
                    <h5 style={{ textAlign: "center" }}>Serial No</h5>
                  </div>
                  <div className="col_40p">
                    <h5 style={{ textAlign: "center" }}>Box NO</h5>
                  </div>
                  <div className="col_40p">
                    <h5 style={{ textAlign: "center" }}>Quantity</h5>
                  </div>
                  <div className="col_40p">
                    <h5 style={{ textAlign: "center" }}>Category</h5>
                  </div>
                  <div className="col_40p">
                    <h5 style={{ textAlign: "center" }}>Brand</h5>
                  </div>
                  <div className="col_40p">
                    <h5 style={{ textAlign: "center" }}>Model</h5>
                  </div>
                  <div className="col_85p">
                    <div className="input_scroll" style={{ scrollbarWidth: "none" }}>
                      <h5 style={{ textAlign: "center" }}>Parameter</h5>
                    </div>
                  </div>
                  <div className="col_40p">
                    <h5 className="action_wrraper" style={{ textAlign: "center" }}>
                      Change Area
                    </h5>
                  </div>
                  {/* {watch(`rows.type`) === "store" && ( */}
                  {Object?.values(cartSelectOption)?.includes("store") ? (
                    <>
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
                        <h5 style={{ textAlign: "center" }}>Condition Type</h5>
                      </div>
                      <div className="col_40p">
                        <h5 style={{ textAlign: "center" }}>Status</h5>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Render Blank Columns */}
                      <div
                        className="col_40p"
                        style={{
                          display: `${Object?.values(cartSelectOption).includes("store") ? "block" : "none"
                            }`,
                        }}
                      ></div>
                      <div
                        className="col_40p"
                        style={{
                          display: `${Object?.values(cartSelectOption)?.includes("store") ? "block" : "none"
                            }`,
                        }}
                      ></div>
                      <div
                        className="col_40p"
                        style={{
                          display: `${Object?.values(cartSelectOption)?.includes("store") ? "block" : "none"
                            }`,
                        }}
                      ></div>
                      <div
                        className="col_40p"
                        style={{
                          display: `${Object?.values(cartSelectOption)?.includes("store") ? "block" : "none"
                            }`,
                        }}
                      ></div>
                      <div
                        className="col_40p"
                        style={{
                          display: `${Object?.values(cartSelectOption)?.includes("store") ? "block" : "none"
                            }`,
                        }}
                      ></div>
                      <div
                        className="col_40p"
                        style={{
                          display: `${Object?.values(cartSelectOption)?.includes("store") ? "block" : "none"
                            }`,
                        }}
                      ></div>
                    </>
                  )}

                  {/* // )} */}
                </div>
                {rows?.map((row, index) => (
                  <div className="table_data" key={index}>
                    <div className="col_7p">
                      <h6>{index + 1}</h6>
                    </div>
                    <div className="col_40p">
                      <h6>
                        <input
                          {...register(`rows[${index}].serialNo`)}
                          placeholder="Enter Serial No"
                          className="form-control"
                        />
                      </h6>
                    </div>
                    <div className="col_40p">
                      <h6>
                        <input
                          {...register(`rows[${index}].itemCode`)}
                          placeholder="Enter Box NO"
                          className="form-control"
                        />
                      </h6>
                    </div>
                    <div className="col_40p">
                      <h6>
                        <input
                          {...register(`rows[${index}].quantity`)}
                          placeholder="Enter quantity"
                          className="form-control"
                        />
                      </h6>
                    </div>
                    <div className="col_40p">
                      {/* <h6> */}
                      <div className="position-relative">
                        <select
                          {...register(`rows[${index}].categoryId`)}
                          value={watch(`rows[${index}].categoryId`) || ""}
                          onChange={(e) => handleCategoryChange(index, e.target.value)}
                          className="form-control custom_input"
                          style={{ width: "100%" }}
                        >
                          <option value="" className="text-secondary text-lowercase">
                            Select Category
                          </option>
                          {CategoryMapData?.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <div className="select_box_arrow">
                          <FontAwesomeIcon icon={faAngleDown} className="icon" />
                        </div>
                      </div>
                      {/* </h6> */}
                    </div>
                    <div className="col_40p">
                      <h6>
                        <div className="position-relative">
                          <select
                            {...register(`rows[${index}].brandId`)}
                            onChange={(e) => handleBrandChange(index, e.target.value)}
                            value={row.brandId}
                            disabled={!row.categoryId}
                            className="form-control custom_input"
                          >
                            <option value="">Select Brand</option>
                            {cardDataToMap?.brand[`${index}`]?.map((brand) => (
                              <option key={brand._id} value={brand._id}>
                                {brand.name}
                              </option>
                            ))}
                          </select>
                          <div className="select_box_arrow">
                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                          </div>
                        </div>
                      </h6>
                    </div>
                    <div className="col_40p">
                      <h6>
                        {" "}
                        <div className="position-relative">
                          <select
                            {...register(`rows[${index}].modelId`)}
                            className="form-control custom_input"
                            disabled={!row.brandId}
                          >
                            <option value="">Select Model</option>
                            {cardDataToMap?.model[`${index}`]?.map((model) => (
                              <option key={model._id} value={model._id}>
                                {model.name}
                              </option>
                            ))}
                          </select>
                          <div className="select_box_arrow">
                            <FontAwesomeIcon icon={faAngleDown} className="icon" />
                          </div>
                        </div>
                      </h6>
                    </div>
                    <div className="col_85p">
                      <div className="input_scroll" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                        {cardDataToMap?.parameter[`${index}`]?.map((item, interIndex) => (
                          // <h6>
                          <div className="col_60p" key={interIndex} style={{ display: "inline-block", minWidth: "150px" }}>
                            <label>{item}</label>
                            <InputBox
                              register={{ ...register(`rows[${index}].parameter.${item}`) }}
                              className="form-control"
                            />
                          </div>
                          // </h6>
                        ))}
                      </div>
                    </div>
                    <div className="col_40p" style={{ gap: "2px" }}>
                      {/* <h6> */}
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`selectionCart-${index}`}
                        value={"dump"}
                        {...register(`rows[${index}].type`, {
                          onChange: (e) => {
                            setCartSelectOption((prevOptions) => ({
                              ...prevOptions,
                              [index]: e.target.value, // Set the selected value at the specific index
                            }));
                          },
                        })}
                      />
                      {/* <label htmlFor={`dumpRadioCartDump-${index}`}>Dump</label> */}
                      <label>dump</label>
                      <input
                        className="form-check-input"
                        type="radio"
                        // id={`dumpRadioCartStore-${index}`}
                        name={`selectionCart-${index}`}
                        value={"store"}
                        {...register(`rows[${index}].type`, {
                          onChange: (e) => {
                            setCartSelectOption((prevOptions) => ({
                              ...prevOptions,
                              [index]: e.target.value, // Set the selected value at the specific index
                            }));
                          },
                        })}
                      />
                      <label>store</label>
                      {/* </h6> */}
                    </div>
                    {cartSelectOption[index] === "store" ? (
                      <>
                        <div className="col_40p">
                          <h6>
                            <div className="position-relative">
                              <select
                                {...register(`rows[${index}].locationId`)}
                                value={watch(`rows[${index}].locationId`) || ""}
                                onChange={(e) => handleLocationChange(index, e.target.value)}
                                className="form-control"
                              >
                                <option value="">Select Location</option>
                                {locationList?.map((location) => (
                                  <option key={location._id} value={location._id}>
                                    {location.name}
                                  </option>
                                ))}
                              </select>
                              <div className="select_box_arrow">
                                <FontAwesomeIcon icon={faAngleDown} className="icon" />
                              </div>
                            </div>
                          </h6>
                        </div>
                        <div className="col_40p">
                          <h6>
                            {" "}
                            <div className="position-relative">
                              <select
                                {...register(`rows[${index}].blockId`)}
                                onChange={(e) => handleBlockChange(index, e.target.value)}
                                className="form-control custom_input"
                                value={row.blockId}
                                disabled={!row.locationId} // Disable until location is selected
                              >
                                <option value="">Select Block</option>
                                {cardDataToMap?.block[`${index}`]?.map((block) => (
                                  <option key={block._id} value={block._id}>
                                    {block.blockNo}
                                  </option>
                                ))}
                              </select>
                              <div className="select_box_arrow">
                                <FontAwesomeIcon icon={faAngleDown} className="icon" />
                              </div>
                            </div>
                          </h6>
                        </div>
                        <div className="col_40p">
                          <h6>
                            <div className="position-relative">
                              <select
                                {...register(`rows[${index}].rackId`)}
                                onChange={(e) => handleRackChange(index, e.target.value)}
                                className="form-control custom_input"
                                value={row.rackId}
                                disabled={!row.blockId} // Disable until block is selected
                              >
                                <option value="">Select Rack</option>
                                {cardDataToMap?.rack[`${index}`]?.map((rack) => (
                                  <option key={rack._id} value={rack._id}>
                                    {rack.rackName}
                                  </option>
                                ))}
                              </select>
                              <div className="select_box_arrow">
                                <FontAwesomeIcon icon={faAngleDown} className="icon" />
                              </div>
                            </div>
                          </h6>
                        </div>
                        <div className="col_40p">
                          <h6>
                            {" "}
                            <div className="position-relative">
                              <select
                                {...register(`rows[${index}].partitionName`)}
                                className="form-control custom_input"
                                // value={row.partitionName}
                                disabled={!row.rackId} // Disable until rack is selected
                              >
                                <option value="">Select Partition</option>
                                {cardDataToMap?.partition[`${index}`]?.map((partition, i) => (
                                  <option
                                    key={`${partition.partitionName}i`}
                                    value={partition.partitionName}
                                  >
                                    {partition.partitionName}
                                  </option>
                                ))}
                              </select>
                              <div className="select_box_arrow">
                                <FontAwesomeIcon icon={faAngleDown} className="icon" />
                              </div>
                            </div>
                          </h6>
                        </div>
                        <div className="col_40p">
                          <h6>
                            <div className="position-relative">
                              <select
                                {...register(`rows[${index}].conditionType`)}
                                className="form-control custom_input"
                              // disabled={!row.partition.partitionName}
                              >
                                <option value="">Select Condition Type</option>
                                <option value="new">New</option>
                                <option value="refurbished">Refurbished</option>
                              </select>
                              <div className="select_box_arrow">
                                <FontAwesomeIcon icon={faAngleDown} className="icon" />
                              </div>
                            </div>
                          </h6>
                        </div>
                        <div className="col_40p">
                          <h6>
                            <div className="position-relative">
                              <select
                                {...register(`rows[${index}].status`)}
                                className="form-control custom_input"
                              // disabled={!row.categoryId}
                              >
                                <option value="">Select Status</option>
                                {stockStatus?.map((ele, index) => {
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
                          </h6>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Render Blank Columns */}
                        <div
                          className="col_40p"
                          style={{
                            display: `${Object.values(cartSelectOption).includes("store") ? "block" : "none"
                              }`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${Object.values(cartSelectOption).includes("store") ? "block" : "none"
                              }`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${Object.values(cartSelectOption).includes("store") ? "block" : "none"
                              }`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${Object.values(cartSelectOption).includes("store") ? "block" : "none"
                              }`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${Object.values(cartSelectOption).includes("store") ? "block" : "none"
                              }`,
                          }}
                        ></div>
                        <div
                          className="col_40p"
                          style={{
                            display: `${Object.values(cartSelectOption).includes("store") ? "block" : "none"
                              }`,
                          }}
                        ></div>
                      </>
                    )}

                    {/* )} */}
                  </div>
                ))}
                {/* <small className="text-center text-secondary p-2 small d-block">
                Data Not Available
              </small> */}
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* ---------------------------CART MATERIAL END----------------------------------------------------------*/}

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
        ></Button>
      </div>
    </>
  );
};

export default AcceptMaterial;
