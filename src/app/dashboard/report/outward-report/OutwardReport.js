"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import ApexCharts with SSR disabled
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const OutwardReport = () => {
    // Simulated 80+ stock categories for testing
    const stockCategories = Array.from({ length: 85 }, (_, i) => `Category ${i + 1}`);
    const stockData = Array.from({ length: 85 }, () => Math.floor(Math.random() * 100) + 1);

    const options = {
        chart: {
            height: 400,
            type: "bar",
            toolbar: { show: true },
            zoom: { enabled: false },
        },
        title: {
            text: "Day-wise Stock Summary",
            align: "center",
            style: {
                fontSize: "18px",
                color: "#184965",
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "40%",
                distributed: true,
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: stockCategories,
            labels: {
                rotate: -45,
                style: {
                    colors: "#333",
                    fontSize: "11px",
                },
            },
            tickPlacement: "on",
            scrollable: true,
        },
        yaxis: {
            title: {
                text: "Stock Units",
                style: {
                    color: "#184965",
                },
            },
        },
        grid: {
            borderColor: "#e0e0e0",
            row: {
                colors: ["#fff", "#f9f9f9"],
            },
        },
        fill: {
            type: "solid",
            colors: ["#184965"],
        },
        tooltip: {
            theme: "light",
            y: {
                formatter: (number) => `${number} units`,
            },
        },
    };

    const series = [
        {
            name: "Stock",
            data: stockData,
        },
    ];

    return (
        <div className="overflow-x-auto p-2 ">
            <div style={{ minWidth: "2000px" }}>
                <Chart options={options} series={series} type="bar" height={400} />
            </div>
        </div>
    );
};

export default OutwardReport;