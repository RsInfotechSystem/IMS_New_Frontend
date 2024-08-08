"use client"
import React, { useState } from 'react'
import icon from "../../public/images/login-image.png";
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import ButtonLoader from '@/common-components/ButtonLoader';
import { setCookie } from 'cookies-next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { communication } from '@/services/communication';


const Page = () => {
  const router = useRouter();
  const [togglePassword, setTogglePassword] = useState(false);
  const [loader, setLoader] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //User Login
  const onSubmit = async (data) => {
    try {
      setLoader(true);
      const serverResponse = await communication.login(data)
      if (serverResponse?.data?.status === "SUCCESS") {
        setCookie("inventryToken", serverResponse?.data?.token);
        setCookie("userDetails", serverResponse?.data?.userDetails);
        router.push("/dashboard/report");
        setLoader(false);
        toast.success(serverResponse?.data?.message);
      } else {
        setLoader(false);
        toast.warning(serverResponse?.data?.message);
      }
    } catch (error) {
      setLoader(false);
      toast.error(error?.message);
    }
  }



  return (
    <>
      <div className="login_wrapper">
        <div className="login_info_section">
          <div className="icon">
            <Image src={icon} className='login_img' alt='LOGO' />
          </div>
          <div className="content">
            {/* <h3>Welcome to <br /> IMS</h3> */}
            <h6 className='text-secondary'>Powered By <br></br> <a className='login_page_rsis' href='https://www.rsinfotechsys.com/'>R S Infotech System P.L.</a></h6>
          </div>
        </div>
        <div className="login_form_section">
          <div className="login_form">
            <h2 className="form_title">Login</h2>
            <p className="text">Enter your User Id and password to access your account</p>
            <div className="login_input_wrapper">
              <label for="userId">User ID</label>
              <div className="login_input">
                <input type="text" placeholder="Enter your User id"
                  {...register("userId", { required: "User ID is required" })}
                  className="form-control" id="userId" />
                {errors?.userId && <p className="validation_message">{errors.userId.message}</p>}
              </div>
            </div>
            <div className="login_input_wrapper">
              <label for="password">Password</label>
              <div className="login_input">
                <input type={!togglePassword ? "password" : "text"} placeholder="Enter your password"
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be minimum 8 characters" }, maxLength: { value: 15, message: "Password cannot be greater than 15 characters" } })}
                  className="form-control" id="password" />
                <FontAwesomeIcon onClick={() => setTogglePassword(!togglePassword)} icon={togglePassword ? faEye : faEyeSlash} className="password_toggle_icon" />
                {errors?.password && <p className="validation_message">{errors.password.message}</p>}
              </div>
            </div>
            {/* <div className="linking_wrapper">
              <span className="linking" onClick={() => router.push("/reset-password")}>Reset Password?</span>
            </div> */}
            <button className="login_button" onClick={handleSubmit(onSubmit)}>{loader ? <ButtonLoader /> : "Login"}</button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  )
}

export default Page