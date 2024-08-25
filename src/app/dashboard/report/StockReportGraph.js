"use client";
import React, { useEffect, useReducer, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { communication } from "@/services/communication";
import CustomBtn from "@/common-components/CustomBtn";
import StockFilter from "@/common-components/StockFilter";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportFilterForCategory from "@/common-components/ReportFilterForCategory";

// Register Chart.js components and plugins
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Predefined palette of good colors
const colorPalette = [
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#FFCD56",
  "#4BC0C0",
  "#F7464A",
  "#46BFBD",
  "#FDB45C",
  "#949FB1",
  "#4D5360",
  "#AC64AD",
  "#7DCEA0",
  "#D7BDE2",
];

// Function to get colors from the palette
const getColors = (numColors) => {
  return colorPalette.slice(0, numColors);
};

const StockReportGraph = () => {
  const [CategoryGraphData, setCategoryGraphData] = useState({ labels: [], dataset: [] });
  const [BrandGraphData, setBrandGraphData] = useState({ labels: [], dataset: [] });
  const [StatusGraphData, setStatusGraphData] = useState({ labels: [], dataset: [] });
  const [LocationGraphData, setLocationGraphData] = useState({ labels: [], dataset: [] });
  const [stockOutGraphData, setStockOutGraphData] = useState({ labels: [], count: [] });
  const [modalStates, setModalStates] = useState({ filter: false, modal: false });
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
  const [loader, setLoader] = useState(false);
  const [filter, setFilter] = useState({});
  const handlePieClick = (event, elements) => {
    if (elements.length > 0) {
      const clickedElementIndex = elements[0].index;
      // console.log(clickedElementIndex, "clickedElementIndex");

      let materialDetails = state._categoryData[clickedElementIndex];
      router.push(
        `/dashboard/report/report-details?reportData=${materialDetails._id
        }&reportType=${"category"}`
      );
    }
    // if (elements.length > 0) {
    //   const clickedElementIndex = elements[0].index;
    //   const clickedLabel = event.chart.data.labels[clickedElementIndex];
    //   router.push(`/dashboard/report/report-details?label=${encodeURIComponent(clickedLabel)}`);
    // }
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
        color: "white",
        anchor: "center",
        align: "center",
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
    onClick: handlePieClick, // Pass the handler
  });

  const optionsCategory = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Category Wise Stock",
      },
      datalabels: {
        color: "white",
        anchor: "center",
        align: "center",
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedElementIndex = elements[0].index;

        let materialDetails = state._categoryData[clickedElementIndex];
        router.push(
          `/dashboard/report/report-details?reportData=${materialDetails._id
          }&reportType=${"category"}&selectedType=${materialDetails?.category}`
        );
      }
    },
  };

  const optionsBrand = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Brand Wise Stock",
      },
      datalabels: {
        color: "white",
        anchor: "center",
        align: "center",
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedElementIndex = elements[0].index;
        // console.log(clickedElementIndex, "clickedElementIndex");

        let materialDetails = state._brandData[clickedElementIndex];
        router.push(
          `/dashboard/report/report-details?reportData=${materialDetails._id
          }&reportType=${"brand"}&selectedType=${materialDetails?.brand}`
        );
      }
    },
  };

  const optionsLocation = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Location Wise Stock",
      },
      datalabels: {
        color: "white",
        anchor: "center",
        align: "center",
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedElementIndex = elements[0].index;
        let materialDetails = state._locationData[clickedElementIndex];
        router.push(
          `/dashboard/report/report-details?reportData=${materialDetails?._id
          }&reportType=${"location"}&selectedType=${materialDetails?.location}`
        );
      }
    },
  };

  const optionsStatus = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Status Wise PO",
      },
      datalabels: {
        color: "white",
        anchor: "center",
        align: "center",
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const clickedElementIndex = elements[0].index;
        let materialDetails = state._stockStatusData[clickedElementIndex];
        router.push(
          `/dashboard/report/report-details?reportData=${materialDetails?._id
          }&reportType=${"status"}&selectedType=${materialDetails?.stockStatus}`
        );
      }
    },
  };

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
  async function getCategoryWiseBrandCount(categoryId) {
    try {
      setLoader(true);
      const serverResponse = await communication.getCategoryWiseBrandCount({ categoryId });
      if (serverResponse?.data?.status === "SUCCESS") {
        setState({ _brandData: serverResponse.data.brandCount });
        setBrandGraphData({
          labels: serverResponse.data.brandCount.map((brand) => brand.brand),
          dataset: serverResponse.data.brandCount.map((quantities) => quantities.count),
        });
        // setMaterial(serverResponse?.data.stock);
      } else if (serverResponse?.data?.status === "JWT_INVALID") {
        toast.info(serverResponse.data.message);
        router.push("/");
      } else {
      }
      // setLoader(false);
    } catch (error) {
      toast.info(error?.response?.data?.message || error.message);
      // setLoader(false);
    }
  }
  const pieData1 = {
    labels: CategoryGraphData.labels,
    datasets: [
      {
        label: "Quantity",
        data: CategoryGraphData.dataset,
        backgroundColor: getColors(CategoryGraphData.labels.length),
        borderColor: getColors(CategoryGraphData.labels.length),
        borderWidth: 1,
      },
    ],
  };

  const pieData2 = {
    labels: BrandGraphData.labels,
    datasets: [
      {
        label: "Quantity",
        data: BrandGraphData.dataset,
        backgroundColor: getColors(BrandGraphData.labels.length),
        borderColor: getColors(BrandGraphData.labels.length),
        borderWidth: 1,
      },
    ],
  };

  const pieData3 = {
    labels: StatusGraphData.labels,
    datasets: [
      {
        label: "Quantity",
        data: StatusGraphData.dataset,
        backgroundColor: getColors(StatusGraphData.labels.length),
        borderColor: getColors(StatusGraphData.labels.length),
        borderWidth: 1,
      },
    ],
  };

  const pieData4 = {
    labels: LocationGraphData.labels,
    datasets: [
      {
        label: "Quantity",
        data: LocationGraphData.dataset,
        backgroundColor: getColors(LocationGraphData.labels.length),
        borderColor: getColors(LocationGraphData.labels.length),
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    MaterialByCategory();
    MaterialByStockStatus();
    MaterialByBrand();
    MaterialByLocation();
    // getCategoryWiseBrandCount();
  }, []);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
      {modalStates?.filter && (
        <ReportFilterForCategory
          setModalStates={setModalStates}
          apiCall={getCategoryWiseBrandCount}
          filter={filter}
          setFilter={setFilter}
        />
      )}

      <div className="report_card">
        <h5 style={{ textAlign: "center" }}>Category Wise Stock</h5>
        <Pie data={pieData1} options={optionsCategory} />
      </div>
      <div className="report_card">
        {/* <div className="buttons_wrapper">
          <CustomBtn
            name={"Filter"}
            onClick={() => {
              setModalStates((prev) => ({ ...prev, filter: true }));
            }}
            svg={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 512 512"
                fill="#fff"
              >
                <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
              </svg>
            }
          />
          
        </div> */}
        <div title="Filter" onClick={() => {
          setModalStates((prev) => ({ ...prev, filter: true }));
        }}><FontAwesomeIcon icon={faFilter} /></div>
        <h5 style={{ textAlign: "center" }}>Brand Wise Stock</h5>
        <Pie data={pieData2} options={optionsBrand} />
      </div>
      <div className="report_card">
        <h5 style={{ textAlign: "center" }}>Status Wise Stock</h5>
        <Pie data={pieData3} options={optionsStatus} />
      </div>
      <div className="report_card">
        <h5 style={{ textAlign: "center" }}>Location Wise Stock</h5>
        <Pie data={pieData4} options={optionsLocation} />
      </div>
    </div>
  );
};

export default StockReportGraph;
