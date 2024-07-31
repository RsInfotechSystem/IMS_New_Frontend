"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import { communication } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Multiselect from '@/common-components/MultiSelect';
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
  const [selectedOption, setSelectedOption] = useState("");
  const [errorForRackFlag, setErrorRackFlag] = useState("");
  const [rackList, setRackList] = useState([]);
  const [propertyType, setPropertyType] = useState([]);
  const [defaultRack, setDefaultRack] = useState([]);
  const [_locationId, _setlocationId] = useState("")

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,

    formState: { errors },
  } = useForm();
  const location = watch("locationId");
  console.log("rahjwal", getValues(locationId))
  const onSubmit = async (values) => {
    let rackIds = values.rackName ? values.rackName : "";
    if (selectedOption == "") {
      setErrorRackFlag("Please confirm one");
      return;
    }
    try {
      let payload = {
        locationId: values.locationId,
        blockNo: values.blockNo,
        isRackAdded: selectedOption === "Yes" ? true : false,
        rackId: propertyType.map(ele => (ele._id)),
      };
      // if (rackIds) {
      //   payload.rackId = [rackIds];
      // }
      setLoader(true);
      const serverResponse = await communication.createBlock(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        setSelectedOption("");
        setButtonLoader(false);
        setModalStates((prev) => ({ ...prev, modal: false }));
        setIsPageUpdated((prev) => !prev);
        setPropertyType([]);
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
        // setDefaultRack([...response?.data?.block?.rackName]);
        setLocationId(response?.data.block.locationId._id);
        setBlockId(response?.data?.block?._id);
        setValue("blockNo", response?.data?.block?.blockNo);
        setSelectedOption(response?.data?.block?.isRackAdded ? "Yes" : "No");
        if (response?.data?.block?.isRackAdded) {
          setPropertyType(response?.data?.block?.rackId)
          await getActiveRack(response?.data.block.locationId._id)
        } else {
          setPropertyType([])
        }
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

  const getActiveRack = async (locationId) => {
    try {
      setLoader(true);
      let response = await communication.getActiveRack(locationId);
      if (response?.data?.status === "SUCCESS") {
        setRackList(response?.data.rack);
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
    let rackIds = values.rackName ? values.rackName : "";
    if (selectedOption == "") {
      setErrorRackFlag("Please confirm one");
      return;
    }
    try {
      let payload = {
        blockId: blockId,
        locationId: values.locationId,
        blockNo: values.blockNo,
        isRackAdded: selectedOption === "Yes" ? true : false,
        rackId: selectedOption === "Yes" ? propertyType.map(ele => (ele._id)) : [],
        // isRackAdded: true, //bypass
      };

      if (rackIds) {
        payload.rackId = [rackIds];
      }
      setLoader(true);
      const serverResponse = await communication.updateBlock(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        setButtonLoader(false);
        setModalStates((prev) => ({ ...prev, modal: false }));
        setIsPageUpdated((prev) => !prev);
        router.push("block-management");
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

  const CheckboxChange = (event) => {
    setSelectedOption(event.target.value);
    setErrorRackFlag("");
  };

  // useEffect(() => {
  //   const selectedIds = defaultRack.map((selectedRackName) => {
  //     const selectedRack = rackList.find((rackData) => rackData.rackName === selectedRackName);
  //     return selectedRack ? selectedRack._id : null;
  //   });

  //   const filteredIds = selectedIds.filter((id) => id !== null);

  //   setPropertyType(filteredIds);
  // }, [defaultRack, rackList.length]);

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

  useEffect(() => {
    if (selectedOption === "Yes") {
      getActiveRack(_locationId);
    }
  }, [_locationId]);
  console.log("rajjjjjj", _locationId)

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
                  onChange={(e) => _setlocationId(e.target.value)
                  }
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
              </div>
            </div>
            <div className="row">
              <label>Want to add rack ? *</label>
              <div className="check_box col-md-6">
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
                    <label className="form-check-label me-5">Yes</label>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="No"
                      checked={selectedOption === "No"}
                      onChange={CheckboxChange}
                    />
                    <label className="form-check-label">No</label>
                  </div>
                  {errorForRackFlag && (
                    <p className="text-danger text-start" style={{ fontSize: "0.8rem" }}>
                      {errorForRackFlag}
                    </p>
                  )}
                </div>
              </div>
              {selectedOption === "Yes" && (
                <>
                  <div className="col-md-4">
                    <label >Rack Select*</label>
                    <Multiselect
                      placeholder="Select Rack"
                      options={rackList}
                      selectedValues={modalStates?.type === "create" ? defaultRack : [...propertyType]}
                      keepSearchTerm={true}
                      displayValue={"rackName"}
                      onSelect={(event) => setPropertyType(event)}
                      onRemove={(event) => setPropertyType(event)}
                      showCheckbox={true}
                      rules={{ required: "Rack name is required" }}
                      {...register("location")}
                    />

                    <div style={{ height: "5px" }}>
                      {errors.rackName && (
                        <p className="text-danger text-start" style={{ fontSize: "0.8rem" }}>
                          {errors.rackName.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
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
