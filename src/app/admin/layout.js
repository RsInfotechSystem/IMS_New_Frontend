import React, { Suspense } from "react";
import StoreProvider from "@/common-components/StoreProvider";
import TopHeader from "@/common-components/TopHeader";
import SideNav from "@/common-components/sideNav-components/SideNav";
import SideNavSubTabs from "@/common-components/sideNav-components/SideNavSubTabs";
import SubMenuTabWrapper from "@/common-components/sideNav-components/SubMenuTabWrapper";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function layout({ children }) {
  return (
    <div>{children}</div>
    // <StoreProvider>
    //   <div className="layout_wrapper">
    //     <SideNav />
    //     <SubMenuTabWrapper />
    //     <div className="view_routes_wrapper">
    //       <TopHeader />
    //       <div className="page_wrapper">{children}</div>
    //     </div>
    //   </div>
    //   <ToastContainer />
    // </StoreProvider>
  );
}

export default layout;
