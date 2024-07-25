"use client";
import { Fragment, useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import Image from "next/image";
import warehouse from "../../../public/images/warehouse.png";
import profile from "../../../public/images/profile.png";
import lock from "../../../public/images/lock.png";
// import Loader from "@/reusable/Loader";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { communication } from "@/apis/communication";
import { setCookie } from "cookies-next";
import { useDispatch } from "react-redux";
import { login } from "@/redux-store/useReducer";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if localStorage is available
  const isLocalStorageAvailable = typeof window !== "undefined" && window.localStorage;

  const initialUserId = isLocalStorageAvailable
    ? localStorage.getItem("rememberedUserId") || ""
    : "";
  const initialPassword = isLocalStorageAvailable
    ? localStorage.getItem("rememberedPassword") || ""
    : "";
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setValue("userId", window.atob(initialUserId));
    setValue("password", window.atob(initialPassword));
  }, []);

  const onSubmit = async (data) => {
    try {
      // setLoader(true);
      let res = await communication.login(data);
      if (res.data.status == "SUCCESS") {
        setCookie("inventryToken", res?.data?.token);
        setCookie("userID", res?.data?.userDetails?.userId);
        setCookie("roleId", res?.data?.userDetails?.roleId?._id);
        setCookie("role", res?.data?.userDetails?.roleId?.role);
        setCookie("userName", res?.data?.userDetails?.name);
        setCookie("isLoggedIn", true);
        setCookie("tab", res?.data?.userDetails?.roleId?.tab);
        setCookie("locationId", res?.data?.userDetails?.locationId);

        if (rememberMe) {
          window.localStorage.setItem("rememberedUserId", window.btoa(data.userId));
          window.localStorage.setItem("rememberedPassword", window.btoa(data.password));
        } else {
          window.localStorage.removeItem("rememberedUserId");
          window.localStorage.removeItem("rememberedPassword");
        }
        // dispatch(
        //   login({
        //     isLoggedIn: true,
        //     userID: res?.data?.userDetails?.userId,
        //     roleId: res?.data?.userDetails?.roleId?._id,
        //     role: res?.data?.userDetails?.roleId?.role,
        //     userName: res?.data?.userDetails?.name,
        //   })
        // );
        Swal.fire({
          text: res?.data?.message,
          icon: "success",
        });
        if (res?.data?.userDetails?.roleId?.tab.includes("Role Management")) {
          router.push("/admin/dashboard/role-management");
        } else if (
          res?.data?.userDetails?.roleId?.tab.includes("user_management") ||
          res?.data?.userDetails?.roleId?.tab.includes("User Management")
        ) {
          router.push("/admin/dashboard/user-management");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Location")) {
          router.push("/admin/dashboard/location");
        } else if (
          res?.data?.userDetails?.roleId?.tab.includes("category") ||
          res?.data?.userDetails?.roleId?.tab.includes("brand")
        ) {
          router.push("/admin/dashboard/category-management");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("parameter")) {
          router.push("/admin/dashboard/parameter-management");
        } else if (
          res?.data?.userDetails?.roleId?.tab.includes("Rack Management") ||
          res?.data?.userDetails?.roleId?.tab.includes("Block Management")
        ) {
          router.push("/admin/dashboard/rack-management");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Stock In")) {
          router.push("/admin/dashboard/stock-management");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Assign Material")) {
          router.push("/admin/dashboard/assign-material");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Daily Task")) {
          router.push("/admin/dashboard/daily-task");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Stock Out")) {
          router.push("/admin/dashboard/stock-out");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Inventory Look")) {
          router.push("/admin/dashboard/inventory");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Stock List")) {
          router.push("/admin/dashboard/stock-list");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Model Details")) {
          router.push("/admin/dashboard/model-details");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Inventory Look")) {
          router.push("/admin/dashboard/inventory-look");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Sales Order")) {
          router.push("/admin/dashboard/sales-order");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Transfer Material")) {
          router.push("/admin/dashboard/transfer-material");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Receive Material")) {
          router.push("/admin/dashboard/receive-material");
        } else if (
          res?.data?.userDetails?.roleId?.tab.includes("NR") ||
          res?.data?.userDetails?.roleId?.tab.includes("NR Material")
        ) {
          router.push("/admin/dashboard/non-replaceable");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("notification")) {
          router.push("/admin/dashboard/notification");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Approval")) {
          router.push("/admin/dashboard/approval");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("Stock Out")) {
          router.push("/admin/dashboard/stock-out");
        } else if (res?.data?.userDetails?.roleId?.tab.includes("report")) {
          router.push("/admin/dashboard/report");
        }
      } else if (res.data.status == "FAILED") {
        Swal.fire({
          text: res?.data?.message,
          icon: "warning",
        });
      }
    } catch (errors) {
      Swal.fire({
        text: errors?.message,
        icon: "warning",
      });
    } finally {
      // setLoader(false);
    }
  };
  const handleRememberMeChange = () => {
    setRememberMe((prevValue) => !prevValue);
  };

  return (
    <Fragment>
      {/* {loader && <Loader />} */}
      <div className="signinBody">
        <div className="signin">
          <div className="row">
            <div className="col">
              <Image
                className="warehouseSignin"
                alt="warehouse"
                src={warehouse}
                height={230}
                width={985}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <form>
                <div className="d-flex align-items-center justify-content-center mt-5">
                  <label>Username</label>
                  <div style={{ height: "40px" }}>
                    <div className="input-box input_login">
                      <Image alt="user" src={profile} className="mb-1" width={28} height={28} />
                      <input
                        {...register("userId", {
                          required: "Username is required",
                        })}
                      />
                    </div>

                    {errors.userId && (
                      <p className="text-danger ms-5" style={{ fontSize: ".8rem" }}>
                        {errors.userId.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-center mt-4">
                  <label>Password</label>
                  <div style={{ height: "40px" }}>
                    <div className="input-box input_login">
                      <Image
                        alt="user"
                        src={lock}
                        className="mb-1 cursor-pointer"
                        width={28}
                        height={28}
                        onClick={() => setShowPassword((prevState) => !prevState)}
                      />
                      <input
                        type={`${showPassword ? "text" : "password"}`}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters long",
                          },
                        })}
                      />
                    </div>
                    {errors.password && (
                      <p
                        className="text-danger ms-5"
                        style={{
                          fontSize: ".8rem",
                        }}
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ms-2 bottom_login">
                  <div className="remember-box mt-4">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      className="custom-checkbox ms-4 cursor-pointer"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                    />
                    <label className="cursor-pointer" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <div className="remember-box mt-4">
                    <button
                      type="submit"
                      onClick={handleSubmit(onSubmit)}
                      className="loginbtn ms-4"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="signin-footer">
          <h6 style={{ color: "#000" }}>Powered by - </h6>
          <h6 style={{ color: "#4CA6BF" }}>&nbsp;RS Infotech System (RSIS)</h6>
        </div>
      </div>
    </Fragment>
  );
}
