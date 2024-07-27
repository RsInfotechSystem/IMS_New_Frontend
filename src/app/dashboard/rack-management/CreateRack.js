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

function CreateRack({ data }) {
    const { modalStates, setModalStates, setIsPageUpdated } = data;
    const [buttonLoader, setButtonLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const router = useRouter();
    const [locationList, setLocationList] = useState([]);
    const [locationId, setLocationId] = useState("");
    const [rackId, setRackId] = useState();
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
                rackName: values.rackName,
                partition: Number(values.partition),
            };
            setLoader(true);
            const serverResponse = await communication.createRack(payload);
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

    const getRackById = async () => {
        try {
            setLoader(true);

            let response = await communication.getRackById({
                rackId: modalStates?.id,
            });
            if (response?.data?.status === "SUCCESS") {
                setLocationId(response?.data?.rack?.locationId._id);
                setRackId(response?.data.rack?._id);
                setValue("rackName", response?.data?.rack?.rackName);
                setValue("partition", response?.data?.rack?.partition);
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

    const updateExistingRack = async (values) => {
        try {
            let payload = {
                rackId: rackId,
                locationId: values.locationId,
                rackName: values.rackName,
                partition: Number(values.partition),
            };
            setLoader(true);
            const serverResponse = await communication.updateRackDetails(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                setButtonLoader(false);
                setModalStates((prev) => ({ ...prev, modal: false }));
                setIsPageUpdated((prev) => !prev);
                router.push("rack-management");
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
            getRackById();
        }
    }, []);

    useEffect(() => {
        setValue("locationId", locationId);
    }, [locationId, locationList.length >= 1]);

    useEffect(() => {
        // getRackById();
        getLocations();
    }, []);

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="form_modal_wrapper">
                <div className="form_modal">
                    <div className="form_modal_header">
                        <h5 className="title">
                            {modalStates?.type === "create" ? "Create Rack" : "Update Rack"}
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
                                    firstOption={"Select Location"}
                                    disable={false}
                                    // defaultValue={"location"} //selected value
                                    // selectedValues={"66a09f2485170fd1552a19b8"}
                                    register={{
                                        ...register("locationId", {
                                            required: "Location is required",
                                        }),
                                    }}
                                    errors={errors.locationId}
                                />
                            </div>
                            <div className="input_wrapper col-md-6">
                                <label>Rack Name*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("rackName", {
                                            required: "Rack Name is required",
                                        }),
                                    }}
                                    errors={errors.rackName}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="input_wrapper col-md-6">
                                <label>No of Partition*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("partition", {
                                            required: "Partition Count is required",
                                        }),
                                    }}
                                    errors={errors.partition}
                                />
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
                                        : handleSubmit(updateExistingRack)
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateRack;
