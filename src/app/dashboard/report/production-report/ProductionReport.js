"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/utilities/common-component/Card";
import { BarChart3, ChevronDown } from "lucide-react";
import { Input } from "@/utilities/common-component/Input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/utilities/common-component/Select";
import { toast, ToastContainer } from "react-toastify";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import CustomBtn from "@/common-components/CustomBtn";
import Search from "@/common-components/Search";

const primaryColor = "#184965";
const primaryLight = "#2f6a8f";
const bgColor = "#f4f8fb";
const borderColor = "#d1d5db";

const ProductionReport = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("quantity-desc");
    const [showTop, setShowTop] = useState("20");
    const [originalData, setOriginalData] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loader, setLoader] = useState(false);

    const fetchProductionReport = async () => {
        try {
            setLoader(true);
            const serverResponse = await communication.getProductionReport();
            if (serverResponse?.data?.status === "SUCCESS") {
                const categories = serverResponse.data.report || [];
                const total = categories.reduce((sum, cat) => sum + cat.totalRemainingQuantity, 0);
                setOriginalData(categories);
                setTotalQuantity(total);
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.warn(serverResponse.data.message);
                router.push("/");
            } else {
                setOriginalData([]);
            }
        } catch (error) {
            toast.warn(error?.response?.data?.message || error.message);
        } finally {
            setLoader(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    }

    useEffect(() => {
        // fetchProductionReport();
    }, []);

    useEffect(() => {
        let filtered = originalData.filter((vendor) =>
            vendor?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor?.vendorCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (sortBy) {
            case "quantity-desc":
                filtered.sort((a, b) => b.totalRemainingQuantity - a.totalRemainingQuantity);
                break;
            case "quantity-asc":
                filtered.sort((a, b) => a.totalRemainingQuantity - b.totalRemainingQuantity);
                break;
            case "name-asc":
                filtered.sort((a, b) => a.vendorName.localeCompare(b.vendorName));
                break;
            case "name-desc":
                filtered.sort((a, b) => b.vendorName.localeCompare(a.vendorName));
                break;
        }

        const limit = parseInt(showTop);
        setFilteredCategories(showTop === "100" ? filtered : filtered?.slice(0, limit));
    }, [searchTerm, sortBy, originalData, showTop]);

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header" style={{ paddingBottom: "10px" }}>
                {/* <div className="tab_title" style={{ cursor: "pointer" }} title="Back to report" onClick={() => router.push("/dashboard/report")}>Inventory Production Report</div> */}
                <div className="tab_title" style={{ cursor: "pointer" }} title="Back to report" ></div>
                <div className="buttons_wrapper">
                    <CustomBtn name={"Back"} onClick={() => { router.push("/dashboard/report"); }} />
                </div>
            </div>
            <div>

                <h6 style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: primaryColor,
                    fontSize: "1.125rem",
                }}>
                    {"Comming Soon..."}
                </h6>

            </div>
        </>
    );
};

export default ProductionReport;