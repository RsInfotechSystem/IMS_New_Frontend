"use client"
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SelectBox from './Select'
import CustomBtn from './CustomBtn'
import { useEffect, useMemo, useState } from 'react'
import { getBrandWiseModel, getCategory, getCategoryWiseBrand, getLocations } from '@/services/commonApis'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import { f } from 'html2pdf.js'


function StockFilter({ setModalStates, apiCall, filter, setFilter }) {
    const [categoryList, setCategoryList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [brand, setBrand] = useState([]);
    const [modal, setModal] = useState([]);
    const router = useRouter()
    const [loader, setLoader] = useState([])
    const { register, handleSubmit, reset, getValues, setValue, watch, formState: { errors }, } = useForm();


    const handleCategory = async (id) => {
        if (id) {
            await getCategoryWiseBrand(id, setLoader, router, setBrand)
        } else {
            setBrand([])
            setModal([]);
        }
        setFilter(pre => ({ ...pre, brandId: "", categoryId: id }))
    };



    const handleBrand = async (id) => {
        setFilter(pre => ({ ...pre, brandId: id, modelId: "" }))
        if (id) {
            getBrandWiseModel(id, setModal, router)
        } else {
            setModal([]);
        }
    }


    async function initialApiCall() {
        await setCategoryList(await getCategory(setLoader, router));
        await getLocations(setLoader, router, setLocationList);
       
        if (filter.categoryId) {
          await  handleCategory(filter.categoryId)
        }

        if (filter.brandId) {
          await  handleBrand(filter.brandId)
        }

        setValue("categoryId", filter?.categoryId ?? "")
        setValue("brandId", filter?.brandId ?? "")
        setValue("modelId", filter?.modelId ?? "")
        setValue("location", filter?.location ?? "")
    }

    async function submit(values) {
        try {
            setFilter({ ...values })
            await apiCall({ page: 1, ...values });
            setModalStates(pre => ({ filter: false }))
        } catch (error) {
            toast.error(error.message);
        }
    }


    useEffect(() => {
        initialApiCall()
    }, [])
    return (
        <>
            <div className="form_modal_wrapper">
                <div className="form_modal" style={{ width: "55%" }}>
                    <div className="form_modal_header">
                        <h5 className="title">
                            Filter Stock
                        </h5>
                        <FontAwesomeIcon
                            icon={faCircleXmark}
                            onClick={() => setModalStates((prev) => ({ ...prev, filter: false, }))}
                            className="close_modal_icon"
                        />
                    </div>
                    <div className="form_modal_body">
                        <div className="row">
                            <div className="input_wrapper col-lg-4">
                                <label >Location</label>
                                <SelectBox
                                    options={locationList}
                                    firstOption="Select Location"
                                    displayName={'name'}
                                    value={'_id'}
                                    register={{
                                        ...register("location")
                                    }}
                                    selectedValue={getValues("location")}
                                />
                            </div>
                            <div className="input_wrapper col-lg-4">
                                <label >Category</label>
                                <SelectBox
                                    options={categoryList}
                                    firstOption="Select Category"
                                    displayName={'name'}
                                    value={'_id'}
                                    register={{
                                        ...register("categoryId")
                                    }}
                                    selectedValue={filter?.categoryId ?? ""}
                                    onChange={(e) => handleCategory(e.target.value)}
                                />
                            </div>
                            <div className="input_wrapper col-lg-4">
                                <label >Brand</label>
                                <SelectBox
                                    options={brand}
                                    firstOption="Select brand"
                                    displayName={'name'}
                                    value={'_id'}
                                    register={{
                                        ...register("brandId")
                                    }}
                                    selectedValue={filter.brandId}
                                    onChange={(e) => handleBrand(e.target.value)}
                                />
                            </div>

                            <div className="input_wrapper col-lg-4">
                                <label >Model</label>
                                <SelectBox
                                    options={modal}
                                    firstOption="Select model"
                                    displayName={'name'}
                                    value={'_id'}
                                    register={{
                                        ...register("modelId")
                                    }}
                                    selectedValue={filter.modelId}
                                />
                            </div>
                        </div>

                        <div className="form_button_wrapper mt-2">
                            <CustomBtn
                                name={"apply"}
                                onClick={handleSubmit(submit)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StockFilter