
"use client";
import FilterStructure from "@/common-components/FilterForAssignMaterial"
import CustomReportFilter from "@/common-components/FilterForReportTab";
import { materialData } from "@/helper/locationData";
import { communication } from "@/services/communication";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";

const LocationWiseGraph = () => {
    const searchParams = useSearchParams();
    const [material, setMaterial] = useState([]);
    const [reportDetails, setReportDetails] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchString, setSearchString] = useState("");
    const [isPageUpdated, setIsPageUpdated] = useState(false);
    const [pageCount, setPageCount] = useState(1);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState({});
    const [loader, setLoader] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        categoryId: "",
        brandId: "",
        modelId: "",
    });
    const getReportMaterialList = async ({
        page = 1,
        searchString,
        userId,
        isSearch = false,
        isFirstCall,
        location,
        categoryId,
        brandId,
        modelId,
    } = {}) => {
        try {
            let payload = {
                // type: searchParams.get("reportType"),
                type: "location",
                searchString: searchString,
                page,
                location: "66cc80be7ea80ec79df941bc",
                categoryId,
                brandId,
                modelId,
            };
            if (searchParams.get("reportType") === "brand") {
                payload.brandId = searchParams.get("reportData");
            }

            if (searchParams.get("reportType") === "location") {
                payload.location = searchParams.get("reportData");
            }

            if (searchParams.get("reportType") === "category") {
                payload.categoryId = searchParams.get("reportData");
            }

            if (searchParams.get("reportType") === "status") {
                payload.status = searchParams.get("reportData");
            }

            if (searchParams.get("reportType") === "graph") {
                payload.date = searchParams.get("reportData");
            }
            setLoader(true);

            const serverResponse = await communication.getReportMaterialList(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                // setMaterial(serverResponse?.data?.material)
                setMaterial(materialData)
                setReportDetails(serverResponse?.data?.material);
                setPageCount(serverResponse?.data?.totalPages);
                setPage(page);
                // if (isFirstCall) {
                //     setStateFilter({
                //         category: Array.from(
                //             new Set(
                //                 serverResponse?.data.material?.map((item) =>
                //                     JSON.stringify({
                //                         categoryId: item.categoryId._id,
                //                         category: item.categoryId.name,
                //                     })
                //                 )
                //             )
                //         )?.map((item) => JSON.parse(item)),
                //         brand: Array.from(
                //             new Set(
                //                 serverResponse?.data?.material?.map((item) =>
                //                     JSON.stringify({ brandId: item.brandId._id, brand: item.brandId.name })
                //                 )
                //             )
                //         ).map((item) => JSON.parse(item)),
                //         modelName: Array.from(
                //             new Set(
                //                 serverResponse?.data?.material?.map((item) =>
                //                     JSON.stringify({ modelId: item.modelId._id, modelName: item.modelId.name })
                //                 )
                //             )
                //         ).map((item) => JSON.parse(item)),
                //         location: Array.from(
                //             new Set(
                //                 serverResponse?.data?.material?.map((item) =>
                //                     JSON.stringify({
                //                         locationId: item.locationId._id,
                //                         location: item.locationId.name,
                //                     })
                //                 )
                //             )
                //         ).map((item) => JSON.parse(item)),
                //     });
                // }
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
                setReportDetails([]);
            }
            setLoader(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    };
    const filteredMaterial = material.filter(
        (item) =>
            (!selectedFilters?.categoryId || item.categoryId?._id === selectedFilters?.categoryId) &&
            (!selectedFilters?.brandId || item.brandId?._id === selectedFilters?.brandId) &&
            (!selectedFilters?.modelId || item.modelId?._id === selectedFilters?.modelId) &&
            (!selectedFilters?.parameter || item.parameter?._id === selectedFilters?.parameterId)
    );
    const handleFiltersChange = (filters) => {
        setSelectedFilters(filters);
    };
    useEffect(() => {
        getReportMaterialList({
            reportId: searchParams.get("reportData"),
            reportType: searchParams.get("reportType"),
            page: currentPage,
            searchString,
            isFirstCall: true,
            ...filter,
        });
    }, [isPageUpdated]);
    return (
        <div className="kitchen_wrapper">
            <div className="row">
                <div className="col-12 col-lg-4 col-md-4">
                    <div>
                        <CustomReportFilter
                            data={material}
                            selectedFilters={selectedFilters}
                            onFiltersChange={handleFiltersChange}
                        />
                    </div>
                </div>
                <div className="col-12 col-lg-8 col-md-8">
                    <div className="col-12 mb-1" style={{ height: "80dvh" }}>
                        <div className="table_wrapper table_wrapper_assign">
                            <div className="table_main p-0" style={{ minWidth: "1200px" }}>
                                <div className="table_section employee_table">
                                    <div className="table_header">
                                        <div className="col_5p">
                                            <div className="check_box">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="selectAllCheckbox"

                                                />
                                            </div>
                                        </div>
                                        <div className="col_10p">
                                            <h5>Sr. No.</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Location</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Block Name</h5>
                                        </div>{" "}
                                        <div className="col_20p">
                                            <h5>Rack Name</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Serial No.</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Box NO</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Status</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Condition Type</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Model Name</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Category</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>Brand</h5>
                                        </div>
                                        <div className="col_45p">
                                            <h5>Parameter</h5>
                                        </div>
                                        <div className="col_20p">
                                            <h5>QTY</h5>
                                        </div>
                                    </div>
                                    {filteredMaterial?.length > 0 ? (
                                        <>
                                            {filteredMaterial?.length > 0 ? (
                                                <>
                                                    {filteredMaterial?.map((materialData, index) => (
                                                        <div className="table_data" key={index}>

                                                            <div className="col_5p">
                                                                <div className="check_box">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id={materialData?._id}
                                                                    // onChange={(e) => handleCheckboxChange(e, materialData)}
                                                                    // checked={selectedList.some(
                                                                    //     (item) => item?._id === materialData?._id
                                                                    // )}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col_10p">
                                                                <h6>{index + 1}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.locationId?.name}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.blockId?.blockNo}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>
                                                                    {materialData?.rackId?.rackName
                                                                        ? materialData?.rackId?.rackName
                                                                        : "-"}
                                                                </h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>
                                                                    {materialData?.serialNo ? materialData?.serialNo : "-"}
                                                                </h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>
                                                                    {materialData?.itemCode ? materialData?.itemCode : "-"}
                                                                </h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.status}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.conditionType}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.modelId?.name}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.categoryId?.name}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.brandId?.name}</h6>
                                                            </div>
                                                            <div className="col_45p">
                                                                <div className="input_scroll">
                                                                    {materialData?.parameter &&
                                                                        Object?.entries(materialData?.parameter)?.map(
                                                                            ([key, value], index, array) => (
                                                                                <h6 key={key}>
                                                                                    {key}
                                                                                    {index < array?.length - 1 && ", "}
                                                                                </h6>
                                                                            )
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.reamainingQuantity}</h6>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <p className="no_data">Data Not Available</p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {" "}
                                            {material?.length > 0 ? (
                                                <>
                                                    {" "}
                                                    {material?.map((materialData, index) => (
                                                        <div className="table_data" key={index}>
                                                            <div className="col_5p">
                                                                {" "}
                                                                <div className="check_box">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id={materialData?._id}
                                                                    // onChange={(e) => handleCheckboxChange(e, materialData)}
                                                                    // checked={selectedList.some(
                                                                    //     (item) => item?._id === materialData?._id
                                                                    // )}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col_10p">
                                                                <h6>{index + 1}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.locationId?.name}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.blockId?.blockNo}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>
                                                                    {materialData?.rackId?.rackName
                                                                        ? materialData?.rackId?.rackName
                                                                        : "-"}
                                                                </h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>
                                                                    {materialData?.serialNo ? materialData?.serialNo : "--"}
                                                                </h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.modelId?.name}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.categoryId?.name}</h6>
                                                            </div>
                                                            <div className="col_20p">
                                                                <h6>{materialData?.reamainingQuantity}</h6>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <p className="no_data">Data Not Available</p>
                                            )}
                                        </>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
export default LocationWiseGraph