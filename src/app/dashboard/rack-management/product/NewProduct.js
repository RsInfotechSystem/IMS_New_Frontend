"use client";

import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateProduct from "./CreateProduct";
import { communication, getServerUrl } from "@/services/communication";
import Loader from "@/common-components/Loader";
import { getCookiesData } from "@/utilities/getCookiesData";
import { toast } from "react-toastify";
import Image from "next/image";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import CustomImgModal from "@/common-components/CustomImgModal";
import CustomResponseReadMoreModal from "@/common-components/CustomResponseReadMoreModal";

const NewProduct = () => {
    const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
    const router = useRouter();
    const [modalStates, setModalStates] = useState({
        deleteProduct: false,
        modal: false,
        type: "",
        productId: "",
        showReadMoreText: "",
        showReadMore: ""
    });
    const [modalImageStates, setModalImageStates] = useState({
        modal: false,
        type: "",
        showImg: "",
        url: "",
    });
    const [productList, setProductList] = useState([]);
    const [searchString, setSearchString] = useState("");
    const [loader, setLoader] = useState(false);
    const [timeoutId, setTimeoutId] = useState();
    // pagination states
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [page, setPage] = useState(1);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
    //get Product on initial load
    const getProductList = async (page, searchString) => {
        try {
            setLoader(true);
            const serverResponse = await communication.getProductList({ page, searchString });
            if (serverResponse?.data?.status === "SUCCESS") {
                setProductList(serverResponse?.data?.model);
                setPageCount(serverResponse?.data?.totalPages);
                setPage(page);
                setLoader(false);
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse?.data?.message, {
                    autoClose: 1500, // 1.5 seconds
                });
                router.push("/");
                setLoader(false);
            } else {
                setProductList([]);
                setLoader(false);
            }
        } catch (error) {
            toast.error(error?.message, {
                autoClose: 1500, // 1.5 seconds
            });
            setLoader(false);
        }
    };

    const deleteProduct = async (modelIds) => {

        try {
            setLoader(true);
            setModalStates((prev) => ({ ...prev, deleteProduct: false }));
            // if (selectedCheckboxes.length === 0) {
            //     toast.info("Please select at lease one product to delete", {
            //         autoClose: 1500, // 1.5 seconds
            //     });
            //     return false;
            // }
            let response = await communication.deleteModel({
                modelIds: [modalStates?.modelIds],
            });
            if (response?.data?.status === "SUCCESS") {
                setSelectedCheckboxes([]);
                await getProductList(1, "");
                toast.success(response?.data?.message, {
                    autoClose: 1500, // 1.5 seconds
                });
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response?.data?.message, {
                    autoClose: 1500, // 1.5 seconds
                });
                router.push("/");
            } else {
                toast.info(response?.data?.message, {
                    autoClose: 1500, // 1.5 seconds
                });
            }
        } catch (error) {
            toast.info(error?.message, {
                autoClose: 1500, // 1.5 seconds
            });
        } finally {
            setLoader(false);
        }
    };

    const handleCheckboxChange = (e) => {
        const checkboxId = e.target.id;
        setSelectAllChecked(
            !selectedCheckboxes.includes(checkboxId) &&
            selectedCheckboxes.length + 1 === productList.length
        );
        setSelectedCheckboxes((prevSelected) => {
            if (prevSelected.includes(checkboxId)) {
                // If the checkbox is already in the array, remove it
                return prevSelected.filter((id) => id !== checkboxId);
            } else {
                // If the checkbox is not in the array, add it
                return [...prevSelected, checkboxId];
            }
        });
    };

    const handleSelectAllChange = (e) => {
        setSelectAllChecked(e.target.checked);

        // Update the array of selected checkboxes based on the "Select All" checkbox
        setSelectedCheckboxes((prevSelected) =>
            e.target.checked ? productList.map((brandDetails) => brandDetails._id) : []
        );
    };

    const handleSearch = (e) => {
        setSearchString(e.target.value);
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            getProductList(1, e.target.value);
            setCurrentPage(1);
        }, 2000);
        setTimeoutId(_timeOutId);
    };
    useEffect(() => {
        getProductList(currentPage, searchString);
    }, [isPageUpdated]);


    return (
        <>
            {loader && <Loader text="Fetching Data..." />}

            {modalImageStates?.showImg && <CustomImgModal url={modalImageStates?.url} setModalImageStates={setModalImageStates} />}
            {modalStates.deleteProduct && (
                <CustomResponseHandlerModal
                    status="warning"
                    message={"Do you want to delete model?"}
                    successHandler={() => {
                        deleteProduct();
                    }}
                    cancelHandler={() => {
                        setModalStates((prev) => ({ ...prev, deleteProduct: false }));
                    }}
                />
            )}
            {
                modalStates?.showReadMore && (
                    <CustomResponseReadMoreModal
                        status="warning"
                        message={modalStates?.showReadMoreText}
                        cancelButton={"Cancel"}
                        cancelHandler={() => {
                            setModalStates((prev) => ({ ...prev, showReadMore: false, showReadMoreText: "" }));
                        }}
                    />
                )
            }
            <div className="top_header">
                <div className="tab_title">Model Details</div>
                <Pagination
                    isPageUpdated={isPageUpdated}
                    setIsPageUpdated={setIsPageUpdated}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                />
            </div>
            <div className="search_btn_wrapper">
                <Search
                    value={searchString}
                    onChange={(e) => {
                        handleSearch(e);
                    }}
                    placeholder={"Search"}
                />

                <div className="buttons_wrapper">
                    <CustomBtn
                        name={"Create"}
                        onClick={() => {
                            setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
                        }}
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

                    {/* <CustomBtn
                        name={"Delete"}
                        onClick={() => {
                            setModalStates((prev) => ({ ...prev, deleteProduct: true }));
                        }}
                        svg={<FontAwesomeIcon icon={faTrash} />}
                    /> */}
                </div>
            </div>
            {/* table  */}
            <div className="table_wrapper">
                <div className="table_main">
                    <div className="table_section employee_table">
                        <div className="table_header" style={{ display: "flex", width: "100%" }}>
                            <div className="col_10p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_40p">
                                <h5>Category</h5>
                            </div>
                            <div className="col_40p">
                                <h5>Brand</h5>
                            </div>
                            <div className="col_20p">
                                <h5>Model Name</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Description</h5>
                            </div>
                            <div className="col_20p">
                                <h5 className="action_wrraper">File</h5>
                            </div>
                            <div className="col_20p">
                                <h5 className="action_wrraper">Action</h5>
                            </div>
                        </div>

                        <div className="" style={{ width: "100%", display: "flex", flexDirection: "column", flexWrap: "wrap" }}>
                            {productList?.length > 0 ? (
                                productList?.map((data, index) => (
                                    <div
                                        className="table_data_group"
                                        style={{ display: "flex", width: "100%", borderBottom: "1px solid var(--grey_color_light_shade1)" }}
                                        key={`group-${index}`}
                                    >
                                        {/* Left Side with Material Description */}
                                        <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
                                            <div className="table_data" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                <div className="col_12p">
                                                    <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                                </div>
                                                <div className="col_40p">
                                                    <h6>{data?.categoryId?.name}</h6>
                                                </div>
                                                <div className="col_40p">
                                                    <h6>{data?.brandId?.name}</h6>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side with Material Details */}
                                        <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
                                            {data?.models?.map((model, innerInd) => (
                                                <div
                                                    className="table_data"
                                                    key={model?._id}
                                                    style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: "8px 0" }}
                                                >
                                                    <div className="col_20p">
                                                        <h6 key={innerInd}>{model?.name}</h6>
                                                    </div>
                                                    <div className="col_35p">
                                                        <h6>
                                                            {model?.description?.substring(0, 100)}
                                                            {model?.description?.length > 100 && (
                                                                <div
                                                                    className="custom_button_read"
                                                                    onClick={() =>
                                                                        setModalStates((pre) => ({
                                                                            ...pre,
                                                                            showReadMore: true,
                                                                            showReadMoreText: model.description,
                                                                        }))
                                                                    }
                                                                >
                                                                    Read More
                                                                </div>
                                                            )}
                                                        </h6>
                                                    </div>
                                                    <div className="col_20p">
                                                        <div className="model-images" key={innerInd}>
                                                            <div className="image-row" style={{ display: "flex", gap: "5px" }}>
                                                                {
                                                                    model?.files?.length > 0 ? (
                                                                        model?.files?.map((img, index) => (
                                                                            <div key={index} className="image-icon" style={{ marginRight: 5, backgroundColor: "white" }}>
                                                                                <div title={img?.documentName}>
                                                                                    <FontAwesomeIcon
                                                                                        icon={faImage}
                                                                                        style={{ width: 20, height: 20 }}
                                                                                        onClick={() =>
                                                                                            setModalImageStates((pre) => ({
                                                                                                ...pre,
                                                                                                showImg: true,
                                                                                                url: `${img?.fileUrl}`,
                                                                                            }))
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))) : ("--")
                                                                }

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col_20p" style={{ display: "flex", flexDirection: "row", justifyContent: "right" }}>
                                                        <div
                                                            title="edit"
                                                            onClick={() =>
                                                                setModalStates((pre) => ({
                                                                    ...pre,
                                                                    modal: true,
                                                                    type: "update",
                                                                    productId: model?._id,
                                                                }))
                                                            }
                                                        >
                                                            <svg
                                                                width="27"
                                                                height="27"
                                                                viewBox="0 0 25 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <g clipPath="url(#clip0_279_5204)">
                                                                    <path
                                                                        d="M17.5 15V17.5C17.5 17.8315 17.3683 18.1495 17.1339 18.3839C16.8995 18.6183 16.5815 18.75 16.25 18.75H7.5C7.16848 18.75 6.85054 18.6183 6.61612 18.3839C6.3817 18.1495 6.25 17.8315 6.25 17.5V8.75C6.25 8.41848 6.3817 8.10054 6.61612 7.86612C6.85054 7.6317 7.16848 7.5 7.5 7.5H10"
                                                                        stroke="#0D6EFD"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                    <path
                                                                        d="M12.8125 14.875L18.75 8.875L16.125 6.25L10.1875 12.1875L10 15L12.8125 14.875Z"
                                                                        stroke="#0D6EFD"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_279_5204">
                                                                        <rect
                                                                            width="15"
                                                                            height="15"
                                                                            fill="white"
                                                                            transform="translate(5 5)"
                                                                        />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </div>
                                                        <div
                                                            title="delete"
                                                            onClick={() =>
                                                                setModalStates((prev) => ({
                                                                    ...prev,
                                                                    deleteProduct: true,
                                                                    modelIds: model?._id,
                                                                }))
                                                            }
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no_data">Data Not Available</p>
                            )}
                        </div>


                    </div>
                </div>
            </div>
            {/* {pageCount > 0 && (
        <div className="pagination_wrapper">
          
        </div>
      )} */}
            {modalStates?.modal && (
                <CreateProduct data={{ modalStates, setModalStates, getProductList }} />
            )}
        </>
    );
};

export default NewProduct;
