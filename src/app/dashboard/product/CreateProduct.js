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
  const [categoryList, setCategoryList] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  const [_brandId, _setBrandId] = useState("");
  const router = useRouter();
  const [profile, setProfile] = useState([]);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  let categoryId = watch("categoryId");
  const brandId = watch("brandId");

  console.log("profile",profile);

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
        if (profile.length === 0) {
          toast.info("Please select the product Image(s)");
          return;
        }
        profile.forEach((file) => {
          formData.append("files", file.fileUrl);
        });
        formData.append("modelDetails", JSON.stringify(dataToSend));
        response = await communication.createProduct(formData);
      } else {
        let isFileAttached = profile.length > 0;
        dataToSend.modelId = modalStates.productId;
        if (isFileAttached) {
          profile.forEach((file) => {
            formData.append("files", file.fileUrl);
          });
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
        setValue("categoryId", modelData?.categoryId?._id);
        _setBrandId(modelData.brandId._id);
        await getCategoryWiseBrand(modelData?.categoryId?._id,setLoader, router, setBrandsData);
        setValue("brandId", modelData?.brandId?._id);
        setValue("description", modelData.description);
        setProfile(modelData?.files);
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
        toast.info(serverResponse.data.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  };

  async function initialAPICall() {
    setCategoryList(await getCategory(router));
    if (modalStates?.type !== "create") {
      await getProductById();
    }
  }
  useEffect(() => {
    initialAPICall();
  }, []);

  useEffect(() => {
    getCategory(setLoader, router, setCategoryList);
  }, []);

  useEffect(() => {
    const id = getValues("categoryId");
    if (id) {
      getCategoryWiseBrand(id, setLoader, router, setBrandsData);
    }
  }, [categoryId]);

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
                <label>Model Name*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("name", {
                      required: "Model Name is required",
                    }),
                  }}
                  errors={errors.name}
                />
              </div>
              <div className="input_wrapper col-lg-4">
                <label>Category*</label>
                <select
                  name="categoryId"
                  className="form-control custom_input"
                  style={{ width: "100%" }}
                  {...register("categoryId", {
                    required: "Category is required",
                  })}

                >
                  <option value="" className="text-secondary text-lowercase">
                    Select Category
                  </option>
                  {categoryList.map((ele, index) => {
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
              </div>

              <div className="input_wrapper col-lg-4">
                <label>Brand*</label>
                <select
                  name="categoryId"
                  className="form-control custom_input"
                  style={{ width: "100%" }}
                  {...register("brandId", {
                    required: "Brand is required",
                  })}
                >
                  <option value="" className="text-secondary text-lowercase">
                    Select Brand
                  </option>
                  {brandsData.map((ele, index) => {
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
                  <h6>Model Photo(s)*</h6>
                  <label htmlFor={"photo"}>
                    <div className="document_picker">
                      <input
                        accept="image/*,.png"
                        type="file"
                        className="d-none"
                        id={"photo"}
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) {
                            const updatedFiles = files.map((file) => ({
                              fieldName: "photo",
                              documentName: file.name,
                              fileUrl: file,
                            }));
                            setProfile((prev) => [...prev, ...updatedFiles]);
                          }
                        }}
                      />
                      {profile.length > 0 ? (
                        <div className="image_preview_container">
                          {profile.map((file, index) => (
                            <div key={index} className="image_preview">
                              <Image
                                alt={file.documentName}
                                width={100}
                                height={100}
                                src={
                                  typeof file.fileUrl === "object"
                                    ? URL.createObjectURL(file.fileUrl)
                                    : `${getServerUrl()}/getFiles/${file.fileUrl}`
                                }
                              />
                              <p>
                                {file.documentName?.split(".")[0]?.slice(0, 10)}.
                                {file.documentName?.split(".")[1]}
                              </p>
                            </div>
                          ))}
                        </div>
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
