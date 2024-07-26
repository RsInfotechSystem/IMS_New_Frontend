"use client"
import CustomBtn from '@/common-components/CustomBtn'
import Pagination from '@/common-components/Pagination'
import Search from '@/common-components/Search'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faFileInvoice, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import React, { useEffect, useReducer, useState } from 'react'
import Loader from '@/common-components/Loader'
import { toast } from "react-toastify";
import { communication } from '@/services/communication'
import { formatDate } from '@/helper/formatDate'
import { getPIDetailById } from '@/services/commonApis'
import { getCookiesData } from '@/utilities/getCookiesData'
import CustomResponseHandlerModal from '@/common-components/CustomResponseHandlerModal'
import ViewPo from '../po-management/ViewPo'
import ViewBill from '../po-management/ViewBill'

const StockOut = () => {
    const pageLimit = process.env.NEXT_PUBLIC_LIMIT;
    const router = useRouter();
    const [poList, setPoList] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [loader, setLoader] = useState(false);
    const [searchString, setSearchString] = useState("");
    const [page, setPage] = useState(1);
    const [material, setMaterial] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [pageCount, setPageCount] = useState(1);
    const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
        categoryFilter: false,
        brandFilter: false,
        locationFilter: false,
        modelNameFilter: false,
        category: [],
        brand: [],
        modelName: [],
        location: [],
        categoryValue: { keyType: "", keyId: "", keyCount: 0 },
        brandValue: { keyType: "", keyId: "", keyCount: 0 },
        modelNameValue: { keyType: "", keyId: "", keyCount: 0 },
        locationValue: { keyType: "", keyId: "", keyCount: 0 },
    });

    async function getStatusWiseMaterialList({
        page,
        searchString,
        isSearch = false,
        categoryValue,
        brandValue,
        isFirstCall,
    } = {}) {
        try {
            setLoader(true);
            let payload = {
                page: page,
                searchString: searchString,
                ...(state.categoryValue.keyType == "category" && { categoryId: state.categoryValue.keyId }),
                ...(state.brandValue.keyType == "brand" && { brandId: state.brandValue.keyId }),
                ...(state.locationValue.keyType == "location" && { location: state.locationValue.keyId }),
                ...(state.modelNameValue.keyType == "modelName" && {
                    modelId: state.modelNameValue.keyId,
                }),
            };
            const serverResponse = await communication.getStockOutMaterial(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                setMaterial(serverResponse?.data.material);
                setPageCount(serverResponse?.data?.totalPages);
                setPage(page);
                if (isFirstCall) {
                    setState({
                        category: Array.from(
                            new Set(
                                serverResponse?.data.material.map((item) =>
                                    JSON.stringify({
                                        categoryId: item.categoryId?._id,
                                        category: item.categoryId?.name,
                                    })
                                )
                            )
                        ).map((item) => JSON.parse(item)),
                        brand: Array.from(
                            new Set(
                                serverResponse?.data.material.map((item) =>
                                    JSON.stringify({ brandId: item.brandId?._id, brand: item.brandId?.name })
                                )
                            )
                        ).map((item) => JSON.parse(item)),
                        modelName: Array.from(
                            new Set(
                                serverResponse?.data.material.map((item) =>
                                    JSON.stringify({ modelId: item.modelId?._id, modelName: item.modelId?.name })
                                )
                            )
                        ).map((item) => JSON.parse(item)),
                        location: Array.from(
                            new Set(
                                serverResponse?.data.material.map((item) =>
                                    JSON.stringify({
                                        locationId: item.locationId?._id,
                                        location: item.locationId?.name,
                                    })
                                )
                            )
                        ).map((item) => JSON.parse(item)),
                    });
                }
                if (isSearch) {
                    setCurrentPage(1);
                }
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                Swal.fire({ text: serverResponse.data.message, icon: "warning" });
                router.push("/");
                setLoader(false);
            } else {
                // Swal.fire({ text: serverResponse.data.message, icon: "warning" });
                setMaterial([]);
            }
            setLoader(false);
        } catch (error) {
            Swal.fire({
                text: error?.response?.data?.message || error.message,
                icon: "warning",
            });
            setLoader(false);
        }
    }

    const handleSearch = (e) => {
        setSearchString(e.target.value);
        let isSearch = true;
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            getStatusWiseMaterialList({ page: 1, searchString: e.target.value, isSearch });
            setCurrentPage(1);
        }, 2000);
        setTimeoutId(_timeOutId);
    };

    useEffect(() => {
        getStatusWiseMaterialList({ page: currentPage, searchString, isFirstCall: true });
    }, [isPageUpdated]);

    return (
        <>
            {
                loader &&
                <Loader text={"Fetching Data..."} />
            }

            {/* top header  */}
            <div className="top_header">
                <div className="tab_title">Stock Out</div>
            </div>
            <div className="search_btn_wrapper">
                <Search value={searchString} onChange={(e) => handleSearch(e)} placeholder={"Search"} />
            </div>

            {/* table  */}
            <div className="table_wrapper">
                <div className="table_main">

                    {/* Rename the class name "purchase_indent_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                    <div className="table_section purchase_indent_table">
                        <div className="table_header">
                            <div className="col_15p">
                                <h5>Sr. No.</h5>
                            </div>
                            <div className="col_40p">
                                <h5>Category Name</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Brand Name</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Location Name</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Model Name</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Item Code</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Block Name</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Rack Name</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Serial No.</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Status</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Quantity</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Stock Out By</h5>
                            </div>
                            <div className="col_35p">
                                <h5>Stock Out Date</h5>
                            </div>
                        </div>
                        {material?.length > 0 ?
                            material?.map((materialDetails, index) =>
                            (
                                <div className="table_data" key={index}>
                                    <div className="col_15p">
                                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                    </div>
                                    <div className="col_40p">
                                        <h6>{materialDetails?.categoryId?.name}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.brandId?.name}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.locationId?.name}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.modelId?.name}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.itemCode}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.blockId?.blockNo}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.rackId?.rackName ? materialDetails?.rackId?.rackName : "-"}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.serialNo}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.conditionType}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.quantity}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{materialDetails?.stockOutBy?.name}</h6>
                                    </div>
                                    <div className="col_35p">
                                        <h6>{new Date(materialDetails.createdAt).toLocaleDateString()}</h6>
                                    </div>
                                </div>
                            )
                            )
                            :
                            <p className='no_data'>data not available</p>
                        }

                    </div>

                </div>
            </div >
            <div className="pagination_wrapper">
                <Pagination
                    isPageUpdated={isPageUpdated}
                    setIsPageUpdated={setIsPageUpdated}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    pageCount={pageCount}
                />
            </div>
        </>
    )
}

export default StockOut