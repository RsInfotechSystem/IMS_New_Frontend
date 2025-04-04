"use client";
import React, { useEffect, useState } from 'react'
import CustomBtn from "@/common-components/CustomBtn";
import { getCategory } from "@/services/commonApis";
import { useRouter } from "next/navigation";

const InhandReport = () => {
    const router = useRouter();
    const [category, setCategory] = useState([]);

    async function getCategoryList() {
        setCategory(await getCategory("", router))
    }
    useEffect(() => {
        getCategoryList()
    }, [])

    return (
        <>
            <div className="top_header">
                <div className="tab_title" style={{ cursor: "pointer" }} title="Back to report" onClick={() => router.push("/dashboard/report")}>Category</div>
                <div className="buttons_wrapper">
                    <CustomBtn name={"Back"} onClick={() => { router.push("/dashboard/report"); }} />
                </div>
            </div>
            <div className="table_wrapper">
                <div className="my-3 d-flex flex-wrap gap-3" style={{ marginLeft: "10px", marginTop: "20px", textTransform: "uppercase" }}>
                    {category?.map((item, index) => (
                        <div className="tab_btn px-3 py-2 text-white text-center" onClick={() => router.push(`/dashboard/report/inhand-report/category-report?categoryId=${item?._id}&category=${item?.name}`)} key={index} style={{ backgroundColor: "#184965", }} >
                            {item?.name}
                        </div>
                    ))}
                </div>

            </div>
        </>
    )
}

export default InhandReport
