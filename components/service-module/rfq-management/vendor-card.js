import React from 'react'

const VendorCard = ({ data }) => {

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
                                        <th>Finalization</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.products.map((prodItem, index) => {
                                        let prod_size, prod_spec, prod_qty, prod_unit;
                                        prodItem?.product_specs.forEach(({ title, value }) => {
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
                                                        ? <span className="badge badge-success">Sent</span>
                                                        : <span className="badge badge-warning">Pending</span>
                                                    }
                                                </td>
                                                <td>
                                                    {(prodItem?.quotation_details && prodItem?.quotation_details[0]?.finalization)
                                                        ? prodItem?.quotation_details[0]?.finalization?.vendor_id === data.vendor_id
                                                            ? <span className="badge badge-success">This vendor is Finalized</span>
                                                            : <span className="badge badge-info">Other Vendor Finalized.</span>
                                                        : <span className="badge badge-secondary">Not Finalized</span>
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
