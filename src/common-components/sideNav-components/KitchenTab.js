"use client";
import React, { useEffect, useState } from 'react'
import { kitchenTabsArray } from '@/utilities/kitchenTabsArray'
import { usePathname, useRouter } from "next/navigation";
import { getCookiesData } from '@/utilities/getCookiesData';

const KitchenTab = () => {
    const currentUrl = usePathname().split("/");
    const router = useRouter();
    const [userDetails, setUserDetails] = useState({})

    //Navigate to the screen by url
    const navigate = (url) => {
        router.push(url);
    };

    const kitchenAccesableTabs = userDetails?.tabAccess?.find((ele) => ele?.module === "Kitchen")?.tabAccess
    // Extract the tab names 
    const tabNames = kitchenAccesableTabs?.map(item => item?.tabName);
    // Filter the kitchenTabsArray to include only those tabs that match the tab names from tabNames
    const filteredTabs = kitchenTabsArray?.filter(tab => tabNames?.includes(tab?.tab));

    // Ensure that the Dashboard tab is always included
    const dashboardTab = kitchenTabsArray.find(tab => tab.tab === "Dashboard");
    if (dashboardTab && !filteredTabs.includes(dashboardTab)) {
        filteredTabs.unshift(dashboardTab);  // Add Dashboard tab at the beginning
    }

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
                    onClick={() => navigate(tabDetail?.url)}
                >
                    <div className="icon_wrapper">{tabDetail?.icon}</div>
                    <h6>{tabDetail?.tab}</h6>
                </div>
            ))}
        </>
    )
}

export default KitchenTab