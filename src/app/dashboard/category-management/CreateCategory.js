"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import groupArray from "@/helper/groupArray";
import { getCategory } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function CreateCategory({ data }) {
  const { modalStates, setModalStates, setIsPageUpdated } = data;
  const [buttonLoader, setButtonLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  // const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [errorForRackFlag, setErrorRackFlag] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [categoryId, setCategoryId] = useState();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch
  } = useForm();
  const selectedGroup = watch("group");

  const onSubmit = async (values) => {
    if (selectedOption == "") {
      toast.warn("Please confirm one");
      return;
    }

    try {
      let payload = {
        name: values.category,
        group: values.group,
        // isReplaceable: selectedOption === "Yes" ? true : false,
        isReplaceable: selectedOption === "Yes" ? true : false,
      };
      setButtonLoader(true);
      const serverResponse = await communication.createCategory(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setSelectedOption("");
        setErrorRackFlag("");
        reset();
        // getCategory(setLoader, router, props.setCategoryList);
        setButtonLoader(false);
        setModalStates((prev) => ({ ...prev, modal: false }));
        setIsPageUpdated((prev) => !prev);
        toast.success(serverResponse?.data?.message);
        // await getAllCategory(currentPage, searchString);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        toast.warn(serverResponse.data.message);
      }
      setButtonLoader(false);
    } catch (error) {
      toast.warn(error?.response?.data?.message || error.message);
      setButtonLoader(false);
    }
  };
  const getCategoryById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getCategoryById({ categoryId: modalStates?.id });
      if (response?.data?.status === "SUCCESS") {
        // let user = response.data.user;
        setCategoryId(response.data.category._id);
        setValue("category", response.data.category.name);
        setValue("group", response.data.category.group?.toUpperCase());
        setSelectedOption(response.data.category.isReplaceable ? "Yes" : "No");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        router.push("/");
      } else {
        toast.warn(response.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.warn(error.message);
    }
  };
  const updateExistingCategory = async (values) => {
    if (selectedOption == "") {
      seterrorForCategoryFlag("Please confirm one");
      return;
    }
    try {
      let payload = {
        categoryId: categoryId,
        name: values.category,
        group: values.group,
        isReplaceable: selectedOption === "Yes" ? true : false,
      };
      setButtonLoader(true);
      const serverResponse = await communication.updateCategory(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setButtonLoader(false);
        setModalStates((prev) => ({ ...prev, modal: false }));
        setIsPageUpdated((prev) => !prev);
        toast.success(serverResponse?.data?.message);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        toast.warn(serverResponse.data.message);
      }
      setButtonLoader(false);
    } catch (error) {
      toast.warn(error?.response?.data?.message || error.message);
      setButtonLoader(false);
    }
  };
  const CheckboxChange = (event) => {
    setSelectedOption(event.target.value);
    setErrorRackFlag("");
  };
  useEffect(() => {
    if (modalStates?.type === "update") {
      getCategoryById();
    }
  }, []);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal">
          <div className="form_modal_header">
            <h5 className="title">
              {modalStates?.type === "create" ? "Create Category" : "Update Category"}
            </h5>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
              className="close_modal_icon"
            />
          </div>
          <div className="form_modal_body">
            <div className="input_wrapper row">
              <div className="input_wrapper col-6">
                <label>Category Name*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("category", {
                      required: "Category Name is required",
                    }),
                  }}
                  errors={errors.category}
                />
              </div>
              <div className="input_wrapper col-6">
                <label>Select Group*</label>
                <SelectBox
                  firstOption="Select Group"
                  options={groupArray}
                  selectedValue={selectedGroup}
                  value={selectedGroup}
                  register={{
                    ...register("group"),
                    required: "Group is required",
                  }}
                />

              </div>
            </div>
            <div className="input_wrapper col-6">
              <label>Will this category be added to the material? *</label>
              <div className="check_box col-12">
                <div className="row">
                  {" "}
                  <div className="form-check col-12 d-flex gap-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="Yes"
                      checked={selectedOption === "Yes"}
                      onChange={CheckboxChange}
                    />
                    <label className="form-check-label me-5">No</label>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="No"
                      checked={selectedOption === "No"}
                      onChange={CheckboxChange}
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="form_button_wrapper">
              <CustomBtn
                name={
                  buttonLoader ? (
                    <ButtonLoader />
                  ) : modalStates?.type === "create" ? (
                    "Create"
                  ) : (
                    "Update"
                  )
                }
                onClick={
                  modalStates?.type === "create"
                    ? handleSubmit(onSubmit)
                    : handleSubmit(updateExistingCategory)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateCategory;
