import React from "react";

interface ManagementCardProps {
  color: string;
  name: string;
}

const ManagementCard: React.FC<ManagementCardProps> = ({ color, name }) => {
  return (
    <div className="col-lg-3 col-6">
      <a className={`small-box ${color}`} href="#">
        <div className="inner">
          <h5>{name}</h5>
        </div>
      </a>
    </div>
  );
};

export default ManagementCard;
