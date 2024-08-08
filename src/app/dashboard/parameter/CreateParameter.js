"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import { getCategory } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;

function CreateParameter({ data }) {
  const { modalStates, setModalStates, setIsPageUpdated, getAllParameter } = data;
  const [buttonLoader, setButtonLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [timeoutId, setTimeoutId] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [CategoryMapData, setCategoryMapData] = useState([]);
  // const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [errorForRackFlag, setErrorRackFlag] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [_categoryId, _setCategoryId] = useState("");
  const router = useRouter();
  const [categoryFillById, setCategoryFillById] = useState();
  const [_parameterList, _setPrameterList] = useState([]);
  const [parameterInput, setParameterInput] = useState("");
  const [parameter, setParameter] = useState([]);
  const searchParams = useSearchParams();
  const [parameterId, setparameterId] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm();
  // const _parameterInput = watch("parameter");
  const category = watch("category");

  function addToPrameterList() {
    // console.log(parameterInput, "parameterInput");

    if (parameterInput) {
      _setPrameterList((prev) => [...prev, parameterInput]);
      setValue("parameter", "");
    } else {
      setError("parameter", {
        message: "Please enter parameter",
      });
    }
  }
  // function deletePrameterList(id) {
  //   _setPrameterList(_parameterList.filter((item) => item != id));
  // }
  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));
    if (modalStates?.type !== "create") {
      // await getBrandById();
    }
  }

  // function addToPrameterList() {
  //   if (parameterInput) {
  //     _setPrameterList((prev) => [...prev, parameterInput]);
  //     setValue("parameter", "");
  //   } else {
  //     setError("parameter", {
  //       message: "Please enter parameter",
  //     });
  //   }
  // }
  function deleteParameterList(id) {
    _setPrameterList(_parameterList.filter((item, index) => index != id));
  }
  // useEffect(() => {
  //   setParameterInput(_parameterInput);
  // }, [_parameterInput]);

  const getParameterById = async (values) => {
    try {
      setLoader(true);

      let response = await communication.getParameterById({ parameterId: modalStates?.id });
      if (response?.data?.status === "SUCCESS") {
        setCategoryFillById(response?.data?.parameter?.categoryId);
        let param = response?.data.parameter.parameter[0];
        setparameterId(response?.data?.parameter_id);
        setValue("category", response?.data?.parameter?.categoryId);
        _setCategoryId(response?.data?.parameter?.categoryId);
        // setValue("parameter", param);
        _setPrameterList([...response?.data?.parameter?.parameter]);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message);
        router.push("/");
      } else {
        toast.info(response.data.message);
        // toast.warn(response.data.message);
      }
    } catch (error) {
      // Swal.fire({ text: error.message, icon: "warning" });
      toast.error(error.message);
    } finally {
      setLoader(false);
    }
  };
  const onSubmit = async (values) => {
    if (_parameterList.length == 0 && values.parameter == "") {
      setError("parameter", {
        message: "Parameter is required",
      });
    } else {
      try {
        let payload = {
          parameterId: modalStates?.id,
          // parameterId: searchParams.get("parameterId"),

          // parameterId: searchParams.get("parameterId"),
          parameter: [..._parameterList],
          categoryId: values.category,
        };
        setLoader(true);
        const serverResponse = await communication.updateParameter(payload);
        if (serverResponse?.data?.status === "SUCCESS") {
          // router.push("/admin/dashboard/parameter/");
          toast.success(serverResponse.data.message);
          setModalStates((prev) => ({ ...prev, modal: false }));
          getAllParameter();
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
          toast.info(serverResponse.data.message);
          router.push("/");
        } else {
          toast.info(serverResponse.data.message);
        }
        setLoader(false);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
        // Swal.fire({
        //   text: error?.response?.data?.message || error.message,
        //   icon: "warning",
        // });
        setLoader(false);
      }
    }
  };
  const createParameter = async (values) => {
    if (_parameterList.length == 0 && values.parameter == "") {
      setError("parameter", {
        message: "Parameter is required",
      });
    } else {
      try {
        let payload = {
          parameter: [..._parameterList],
          categoryId: values.category,
        };
        setLoader(true);
        const serverResponse = await communication.createParameter(payload);
        if (serverResponse?.data?.status === "SUCCESS") {
          toast.success(serverResponse.data.message);
          //  toast.success(serverResponse?.data?.message);
          reset();
          getAllParameter();
          setModalStates((prev) => ({ ...prev, modal: false }));
          await getAllParameter(currentPage, searchString);
        } else if (serverResponse?.data?.status === "JWT_INVALID") {
          toast.info(serverResponse.data.message);
          router.push("/");
        } else {
          toast.info(serverResponse.data.message);
        }
        setLoader(false);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
        // Swal.fire({
        //   text: error?.response?.data?.message || error.message,
        //   icon: "warning",
        // });
        setLoader(false);
      }
    }
  };
  // useEffect(() => {
  //   getCategory(setLoader, router, setCategoryList);
  //   getParameterById();
  // }, []);
  useEffect(() => {
    if (modalStates?.type === "update") {
      getParameterById();
      // getCategory(setLoader, router, setCategoryList);
    } else {
      _setPrameterList([]);
    }
  }, []);

  // useEffect(() => {
  //   if (categoryFillById && categoryList.length > 0) {
  //     setValue("category", `${categoryFillById}`);
  //   }
  // }, [categoryFillById && categoryList.length]);
  useEffect(() => {
    initialAPICall();
  }, []);

  useEffect(() => {
    setValue("category", category);
  }, [category, CategoryMapData.length]);

  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal" style={{ width: "40%" }}>
          <div className="form_modal_header">
            <h5 className="title">
              {modalStates?.type === "create" ? "Create Parameter" : "Update Parameter"}
            </h5>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
              className="close_modal_icon"
            />
          </div>
          <div className="form_modal_body">
            <div className="row d-flex align-items-end">
              <div className="col-lg-6 col-md-6 input_wrapper">
                <label>Category*</label>
                <SelectBox
                  options={CategoryMapData}
                  displayName={"name"}
                  value={"_id"}
                  firstOption={"Category"}
                  disable={false}
                  register={{
                    ...register("category", {
                      required: "category is required",
                    }),
                  }}
                  errors={errors.category}
                  style={{fontSize:"10px",color:"red"}}
                />
              </div>
            </div>
            <div className="row d-flex align-items-end">
              <div className="col-lg-6 col-md-6 input_wrapper">
                <label>Parameter*</label>
                <InputBox
                  type={"text"}
                  onChange={(e) => setParameterInput(e.target.value)}
                  register={{
                    ...register("parameter", {
                      // required: "Parameter is required",
                    }),
                  }}
                  errors={errors.parameter}
                />
              </div>
              <div className="col-lg-4 col-md-4 input_wrapper">
                <CustomBtn
                  name="Add"
                  type="button"
                  className="btn btn-success"
                  onClick={addToPrameterList}
                />
              </div>
            </div>
            {/* {_parameterList?.map((ele, index) => {
              return (
                <div className="row d-flex align-items-end" key={index}>
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <InputBox value={ele} />
                  </div>
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <FontAwesomeIcon
                      icon={faTrash}
                      onClick={() => deleteParameterList(index)}
                      className="trash fontAwesome_icon cursor_pointer"
                    />
                  </div>
                </div>
              );
            })} */}
            {/* <div className=""> */}
            {_parameterList
              ?.reduce((rows, key, index) => {
                // Create a new row after every 3 items
                if (index % 3 === 0) rows.push([]);
                // Add the current item to the last row
                rows[rows.length - 1].push(key);
                return rows;
              }, [])
              .map((row, rowIndex) => (
                <div className="row d-flex align-items-end" key={rowIndex}>
                  {row.map((ele, colIndex) => (
                    <div
                      className="col-lg-4 col-md-5 d-flex align-items-center input_wrapper"
                      key={colIndex}
                    >
                      <InputBox value={ele} disable={true} />
                      <FontAwesomeIcon
                        icon={faTrash}
                        onClick={() => deleteParameterList(rowIndex * 3 + colIndex)}
                        className="trash fontAwesome_icon cursor_pointer ml-2"
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            {/* </div> */}

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
                  modalStates?.type == "create"
                    ? handleSubmit(createParameter)
                    : handleSubmit(onSubmit)
                }
              />
              {/* <CustomBtn name={buttonLoader ? <ButtonLoader /> :  handleSubmit(onSubmit) } /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateParameter;
