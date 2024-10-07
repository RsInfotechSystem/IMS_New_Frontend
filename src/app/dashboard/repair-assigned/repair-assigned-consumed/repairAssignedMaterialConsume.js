"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import {
    getBrandWiseModel,
    getCategory,
    getCategoryWiseBrand,
    getLocations,
    getLocationWiseBlock,
    getParameter,
    getRackPartation,
} from "@/services/commonApis";
import { communication, getServerUrl } from "@/services/communication";
import { toast } from "react-toastify";
import ButtonLoader from "@/common-components/ButtonLoader";
import Loader from "@/common-components/Loader";
import Swal from "sweetalert2";
import { stockStatus } from "@/helper/stockStatusArray";
import { faAngleDown, faCartArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/common-components/Button";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import SelectBox from "@/common-components/Select";
import ColorBox from "@/utilities/colorBox";
import InputBoxOnChange from "@/common-components/InputBoxOnChange";

const ConsumeMaterial = () => {
    const router = useRouter();
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [searchString, setSearchString] = useState("");
    const [nonMaterial, setNonMaterial] = useState([]);
    const params = useSearchParams();
    const [loader, setLoader] = useState(false);
    const [material, setMaterial] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [allMaterialsSelected, setAllMaterialsSelected] = useState(false);
    const [consumedMaterials, setConsumedMaterials] = useState([]);
    const [_parameter, __setParameter] = useState([]);
    const [_category, _setCategory] = useState("");
    const [_cartParameter, _setCartParameter] = useState([]);
    const { register, handleSubmit, setValue, watch, getValues } = useForm({
        defaultValues: {
        },
    });


    async function TechnicianConsumedMaterial() {
        try {
            setLoader(true);
            let payload = {
                repairMaterialId: params.get("repairId")
            }
            const serverResponse = await communication.technicianConsumedMaterial(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data?.material);
                // toast.success(serverResponse.data.message);
                setPageCount(serverResponse?.data?.totalPages);
            } else if (serverResponse?.data?.status === "FAILED") {
                // toast.info(serverResponse.data.message);
                setMaterial([]);
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
                setLoader(false);
            } else {
                // toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }
    const handleSelectAllMaterials = (e) => {
        const isChecked = e.target.checked;
        setAllMaterialsSelected(isChecked);
        if (isChecked) {
            setSelectedMaterials(material.map((item) => item?.materialId));
        } else {
            setSelectedMaterials([]);
        }
    };
    const handleMaterialCheckboxChange = (materialId) => {
        setSelectedMaterials((prevSelected) => {
            let updatedSelected;

            if (prevSelected.includes(materialId)) {
                updatedSelected = prevSelected.filter((id) => id !== materialId);
            } else {
                updatedSelected = [...prevSelected, materialId];
            }

            // Update "Select All" checkbox
            setAllMaterialsSelected(updatedSelected.length === material.length);

            return updatedSelected;
        });
    };
    // const handleConsumeClick = () => {
    //     setConsumedMaterials(selectedMaterials);
    //     toast.success("Materials consume.");
    // };
    async function handleRepairConsume() {
        try {
            setConsumedMaterials(selectedMaterials);
            setLoader(true);
            let payload = {
                repairmMaterialId: params.get("repairId"),
                materialIds: selectedMaterials
            };
            // console.log(payload, "payload");
            const serverResponse = await communication.handleRepairConsume(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                toast.success(serverResponse.data.message);
                TechnicianConsumedMaterial();
                router.push("/dashboard/repair-assigned");
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
                setLoader(false);
            } else {
                toast.info(serverResponse.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }
    useEffect(() => {
        TechnicianConsumedMaterial({ page: currentPage, searchString, });
    }, [isPageUpdated]);

    return (
        <>
            {loader && <Loader />}
            {/* {respondHandlerModalState.state && (
                <CustomResponseHandlerModal
                    status="warning"
                    message="Are you sure you want to dump this material?"
                    cancelHandler={cancelHandler}
                    successHandler={() => dumpMaterial()}
                />
            )} */}
            <div className="top_header">
                <div className="tab_title">Assigned Materials</div>
                <div
                    className="back_btn"
                    onClick={() => {
                        router.back();
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
            <form>

                <div className="form_layout">
                    {/* <ColorBox /> */}
                    <div className="form_list_layout_wrapper my-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <p>Material List</p>
                            <div className="search_btn_wrapper">
                                <div className="buttons_wrapper">
                                    <CustomBtn
                                        name={"Consume"}
                                        type="button"
                                        onClick={() => handleRepairConsume()}
                                        svg={
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9V11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15V12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
                                                    fill="#F3F8FF"
                                                />
                                                <path
                                                    fill-rule="evenodd"
                                                    clip-rule="evenodd"
                                                    d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
                                                    fill="#F3F8FF"
                                                />
                                            </svg>
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        {/* table */}

                        <div className="table_wrapper my-3">
                            <div className="table_main">
                                <div className="table_section pi_product_table" style={{ minWidth: "1800px" }}>
                                    <div className="table_header">
                                        <div className="col_20p">
                                            <div className="check_box">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="selectAllMaterialCheckbox"
                                                    onChange={handleSelectAllMaterials}
                                                    checked={allMaterialsSelected}
                                                />
                                            </div>
                                        </div>
                                        <div className="col_7p">
                                            <h5>Sr. No.</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5>Serial No</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5>Box NO</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5>Category</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5>Brand</h5>
                                        </div>
                                        <div className="col_25p">
                                            <h5>Model</h5>
                                        </div>
                                        <div className="col_85p">
                                            <div className="input_scroll" style={{ scrollbarWidth: "none" }}>
                                                <h5 style={{ textAlign: "center" }}>Parameter</h5>
                                            </div>
                                        </div>

                                    </div>
                                    {material?.length > 0 ? (
                                        material?.map((product, index) => {

                                            const statusClass =
                                                product?.materialStatus === "accepted"
                                                    ? "status-accepted"
                                                    : product.materialStatus === "returned"
                                                        ? "status-returned"
                                                        : "status-assigned";
                                            const isDisabled = consumedMaterials.includes(product.materialId);
                                            return (
                                                <div
                                                    className={`table_data ${statusClass} ${isDisabled ? "row-disabled" : ""
                                                        }`}
                                                    key={index}
                                                >
                                                    <div className="col_20p">
                                                        {product?.materialStatus === "acceptedd" ||
                                                            product?.materialStatus === "assignedd" ? (
                                                            ""
                                                        ) : (
                                                            <div className="check_box">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    key={product?._id}
                                                                    checked={selectedMaterials.includes(product?._id)}
                                                                    onChange={() => handleMaterialCheckboxChange(product?._id)}
                                                                // disabled={isDisabled}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col_7p">
                                                        <h6>{index + 1}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6>{product?.stockId?.serialNo ? product?.stockId?.serialNo : "--"}</h6>
                                                    </div>{" "}
                                                    <div className="col_25p">
                                                        <h6>{product?.stockId?.itemCode ? product?.stockId?.itemCode : "--"}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6>{product?.stockId?.categoryId?.name}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6>{product?.stockId?.brandId?.name}</h6>
                                                    </div>
                                                    <div className="col_25p">
                                                        <h6>{product?.stockId?.modelId?.name}</h6>
                                                    </div>
                                                    <div className="col_85p" style={{ display: "flex", justifyContent: "start" }}>
                                                        <div className="input_scroll" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                                                            {product?.stockId?.parameter && Object?.entries(product?.stockId?.parameter)?.map(
                                                                ([key, value], indexOne) => (
                                                                    <div
                                                                        className="col_60p"
                                                                        key={indexOne}
                                                                        style={{ display: "inline-block", minWidth: "150px" }}
                                                                    >
                                                                        <label>{key}</label>
                                                                        <InputBox
                                                                            value={value} // Set the input value to the corresponding value from the object
                                                                        // disabled={!isEditing || editingIndex !== index} // Disable based on edit state
                                                                        />
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        })
                                    ) : (
                                        <small className="text-center text-secondary p-2 small d-block">
                                            Data Not Available
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* ---------------------------send attached material----------------------------------------------------------*/}
            {/* <div className="d-flex align-items-center justify-content-center gap-3 my-3">
                <Button
                    className="btn-success"
                    name={"Accept"}
                    type="button"
                    onClick={acceptMaterial}
                ></Button>
                <Button
                    className="btn-success"
                    name={"Reject"}
                    onClick={(e) => {
                        // e.stopPropagation();
                        showInputDialog("reject");
                    }}
                ></Button>
            </div> */}
        </>
    );
};

export default ConsumeMaterial;
