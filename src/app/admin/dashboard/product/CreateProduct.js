"use client";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import { getCategory, getCategoryWiseBrand } from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function CreateProduct({ data }) {
  const { modalStates, setModalStates, getProductList } = data;
  const [loader, setLoader] = useState(false);
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [_brandId, _setBrandId] = useState("");
  const router = useRouter();
  const [profile, setProfile] = useState({
    fieldName: "",
    documentName: "",
    fileUrl: "",
  });
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const categoryId = watch("categoryId");
  async function onSubmit(values) {
    try {
      setLoader(true);
      let response;
      let formData = new FormData();
      let dataToSend = {
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        brandId: values.brandId,
      };
      if (modalStates?.type === "create") {
        if (!profile.documentName) {
          toast.info("Please select the product Image");
          return;
        }
        formData.append("files", profile.fileUrl);
        formData.append("modelDetails", JSON.stringify(dataToSend));
        response = await communication.createProduct(formData);
      } else {
        let isFileAttached = false;
        dataToSend.modelId = modalStates.productId;
        if (profile.fieldName) {
          isFileAttached = true;
          formData.append("files", profile.fileUrl);
          formData.append("modelDetails", JSON.stringify(dataToSend));
        } else {
          formData = dataToSend;
        }
        response = await communication.updateProduct(isFileAttached, formData);
      }
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message);
        setModalStates((pre) => ({
          modal: false,
          type: "",
          productId: "",
        }));
        getProductList(1, "");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.message);
      setLoader(false);
    }
  }

  const getProductById = async () => {
    try {
      setLoader(true);
      const responseFromServer = await communication.getProductById({
        modelId: modalStates.productId,
      });
      if (responseFromServer?.data?.status === "SUCCESS") {
        const modelData = responseFromServer?.data?.model;
        setValue("name", modelData.name);
        setValue("categoryId", modelData.categoryId._id);
        _setBrandId(modelData.brandId._id);
        await getCategoryWiseBrand(modelData?.categoryId?._id);
        setValue("brandId", modelData.brandId._id);
        setValue("description", modelData.description);
        setProfile(modelData?.files[0]);
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        toast.info(serverResponse.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  };

  const handleCategory = async () => {
    if (getValues("categoryId")) {
      setBrandData(await getCategoryWiseBrand(getValues("categoryId")));
    } else {
      setBrandData([]);
    }
  };

  useMemo(() => {
    handleCategory();
  }, [categoryId]);

  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));
    if (modalStates?.type !== "create") {
      await getProductById();
    }
  }
  useEffect(() => {
    initialAPICall();
  }, []);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal" style={{ width: "55%" }}>
          <div className="form_modal_header">
            <h5 className="title">
              {modalStates?.type === "create" ? "Create Product" : "Update Product"}
            </h5>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => setModalStates((prev) => ({ ...prev, modal: false, type: "" }))}
              className="close_modal_icon"
            />
          </div>
          <div className="form_modal_body">
            <div className="row">
              <div className="input_wrapper col-lg-4">
                <label>Product Name*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("name", {
                      required: "Product Name is required",
                    }),
                  }}
                  errors={errors.name}
                />
              </div>
              <div className="input_wrapper col-lg-4">
                <label>Category*</label>
                <SelectBox
                  firstOption="select Category"
                  options={CategoryMapData}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("categoryId", {
                      required: "Category is required",
                    }),
                  }}
                  errors={errors.categoryId}
                />
              </div>

              <div className="input_wrapper col-lg-4">
                <label>Brand*</label>
                <SelectBox
                  firstOption="select Brand"
                  options={brandData}
                  displayName={"name"}
                  value={"_id"}
                  disable={false}
                  register={{
                    ...register("brandId", {
                      required: "Brand is required",
                    }),
                  }}
                  errors={errors.brandId}
                />
              </div>
              <div className="input_wrapper col-lg-12">
                <label>Description*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("description", {
                      required: "Description is required",
                    }),
                  }}
                  errors={errors.description}
                />
              </div>

              <div className="input_wrapper col-lg-12">
                <div className="document_picker_wrapper">
                  <h6>Product Photo*</h6>
                  <label htmlFor={"photo"}>
                    <div className="document_picker">
                      <input
                        accept="image/*,.png"
                        type="file"
                        className="d-none"
                        id={"photo"}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setProfile((prev) => ({
                              ...prev,
                              fieldName: "photo",
                              documentName: file.name,
                              fileUrl: file,
                            }));
                          }
                        }}
                      />
                      {![null, undefined, ""].includes(profile?.fileUrl) ? (
                        <>
                          <Image
                            alt={profile?.documentName}
                            width={200}
                            height={200}
                            src={
                              typeof profile?.fileUrl === "object"
                                ? URL.createObjectURL(profile?.fileUrl)
                                : `${getServerUrl()}/getFiles/${profile?.fileUrl}`
                            }
                          />
                          <p>
                            {profile?.documentName?.split(".")[0]?.slice(0, 10)}.
                            {profile?.documentName?.split(".")[1]}
                          </p>
                        </>
                      ) : (
                        <FontAwesomeIcon icon={faCirclePlus} className="icon fontAwesome_icon" />
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="form_button_wrapper">
              <CustomBtn
                name={modalStates?.type === "create" ? "Create" : "Update"}
                onClick={handleSubmit(onSubmit)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateProduct;
