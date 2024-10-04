"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { getCookiesData } from "@/utilities/getCookiesData";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import Link from "next/link";
import { getLocationWiseBlock, getRackPartation } from "@/services/commonApis";
import { useForm } from "react-hook-form";
import InputBox from "@/common-components/InputBox";
import CreateTransferMaterial from "../../transfer-material/CreateTrasferMaterial";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
const AssignToTechnician = () => {
    const router = useRouter();
    const [technicianList, setTechnicianList] = useState([]);
    const [modalStates, setModalStates] = useState({ modal: false, type: "", id: "" });
    const [searchString, setSearchString] = useState("");
    const [loader, setLoader] = useState(false);
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [categoryList, setCategoryList] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState({ modal: false });
    const [materialList, setMaterialList] = useState([]);
    const [receiveMaterial, setReceiveMaterial] = useState([]);
    const [material, setMaterial] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [racks, setRacks] = useState({});
    const [rackPartation, setRackPartation] = useState({});
    const [models, setModels] = useState({});
    const params = useSearchParams();
    const [model, setModel] = useState();
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    // const [errors, setErrors] = useState({});
    const [itemList, setItemList] = useState([]);
    // const { watch } = useForm({});
    // const brandId = watch("brandId");
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        getValues,
        setValue,
    } = useForm()
    const onSubmit = async () => {
        try {
            setLoader(true);
            const repairMaterials = selectedItems.map((item) => ({
                materialId: item.id,
                materialAssignTo: item.user,
            }));
            const dataToSend = {
                repairId: params.get("repairId"),
                repairMaterials: repairMaterials
            };
            setLoader(true);
            let response = await communication.assignRepairToTech(dataToSend);
            if (response?.data?.status === "SUCCESS") {
                toast.success(response.data.message);
                setLoader(false);
                router.push("/dashboard/initial-repair");
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.warn(response.data.message);
                router.push("/");
            } else if (response?.data?.status == "FAILED") {
                toast.warn(response.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    };
    async function repairMaterialById() {
        const payload = {
            repairId: params.get("repairId")
        }
        try {
            setLoader(true);
            const serverResponse = await communication.getRepairMaterialById(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data?.repair);
                // toast.success(serverResponse.data.message);

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


    const TechnicianList = async () => {
        try {
            setLoader(true);

            let response = await communication.getTechnicianListMaterial();
            if (response?.data?.status === "SUCCESS") {
                //  toast.success(response?.data?.message);
                setTechnicianList(response?.data.user);
                // await getRoleList(currentPage, searchString);
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message);
                router.push("/");
            } else {
                toast.info(response.data.message);
            }
        } catch (error) {
            toast.info(error.message);
        } finally {
            setLoader(false);
        }
    };
    useEffect(() => {
        TechnicianList();
    }, []);
    // Handle technician selection change
    const handleChange = (e, index, fieldName) => {
        const { value } = e.target;
        const updatedItems = [...selectedItems];
        const materialId = material?.repairMaterials[index]?._id;

        // Update technician ID for the corresponding checkbox ID
        const itemIndex = updatedItems.findIndex((item) => item.id === materialId);
        if (itemIndex !== -1) {
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], user: value };
        } else {
            updatedItems.push({ id: materialId, user: value });
        }

        setSelectedItems(updatedItems);
    };
    // Handle individual checkbox change
    const handleCheckboxChange = (e, materialId, index) => {
        const { checked } = e.target;
        const updatedItems = [...selectedItems];
        if (checked) {
            // Add new object to the selectedItems state
            updatedItems.push({ id: materialId, user: material?.repairMaterials[index]?.userId || "" });
        } else {
            // Remove item from the selectedItems state
            const itemIndex = updatedItems.findIndex((item) => item.id === materialId);
            updatedItems.splice(itemIndex, 1);
        }
        setSelectedItems(updatedItems);
    };
    // Handle select all change
    const handleSelectAllChange = (e) => {
        const { checked } = e.target;
        setSelectAllChecked(checked);
        if (checked) {
            // Select all items
            const allItems = material?.repairMaterials.map((item) => ({
                id: item?._id,
                user: item?.userId || "",
            }));
            setSelectedItems(allItems);
        } else {
            // Deselect all items
            setSelectedItems([]);
        }
    };

    useEffect(() => {
        repairMaterialById({ page: currentPage, searchString });
    }, [isPageUpdated]);


    return (
        <>
            {loader && <Loader text="Fetching Data..." />}

            <div className="top_header">
                <div className="tab_title">Assign To Technician</div>
            </div>
            <div className="search_btn_wrapper">
                {/* <Search value={searchString} onChange={handleSearch} placeholder={"Search"} /> */}
                {
                    //  <CustomBtn name="Accept" onClick={handleSubmit(onSubmit)} />
                    <div className="buttons_wrapper">
                        <CustomBtn
                            name={"Assign"}
                            onClick={handleSubmit(onSubmit)}
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
                        <CustomBtn
                            name={"Back"}
                            onClick={() => {
                                router.back();
                            }}
                        //   svg={<FontAwesomeIcon icon={faTrash} />}
                        //   onClick={deletecategory}
                        />
                    </div>
                }
            </div>
            {/* table  */}
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section employee_table">
                        <div className="table_header">
                            <div className="col_15p">
                                <div className="check_box">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        onChange={(e) => handleSelectAllChange(e)}
                                        checked={selectAllChecked}
                                    />
                                    <label className="form-check-label"></label>
                                </div>
                            </div>
                            <div className="col_10p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_40p">
                                <h5>Serial Tag</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Category</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Description</h5>
                            </div>
                            <div className="col_30p">
                                <h5>Remark</h5>
                            </div>
                            <div className="col_40p">
                                <h5>Technician</h5>
                            </div>
                        </div>
                        {material?.repairMaterials?.length > 0 ? (
                            material?.repairMaterials?.map((material, index) => {
                                return (
                                    <>
                                        <div className="table_data" key={material?._id}>
                                            <div className="col_15p">
                                                <div className="check_box">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={material?._id}
                                                        onChange={(e) => handleCheckboxChange(e, material?._id, index)}
                                                        checked={selectedItems.some((item) => item.id === material?._id)}
                                                    // onChange={(e) => handleCheckboxChange(e)}
                                                    // checked={selectedCheckboxes.includes(material?._id)}
                                                    />
                                                    <label className="form-check-label"></label>
                                                </div>
                                            </div>
                                            <div className="col_10p">
                                                <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                            </div>
                                            <div className="col_40p">
                                                <h6>{material?.serialTag}</h6>
                                            </div>
                                            <div className="col_30p">
                                                <h6>{material?.category}</h6>
                                            </div>
                                            <div className="col_30p">
                                                <h6>{material?.itemDescriptionNproblemObserved}</h6>
                                            </div>
                                            <div className="col_30p">
                                                <h6>{material?.remark}</h6>
                                            </div>
                                            <div className="col_45p">
                                                <h6>
                                                    <select
                                                        name="userId"
                                                        value={material?.userId}
                                                        onChange={(e) => handleChange(e, index, "userId")}
                                                        className="form-control custom_input"
                                                        style={{ width: "100%" }}
                                                    >
                                                        <option value="">Select Technician</option>
                                                        {technicianList.map((user, idx) => (
                                                            <option value={user?._id} key={idx} className="small text-capitalize">
                                                                {user?.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </h6>
                                            </div>
                                        </div>
                                    </>
                                );
                            })
                        ) : (
                            <p className="no_data">Data Not Available</p>
                        )}
                    </div>
                </div>
            </div>
            {pageCount > 1 && (
                <div className="pagination_wrapper">
                    <Pagination
                        isPageUpdated={isPageUpdated}
                        setIsPageUpdated={setIsPageUpdated}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        pageCount={pageCount}
                    />
                </div>
            )}
            {modalStates?.modal && (
                <CreateTransferMaterial data={{ modalStates, setModalStates, setIsPageUpdated }} />
            )}
        </>
    );
};

export default AssignToTechnician;
