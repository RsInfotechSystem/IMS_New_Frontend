"use client";
import React, { useEffect, useState } from "react";
import { topHeaderNavArray } from "@/utilities/topHeaderNavArray";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { deleteCookie } from "cookies-next";
import { communication } from "@/apis/communication";
import { getCookiesData } from "@/utilities/getCookiesData";

function TopHeader() {
  const currentUrl = usePathname().split("/");
  const router = useRouter();
  const [isSubmenuVisible, setIsSubmenuVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userDetails, setUserDetails] = useState({});
  const adminNav = [
    {
      tab: "Admin",
      url: "/panel/admin/hrm",
      activeUrl: "admin",
    },
    {
      tab: "HRM",
      url: "/panel/hrm/dashboard",
      activeUrl: "hrm",
    },
  ];

  //Navigate to the screen by url
  const navigate = (url) => {
    router.push(url);
  };

  const handleLogout = () => {
    navigate("/");
    deleteCookie("userDetails");
  };

  // get notification count on initial load
  const getNotificationCount = async (controller) => {
    try {
      const serverResponse = await communication.fetchNotificationCount(controller);
      if (serverResponse?.data?.status === "SUCCESS") {
        setNotificationCount(serverResponse?.data?.notification);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        router.push("/");
      } else {
        setNotificationCount([]);
      }
    } catch (error) {
      if (error.name === "CanceledError") {
        // Api cancelled
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    getNotificationCount(controller);
    setUserDetails(getCookiesData(router));
    // cleanup
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="top_header_wrapper">
      <div className="top_header_nav_wrapper">
        {userDetails?.designationName === "admin"
          ? adminNav.map((tabDetail, index) => (
              <h6
                onClick={() => navigate(tabDetail?.url)}
                key={index}
                style={{ color: currentUrl[2] === tabDetail?.activeUrl ? "#198754" : "#000000" }}
              >
                {tabDetail?.tab}
              </h6>
            ))
          : topHeaderNavArray
              ?.filter((ele) => userDetails?.modules?.includes(ele?.tab))
              ?.map((tabDetail, index) => (
                <h6
                  onClick={() => navigate(tabDetail?.url)}
                  key={index}
                  style={{ color: currentUrl[2] === tabDetail?.activeUrl ? "#198754" : "#000000" }}
                >
                  {tabDetail?.tab}
                </h6>
              ))}
      </div>
      <div className="user_profile_wrapper">
        <div className="notification_icon_wrapper">
          <FontAwesomeIcon
            icon={faBell}
            className="notification_icon fontAwesome_icon"
            onClick={() => {
              router.push("/panel/admin/notification");
            }}
          />
          {notificationCount > 0 && (
            <div className="notification_count_wrapper">
              <p>{notificationCount ?? 0}</p>
            </div>
          )}
        </div>
        <div className="user_profile">
          <div className="user_image_wrapper">
            <FontAwesomeIcon icon={faUser} className="fontAwesome_icon text-dark" />
          </div>
          <div
            className="profile_detail position-relative cursor_pointer"
            onClick={() => {
              setIsSubmenuVisible(!isSubmenuVisible);
            }}
          >
            <h6 className="text-capitalize">{userDetails?.name ?? "--"}</h6>
            <p>{userDetails?.designationName ?? "--"}</p>
            {isSubmenuVisible && (
              <div className="sub_menu_wrapper" style={{ zIndex: 11 }}>
                <ul className="list-group">
                  <li
                    onClick={() => {
                      handleLogout();
                    }}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopHeader;
