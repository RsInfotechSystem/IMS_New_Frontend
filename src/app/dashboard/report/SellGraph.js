import React, { useEffect, useRef, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import { useRouter } from "next/navigation";
import Loader from "@/common-components/Loader";
import CustomDateInput from "@/common-components/CustomDateInput";
import Swal from "sweetalert2";

// Register the necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SellGraph = () => {
    const router = useRouter();
    const [stockOutGraphData, setStockOutGraphData] = useState({ labels: [], count: [] });
    const [filterValues, setFilterValues] = useState({
        startDate: "",
        endDate: ""
    });
    const [state, setState] = useState();


    // const chartRef = useRef();

    async function fetchStockOutCount() {
        try {
            const serverResponse = await communication.getStockOutCount({
                startDate: filterValues?.startDate,
                endDate: filterValues?.endDate,
            });
            if (serverResponse?.data?.status === "SUCCESS") {
                setState(serverResponse.data.report);
                setStockOutGraphData({
                    labels: serverResponse.data.report.map((label) => label.label),
                    count: serverResponse.data.report.map((count) => count.count),
                });
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                toast.info(serverResponse.data.message);
                router.push("/");
            } else {
                toast.info(serverResponse.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }

    useEffect(() => {
        fetchStockOutCount();
    }, [filterValues]);

    const options = {
        plugins: {
            title: {
                display: false,
                text: "",
                color: "#8F9BB4",
                font: {
                    size: 14,
                },
            },
            tooltip: {
                backgroundColor: "#2D3E9A",
            },
        },
        responsive: true,
        scales: {
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: "Number of Sell",
                    color: "#000",
                    font: {
                        size: 15,
                    },
                },
                grid: {
                    display: false,
                },
            },
            x: {
                stacked: true,
                title: {
                    display: true,
                    color: "#000",
                    font: {
                        size: 15,
                    },
                },
                grid: {
                    display: false,
                },
            },
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const clickedElementIndex = elements[0].index;
                let stockDetails = state[clickedElementIndex];
                router.push(
                    `/dashboard/report/report-details?reportData=${stockDetails.reportDate}&reportType=graph`
                );
            }
        },
    };

    const graphData = {
        labels: stockOutGraphData.labels,
        datasets: [
            {
                label: "Sell",
                data: stockOutGraphData.count,
                backgroundColor: "#184965",
                barThickness: 35,
            },
        ],
    };

    return (
        <>
            <div className="dashboard_filter_wrapper">
                <div>
                    <label>Start Date</label>
                    <CustomDateInput
                        value={filterValues?.startDate}
                        onChange={(date) => { setFilterValues((prev) => ({ ...prev, startDate: date })) }}
                    />
                </div>
                <div>
                    <label>End Date</label>
                    <CustomDateInput
                        value={filterValues?.endDate}
                        onChange={(date) => { setFilterValues((prev) => ({ ...prev, endDate: date })) }}
                    />
                </div>
            </div>
            <div className="attendance_graph_wrapper">
                <div>
                    <Bar options={options} data={graphData}  />
                    {/* <Bar ref={chartRef} options={options} data={graphData}  /> */}

                </div>
            </div>
        </>
    );
};

export default SellGraph;
