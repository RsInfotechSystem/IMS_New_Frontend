"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import SelectBox from "@/common-components/Select";
import { getCategory, getCategoryWiseBrand, getLocationWiseBlock } from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import ButtonLoader from "@/common-components/ButtonLoader";
import Loader from "@/common-components/Loader";

const UpdateInventoryStock = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [loader, setLoader] = useState(false);
  const [buttonLoader, setButtonLoader] = useState(false);
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [brandMapData, setBrandMapData] = useState([]);
  const [productMapData, setProductMapData] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [_modelId, _setModelId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [blockId, setBlockId] = useState();
  const [modelId, setModelId] = useState("");
  const [blocks, setBlocks] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      dailyMealAllowance: "false",
      laundryAllowance: "false",
    },
  });
  const model = watch("modelId");
  const location = watch("locationId");
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
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
  async function getBrandWiseModel(id) {
    try {
      setLoader(true);
      const payload = {
        brandId: id ?? brandId,
      };
      const serverResponse = await communication.brandWiseModel(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setProductMapData(serverResponse?.data?.model);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
        setLoader(false);
      } else {
        setProductMapData([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }
  async function getStockById() {
    try {
      setLoader(true);
      const responseFromServer = await communication.getStockById(params.get("stockId"));
      if (responseFromServer?.data?.status === "SUCCESS") {
        const stockData = responseFromServer?.data?.stock;
        setLocationId(stockData?.locationId);
        setValue("locationId", stockData?.locationId);
        await getLocationWiseBlock(stockData?.locationId, setLoader, router, setBlocks);
        setModelId(stockData?.modelId);
        await getBrandWiseModel(stockData?.brandId?._id);
        _setModelId(stockData?.modelId._id);
        // setValue("modelId", stockData?.modelId._id);
        setValue("retailPrice", stockData?.retailPrice);
        setValue("wholeSalePrice", stockData?.wholeSalePrice);
        setValue("displayPrice", stockData?.displayPrice);
        setValue("quantity", stockData?.quantity);
        setValue("categoryId", stockData?.categoryId?._id);
        await getCategoryWiseBrand(stockData?.categoryId?._id);
        setValue("brandId", stockData?.brandId?._id);
        setBlockId(stockData?.blockId);
        // setValue("blockId", stockData?.blockId);
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.warn(responseFromServer?.data?.message);
        router.push("/login");
      } else {
        toast.warn(responseFromServer?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  }
  const stockInUpdate = async (values) => {
    try {
      setLoader(true);
      const dataToSend = {
        stockId: params.get("stockId"),
        ...values,
      };
      let response = await communication.updateStock(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        reset();
        setValue("locationId", "");
        setValue("categoryId", "");
        setValue("modelId", "");
        setValue("blockId", "");
        setValue("quantity", "");
        setValue("retailPrice", "");
        setValue("wholeSalePrice", "");
        setValue("displayPrice", "");
        toast.success(response.data.message);
        // await getStockList({ currentPage, searchString });
        router.push("/dashboard/inventory");
        setLoader(false);
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
  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));

    // if (modalStates?.type !== "create") {
    //   await getBrandById()
    // }
  }
  useEffect(() => {
    setValue("locationId", locationId);
  }, [locationId, locationList.length >= 1]);
  useEffect(() => {
    setValue("brandId", brandId);
  }, [brandId]);
  useEffect(() => {
    setValue("modelId", _modelId);
  }, [_modelId, productMapData.length >= 1]);
  useEffect(() => {
    setValue("blockId", blockId);
  }, [blockId, blocks.length >= 1]);

  const handleCategory = async () => {
    if (getValues("categoryId")) {
      setBrandMapData(await getCategoryWiseBrand(getValues("categoryId")));
    } else {
      setBrandMapData([]);
    }
  };

  useEffect(() => {
    const id = getValues("brandId");
    if (id) {
      getBrandWiseModel(id);
    }
  }, [brandId]);
  useEffect(() => {
    const id = getValues("locationId");
    if (id) {
      getLocationWiseBlock(id, setLoader, router, setBlocks);
    }
  }, [location]);

  useMemo(() => {
    handleCategory();
  }, [categoryId]);

  useEffect(() => {
    getLocations();
    initialAPICall();
    getStockById();
  }, []);

  return (
    <>
      {loader && <Loader />}
      <div className="top_header">
        <div className="tab_title">Inventory Stock Update</div>
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
                  fill="#198754"
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
      <div className="form_layout">
        <div className="form_tabs_wrapper">
          <div>
            <h6>{/* {tabsDetail?.tabName} */}</h6>
          </div>
        </div>
        <>
          <div className="form_main" style={{ height: "48%" }}>
            <div className="row">
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Select Location *</label>
                <SelectBox
                  options={locationList}
                  firstOption={"Select Location"}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("locationId", {
                      required: "Select Location",
                    }),
                  }}
                  errors={errors.locationId}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>category Name *</label>
                <SelectBox
                  options={CategoryMapData}
                  firstOption={"Select Category"}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("categoryId", {
                      required: "Select Category",
                    }),
                  }}
                  errors={errors.categoryId}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Brand Name *</label>
                <SelectBox
                  options={brandMapData}
                  firstOption={"Select Brand"}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("brandId", {
                      required: "Select Brand",
                    }),
                  }}
                  errors={errors.brandId}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Product Name *</label>
                <SelectBox
                  options={productMapData}
                  firstOption={"Select Product"}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("modelId", {
                      required: "Select Product",
                    }),
                  }}
                  errors={errors.modelId}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Select Block *</label>
                <SelectBox
                  options={blocks}
                  firstOption={"Select Block"}
                  displayName={"blockNo"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("blockId", {
                      required: "Select Block",
                    }),
                  }}
                  errors={errors.blockId}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Quantity *</label>
                <InputBox
                  register={{
                    ...register("quantity", {
                      required: "Quantity is required",
                    }),
                  }}
                  errors={errors.quantity}
                />
              </div>{" "}
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Retail Price Per Item *</label>
                <InputBox
                  register={{
                    ...register("retailPrice", { required: "Retail Price is required" }),
                  }}
                  errors={errors.retailPrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Wholesale Price Per Item *</label>
                <InputBox
                  register={{
                    ...register("wholeSalePrice", { required: "Wholesale Price is required" }),
                  }}
                  errors={errors.wholeSalePrice}
                />
              </div>
              <div className="col-lg-3 col-md-6 input_wrapper">
                <label>Display Wholesale Price per item*</label>
                <InputBox
                  register={{
                    ...register("displayPrice", {
                      required: "Display Wholesale Price is required",
                    }),
                  }}
                  errors={errors.displayPrice}
                />
              </div>
            </div>
          </div>
          <div className="form_button_wrapper gap-2">
            <CustomBtn
              name="Update"
              onClick={handleSubmit(stockInUpdate)}
              //   svg={
              //     <svg
              //       width="24"
              //       height="24"
              //       viewBox="0 0 24 24"
              //       fill="none"
              //       xmlns="http://www.w3.org/2000/svg"
              //     >
              //       <path
              //         fill-rule="evenodd"
              //         clip-rule="evenodd"
              //         d="M8.715 6.36694L14.405 10.6669C14.7769 10.9319 14.9977 11.3603 14.9977 11.8169C14.9977 12.2736 14.7769 12.702 14.405 12.9669L8.715 17.6669C8.23425 18.0513 7.58151 18.1412 7.01475 17.9011C6.44799 17.6611 6.05842 17.1297 6 16.5169V7.51694C6.05842 6.90422 6.44799 6.37281 7.01475 6.13275C7.58151 5.89269 8.23425 5.9826 8.715 6.36694Z"
              //         stroke="#F3F8FF"
              //         stroke-width="1.15"
              //         stroke-linecap="round"
              //         stroke-linejoin="round"
              //       />
              //       <path
              //         d="M18 6.01697V18.017"
              //         stroke="#F3F8FF"
              //         stroke-width="1.15"
              //         stroke-linecap="round"
              //       />
              //     </svg>
              //   }
            />
            <CustomBtn
              name="Back"
              onClick={() => {
                router.back();
              }}
            />
          </div>
        </>
      </div>
    </>
  );
};

export default UpdateInventoryStock;
