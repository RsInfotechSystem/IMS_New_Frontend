"use client";
import ButtonLoader from "@/common-components/ButtonLoader";
import CustomBtn from "@/common-components/CustomBtn";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import SelectBox from "@/common-components/Select";
import { getCategory } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function CreateBrandUpdated({ data }) {
    const { modalStates, setModalStates, setIsPageUpdated, getBrandList, currentPage, searchString } =
        data;
    const [loader, setLoader] = useState(false);
    const [brandInput, setBrandInput] = useState([]);
    const [_brandList, _setBrandList] = useState([]);
    const [CategoryMapData, setCategoryMapData] = useState([]);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    async function onSubmit(values) {
        try {
            setLoader(true);
            let response;
            if (modalStates?.type === "create") {
                response = await communication.createBrand({
                    name: values.name,
                    categoryId: values.categoryId,
                });
            } else {
                response = await communication.updateBrand({
                    brandId: modalStates.id,
                    name: values.name,
                    categoryId: values.categoryId,
                });
            }
            if (response?.data?.status === "SUCCESS") {
                toast.success(response.data.message);
                setModalStates((pre) => ({
                    modal: false,
                    type: "",
                    id: "",
                }));
                // setIsPageUpdated(true)
                getBrandList(currentPage, searchString);
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message);
                router.push("/");
            } else {
                toast.info(response.data.message);
            }
            setLoader(false);
        } catch (error) {
            toast.error(error?.message);
            setLoader(false);
        }
    }

    const getBrandById = async () => {
        try {
            setLoader(true);
            const responseFromServer = await communication.getBrandById({ brandId: modalStates.id });
            if (responseFromServer?.data?.status === "SUCCESS") {
                const brandData = responseFromServer?.data?.brand;
                // console.log("brandData",brandData);
                setValue("name", brandData.name);
                setValue("categoryId", brandData?.categoryId?._id);
            } else if (responseFromServer?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setLoader(false);
        }
    };

    async function initialAPICall() {
        setCategoryMapData(await getCategory(router));
        if (modalStates?.type !== "create") {
            await getBrandById();
        }
    }
    function addToBrandList() {
        // console.log(parameterInput, "parameterInput");

        if (brandInput) {
            _setBrandList((prev) => [...prev, brandInput]);
            setValue("brandId", "");
        } else {
            setError("brandId", {
                message: "Please enter brand",
            });
        }
    } function deleteBrandList(id) {
        _setBrandList(_setBrandList.filter((item, index) => index != id));
    }
    useEffect(() => {
        initialAPICall();
    }, []);
    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="form_modal_wrapper">
                <div className="form_modal">
                    <div className="form_modal_header">
                        <h5 className="title">
                            {modalStates?.type === "create" ? "Create Brand" : "Update Brand"}
                        </h5>
                        <FontAwesomeIcon
                            icon={faCircleXmark}
                            onClick={() => setModalStates((prev) => ({ ...prev, modal: false }))}
                            className="close_modal_icon"
                        />
                    </div>
                    <div className="form_modal_body">
                        <div className="row d-flex align-items-end">
                            <div className="input_wrapper col-md-6 col-md-6">
                                <label>Category*</label>
                                <SelectBox
                                    firstOption="select Category"
                                    options={CategoryMapData}
                                    displayName={"name"}
                                    value={"_id"}
                                    disable={false}
                                    register={{
                                        ...register("categoryId"),
                                    }}
                                />
                            </div>
                            <div className="row d-flex align-items-end">
                                <div className="input_wrapper col-md-6 col-lg-6">
                                    <label>Brand Name*</label>
                                    <InputBox
                                        type={"text"}
                                        onChange={(e) => setBrandInput(e.target.value)}
                                        register={{
                                            ...register("brandId", {
                                                // required: "brand name is required",
                                            }),
                                        }}
                                        errors={errors.brandId}
                                    />
                                </div>
                                <div className="col-lg-4 col-md-4 input_wrapper">
                                    <CustomBtn
                                        name="Add"
                                        type="button"
                                        className="btn btn-success"
                                        onClick={addToBrandList}
                                    />
                                </div>
                            </div>
                            {_brandList
                                ?.reduce((rows, key, index) => {
                                    // Create a new row after every 3 items
                                    if (index % 3 === 0) rows.push([]);
                                    // Add the current item to the last row
                                    rows[rows.length - 1].push(key);
                                    return rows;
                                }, [])
                                .map((row, rowIndex) => (
                                    <div className="row d-flex align-items-end" key={rowIndex}>
                                        {row.map((ele, colIndex) => (
                                            <div
                                                className="col-lg-4 col-md-5 d-flex align-items-center input_wrapper"
                                                key={colIndex}
                                            >
                                                <InputBox value={ele} disable={true} />
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    onClick={() => deleteBrandList(rowIndex * 3 + colIndex)}
                                                    className="trash fontAwesome_icon cursor_pointer ml-2"
                                                    style={{ marginLeft: 8 }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ))}

                        </div>
                        <div className="form_button_wrapper">
                            <CustomBtn
                                name={modalStates?.type === "create" ? "Create" : "Update"}
                                onClick={handleSubmit(onSubmit)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateBrandUpdated;
