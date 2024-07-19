import React from "react";
// import { BootstrapTable } from "react-bootstrap-table";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ManagementCard from "./management-card";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

const UserManagement = () => {
  //return;
  let dataPoint;
  let total = 0;

  let firstData = 22 + "%";
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
          "#2C83C0",
        ],
        barThickness: 20,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        // to remove the x-axis grid
        grid: {
          drawBorder: false,
          display: false,
        },
      },

      // to remove the y-axis labels
      y: {
        min: 0,
        max: 90,
        ticks: {
          stepSize: 30,
          display: false,
          beginAtZero: true,
        },
        // to remove the y-axis grid
        // grid: {
        //   drawBorder: false,
        //   display: false,
        // },
      },
    },
  };

  const pyramidOptions = {
    legend: {
      horizontalAlign: "right",
      verticalAlign: "center",
      reversed: true,
    },
    toolTip: {
      enabled: true,
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
          { y: 10000, color: "#FCC21F" },
        ],
      },
    ],
  };

  const indexNum = (cell, row, enumObject, index) => {
    return <div>{index + 1}</div>;
  };
  const addressEdit = (cell, row) => {
    console.log(row);
    return (
      <div>
        {row?.city}, {row?.state}
      </div>
    );
  };

  //calculate percentage
  dataPoint = pyramidOptions.data[0].dataPoints;

  for (var i = 0; i < dataPoint.length; i++) {
    total += dataPoint[i].y;
    if (i === 0) {
      pyramidOptions.data[0].dataPoints[i].percentage = 100;
    } else {
      pyramidOptions.data[0].dataPoints[i].percentage = (
        (dataPoint[i].y / total) *
        100
      ).toFixed(2);
      console.log(pyramidOptions.data[0].dataPoints[i].percentage);
    }
  }
  let BuyerData = [
    {
      buyer_name: "vijit",
      company: "Int",
      email: "vijit@gmail.com",
      contacts: "+917905597148",
      region: "mumbai",
      verification_status: "0",
    },
    {
      buyer_name: "vijit",
      company: "Int",
      email: "vijit@gmail.com",
      contacts: "+917905597148",
      region: "mumbai",
      verification_status: "1",
    },
    {
      buyer_name: "vijit",
      company: "Int",
      email: "vijit@gmail.com",
      contacts: "+917905597148",
      region: "mumbai",
      verification_status: "1",
    },
  ];
  let VendorData = [
    {
      buyer_name: "Vendor A",
      contacts: "+917905597148",
      company: "Int",
      region: "mumbai",
      approval_status: "0",
      verification_status: "0",
    },
    {
      buyer_name: "Vendor B",
      contacts: "+917905597148",
      company: "Int",
      region: "mumbai",
      approval_status: "0",
      verification_status: "0",
    },
    {
      buyer_name: "Vendor C",
      contacts: "+917905597148",
      company: "Int",
      region: "mumbai",
      approval_status: "0",
      verification_status: "0",
    },
  ];
  let ModeratorsData = [
    {
      name: "Moderator A",
      email: "vijit@gmail.com",
      roll: "Roll",
    },
    {
      name: "Moderator A",
      email: "vijit@gmail.com",
      roll: "Roll",
    },
    {
      name: "Moderator A",
      email: "vijit@gmail.com",
      roll: "Roll",
    },
  ];

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark">User Roles and Permissions</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row mangge-row">
            <ManagementCard color={"bg-deep-blue"} name={"Manage Buyers"} />
            <ManagementCard color={"bg-yellow"} name={"Manage Vendors"} />
            <ManagementCard color={"bg-deep-blue"} name={"Manage Moderates"} />
          </div>
          <div className="card card-body product-table-body">
            <h5 className="heading-h5">Register Users</h5>
            <p className="heading-p">Recently Registered Buyers</p>
            <div className="product-table">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">Buyer Name</th>
                    <th scope="col">Company</th>
                    <th scope="col">Email</th>
                    <th scope="col">Contacts</th>
                    <th scope="col">Region</th>
                    <th scope="col">Verification Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {BuyerData.map((item) => {
                    return (
                      <tr key={item.name}>
                        <td>{item.buyer_name}</td>
                        <td>{item.company}</td>
                        <td>{item.contacts}</td>
                        <td>{item.email}</td>
                        <td>{item.region}</td>
                        <td>
                          {item.verification_status == 1
                            ? "Verified"
                            : "Unverified"}
                        </td>
                        <td>view</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-end">
              <button class="btn btn-primary">View All</button>
            </div>
          </div>

          <div className="card card-body product-table-body">
            <p className="heading-p">Recently Registered Moderators</p>
            <div className="product-table">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">Vendors</th>
                    <th scope="col">Region</th>
                    <th scope="col">Contacts Infoemation</th>
                    <th scope="col">Industry</th>
                    <th scope="col">Approval Status</th>
                    <th scope="col">Verification Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {VendorData.map((item) => {
                    return (
                      <tr key={item.name}>
                        <td>{item.buyer_name}</td>
                        <td>{item.region}</td>
                        <td>{item.contacts}</td>
                        <td>{item.company}</td>
                        <td>
                          {item.approval_status == 0 ? "Pending" : "Verified"}
                        </td>
                        <td>
                          {item.verification_status == 1
                            ? "Verified"
                            : "Unverified"}
                        </td>
                        <td>view</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-end">
              <button class="btn btn-primary">View All</button>
            </div>
          </div>
          <div className="card card-body product-table-body">
            <p className="heading-p">Recently Registered Vendors</p>
            <div className="product-table">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Roll</th>
                  </tr>
                </thead>
                <tbody>
                  {ModeratorsData.map((item) => {
                    return (
                      <tr key={item.name}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.roll}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-end">
              <button class="btn btn-primary">View All</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserManagement;
