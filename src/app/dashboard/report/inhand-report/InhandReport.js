"use client";
import React, { useEffect, useState } from 'react'
import CustomBtn from "@/common-components/CustomBtn";
import { getCategory } from "@/services/commonApis";
import { useRouter } from "next/navigation";
import { communication } from '@/services/communication';
import { toast } from 'react-toastify';

const InhandReport = () => {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loader, setLoader] = useState(false);

    async function getCategoryList() {
        try {
            setLoader(true);
            const serverResponse = await communication.getCategoryForInwardReport();
            if (serverResponse?.data?.status === "SUCCESS") {
                setCategories(serverResponse?.data?.category)
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
                setCategories([])
            }
            setLoader(false);
        } catch (error) {
            toast.info(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }
    useEffect(() => {
        getCategoryList()
    }, [])




    return (
        <>
            <div className="top_header" style={{ paddingBottom: "10px" }}>
                <div className="tab_title" style={{ cursor: "pointer" }} title="Back to report" onClick={() => router.push("/dashboard/report")}>Category</div>
                <div className="buttons_wrapper">
                    <CustomBtn name={"Back"} onClick={() => { router.push("/dashboard/report"); }} />
                </div>
            </div>
            <div
                style={{
                    // maxHeight: '80vh',
                    overflowY: 'auto',
                    padding: '8px',
                    height: "97%",
                    borderRadius: "8px",
                    backgroundColor: "white"
                }}
            >
                <div className="row g-3">
                    {categories.map((category, index) => (
                        <div className="col-md-6 col-lg-4" key={index}>
                            <div className="card shadow-sm h-100">
                                <div className="card-header  text-white fw-bold text-uppercase" style={{ backgroundColor: "#184965" }}>
                                    {category._id}
                                </div>

                                <ul
                                    className="list-group list-group-flush"
                                    style={
                                        category.categories.length > 7
                                            ? {
                                                maxHeight: '250px',
                                                overflowY: 'auto',
                                                paddingRight: '6px'
                                            }
                                            : {}
                                    }
                                >
                                    {category?.categories?.map((sub, subIndex) => (
                                        <li
                                            key={subIndex}
                                            className="list-group-item list-group-item-action"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/report/inhand-report/category-report?categoryId=${sub._id}&category=${sub.name}`
                                                )
                                            }
                                        >
                                            {sub?.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div >

        </>
    )
}

export default InhandReport
