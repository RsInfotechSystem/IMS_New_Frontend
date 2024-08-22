"use client";
import Loader from "@/common-components/Loader";
import Search from "@/common-components/Search";
import filterIcon from "../../../../../public/images/filter.png";
import SelectBox from "@/common-components/Select";
import { getLocations } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer, useState } from "react";
import { toast } from "react-toastify";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import { useForm } from "react-hook-form";
import { faCaretLeft, faCaretRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@/common-components/Button";
import StockFilter from "@/common-components/StockFilter";
const pageLimit = process.env.NEXT_PUBLIC_LIMIT ?? 20;
const TransferMaterialForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    getValues,
    formState: { errors },
  } = useForm();
  const [loader, setLoader] = useState(false);
  const params = useSearchParams();
  const [modalStates, setModalStates] = useState({ filter: false, modal: false });
  const [filter, setFilter] = useState({});
  const [page, setPage] = useState(1);
  const [selectedList, setSelectedList] = useState([]);
  const [selectAllCheckedStock, setSelectAllCheckedStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchString, setSearchString] = useState("");
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [material, setMaterial] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activelocations, setActiveLocations] = useState([]);
  const [locationAcess, setLocationAcess] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [stock, setStock] = useState([]);
  const [updatedProducts, setUpdatedProducts] = useState([]);
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
  const [fromLocation, setFromLocation] = useState({
    locationValue: { keyType: "", keyId: "", keyCount: 0 },
  });
  const onSubmit = async (values) => {
    // console.log("Form submitted with values: ", values);
    try {
      setLoader(true);
      const invalidQuantities = selectedList.filter((id) => !quantities[id]);
      // console.log("rrrrrrrrrrrrrrrrr>>>>>dd", invalidQuantities);
      // const invalidQuantities = selectedList.filter((id) => !quantities[id]);

      // if (invalidQuantities.length < 0) {
      //   toast.warn("Please provide quantity for all selected materials.");
      //   setLoader(false);
      //   return;
      // }
      // const selectedMaterials = selectedList.map((id) => ({
      //   id,
      //   quantity: quantities[id],
      // }));
      if (values.fromLocation == values.toLocation) {
        toast.warn("From location and To location can not be same.");
        setLoader(false);
        return;
      }
      // if (selectedMaterials.length == 0) {
      //   toast.warn("Please select one material");
      //   setLoader(false);
      //   return;
      // }
      const payload = {
        materialIds: updatedProducts.map((product) => ({
          id: product._id,
          quantity: product.quantity,
        })),
        // materialIds: selectedMaterials,
        fromLocation: values.fromLocation,
        toLocation: values.toLocation,
      };
      console.log("payload", payload);
      const serverResponse = await communication.transferMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        // router.push("/admin/dashboard/transfer-material");
        getStatusWiseMaterialList();
        setLoader(false);
        reset();
        toast.success(serverResponse.data.message);
        router.back();
      } else if (serverResponse?.data?.status == "FAILED") {
        toast.warn(serverResponse?.data?.message);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        toast.warn(serverResponse.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  };
  async function getActiveLocation() {
    try {
      setLoader(true);
      const serverResponse = await communication.getActiveLocation();
      if (serverResponse?.data?.status === "SUCCESS") {
        setActiveLocations(serverResponse?.data?.location);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
        props.setLoader(false);
      } else {
        setActiveLocations([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setLoader(false);
    }
  }
  async function getStatusWiseMaterialList({
    page = 1,
    searchString,
    isSearch = false,
    location,
    categoryId,
    brandId,
    modelId,
    categoryValue,
    brandValue,
    locationValue,
    isFirstCall,
    initialItem = [],
  } = {}) {
    try {
      setLoader(true);
      let payload = {
        page,
        searchString: searchString,
        location,
        categoryId,
        brandId,
        modelId,
        ...(state.categoryValue.keyType == "category" && { categoryId: state.categoryValue.keyId }),
        ...(state.brandValue.keyType == "brand" && { brandId: state.brandValue.keyId }),
        ...(state.locationValue.keyType == "location" && { location: state.locationValue.keyId }),
        ...(state?.modelNameValue?.keyType == "modelName" && {
          modelId: state?.modelNameValue?.keyId,
        }),
      };

      // console.log(categoryValue, brandValue, "rr");
      const serverResponse = await communication.getInventoryMaterial(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        const updatedStock = serverResponse?.data?.stock?.map((item) => ({
          ...item,
          quantity:
            initialItem.length > 0
              ? initialItem?.find((ele) => ele._id === item._id)?.quantity ?? 0
              : updatedProducts?.find((ele) => ele._id === item._id)?.quantity ?? 0,
        }));
        setMaterial(updatedStock);
        // setMaterial(serverResponse?.data.stock.filter((item) => item.reamainingQuantity > 0));
        setPageCount(serverResponse?.data?.totalPages);
        setLoader(false);
        if (isFirstCall) {
          setState({
            category: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({
                    categoryId: item?.categoryId?._id,
                    category: item?.categoryId?.name,
                  })
                )
              )
            ).map((item) => JSON.parse(item)),
            brand: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ brandId: item.brandId?._id, brand: item.brandId?.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            modelName: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({ modelId: item?.modelId?._id, modelName: item?.modelId?.name })
                )
              )
            ).map((item) => JSON.parse(item)),
            location: Array.from(
              new Set(
                serverResponse?.data.stock.map((item) =>
                  JSON.stringify({
                    locationId: item.locationId?._id,
                    location: item.locationId?.name,
                  })
                )
              )
            ).map((item) => JSON.parse(item)),
          });
        }

        setPage(page);
        if (isSearch) {
          setCurrentPage(1);
        }
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.warn(serverResponse.data.message);
        router.push("/");
      } else {
        toast.warn(serverResponse.data.message);
        setMaterial([]);
      }
      setLoader(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);

      setLoader(false);
    }
  }
  useEffect(() => {
    let isSearch = true;

    getStatusWiseMaterialList({
      page: 1,
      isSearch
    });
  }, [
    state?.categoryValue?.keyId,
    state?.brandValue?.keyId,
    state?.locationValue?.keyId,
    state?.modelNameValue?.keyId,
  ]);

  const handleCheckboxChange = (event, materialId) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add materialId to selectedList
      setSelectedList((prev) => {
        const newList = [...prev, materialId];
        if (newList.length === material.length) {
          setSelectAllCheckedStock(true);
        }
        return newList;
      });
    } else {
      // Remove materialId from selectedList
      setSelectedList((prev) => {
        const newList = prev.filter((id) => id !== materialId);
        setSelectAllCheckedStock(false);
        return newList;
      });
    }
  };

  const handleSelectAllChangeStock = (e) => {
    const isChecked = e.target.checked;
    setSelectAllCheckedStock(isChecked);

    if (isChecked) {
      // Select all checkboxes
      const allMaterialIds = material.map((item) => item._id);
      setSelectedList(allMaterialIds);
      // console.log("selectedlist", allMaterialIds);
    } else {
      // Deselect all checkboxes
      setSelectedList([]);
    }
  };
  const handleQuantityChange = (materialDetails, value) => {
    const materialId = materialDetails._id;
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [materialId]: value,
    }));
  };
  const handleIncrement = (id, materialDetails) => {
    setMaterial((prevStock) =>
      prevStock.map((product) => {
        if (product._id === id) {
          if (product.reamainingQuantity === 0) {
            toast.warn("Cannot add more, remaining quantity is 0.");
            // Swal.fire("Error", `Cannot add more, remaining quantity is 0.`, "warning");
            return product;
          } else if (product.reamainingQuantity === product.quantity) {
            return { ...product, quantity: product.reamainingQuantity };
          } else {
            return { ...product, quantity: product.quantity + 1 };
          }
        }
        return product;
      })
    );

    setUpdatedProducts((pre) => {
      const existingProduct = pre.find((ele) => ele._id === id);
      if (existingProduct) {
        return pre.map((ele) => {
          if (ele._id === id) {
            if (ele.reamainingQuantity === ele.quantity) {
              return { ...ele, quantity: ele.reamainingQuantity };
            } else {
              return { ...ele, quantity: ele.quantity + 1 };
            }
          } else {
            return ele;
          }
        });
      } else {
        if (materialDetails.reamainingQuantity === 0) {
          toast.warn("Cannot add more, remaining quantity is 0.");
          // Swal.fire("Error", `Cannot add more, remaining quantity is 0.`, "warning");
          return pre;
        } else {
          return [...pre, { ...materialDetails, quantity: 1 }];
        }
      }
    });
  };
  const handleDecrement = (id) => {
    setMaterial((prevStock) =>
      prevStock.map((product) => {
        if (product._id === id) {
          return { ...product, quantity: product.quantity <= 1 ? 0 : product.quantity - 1 };
        }
        return product;
      })
    );

    setUpdatedProducts((pre) =>
      pre
        .map((ele) => {
          if (ele._id === id) {
            return {
              ...ele,
              quantity: ele.quantity - 1,
            };
          } else {
            return ele;
          }
        })
        .filter((ele) => ele.quantity >= 1)
    );
  };
  const handleChange = (id, value, materialDetails) => {
    setMaterial((prevStock) =>
      prevStock.map((product) => {
        if (product._id === id) {
          if (product.reamainingQuantity === 0) {
            toast.warn("Cannot add more, remaining quantity is 0.");
            // Swal.fire("Error", `Cannot add more, remaining quantity is 0.`, "error");
            return product;
          } else if (product.reamainingQuantity < value) {
            toast.warn(`Cannot add more than ${product.reamainingQuantity}.`);
            // Swal.fire("Error", `Cannot add more than ${product.reamainingQuantity}.`, "warning");
            return { ...product, quantity: product.reamainingQuantity };

            // return product;
          } else {
            return { ...product, quantity: value };
          }
        }
        return product;
      })
    );

    setUpdatedProducts((pre) => {
      const existingProduct = pre.find((ele) => ele._id === id);
      if (existingProduct) {
        return pre
          .map((ele) => {
            if (ele._id === id) {
              if (ele.reamainingQuantity < value) {
                toast.warn(`Cannot add more than ${ele.reamainingQuantity}.`);
                return { ...ele, quantity: ele.reamainingQuantity };

                // return ele;
              } else {
                return { ...ele, quantity: value };
              }
            } else {
              return ele;
            }
          })
          .filter((ele) => ele.quantity > 0);
      } else {
        if (materialDetails.reamainingQuantity === 0) {
          toast.warn(`Cannot add more of ${materialDetails.name}, remaining quantity is 0.`);
          // Swal.fire(
          //   "Error",
          //   `Cannot add more of ${materialDetails.name}, remaining quantity is 0.`,
          //   "warning"
          // );
          return pre;
        } else {
          return [...pre, { ...materialDetails, quantity: value }];
        }
      }
    });
  };
  useEffect(() => {
    getLocations(setLoader, router, setLocations);
    getActiveLocation();
    setLocationAcess(getCookie("locationId"));
  }, []);
  useEffect(() => {
    getStatusWiseMaterialList({ page: currentPage, searchString, isFirstCall: true, });
  }, [isPageUpdated]);

  const handleBack = () => {
    router.push("/dashboard/transfer-material");
    router.back();
    return;
  };
  // console.log(errors, "rrrrrrrr  eeeeeee");
  return (
    <>
      {loader && <Loader text={"Loading..."} />}
      {modalStates?.filter && (
        <StockFilter
          setModalStates={setModalStates}
          apiCall={getStatusWiseMaterialList}
          filter={filter}
          setFilter={setFilter}
        />
      )}
      <form>
        <div className="top_header">
          <div className="tab_title">Transfer Material Form</div>
          <div className="search_btn_wrapper">
            {/* <Search value={searchString} onChange={handleSearch} placeholder={"Search"} /> */}
            {
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
                  Back
                </div>
              </div>
            }
          </div>
        </div>

        <div className="form_wrapper">
          <div className="row my-2">
            <div className="input_wrapper col-12 col-md-6 col-lg-3">
              <label>Select From Location*</label>
              <SelectBox
                // {...register("fromLocation", {
                //   required: "From Location is required",
                // })}
                register={{
                  ...register("fromLocation", {
                    required: "From Location is required",
                  }),
                }}
                onChange={(e) =>
                  setState({
                    locationValue: {
                      keyType: "location",
                      keyId: e.target.value,
                      // keyCount: state.locationValue.keyCount + 1,
                    },
                  })
                }
                firstOption="select location"
                options={locations}
                displayName={"name"}
                value={"_id"}
                disable={false}
                errors={errors.fromLocation}
              />
            </div>
            <div className="input_wrapper col-12 col-md-6 col-lg-3">
              <label>Select To Location*</label>
              <SelectBox
                firstOption="select location"
                options={activelocations}
                displayName={"name"}
                value={"_id"}
                disable={false}
                register={{
                  ...register("toLocation", {
                    required: "To Location is required",
                  }),
                }}
                errors={errors.toLocation}
              />
            </div>
          </div>
          <div className="form_list_layout_wrapper">
            <div className="d-flex align-items-center justify-content-between py-2">
              <p>Material List</p>
            </div>
            <div className="search_btn_wrapper">
              {/* <Search value="" onChange={() => {}} placeholder="Search" /> */}
              {
                <div className="buttons_wrapper">
                  <CustomBtn
                    type="button"
                    name={"Filter"}
                    onClick={() => {
                      setModalStates((prev) => ({ ...prev, filter: true }));
                    }}
                    svg={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 512 512"
                        fill="#fff"
                      >
                        <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
                      </svg>
                    }
                  />
                  <CustomBtn
                    type="button"
                    name={"Reset Filter"}
                    onClick={() => {
                      getStatusWiseMaterialList();
                    }}
                    style={{ padding: "0px", minWidth: "120px" }}
                  />
                </div>
              }
            </div>
            {/* table  */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                {/* Rename the class name "pi_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                <div className="table_section pi_product_table" style={{ minWidth: "2000px" }}>
                  <div className="table_header">
                    {/* <div className="col_20p">
                      {" "}
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="selectAllCheckbox"
                          onChange={(e) => handleSelectAllChangeStock(e)}
                          checked={selectAllCheckedStock}
                        />
                      </div>
                    </div> */}
                    <div className="col_10p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_50p">
                      {/* {state.categoryFilter ? (
                        <>
                          <select
                            className="selectBox text-capitalize"
                            onChange={(e) =>
                              setState({
                                categoryValue: {
                                  keyType: "category",
                                  keyId: e.target.value,
                                  keyCount: state.categoryValue.keyCount + 1,
                                },
                              })
                            }
                            value={state.categoryValue.keyId}
                          >
                            <option value="">Select All</option>
                            {state.category.map((item, index) => {
                              return (
                                <option value={item.categoryId} key={index}>
                                  {item.category}
                                </option>
                              );
                            })}
                          </select>
                          <Image
                            onClick={() => setState({ categoryFilter: !state.categoryFilter })}
                            className="cursor-pointer"
                            src={filterIcon}
                            width={15}
                            height={15}
                            alt="filter-icon"
                          ></Image>
                        </>
                      ) : (
                        <>
                          <h5>Category</h5>
                          <div>
                            <Image
                              onClick={() => setState({ categoryFilter: true })}
                              className="cursor-pointer"
                              src={filterIcon}
                              width={15}
                              height={15}
                              alt="filter-icon"
                            ></Image>
                          </div>
                        </>
                      )} */}
                      <h5>Category Name</h5>

                    </div>
                    <div className="col_40p">
                      {/* {state.brandFilter ? (
                        <>
                          <select
                            className="selectBox text-capitalize"
                            onChange={(e) =>
                              setState({
                                brandValue: {
                                  keyType: "brand",
                                  keyId: e.target.value,
                                  keyCount: state.brandValue.keyCount + 1,
                                },
                              })
                            }
                            value={state.brandValue.keyId}
                          >
                            <option value="">Select All</option>
                            {state.brand.map((item, index) => {
                              return (
                                <option value={item.brandId} key={index}>
                                  {item.brand}
                                </option>
                              );
                            })}
                          </select>
                          <Image
                            onClick={() => setState({ brandFilter: !state.brandFilter })}
                            className="cursor-pointer"
                            src={filterIcon}
                            width={15}
                            height={15}
                            alt="filter-icon"
                          ></Image>
                        </>
                      ) : (
                        <>
                          <h5>Brand</h5>
                          <div>
                            <Image
                              onClick={() => setState({ brandFilter: true })}
                              className="cursor-pointer"
                              src={filterIcon}
                              width={15}
                              height={15}
                              alt="filter-icon"
                            ></Image>
                          </div>
                        </>
                      )} */}
                      <h5>Brand Name</h5>

                    </div>
                    <div className="col_50p">
                      {/* {state.locationFilter ? (
                        <>
                          <select
                            className="selectBox text-capitalize"
                            onChange={(e) =>
                              setState({
                                locationValue: {
                                  keyType: "location",
                                  keyId: e.target.value,
                                  keyCount: state.locationValue.keyCount + 1,
                                },
                              })
                            }
                            value={state.locationValue.keyId}
                          >
                            <option value="">Select All</option>
                            {state.location.map((item, index) => {
                              return (
                                <option value={item.locationId} key={index}>
                                  {item.location}
                                </option>
                              );
                            })}
                          </select>
                          <Image
                            onClick={() => setState({ locationFilter: !state.locationFilter })}
                            className="cursor-pointer"
                            src={filterIcon}
                            width={15}
                            height={15}
                            alt="filter-icon"
                          ></Image>
                        </>
                      ) : (
                        <>
                          <h5>Location</h5>
                          <div>
                            <Image
                              onClick={() => setState({ locationFilter: true })}
                              className="cursor-pointer"
                              src={filterIcon}
                              width={15}
                              height={15}
                              alt="filter-icon"
                            ></Image>
                          </div>
                        </>
                      )} */}
                      <h5>Location Name</h5>
                    </div>
                    <div className="col_50p">
                      {/* {state?.modelNameFilter ? (
                        <>
                          <select
                            className="selectBox text-capitalize"
                            onChange={(e) =>
                              setState({
                                modelNameValue: {
                                  keyType: "modelName",
                                  keyId: e.target.value,
                                  keyCount: state?.modelNameValue?.keyCount + 1,
                                },
                              })
                            }
                            value={state?.modelNameValue?.keyId}
                          >
                            <option value="">Select All</option>
                            {state?.modelName?.map((item, index) => {
                              return (
                                <option value={item?.modelId} key={index}>
                                  {item?.modelName}
                                </option>
                              );
                            })}
                          </select>
                          <Image
                            onClick={() => setState({ modelNameFilter: !state?.modelNameFilter })}
                            className="cursor-pointer"
                            src={filterIcon}
                            width={15}
                            height={15}
                            alt="filter-icon"
                          ></Image>
                        </>
                      ) : (
                        <>
                          <h5>Model Name</h5>
                          <div>
                            <Image
                              onClick={() => setState({ modelNameFilter: true })}
                              className="cursor-pointer"
                              src={filterIcon}
                              width={15}
                              height={15}
                              alt="filter-icon"
                            ></Image>
                          </div>
                        </>
                      )} */}
                      <h5>Modal Name</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Item Code</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Block Name</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Rack Name</h5>
                    </div>{" "}
                    <div className="col_50p">
                      <h5>Partation Name</h5>
                    </div>{" "}
                    <div className="col_50p">
                      <h5>Serial No.</h5>
                    </div>{" "}
                    <div className="col_50p">
                      <h5>Status</h5>
                    </div>{" "}
                    <div className="col_50p">
                      <h5>QTY</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Enter Quantity</h5>
                    </div>
                  </div>
                  {material?.length > 0 ? (
                    <>
                      {material?.map((materialDetails, index) => (
                        <div className="table_data" key={index}>
                          {/* <div className="col_20p">
                            <div className="check_box">
                              <input
                                type="checkbox"
                                onChange={(e) => handleCheckboxChange(e, materialDetails._id)}
                                checked={selectedList.includes(materialDetails._id)}
                              />
                            </div>
                          </div> */}
                          <div className="col_10p">
                            <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                          </div>
                          <div className="col_50p">
                            <h6>{materialDetails?.category}</h6>
                          </div>
                          <div className="col_40p">
                            <h6>{materialDetails?.brand}</h6>
                          </div>{" "}
                          <div className="col_50p d-flex justify-content-center">
                            <h6>{materialDetails?.location}</h6>
                          </div>
                          <div className="col_50p">
                            <h6>
                              {materialDetails?.modelId?.name
                                ? materialDetails?.modelId?.name
                                : "-"}
                            </h6>
                          </div>
                          <div className="col_50p">
                            <h6>{materialDetails?.itemCode ? materialDetails?.itemCode : "-"}</h6>
                          </div>
                          <div className="col_50p">
                            <h6>{materialDetails?.block}</h6>
                          </div>
                          <div className="col_50p">
                            <h6>{materialDetails?.rack ? materialDetails?.rack : "-"}</h6>
                          </div>{" "}
                          <div className="col_50p">
                            <h6>
                              {materialDetails?.partitionName
                                ? materialDetails?.partitionName
                                : "-"}
                            </h6>
                          </div>
                          <div className="col_50p">
                            <h6>{materialDetails?.serialNo ? materialDetails?.serialNo : "--"}</h6>
                          </div>
                          <div className="col_50p">
                            <h6>{materialDetails?.status}</h6>
                          </div>
                          <div className="col_50p">
                            <h6>
                              {materialDetails?.reamainingQuantity === 0
                                ? "'"
                                : materialDetails?.reamainingQuantity}
                            </h6>
                          </div>
                          {/* <div className="col_50p">
                            <div className="action_inventary_transfer">
                              <h6>
                                <InputBox
                                  placeholder="Enter Quantity"
                                  // type={"text"}
                                  value={quantities[materialDetails._id]}
                                  onChange={(e) => {
                                    handleQuantityChange(materialDetails, e.target.value);
                                  }}
                                />
                              </h6>
                            </div>
                          </div> */}
                          <div className="col_50p">
                            <h6 className="action_wrraper">
                              <div className="qty_add_sub_layout">
                                <div
                                  className="qty_decrement"
                                  title="-"
                                  onClick={() => {
                                    handleDecrement(materialDetails._id);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faCaretLeft} className="inc_dec_icon" />
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  value={materialDetails?.quantity}
                                  className="qty_input"
                                  onChange={(e) => {
                                    handleChange(
                                      materialDetails?._id,
                                      Number(e.target.value),
                                      materialDetails
                                    );
                                  }}
                                  onWheel={(e) => {
                                    e.target.blur();
                                  }}
                                />
                                <div
                                  className="qty_increment"
                                  title="+"
                                  onClick={() => {
                                    handleIncrement(materialDetails?._id, materialDetails);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faCaretRight} className="inc_dec_icon" />
                                </div>
                              </div>
                            </h6>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="no_data">Data Not Available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* <button type="submit">send</button> */}
          {/* second table start */}
          <div className="form_list_layout_wrapper mt-3">
            <div className="d-flex align-items-center justify-content-between py-2">
              <p>List Preview</p>
            </div>

            {/* table  */}
            <div className="table_wrapper my-3">
              <div className="table_main">
                {/* Rename the class name "pi_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                <div className="table_section pi_product_table employee_table">
                  <div className="table_header">
                    <div className="col_10p">
                      <h5>Sr. No.</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Category</h5>
                    </div>
                    <div className="col_40p">
                      <h5>Brand</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Location</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Model Name</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Item Code</h5>
                    </div>
                    <div className="col_50p">
                      <h5>Serial No.</h5>
                    </div>{" "}
                    <div className="col_50p">
                      <h5>Status</h5>
                    </div>{" "}
                    <div className="col_50p">
                      <h5>QTY</h5>
                    </div>
                    <div className="col_20p">
                      <h5>Action</h5>
                    </div>
                  </div>
                  {updatedProducts?.map((data, index) => {
                    return (
                      <div className="table_data" key={index}>
                        <div className="col_10p">
                          <h6>{index + 1}</h6>
                        </div>
                        <div className="col_50p">
                          <h6>{data?.category}</h6>
                        </div>
                        <div className="col_40p">
                          <h6>{data?.brand}</h6>
                        </div>
                        <div className="col_50p">
                          <h6>{data?.location}</h6>
                        </div>
                        <div className="col_50p">
                          <h6>{data?.modelId?.name ? data?.modelId?.name : "-"}</h6>
                        </div>
                        <div className="col_50p">
                          <h6>{data?.itemCode ? data?.itemCode : "-"}</h6>
                        </div>
                        <div className="col_50p">
                          <h6>{data?.serialNo ? data?.serialNo : "-"}</h6>
                        </div>{" "}
                        <div className="col_50p">
                          <h6>{data?.status}</h6>
                        </div>{" "}
                        <div className="col_50p">
                          <h6>{data?.quantity}</h6>
                          {/* <h6>{data?.reamainingQuantity === 0 ? "'" : data?.reamainingQuantity}</h6> */}
                        </div>
                        <div className="col_20p">
                          <h6>
                            {" "}
                            {
                              <FontAwesomeIcon
                                icon={faTrash}
                                onClick={() =>
                                  setUpdatedProducts((pre) => pre.filter((ele, i) => i !== index))
                                }
                              />
                            }{" "}
                          </h6>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/*  buttons*/}
            <div className="d-flex align-items-center justify-content-center gap-3 my-3">
              {params.get("type") !== "approval" && (
                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  name={[undefined, null, ""]?.includes(params.get("poId")) ? "Transfer" : "Update"}
                  className="button"
                />
              )}
              {/* {(params.get("type") === "approval" && modalState.viewPrintBill === false) && <Button type="submit" onClick={handleSubmit(receivePaymentPo)} name={"Receive Payment"} className="button" />} */}
              {/* {(params.get("type") === "approval" && modalState.viewPrintBill) && <Button onClick={() => printBill()} name={"Print Bill"} className="button" />} */}
              <Button
                type="button"
                onClick={() => {
                  // router.push("/dashboard/transfer-material");
                  router.back();
                }}
                name={"Back"}
                className="button"
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default TransferMaterialForm;
