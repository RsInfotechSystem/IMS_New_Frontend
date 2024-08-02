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

function CreateUser({ data }) {
    const { modalStates, setModalStates, setIsPageUpdated, locations, roleList, getUserList,searchString,currentPage } = data;
    const [propertyType, setPropertyType] = useState([]);
    const [userById, setUserById] = useState("")
    const [selectedLocation, setSelectedLocation] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState([]);
    const [validationMessage, setValidationMessage] = useState('');
    const [defaultLocation, setDefaultLocation] = useState([])
    const [locationId, setLocationId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [buttonLoader, setButtonLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const [departmentId, setDepartmentId] = useState("");
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    //fetch department details on initial load
    const fetchUserDetails = async () => {
        try {
            setLoader(true);
            const serverResponse = await communication.getUserById(modalStates?.id);
            if (serverResponse?.data?.status === "SUCCESS") {
                setLoader(false);
                setUserById(serverResponse?.data?.user);
                // setValue("role",serverResponse?.data?.user?.role)
                setValue("name", serverResponse?.data?.user?.name)
                setValue("email", serverResponse?.data?.user?.email)
                setValue("mobile", serverResponse?.data?.user?.mobile)
                setValue("password", serverResponse?.data?.user?.password)
                setDefaultLocation(serverResponse?.data?.user?.locationId);
                setRoleId(serverResponse?.data?.user?.roleId)
                setValue("role", serverResponse?.data?.user?.roleId)
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                router.push("/");
            } else {
                setLoader(false)
            }
        } catch (error) {
            setLoader(false);
        }
    }

    //update department
    const updateExistingUser = async (values) => {
        if (selectedLocationId.length <= 0) {
            // setValidationMessage('Please select at least one location.');
            toast.info("Please select at least one location.")
            return
        }
        // if (selectedLocation.length <= 0) {
        //     setValidationMessage('Please select at least one location.');
        //     return
        // } 
        try {
            const dataToSend = {
                name: values.name,
                email: values.email,
                mobile: values.mobile,
                password: values.password,
                userId: modalStates?.id,
                roleId: values.role,
                // locationId: values.locationId,
                locationId: selectedLocationId.length >= 1 ? selectedLocationId : defaultLocation.map((item) => item._id),
            }

            setButtonLoader(true);
            const serverResponse = await communication.updateUser(dataToSend);
            if (serverResponse?.data?.status === "SUCCESS") {
                setButtonLoader(false);
                setModalStates((prev) => ({ ...prev, modal: false }));
                // setIsPageUpdated((prev) => !prev);
                getUserList(currentPage, searchString);

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

    /// new
    const onSubmit = async (values) => {
        if (selectedLocation.length == 0) {
            setValidationMessage('Please select at least one location.');
            return
        } else {
            try {
                //   setLoader(true);
                setButtonLoader(true);
                let payload = {
                    name: values.name,
                    email: values.email,
                    mobile: values.mobile,
                    password: values.password,
                    roleId: values.role,
                    locationId: selectedLocationId,
                    // locationId: [locationId],
                };

                let response = await communication.createUser(payload);
                if (response?.data?.status === "SUCCESS") {
                    toast.success(response.data.message, {
                        autoClose: 1500 // 1.5 seconds
                    });
                    setButtonLoader(false);
                    setModalStates((prev) => ({ ...prev, modal: false }));
                    getUserList(currentPage, searchString);
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
        }
    };

    // handle category mulitiselect data 
    const handleLocationSelect = (selectedOptions) => {
        // if (selectedOptions?.length === 0) {
        //     setValidationMessage('Please select at least one location.');
        // } else {
        setValidationMessage('');
        setSelectedLocation(selectedOptions);
        const selectedIds = selectedOptions?.map(option => option?._id);
        setSelectedLocationId(selectedIds);
        // }
    };

    // console.log("selectedLocationId", selectedLocationId,"selectedLocation",selectedLocation)


    useEffect(() => {
        setValue("locationId", locationId);
    }, [locationId, locations.length]);


    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="form_modal_wrapper">
                <div className="form_modal" style={{ width: "55%" }}>
                    <div className="form_modal_header">
                        <h5 className="title">{modalStates?.type === "create" ? "Create User" : "Update User"}</h5>
                        <FontAwesomeIcon icon={faCircleXmark} onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))} className="close_modal_icon" />
                    </div>
                    <div className="form_modal_body">
                        <div className='row'>
                            <div className="input_wrapper col-md-4">
                                <label >Role*</label>
                                <SelectBox
                                    options={roleList}
                                    displayName={"role"}
                                    value={"_id"}
                                    firstOption={"Select Role"}
                                    disable={false}
                                    defaultValue={""} //selected value
                                    style={{ height: '30px' }}
                                    register={{
                                        ...register("role", {
                                            required: "Role is required",
                                        })
                                    }}
                                    errors={errors.role}
                                />                            
                            </div>
                            <div className="input_wrapper col-md-4">
                                <label >User Name*</label>
                                <InputBox type={"text"}
                                    register={{
                                        ...register("name", {
                                            required: "Name is required",
                                        })
                                    }}
                                    errors={errors.name}
                                />
                            </div>
                            <div className="input_wrapper col-md-4">
                                <label >Email*</label>
                                <InputBox type={"text"}
                                    register={{
                                        ...register("email", {
                                            required: "Email is required",
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
                            <div className="input_wrapper col-md-4">
                                <label >Location*</label>
                                <MultiSelect
                                    placeholder="Select Location"
                                    options={locations}
                                    displayValue={"name"}
                                    selectedValues={modalStates?.type === "update" ? defaultLocation : selectedLocation}
                                    // selectedValues={defaultLocation}

                                    showCheckbox={false}
                                    disable={false}
                                    keepSearchTerm={true}
                                    onSelect={handleLocationSelect}
                                    onRemove={handleLocationSelect}
                                    rules={{ required: "Location is required" }}
                                    {...register("location")}

                                />
                                {validationMessage && <p style={{ color: '#dc3545' }}>{validationMessage}</p>}
                            </div>

                            <div className="input_wrapper col-md-4">
                                <label >Contact No.*</label>
                                <InputBox type={"number"}
                                    register={{
                                        ...register("mobile", {
                                            required: "Mobile Number is required",
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
                            <div className="input_wrapper col-md-4">
                                <label >Password*</label>
                                <InputBox type={"text"}
                                    register={{
                                        ...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 8,
                                                message: "Password should be at least 8 characters long",
                                            },
                                            maxLength: {
                                                value: 20,
                                                message: "Password cannot be longer than 20 characters",
                                            },
                                            pattern: {
                                                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                                                message:
                                                    "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
                                            }
                                        })
                                    }}
                                    errors={errors.password}
                                />
                            </div>
                        </div>

                        <div className="form_button_wrapper">
                            <CustomBtn name={buttonLoader ? <ButtonLoader /> : modalStates?.type === "create" ? "Create" : "Update"} onClick={modalStates?.type == "create" ? handleSubmit(onSubmit) : handleSubmit(updateExistingUser)} />
                            {/* <CustomBtn name={buttonLoader ? <ButtonLoader /> :  handleSubmit(onSubmit) } /> */}

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateUser