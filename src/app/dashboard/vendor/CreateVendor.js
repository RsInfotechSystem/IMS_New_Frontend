"use client"
import ButtonLoader from '@/common-components/ButtonLoader'
import CustomBtn from '@/common-components/CustomBtn'
import InputBox from '@/common-components/InputBox'
import Loader from '@/common-components/Loader'
import MultiSelect from '@/common-components/MultiSelect'
import SelectBox from '@/common-components/Select'
import { communication } from '@/services/communication'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

function CreateVendor({ data }) {
    const { modalStates, setModalStates, getUserList, } = data;
    const [buttonLoader, setButtonLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const router = useRouter();
    const { register, handleSubmit, setValue, formState: { errors }, } = useForm();

    //fetch vendor details on initial load
    const fetchUserDetails = async () => {
        try {
            setLoader(true);
            const serverResponse = await communication.getVendorById(modalStates?.id);
            if (serverResponse?.data?.status === "SUCCESS") {
                setLoader(false);
                setValue("name", serverResponse?.data?.vendor?.name)
                setValue("email", serverResponse?.data?.vendor?.email)
                setValue("mobile", serverResponse?.data?.vendor?.mobile)
                setValue("code", serverResponse?.data?.vendor?.code)
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                router.push("/");
            } else {
                setLoader(false)
            }
        } catch (error) {
            setLoader(false);
        }
    }

    //update vendor
    const updateExistingUser = async (values) => {
        try {
            const dataToSend = {
                name: values.name,
                email: values.email,
                mobile: values.mobile,
                code: values.code,
                vendorId: modalStates?.id
            }

            setButtonLoader(true);
            const serverResponse = await communication.updateVendor(dataToSend);
            if (serverResponse?.data?.status === "SUCCESS") {
                setButtonLoader(false);
                setModalStates((prev) => ({ ...prev, modal: false }));
                // setIsPageUpdated((prev) => !prev);
                getUserList(1, "");

                toast.success(serverResponse?.data?.message, {
                    autoClose: 1500 // 1.5 seconds
                })
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse?.data?.message, {
                    autoClose: 1500 // 1.5 seconds
                });
                router.push("/");
            } else {
                setButtonLoader(false);
                toast.info(serverResponse?.data?.message, {
                    autoClose: 1500 // 1.5 seconds
                })
            }
        } catch (error) {
            setButtonLoader(false);
            toast.error(error.message, {
                autoClose: 1500 // 1.5 seconds
            })
        }
    }

    useEffect(() => {
        if (modalStates?.type === "update") {
            fetchUserDetails();
        }
    }, []);

    // create Vendor
    const onSubmit = async (values) => {
        try {
            //   setLoader(true);
            setButtonLoader(true);
            let payload = {
                name: values.name,
                email: values.email,
                mobile: values.mobile,
                code: values.code
            };

            let response = await communication.CreateVendor(payload);
            if (response?.data?.status === "SUCCESS") {
                toast.success(response.data.message, {
                    autoClose: 1500 // 1.5 seconds
                });
                setButtonLoader(false);
                setModalStates((prev) => ({ ...prev, modal: false }));
                getUserList(1, "");
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message, {
                    autoClose: 1500 // 1.5 seconds
                });
                router.push("/");
                setButtonLoader(false);
            } else {
                toast.info(response.data.message, {
                    autoClose: 1500 // 1.5 seconds
                });
                setButtonLoader(false);
            }
        } catch (error) {
            toast.info(error.message, {
                autoClose: 1500 // 1.5 seconds
            });
        } finally {
            //   setLoader(false);
            setButtonLoader(false);
        }

    };


    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="form_modal_wrapper">
                <div className="form_modal" style={{ width: "55%" }}>
                    <div className="form_modal_header">
                        <h5 className="title">{modalStates?.type === "create" ? "Create Vendor" : "Update Vendor"}</h5>
                        <FontAwesomeIcon icon={faCircleXmark} onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))} className="close_modal_icon" />
                    </div>
                    <div className="form_modal_body form_modal_img">
                        <div className='row'>
                            <div className="input_wrapper col-lg-4 col-md-6 col-sm-6">
                                <label >Vendor Name*</label>
                                <InputBox type={"text"}
                                    register={{
                                        ...register("name", {
                                            required: "Name is required",
                                        })
                                    }}
                                    errors={errors.name}
                                />
                            </div>
                            <div className="input_wrapper col-lg-4 col-md-6 col-sm-6">
                                <label >Vendor Code*</label>
                                <InputBox type={"text"}
                                    register={{
                                        ...register("code", {
                                            required: "Vendor Code is required",
                                        })
                                    }}
                                    errors={errors.code}
                                />
                            </div>
                            <div className="input_wrapper col-lg-4 col-md-6 col-sm-6">
                                <label >Email</label>
                                <InputBox type={"text"}
                                    register={{
                                        ...register("email", {
                                            pattern: {
                                                value: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                                                message: "Invalid email address",
                                            },
                                            maxLength: {
                                                value: 35,
                                                message: "Email cannot be longer than 35 characters",
                                            },
                                        })
                                    }}
                                    errors={errors.email}
                                />
                            </div>

                            <div className="input_wrapper col-lg-4 col-md-6 col-sm-6">
                                <label >Contact No.</label>
                                <InputBox type={"number"}
                                    register={{
                                        ...register("mobile", {
                                            minLength: {
                                                value: 10,
                                                message: "Mobile Should be 10 digits",
                                            },
                                            maxLength: {
                                                value: 10,
                                                message: "Mobile Should be 10 digits",
                                            },
                                        })
                                    }}
                                    errors={errors.mobile}
                                />
                            </div>
                        </div>

                        <div className="form_button_wrapper">
                            <CustomBtn name={buttonLoader ? <ButtonLoader /> : modalStates?.type === "create" ? "Create" : "Update"} onClick={modalStates?.type == "create" ? handleSubmit(onSubmit) : handleSubmit(updateExistingUser)} />


                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateVendor