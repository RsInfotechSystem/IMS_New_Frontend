"use client";

import { formatDate } from "@/helper/formatDate";

const ViewSalesOrderDetails = ({ data, setModalStates }) => {
  return (
    <>
      <div className="main_detail_wrapper">
        {/* {console.log(data, "data")} */}
        <div className="purchase_indent_view_wrapper">
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
              <strong>Sales Order Details</strong>
              <span className="text-secondary fw-medium">#{data?.salesOrderNo}</span>
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2">
              {/* <span
                className="cursor_pointer"
                title="pdf"
                onClick={() => {
                  setModalStates((prev) => ({
                    ...prev,
                    viewIndent: false,
                    viewPdf: true,
                  }));
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" rx="4" fill="#DC3545" />
                  <g clip-path="url(#clip0_392_3120)">
                    <path
                      d="M15.8258 4H10.5097H10.0977L9.80665 4.29106L5.78227 8.31569L5.49121 8.60675V9.0185V17.3158C5.49121 18.7958 6.69521 20 8.17546 20H15.8258C17.3056 20 18.5096 18.7958 18.5096 17.3158V6.68425C18.5096 5.204 17.3056 4 15.8258 4ZM17.5159 17.3158C17.5159 18.2494 16.7592 19.0061 15.8258 19.0061H8.17546C7.24159 19.0061 6.4849 18.2494 6.4849 17.3158V9.01847H9.10102C9.87868 9.01847 10.5097 8.38791 10.5097 7.61003V4.99388H15.8258C16.7592 4.99388 17.5159 5.75056 17.5159 6.68425V17.3158Z"
                      fill="#F3F8FF"
                    />
                    <path
                      d="M9.37391 11.9004H8.48238C8.31263 11.9004 8.21094 12.0108 8.21094 12.1762V14.481C8.21094 14.6806 8.34231 14.8122 8.52472 14.8122C8.70319 14.8122 8.83453 14.6806 8.83453 14.481V13.7808C8.83453 13.7638 8.84325 13.7553 8.86028 13.7553H9.37391C10.0019 13.7553 10.3798 13.3732 10.3798 12.8299C10.3798 12.2781 10.0063 11.9004 9.37391 11.9004ZM9.33553 13.2161H8.86028C8.84325 13.2161 8.83453 13.2076 8.83453 13.1908V12.4649C8.83453 12.4478 8.84325 12.4394 8.86028 12.4394H9.33553C9.59866 12.4394 9.75575 12.5965 9.75575 12.8299C9.75578 13.0634 9.59866 13.2161 9.33553 13.2161Z"
                      fill="#F3F8FF"
                    />
                    <path
                      d="M11.8191 11.9004H11.1357C10.9659 11.9004 10.8643 12.0108 10.8643 12.1762V14.515C10.8643 14.6806 10.9659 14.7867 11.1357 14.7867H11.8191C12.4344 14.7867 12.8167 14.5914 12.9694 14.1203C13.0244 13.9547 13.0545 13.7553 13.0545 13.3435C13.0545 12.9318 13.0244 12.7324 12.9694 12.5668C12.8166 12.0957 12.4344 11.9004 11.8191 11.9004ZM12.3711 13.9039C12.2987 14.133 12.0909 14.2307 11.802 14.2307H11.5136C11.4966 14.2307 11.4879 14.2222 11.4879 14.2052V12.4819C11.4879 12.4649 11.4966 12.4564 11.5136 12.4564H11.802C12.0909 12.4564 12.2987 12.5541 12.3711 12.7832C12.4008 12.881 12.4217 13.0507 12.4217 13.3435C12.4217 13.6364 12.4008 13.8061 12.3711 13.9039Z"
                      fill="#F3F8FF"
                    />
                    <path
                      d="M15.2875 11.9004H13.8871C13.7174 11.9004 13.6152 12.0108 13.6152 12.1762V14.481C13.6152 14.6806 13.747 14.8122 13.9295 14.8122C14.1075 14.8122 14.2393 14.6806 14.2393 14.481V13.6575C14.2393 13.6407 14.2475 13.6322 14.2646 13.6322H15.0798C15.2622 13.6322 15.3682 13.5218 15.3682 13.3647C15.3682 13.2076 15.2622 13.0974 15.0798 13.0974H14.2646C14.2475 13.0974 14.2393 13.0889 14.2393 13.0719V12.4649C14.2393 12.4478 14.2475 12.4394 14.2646 12.4394H15.2875C15.4616 12.4394 15.5764 12.3248 15.5764 12.1721C15.5764 12.0149 15.4616 11.9004 15.2875 11.9004Z"
                      fill="#F3F8FF"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_392_3120">
                      <rect
                        width="16"
                        height="16"
                        fill="white"
                        transform="translate(4 4)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </span>
              <span
                className="cursor_pointer"
                title="print"
                onClick={() => {
                  setModalStates((prev) => ({
                    ...prev,
                    viewIndent: false,
                    viewPdf: true,
                  }));
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" rx="4" fill="#198754" />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M19 15.5C19 16.052 18.552 16.5 18 16.5H16.929C16.7065 15.639 15.931 15 15 15H9C8.069 15 7.2935 15.639 7.071 16.5H6C5.448 16.5 5 16.052 5 15.5V14.5C5 13.948 5.448 13.5 6 13.5H18C18.552 13.5 19 13.948 19 14.5V15.5ZM15 18H9C8.448 18 8 17.552 8 17C8 16.448 8.448 16 9 16H15C15.552 16 16 16.448 16 17C16 17.552 15.552 18 15 18ZM8 7C8 6.448 8.448 6 9 6H15C15.552 6 16 6.448 16 7V12.5H8V7ZM18 12.5H17V7C17 5.8955 16.1045 5 15 5H9C7.8955 5 7 5.8955 7 7V12.5H6C4.8955 12.5 4 13.3955 4 14.5V15.5C4 16.6045 4.8955 17.5 6 17.5H7.071C7.2935 18.3615 8.069 19 9 19H15C15.931 19 16.7065 18.3615 16.929 17.5H18C19.1045 17.5 20 16.6045 20 15.5V14.5C20 13.3955 19.1045 12.5 18 12.5Z"
                    fill="#F3F8FF"
                  />
                </svg>
              </span> */}

              <span
                className="px-2 cursor_pointer"
                title="close"
                onClick={() => {
                  setModalStates((prev) => ({ ...prev, viewPO: false }));
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
                    stroke="#184965"
                    stroke-width="2.5"
                  />
                  <path
                    d="M21.75 14.25L14.25 21.75M14.25 14.25L21.75 21.75"
                    stroke="#184965"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div className="view_wrapper_body">
            <div className="d-flex align-items-start justify-content-start gap-5 all_category_vendors_wrapper">
              <div className="fw-medium">
                Location
                <ol className="list-group" type="1">
                  <li className=" small text-secondary fw-light text-capitalize">
                    {data?.orderLocation?.name}
                  </li>
                </ol>
              </div>
              {/* <div className="fw-medium">
                Type
                <ol className="list-group" type="1">
                  <li className=" small text-secondary fw-light text-capitalize">{data?.type}</li>
                </ol>
              </div> */}

              <div className="fw-medium">
                Date
                <ol className="list-group" type="1">
                  <li className=" small text-secondary fw-light text-capitalize">
                    {formatDate(data?.createdAt)}
                  </li>
                </ol>
              </div>
            </div>
            {/* product data table  */}
            <div className="form_list_layout_wrapper my-3">
              {/* table  */}
              <div className="table_wrapper my-3">
                <div className="table_main">
                  {/* Rename the class name "pi_view_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                  <div className="table_section pi_view_product_table">
                    <div className="table_header">
                      <div className="col_15p">
                        <h5>Sr. No.</h5>
                      </div>
                      <div className="col_40p">
                        <h5>Description</h5>
                      </div>
                      <div className="col_25p">
                        <h5>Note</h5>
                      </div>
                      <div className="col_20p">
                        <h5>QTY</h5>
                      </div>
                      <div className="col_20p">
                        <h5>Warrenty</h5>
                      </div>
                    </div>
                    {data?.materialDetails?.map((product, index) => {
                      return (
                        <div className="table_data" key={index}>
                          <div className="col_15p">
                            <h6>{index + 1}</h6>
                          </div>
                          <div className="col_40p">
                            <h6>{product?.materialDescription}</h6>
                          </div>
                          <div className="col_25p">
                            <h6>{product?.note}</h6>
                          </div>
                          <div className="col_20p">
                            <h6>{product?.quantity}</h6>
                          </div>
                          <div className="col_20p">
                            <h6>{product?.warranty}</h6>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* <div className="">
                <small className="fw-medium text-secondary">
                  Total Amount: &nbsp;
                  <span className="fw-light">{data?.totalAmount}</span>
                </small>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewSalesOrderDetails;
