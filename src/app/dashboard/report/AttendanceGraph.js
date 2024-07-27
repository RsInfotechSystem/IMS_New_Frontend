import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import { useRouter } from "next/navigation";
import Loader from "@/common-components/Loader";
import CustomDateInput from "@/common-components/CustomDateInput";
import Swal from "sweetalert2";
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
const AttendanceGraph = () => {
    const router = useRouter();
    const [graphData, setGraphData] = useState({});
    const [stockOutGraphData, setStockOutGraphData] = useState({ labels: [], count: [] }); 
    const [filterValues, setFilterValues] = useState({
        startDate: "",
        endDate: ""
    });
    //get attendance graph data on initial load
    //   const fetchAttendanceGraphData = async () => {
    //     try {
    //       const serverResponse = await communication.getAttendanceGraphData(
    //         filterValues
    //       );
    //       if (serverResponse?.data?.status === "SUCCESS") {
    //         setGraphData(serverResponse?.data?.attendance);
    //       } else if (serverResponse?.data?.status === "JWT_INVALID") {
    //         toast.info(serverResponse?.data?.message);
    //         router.push("/");
    //       } else {
    //         setGraphData({});
    //       }
    //     } catch (error) {
    //       toast.error(error?.message);
    //     }
    //   };

    async function fetchAttendanceGraphData() {
        console.log("filterValues?.startDate",filterValues?.startDate,"filterValues?.endDate",filterValues?.endDate);
        try {
            const serverResponse = await communication.getStockOutCount({
                startDate: filterValues?.startDate,
                endDate: filterValues?.endDate,
            });
            if (serverResponse?.data?.status === "SUCCESS") {
                // setReport(serverResponse?.data?.report);
                setGraphData(serverResponse?.data?.report);
                console.log(serverResponse?.data?.report);

                // setState({ _locationData: serverResponse.data.locationCount });
                setStockOutGraphData({
                  labels: serverResponse.data.report.map((label) => label.label),
                  count: serverResponse.data.report.map((count) => count.count),
                });
            } else if (serverResponse?.data?.status === "JWT_INVALID") {
                Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            } else {
                Swal.fire({ text: serverResponse.data.message, icon: "warning" });
            }
        } catch (error) {
            Swal.fire({
                text: error?.response?.data?.message || error.message,
                icon: "warning",
            });
        }
    }

    useEffect(() => {
        fetchAttendanceGraphData();
    }, [filterValues]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: "top",
            },
            title: {
                display: true,
                text: "",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Number of Sell",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
        },
    };
    const labels = stockOutGraphData.labels;

    const data = {
        labels,
        datasets: [
            {
                label: "Sell",
                data: stockOutGraphData.count,
                borderColor: "#0D6EFD",
                backgroundColor: "#0D6EFD",
                // tension: 0.4, // This value creates the curve in the line
                // fill: false,
            },
        ],
    };

    return (
        <>
            <div className="dashboard_filter_wrapper">
                <div>
                    <label>Start Date</label>
                    <CustomDateInput value={filterValues?.startDate} onChange={(date) => { setFilterValues((prev) => ({ ...prev, startDate: date })) }} />
                </div>
                <div>
                    <label>End Date</label>
                    <CustomDateInput value={filterValues?.endDate} onChange={(date) => { setFilterValues((prev) => ({ ...prev, endDate: date })) }} />
                </div>
            </div>
            <div className="attendance_graph_wrapper">
                <div>
                    {/* <AttendanceGraph filterValues={filterValues} /> */}
                    <Line options={options} data={data} />
                </div>
            </div>
        </>
    );
};

export default AttendanceGraph;
