import React, { useEffect, useState } from "react";
import {
    LineChart,
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import { useRouter } from "next/navigation";
import CustomDateInput from "@/common-components/CustomDateInput";
import CustomDateInputWithMaxDate from "@/common-components/CustomDateInputWithMazDate";

const SellGraphLine = () => {
    const router = useRouter();
    const [stockOutGraphData, setStockOutGraphData] = useState([]);
    const [filterValues, setFilterValues] = useState({
        startDate: "",
        endDate: "",
    });
    const CustomTooltip = ({ payload, label }) => {
        if (payload.length === 0) return null;

        return (
            <div className="custom-tooltip">
                <p className="label">{`${label}: ${payload[0].value}`}</p>
            </div>
        );
    };
    async function fetchStockOutCount() {
        try {
            const serverResponse = await communication.getStockOutCount({
                startDate: filterValues?.startDate,
                endDate: filterValues?.endDate,
            });
            if (serverResponse?.data?.status === "SUCCESS") {
                // Transform the data structure here
                const transformedData = serverResponse?.data?.report?.map((item) => ({
                    label: item?.label,
                    count: item?.count,
                }));

                setStockOutGraphData(transformedData);
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

    return (
        <>
            <div className="dashboard_filter_wrapper">
                <div>
                    <label>Start Date</label>
                    <CustomDateInputWithMaxDate
                        value={filterValues?.startDate}
                        onChange={(date) => {
                            setFilterValues((prev) => ({ ...prev, startDate: date }));
                        }}
                    />
                </div>
                <div>
                    <label>End Date</label>
                    <CustomDateInputWithMaxDate
                        value={filterValues?.endDate}
                        onChange={(date) => {
                            setFilterValues((prev) => ({ ...prev, endDate: date }));
                        }}
                    />
                </div>
            </div>
            <div className="attendance_graph_wrapper">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={stockOutGraphData}
                        margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
                    >
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};

export default SellGraphLine;
