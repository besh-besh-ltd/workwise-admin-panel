import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";
import DataCard from "./card";
import { handleDashboardAnalyticsList } from "@/utils/services/dashboard";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

interface AnalyticsData {
  total_user?: number;
  new_user?: number;
  active_user?: number;
  total_buyers?: number;
  total_vendor?: number;
  paid_users?: number;
  total_rfq?: number;
  active_rfq?: number;
  total_other?: number;
  total_product?: number;
}

interface DataPoint {
  y: number;
  color: string;
  percentage?: number | string;
}

const HomePage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  let dataPoint: DataPoint[];
  let total = 0;

  const firstData = 22 + "%";
  const labels = [firstData, 38, 5, 25, 10];
  const data = {
    labels,
    datasets: [
      {
        data: [65, 59, 80, 81, 56],
        backgroundColor: [
          "#1A5F8F",
          "#0B436A",
          "#FCC21F",
          "#5BACE4",
          "#2C83C0"
        ],
        barThickness: 20
      }
    ]
  };

  const pyramidOptions = {
    legend: {
      horizontalAlign: "right",
      verticalAlign: "center",
      reversed: true
    },
    toolTip: {
      enabled: true
    },
    data: [
      {
        type: "pyramid",
        showInLegend: false,
        legendText: false,
        indexLabelFontSize: 12,
        indexLabel: "({percentage}%)",
        toolTipContent: false,

        dataPoints: [
          { y: 2000, color: "#0B436A" },
          { y: 4000, color: "#1A5F8F" },
          { y: 6000, color: "#2C83C0" },
          { y: 8000, color: "#5BACE4" },
          { y: 10000, color: "#FCC21F" }
        ] as DataPoint[]
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        display: false
      }
    },

    scales: {
      x: {
        grid: {
          drawBorder: false,
          display: false
        }
      },

      y: {
        min: 0,
        max: 90,
        ticks: {
          stepSize: 30,
          display: false,
          beginAtZero: true
        }
      }
    }
  };

  dataPoint = pyramidOptions.data[0].dataPoints;

  for (let i = 0; i < dataPoint.length; i++) {
    total += dataPoint[i].y;
    if (i === 0) {
      pyramidOptions.data[0].dataPoints[i].percentage = 100;
    } else {
      pyramidOptions.data[0].dataPoints[i].percentage = (
        (dataPoint[i].y / total) *
        100
      ).toFixed(2);
    }
  }

  const getAnalyticsData = () => {
    handleDashboardAnalyticsList()
      .then((res : any) => {
        setAnalyticsData(res?.data);
      })
      .catch((error) => {
        let txt = "";
        for (const x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
      });
  };

  useEffect(() => {
    getAnalyticsData();
  }, []);

  const calculateUnpaidUsers = (): number => {
    if (!analyticsData) return 0;
    const totalBuyers = parseInt(String(analyticsData?.total_buyers || 0));
    const totalOther = parseInt(String(analyticsData?.total_other || 0));
    const paidUsers = parseInt(String(analyticsData?.paid_users || 0));
    return totalBuyers + totalOther - paidUsers;
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0 text-dark">Analytics Dashboard</h1>
              <p className="m-0">Click on each metric for detailed report view</p>
            </div>
            <div className="col-sm-6">
              <div className="d-flex justify-content-end">
                <div className="btn btn-info">Last 30 Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <DataCard
              color={"bg-deep-blue"}
              name={"Total Users"}
              value={analyticsData?.total_user}
            />
            <DataCard color={"bg-yellow"} name={"New Users"} value={analyticsData?.new_user} />
            <DataCard
              color={"bg-deep-blue"}
              name={"Active Users"}
              value={analyticsData?.active_user}
            />
            <DataCard color={"bg-yellow"} name={"Total Buyers"} value={analyticsData?.total_buyers} />
            <DataCard
              color={"bg-deep-blue"}
              name={"Total Vendors"}
              value={analyticsData?.total_vendor}
            />
            <DataCard color={"bg-yellow"} name={"Paid Users"} value={analyticsData?.paid_users} />
            <DataCard
              color={"bg-deep-blue"}
              name={"Unpaid Users"}
              value={calculateUnpaidUsers()}
            />
            <DataCard color={"bg-yellow"} name={"Total RFQs"} value={analyticsData?.total_rfq} />
            <DataCard
              color={"bg-deep-blue"}
              name={"Active RFQs"}
              value={analyticsData?.active_rfq}
            />
            <DataCard color={"bg-yellow"} name={"Other Users"} value={analyticsData?.total_other} />
            <DataCard
              color={"bg-deep-blue"}
              name={"Total Products"}
              value={analyticsData?.total_product}
            />
          </div>
          <div className="row mt-3">
            <div className="col-lg-8 col-sm-12">
              <div className="chart-box">
                <div className="row">
                  <div className="col-lg-9">
                    <div className="chart-heading">
                      <h3>Most Searched Products</h3>
                    </div>
                    <Bar data={data} options={options} />
                  </div>
                  <div className="col-lg-3 mt-5">
                    <div className="bar-chart-label d-flex">
                      <span
                        style={{ backgroundColor: "#0B436A" }}
                        className="bar-color"
                      ></span>
                      <h4>Canada</h4>
                    </div>
                    <div className="bar-chart-label d-flex">
                      <span
                        style={{ backgroundColor: "#1A5F8F" }}
                        className="bar-color"
                      ></span>
                      <h4>UK</h4>
                    </div>
                    <div className="bar-chart-label d-flex">
                      <span
                        style={{ backgroundColor: "#2C83C0" }}
                        className="bar-color"
                      ></span>
                      <h4>USA</h4>
                    </div>
                    <div className="bar-chart-label d-flex">
                      <span
                        style={{ backgroundColor: "#FCC21F" }}
                        className="bar-color"
                      ></span>
                      <h4>Germany</h4>
                    </div>
                    <div className="bar-chart-label d-flex">
                      <span
                        style={{ backgroundColor: "#5BACE4" }}
                        className="bar-color"
                      ></span>
                      <h4>Australia</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
