"use client"
import Image from 'next/image'
import React from 'react'
import AdminTabs from './AdminTabs'
import logo from "../../../public/images/logo.png";
import StoreTabs from './StoreTabs';
import { usePathname } from 'next/navigation';
import HrmTabs from './HrmTabs';
import VendorTabs from './VendorTabs';
import KitchenTab from './KitchenTab';
import AccountTabs from './AccountTabs';
import SalesTabs from './SalesTab';


function SideNav() {
    const currentUrl = usePathname().split("/");
    return (
        <div className="side_nav_wrapper">
            <div className="logo">
                <Image src={logo} width={80} height={60} alt='ohno logo' />
            </div>
            <div className="tab_wrapper">
                {currentUrl[2] === "admin" && <AdminTabs />}
                {currentUrl[2] === "hrm" && <HrmTabs />}
                {currentUrl[2] === "store" && <StoreTabs />}
                {currentUrl[2] === "vendor" && <VendorTabs />}
                {currentUrl[2] === "kitchen" && <KitchenTab />}
                {currentUrl[2] === "account" && <AccountTabs />}
                {currentUrl[2] === "sale" && <SalesTabs />}
            </div>
            <div className="footer">
                <h6>Powered By AIITS</h6>
            </div>
        </div>
    )
}

export default SideNav