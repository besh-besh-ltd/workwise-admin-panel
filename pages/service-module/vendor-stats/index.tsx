import React from "react";
import dynamic from "next/dynamic";

const VendorStatsDashboard = dynamic(
  () => import("@/components/service-module/vendor-stats/VendorStatsDashboard"),
  { ssr: false }
);

const VendorStatsPage: React.FC = () => {
  return (
    <div>
      <VendorStatsDashboard />
    </div>
  );
};

export default VendorStatsPage;
