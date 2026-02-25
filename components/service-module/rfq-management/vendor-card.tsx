import React from 'react'
import { Badge } from 'react-bootstrap'

interface QuotationDetail {
    is_regret: number;
    unit_price?: number;
    total_price?: number;
}

interface Finalization {
    vendor_id: number;
}

interface ProductSpec {
    title: string;
    value: string;
}

interface Product {
    product_id: number;
    variant: number;
    product_name: string;
    product_specs?: ProductSpec[];
    quotation_details: QuotationDetail[] | null;
    finalization: Finalization | null;
}

interface VendorData {
    vendor_id: number;
    vendor_name: string;
    vendor_email: string;
    vendor_mobile: string;
    vendor_organization: string;
    is_private: number;
    subscription_plan_id: number | null;
    products?: Product[];
}

interface VendorCardProps {
    data: VendorData;
}

interface VendorStats {
    totalProducts: number;
    quoteSent: number;
    totalRegrets: number;
    quotePending: number;
    totalFinalization: number;
}

const VendorCard: React.FC<VendorCardProps> = ({ data }) => {
    const addCommasToNumber = (number: number): string | number => {
        if(number<=0 || !number){
           return 0
         }

        let numberString = number.toString();
        let parts = numberString.split(".");

        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      };

    // Calculate vendor stats from products
    const calculateVendorStats = (): VendorStats => {
        if (!data?.products || data.products.length === 0) {
            return {
                totalProducts: 0,
                quoteSent: 0,
                totalRegrets: 0,
                quotePending: 0,
                totalFinalization: 0
            };
        }

        let quoteSent = 0;
        let totalRegrets = 0;
        let quotePending = 0;
        let totalFinalization = 0;

        data.products.forEach(product => {
            if (product.quotation_details && product.quotation_details.length > 0) {
                const quotation = product.quotation_details[0];
                if (quotation.is_regret === 1) {
                    totalRegrets++;
                } else if (quotation.unit_price && quotation.unit_price > 0) {
                    quoteSent++;
                } else {
                    quotePending++;
                }
            } else {
                quotePending++;
            }

            // Check if this vendor is finalized for this product
            if (product.finalization && product.finalization.vendor_id === data.vendor_id) {
                totalFinalization++;
            }
        });

        return {
            totalProducts: data.products.length,
            quoteSent,
            totalRegrets,
            quotePending,
            totalFinalization
        };
    };

    const vendorStats = calculateVendorStats();

    return (
        <>
            <div className="col-12 p-3 mb-3 border shadow-sm">
                <h3 className="fs-5">{data?.vendor_organization}</h3>

                {/* Company Details Section */}
                <div className="row mb-2">
                    <div className="col-md-3 col-lg-5">
                        <strong>Vendor Name : </strong>
                        <span className="fw-medium text-muted px-2">{data?.vendor_name || "---"}</span>
                    </div>
                    <div className="col-md-3 col-lg-4">
                        <strong>Vendor Email : </strong>
                        <span className="fw-medium text-muted px-2">{data?.vendor_email || "---"}</span>
                    </div>
                    <div className="col-md-3 col-lg-3">
                        <strong>Phone No : </strong>
                        <span className="fw-medium text-muted px-2">{data?.vendor_mobile || "---"}</span>
                    </div>
                </div>
                {/* {(data?.is_private || data?.subscription_plan_id === 20) && ( */}
                {true && (
                    <div className="mb-2" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        {/* Left Side Info */}
                        <div className="d-flex flex-column gap-3">
                            {data?.is_private  === 1 && (
                            // {true && (
                                <Badge bg='success' className="small px-2 py-1 text-uppercase">
                                    Private vendor
                                </Badge>
                            )}
                            {data?.subscription_plan_id && (
                            // {true && (
                                <Badge bg='primary' className="small px-2 py-1 text-uppercase">
                                    Premium Vendor
                                </Badge>
                            )}
                        </div>

                        {/* Right side Info */}
                        <div className="mt-2" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr'}}>
                             <div className="mr-4 mb-2" style={{gridArea:'1/1'}}>
                                <strong>Requested Products: </strong>
                                <span className="badge badge-primary ml-2">{vendorStats.totalProducts}</span>
                            </div>
                             <div className="mr-4 mb-2" style={{gridArea:'1/2'}}>
                                <strong>Quotes Submitted: </strong>
                                <span className="badge badge-success ml-2">{vendorStats.quoteSent}</span>
                            </div>
                             <div className="mr-4 mb-2" style={{gridArea:'1/3'}}>
                                <strong>Declined Request: </strong>
                                <span className="badge badge-danger ml-2">{vendorStats.totalRegrets}</span>
                            </div>
                             <div className="mr-4 mb-2" style={{gridArea:'2/1'}}>
                                <strong>Pending Responses: </strong>
                                <span className="badge badge-secondary ml-2">{vendorStats.quotePending}</span>
                            </div>
                             <div className="mr-4 mb-2" style={{gridArea:'2/2'}}>
                                <strong>Finalized Orders: </strong>
                                <span className="badge badge-info ml-2">{vendorStats.totalFinalization}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Details Section */}
                {data.products &&
                    <div className="row">
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr className="text-nowrap">
                                        <th>Sl No.</th>
                                        <th>Product Name</th>
                                        <th>Size</th>
                                        <th>Specifications</th>
                                        <th>Quantity</th>
                                        <th>Quote Sent</th>
                                        <th>Total Price</th>
                                        <th>Finalization</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.products.map((prodItem, index) => {
                                        let prod_size: string | undefined, prod_spec: string | undefined, prod_qty: string | undefined, prod_unit: string | undefined;
                                        prodItem?.product_specs?.forEach(({ title, value }) => {
                                            if (title === "Spec") prod_spec = value;
                                            else if (title === "Size") prod_size = value;
                                            else if (title === "Quantity") prod_qty = value;
                                            else prod_unit = value;
                                        });

                                        return (
                                            <tr key={`prod_${prodItem.product_id}_${prodItem.variant}`}>
                                                <td>{index + 1}</td>
                                                <td>{prodItem.product_name || "---"}</td>
                                                <td>{prod_size}</td>
                                                <td>{prod_spec}</td>
                                                <td>{prod_qty + " " + prod_unit}</td>
                                                <td>
                                                    {(prodItem.quotation_details && prodItem.quotation_details.length > 0)
                                                        ? (prodItem.quotation_details[0]?.is_regret ? <span className="badge badge-danger">Regretted</span>
                                                            : ((prodItem.quotation_details[0]?.unit_price && prodItem.quotation_details[0]?.unit_price > 0) ? <span className="badge badge-success">Sent</span> : <span className="badge badge-warning">Pending</span>))
                                                        : <span className="badge badge-warning">Pending</span>
                                                    }
                                                </td>
                                                <td>
                                                    {(prodItem?.quotation_details && prodItem?.quotation_details?.length > 0 && prodItem?.quotation_details[0]?.unit_price && prodItem?.quotation_details[0]?.unit_price > 0) ?
                                                        addCommasToNumber(prodItem?.quotation_details[0]?.total_price || 0) : "-"
                                                    }
                                                </td>
                                                <td>
                                                    {prodItem?.finalization
                                                        ? prodItem?.finalization?.vendor_id === data.vendor_id
                                                            ? <span className="badge badge-success p-2">This vendor is Finalized</span>
                                                            : <span className="badge badge-danger p-2">Other Vendor Finalized.</span>
                                                        : <span className="badge badge-warning p-2">Not Finalized</span>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default VendorCard
