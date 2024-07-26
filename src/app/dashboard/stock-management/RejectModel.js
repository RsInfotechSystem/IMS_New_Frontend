"use client"
import CustomBtn from '@/common-components/CustomBtn'
import InputBox from '@/common-components/InputBox'
import React, { useEffect, useState } from 'react'

function RejectModel({ data }) {



    return (
        <>
            <div className="form_modal_wrapper">
            <div className="form_modal" style={{ width: "25%" }}>
            <div className="input_wrapper">
                    <InputBox type={"text"} placeholder="Enter Remark For Rejection"/>
                </div>
                <div className="form_button_wrapper">
                            <CustomBtn name={"Reject"} onClick="" />
                            <CustomBtn name={"Cancel"} />

                        </div>
                </div>
            </div>
        </>
    )
}

export default RejectModel