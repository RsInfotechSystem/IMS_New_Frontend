"use client";
import React from "react";
import Search from "@/common-components/Search";
import { useState, useEffect } from "react";
import Button from "@/common-components/Button";
// import RecipeListData from "./RecipeListData";
import CustomBtn from "@/common-components/CustomBtn";
// import AddRecipe from "./AddRecipe";
// import Logs from "./Logs";
// import UpLoad from "./UpLoad";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import FileSaver from "file-saver";
import { faFileExcel } from "@fortawesome/free-regular-svg-icons";
import { getCookiesData } from "@/utilities/getCookiesData";
import ReadysalesData from "./ReadysalesData";
import Pagination from "@/common-components/Pagination";

const ReadySalesMaterial = () => {
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [selectAllChecked, setSelectAllChecked] = useState(false);


  const [searchString, setSearchString] = useState("");
  const [loader, setLoader] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("recipe_List");
  const [logsData, setLogsData] = useState([]);
  const [modalStates, setModalStates] = useState({
    modal: false,
    type: "",
    recipeId: "",
  });
  const [recipeUpdateData, setRecipeUpdateData] = useState({
    type: "",
    recipeId: "",
  });
  const [toggle, setToggle] = useState(false);

  //export the excel template that will use for bulk upload
 

  return (
    <div>
      {/* top header  */}
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
      <div className="search_btn_wrapper">
        <Search
        //   value={searchString}
        //   onChange={handleSearch}
        
          placeholder={"Search"}
        />
        {
          // configAccess?.access === "Write" &&
          <div className="buttons_wrapper">
            <CustomBtn
              name={"Return To Inventory"}
            //   onClick={() => {
            //     setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
            //   }}
             
            />
            <CustomBtn
              name={"Sold"}
              // onClick={() => {
              //   setModalStates((prev) => ({ ...prev, modal: true, type: "create" }));
              // }}
            //   svg={<FontAwesomeIcon icon={faTrash} />}
            //   onClick={deleteRole}
            />
           
          </div>
        }
      </div>
  
      <div className="search_btn_wrapper">
        {/* tab wrapper */}
        <div className="my-1 d-flex justify-content-start align-items-start gap-3">
       
              <div className="tab_btn" 
                        style={{
                            backgroundColor:
                                activeTab == "shift" ? "#184965" : "#D0D3D9",
                        }}
                    >
                        Sales Order
                    </div>

                    <div className="tab_btn" 
                        style={{ backgroundColor: activeTab == "attendance" ? "#184965" : "#D0D3D9", }} >
                        Sold
                    </div>
         

        </div>
      
      </div>

      {/* Recipe List table*/}
      <div className="table_wrapper">
        <div className="table_main kitchen_stock_table">
          <div className="table_section">
            <div className="table_header header_kitchen">
              <div className="col_10p">
                <h5>Sr.No.</h5>
              </div>
              <div className="col_20p">
                <h5>Description</h5>
              </div>
              <div className="col_20p">
                <h5>Quantity</h5>
              </div>
              <div className="col_20p">
                <h5>Note</h5>
              </div>
              <div className="col_20p">
                <h5>Warranty</h5>
              </div>
            </div>
            {/* {recipeList && recipeList.length > 0 ? (
              recipeList.map((data, index) => (
                <React.Fragment key={data._id}> */}
                  <div className="table_data mb-0">
                    <div className="col_10p">
                      <h6>
                       1

                      </h6>
                    </div>

                    <div className="col_20p">
                      <h6>description text</h6>
                    </div>

                    <div className="col_20p">
                      <h6 className="text-success fw-semibold">200</h6>
                    </div>

                    <div className="col_20p">
                      <h6 className="">note text</h6>
                    </div>

                    <div className="col_20p position-relative overflow-visible">
                      {/* {data?.ingredients?.length > 0 ? ( */}
                        <h6
                          className="cursor_pointer d-flex align-items-center justify-content-start gap-1"
                          onClick={() => {
                            setChildTable(index === childTable ? null : index);
                          }}
                        >
                          View warranty
                          {/* <FontAwesomeIcon
                            icon={faAngleDown}
                            className={`fontAwesome_icon ${childTable === index ? "rotate-180" : ""}`}
                          /> */}
                        </h6>
                      {/* ) : "--"} */}
                    </div>
                  </div>

                  {/* {childTable === index && ( */}
                    <div className="sub_table_wrapper px-3" id="recipe-table">
                      <div className="sub_header_data p-1">
                      <div className="col_7p">
                <div className="check_box">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllCheckbox"
                    // onChange={(e) => handleSelectAllChange(e)}
                    // checked={selectAllChecked}
                  />
                  {/* <label className="form-check-label"></label> */}
                </div>
              </div>
                        <div className="col_10p">
                          <h5>Sr. No.</h5>
                        </div>

                        <div className="col_30p">
                          <h5>Category</h5>
                        </div>
                        <div className="col_30p">
                          <h5>Brand</h5>
                        </div>

                        <div className="col_30p">
                          <h5>Model</h5>
                        </div>
                        <div className="col_30p">
                          <h5>Parameter</h5>
                        </div>
                      </div>
                      {/* {data?.ingredients?.map((ingredient, subIndex) => ( */}
                        <div
                          className="sub_table_data p-1"
                          style={{
                            background: "#DCF4E6",
                          }}
                        //   key={subIndex}
                        >
                             <div className="col_7p">
                        <div className="check_box">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            // id={roleDetails._id}
                            // onChange={(e) => handleCheckboxChange(e)}
                            // checked={selectedCheckboxes.includes(roleDetails._id)}
                          />
                          {/* <label className="form-check-label"></label> */}
                        </div>
                      </div>
                          <div className="col_10p">
                            <h6>1</h6>
                          </div>
                          <div className="col_30p">
                            <h6>dummy</h6>
                          </div>
                          <div className="col_30p">
                            <h6>dummy</h6>
                          </div>
                          <div className="col_30p">
                            <h6>dummy</h6>
                          </div>
                          <div className="col_30p">
                            <h6> Parameter dummy</h6>
                          </div>
                        </div>
                      {/* ))} */}
                    </div>
                  {/* )} */}
                {/* </React.Fragment>
              ))
            ) : (
              <div className="no_data">
                <h6>No recipes found</h6>
              </div>
            )} */}
          </div>
        </div>
      </div>
      {/* Add recipe table  */}
      {/* {activeTab === "add_recipe" && (
        <>
          <AddRecipe setActiveTab={setActiveTab} recipeId={recipeUpdateData.recipeId} setRecipeUpdateData={setRecipeUpdateData} />
        </>
      )} */}

      {/* Logs */}
      {/* {activeTab === "logs" && (
        <>
          <Logs data={{ setModalStates, logsData }} />
        </>
      )}
      {modalStates?.modal && <UpLoad data={{ modalStates, setModalStates }} />} */}
    </div>
  );
};

export default ReadySalesMaterial;
