"use client";
import CustomBtn from "@/common-components/CustomBtn";
import CustomTextArea from "@/common-components/CustomTextArea";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import { getCategory, getCategoryWiseBrand } from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faAngleDown, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
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
  const [_category, _setCategory] = useState("")
  const [document, setDocument] = useState([]);
  const [otherDocuments, setOtherDocuments] = useState([]);
  //
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

  // select document
  const selectFile = async (event) => {
    const selectedFile = event.target.files[0];
    if (event.target.files.length === 0) {
      setOtherDocuments([]);
      return false;
    } else {
      if (selectedFile?.size > 2000000) {
        toast.info("The selected image exceeds a size of 2 mb", { autoClose: 1500 });
        return false;
      } else if (otherDocuments.length > 3) {
        toast.info("The document upload limit is restricted to only 4.", { autoClose: 1500 });
        return false;
      } else {
        if (
          ["image/png", "image/jpg", "image/jpeg", "application/pdf"].includes(selectedFile?.type)
        ) {
          setOtherDocuments((prev) => [
            ...prev,
            {
              fieldName: "otherDocuments",
              documentName: selectedFile.name,
              fileUrl: selectedFile,
              isNew: true,
            },
          ]);
          setDocument((prev) => [...prev, ...otherDocuments]);
        } else {
          toast.info("Only JPG, JPEG and PNG files are allowed", { autoClose: 1500 });
          return false;
        }
      }
    }
  };
  const deleteDocument = (indexToDelete) => {
    // Make a copy of the current state of otherDocuments
    const updatedDocuments = [...otherDocuments];

    // Remove the document at the specified index
    updatedDocuments.splice(indexToDelete, 1);
    if (updatedDocuments?.length < 1) {
    }
    // Update the state with the modified array
    setOtherDocuments(updatedDocuments);
    setDocument((prev) => [...prev, ...updatedDocuments]);
  };

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
        // if (otherDocuments?.length === 0) {
        //   toast.info("Please select the product Image(s)", { autoClose: 1500 });
        //   return;
        // }
        otherDocuments.forEach((file) => {
          formData.append("files", file.fileUrl);
        });
        formData.append("modelDetails", JSON.stringify(dataToSend));
        response = await communication.createProduct(formData);
      } else {
        let isFileAttached = false;
        dataToSend.modelId = modalStates.productId;
        for (let i = 0; i < otherDocuments.length; i++) {
          const element = otherDocuments[i];
          if (element?.isNew && typeof element?.fileUrl !== "string") {
            isFileAttached = true;
            formData.append("files", element?.fileUrl);
          }
        }
        dataToSend.otherDocuments = otherDocuments.filter((ele) => !ele?.isNew);

        if (isFileAttached) {
          formData.append("modelDetails", JSON.stringify(dataToSend));
        } else {
          formData = dataToSend;
        }
        response = await communication.updateProduct(isFileAttached, formData);
      }
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message, { autoClose: 1500 });
        setModalStates((pre) => ({
          modal: false,
          type: "",
          productId: "",
        }));
        getProductList(1, "");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message, { autoClose: 1500 });
        router.push("/");
      } else {
        toast.info(response.data.message, { autoClose: 1500 });
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.message, { autoClose: 1500 });
      setLoader(false);
    }
  }

  const getProductById = async () => {
    try {
      setLoader(true);
      const responseFromServer = await communication.getProductById({
        modelId: modalStates?.productId,
      });
      if (responseFromServer?.data?.status === "SUCCESS") {
        const modelData = responseFromServer?.data?.model;
        await getCategoryWiseBrand(modelData?.categoryId?._id, setLoader, router, setBrandsData);
        setValue("name", modelData?.name);
        setValue("categoryId", modelData?.categoryId?._id);
        _setCategory(modelData?.categoryId?._id)
        // _setBrandId(modelData?.brandId?._id);
        setValue("description", modelData?.description);
        setOtherDocuments(modelData?.files);
        if (modelData?.categoryId?._id) {
          setValue("brandId", modelData?.brandId?._id);
          _setBrandId(modelData?.brandId?._id);
        }
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message, { autoClose: 1500 });
        router.push("/");
      } else {
        toast.info(serverResponse.data.message, { autoClose: 1500 });
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message, { autoClose: 1500 });
    } finally {
      setLoader(false);
    }
  };

  // console.log(otherDocuments, "otherDocuments");

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
  }, [categoryId, brandsData?.length > 0]);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal" style={{ width: "55%" }}>
          <div className="form_modal_header">
            <h5 className="title">
              {modalStates?.type === "create" ? "Create Model" : "Update Model"}
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
                <div className="position-relative">
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
                  {errors.categoryId && (
                    <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="input_wrapper col-lg-4">
                <label>Brand*</label>
                <div className="position-relative">
                  <select
                    name="brandId"
                    className="form-control custom_input"
                    style={{ width: "100%" }}
                    {...register("brandId", {
                      required: "Brand is required",
                    })}
                  >
                    <option value="" className="text-secondary text-lowercase">
                      Select Brand
                    </option>
                    {brandsData?.map((ele, index) => {
                      return (
                        <option className="small text-capitalize" selected={(getValues("brandId") === ele?._id) ? true : false} value={ele?._id} key={index}>
                          {" "}
                          {ele?.name}
                        </option>
                      );
                    })}
                  </select>
                  <div className="select_box_arrow">
                    <FontAwesomeIcon icon={faAngleDown} className="icon" />
                  </div>
                  <div />
                  <div style={{ height: "5px" }}>
                    {errors.brandId && (
                      <p className="text-danger text-start" style={{ fontSize: "14px" }}>
                        {errors.brandId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="input_wrapper col-lg-12">
                <label>Description*</label>
                <CustomTextArea
                  register={{
                    ...register("description", {
                      required: "Description is required",
                    }),
                  }}
                  errors={errors.description}
                />
              </div>
              {/* <div className="col-lg-6 col-md-6 input_wrapper"> */}

              <div className="col-12 mt-3 input_wrapper">
                <label>Model Photos*</label>
              </div>
              {/* other */}

              {otherDocuments.length > 0 &&
                otherDocuments?.map((file, index) => {
                  return (
                    <div className="col-lg-3 col-md-4 mt-1" key={index}>
                      <div className="document_picker_wrapper">
                        <div className="document_picker overflow-visible">
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
                          <span
                            className="p-1 document_delete"
                            onClick={() => {
                              deleteDocument(index);
                            }}
                            title="delete"
                          >
                            <svg
                              width="23"
                              height="23"
                              viewBox="0 0 23 23"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g clip-path="url(#clip0_5168_20178)">
                                <rect
                                  x="11.3135"
                                  width="16"
                                  height="16"
                                  rx="8"
                                  transform="rotate(45 11.3135 0)"
                                  fill="#DC3545"
                                />
                                <path
                                  d="M13.0812 10.253C13.2765 10.0578 13.2765 9.74119 13.0812 9.54593C12.886 9.35068 12.5694 9.35067 12.3741 9.54593L11.3135 10.6066L10.2528 9.54593C10.0576 9.35067 9.74097 9.35068 9.54571 9.54593C9.35045 9.74119 9.35045 10.0578 9.54571 10.253L10.6064 11.3137L9.54571 12.3744C9.35045 12.5696 9.35045 12.8862 9.54571 13.0815C9.74097 13.2767 10.0576 13.2767 10.2528 13.0815L11.3135 12.0208L12.3741 13.0815C12.5694 13.2767 12.886 13.2767 13.0812 13.0815C13.2765 12.8862 13.2765 12.5696 13.0812 12.3744L12.0206 11.3137L13.0812 10.253Z"
                                  fill="#F3F8FF"
                                />
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M16.3811 6.24611C13.5823 3.44735 9.04464 3.44735 6.24588 6.24611C3.4471 9.04489 3.44712 13.5826 6.24588 16.3813C9.04465 19.1801 13.5823 19.1801 16.3811 16.3813C19.1798 13.5826 19.1799 9.04489 16.3811 6.24611ZM6.95299 6.95322C9.36122 4.54499 13.2657 4.54499 15.674 6.95322C18.0822 9.36143 18.0822 13.266 15.674 15.6742C13.2658 18.0824 9.3612 18.0824 6.95299 15.6742C4.54475 13.266 4.54477 9.36143 6.95299 6.95322Z"
                                  fill="#F3F8FF"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_5168_20178">
                                  <rect
                                    x="11.3135"
                                    width="16"
                                    height="16"
                                    rx="8"
                                    transform="rotate(45 11.3135 0)"
                                    fill="white"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {otherDocuments.length < 4 ? (
                <div className="col-lg-3 col-md-4 mt-1">
                  <div className="document_picker_wrapper">
                    <label for="otherDocument">
                      <div className="document_picker">
                        <input
                          type="file"
                          className="d-none"
                          id={"otherDocument"}
                          onChange={(event) => {
                            selectFile(event);
                          }}
                        />
                        <FontAwesomeIcon icon={faCirclePlus} className="icon fontAwesome_icon" />
                        <p>Add</p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>

            {/* </div> */}

            <div className="form_button_wrapper mt-2">
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
