"use client";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { communication } from "@/services/communication";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ReadyMaterial = () => {
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

  const getMaterialById = async () => {
    try {
      setLoader(true);
      let response = await communication.getAttachedMaterialById({
        orderId: searchParams.get("orderId"),
      });
      if (response?.data?.status === "SUCCESS") {
        setAttachedMaterial(response.data?.salesorder);
        console.log("wdef", response.data?.salesorder);
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

  const handleQuantityChange = (materialData, value) => {
    setQuantities([
      {
        materialIds: materialData?.materialIds?.map((e) => e._id),
        sellingQuantity: value,
        detailId: materialData?._id,
      },
    ]);
  };

  async function salesOrderSell() {
    try {
      if (quantities.length < 1) {
        toast.info("Add quantity for sell");
        return;
      }
      setLoader(true);
      const serverResponse = await communication.SalesOrderSells({
        orderId: searchParams.get("orderId"),
        materialDetails: quantities,
      });
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

  const deleteSaleOrder = async () => {
    Swal.fire({
      text: "Are you sure you want to delete this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#5149E4",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then(async function (result) {
      if (result.isConfirmed) {
        try {
          setLoader(true);
          let payload = {
            orderId: searchParams.get("orderId"),
          };
          let response = await communication.deleteSaleOrder(payload);
          if (response?.data?.status === "SUCCESS") {
            toast.success(response.data.message);
            router.back();
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
      } else {
      }
    });
  };

  return (
    <div>
      <div className="top_header">
        <div className="tab_title">Ready Sales Material</div>
        {pageCount > 1 && (
          <Pagination
            isPageUpdated={isPageUpdated}
            setIsPageUpdated={setIsPageUpdated}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageCount={pageCount}
          />
        )}
      </div>
      <CustomBtn
        name="Back"
        onClick={() => {
          router.back();
        }}
      />

      <div className="table_wrapper my-3">
        <div className="table_main">
          <div className="table_section pi_product_table">
            <div className="table_header">
              <div className="col_20p">
                <div className="check_box">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={(e) => handleSelectAllChange(e)}
                    checked={selectAllChecked}
                  />
                </div>
              </div>
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
                <h5>Attached Material</h5>
              </div>
              {attachedMaterial.formStatus == "ready" && (
                <div className="col_25p">
                  <h5>Selling Quantity</h5>
                </div>
              )}
              <div className="col_25p">
                <h5 className="action_wrraper">Note</h5>
              </div>
            </div>
            {attachedMaterial?.materialDetails?.length > 0 ? (
              attachedMaterial?.materialDetails?.map((product, index) => {
                return product?.materialIds?.map((material, materialIndex) => (
                  <div className="table_data" key={material._id}>
                    <div className="col_20p">
                      <div className="check_box">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={material._id}
                          onChange={(e) => handleCheckboxChange(e)}
                          checked={selectedCheckboxes.includes(material._id)}
                        />
                      </div>
                    </div>
                    <div className="col_25p">
                      <h6>
                        {index + 1}.{materialIndex + 1}
                      </h6>
                    </div>
                    <div className="col_25p">
                      <h6>{product?.materialDescription}</h6>
                    </div>
                    <div className="col_25p">
                      <h6>{product?.quantity}</h6>
                    </div>
                    <div className="col_25p">
                      <h6>{product?.warranty ? product?.warranty : "--"}</h6>
                    </div>
                    <div className="col_25p">
                      <div className="description_modal">
                        <h6>{material?.categoryId?.name}, </h6>
                      </div>
                      <div className="modal_name">
                        <h6>{material?.brandId?.name}, </h6>
                      </div>
                      <div className="modal_name">
                        <h6>{material?.parameterId?.name}, </h6>
                      </div>
                      <div className="modal_name">
                        <h6>{material?.modelId?.name}</h6>
                      </div>
                    </div>
                    {attachedMaterial.formStatus == "ready" && (
                      <div className="col_25p">
                        <h6>
                          <InputBox
                            className="inputBox"
                            type="number"
                            placeholder="Enter Quantity"
                            onChange={(e) => {
                              handleQuantityChange(product, e.target.value);
                            }}
                          />
                        </h6>
                      </div>
                    )}
                    <div className="col_25p">
                      <h6 className="action_wrraper">{product?.note ? product?.note : "--"}</h6>
                    </div>
                  </div>
                ));
              })
            ) : (
              <small className="text-center text-secondary py-2">No Records Found</small>
            )}
          </div>
        </div>
      </div>
      {attachedMaterial.formStatus == "ready" && (
        <div className="d-flex align-items-center justify-content-center gap-3 my-3">
          <CustomBtn name="Sell" onClick={salesOrderSell} />
          <CustomBtn name="Delete" onClick={deleteSaleOrder} className="btn-danger" />
        </div>
      )}
    </div>
  );
};

export default ReadyMaterial;
