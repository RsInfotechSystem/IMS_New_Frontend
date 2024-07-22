"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSubMenuActive } from "@/store/subMenuActiveReducer";
import { salesTabsArray } from "@/utilities/salesTabArray";
import { getCookiesData } from "@/utilities/getCookiesData";

function SalesTabs() {
    const currentUrl = usePathname().split("/");
    const router = useRouter();
    const dispatch = useDispatch();
    const [userDetails, setUserDetails] = useState({})

    //Navigate to the screen by url
    const navigate = (url) => {
        router.push(url);
    };
    const salesAccesableTabs = userDetails?.tabAccess?.find((ele) => ele?.module === "Sales")?.tabAccess
    // Extract the tab names 
    const tabNames = salesAccesableTabs?.map(item => item?.tabName);
    // Filter the salesTabsArray to include only those tabs that match the tab names from tabNames
    const filteredTabs = salesTabsArray?.filter(tab => tabNames?.includes(tab?.tab));

    useEffect(() => {
        setUserDetails(getCookiesData(router));
    }, [])

    return (
        <>
            {filteredTabs?.map((tabDetail, index) => (
                <div
                    className={
                        currentUrl[3] === tabDetail?.activeUrl
                            ? "tab_active"
                            : "tab_inactive"
                    }
                    key={index}
                    onMouseLeave={() => !tabDetail?.isSubMenuExist && dispatch(setSubMenuActive(""))
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

export default SalesTabs;
