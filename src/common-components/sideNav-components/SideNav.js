"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import logo from "../../../public/images/AANAD COMPUTER LOGO.png";
import { hasCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { getUserAccessTabs } from "@/services/commonApis";
import { sideNavTabArray } from "@/utilities/tabArray";


function SideNav() {
  const currentUrl = usePathname().split("/");
  const router = useRouter();
  const [tab, setTab] = useState([]);
  async function APICall() {
    if (hasCookie("inventryToken")) {
      setTab(await getUserAccessTabs())
    } else {
      router.push("/");
    }
  }
  useEffect(() => {
    APICall()
  }, [])
  return (
    <div className="side_nav_wrapper">
      <div className="logo">
        <Image src={logo} width={500} height={500} className="img" alt="ohno logo" />
      </div>
      <div className="tab_wrapper">
        {sideNavTabArray.filter(tabAccess => tab.includes(tabAccess?.tabName?.toLowerCase()))?.map((ele, index) => {
          return (<div
            className={currentUrl.includes(ele?.activeUrl) ? "tab_active" : "tab_inactive"}
            onClick={() => router.push(ele?.url)}
            key={index + 1}
          >
            <div className="icon_wrapper">
              <h6>
                {ele.icon}
              </h6>
            </div>
            <h6>{ele.tab}</h6>
          </div>)
        }
        )}
      </div>
      <div className="footer ms-2">
        <h6 className="text-secondary">Powered By <br></br> <a style={{ color: "#184965" }} target="_blank" href="https://www.rsinfotechsys.com/">R S Infotech System P.L.</a></h6>
      </div>
    </div>
  );
}

export default SideNav;
