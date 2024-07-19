import React from "react";
import Link from "next/link";
const DataCard = ({ color, name, value }) => {
  return (
    <div className="col-lg-4 col-6">
      <div className={`small-box ${color}`}>
        <div className="inner ">
          <p>{name}</p>
          <h3>{value}</h3>
        </div>
        <div className="icon">
          <i className="ion ion-bag"></i>
        </div>
        <Link href="#" className="small-box-footer">
          More info <i className="fa fa-arrow-circle-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default DataCard;
