"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import SelectBox from "@/common-components/Select";

import {
  getBrands,
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
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/common-components/Button";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";

const AcceptMaterial = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [brandName, setBrandName] = useState("");
  const [loader, setLoader] = useState(false);
  const [isPartationPresent, setIsPartationPresent] = useState("");
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [parameter, setParameter] = useState([]);
  const [racks, setRacks] = useState([]);
  const searchParams = useSearchParams();
  const [rackPartation, setRackPartation] = useState([]);
  const [partition, setPartition] = useState("");
  const [nonMaterial, setNonMaterial] = useState([]);
  const [material, setMaterial] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedNonMaterials, setSelectedNonMaterials] = useState([]);
  const [allMaterialsSelected, setAllMaterialsSelected] = useState(false);
  const [allNonMaterialsSelected, setAllNonMaterialsSelected] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [respondHandlerModalState, setRespondHandlerModalState] = useState({
    state: false,
    jobNo: "",
  });
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

  const onSubmit = async (value) => {
    try {
      setLoader(true);
      const dataToSend = {
        materialId: searchParams.get("stockId"),
        rackId: value.rackId,
        blockId: value.blockId,
        partitionName: value.partitionName,
        status: value.status,
      };
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
        setNonMaterial(serverResponse?.data?.material?.nonMaterials);
        setMaterial(serverResponse?.data?.material?.materials);
        toast.success(serverResponse.data.message);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
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
      setSelectedNonMaterials((prev) => [...prev, productId]);
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
  const handleAttachMaterials = () => {
    const selectedItems = nonMaterial.filter((item) => selectedNonMaterials.includes(item._id));
    setCartItems((prevItems) => [...prevItems, ...selectedItems]);

    // Clear the selection after adding to cart
    setSelectedNonMaterials([]);
  };
  const cancelHandler = () => {
    setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
  };
  async function dumpMaterial() {
    try {
      setLoader(true);
      let payload = { orderId: searchParams.get("orderId") };
      const serverResponse = await communication.allMaterialOrderSells(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        router.back();
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
        <div className="tab_title">Return Material</div>
      </div>
      <form>
        <div className="form_layout">
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Non-Material List</p>
            </div>
            {/* table  */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                <div className="table_section pi_product_table" style={{ minWidth: "1500px" }}>
                  <div className="table_header">
                    <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllNonMaterialCheckbox"
                          onChange={handleSelectAllNonMaterials}
                          checked={allNonMaterialsSelected}
                        />
                      </div>
                    </div>
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
                    <div className="col_25p">
                      <h5>Quantity</h5>
                    </div>
                  </div>
                  {nonMaterial?.length > 0 ? (
                    nonMaterial?.map((product, index) => {
                      return (
                        <div className="table_data" key={index}>
                          <div className="col_20p">
                            <div className="check_box">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={product._id}
                                onChange={(e) => handleNonMaterialCheckboxChange(e, product._id)}
                                checked={selectedNonMaterials.includes(product._id)}
                                // id={product._id}
                                // onChange={(e) => handleCheckboxChange(e)}
                                // checked={selectedCheckboxes.includes(product._id)}
                                // disabled={attachedDescriptions.includes(product._id)}
                              />
                            </div>
                          </div>
                          <div className="col_20p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.locationId?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.blockId?.blockNo}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.rackId?.rackName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.partitionName}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{product?.categoryId?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.brandId?.name}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{product?.modelId?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.serialNo}</h6>
                          </div>{" "}
                          <div className="col_25p">
                            <h6>{product?.itemCode}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.assignQuantity}</h6>
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
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Material List</p>
            </div>
            {/* table */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                <div className="table_section pi_product_table" style={{ minWidth: "1500px" }}>
                  <div className="table_header">
                    <div className="col_20p">
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
                    </div>
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
                    </div>{" "}
                    <div className="col_25p">
                      <h5>Item Code</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Quantity</h5>
                    </div>
                  </div>
                  {material?.length > 0 ? (
                    material?.map((product, index) => {
                      return (
                        <div className="table_data" key={index}>
                          <div className="col_20p">
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
                          </div>
                          <div className="col_20p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.locationId?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.blockId?.blockNo}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.rackId?.rackName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.partitionName}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.categoryId?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.brandId?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.modelId?.name}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.serialNo}</h6>
                          </div>{" "}
                          <div className="col_25p">
                            <h6>{product?.itemCode}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.assignQuantity}</h6>
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
            disabled={selectedNonMaterials.length === 0}
            name={" Add To Cart"}
          ></Button>
          {/* </div> */}
          {/* </div> */}
          {/* </div> */}
          {/* ---------------------------filter for material end----------------------------------------------------------*/}
          {/* ---------------------------attached material----------------------------------------------------------*/}
        </div>
      </form>
      <div className="form_list_layout_wrapper my-4">
        <div className="d-flex align-items-center justify-content-between">
          <p>Selected Material List</p>
        </div>
        {/* table */}
        <div className="table_wrapper my-3">
          <div className="table_main">
            <div className="table_section pi_product_table">
              <div className="table_header">
                <div className="col_20p">
                  <div className="check_box">
                    <input className="form-check-input" type="checkbox" />
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
                  <h5>Serial No</h5>
                </div>
                <div className="col_20p">
                  <h5>Item Code</h5>
                </div>
                <div className="col_20p">
                  <h5>Quantity</h5>
                </div>
                <div className="col_35p">
                  <h5>Action</h5>
                </div>
              </div>
              {cartItems?.length > 0 ? (
                cartItems?.map((item, index) => {
                  // console.log(cartItems, "cartItems");
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
                      <div className="col_25p">
                        <h6>{item?.categoryId?.name}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{item?.brandId?.name}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{item?.modelId?.name}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{item?.serialNo}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{item?.itemCode}</h6>
                      </div>
                      <div className="col_20p">
                        <h6>{item?.assignQuantity}</h6>
                      </div>
                      <div className="col_35p">
                        <h6 className="action_wrraper">
                          <button
                            className="actionbtn sell_btn"
                            // onClick={() =>
                            //   approvedTransferMaterials(materialDetails._id)
                            // }
                            onClick={() => {
                              setRespondHandlerModalState({ state: true });
                            }}
                          >
                            Dump
                          </button>
                          <button
                            className="actionbtn sell_btn"
                            // onClick={() => showInputDialog(materialDetails._id)}
                          >
                            Store
                          </button>
                        </h6>
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
        <Button className="btn-success" name={"Accept Material"}></Button>
        <Button className="btn-success" name={"Reject Material"}></Button>
      </div>
    </>
  );
};

export default AcceptMaterial;
