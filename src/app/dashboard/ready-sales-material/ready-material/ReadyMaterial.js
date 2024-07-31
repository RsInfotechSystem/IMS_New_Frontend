"use client";
import CustomBtn from "@/common-components/CustomBtn";
import Pagination from "@/common-components/Pagination";
import Search from "@/common-components/Search";
import { communication } from "@/services/communication";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ReadyMaterial = () => {
  const searchParams = useSearchParams();
  const [attachedMaterial, setAttachedMaterial] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const getMaterialById = async () => {
    try {
      setLoader(true);
      let response = await communication.getAttachedMaterialById({
        orderId: searchParams.get("orderId"),
      });
      if (response?.data?.status === "SUCCESS") {
        setAttachedMaterial(response.data?.salesorder);
      } else if (response?.data?.status === "JWT_INVALID") {
        toast.warn(response.data.message);
        // Swal.fire({ text: response.data.message, icon: "warning" });
        router.push("/");
      } else {
        toast.warn(response.data.message);
        // Swal.fire({ text: response.data.message, icon: "warning" });
      }
      setLoader(false);
    } catch (error) {
      toast.warn(error.message);
      // Swal.fire({ text: error.message, icon: "warning" });
      setLoader(false);
    }
  };
  useEffect(() => {
    getMaterialById();
  }, []);
  return (
    <div>
      <div className="top_header">
        <div className="tab_title">Ready Sales Material</div>
        <Pagination
          isPageUpdated={isPageUpdated}
          setIsPageUpdated={setIsPageUpdated}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
        />
      </div>
      <div
        className="back_btn"
        onClick={() => {
          Router.back();
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
      <div className="table_wrapper my-3">
        <div className="table_main">
          <div className="table_section pi_product_table">
            <div className="table_header">
              <div className="col_20p">
                <div className="check_box">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllCheckbox"
                    // onChange={(e) => handleSelectAllChange(e)}
                    // checked={selectAllChecked}
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
                <h5 className="action_wrraper">Note</h5>
              </div>
            </div>
            {/* {modelList?.materialDetails?.length > 0 ? (
        modelList?.materialDetails?.map((product, index) => {
          return (
            <div className="table_data" key={index}>
              <div className="col_20p">
                {" "}
                <div className="check_box">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={product._id}
                    onChange={(e) => handleCheckboxChange(e)}
                    checked={selectedCheckboxes.includes(product._id)}
                    // checked={selectedList.some((item) => item._id === product._id)}
                  />
                </div>
              </div>
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
  );
};

export default ReadyMaterial;
