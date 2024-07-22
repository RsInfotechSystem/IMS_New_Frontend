
import { setSubMenuActive } from '@/store/subMenuActiveReducer';
import { storeSubMenuArray } from '@/utilities/storeSubMenuArray';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'
import { useDispatch } from 'react-redux';

const StoreConfigTabs = () => {
    const currentUrl = usePathname().split("/");
    const router = useRouter();
    const dispatch = useDispatch();
    
    return (
        <>
            <div className='side_nav_sub_tab_wrapper' onMouseLeave={() => dispatch(setSubMenuActive(""))}>
                {storeSubMenuArray?.map((tabDetail, index) => (
                    <div className={`sub_nav_wrapper ${currentUrl[4] === tabDetail?.activeUrl ? "sub_nav_active" : ""}`} onClick={() => { router.push(tabDetail?.url); dispatch(setSubMenuActive("")) }} key={index}>
                        <div className='icon_wrapper'>
                            {tabDetail?.icon}
                        </div>
                        <h6>{tabDetail?.tab}</h6>
                    </div>
                ))

                }
            </div>

        </>
    )
}

export default StoreConfigTabs