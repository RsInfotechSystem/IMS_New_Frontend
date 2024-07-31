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
const ReceiveMaterialAction = () => {
  const router = useRouter();
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
  const searchParams = useSearchParams();
  const [model, setModel] = useState();
  const [errors, setErrors] = useState({});
  const [itemList, setItemList] = useState([]);
  const { watch } = useForm({});
  const brandId = watch("brandId");
  const receiveItem = async () => {
    try {
      const isAllSelected = materialList.every(
        (material) => material.blockId && material.rackId && material.partitionName
      );

      if (!isAllSelected) {
        toast.warn(
          "Please select both a block and a rack and a paratition Name for all materials before submitting."
        );
        return;
      }
      setLoader(true);
      const dataToSend = {
        transferMaterialId: searchParams.get("reciveMaterialId"),
        materialIds: materialList.map((material) => ({
          id: material.materialId,
          blockId: material.blockId,
          rackId: material.rackId,
          partitionName: material.partitionName,
          // status: material.status,
        })),
      };
      setLoader(true);
      let response = await communication.updateStockAfterReceive(dataToSend);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message);
        setLoader(false);
        router.push("/dashboard/receive-material");
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        router.push("/");
      } else if (response?.data?.status == "FAILED") {
        toast.warn(response.data.message);
      } else {
        toast.warn(response.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  };
  async function gettransferMaterialById() {
    try {
      setLoader(true);
      const responseFromServer = await communication.getTransferMaterialById({
        transferMaterialId: searchParams.get("reciveMaterialId"),
      });
      if (responseFromServer?.data?.status === "SUCCESS") {
        const ReceiveData = responseFromServer?.data?.transferMaterial;
        setItemList(ReceiveData);
        if (ReceiveData.length > 0) {
          const allMaterials = ReceiveData.flatMap((transfer) =>
            transfer.materialIds.map((material) => ({
              materialId: material._id,
              categoryId: material.categoryId?._id || "",
              categoryName: material.categoryId?.name || "",
              locationId: material.locationId?._id || "",
              location: material.locationId?.name || "",
              brandId: material.brandId?._id || "",
              brand: material.brandId?.name || "",
              modelName: material.modelId?.name || "",
              itemCode: material.itemCode || "",
              serialNo: material.serialNo || "",
              quantity: material.quantity || 1,
            }))
          );

          setMaterialList(allMaterials);
        }
      } else {
        toast.warn(responseFromServer?.data?.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoader(false);
    }
  }
  const handleChange = (e, index, field) => {
    const { value } = e.target;
    setMaterialList((prevList) =>
      prevList.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  useEffect(() => {
    const uniqueLocationIds = [...new Set(materialList.map((material) => material.locationId))];
    uniqueLocationIds.forEach((locationId) => {
      if (locationId) {
        getLocationWiseBlock(locationId, setLoader, router, setBlocks);
      }
    });
  }, [materialList]);
  useEffect(() => {
    const uniqueBrandIds = [...new Set(materialList.map((material) => material.brandId))];
    uniqueBrandIds.forEach((brandId) => {
      if (brandId) {
        getBrandWiseModel(brandId);
      }
    });
  }, [materialList]);
  useEffect(() => {
    materialList.forEach((material) => {
      if (material.blockId) {
        const rackDetails = blocks?.find((ele) => ele._id === material.blockId);
        setRacks((prevRacks) => ({
          ...prevRacks,
          [material.blockId]: rackDetails?.rackId ?? [],
        }));
      }
    });
  }, [materialList, blocks]);
  useEffect(() => {
    materialList.forEach((material) => {
      if (material.rackId) {
        getRackPartation(material.rackId, setLoader, router, (partitions) => {
          setRackPartation((prevPartitions) => ({
            ...prevPartitions,
            [material.rackId]: partitions,
          }));
        });
      }
    });
  }, [materialList]);

  async function getBrandWiseModel() {
    try {
      // props.setLoader(true);
      const payload = {
        brandId: brandId,
      };
      const serverResponse = await communication.brandWiseModel(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setModels((prevModels) => ({
          ...prevModels,
          [brandId]: serverResponse?.data?.model,
        }));
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message)
        router.push("/");
        setLoader(false);
      } else {
        setModel([]);
      }
      // props.setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
           toast.info(error?.response?.data?.message || error.message)

      setLoader(false);
    }
  }
  async function callAPIs(params) {
    await gettransferMaterialById();
  }

  useEffect(() => {
    callAPIs();
  }, []);
  return (
    <>
      {loader && <Loader text="Fetching Data..." />}
      <div className="top_header">
        <div className="tab_title">Add Receive Material in Inventory</div>
      </div>
      <div className="search_btn_wrapper">
        {/* <Search value={searchString} onChange={handleSearch} placeholder={"Search"} /> */}
        {
          <div className="buttons_wrapper">
            <CustomBtn
              name={"Accept"}
              onClick={receiveItem}
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
              <div className="col_10p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_40p">
                <h5>Category</h5>
              </div>
              <div className="col_30p">
                <h5>Brand</h5>
              </div>
              <div className="col_40p">
                <h5>Location</h5>
              </div>
              <div className="col_40p">
                <h5>Model Name</h5>
              </div>
              <div className="col_40p">
                <h5>Item Code</h5>
              </div>
              <div className="col_30p">
                <h5>Serial No.</h5>
              </div>
              <div className="col_45p">
                <h5>Block Name</h5>
              </div>
              <div className="col_45p">
                <h5>Rack Name</h5>
              </div>
              <div className="col_50p">
                <h5>Partation Name</h5>
              </div>

              <div className="col_30p">
                <h5>Quantity</h5>
              </div>
            </div>
            {materialList?.length > 0 ? (
              materialList?.map((material, index) => {
                return (
                  <>
                    <div className="table_data" key={material.materialId}>
                      <div className="col_10p">
                        <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                      </div>
                      <div className="col_40p">
                        <h6>{material.categoryName}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{material.brand}</h6>
                      </div>
                      <div className="col_40p">
                        <h6>{material.location}</h6>
                      </div>
                      <div className="col_40p">
                        <h6>{material.modelName}</h6>
                      </div>
                      <div className="col_40p">
                        <h6>{material.itemCode}</h6>
                      </div>
                      <div className="col_30p">
                        <h6>{material.serialNo}</h6>
                      </div>
                      <div className="col_45p">
                        <h6>
                          <select
                            //   name="categoryId"
                            value={material.blockId}
                            onChange={(e) => handleChange(e, index, "blockId")}
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="">Select Block</option>
                            {blocks.map((block, idx) => (
                              <option value={block._id} key={idx} className="small text-capitalize">
                                {block.blockNo}
                              </option>
                            ))}
                          </select>
                        </h6>
                      </div>
                      <div className="col_45p">
                        <h6>
                          <select
                            //   name="categoryId"
                            value={material.rackId}
                            onChange={(e) => handleChange(e, index, "rackId")}
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Rack
                            </option>
                            {racks[material.blockId]?.map((rack, idx) => (
                              <option className="small text-capitalize" value={rack._id} key={idx}>
                                {rack.rackName}
                              </option>
                            ))}
                          </select>
                        </h6>
                      </div>
                      <div className="col_50p">
                        <h6>
                          <select
                            //   name="categoryId"
                            value={material.partitionName}
                            onChange={(e) => handleChange(e, index, "partitionName")}
                            className="form-control custom_input"
                            style={{ width: "100%" }}
                          >
                            <option value="" className="text-secondary text-lowercase">
                              Select Partition
                            </option>
                            {rackPartation[material.rackId]
                              ? rackPartation[material.rackId].map((partition, idx) => (
                                  <option
                                    value={partition.partitionName}
                                    className="small text-capitalize"
                                    key={idx}
                                  >
                                    {partition.partitionName}
                                  </option>
                                ))
                              : null}
                          </select>
                        </h6>
                      </div>
                      <div className="col_30p">
                        <h6>{material?.quantity}</h6>
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

export default ReceiveMaterialAction;
