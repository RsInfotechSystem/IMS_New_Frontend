"use client"
import CustomBtn from '@/common-components/CustomBtn'
import InputBox from '@/common-components/InputBox'
import Loader from '@/common-components/Loader'
import { communication } from '@/services/communication'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

function CreateLocation({ data }) {
    const { modalStates, setModalStates, setIsPageUpdated, getLocation } = data;
    const [loader, setLoader] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, setValue, formState: { errors }, } = useForm();


    //create location
    const onSubmit = async (values) => {
        try {
            setLoader(true);
            let serverResponse;
            if (modalStates.type === "create") {
                serverResponse = await communication.createLocation({
                    name: values?.location,
                });
            } else {
                serverResponse = await communication.updateLocationById({
                    name: values?.location,
                    locationId: modalStates.locationId
                });
            }

            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                getLocation(1, "");
                setModalStates(pre => ({ ...pre, type: "", locationId: "", modal: false }))
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.error(error.message);
            setLoader(false);
        }
    };

    const getLocationById = async () => {
        try {
            setLoader(true);
            let serverResponse = await communication.getLocationById({ locationId: modalStates.locationId, });
            if (serverResponse?.data?.status === "SUCCESS") {
                setValue("location", serverResponse.data.location.name);
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.error(error.message);
            setLoader(false);
        }
    };

    useEffect(() => {
        if (modalStates?.type === "update") {
            getLocationById();
        }
    }, []);

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="form_modal_wrapper">
                <div className="form_modal">

                    <div className="form_modal_header">

                        <h5 className="title">{modalStates?.type === "create" ? "Create Location" : "Update Location"}</h5>
                        <FontAwesomeIcon icon={faCircleXmark} onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))} className="close_modal_icon" />
                    </div>
                    <div className="form_modal_body">
                        <div className="input_wrapper col-12">
                            <label >Location*</label>
                            <InputBox type={"text"}
                                register={{
                                    ...register("location", {
                                        required: "Location is required",
                                    })
                                }}
                                errors={errors.location}
                            />
                        </div>
                        <div className="form_button_wrapper">
                            <CustomBtn name={modalStates?.type === "create" ? "Create" : "Update"} onClick={handleSubmit(onSubmit)} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateLocation