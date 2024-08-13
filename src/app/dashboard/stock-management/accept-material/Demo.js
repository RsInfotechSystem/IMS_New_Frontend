import React from "react";

const Demo = () => {
  return (
    <div className="payroll_table_data_wrapper">
      <div className="payroll_table_non_scroll_section">
        <div className="payroll_table_non_scroll_row non_scroll_table_header">
          <div className="col_20p">
            <h5>SR.NO.</h5>
          </div>
          <div className="col_60p">
            <h5>EMPLOYEE NAME</h5>
          </div>
        </div>
        <div className="payroll_table_non_scroll_row">
          <div className="col_20p">
            <h6></h6>
          </div>
          <div className="col_60p">
            <h6></h6>
          </div>
        </div>
      </div>
      <div className="payroll_table_scroll_section">
        <div
        // className={
        //   activeTab === "all"
        //     ? "payroll_table_all"
        //     : activeTab === "employee contribution"
        //     ? "payroll_table_employer"
        //     : "payroll_table_other"
        // }
        >
          <div className="payroll_scroll_row">
            <>
              <div className="col_20p">
                <h6>DESIGNATION</h6>
              </div>
              <div className="col_30p">
                <h6>JOINING DATE</h6>
              </div>
              <div className="col_30p">
                <h6>BANK ACCOUNT</h6>
              </div>
              <div className="col_30p">
                <h6>PF UAN NUMBER</h6>
              </div>
              <div className="col_30p">
                <h6>GROSS SALARY</h6>
              </div>
              <div className="col_30p">
                <h6>PER DAY SALARY</h6>
              </div>
              <div className="col_30p">
                <h6>NO. OF DAYS</h6>
              </div>
              <div className="col_30p">
                <h6>ACTUAL GROSS MONTHLY SALARY</h6>
              </div>
              <div className="col_30p">
                <h6>BANK COMPONENT</h6>
              </div>
              <div className="col_30p">
                <h6>CASH COMPONENT</h6>
              </div>
              <div className="col_30p">
                <h6>ADVANCE</h6>
              </div>
              <div className="col_30p">
                <h6>NET CASH PAYABLE</h6>
              </div>
            </>
            <>
              <div className="col_30p">
                <h6>TOTAL GROSS</h6>
              </div>
              <div className="col_30p">
                <h6>BASIC SALARY 40% OF GROSS</h6>
              </div>
              <div className="col_30p">
                <h6>DA 20% OF GROSS</h6>
              </div>
              <div className="col_30p">
                <h6>HRA 20% OF GROSS</h6>
              </div>
              <div className="col_30p">
                <h6>CA 15% OF GROSS</h6>
              </div>
            </>

            <>
              <div className="col_30p">
                <h6>EMPLOYEE CONTRIBUTION 12% OF BASIC</h6>
              </div>
              <div className="col_30p">
                <h6>PT</h6>
              </div>
              <div className="col_30p">
                <h6>EMPLOYEE CONTRIBUTION 0.75% OF GROSS</h6>
              </div>
              <div className="col_30p">
                <h6>TDS</h6>
              </div>
              <div className="col_30p">
                <h6>TOTAL DEDUCTION</h6>
              </div>
              <div className="col_30p">
                <h6>NET PAYABLE IN BANK</h6>
              </div>
            </>

            <>
              <div className="col_30p">
                <h6>EMPLOYEE CONTRIBUTION 13% OF BASIC</h6>
              </div>
              <div className="col_30p">
                <h6>EMPLOYEE CONTRIBUTION 3.25% OF GROSS</h6>
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
