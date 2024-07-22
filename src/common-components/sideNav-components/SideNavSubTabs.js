import React from 'react'
import { storeSubMenuArray } from '@/utilities/storeSubMenuArray';
const SideNavSubTabs = () => {
   
    return (
        <>
            <div className='side_nav_sub_tab_wrapper'>
                {storeSubMenuArray?.map((tabDetail, index) => (
                    <div className='sub_nav_wrapper' key={index}>
                        <div className='icon_wrapper'>
                            {tabDetail?.icon}
                        </div>
                        <h6>{tabDetail?.tab}</h6>
                    </div>
                ))

                }

                {/* <div className='sub_nav_wrapper'>
                    <div className='icon_wrapper'>
                        <svg viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.5 10.125H12.375C11.3144 10.125 10.784 10.125 10.4545 10.4545C10.125 10.784 10.125 11.3144 10.125 12.375V20.8125C10.125 22.3926 10.125 23.1825 9.74581 23.75C9.58165 23.9957 9.37071 24.2066 9.12503 24.3708C8.55753 24.75 7.76752 24.75 6.1875 24.75C4.60748 24.75 3.81747 24.75 3.24997 24.3708C3.00429 24.2066 2.79335 23.9957 2.62919 23.75C2.25 23.1825 2.25 22.3926 2.25 20.8125V6.75C2.25 4.62868 2.25 3.56802 2.90901 2.90901C3.56802 2.25 4.62868 2.25 6.75 2.25H20.8125C22.3926 2.25 23.1825 2.25 23.75 2.62919C23.9957 2.79335 24.2066 3.00429 24.3708 3.24997C24.75 3.81747 24.75 4.60748 24.75 6.1875C24.75 7.76752 24.75 8.55753 24.3708 9.12503C24.2066 9.37071 23.9957 9.58165 23.75 9.74581C23.1825 10.125 22.3926 10.125 20.8125 10.125H18" stroke="#48505E" stroke-width="1.7" stroke-linecap="round" />
                            <path d="M13.5 2.25V4.5M20.25 2.25V4.5M10.125 2.25V5.625M16.875 2.25V5.625" stroke="#48505E" stroke-width="1.7" stroke-linecap="round" />
                            <path d="M2.25 13.5H4.5M2.25 20.25H4.5M2.25 16.875H5.625M2.25 10.125H5.625" stroke="#48505E" stroke-width="1.7" stroke-linecap="round" />
                        </svg>
                    </div>
                    <h6>Unit</h6>
                </div> */}


            </div>

        </>
    )
}

export default SideNavSubTabs