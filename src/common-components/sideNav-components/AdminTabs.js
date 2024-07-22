"use client";
import React from "react";
import { adminTabsArray } from "@/utilities/adminTabsArray";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {setSubMenuActive} from "@/store/subMenuActiveReducer";
function AdminTabs() {
  const currentUrl = usePathname().split("/");
  const router = useRouter();
  const dispatch = useDispatch();

  //Navigate to the screen by url
  const navigate = (url) => {
    router.push(url);
  };

  return (
    <>
    
      {adminTabsArray?.map((tabDetail, index) => (
        <div
          className={
            currentUrl[3] === tabDetail?.activeUrl
              ? "tab_active"
              : "tab_inactive"
          }
          key={index}
          onMouseLeave={() =>!tabDetail?.isSubMenuExist && dispatch(setSubMenuActive(""))
          }
          onMouseOver={() =>
            tabDetail?.isSubMenuExist &&
            dispatch(setSubMenuActive("admin_submenu"))
          }
          onClick={() => {
            !tabDetail?.isSubMenuExist && navigate(tabDetail?.url);
          }}
        >
          <div className="icon_wrapper">{tabDetail?.icon}</div>
          <h6>{tabDetail?.tab}</h6>
        </div>
      ))} 
    </>
  );
}

export default AdminTabs;
