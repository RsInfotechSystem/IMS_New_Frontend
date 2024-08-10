"use client";

import { communication } from "@/services/communication";
import { useEffect, useMemo, useState } from "react";
import { getCategory, getCategoryWiseBrand, getCategoryWiseParameter } from "@/services/commonApis";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/common-components/Loader";
import { stockStatus } from "@/utilities/stock-status-array";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomBtn from "@/common-components/CustomBtn";
import { toast } from "react-toastify";
import Button from "@/common-components/Button";
import { getCookie } from "cookies-next";

const ReturnMaterialUser = () => {
  const [selectedList, setSelectedList] = useState([]);
  const params = useSearchParams();
  const [nonMaterial, setNonMaterial] = useState([]);
  const [material, setMaterial] = useState([]);
  const [TechnicianList, setTechnicianList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [parameter, setParameter] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectAllCheckedStock, setSelectAllCheckedStock] = useState(false);
  const [stockIds, setStockIds] = useState([]);
  const [roleName, setRoleName] = useState("");
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [quantities, setQuantities] = useState([]);
  const [formValues, setFormValues] = useState({
    searchString: "",
    categoryId: "",
    status: "",
    brandId: "",
    conditionType: "",
  });
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedNonMaterials, setSelectedNonMaterials] = useState([]);
  const [allMaterialsSelected, setAllMaterialsSelected] = useState(false);
  const [allNonMaterialsSelected, setAllNonMaterialsSelected] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    // formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm({
    defaultValues: {
      quantity: 1,
      parameterId: "",
      parameter: {},
    },
  });

  useEffect(() => {
    setRoleName(getCookie("role"));
  }, []);

  async function materialByJob({ page = 1, searchString } = {}) {
    try {
      setLoader(true);
      let payload = {
        page,
        searchString: searchString,
        jobNo: params.get("jobId"),
      };
      const serverResponse = await communication.getReturnMaterialByJob(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setNonMaterial(serverResponse?.data?.material?.nonMaterials);
        setMaterial(serverResponse?.data?.material?.materials);
        toast.success(serverResponse.data.message);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
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
  const generatePayload = () => {
    const payload = {
      jobNo: params.get("jobId"),
      materialIds: selectedMaterials,
      nonMaterialIds: selectedNonMaterials,
    };

    // If either array is empty, set it to an empty array in the payload
    if (selectedMaterials.length === 0) payload.materialIds = [];
    if (selectedNonMaterials.length === 0) payload.nonMaterialIds = [];

    return payload;
  };
  const onSubmit = async () => {
    try {
      setLoader(true);
      const payload = generatePayload();
      // console.log(payload, "payyyyy");
      // console.log(values, "valllll");
      let response = await communication.returnMaterial(payload);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response?.data?.message);
        router.push("/dashboard/daily-task/");
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
  const handleMaterialCheckboxChange = (e, productId) => {
    if (e.target.checked) {
      setSelectedMaterials((prev) => [...prev, productId]);
    } else {
      setSelectedMaterials((prev) => prev.filter((id) => id !== productId));
    }
    setAllMaterialsSelected(selectedMaterials.length + 1 === material.length);
  };

  const handleNonMaterialCheckboxChange = (e, productId) => {
    if (e.target.checked) {
      setSelectedNonMaterials((prev) => [...prev, productId]);
    } else {
      setSelectedNonMaterials((prev) => prev.filter((id) => id !== productId));
    }
    setAllNonMaterialsSelected(selectedNonMaterials.length + 1 === nonMaterial.length);
  };

  const handleSelectAllMaterials = (e) => {
    const isChecked = e.target.checked;
    setAllMaterialsSelected(isChecked);
    if (isChecked) {
      setSelectedMaterials(material.map((item) => item._id));
    } else {
      setSelectedMaterials([]);
    }
  };

  const handleSelectAllNonMaterials = (e) => {
    const isChecked = e.target.checked;
    setAllNonMaterialsSelected(isChecked);
    if (isChecked) {
      setSelectedNonMaterials(nonMaterial.map((item) => item._id));
    } else {
      setSelectedNonMaterials([]);
    }
  };

  useEffect(() => {
    materialByJob();
  }, []);

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <div className="top_header">
            <div className="tab_title">Return Material</div>
          </div>
          <form>
            <div className="form_layout">
              <div className="form_list_layout_wrapper my-4">
                <div className="d-flex align-items-center justify-content-between">
                  <p>Non-Material List</p>
                </div>
                {/* table  */}
                <div className="table_wrapper my-3">
                  <div className="table_main">
                    <div className="table_section pi_product_table" style={{ minWidth: "1500px" }}>
                      <div className="table_header">
                        <div className="col_20p">
                          <div className="check_box">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              // id="selectAllCheckbox"
                              id="selectAllNonMaterialCheckbox"
                              onChange={handleSelectAllNonMaterials}
                              checked={allNonMaterialsSelected}
                            />
                          </div>
                        </div>
                        <div className="col_20p">
                          <h5>Sr. No.</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Location</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Block</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Rack</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Partation</h5>
                        </div>
                        <div className="col_30p">
                          <h5>Category</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Brand</h5>
                        </div>
                        <div className="col_30p">
                          <h5>Model</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Serial No</h5>
                        </div>{" "}
                        <div className="col_25p">
                          <h5>Item Code</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Quantity</h5>
                        </div>
                      </div>
                      {nonMaterial?.length > 0 ? (
                        nonMaterial?.map((product, index) => {
                          return (
                            <div className="table_data" key={index}>
                              <div className="col_20p">
                                <div className="check_box">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={product._id}
                                    onChange={(e) =>
                                      handleNonMaterialCheckboxChange(e, product._id)
                                    }
                                    checked={selectedNonMaterials.includes(product._id)}
                                    // id={product._id}
                                    // onChange={(e) => handleCheckboxChange(e)}
                                    // checked={selectedCheckboxes.includes(product._id)}
                                    // disabled={attachedDescriptions.includes(product._id)}
                                  />
                                </div>
                              </div>
                              <div className="col_20p">
                                <h6>{index + 1}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.locationId?.name}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.blockId?.blockNo}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.rackId?.rackName}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.partitionName}</h6>
                              </div>
                              <div className="col_30p">
                                <h6>{product?.categoryId?.name}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.brandId?.name}</h6>
                              </div>
                              <div className="col_30p">
                                <h6>{product?.modelId?.name}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.serialNo}</h6>
                              </div>{" "}
                              <div className="col_25p">
                                <h6>{product?.itemCode}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.assignQuantity}</h6>
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

              <div className="form_list_layout_wrapper my-4">
                <div className="d-flex align-items-center justify-content-between">
                  <p>Material List</p>
                </div>
                {/* table */}
                <div className="table_wrapper my-3">
                  <div className="table_main">
                    <div className="table_section pi_product_table" style={{ minWidth: "1500px" }}>
                      <div className="table_header">
                        <div className="col_20p">
                          <div className="check_box">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              // id="selectAllCheckbox"
                              id="selectAllMaterialCheckbox"
                              onChange={handleSelectAllMaterials}
                              checked={allMaterialsSelected}
                            />
                          </div>
                        </div>
                        <div className="col_20p">
                          <h5>Sr. No.</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Location</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Block</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Rack</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Partation</h5>
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
                        <div className="col_25p">
                          <h5>Serial No</h5>
                        </div>{" "}
                        <div className="col_25p">
                          <h5>Item Code</h5>
                        </div>
                        <div className="col_25p">
                          <h5>Quantity</h5>
                        </div>
                      </div>
                      {material?.length > 0 ? (
                        material?.map((product, index) => {
                          return (
                            <div className="table_data" key={index}>
                              <div className="col_20p">
                                <div className="check_box">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={product._id}
                                    onChange={(e) => handleMaterialCheckboxChange(e, product._id)}
                                    checked={selectedMaterials.includes(product._id)}
                                    // id={product._id}
                                    // onChange={(e) => handleCheckboxChange(e)}
                                    // checked={selectedCheckboxes.includes(product._id)}
                                    // disabled={attachedDescriptions.includes(product._id)}
                                  />
                                </div>
                              </div>
                              <div className="col_20p">
                                <h6>{index + 1}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.locationId?.name}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.blockId?.blockNo}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.rackId?.rackName}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.partitionName}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.categoryId?.name}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.brandId?.name}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.modelId?.name}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.serialNo}</h6>
                              </div>{" "}
                              <div className="col_25p">
                                <h6>{product?.itemCode}</h6>
                              </div>
                              <div className="col_25p">
                                <h6>{product?.assignQuantity}</h6>
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
              <div className="d-flex align-items-center justify-content-center gap-3 my-3">
                {/* {roleName != "admin" && ( */}
                <CustomBtn name={"Return"} onClick={handleSubmit(onSubmit)} />
                {/* // )} */}
                <CustomBtn
                  type="button"
                  name="Back"
                  onClick={() => router.push("/dashboard/daily-task")}
                />
              </div>
              {/* </div> */}
              {/* </div> */}
              {/* ---------------------------filter for material end----------------------------------------------------------*/}
              {/* ---------------------------attached material----------------------------------------------------------*/}
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default ReturnMaterialUser;
