"use client";
import React from "react";
import HrmConfigTabs from "./HrmConfigTabs";
import { useSelector } from "react-redux";
import AdminConfigTabs from "./AdminConfigTabs";
import StoreConfigTabs from "./StoreConfigTabs";
function SubMenuTabWrapper() {
  const store = useSelector((state) => state.subMenuActiveReducer);

  return (
    <>
      {store?.subMenuActive === "admin_submenu" &&<AdminConfigTabs />}
      {store?.subMenuActive === "hrm_submenu" && <HrmConfigTabs />}
      {store?.subMenuActive === "store_submenu" && <StoreConfigTabs />}
    </>
  );
}

export default SubMenuTabWrapper;
