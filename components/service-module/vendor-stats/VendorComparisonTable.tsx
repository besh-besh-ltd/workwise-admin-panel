import React from "react";
import { formatResponseTime, formatDeliveryPeriod } from "./utils";

interface VendorInfo {
  name?: string;
  company_name?: string;
}

interface VendorDetail {
  vendor?: VendorInfo;
  avg_response_minutes?: number;
  awards?: number;
  regrets?: number;
  tech_eval_accepted?: number;
  tech_eval_rejected?: number;
  clauses_agreed?: number;
  clauses_responded?: number;
  queries_raised?: number;
  queries_by_vendor?: number;
  avg_delivery_period?: number;
}

interface VendorDetails {
  [vendorId: string]: VendorDetail;
}

interface VendorComparisonTableProps {
  vendorIds: string[];
  vendorDetails: VendorDetails;
}

interface ComparisonData {
  vendorId: string;
  name: string;
  company: string;
  responseTime: string;
  awards: number;
  regrets: number;
  techEvalAccepted: number;
  techEvalRejected: number;
  techEvalTotal: number;
  techEvalSuccessRate: string | number;
  clausesAgreed: number;
  clausesResponded: number;
  clausesAgreementRate: string | number;
  queriesRaised: number;
  queriesByVendor: number;
  avgDelivery: string;
}

const VendorComparisonTable: React.FC<VendorComparisonTableProps> = ({
  vendorIds,
  vendorDetails,
}) => {
  const comparisonData: ComparisonData[] = vendorIds.map((vendorId) => {
    const detail = vendorDetails[vendorId];
    const vendor = detail?.vendor;
    return {
      vendorId,
      name: vendor?.name || "N/A",
      company: vendor?.company_name || "N/A",
      responseTime: formatResponseTime(detail?.avg_response_minutes || 0, detail),
      awards: detail?.awards || 0,
      regrets: detail?.regrets || 0,
      techEvalAccepted: detail?.tech_eval_accepted || 0,
      techEvalRejected: detail?.tech_eval_rejected || 0,
      techEvalTotal:
        (detail?.tech_eval_accepted || 0) + (detail?.tech_eval_rejected || 0),
      techEvalSuccessRate:
        (detail?.tech_eval_accepted || 0) + (detail?.tech_eval_rejected || 0) > 0
          ? (
              ((detail?.tech_eval_accepted || 0) /
                ((detail?.tech_eval_accepted || 0) +
                  (detail?.tech_eval_rejected || 0))) *
              100
            ).toFixed(1)
          : 0,
      clausesAgreed: detail?.clauses_agreed || 0,
      clausesResponded: detail?.clauses_responded || 0,
      clausesAgreementRate:
        (detail?.clauses_responded || 0) > 0
          ? (
              ((detail?.clauses_agreed || 0) / (detail?.clauses_responded || 0)) *
              100
            ).toFixed(1)
          : 0,
      queriesRaised: detail?.queries_raised || 0,
      queriesByVendor: detail?.queries_by_vendor || 0,
      avgDelivery: formatDeliveryPeriod(detail?.avg_delivery_period || 0),
    };
  });

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Metric</th>
            {comparisonData.map((data) => (
              <th key={data.vendorId} className="text-center">
                <div className="fw-bold">{data.name}</div>
                <small className="text-muted">{data.company}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="fw-semibold">Response Time</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-info">{data.responseTime}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Awards</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-success">{data.awards}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Regrets</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-danger">{data.regrets}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Tech Eval Accepted</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-success">{data.techEvalAccepted}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Tech Eval Rejected</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-danger">{data.techEvalRejected}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Tech Eval Success Rate</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-primary">{data.techEvalSuccessRate}%</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Clauses Agreed</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-info">{data.clausesAgreed}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Clause Agreement Rate</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-primary">{data.clausesAgreementRate}%</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Queries Raised</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-warning">{data.queriesRaised}</span>
              </td>
            ))}
          </tr>
          <tr>
            <td className="fw-semibold">Avg Delivery Period</td>
            {comparisonData.map((data) => (
              <td key={data.vendorId} className="text-center">
                <span className="badge bg-secondary">{data.avgDelivery}</span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VendorComparisonTable;
