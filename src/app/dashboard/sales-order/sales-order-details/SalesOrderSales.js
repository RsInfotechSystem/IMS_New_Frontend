"use client";
import Button from "@/common-components/Button";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import Search from "@/common-components/Search";
import SelectBox from "@/common-components/Select";
import currencyFormatter from "@/helper/currencyFormatter";
import { getActiveVendorList, getCategory, getCategoryWiseBrand } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { vendorType } from "@/utilities/vendorType";
import { faCaretLeft, faCaretRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCookie } from "cookies-next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
// import ViewBill from "../ViewBill";

const SalesOrderSales = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const searchParams = useSearchParams();
  const [_description, _setDiscription] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [material, setMaterial] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [payloadIds, setPayloadIds] = useState([]);
  const [attachedMaterial, setAttachedMaterial] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [quantities, setQuantities] = useState([]);
  const categoryId = watch("categoryId");
  const brandId = watch("brandId");
  const type = watch("type");
  const [stock, setStock] = useState([]);
  const [CategoryMapData, setCategoryMapData] = useState([]);
  const [brand, setBrand] = useState([]);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [location, setLocation] = useState();
  const [filter, setFilter] = useState({
    searchString: "",
    categoryId: "",
    brandId: "",
  });
  const [disable, setDisable] = useState(false);
  const [modalState, setModalStates] = useState({
    viewPdf: false,
    data: "",
    viewPrintBill: false,
  });
  const [allCategory, setAllCategory] = useState([]);
  const [supplyItems, setSupplyItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [user, setUser] = useState([]);
  // State to store the values of the selected category
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const _location = watch("locationId");
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    materials: [],
  });
  // ________________________API FOR USER__________________________________
  async function getSalesOrderById() {
    try {
      setLoader(true);
      let payload = {
        orderId: searchParams.get("orderId"),
      };
      const serverResponse = await communication.getSalesOrderById(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setModelList(serverResponse?.data?.salesorder);
        _setDiscription(
          serverResponse?.data?.salesorder?.materialDetails?.map(
            (item) => item?.materialDescription
          )
        );
        setLocation(serverResponse?.data?.salesorder?.orderLocation?._id);
        // setPageCount(serverResponse?.data?.totalPages);
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        // Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        setModelList([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      // Swal.fire({
      //   text: error?.response?.data?.message || error.message,
      //   icon: "warning",
      // });
      setLoader(false);
    }
  }
  async function getLocationWiseMaterial({ isFirstCall } = {}) {
    try {
      setLoader(true);
      let payload = {
        locationId: location,
      };
      const serverResponse = await communication.getLocationWiseMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        setMaterial(serverResponse?.data.material);
        setPageCount(serverResponse?.data?.totalPages);
        setState({ materialLists: serverResponse?.data.material });
        if (isFirstCall) {
          setState({
            category: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({ categoryId: item.categoryId, category: item.category })
                )
              )
            ).map((item) => JSON.parse(item)),
            brand: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({ brandId: item.brandId, brand: item.brand })
                )
              )
            ).map((item) => JSON.parse(item)),
            modelName: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({ modelId: item?.modelId?._id, modelName: item?.modelId?.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            location: Array.from(
              new Set(
                serverResponse?.data.material.map((item) =>
                  JSON.stringify({ locationId: item.locationId, location: item.location })
                )
              )
            ).map((item) => JSON.parse(item)),
          });
        }
        // setPage(page);
        // if (isSearch) {
        //   setCurrentPage(1);
        // }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
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
  async function sendReadyMaterial(values) {
    // console.log("onsubmit", values);
    try {
      if (payloadIds.length < 1) {
        Swal.fire({ text: "Please attached material.", icon: "warning" });
        return;
      }
      if (payloadIds.length !== modelList?.materialDetails?.length) {
        Swal.fire({ text: "Please attached all material.", icon: "warning" });
        return;
      }
      setLoader(true);
      let payload = {
        orderId: searchParams.get("orderId"),
        materialDetails: payloadIds,
      };

      // console.log("payload", payload);
      const serverResponse = await communication.sendReadyMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        Swal.fire({ text: serverResponse.data.message, icon: "success" });
        setLoader(false);
        setModelList([]);
        router.push("/admin/dashboard/sales-order");
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
        router.push("/");
        setLoader(false);
      } else {
        Swal.fire({ text: serverResponse.data.message, icon: "warning" });
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
  const handleChange = (modelData, value) => {
    // console.log("valueRRRRR", modelData, value);
    setPayloadIds([...payloadIds, { detailId: modelData._id, materialId: value }]);
  };
  useEffect(() => {
    setRoleName(getCookie("role"));
  }, []);
  useEffect(() => {
    getSalesOrderById();
    // getMaterialById();
  }, []);
  useEffect(() => {
    if (location) getLocationWiseMaterial({ isFirstCall: true });
  }, [_location]);
  return (
    <>
      {loader && <Loader text={"Loading..."} />}
      {modalState.viewPdf && (
        <ViewSalesOrder pdfData={modalState?.data} setModalStates={setModalStates} />
      )}

      {/* top header  */}
      <div className="top_header">
        <div className="tab_title">Attach Ready Material for Sales Order</div>
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
                  fill="#198754"
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
      <div className="form_list_layout_wrapper my-4">
        <div className="d-flex align-items-center justify-content-between">
          <p>Sales Order Item Preview</p>
        </div>
        {/* table  */}
        <div className="table_wrapper my-3">
          <div className="table_main">
            <div className="table_section pi_product_table">
              <div className="table_header">
                <div className="col_25p">
                  <h5>Sr. No.</h5>
                </div>
                <div className="col_25p">
                  <h5>Description</h5>
                </div>

                <div className="col_25p">
                  <h5>Quantity</h5>
                </div>
                <div className="col_25p">
                  <h5>Warranty</h5>
                </div>
                <div className="col_25p">
                  <h5 className="action_wrraper">Note</h5>
                </div>

                {/* <div className="col_20p">
                  <h5 className="action_wrraper">Remove</h5>
                </div> */}
              </div>
              {modelList?.materialDetails?.length > 0 ? (
                modelList?.materialDetails?.map((product, index) => {
                  return (
                    <div className="table_data" key={index}>
                      <div className="col_25p">
                        <h6>{index + 1}</h6>
                      </div>

                      <div className="col_25p">
                        <h6>{product?.materialDescription}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{product?.quantity ? product?.quantity : "--"}</h6>
                      </div>
                      <div className="col_25p">
                        <h6>{product?.note ? product?.note : "--"}</h6>
                      </div>
                      <div className="col_25p">
                        <h6 className="action_wrraper">
                          {product?.warranty ? product?.warranty : "--"}
                        </h6>
                      </div>
                      {/* <div className="col_20p">
                        <h6 className="action_wrraper ">
                          <FontAwesomeIcon
                            icon={faTrash}
                            // onClick={() => deleteProduct(index)}
                            className="trash"
                          />
                        </h6>
                      </div> */}
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
      <form>
        <div>
          {loader && <Loader />}
          {/* Add sales order material */}
          {/* <div className="form_wrapper"> */}
          <div className="form_list_layout_wrapper">
            <div className="d-flex align-items-center justify-content-between py-2">
              <div className="form_layout">
                <div className="row d-flex align-items-end">
                  <div className="input_wrapper col-lg-3">
                    <label>Description*</label>
                    <SelectBox
                      options={_description}
                      defaultLabel="Select Category"
                      // displayName={"name"}
                      // value={"_id"}
                      register={{
                        ...register("_description", {
                          // required: "Category is required",
                        }),
                      }}
                      // errors={errors.categoryId}
                    />
                  </div>
                  <div className="input_wrapper col-lg-3">
                    <label>Material*</label>
                    <SelectBox
                      options={_description}
                      defaultLabel="Select Category"
                      // displayName={"name"}
                      // value={"_id"}
                      register={{
                        ...register("_description", {
                          // required: "Category is required",
                        }),
                      }}
                      // errors={errors.categoryId}
                    />
                  </div>
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <label>Quantity*</label>
                    <InputBox
                      // type={"text"}
                      register={{
                        ...register("quantity", {
                          // required: "quantity Name is required",
                        }),
                      }}
                      errors={errors.quantity}
                    />
                  </div>
                  <div className="col-lg-3 col-md-6 input_wrapper">
                    <button
                      type="button"
                      className="btn btn-success"
                      // onClick={addMaterial}
                    >
                      Add
                    </button>
                  </div>
                </div>
                {/* <div className="row d-flex align-items-end">
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Warranty *</label>
                      <InputBox
                        // type={"number"}
                        register={{
                          ...register("warrenty", {
                            // required: "warrenty Name is required",
                          }),
                        }}
                        errors={errors.warrenty}
                      />
                    </div>
                    <div className="col-lg-3 col-md-6 input_wrapper">
                      <label>Note *</label>
                      <InputBox
                        // type={"number"}
                        register={{
                          ...register("note", {
                            // required: "note Name is required",
                          }),
                        }}
                        errors={errors.note}
                      />
                    </div>
                  </div> */}
                <div className="row d-flex align-items-end"></div>
              </div>
            </div>
          </div>
          {/* </div> */}
          {/*// Sales Order Preview*/}
          <div className="form_list_layout_wrapper my-4">
            <div className="d-flex align-items-center justify-content-between">
              <p>Sales Order Item Preview</p>
            </div>
            {/* table */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                <div className="table_section pi_product_table">
                  <div className="table_header">
                    <div className="col_25p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Description</h5>
                    </div>

                    <div className="col_25p">
                      <h5>Quantity</h5>
                    </div>
                    <div className="col_25p">
                      <h5>Warranty</h5>
                    </div>
                    <div className="col_25p">
                      <h5 className="action_wrraper">Note</h5>
                    </div>

                    <div className="col_20p">
                      <h5 className="action_wrraper">Action</h5>
                    </div>
                  </div>
                  {/* {state.materials?.length > 0 ? (
                      state.materials?.map((product, index) => {
                        return (
                          <div className="table_data" key={index}>
                            <div className="col_25p">
                              <h6>{index + 1}</h6>
                            </div>

                            <div className="col_25p">
                              <h6>{product?.materialDescription}</h6>
                            </div>
                            <div className="col_25p">
                              <h6>{product?.quantity ? product?.quantity : "--"}</h6>
                            </div>
                            <div className="col_25p">
                              <h6>{product?.note ? product?.note : "--"}</h6>
                            </div>
                            <div className="col_25p">
                              <h6 className="action_wrraper">
                                {product?.warranty ? product?.warranty : "--"}
                              </h6>
                            </div>
                            <div className="col_20p">
                              <h6 className="action_wrraper ">
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  // onClick={() => deleteProduct(index)}
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
                    )} */}
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-3 my-3">
            {/* <button type="button" onClick={""} className="btn btn-success">
                   Send
                 </button> */}

            <CustomBtn
              name={"Save"}
              // name={
              //   buttonLoader ? (
              //     <ButtonLoader />
              //   ) : [undefined, null, ""]?.includes(recipeId) ? (
              //     "Create"
              //   ) : (
              //     "Update"
              //   )
              // }
              type="submit"
              className="btn btn-success"
              onClick={() => handleSubmit(createOrder)}
            ></CustomBtn>
          </div>
        </div>
        {/* )} */}
      </form>
    </>
  );
};

export default SalesOrderSales;
