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
import CreateRepairPdf from "./CreatePDF";
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

    const RepairDetailSubmit = (data) => {
        // if (filterValues?.orderDate === "") {
        //     toast.info("OrderDate is required");
        //     return;
        // }
        // if (filterValues?.orderCompleteDate === "") {
        //     toast.info("Order Complete Date is required");
        //     return;
        // }
        try {
            // setFormTabArray((prev) => prev?.map((ele, ind) => ele.tabName === "Working" ? { ...ele, isFormSubmitted: true } : ele));
            setActiveTab("SUPPLY");
        } catch (error) {
            toast.info(error.message);
        }
    };
    // Get all categories list
    const createRepairOrder = async (values) => {

        try {
            if (!filterValues.reportDate) {
                toast.info("Date is required");
                return;
            }

            setLoader(true);
            const dataToSend = {
                serviceTicketNo: values.serviceTicketNo,
                serviceTicketNo: values.serviceTicketNo,
                supportNo: values.supportNo,
                serviceReqReceivedFrom: values.serviceReqReceivedFrom,
                clientName: values.clientName,
                clientNo: values.clientNo,
                clientMailId: values.clientMailId,
                clientAddress: values.clientAddress,
                initialCheckedBy: values.initialCheckedBy,
                initialRemark: values.initialRemark,
                materialDetails: values.materialDetails,
                reportDate: filterValues.reportDate,
                repairMaterials: state.materials
                // serviceReqReceivedFrom: values.serviceReqReceivedFrom,
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
    const addMaterial = () => {
        const { serialTag, category, itemDescriptionNproblemObserved, remark } = getValues();

        if (!itemDescriptionNproblemObserved || !serialTag) {
            toast.info("Add Material");
            return;
        } else {
            setState({
                materials: [
                    ...state.materials,
                    {
                        serialTag: serialTag,
                        category: category,
                        itemDescriptionNproblemObserved: itemDescriptionNproblemObserved,
                        remark: remark,
                        // workAssignTo: workAssignTo,
                        // actionTaken: actionTaken,
                    },
                ],
            });
            // Clear the input fields after adding
            setValue("category", "");
            setValue("itemDescriptionNproblemObserved", "");
            setValue("remark", "");
            setValue("serialTag", "");
            // setValue("actionTaken", "");
        }
    };
    const deleteProduct = (id) => {
        setState({ materials: state.materials.filter((_, index) => index !== id) });
    };

    return (
        <>
            {loader && <Loader text={"Loading..."} />}
            {modalState.viewPdf && (
                <CreateRepairPdf pdfData={modalState?.data} setModalStates={setModalStates} />
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
                <div
                    className="tab_btn"
                    onClick={() => {
                        setActiveTab("INFO");
                    }}
                    style={{ backgroundColor: activeTab == "INFO" ? "#184965" : "#D0D3D9" }}
                >
                    Order Information
                </div>
                <div
                    onClick={() => {
                        setActiveTab("SUPPLY");
                    }}
                    className="tab_btn"
                    style={{ backgroundColor: activeTab == "SUPPLY" ? "#184965" : "#D0D3D9" }}
                >
                    {" "}
                    Order Item
                </div>
            </div>

            {activeTab === "INFO" && (
                <div id="vendor-information">
                    {/* point of contact person */}
                    <div className="form_wrapper">
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
                                            required: "Support No. is required",
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
                                    value={filterValues?.reportDate}
                                    minDate={new Date()}
                                    onChange={(date) => {
                                        setFilterValues((prev) => ({ ...prev, reportDate: date }));
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
                                            required: "contact number is required",
                                            minLength: { value: 10, message: "contact number must be 10 digit long" },
                                            maxLength: {
                                                value: 10,
                                                message: "contact number cannot be grater than 10 digits",
                                            },
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
                                            required: "Initial Person checked by name is required",
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
                                        ...register("initialRemark", {
                                            required: "Remark By Technician is required",
                                        }),
                                    }}
                                    errors={errors.initialRemark}
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
                        </div>
                    </div>
                    {/* next btn  */}
                    <div className="d-flex align-items-center justify-content-center">
                        <Button
                            name={"Save & Next"}
                            onClick={handleSubmit(RepairDetailSubmit)}

                        />
                    </div>
                </div>
            )}
            {activeTab === "SUPPLY" && (
                <div>
                    {/* {loader && <Loader />} */}
                    {/* create add recipe order form  */}
                    <div className="">
                        <div className="form_list_layout_wrapper">
                            <div className="d-flex align-items-center justify-content-between py-2">
                                <div className="form_layout">
                                    <div className="row"></div>
                                    <div className="row d-flex align-items-end">
                                        <div className="col-lg-3 col-md-6 input_wrapper">
                                            <label>SERIAL TAG*</label>
                                            <InputBox
                                                // type={"number"}
                                                register={{
                                                    ...register("serialTag", {
                                                        // required: "warranty is required",
                                                    }),
                                                }}
                                                errors={errors.serialTag}
                                            />
                                        </div>
                                        <div className="col-lg-3 col-md-6 input_wrapper">
                                            <label>CATEGORY*</label>
                                            <InputBox
                                                // type={"number"}
                                                register={{
                                                    ...register("category", {
                                                        // required: "note is required",
                                                    }),
                                                }}
                                                errors={errors.category}
                                            />
                                        </div>
                                        <div className="col-lg-3 col-md-6 input_wrapper">
                                            <label>ITEM DESCRIPTION & PROBLEM OBSERVED*</label>
                                            <textarea
                                                {...register("itemDescriptionNproblemObserved")}
                                                className="form-control custom_input"
                                                rows="1"
                                            ></textarea>
                                        </div>
                                        <div className="col-lg-3 col-md-6 input_wrapper">
                                            <label>ACTION TAKEN*</label>
                                            <InputBox
                                                // type={"text"}
                                                register={{
                                                    ...register("remark", {
                                                        // required: "quantity is required",
                                                    }),
                                                }}
                                                errors={errors.remark}
                                            />
                                        </div>
                                        <div className="col-lg-12 input_wrapper d-flex justify-content-center">
                                            <Button name={"Add"} type="button" className="" onClick={addMaterial}>
                                                {/* Add */}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="row d-flex align-items-end"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Sales Order Preview */}
                    <div className="form_list_layout_wrapper my-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>Sales Order Item Preview</p>
                        </div>
                        {/* table  */}
                        <div className="table_wrapper my-3">
                            <div className="table_main">
                                {/* Rename the class name "pi_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                                <div className="table_section pi_product_table">
                                    <div className="table_header">
                                        <div className="col_25p">
                                            <h5>Sr. No.</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5>SERIAL TAG</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5 className="action_wrraper">CATEGORY</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5>ITEM DESCRIPTION & PROBLEM OBSERVED</h5>
                                        </div>

                                        <div className="col_25p">
                                            <h5>ACTION TAKEN</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5 className="action_wrraper">Remove</h5>
                                        </div>
                                    </div>
                                    {state.materials?.length > 0 ? (
                                        state.materials?.map((product, index) => {
                                            return (
                                                <div className="table_data" key={index}>
                                                    <div className="col_25p">
                                                        <h6>{index + 1}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6>{product?.serialTag}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6>{product?.category ? product?.category : "--"}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6>{product?.itemDescriptionNproblemObserved ? product?.itemDescriptionNproblemObserved : "--"}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6 className="action_wrraper">
                                                            {product?.remark ? product?.remark : "--"}
                                                        </h6>
                                                    </div>
                                                    <div className="col_20p">
                                                        <h6 className="action_wrraper ">
                                                            <FontAwesomeIcon
                                                                icon={faTrash}
                                                                onClick={() => deleteProduct(index)}
                                                                className="trash"
                                                            />
                                                        </h6>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <small className="text-center text-secondary p-2 small d-block">
                                            Add order to see list
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="col-lg-12 col-md-6 input_wrapper">
                        <label>Remark</label>
                        <CustomTextArea
                            register={{
                                ...register("remark", {
                                    // required: "remarks is required",
                                }),
                            }}
                            errors={errors.remark}
                        />
                    </div> */}
                    <div className="d-flex align-items-center justify-content-center gap-3 my-3">
                        <Button
                            name={"Save"}
                            type="submit"
                            className="btn btn-success"
                            onClick={handleSubmit(createRepairOrder)}
                        // onClick={() => handleSubmit(createOrder)}
                        ></Button>
                    </div>
                </div>
            )}

        </>
    );
};

export default CreateInitialRepair;
