"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import { getCategory } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function CreateBrand({ data }) {
  const { modalStates, setModalStates, setIsPageUpdated, getBrandList, currentPage,searchString } = data;
  const [loader, setLoader] = useState(false);
  const [CategoryMapData, setCategoryMapData] = useState([])
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors }, } = useForm();

  async function onSubmit(values) {
    try {
      setLoader(true);
      let response;
      if (modalStates?.type === "create") {
        response = await communication.createBrand({
          name: values.name,
          categoryId: values.categoryId,
        });
      } else {
        response = await communication.updateBrand({
          brandId: modalStates.id,
          name: values.name,
          categoryId: values.categoryId,
        });
      }
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message);
        setModalStates(pre => ({
          modal: false,
          type: "",
          id: "",
        }))
        // setIsPageUpdated(true)
        getBrandList(currentPage,searchString)

      } else if (response?.data?.status === "JWT_INVALID") {
        toast.info(response.data.message)
        router.push("/");
      } else {
        toast.info(response.data.message)
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.message);
      setLoader(false);
    }
  }

  const getBrandById = async () => {
    try {
      setLoader(true);
      const responseFromServer = await communication.getBrandById({ brandId: modalStates.id });
      if (responseFromServer?.data?.status === "SUCCESS") {
        const brandData = responseFromServer?.data?.brand;
        console.log("brandData",brandData);
        setValue("name", brandData.name);
        setValue("categoryId", brandData?.categoryId?._id);
      } else if (responseFromServer?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message)
        router.push("/");
      } else {
        toast.info(serverResponse.data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  }

  async function initialAPICall() {
    setCategoryMapData(await getCategory(router));
    if (modalStates?.type !== "create") {
      await getBrandById()
    }
  }
  useEffect(() => {
    initialAPICall();
  }, []);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal">
          <div className="form_modal_header">
            <h5 className="title">
              {modalStates?.type === "create" ? "Create Brand" : "Update Brand"}
            </h5>
            <FontAwesomeIcon
              icon={faCircleXmark}
              onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
              className="close_modal_icon"
            />
          </div>
          <div className="form_modal_body">
            <div className="row">
              <div className="input_wrapper col-md-6">
                <label>Brand Name*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("name", {
                      required: "Brand Name is required",
                    }),
                  }}
                  errors={errors.name}
                />
              </div>
              <div className="input_wrapper col-md-6">
                <label>Category*</label>
                <SelectBox
                  firstOption="select Category"
                  options={CategoryMapData}
                  displayName={'name'}
                  value={'_id'}
                  disable={false}
                  register={{
                    ...register("categoryId")
                  }}
                />
              </div>
            </div>

            <div className="form_button_wrapper">
              <CustomBtn
                name={
                  modalStates?.type === "create" ? (
                    "Create"
                  ) : (
                    "Update"
                  )
                }
                onClick={handleSubmit(onSubmit)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateBrand;
