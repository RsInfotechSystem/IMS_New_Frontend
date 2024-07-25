"use client";
import React, { useEffect, useReducer, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { communication } from '@/services/communication';


// Register Chart.js components and plugins
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Predefined palette of good colors
const colorPalette = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#FFCD56', '#4BC0C0',
  '#F7464A', '#46BFBD', '#FDB45C', '#949FB1',
  '#4D5360', '#AC64AD', '#7DCEA0', '#D7BDE2'
];

// Function to get colors from the palette
const getColors = (numColors) => {
  return colorPalette.slice(0, numColors);
};

const Report = () => {
  const [CategoryGraphData, setCategoryGraphData] = useState({ labels: [], dataset: [] });
  const [BrandGraphData, setBrandGraphData] = useState({ labels: [], dataset: [] });
  const [StatusGraphData, setStatusGraphData] = useState({ labels: [], dataset: [] });
  const [LocationGraphData, setLocationGraphData] = useState({ labels: [], dataset: [] });
  const [stockOutGraphData, setStockOutGraphData] = useState({ labels: [], count: [] });

  const router = useRouter(); // Initialize the router
  const [state, setState] = useReducer((state, newState) => ({ ...state, ...newState }), {
    _categoryData: [],
    _stockStatusData: [],
    _brandData: [],
    _locationData: [],
    _StockOutData: [],
    startDate: null,
    endDate: null,
    isBelow15Days: true,
  });
  const handlePieClick = (event, elements) => {
    if (elements.length > 0) {
      const clickedElementIndex = elements[0].index;
      const clickedLabel = event.chart.data.labels[clickedElementIndex]; 
      router.push(`/dashboard/report/report-details?label=${encodeURIComponent(clickedLabel)}`);
    }
  };

  const options = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
      datalabels: {
        color: 'white',
        anchor: 'center',
        align: 'center',
        font: {
          weight: 'bold',
          size: 14,
        },
      },
    },
    onClick: handlePieClick, // Pass the handler
  });

  async function MaterialByCategory(category) {
    try {
      const serverResponse = await communication.MaterialByCategory({ category });
      if (serverResponse?.data?.status === "SUCCESS") {
        setState({ _categoryData: serverResponse.data.categroyCount });
        setCategoryGraphData({
          labels: serverResponse.data.categroyCount.map((category) => category.category),
          dataset: serverResponse.data.categroyCount.map((quantities) => quantities.count),
        });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
      } else {
        toast.info(serverResponse.data.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    }
  }
  async function MaterialByStockStatus(status) {
    try {
      const serverResponse = await communication.MaterialByStockStatus({ status });
      if (serverResponse?.data?.status === "SUCCESS") {
        setState({ _stockStatusData: serverResponse.data.stockStatusCount });
        setStatusGraphData({
          labels: serverResponse.data.stockStatusCount.map((status) => status.stockStatus),
          dataset: serverResponse.data.stockStatusCount.map((quantities) => quantities.count),
        });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        // router.push("/");
      } else {
        toast.info(serverResponse.data.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    }
  }
  async function MaterialByBrand(brand) {
    try {
      const serverResponse = await communication.MaterialByBrand({ brand });
      if (serverResponse?.data?.status === "SUCCESS") {
        setState({ _brandData: serverResponse.data.brandCount });
        setBrandGraphData({
          labels: serverResponse.data.brandCount.map((brand) => brand.brand),
          dataset: serverResponse.data.brandCount.map((quantities) => quantities.count),
        });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        // router.push("/");
      } else {
        toast.info(serverResponse.data.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    }
  }
  async function MaterialByLocation(location) {
    try {
      const serverResponse = await communication.MaterialByLocation({ location });
      if (serverResponse?.data?.status === "SUCCESS") {
        setState({ _locationData: serverResponse.data.locationCount });
        setLocationGraphData({
          labels: serverResponse.data.locationCount.map((location) => location.location),
          dataset: serverResponse.data.locationCount.map((quantities) => quantities.count),
        });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        // router.push("/");
      } else {
        toast.info(serverResponse.data.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    }
  }
  const pieData1 = {
    labels: CategoryGraphData.labels,
    datasets: [{
      label: "Quantity",
      data: CategoryGraphData.dataset,
      backgroundColor: getColors(CategoryGraphData.labels.length),
      borderColor: getColors(CategoryGraphData.labels.length),
      borderWidth: 1,
    }],
  };

  const pieData2 = {
    labels: BrandGraphData.labels,
    datasets: [{
      label: "Quantity",
      data: BrandGraphData.dataset,
      backgroundColor: getColors(BrandGraphData.labels.length),
      borderColor: getColors(BrandGraphData.labels.length),
      borderWidth: 1,
    }],
  };

  const pieData3 = {
    labels: StatusGraphData.labels,
    datasets: [{
      label: "Quantity",
      data: StatusGraphData.dataset,
      backgroundColor: getColors(StatusGraphData.labels.length),
      borderColor: getColors(StatusGraphData.labels.length),
      borderWidth: 1,
    }],
  };

  const pieData4 = {
    labels: LocationGraphData.labels,
    datasets: [{
      label: "Quantity",
      data: LocationGraphData.dataset,
      backgroundColor: getColors(LocationGraphData.labels.length),
      borderColor: getColors(LocationGraphData.labels.length),
      borderWidth: 1,
    }],
  };
  async function getStockOutCount() {
    try {
      const serverResponse = await communication.getStockOutCount({
        startDate: state.startDate,
        endDate: state.endDate,
      });
      if (serverResponse?.data?.status === "SUCCESS") {
        // setReport(serverResponse?.data?.report);
        setState({ _StockOutData: serverResponse.data.report });
        // setState({ _locationData: serverResponse.data.locationCount });
        setStockOutGraphData({
          labels: serverResponse.data.report.map((label) => label.label),
          count: serverResponse.data.report.map((count) => count.count),
        });
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
      } else {
        toast.info(serverResponse.data.message);
      }
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
    }
  }
  useEffect(() => {
    if (
      (state.startDate == null && state.endDate == null) ||
      (state.startDate && state.endDate && state.isBelow15Days)
    )
      getStockOutCount();
  }, [state.startDate, state.endDate]);

  useEffect(() => {
    MaterialByCategory();
    MaterialByStockStatus();
    MaterialByBrand();
    MaterialByLocation();
  }, []);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
      <div style={{ width: '35%', margin: '20px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', backgroundColor: 'white' }}>
        <h5 style={{ textAlign: 'center' }}>Category Wise Stock</h5>
        <Pie data={pieData1} options={options('Category Wise Stock')} />
      </div>
      <div style={{ width: '35%', margin: '20px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', backgroundColor: 'white' }}>
        <h5 style={{ textAlign: 'center' }}>Brand Wise Stock</h5>
        <Pie data={pieData2} options={options('Brand Wise Stock')} />
      </div>
      <div style={{ width: '35%', margin: '20px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', backgroundColor: 'white' }}>
        <h5 style={{ textAlign: 'center' }}>Status Wise Stock</h5>
        <Pie data={pieData3} options={options('Status Wise Stock')} />
      </div>
      <div style={{ width: '35%', margin: '20px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', backgroundColor: 'white' }}>
        <h5 style={{ textAlign: 'center' }}>Location Wise Stock</h5>
        <Pie data={pieData4} options={options('Location Wise Stock')} />
      </div>
    </div>
  );
};

export default Report;
