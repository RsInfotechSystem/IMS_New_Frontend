"use client";
import CustomBtn from "@/common-components/CustomBtn";
import CustomResponseHandlerModal from "@/common-components/CustomResponseHandlerModal";
import InputBox from "@/common-components/InputBox";
import InputBoxOnChange from "@/common-components/InputBoxOnChange";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { communication } from "@/services/communication";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ReadyMaterial = () => {
  const [modalStates, setModalStates] = useState({
    deleteOrder: false,
    modal: false,
    type: "",
    id: "",
  });
  const searchParams = useSearchParams();
  const [attachedMaterial, setAttachedMaterial] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const router = useRouter();
  const [timeoutId, setTimeoutId] = useState();
  const [respondHandlerModalState, setRespondHandlerModalState] = useState({
    state: false,
    deleteId: "",
  });

  const [title, setTitle] = useState("")
  const [localQuantities, setLocalQuantities] = useState({});

  // console.log("attachedMaterial", attachedMaterial);


  const getMaterialById = async () => {
    try {
      setLoader(true);
      let response = await communication.getAttachedMaterialById({
        orderId: searchParams.get("orderId"),
      });
      if (response?.data?.status === "SUCCESS") {
        setAttachedMaterial(response.data?.salesorder);
        // console.log("wdef", resssponse.data?.salesorder);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        router.push("/");
      } else {
        toast.warn(response.data.message);
      }
      setLoader(false);
    } catch (error) {
      toast.warn(error.message);
      setLoader(false);
    }
  };
  useEffect(() => {
    getMaterialById();
  }, []);

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    setSelectAllChecked(
      !selectedCheckboxes.includes(checkboxId) &&
      selectedCheckboxes?.length + 1 === attachedMaterial?.materialDetails?.length
    );
    setSelectedCheckboxes((prevSelected) => {
      if (prevSelected.includes(checkboxId)) {
        return prevSelected.filter((id) => id !== checkboxId);
      } else {
        return [...prevSelected, checkboxId];
      }
    });
  };
  const handleSelectAllChange = (e) => {
    setSelectAllChecked(e.target.checked);
    setSelectedCheckboxes((prevSelected) =>
      e.target.checked
        ? attachedMaterial?.materialDetails?.map((brandDetails) => brandDetails._id)
        : []
    );
  };

  // const handleQuantityChange = (materialData, value, product) => {
  //   clearTimeout(timeoutId);
  //   let _timeOutId = setTimeout(() => {
  //     setQuantities((prev) => [
  //       ...prev,
  //       {
  //         detailId: product?._id,
  //         materialIds: [
  //           {
  //             id: materialData?._id,
  //             sellingQuantity: Number(value),
  //           },
  //         ],
  //       },
  //     ]);
  //   }, 2000);
  //   setTimeoutId(_timeOutId);
  // };

  const handleQuantityChange = (materialData, value, product) => {
    console.log(value, "value");

    console.log(materialData, "materialData");

    setLocalQuantities(prev => ({
      ...prev,
      [`${product._id}-${materialData._id}`]: {
        detailId: product._id,
        materialIds: [
          {
            id: materialData._id,
            sellingQuantity: Number(value),
          },
        ],
      }
    }));
  };
  const handleInputBlur = () => {
    // Update the global quantities state when the input loses focus
    setQuantities(Object.values(localQuantities));
  };
  async function allsalesOrderSell() {
    try {
      setLoader(true);
      let payload = { orderId: searchParams.get("orderId") };
      const serverResponse = await communication.allMaterialOrderSells(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        router.back();
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

  async function salesOrderSell(flag = false) {
    try {
      if (quantities?.length < 1) {
        toast.info("Add quantity for sell");
        return;
      }

      setLoader(true);
      let payload = {
        orderId: searchParams.get("orderId"),
        flag: flag,
        materialDetails: quantities,
      };
      const serverResponse = await communication.SalesOrderSells(payload);
      if (serverResponse?.data?.status === "SUCCESS") {
        toast.success(serverResponse.data.message);
        getMaterialById();
        router.back();
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
  const showInputDialog = () => {
    Swal.fire({
      html: `<p>Do you want to save this order for later  ?</p>`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Finale Sales",
      customClass: {
        confirmButton: 'custom-button',
        cancelButton: 'custom-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked "Later"
        const flag = false; // Set the flag to true
        salesOrderSell(flag);
      } else {
        // User clicked "Cancel"
        // deleteSaleOrder();
        const flag = true;
        salesOrderSell(flag);
      }
    });
  };

  const deleteSaleOrder = async () => {
    try {
      setLoader(true);
      setModalStates((prev) => ({ ...prev, deleteOrder: false }));
      let payload = {
        orderId: searchParams.get("orderId"),
      };
      let response = await communication.deleteSaleOrder(payload);
      if (response?.data?.status === "SUCCESS") {
        toast.success(response.data.message);
        // router.push("dashboard/ready-sales-material");
        router.back()
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
    setTitle(searchParams.get("type") == "NotReady")
  })
  const cancelHandler = () => {
    setRespondHandlerModalState((prev) => ({ ...prev, state: false }));
  };

  return (
    <div>
      {modalStates.deleteOrder && (
        <CustomResponseHandlerModal
          status="warning"
          message={`Do you want to delete Order?`}
          successHandler={() => {
            deleteSaleOrder();
          }}
          cancelHandler={() => {
            setModalStates((prev) => ({ ...prev, deleteOrder: false }));
          }}
        />
      )}
      {respondHandlerModalState.state && (
        <CustomResponseHandlerModal
          status="warning"
          message="Are you sure you want to sell all items?"
          cancelHandler={cancelHandler}
          successHandler={() => allsalesOrderSell()}
        />
      )}
      <div className="top_header">
        {title ? (
          <div className="tab_title">Sales order Details</div>
        ) :
          (
            <div className="tab_title">Ready Sales Material for sales</div>
          )}

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

      <div className="table_wrapper my-3">
        {/* {console.log(quantities, "quantities")} */}

        <div className="table_main">
          <div className="table_section pi_product_table">
            <div className="table_header">
              <div className="col_10p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_35p">
                <h5>Description</h5>
              </div>
              <div className="col_25p">
                <h5>QTY</h5>
              </div>
              <div className="col_25p">
                <h5>Warranty</h5>
              </div>
              <div className="col_25p">
                <h5>Note</h5>
              </div>
              {attachedMaterial?.formStatus == "ready" && (
                <>
                  <div className="col_25p">
                    <h5>Category</h5>
                  </div>
                  <div className="col_25p">
                    <h5>Brand</h5>
                  </div>
                  <div className="col_35p">
                    <h5>Model</h5>
                  </div>
                  <div className="col_50p">
                    <h5>Selling Quantity</h5>
                  </div>
                </>
              )}
              {console.log(attachedMaterial, "sssssssssss")}

            </div>

            {/* {(attachedMaterial?.materialDetails?.length > 0 && attachedMaterial?.formStatus == "ready") && (
              attachedMaterial?.materialDetails?.map((product, index) => {
                return product?.materialIds?.map((material, materialIndex) => (
                  <div className="table_data" key={material._id}>
                    <div className="col_10p">
                      <h6>
                        {index + 1}.{materialIndex + 1}
                      </h6>
                    </div>
                    <div className="col_35p">
                      <h6>{product?.materialDescription}</h6>
                    </div>
                    <div className="col_25p">
                      <h6>{product?.quantity}</h6>
                    </div>
                    <div className="col_25p">
                      <h6>{product?.warranty ? product?.warranty : "--"}</h6>
                    </div>
                    <div className="col_25p">
                      <h6>{material?.categoryId?.name}, </h6>
                    </div>
                    <div className="col_25p">
                      <h6>{material?.brandId?.name}, </h6>
                    </div>
                    <div className="col_35p">
                      <h6>{material?.modelId?.name}</h6>
                    </div>
                    <div className="col_50p">
                      <h6>
                        <InputBoxOnChange
                          className="inputBox"
                          type="number"
                          placeholder="Enter Quantity"
                          value={localQuantities[`${product._id}-${material._id}`]?.materialIds[0]?.sellingQuantity || ''}
                          onChange={(e) => {
                            handleQuantityChange(material, e.target.value, product);
                          }}
                          onBlur={handleInputBlur}
                        />
                      </h6>
                    </div>
                    <div className="col_25p">
                      <h6 className="action_wrraper">{product?.note ? product?.note : "--"}</h6>
                    </div>
                  </div>
                ));
              })
            )} */}
            <div className="" style={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
              {(attachedMaterial?.materialDetails?.length > 0 && attachedMaterial?.formStatus == "ready") && (
                attachedMaterial?.materialDetails?.map((product, index) => {
                  return (
                    <div className="table_data_group" style={{ display: "flex", width: "100%", borderBottom: "1px solid var(--grey_color_light_shade1)" }} key={`group-${index}`}>
                      {/* Left Side with Material Description */}
                      <div className="" style={{ width: "50%", display: "flex", flexDirection: "column" }}>
                        <div className="table_data" style={{ flex: 1 }}>
                          <div className="col_10p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_35p">
                            <h6>{product?.materialDescription}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.quantity}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.warranty ? product?.warranty : "--"}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.note ? product?.note : "--"}</h6>
                          </div>
                        </div>
                      </div>
                      {/* Right Side with Material Details */}
                      <div className="" style={{ width: "50%" }}>
                        {product?.stockIds?.map((material, materialIndex) => (
                          <div className="table_data" key={material?._id} style={{ display: "flex" }}>
                            <div className="col_25p">
                              <h6>{material?.categoryId?.name}</h6>
                            </div>
                            <div className="col_25p">
                              <h6>{material?.brandId?.name}</h6>
                            </div>
                            <div className="col_35p">
                              <h6>{material?.modelId?.name}</h6>
                            </div>
                            <div className="col_50p">
                              <h6>
                                <InputBoxOnChange
                                  className="inputBox"
                                  type="number"
                                  placeholder="Enter Quantity"
                                  value={localQuantities[`${product?._id}-${material?._id}`]?.materialIds[0]?.sellingQuantity || ''}
                                  onChange={(e) => {
                                    handleQuantityChange(material, e.target.value, product);
                                  }}
                                  onBlur={handleInputBlur}
                                />
                              </h6>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>


            {(attachedMaterial?.materialDetails?.length > 0 && attachedMaterial.formStatus == "generate") && (
              attachedMaterial?.materialDetails?.map((product, index) => {
                return <div className="table_data" key={product?._id}>
                  <div className="col_10p">
                    <h6>
                      {index + 1}
                    </h6>
                  </div>
                  <div className="col_35p">
                    <h6>{product?.materialDescription}</h6>
                  </div>
                  <div className="col_25p">
                    <h6>{product?.quantity}</h6>
                  </div>
                  <div className="col_25p">
                    <h6>{product?.warranty ? product?.warranty : "--"}</h6>
                  </div>
                  <div className="col_25p">
                    <h6>{product?.note ? product?.note : "--"}</h6>
                  </div>
                </div>
              }
              ))}
          </div>
        </div>
      </div>
      {attachedMaterial.formStatus == "ready" && (
        <div className="d-flex align-items-center justify-content-center gap-3 my-3">
          <CustomBtn
            name="All Sell"
            onClick={() => {
              setRespondHandlerModalState({ state: true });
            }}
          />
          <CustomBtn
            name="Partial Sell"
            // onClick={salesOrderSell}
            onClick={(e) => showInputDialog()}
          />
          <CustomBtn
            name="Delete"
            onClick={() => {
              setModalStates((prev) => ({ ...prev, deleteOrder: true }));
            }}
            className="btn-danger"
          />
        </div>
      )}
    </div>
  );
};

export default ReadyMaterial;
