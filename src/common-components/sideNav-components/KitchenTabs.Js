"use client";
import React from "react";
import { adminTabsArray } from "@/utilities/adminTabsArray";
import { usePathname, useRouter } from "next/navigation";
import { kitchenTabsArray } from "@/utilities/kitchenTabsArray";

function KitchenTabs() {
  const currentUrl = usePathname().split("/");
  const router = useRouter();

  //Navigate to the screen by url
  const navigate = (url) => {
    router.push(url);
  };

  return (
    <>
      {kitchenTabsArray?.map((tabDetail, index) => (
        <div
          className={
            currentUrl[3] === tabDetail?.activeUrl
              ? "tab_active"
              : "tab_inactive"
          }
          key={index}
          onClick={() => navigate(tabDetail?.url)}
        >
          <div className="icon_wrapper">{tabDetail?.icon}</div>
          <h6>{tabDetail?.tab}</h6>
        </div>
      ))}
    </>
  );
}

export default KitchenTabs;
