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
import { Search, BarChart3, ChevronDown } from "lucide-react";
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

const primaryColor = "#184965";
const primaryLight = "#2f6a8f";
const bgColor = "#f4f8fb";
const borderColor = "#d1d5db";

const InwardReport = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("quantity-desc");
    const [showTop, setShowTop] = useState("20");
    const [originalData, setOriginalData] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loader, setLoader] = useState(false);

    const fetchInwardReport = async () => {
        try {
            setLoader(true);
            const serverResponse = await communication.getInwardReportCategories();
            if (serverResponse?.data?.status === "SUCCESS") {
                const categories = serverResponse.data.category || [];
                const total = categories.reduce((sum, cat) => sum + cat.quantity, 0);
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

    useEffect(() => {
        fetchInwardReport();
    }, []);

    useEffect(() => {
        let filtered = originalData.filter((category) =>
            category?.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (sortBy) {
            case "quantity-desc":
                filtered.sort((a, b) => b.quantity - a.quantity);
                break;
            case "quantity-asc":
                filtered.sort((a, b) => a.quantity - b.quantity);
                break;
            case "name-asc":
                filtered.sort((a, b) => a.category.localeCompare(b.category));
                break;
            case "name-desc":
                filtered.sort((a, b) => b.category.localeCompare(a.category));
                break;
        }

        const limit = parseInt(showTop);
        setFilteredCategories(showTop === "100" ? filtered : filtered.slice(0, limit));
    }, [searchTerm, sortBy, originalData, showTop]);

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header my-2" style={{ paddingBottom: "10px" }}>
                <div className="tab_title" style={{ cursor: "pointer" }} title="Back to report" onClick={() => router.push("/dashboard/report")}></div>
                <div className="buttons_wrapper">
                    <CustomBtn name={"Back"} onClick={() => { router.push("/dashboard/report"); }} />
                </div>
            </div>
            <div
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#f9fafb",
                    padding: "1rem",
                    paddingLeft: "1.5rem",
                    paddingRight: "1.5rem",
                    paddingTop: "2rem",
                }}
            >
                <div
                    style={{
                        maxWidth: "1280px",
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <h1 style={{ fontSize: "1.375rem", fontWeight: "bold", color: "#111827", marginBottom: "0.5rem" }}>
                            Inventory Inward Report
                        </h1>
                        <p style={{ color: "#4b5563" }}>
                            Comprehensive analysis of stock movement by category
                        </p>
                    </div>

                    {/* Filters */}
                    <Card
                        style={{
                            backgroundColor: "#ffffff",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "1rem",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            padding: "30px"
                        }}
                    >
                        <CardHeader style={{ marginBottom: "18px" }}>
                            <CardTitle
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    color: primaryColor,
                                    fontSize: "1.125rem",
                                }}
                            >
                                <Search size={18} />
                                Filters & Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                    gap: "1rem",
                                }}
                            >
                                {/* Search */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: "500", color: "#374151" }}>
                                        Search Categories
                                    </label>
                                    <Input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by category name..."
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem 0.75rem",
                                            fontSize: "0.875rem",
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: "0.5rem",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                        }}
                                    />
                                </div>

                                {/* Sort */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: "500" }}>Sort By</label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger
                                            style={{
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: "0.5rem",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                paddingRight: "0.75rem",
                                            }}
                                            className="custom-select-trigger"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
                                            <SelectItem value="quantity-asc">Quantity (Low to High)</SelectItem>
                                            <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                            <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Chart Type */}
                                {/* <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: "500" }}>Chart Type</label>
                                    <Select>
                                        <SelectTrigger
                                            style={{
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: "0.5rem",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                            }}
                                        >
                                            <SelectValue placeholder="Bar Chart" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bar">Bar Chart</SelectItem>
                                            <SelectItem value="pie" disabled>Pie Chart (Coming Soon)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div> */}

                                {/* Show Top N */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontSize: "0.875rem", fontWeight: "500" }}>Show Top</label>
                                    <Select value={showTop} onValueChange={setShowTop}>
                                        <SelectTrigger
                                            style={{
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: "0.5rem",
                                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                paddingRight: "0.75rem",
                                            }}
                                            className="custom-select-trigger"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Top 10</SelectItem>
                                            <SelectItem value="20">Top 20</SelectItem>
                                            <SelectItem value="30">Top 30</SelectItem>
                                            <SelectItem value="50">Top 50</SelectItem>
                                            <SelectItem value="100">All Categories</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart */}
                    <Card
                        style={{
                            marginTop: "2rem",
                            backgroundColor: "#ffffff",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "1rem",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                            padding: "30px"
                        }}
                    >
                        <CardHeader style={{ marginBottom: "18px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                }}
                            >
                                <div>
                                    <CardTitle
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            color: primaryColor,
                                            fontSize: "1.125rem",
                                        }}
                                    >
                                        <BarChart3 size={18} />
                                        Stock Outward Visualization
                                    </CardTitle>
                                    <CardDescription style={{ color: "#4b5563", marginTop: "0.25rem" }}>
                                        Showing {filteredCategories.length} categories • Total:{" "}
                                        {totalQuantity.toLocaleString()} quantity
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div
                                style={{
                                    height: "520px",
                                    backgroundColor: bgColor,
                                    borderRadius: "1rem",
                                    padding: "1rem",
                                }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={filteredCategories}
                                        height={700}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        onClick={(event) => {
                                            const payload = event?.activePayload?.[0]?.payload;
                                            if (payload?.categoryId) {
                                                router.push(`/dashboard/report/inward-report-list?categoryId=${payload.categoryId}`);
                                            }
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="category"
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            height={80}
                                            tick={{ fontSize: 14 }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                        // domain={[0, 'dataMax + 10']} // 👈 adds padding above the highest bar
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "white",
                                                border: "1px solid #ccc",
                                                borderRadius: "8px",
                                            }}
                                            formatter={(value, name, props) => [
                                                `${value.toLocaleString()} quantity`,
                                                props.payload.category,
                                            ]}
                                        />
                                        <Bar dataKey="quantity" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={80} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Stats */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "1.5rem",

                        }}
                    >
                        <Card style={{
                            textAlign: "center",
                            borderRadius: "1rem",
                        }} >
                            <CardContent style={{ paddingTop: "1.5rem" }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: primaryColor }}>
                                    {filteredCategories.length}
                                </div>
                                <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>Categories Shown</p>
                            </CardContent>
                        </Card>
                        <Card style={{ textAlign: "center", borderRadius: "1rem", }}>
                            <CardContent style={{ paddingTop: "1.5rem" }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: primaryColor }}>
                                    {totalQuantity.toLocaleString()}
                                </div>
                                <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>Total Quantity</p>
                            </CardContent>
                        </Card>
                        <Card style={{ textAlign: "center", borderRadius: "1rem", }}>
                            <CardContent style={{ paddingTop: "1.5rem" }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: primaryColor }}>
                                    {filteredCategories.length > 0
                                        ? Math.round(totalQuantity / filteredCategories.length)
                                        : 0}
                                </div>
                                <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>Average per Category</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </>
    );
};

export default InwardReport;