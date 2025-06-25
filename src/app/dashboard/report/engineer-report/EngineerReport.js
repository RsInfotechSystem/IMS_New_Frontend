"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import {
//     ResponsiveContainer,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid,
// } from "recharts";
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
import CustomTooltip from "@/common-components/CustomTooltip";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

const primaryColor = "#184965";
const primaryLight = "#2f6a8f";
const bgColor = "#f4f8fb";
const borderColor = "#d1d5db";
// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const EngineerReport = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("quantity-desc");
    const [showTop, setShowTop] = useState("20");
    const [originalData, setOriginalData] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loader, setLoader] = useState(false);

    const fetchEngineerReport = async () => {
        try {
            setLoader(true);
            const serverResponse = await communication.getEngineerWiseReport();
            if (serverResponse?.data?.status === "SUCCESS") {
                const reports = serverResponse.data.report || [];
                setOriginalData(reports);

                // ✅ Correct way to calculate total assigned quantity
                const total = reports.reduce((total, user) => {
                    const userTotal = user.stockStatusSummary.reduce(
                        (sum, status) => sum + (status.totalAssignedQuantity || 0),
                        0
                    );
                    return total + userTotal;
                }, 0);

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
        fetchEngineerReport();
    }, []);

    useEffect(() => {
        let filtered = originalData.filter((report) =>
            report?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch (sortBy) {
            case "quantity-desc":
                filtered.sort((a, b) => b.totalAssignedQuantity - a.totalAssignedQuantity);
                break;
            case "quantity-asc":
                filtered.sort((a, b) => a.totalAssignedQuantity - b.totalAssignedQuantity);
                break;
            case "name-asc":
                filtered.sort((a, b) => a.userName.localeCompare(b.userName));
                break;
            case "name-desc":
                filtered.sort((a, b) => b.userName.localeCompare(a.userName));
                break;
        }

        const limit = parseInt(showTop);
        setFilteredCategories(showTop === "100" ? filtered : filtered.slice(0, limit));
    }, [searchTerm, sortBy, originalData, showTop]);

    const statusKeys = ["TO TEST", "READY", "FAULTY", "FAULTY-NO POWER", "NR", "TESTED-OK"];
    const colors = {
        "READY": "#2776A3",
        "TO TEST": "#1D587A",
        "FAULTY": "#649DC1",
        "FAULTY-NO POWER": "#2F5B74",
        "NR": "#7491a2",
        "TESTED-OK": "#091c27",
    };
    const chartData = {
        labels: filteredCategories.map((user) => user.userName),
        datasets: statusKeys.map((status) => ({
            label: status,
            data: filteredCategories.map((user) => {
                const entry = user.stockStatusSummary.find((s) => s.stockStatus === status);
                return entry ? entry.totalAssignedQuantity : 0;
            }),
            backgroundColor: colors[status] || primaryColor,
            stack: 'stack1',
            barThickness: 70,
            categoryPercentage: 1.0,  // 👈 Controls spacing between bars
            barPercentage: 1.0
        })),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.raw;
                        return `${label}: ${value}`;
                    },
                },
            },
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 20,
                    padding: 10,
                },
            },
        },
        layout: {
            padding: { top: 0 },
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    font: {
                        size: 16,
                        weight: '500',
                    },
                    color: "#1f2937",
                },
            },
            y: {
                stacked: true,
                ticks: {
                    beginAtZero: true,
                },
            },
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const engineer = filteredCategories[index]?.userName;
                if (engineer) {
                    router.push(`/dashboard/report/engineer-report-list?userId=${filteredCategories[index]?.userId}`);
                }
            }
        },
    };


    return (
        <>
            {loader && <Loader text="Fetching Data..." />}
            <div className="top_header my-2" style={{ paddingBottom: "10px" }}>
                <div className="tab_title" style={{ cursor: "pointer" }} title="Back to report" onClick={() => router.push("/dashboard/report")}>
                    Inventory Engineer Report
                </div>
                <div className="buttons_wrapper">
                    <CustomBtn name={"Back"} onClick={() => { router.push("/dashboard/report"); }} />
                </div>
            </div>

            <div style={{
                minHeight: "100vh",
                backgroundColor: "#f9fafb",
                padding: "1rem",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "1rem",
            }}
            >
                <div style={{
                    maxWidth: "1280px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
                >
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
                                    <Search value={searchTerm} onChange={handleSearch} placeholder={"Search"} />
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
                                                fontSize: "13px",
                                                outline: "none",
                                            }}
                                            className="custom-select-trigger"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent style={{ fontSize: "13px" }} className="search_input">
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
                                                fontSize: "13px",
                                                outline: "none",
                                            }}
                                            className="custom-select-trigger"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent style={{ fontSize: "13px" }}>
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
                    <Card style={{ backgroundColor: "#ffffff", border: `1px solid ${borderColor}`, borderRadius: "1rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", padding: "30px" }}>
                        <CardHeader style={{ marginBottom: "18px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <CardTitle style={{ display: "flex", alignItems: "center", gap: "8px", color: primaryColor, fontSize: "1.125rem" }}>
                                        <BarChart3 size={18} />
                                        Stock Assigned Visualization
                                    </CardTitle>
                                    <CardDescription style={{ color: "#4b5563", marginTop: "0.25rem", fontSize: "1rem" }}>
                                        Showing {filteredCategories.length} engineers • Total: {totalQuantity.toLocaleString()} quantity
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div style={{ height: "480px", backgroundColor: bgColor, borderRadius: "1rem", padding: "1rem", marginTop: "1rem" }}>
                                <Chart type="bar" data={chartData} options={chartOptions} />
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
                                <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>Engineers Shown</p>
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
                                <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>Average per Quantity</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </>
    );
};

export default EngineerReport;