"use client"
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import { storeTabsArray } from '@/utilities/storeTabsArray';
import { useDispatch } from 'react-redux';
import { setSubMenuActive } from '@/store/subMenuActiveReducer';
import { getCookiesData } from '@/utilities/getCookiesData';

function StoreTabs() {
    const currentUrl = usePathname().split("/");
    const router = useRouter();
    const dispatch = useDispatch();
    const [userDetails, setUserDetails] = useState({})


    //Navigate to the screen by url
    const navigate = (url) => {
        router.push(url);
    }

    const storeAccesableTabs = userDetails?.tabAccess?.find((ele) => ele?.module === "Store")?.tabAccess
    // Extract the tab names 
    const tabNames = storeAccesableTabs?.map(item => item?.tabName);
    // Filter the storeTabsArray to include only those tabs that match the tab names from tabNames
    const filteredTabs = storeTabsArray?.filter(tab => tabNames?.includes(tab?.tab));

    // Ensure that the Dashboard tab is always included
    const dashboardTab = storeTabsArray.find(tab => tab.tab === "Dashboard");
    if (dashboardTab && !filteredTabs.includes(dashboardTab)) {
        filteredTabs.unshift(dashboardTab);  // Add Dashboard tab at the beginning
    }

    useEffect(() => {
        setUserDetails(getCookiesData(router));
    }, [])

    return (
        <>
            {filteredTabs?.map((tabDetail, index) => (
                <div className={currentUrl[3] === tabDetail?.activeUrl ? "tab_active" : "tab_inactive"} key={index} onMouseLeave={() => !tabDetail?.isSubMenuExist && dispatch(setSubMenuActive(""))} onMouseOver={() => tabDetail?.isSubMenuExist && dispatch(setSubMenuActive("store_submenu"))} onClick={() => { !tabDetail?.isSubMenuExist && navigate(tabDetail?.url) }}>
                    <div className="icon_wrapper">
                        {tabDetail?.icon}
                    </div>
                    <h6>{tabDetail?.tab}</h6>
                </div>
            ))}
        </>
    )
}

export default StoreTabs