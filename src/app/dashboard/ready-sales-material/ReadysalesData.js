"use client";
// import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/common-components/Loader";
import { toast } from "react-toastify";
import {
  faPenToSquare,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import { communication } from "@/services/communication";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);

const ReadysalesData = ({ data }) => {
  // const pageLimit = process.env.NEXT_PUBLIC_LIMIT;
  const { setRecipeUpdateData, searchString, setActiveTab, recipeAccess } = data;
  const [recipeList, setRecipeList] = useState([{}]);
  const [loader, setLoader] = useState(false);
  const router = useRouter();
  const [childTable, setChildTable] = useState("");
 
  return (
    <>
      {
        loader && <Loader text={"Fetching Data..."} />
      }
      {/* table */}
      <div className="table_wrapper">
        <div className="table_main kitchen_stock_table">
          <div className="table_section">
            <div className="table_header header_kitchen">
              <div className="col_10p">
                <h5>Action</h5>
              </div>
              <div className="col_20p">
                <h5>Item ID</h5>
              </div>
              <div className="col_20p">
                <h5>Item Name</h5>
              </div>
              <div className="col_20p">
                <h5>Item Type</h5>
              </div>
              <div className="col_20p">
                <h5>Ingredients</h5>
              </div>
            </div>
            {recipeList && recipeList.length > 0 ? (
              recipeList.map((data, index) => (
                <React.Fragment key={data._id}>
                  <div className="table_data mb-0">
                    <div className="col_10p">
                      <h6>
                        {
                          recipeAccess?.access === "Write" ?
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className="cursor-pointer fontAwesome_icon cursor_pointer text-primary"
                              onClick={() => {
                                setRecipeUpdateData({
                                  recipeId: data?._id,
                                  type: "update",
                                });
                                setActiveTab("add_recipe");
                              }}
                              style={{ color: "#4B5563" }}
                            />
                            :
                            "--"
                        }

                      </h6>
                    </div>

                    <div className="col_20p">
                      <h6>{data?.recipeId ?? "--"}</h6>
                    </div>

                    <div className="col_20p">
                      <h6 className="text-success fw-semibold">{data?.recipeName ?? "--"}</h6>
                    </div>

                    <div className="col_20p">
                      <h6 className="">{data?.recipeType ?? "--"}</h6>
                    </div>

                    <div className="col_20p position-relative overflow-visible">
                      {data?.ingredients?.length > 0 ? (
                        <h6
                          className="cursor_pointer d-flex align-items-center justify-content-start gap-1"
                          onClick={() => {
                            setChildTable(index === childTable ? null : index);
                          }}
                        >
                          View Ingredients
                          <FontAwesomeIcon
                            icon={faAngleDown}
                            className={`fontAwesome_icon ${childTable === index ? "rotate-180" : ""}`}
                          />
                        </h6>
                      ) : "--"}
                    </div>
                  </div>

                  {childTable === index && (
                    <div className="sub_table_wrapper px-3" id="recipe-table">
                      <div className="sub_header_data p-3">
                        <div className="col_20p">
                          <h5>Sr. No.</h5>
                        </div>

                        <div className="col_30p">
                          <h5>Raw Material</h5>
                        </div>
                        <div className="col_30p">
                          <h5>Quantity</h5>
                        </div>

                        <div className="col_30p">
                          <h5>Unit</h5>
                        </div>
                      </div>
                      {/*======child data map=====*/}
                      {data?.ingredients?.map((ingredient, subIndex) => (
                        <div
                          className="sub_table_data p-0"
                          style={{
                            background: "#DCF4E6",
                          }}
                          key={subIndex}
                        >
                          <div
                            className={`col_20p p-3 `}
                          >
                            <h6>{subIndex + 1}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{ingredient?.rawMaterial}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{ingredient?.quantity}</h6>
                          </div>
                          <div className="col_30p">
                            <h6>{ingredient?.unitName}</h6>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ))
            ) : (
              <div className="no_data">
                <h6>No recipes found</h6>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReadysalesData;
