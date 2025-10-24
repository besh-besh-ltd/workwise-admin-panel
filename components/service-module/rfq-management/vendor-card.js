import React from 'react'

const VendorCard = ({ data }) => {
    const addCommasToNumber = (number) => {
        if(number<=0 || !number){
           return 0
         }

        let numberString = number.toString();
        let parts = numberString.split(".");
    
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
      };

    return (
        <>
            <div className="col-12 p-3 mb-3 border shadow-sm">
                <h3 className="fs-5 mb-2">{data?.vendor_organization}</h3>

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
                            <table className="table">
                                <thead>
                                    <tr className="text-nowrap">
                                        <th>Sl No.</th>
                                        <th>Item</th>
                                        <th>Size</th>
                                        <th>Specifications</th>
                                        <th>Qty</th>
                                        <th>Quote Sent</th>
                                        <th>Total Price</th>
                                        <th>Finalization</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        let rowIndex = 0;

                                        const extractSpecs = (product) => {
                                            let prod_size, prod_spec, prod_qty, prod_unit;
                                            (product?.product_specs || []).forEach(({ title, value }) => {
                                                if (title === 'Spec') prod_spec = value;
                                                else if (title === 'Size') prod_size = value;
                                                else if (title === 'Quantity') prod_qty = value;
                                                else if (title === 'Unit') prod_unit = value;
                                            });
                                            return { prod_size, prod_spec, prod_qty, prod_unit };
                                        };

                                        const getEffectiveQuote = (item) => {
                                            if (item?.quotation_details && item.quotation_details.length > 0) return item.quotation_details[0];
                                            const lineChildren = (item?.associated_items || []).filter(c => c.item_type === 'LINE ITEM');
                                            if (lineChildren.length > 0 && lineChildren[0]?.quotation_details?.length > 0) return lineChildren[0].quotation_details[0];
                                            return null;
                                        };

                                        const getEffectiveSpecs = (item) => {
                                            const own = extractSpecs(item);
                                            if (own.prod_size || own.prod_spec || own.prod_qty) return own;
                                            const lineChildren = (item?.associated_items || []).filter(c => c.item_type === 'LINE ITEM');
                                            for (const li of lineChildren) {
                                                const s = extractSpecs(li);
                                                if (s.prod_size || s.prod_spec || s.prod_qty) return s;
                                            }
                                            return own;
                                        };

                                        const renderRows = (items, level = 0, isTop = true) => {
                                            if (!Array.isArray(items)) return null;
                                            return items
                                                .filter((it) => it.item_type !== 'LINE ITEM')
                                                .map((prodItem) => {
                                                const { prod_size, prod_spec, prod_qty, prod_unit } = getEffectiveSpecs(prodItem);
                                                const quote = getEffectiveQuote(prodItem);
                                                const hasQuote = !!quote;

                                                const showIndex = isTop ? (++rowIndex) : '';

                                                const keySuffix = `${prodItem.id || prodItem.product_id || 'x'}_${showIndex || rowIndex}_${level}`;
                                                return (
                                                    <React.Fragment key={`prod_${keySuffix}`}>
                                                        <tr>
                                                            <td>{showIndex}</td>
                                                            <td style={{ paddingLeft: `${level * 20}px` }}>
                                                                {level > 0 && <span className="text-muted me-2">{Array(level).fill('—').join('')}</span>}
                                                                <span className="fw-semibold">{prodItem.product_name || prodItem.name || '---'}</span>
                                                                {prodItem?.item_type && <span className="badge bg-light text-dark ms-2">{prodItem.item_type}</span>}
                                                                {Array.isArray(prodItem?.associated_items) && prodItem.associated_items.some(c => c.item_type === 'LINE ITEM') && (
                                                                    <div className="mt-2 small text-muted">
                                                                        {(prodItem.associated_items || []).filter(c => c.item_type === 'LINE ITEM').map((child, idx) => {
                                                                            const { prod_size: cs, prod_spec: cp, prod_qty: cq, prod_unit: cu } = extractSpecs(child);
                                                                            return (
                                                                                <div key={`li_${child.id || idx}`} className="d-flex align-items-center" style={{ paddingLeft: `${12}px` }}>
                                                                                    <span className="me-2">—</span>
                                                                                    <span className="fw-medium me-2">{child.product_name || child.name}</span>
                                                                                    <span className="badge bg-light text-dark">LINE ITEM</span>
                                                                                    {(cq || cs || cp) && <span className="ms-2 text-secondary">{[cq ? `${cq} ${cu || ''}` : null, cs, cp].filter(Boolean).join(' | ')}</span>}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>{prod_size}</td>
                                                            <td>{prod_spec}</td>
                                                            <td>{prod_qty ? `${prod_qty} ${prod_unit || ''}` : ''}</td>
                                                            <td>
                                                                {hasQuote
                                                                    ? (quote?.is_regret ? <span className="badge badge-danger">Regretted</span>
                                                                        : ((quote?.unit_price > 0 || quote?.total_price > 0) ? <span className="badge badge-success">Sent</span> : <span className="badge badge-warning">Pending</span>))
                                                                    : <span className="badge badge-warning">Pending</span>}
                                                            </td>
                                                            <td>{hasQuote && (quote?.unit_price > 0 || quote?.total_price > 0) ? addCommasToNumber(quote?.total_price || 0) : '-'}</td>
                                                            <td>
                                                                {prodItem?.finalization
                                                                    ? prodItem?.finalization?.vendor_id === data.vendor_id
                                                                        ? <span className="badge badge-success p-2">This vendor is Finalized</span>
                                                                        : <span className="badge badge-danger p-2">Other Vendor Finalized.</span>
                                                                    : <span className="badge badge-warning p-2">Not Finalized</span>}
                                                            </td>
                                                        </tr>
                                                        {Array.isArray(prodItem?.associated_items) && prodItem.associated_items.length > 0 && renderRows(prodItem.associated_items.filter(c => c.item_type !== 'LINE ITEM'), level + 1, false)}
                                                    </React.Fragment>
                                                );
                                            });
                                        };

                                        return renderRows(data.products, 0, true);
                                    })()}
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
