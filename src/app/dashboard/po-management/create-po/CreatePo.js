"use client"
import Button from "@/common-components/Button";
import InputBox from "@/common-components/InputBox";
import Loader from "@/common-components/Loader";
import Search from "@/common-components/Search";
import SelectBox from "@/common-components/Select";
import currencyFormatter from "@/helper/currencyFormatter";
import { getActiveVendorList, getCategory, getCategoryWiseBrand } from "@/services/commonApis";
import { communication } from "@/services/communication";
import { vendorType } from "@/utilities/vendorType";
import { faCaretLeft, faCaretRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ViewBill from "../ViewBill";


const CreatePo = () => {
    const router = useRouter();
    const { register, handleSubmit, reset, getValues, setValue, watch, formState: { errors }, } = useForm();
    const [loader, setLoader] = useState(false);
    const params = useSearchParams();
    const categoryId = watch("categoryId");
    const brandId = watch("brandId");
    const type = watch("type");
    const [stock, setStock] = useState([])
    const [CategoryMapData, setCategoryMapData] = useState([])
    const [brand, setBrand] = useState([])
    const [updatedProducts, setUpdatedProducts] = useState([]);
    const [timeoutId, setTimeoutId] = useState();
    const [filter, setFilter] = useState({
        searchString: "",
        categoryId: "",
        brandId: ""
    });
    const [disable, setDisable] = useState(false);
    const [modalState, setModalStates] = useState({
        viewPdf: false,
        data: "",
        viewPrintBill: false
    })

    // form submit function 
    const onSubmit = async (values) => {
        try {
            setLoader(true);
            if (updatedProducts.length === 0) {
                toast.info("Please Select At least one product!");
                return false
            }
            let response;
            if (["", null, undefined, " "].includes(params.get("poId"))) {
                response = await communication.createPo({
                    name: values.name,
                    type: values.type,
                    item: updatedProducts.map(product => ({
                        id: product._id,
                        quantity: product.quantity
                    }))
                });
            } else {
                response = await communication.updatePo({
                    poId: params.get("poId"),
                    name: values.name,
                    type: values.type,
                    item: updatedProducts.map(product => ({
                        _id: product._id,
                        quantity: product.quantity
                    }))
                });
            }

            if (response?.data?.status === "SUCCESS") {
                toast.success(response.data.message)
                // reset();
                // setUpdatedProducts([])
                // getStockList();
                router.push("/dashboard/po-management")
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response.data.message)
                router.push("/");
            } else {
                toast.info(response.data.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setLoader(false);
        }
    };

    const handleSearch = (e) => {
        setFilter(pre => ({ ...pre, searchString: e.target.value }))
        clearTimeout(timeoutId);
        let _timeOutId = setTimeout(() => {
            getStockList(e.target.value, filter.categoryId, filter.brandId);
        }, 2000);
        setTimeoutId(_timeOutId);
    };


    const handleCategory = async () => {
        await getStockList(filter.searchString, getValues("categoryId"));
        if (getValues("categoryId")) {
            setBrand(await getCategoryWiseBrand(getValues("categoryId")));
        } else {
            setBrand([])
        }
        setFilter(pre => ({ ...pre, brandId: "", categoryId: getValues("categoryId") }))
    };



    const handleBrand = async () => {
        setFilter(pre => ({ ...pre, brandId: getValues("brandId") }))
        await getStockList(filter.searchString, filter.categoryId, getValues("brandId"));
    };



    const handleIncrement = (id, materialDetails) => {
        setStock(prevStock => prevStock.map(product => {
            if (product._id === id) {
                if (product.reamainingQuantity === 0) {
                    toast.info("Cannot add more, remaining quantity is 0.");
                    return product;
                } else if (product.reamainingQuantity === product.quantity) {
                    return { ...product, quantity: product.reamainingQuantity };
                } else {
                    return { ...product, quantity: product.quantity + 1 };
                }
            }
            return product;
        }));

        setUpdatedProducts(pre => {
            const existingProduct = pre.find(ele => ele._id === id);
            if (existingProduct) {
                return pre.map(ele => {
                    if (ele._id === id) {
                        if (ele.reamainingQuantity === ele.quantity) {
                            return { ...ele, quantity: ele.reamainingQuantity };
                        } else {
                            return { ...ele, quantity: ele.quantity + 1 };
                        }
                    } else {
                        return ele;
                    }
                });
            } else {
                if (materialDetails.reamainingQuantity === 0) {
                    toast.info(`Cannot add more, remaining quantity is 0.`);
                    return pre;
                } else {
                    return [...pre, { ...materialDetails, quantity: 1 }];
                }
            }
        });
    };

    const handleDecrement = (id) => {
        setStock(prevStock => prevStock.map(product => {
            if (product._id === id) {
                return { ...product, quantity: product.quantity <= 1 ? 0 : product.quantity - 1 };
            }
            return product;
        }));

        setUpdatedProducts(pre => pre.map(ele => {
            if (ele._id === id) {
                return {
                    ...ele,
                    quantity: ele.quantity - 1
                };
            } else {
                return ele;
            }
        }).filter(ele => ele.quantity >= 1));
    };

    const handleChange = (id, value, materialDetails) => {
        setStock(prevStock => prevStock.map(product => {
            if (product._id === id) {
                if (product.reamainingQuantity === 0) {
                    toast.info("Cannot add more, remaining quantity is 0.");
                    return product;
                } else if (product.reamainingQuantity < value) {
                    toast.info(`Cannot add more than ${product.reamainingQuantity}.`);
                    return product;
                } else {
                    return { ...product, quantity: value };
                }
            }
            return product;
        }));

        setUpdatedProducts(pre => {
            const existingProduct = pre.find(ele => ele._id === id);
            if (existingProduct) {
                return pre.map(ele => {
                    if (ele._id === id) {
                        if (ele.reamainingQuantity < value) {
                            toast.info(`Cannot add more than ${ele.reamainingQuantity}.`);
                            return ele;
                        } else {
                            return { ...ele, quantity: value };
                        }
                    } else {
                        return ele;
                    }
                }).filter(ele => ele.quantity > 0);
            } else {
                if (materialDetails.reamainingQuantity === 0) {
                    toast.info(`Cannot add more of ${materialDetails.name}, remaining quantity is 0.`);
                    return pre;
                } else {
                    return [...pre, { ...materialDetails, quantity: value }];
                }
            }
        });
    };

    const getStockList = async (searchString, categoryId, brandId, initialItem = []) => {
        setLoader(true)
        try {
            let payload = {
                searchString: searchString,
                categoryId,
                brandId,

            };
            const serverResponse = await communication.getStockList(payload);
            if (serverResponse?.data?.status === "SUCCESS") {
                const updatedStock = serverResponse?.data?.stock?.map(item => ({
                    ...item,
                    quantity: initialItem.length > 0 ? initialItem?.find(ele => ele._id === item._id)?.quantity ?? 0 : updatedProducts?.find(ele => ele._id === item._id)?.quantity ?? 0,
                }));
                setStock(updatedStock);
                setLoader(false)

            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message)
                router.push("/");
                setLoader(false);
            } else {
                setStock([]);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }

    const getPoById = async () => {
        try {
            setLoader(true);
            const responseFromServer = await communication.getPoById({ poId: params.get("poId") });
            if (responseFromServer?.data?.status === "SUCCESS") {
                const poData = responseFromServer?.data?.po;
                await setUpdatedProducts(poData.item);
                setValue("name", poData.name);
                setValue("type", poData.type);
                await getStockList("", "", "", poData.item);
                if (params?.get("type") === "approval") {
                    setDisable(true)
                }
            } else if (responseFromServer?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message)
                router.push("/");
            } else {
                toast.info(serverResponse.data.message)
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setLoader(false);
        }
    }

    async function printBill() {
        try {
            setLoader(true);
            const responseFromServer = await communication.getPoById({ poId: params.get("poId") });
            if (responseFromServer?.data?.status === "SUCCESS") {
                const poData = responseFromServer?.data?.po;
                setModalStates(pre => ({ ...pre, viewPrintBill: true, viewPdf: true, data: poData }))
            } else if (responseFromServer?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message)
                router.push("/");
            } else {
                toast.info(serverResponse.data.message)
            }
            setLoader(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
            setLoader(false);
        }
    }

    const receivePaymentPo = async (data) => {
        try {
            setLoader(true);
            if (updatedProducts.length === 0) {
                toast.info("Please Select At least one product!");
                return false
            }
            let payload = {
                poId: params.get("poId"),
                item: updatedProducts.map(product => ({
                    _id: product._id,
                    quantity: product.quantity,
                })),
                paidAmount: data.paidAmount
            };
            let response = await communication.receiveMaterialPo(payload);
            if (response?.data?.status === "SUCCESS") {
                toast.success(response?.data?.message);
                setModalStates(pre => ({ ...pre, viewPrintBill: true }))
                // router.push("/dashboard/po-management");
            } else if (response?.data?.status === "JWT_INVALID") {
                toast.info(response?.data?.message);
                router.push("/");
            } else {
                toast.info(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.message);
        } finally {
            setLoader(false);
        }
    };

    useMemo(() => {
        handleBrand();
    }, [brandId]);

    useMemo(() => {
        handleCategory();
    }, [categoryId]);
    async function initialAPICall() {
        setCategoryMapData(await getCategory(router));
        if (["", null, undefined, " "].includes(params.get("poId"))) {
            await getStockList();
        } else {
            getPoById()
        }
    }
    useEffect(() => {
        initialAPICall();
    }, []);

    const totalSum = updatedProducts
        ?.filter((ele) => ele?.quantity !== 0)
        ?.reduce((acc, modelData) => acc + ((getValues("type") === "WHOLESALE") ? (modelData?.wholeSalePrice ?? modelData.price) * modelData.quantity : (modelData?.retailPrice ?? modelData.price) * modelData?.quantity), 0);


    return (
        <>
            {
                loader &&
                <Loader text={"Loading..."} />
            }

            {modalState.viewPdf && <ViewBill pdfData={modalState?.data} setModalStates={setModalStates} />
            }
            {/* top header  */}
            <div className="top_header">
                <div className="tab_title">{[undefined, null, ""]?.includes(params.get("poId")) ? "Create Purchase Order" : "Update Purchase Order"}</div>
                <div className="back_btn" onClick={() => {
                    router.back();
                }}>
                    <div>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_1564_1770)">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.07615 5.61732C3.23093 5.24364 3.59557 5 4.00003 5H14C17.866 5 21 8.13401 21 12C21 15.866 17.866 19 14 19H5.00003C4.44774 19 4.00003 18.5523 4.00003 18C4.00003 17.4477 4.44774 17 5.00003 17H14C16.7615 17 19 14.7614 19 12C19 9.23858 16.7615 7 14 7H6.41424L8.20714 8.79289C8.59766 9.18342 8.59766 9.81658 8.20714 10.2071C7.81661 10.5976 7.18345 10.5976 6.79292 10.2071L3.29292 6.70711C3.00692 6.42111 2.92137 5.99099 3.07615 5.61732Z" fill="#198754" />
                            </g>
                            <defs>
                                <clipPath id="clip0_1564_1770">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div>Back</div>
                </div>
            </div>
            {/* create purchase order form  */}
            <div className="form_wrapper">
                <div className="row">
                    <div className="input_wrapper col-lg-4">
                        <label>Customer Name*</label>
                        <InputBox type={"text"}
                            register={{
                                ...register("name", {
                                    required: "Name is required",
                                })
                            }}
                            errors={errors.name}
                            disable={disable}
                        />
                    </div>

                    <div className="input_wrapper col-lg-4">
                        <label >Sell Type*</label>
                        <SelectBox
                            options={vendorType}
                            firstOption="Select Type"
                            register={{
                                ...register("type", {
                                    required: "type is required",
                                })
                            }}
                            disable={disable}
                            errors={errors.type}
                        />
                    </div>

                </div>
            </div>
            <div className="form_wrapper">

                <div className="form_list_layout_wrapper">
                    <div className="d-flex align-items-center justify-content-between py-2">
                        <p>Material List</p>
                    </div>

                    <div className="row my-2">
                        <div className="input_wrapper col-12 col-md-6 col-lg-3">
                            <label >Select Category</label>
                            <SelectBox
                                firstOption="select Category"
                                options={CategoryMapData}
                                displayName={'name'}
                                value={'_id'}
                                disable={false}
                                register={{
                                    ...register("categoryId")
                                }}
                            />
                        </div>
                        <div className="input_wrapper col-12 col-md-6 col-lg-3">
                            <label >Select Brand</label>
                            <SelectBox
                                firstOption="Select Brand"
                                options={brand}
                                displayName={'name'}
                                value={'_id'}
                                disable={false}
                                register={{
                                    ...register("brandId")
                                }}
                            />
                        </div>
                        <div className="input_wrapper col-12 col-md-6 col-lg-3">
                            <label ></label>
                            <Search
                                value={filter.searchString}
                                onChange={(e) => handleSearch(e)}
                                placeholder="Search"
                            />
                        </div>

                    </div>

                    {/* table  */}
                    <div className="table_wrapper my-3">
                        <div className="table_main">

                            {/* Rename the class name "pi_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                            <div className="table_section pi_product_table">

                                <div className="table_header">

                                    <div className="col_15p">
                                        <h5>Sr. No.</h5>
                                    </div>
                                    <div className="col_20p">
                                        <h5>Category</h5>
                                    </div>
                                    <div className="col_20p">
                                        <h5>Brand</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Name</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Block</h5>
                                    </div>

                                    <div className="col_15p">
                                        <h5>Rate</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Available Quantity</h5>
                                    </div>
                                    <div className="col_25p">
                                        <h5 className="action_wrraper">Quantity</h5>
                                    </div>
                                </div>
                                {
                                    stock?.map((data, index) => {
                                        return (
                                            <div className="table_data" key={index}>

                                                <div className="col_15p">
                                                    <h6>{index + 1}</h6>
                                                </div>

                                                <div className="col_20p">
                                                    <h6>{data?.categoryId?.name}</h6>
                                                </div>
                                                <div className="col_20p">
                                                    <h6>{data?.brandId?.name}</h6>
                                                </div>
                                                <div className="col_20p">
                                                    <h6>{data?.modelId?.name}</h6>
                                                </div>
                                                <div className="col_20p">
                                                    <h6>{data?.blockId?.blockNo ?? "--"}</h6>
                                                </div>

                                                <div className="col_15p">
                                                    <h6>
                                                        {(getValues("type") === "WHOLESALE") ? data?.wholeSalePrice : data?.retailPrice}
                                                    </h6>
                                                </div>
                                                <div className="col_20p">
                                                    <h6>{data?.reamainingQuantity}</h6>
                                                </div>

                                                <div className="col_25p">
                                                    <h6 className='action_wrraper'>
                                                        <div className="qty_add_sub_layout">
                                                            <div className="qty_decrement" title="-"
                                                                onClick={() => { handleDecrement(data._id) }}
                                                            >
                                                                <FontAwesomeIcon icon={faCaretLeft} className="inc_dec_icon" />
                                                            </div>
                                                            <input type="number" min="0" value={data?.quantity} className="qty_input" onChange={(e) => {
                                                                handleChange(data?._id, Number(e.target.value), data)
                                                            }}
                                                                onWheel={(e) => { e.target.blur() }}
                                                            />
                                                            <div className="qty_increment" title="+"
                                                                onClick={() => { handleIncrement(data?._id, data) }}>
                                                                <FontAwesomeIcon icon={faCaretRight} className="inc_dec_icon" />
                                                            </div>
                                                        </div>
                                                    </h6>
                                                </div>

                                            </div>
                                        )


                                    })
                                }

                            </div>

                        </div>
                    </div>
                </div>

                <div className="form_list_layout_wrapper my-4">
                    <div className="d-flex align-items-center justify-content-between">
                        <p>List Preview</p>
                    </div>
                    {/* table  */}
                    <div className="table_wrapper my-3">
                        <div className="table_main">

                            {/* Rename the class name "pi_product_table" to your desired class name and specify its width in pixels. Adjust the width according to each column if needed. */}
                            <div className="table_section pi_product_table">

                                <div className="table_header">

                                    <div className="col_10p">
                                        <h5>Sr. No.</h5>
                                    </div>
                                    <div className="col_20p">
                                        <h5>Category</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Brand</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Name</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Block</h5>
                                    </div>

                                    <div className="col_15p">
                                        <h5>Rate</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5>Quantity</h5>
                                    </div>

                                    <div className="col_20p">
                                        <h5 >Amount</h5>
                                    </div>
                                    <div className="col_20p">
                                        <h5 >Action</h5>
                                    </div>
                                </div>
                                {
                                    updatedProducts?.map((data, index) => {
                                        return <div className="table_data" key={index}>

                                            <div className="col_10p">
                                                <h6>{index + 1}</h6>
                                            </div>

                                            <div className="col_20p">
                                                <h6>{data?.categoryId?.name}</h6>
                                            </div>
                                            <div className="col_20p">
                                                <h6>{data?.brandId?.name}</h6>
                                            </div>
                                            <div className="col_20p">
                                                <h6>{data?.modelId?.name}</h6>
                                            </div>
                                            <div className="col_20p">
                                                <h6>{data?.blockId?.blockNo}</h6>
                                            </div>

                                            <div className="col_15p">
                                                <h6>{(getValues("type") === "WHOLESALE") ? data?.wholeSalePrice ?? data?.price : data?.retailPrice ?? data?.price}</h6>
                                            </div>

                                            <div className="col_20p">
                                                <h6>{data?.quantity}</h6>
                                            </div>

                                            <div className="col_20p">
                                                <h6>{(getValues("type") === "WHOLESALE") ? ((data?.wholeSalePrice ?? data?.price) * data?.quantity) : ((data?.retailPrice ?? data?.price) * data?.quantity)}</h6>
                                            </div>

                                            <div className="col_20p">
                                                <h6>  {<FontAwesomeIcon icon={faTrash} onClick={() => setUpdatedProducts(pre => (pre.filter((ele, i) => i !== index)))} />} </h6>
                                            </div>

                                        </div>

                                    })
                                }

                            </div>

                        </div>
                    </div>
                    <div className="d-flex align-items-start justify-content-start gap-4 py-3">
                        <div className="fw-medium text-secondary">
                            <label>Final Amount</label>
                            <InputBox type={"text"}
                                value={totalSum}
                                disable={true}
                            />
                        </div>
                        {params.get("type") === "approval" &&
                            <div className="fw-medium text-secondary">
                                <label>Paid Amount*</label>
                                <InputBox type={"number"}
                                    register={{
                                        ...register("paidAmount", {
                                            required: "Amount to be paid is required",
                                        })
                                    }}
                                    errors={errors.paidAmount}
                                />
                            </div>
                        }

                    </div>
                </div>



                <div className="d-flex align-items-center justify-content-center gap-3 my-3">
                    {/* <button type='button' onClick={handleSubmit(onSubmit)} className='button'>Send</button> */}
                    {/* <button type='button' className='btn btn-secondary' onClick={() => router.back()} >Cancel</button> */}
                    {params.get("type") !== "approval" && <Button type="submit" onClick={handleSubmit(onSubmit)} name={[undefined, null, ""]?.includes(params.get("poId")) ? "Create" : "Update"} className="button" />}
                    {(params.get("type") === "approval" && modalState.viewPrintBill === false) && <Button type="submit" onClick={handleSubmit(receivePaymentPo)} name={"Receive Payment"} className="button" />}
                    {(params.get("type") === "approval" && modalState.viewPrintBill) && <Button onClick={() => printBill()} name={"Print Bill"} className="button" />}
                    <Button type="submit" onClick={() => router.push("/dashboard/po-management")} name={"Cancel"} className="button" />

                </div>
            </div >
        </>
    )
}

export default CreatePo