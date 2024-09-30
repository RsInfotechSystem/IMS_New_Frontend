"use client";

import Button from "@/common-components/Button";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useState } from "react";
import SelectBox from "@/common-components/Select";
import { statesArray } from "@/utilities/statesArray";
import { communication } from "@/services/communication";
import { fetchAllCategoriesData, getLocations } from "@/services/commonApis";
import { toast } from "react-toastify";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CustomBtn from "@/common-components/CustomBtn";
import ButtonLoader from "@/common-components/ButtonLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomDateInput from "@/common-components/CustomDateInput";
import { Ruthie } from "next/font/google";
import CustomTextArea from "@/common-components/CustomTextArea";
import ViewSalesOrder from "../../sales-order/create-sales-order/ViewSalesOrderPdf";
gsap.registerPlugin(useGSAP);

const CreateInitialRepair = () => {
    const router = useRouter();
    const params = useSearchParams();


    const [activeTab, setActiveTab] = useState("INFO");
    const [loader, setLoader] = useState(false);
    const {
        register,
        handleSubmit,
        getValues,
        watch,
        formState: { errors },
        setValue,
    } = useForm();

    // State to store the values of the selected category

    const [_locationId, _setLocationId] = useState("");

    const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
        materials: [],
    });
    const [modalState, setModalStates] = useState({
        viewPdf: false,
        data: "",
        viewPrintBill: false,
        status: "",
        remainingAmount: 0,
    });
    const [filterValues, setFilterValues] = useState({
        orderDate: "",
        orderCompleteDate: "",
    });

    // Get all categories list
    const createRepairData = async (values) => {

        try {
            if (!filterValues.queryDate) {
                toast.info("Date is required");
                return;
            }

            setLoader(true);
            const dataToSend = {
                serviceTicketNo: values.serviceTicketNo,
                supportNo: values.supportNo,
                queryDate: filterValues.queryDate,
                serviceReqReceivedFrom: values.serviceReqReceivedFrom,
            };
            let response = await communication.createRepair(dataToSend);
            if (response?.data?.status === "SUCCESS") {
                toast.success(response?.data?.message);
                router.push("/dashboard/initial-repair");
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message);
                router.push("/");
            } else {
                toast.info(response.data.message);
            }
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
        } finally {
            setLoader(false);
        }
        // }
    };
    // const getalluser = async () => {
    //     try {
    //         const payload = {
    //             locationId: _locationId,
    //         };
    //         let response = await communication.getalluser(payload);
    //         setLoader(true);
    //         if (response?.data?.status === "SUCCESS") {
    //             setUser(response?.data?.users);
    //             toast.success(response?.data?.message);
    //             setLoader(false);
    //         } else {
    //             setUser([])
    //             toast.info(response.data.message);
    //             setLoader(false);
    //         }
    //     } catch (error) {
    //         setLoader(false);
    //         toast.warn(error.message);
    //         //   Swal.fire({ text: error.message, icon: "warning" });
    //     }
    // };


    // useEffect(() => {
    //     if (_locationId) {
    //         getalluser();
    //     }
    // }, [_locationId]);







    return (
        <>
            {loader && <Loader text={"Loading..."} />}
            {modalState.viewPdf && (
                <ViewSalesOrder pdfData={modalState?.data} setModalStates={setModalStates} />
            )}

            {/* top header  */}
            <div className="top_header">
                <div className="tab_title">Create Service Ticket</div>
                <div
                    className="back_btn"
                    onClick={() => {
                        activeTab === "INFO" ? router.push("/dashboard/initial-repair") : setActiveTab("INFO");

                    }}
                >
                    <div>
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clip-path="url(#clip0_1564_1770)">
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M3.07615 5.61732C3.23093 5.24364 3.59557 5 4.00003 5H14C17.866 5 21 8.13401 21 12C21 15.866 17.866 19 14 19H5.00003C4.44774 19 4.00003 18.5523 4.00003 18C4.00003 17.4477 4.44774 17 5.00003 17H14C16.7615 17 19 14.7614 19 12C19 9.23858 16.7615 7 14 7H6.41424L8.20714 8.79289C8.59766 9.18342 8.59766 9.81658 8.20714 10.2071C7.81661 10.5976 7.18345 10.5976 6.79292 10.2071L3.29292 6.70711C3.00692 6.42111 2.92137 5.99099 3.07615 5.61732Z"
                                    fill="#184965"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_1564_1770">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div>Back</div>
                </div>
            </div>
            {/* tab wrapper */}
            <div className="my-3 d-flex justify-content-start align-items-start gap-3">


            </div>
            {activeTab === "INFO" && (
                <div id="vendor-information">
                    {/* point of contact person */}
                    <div className="form_wrapper">
                        {/* <div className="form_heading">
              <div>
                <svg
                  width="21"
                  height="22"
                  viewBox="0 0 21 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.32617 4.64625H3.60367V6.165H2.32617V15.9587H3.56117V17.355H2.32617V20.8512H17.1974V1H2.32617V4.64625ZM6.55617 6.49C6.59367 6.46 6.89492 6.235 7.00242 6.15375L6.99492 6.15125C7.00492 6.1475 7.00992 6.14625 7.01617 6.1425C7.02242 6.135 7.04242 6.12125 7.04617 6.1175L7.05117 6.12375C7.23367 6.01625 7.42242 5.94125 7.63742 5.90875C8.21492 5.82375 8.63617 6.42375 8.90992 6.7675C9.18367 7.1075 9.56367 7.65 9.51742 8.02125C9.48992 8.245 9.23367 8.45125 8.99117 8.65375L8.98242 8.64125C8.91617 8.7125 8.62367 9.01125 8.59867 9.05125C8.46492 9.27375 8.31117 9.7775 8.52617 10.1575C8.72992 10.5262 9.13242 11.1237 9.51367 11.6225C9.91617 12.1062 10.4099 12.635 10.7224 12.9187C11.0499 13.215 11.5887 13.1937 11.8412 13.1212C11.8899 13.1087 12.2837 12.875 12.3349 12.85C12.5962 12.67 12.8599 12.48 13.0937 12.5087C13.4724 12.5562 13.9137 13.0512 14.1874 13.3925C14.4612 13.735 14.9537 14.2825 14.7287 14.8075C14.6424 15.0062 14.5174 15.165 14.3624 15.3138L14.3674 15.3188L14.3399 15.3387C14.3349 15.3438 14.3324 15.3488 14.3324 15.3488L14.3274 15.35C14.2249 15.4275 13.9224 15.6587 13.8849 15.6862C13.4649 15.9575 12.5524 16.2962 11.2699 15.5425C10.3187 14.9812 9.27492 14.0287 8.27867 12.8387L8.27367 12.8425C8.22742 12.7837 8.18367 12.725 8.13992 12.6663C8.09367 12.6088 8.04492 12.555 7.99742 12.495L8.00242 12.4913C7.06742 11.2575 6.37992 10.035 6.05742 8.99625C5.62367 7.59625 6.18492 6.82 6.55617 6.49Z"
                    fill="#434343"
                  />
                  <path d="M2.22375 4.75H1V5.99H2.22375V4.75Z" fill="#434343" />
                  <path d="M2.22125 16H1V17.1787H2.22125V16Z" fill="#434343" />
                  <path d="M19.645 3.5H18.5V7.09375H19.645V3.5Z" fill="#434343" />
                  <path d="M19.6088 14.75H18.5V18.3088H19.6088V14.75Z" fill="#434343" />
                  <path d="M19.6263 8.5H18.5V13.3688H19.6263V8.5Z" fill="#434343" />
                </svg>
              </div>
              <div className="heading">Customer Details</div>
            </div> */}
                        <div className="row">
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Service Ticket No.*</label>
                                <InputBox
                                    type={"number"}
                                    register={{
                                        ...register("serviceTicketNo", {
                                            required: "Serivice Ticket No. is required",
                                        }),
                                    }}
                                    errors={errors.serviceTicketNo}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Support No.*</label>
                                <InputBox
                                    type={"number"}
                                    register={{
                                        ...register("supportNo", {
                                            required: "contact number is required",
                                            minLength: { value: 10, message: "contact number must be 10 digit long" },
                                            maxLength: {
                                                value: 10,
                                                message: "contact number cannot be grater than 10 digits",
                                            },
                                        }),
                                    }}
                                    errors={errors.supportNo}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Date*</label>
                                <CustomDateInput
                                    value={filterValues?.queryDate}
                                    minDate={new Date()}
                                    onChange={(date) => {
                                        setFilterValues((prev) => ({ ...prev, queryDate: date }));
                                    }}
                                />
                            </div>

                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Support Request RECD. From:*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("serviceReqReceivedFrom", {
                                            required: "Support Request RECD. is required",
                                        }),
                                    }}
                                    errors={errors.serviceReqReceivedFrom}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Client Name*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("clientName", {
                                            required: "Client Name is required",
                                        }),
                                    }}
                                    errors={errors.clientName}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Client No.*</label>
                                <InputBox
                                    type={"number"}
                                    register={{
                                        ...register("clientNo", {
                                            required: "Client No. is required",
                                        }),
                                    }}
                                    errors={errors.clientNo}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3">
                                <label >Client Email*</label>
                                <InputBox type={"text"}
                                    register={{
                                        ...register("clientMailId", {
                                            required: "Client Email is required",
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
                                    errors={errors.clientMailId}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Client Address*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("clientAddress", {
                                            required: "Client Address is required",
                                        }),
                                    }}
                                    errors={errors.clientAddress}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Initial Checked By*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("initialCheckedBy", {
                                            required: "Client Name is required",
                                        }),
                                    }}
                                    errors={errors.initialCheckedBy}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3">
                                <label>Remark By Technician</label>
                                <CustomTextArea
                                    register={{
                                        ...register("remarkByTechnician", {
                                            required: "Remark By Technician is required",
                                        }),
                                    }}
                                    errors={errors.remarkByTechnician}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3">
                                <label>Material Details</label>
                                <CustomTextArea
                                    register={{
                                        ...register("materialDetails", {
                                            required: "Material Details is required",
                                        }),
                                    }}
                                    errors={errors.materialDetails}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Serial Tag*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("serialTag", {
                                            required: "Serial Tag is required",
                                        }),
                                    }}
                                    errors={errors.serialTag}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Category*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("category", {
                                            required: "Category is required",
                                        }),
                                    }}
                                    errors={errors.category}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3">
                                <label>Item Description and Problem Observed</label>
                                <CustomTextArea
                                    register={{
                                        ...register("itemDesc", {
                                            required: "Item Description & Problem Observed is required",
                                        }),
                                    }}
                                    errors={errors.itemDesc}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Action Taken*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("actionTaken", {
                                            required: "Action Taken is required",
                                        }),
                                    }}
                                    errors={errors.actionTaken}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                            <div className="input_wrapper col-12 col-md-6 col-lg-3 ">
                                <label>Work Assigned To*</label>
                                <InputBox
                                    type={"text"}
                                    register={{
                                        ...register("workAssigned", {
                                            required: "Work Assigned To is required",
                                        }),
                                    }}
                                    errors={errors.workAssigned}
                                    placeholder={""}
                                    disable={false}
                                />
                            </div>
                        </div>
                    </div>
                    {/* order  detail form */}


                    {/* next btn  */}
                    <div className="d-flex align-items-center justify-content-center">
                        <Button
                            name={"Save & Next"}
                            onClick={handleSubmit(createRepairData)}

                        />
                    </div>
                </div>
            )}


        </>
    );
};

export default CreateInitialRepair;
