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

const AcceptMaterial = () => {
  const router = useRouter();
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
    callAPIs();
  }, []);

  return (
    <>
      {loader && <Loader />}
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
                <div className="table_section pi_product_table">
                  <div className="table_header">
                    <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllCheckbox"
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
                      <h5>Location</h5>
                    </div>
                    <div className="col_25p">
                      <h5 className="action_wrraper">Note</h5>
                    </div>

                    {/* <div className="col_20p">
                  <h5 className="action_wrraper">Remove</h5>
                </div> */}
                  </div>
                  {/* {modelList?.materialDetails?.length > 0 ? (
                modelList?.materialDetails?.map((product, index) => {
                  return (
                    <div className="table_data" key={index}>
                      <div className="col_20p">
                        {attachedDescriptions.includes(product._id) ? (
                          <div className="check_box">
                            <FontAwesomeIcon icon={faCheck} className="text-success" />
                          </div>
                        ) : (
                          <div className="check_box">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={product._id}
                              onChange={(e) => handleCheckboxChange(e)}
                              checked={selectedCheckboxes.includes(product._id)}
                              disabled={attachedDescriptions.includes(product._id)}
                            />
                          </div>
                        )}
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
                        <h6>{product?.warranty ? product?.warranty : "--"}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>
                          {modelList?.orderLocation?.name ? modelList?.orderLocation?.name : "--"}
                        </h6>
                      </div>
                      <div className="col_25p">
                        <h6 className="action_wrraper">{product?.note ? product?.note : "--"}</h6>
                      </div>
                    </div>
                  );
                })
              ) : (
                <small className="text-center text-secondary p-2 small d-block">
                  Add order to see list
                </small>
              )} */}
                </div>
              </div>
            </div>
          </div>
          {/* ---------------------------sales order list of discription end----------------------------------------------------------*/}

          {/* <div> */}
          {/* ---------------------------filter for material----------------------------------------------------------*/}
          {/* <div className="form_list_layout_wrapper"> */}
          {/* <div className="d-flex align-items-center justify-content-between py-2"> */}

          {/* ---------------------------list of material----------------------------------------------------------*/}
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Material List</p>
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
                      <h5>Location</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Category</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Brand</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Block</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Rack</h5>
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
                  </div>
                  {/* {material?.length > 0 ? (
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
                                    />
                                  </div>
                                </div>
                                <div className="col_25p">
                                  <h6>{index + 1}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.location}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.category}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.brand}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.block}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.rack}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.modelId}</h6>
                                </div>
                                <div className="col_25p">
                                  <h6>{product?.serialNo}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{product?.itemCode}</h6>
                                </div>
                                <div className="col_20p">
                                  <h6>{product?.quantity}</h6>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <small className="text-center text-secondary p-2 small d-block">
                            Add order to see list
                          </small>
                        )} */}
                </div>
              </div>
            </div>
          </div>
          <Button
            //   onClick={handleAttachMaterials}
            //   disabled={selectedMaterials.length === 0}
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
          <p>Sales Order Item Preview</p>
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
                  <h5 className="action_wrraper">Serial No</h5>
                </div>
                <div className="col_20p">
                  <h5 className="action_wrraper">Item Code</h5>
                </div>
                <div className="col_20p">
                  <h5 className="action_wrraper">Action</h5>
                </div>
              </div>
              {/* {attachedMaterials?.length > 0 ? (
                    attachedMaterials?.map((item, index) => {
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
                  )} */}
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
