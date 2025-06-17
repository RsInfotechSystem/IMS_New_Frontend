"use client";

import React, { useState, useEffect } from "react";
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
import { Search, BarChart3 } from "lucide-react";
import { Input } from "@/utilities/common-component/Input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/utilities/common-component/Select";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import Loader from "@/common-components/Loader";
import OutwardReportList from "../outward-report-list/OutwardReport";
import { useRouter } from "next/navigation";

const primaryColor = "#184965";
const primaryLight = "#2f6a8f";
const bgColor = "#f4f8fb";
const borderColor = "#d1d5db";

const OutwardReport = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("quantity-desc");
    const [showTop, setShowTop] = useState("20");
    const [originalData, setOriginalData] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loader, setLoader] = useState(false);

    const fetchOutwardReport = async () => {
        try {
            setLoader(true);
            const serverResponse = await communication.getOutwardReportCategories();
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
        fetchOutwardReport();
    }, []);

    useEffect(() => {
        let filtered = originalData.filter((category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (sortBy) {
            case "quantity-desc":
                filtered.sort((a, b) => b.quantity - a.quantity);
                break;
            case "quantity-asc":
                filtered.sort((a, b) => a.quantity - b.quantity);
                break;
            case "name-asc":
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "name-desc":
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }

        const limit = parseInt(showTop);
        setFilteredCategories(showTop === "100" ? filtered : filtered.slice(0, limit));
    }, [searchTerm, sortBy, originalData, showTop]);

    return (
        <>
            {loader && <Loader text="Fetching Data..." />}

            {/* Filters Section */}
            <Card
                style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "1rem",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
            >
                <CardHeader>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
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

                        {/* Sort Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort By</label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger
                                    style={{
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: "0.5rem",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                    }}
                                >
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
                                    <SelectItem value="quantity-asc">Quantity (Low to High)</SelectItem>
                                    <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                                    <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Chart Type (future expansion) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Chart Type</label>
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
                                    <SelectItem value="pie" disabled>
                                        Pie Chart (Coming Soon)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Top N dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Show Top</label>
                            <Select value={showTop} onValueChange={setShowTop}>
                                <SelectTrigger
                                    style={{
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: "0.5rem",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                    }}
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

            {/* Chart Section */}
            <Card
                style={{
                    marginTop: "2rem",
                    backgroundColor: "#ffffff",
                    border: `1px solid ${borderColor}`,
                    borderRadius: "1rem",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
            >
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                            height: "400px",
                            backgroundColor: bgColor,
                            borderRadius: "1rem",
                            padding: "1rem",
                        }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={filteredCategories}
                                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                onClick={() => {
                                    router.push("/dashboard/report/outward-report-list")
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                    }}
                                    formatter={(value, name, props) => [
                                        `${value.toLocaleString()} units`,
                                        props.payload.name,
                                    ]}
                                />
                                <Bar dataKey="quantity" fill={primaryColor} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default OutwardReport;