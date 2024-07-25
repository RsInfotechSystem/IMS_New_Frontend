"use client";
import CustomBtn from '@/common-components/CustomBtn';
import Pagination from '@/common-components/Pagination';
import Search from '@/common-components/Search';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ReportDetails = () => {
  const router = useRouter();
  const [label, setLabel] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);




  useEffect(() => {
    if (router.isReady) {
      const { label, dataset } = router.query;
      setLabel(label || 'No label');
      setDataset(dataset || 'No dataset');
    }
  }, [router.isReady, router.query]);

  return (
    <>
      {/* <h1>Details for {label}</h1>
      <p>Dataset: {dataset}</p> */}

      <div className="top_header">
        <div className="tab_title">Category Overview Report</div>
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
                  fill="#79080a"
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
      <div className="search_btn_wrapper">
        <Search  onChange={(e) => handleSearch(e)} placeholder={"Search"} />




      </div>

      {/* table  */}
      <div className="table_wrapper">
        <div className="table_main" >
          <div className="table_section employee_table">
            <div className="table_header" >

              <div className="col_15p">
                <h5>Sr. No.</h5>
              </div>
              <div className="col_20p">
                <h5>Category</h5>
              </div>
              <div className="col_20p">
                <h5>Brand</h5>
              </div>
              <div className="col_20p">
                <h5>Location</h5>
              </div>
              <div className="col_20p">
                <h5>Model Name</h5>
              </div>
              <div className="col_25p">
                <h5>Stock Status</h5>
              </div>
              <div className="col_20p">
                <h5>Block Name</h5>
              </div>
              <div className="col_20p">
                <h5>Serial No.</h5>
              </div>
              <div className="col_25p">
                <h5>Condition Type</h5>
              </div>
              <div className="col_20p">
                <h5>Quantity</h5>
              </div>
              

            </div>
            {/* {
                            location?.map((locationDetails, index) => {
                                return <>
                                    <div className="table_data" >
                                        <div className="col_35p">
                                            <h6>{Number(pageLimit) * (page - 1) + (index + 1)}</h6>
                                        </div>

                                        <div className="col_50p">
                                            <h6>{locationDetails?.name}</h6>
                                        </div>
                                        <div className="col_20p">
                                            <h6 className="action_wrraper">
                                                <div title="edit" >
                                                    <svg
                                                        title={`${locationDetails.isActive ? "Update" : ""}`}
                                                        className={`${locationDetails.isActive ? "cursor-pointer" : "cursor-not-allowed"
                                                            }`}
                                                        onClick={() => { setModalStates((prev) => ({ ...prev, modal: true, type: "update", locationId: locationDetails._id })) }}
                                                        width="27" height="27" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">

                                                        <g clip-path="url(#clip0_279_5204)">
                                                            <path d="M17.5 15V17.5C17.5 17.8315 17.3683 18.1495 17.1339 18.3839C16.8995 18.6183 16.5815 18.75 16.25 18.75H7.5C7.16848 18.75 6.85054 18.6183 6.61612 18.3839C6.3817 18.1495 6.25 17.8315 6.25 17.5V8.75C6.25 8.41848 6.3817 8.10054 6.61612 7.86612C6.85054 7.6317 7.16848 7.5 7.5 7.5H10" stroke="#0D6EFD" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M12.8125 14.875L18.75 8.875L16.125 6.25L10.1875 12.1875L10 15L12.8125 14.875Z" stroke="#0D6EFD" stroke-linecap="round" stroke-linejoin="round" />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_279_5204">
                                                                <rect width="15" height="15" fill="white" transform="translate(5 5)" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </div>
                                                <div className="form-check form-switch ">
                                                    <input
                                                        class="form-check-input cursor-pointer"
                                                        type="checkbox"
                                                        checked={locationDetails.isActive || false}
                                                        id={`toggleSwitch${locationDetails._id}`}
                                                        onChange={(event) =>
                                                            setModalStates(pre => ({ ...pre, action: locationDetails.isActive ? "disable" : "enable", locationId: locationDetails._id, deleteLocation: true }))
                                                        }
                                                        style={{ width: "35px", height: "15px" }}
                                                    />
                                                </div>
                                            </h6>

                                        </div>



                                    </div>
                                </>
                            })
                        } */}

          </div>

        </div>
      </div>
      <div className="pagination_wrapper">
        <Pagination
          isPageUpdated={isPageUpdated}
          setIsPageUpdated={setIsPageUpdated}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageCount={pageCount}
        />
      </div>
    </>
  );
};

export default ReportDetails;
