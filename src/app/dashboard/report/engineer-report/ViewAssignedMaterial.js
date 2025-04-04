"use client";

import { formatDate } from "@/helper/formatDate";

const ViewAssignedMaterial = ({ data, setModalStates }) => {
    console.log("data", data);

    return (
        <>
            <div className="main_detail_wrapper">
                <div className="engineer_mateial_table_view_wrapper">
                    <div className="view_wrapper_header">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g clip-path="url(#clip0_341_3735)">
                                    <path
                                        d="M17 4H7C5.89543 4 5 4.89543 5 6V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V6C19 4.89543 18.1046 4 17 4Z"
                                        stroke="#272727"
                                        stroke-width="2"
                                    />
                                    <path d="M9 9H15" stroke="#272727" stroke-width="2" stroke-linecap="round" />
                                    <path d="M9 13H15" stroke="#272727" stroke-width="2" stroke-linecap="round" />
                                    <path d="M9 17H13" stroke="#272727" stroke-width="2" stroke-linecap="round" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_341_3735">
                                        <rect width="24" height="24" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <strong>View Assigned Material</strong>
                            <span className="text-secondary fw-medium"></span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center gap-2">


                            <span
                                className="px-2 cursor_pointer"
                                title="close"
                                onClick={() => {
                                    setModalStates((prev) => ({ data: [], isOpen: false }));
                                }}
                            >
                                <svg
                                    width="30"
                                    height="30"
                                    viewBox="0 0 36 36"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z"
                                        stroke="#198754"
                                        stroke-width="2.5"
                                    />
                                    <path
                                        d="M21.75 14.25L14.25 21.75M14.25 14.25L21.75 21.75"
                                        stroke="#198754"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>

                    {/* table  */}
                    <div className="table_wrapper my-3">
                        <div className="table_main">
                            {/* Rename the class name "pi_view_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                            <div className="table_section engineer_mateial_table">
                                <div className="table_header">
                                    <div className="col_15p">
                                        <h5>Sr. No.</h5>
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
                                        <h5>Condition Type</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Job No</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Quantity</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Assigned By</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Assigned Date</h5>
                                    </div>

                                </div>
                                {data?.map((material, index) => {
                                    return (
                                        <div className="table_data" key={index}>
                                            <div className="col_15p">
                                                <h6>{index + 1}</h6>
                                            </div>
                                            <div className="col_25p">
                                                <h6>{material?.categoryId?.name}</h6>
                                            </div>
                                            <div className="col_25p">
                                                <h6>{material?.brandId?.name}</h6>
                                            </div>
                                            <div className="col_25p">
                                                <h6>{material?.modelId?.name}</h6>
                                            </div>
                                            <div className="col_25p">
                                                <h6>{material?.conditionType}</h6>
                                            </div>
                                            <div className="col_20p">
                                                <h6>{material?.jobNo ?? "--"}</h6>
                                            </div>

                                            <div className="col_20p">
                                                <h6>{material?.assignQuantity}</h6>
                                            </div>

                                            <div className="col_20p">
                                                <h6>{material?.assignedBy?.name}</h6>
                                            </div>

                                            <div className="col_20p">
                                                <h6>{formatDate(material.assignedDate)}</h6>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ViewAssignedMaterial;