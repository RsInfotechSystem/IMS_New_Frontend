import React, { Suspense } from "react";
import TopHeader from "@/common-components/TopHeader";
import SideNav from "@/common-components/sideNav-components/SideNav";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function layout({ children }) {
  return (
    <>
      <div className="layout_wrapper">
        <SideNav />
        <div className="view_routes_wrapper">
          <TopHeader />
          <div className="page_wrapper">{children}</div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default layout;
