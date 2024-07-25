"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import { communication } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Multiselect from "multiselect-react-dropdown";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
// import { block } from "sharp";

function CreateBlock({ data }) {
  const { modalStates, setModalStates, setIsPageUpdated } = data;
  const [buttonLoader, setButtonLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const router = useRouter();
  const [locationList, setLocationList] = useState([]);
  const [locationId, setLocationId] = useState("");
  const [blockId, setBlockId] = useState();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const location = watch("locationId");
  const onSubmit = async (values) => {
    try {
      let payload = {
        locationId: values.locationId,
        blockNo: values.blockNo,
      };
      setLoader(true);
      const serverResponse = await communication.createBlock(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        setButtonLoader(false);
        setModalStates((prev) => ({ ...prev, modal: false }));
        setIsPageUpdated((prev) => !prev);
        reset();
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        toast.warn(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  };
  // console.log("data", data);
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
  const getBlockById = async () => {
    try {
      setLoader(true);

      let response = await communication.getBlockById({
        // blockId: blockId,
        blockId: modalStates?.id,
      });
      if (response?.data?.status === "SUCCESS") {
        setLocationId(response?.data.block.locationId);
        setBlockId(response?.data.block?._id);
        setValue("blockNo", response?.data.block.blockNo);
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
  const updateExistingBlock = async (values) => {
    try {
      let payload = {
        blockId: blockId,
        locationId: values.locationId,
        blockNo: values.blockNo,
        // isRackAdded: true, //bypass
      };

      setLoader(true);
      const serverResponse = await communication.updateBlock(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        setButtonLoader(false);
        setModalStates((prev) => ({ ...prev, modal: false }));
        setIsPageUpdated((prev) => !prev);
        router.push("dashboard/block-management");
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        toast.warn(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  };
  useEffect(() => {
    if (modalStates?.type === "update") {
      getBlockById();
    }
  }, []);
  useEffect(() => {
    setValue("locationId", locationId);
  }, [locationId, locationList.length >= 1]);
  useEffect(() => {
    // getBlockById();
    getLocations();
  }, []);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="form_modal_wrapper">
        <div className="form_modal">
          <div className="form_modal_header">
            <h5 className="title">
              {modalStates?.type === "create" ? "Create Block" : "Update Block"}
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
                <label>Location*</label>
                <SelectBox
                  options={locationList}
                  displayName={"name"}
                  value={"_id"}
                  firstOption={"select Location"}
                  disable={false}
                  // defaultValue={"location"} //selected value
                  // selectedValues={"66a09f2485170fd1552a19b8"}
                  register={{
                    ...register("locationId", {
                      required: "location is required",
                    }),
                  }}
                  errors={errors.locationId}
                />
              </div>
              <div className="input_wrapper col-md-6">
                <label>Block Name*</label>
                <InputBox
                  type={"text"}
                  register={{
                    ...register("blockNo", {
                      required: "Block Name is required",
                    }),
                  }}
                  errors={errors.blockNo}
                />
              </div>{" "}
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
                    : handleSubmit(updateExistingBlock)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateBlock;
