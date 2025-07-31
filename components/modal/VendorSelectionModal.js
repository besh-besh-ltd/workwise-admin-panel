import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';

const VendorSelectionModal = ({
  isOpen,
  onClose,
  onSendReminder,
  vendors = [],
  loading = false
}) => {
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedVendors([]);
    }
  }, [isOpen]);

  // Calculate total products and handle duplicate names
  const { totalGlobalProducts, processedVendors } = useMemo(() => {
    let totalGlobal = 0;
    const processed = vendors.map(vendor => {
      const remainingProducts = vendor.remainingProducts || [];
      totalGlobal += remainingProducts.length;
      
      // Handle duplicate product names
      const productNameCounts = {};
      const processedProducts = remainingProducts.map(product => {
        const productKey = product.name;
        if (!productNameCounts[productKey]) {
          productNameCounts[productKey] = 0;
        }
        productNameCounts[productKey]++;
        
        const displayName = productNameCounts[productKey] === 1 
          ? product.name 
          : `${product.name} - ${productNameCounts[productKey] - 1}`;
        
        return {
          ...product,
          displayName
        };
      });
      
      return {
        ...vendor,
        remainingProducts: processedProducts,
        totalVendorProducts: remainingProducts.length
      };
    });
    
    return { totalGlobalProducts: totalGlobal, processedVendors: processed };
  }, [vendors]);

  const handleVendorToggle = (vendorId) => {
    setSelectedVendors(prev => {
      if (prev.includes(vendorId)) {
        return prev.filter(id => id !== vendorId);
      } else {
        return [...prev, vendorId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === vendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(vendors.map(vendor => vendor.user_id));
    }
  };

  const handleSendReminder = async () => {
    if (selectedVendors.length === 0) return;
    
    setSendLoading(true);
    try {
      await onSendReminder(selectedVendors);
      onClose();
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Select Vendors for Reminder</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading vendors...</span>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No vendors found who haven't submitted quotes yet.</p>
          </div>
        ) : (
          <>
            {/* Global Summary */}
            <div className="alert alert-info mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Total Products Pending:</strong> {totalGlobalProducts}
                </div>
                <div>
                  <strong>Total Vendors:</strong> {vendors.length}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAll"
                  checked={selectedVendors.length === vendors.length}
                  onChange={handleSelectAll}
                />
                <label className="form-check-label fw-bold" htmlFor="selectAll">
                  Select All ({vendors.length} vendors)
                </label>
              </div>
            </div>
            
            <div className="border-top pt-3">
              <div className="row">
                {processedVendors.map((vendor) => (
                  <div key={vendor.user_id} className="col-12 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`vendor-${vendor.user_id}`}
                            checked={selectedVendors.includes(vendor.user_id)}
                            onChange={() => handleVendorToggle(vendor.user_id)}
                          />
                          <label className="form-check-label w-100" htmlFor={`vendor-${vendor.user_id}`}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="mb-0 fw-bold text-primary">{vendor.vendor_name}</h6>
                                  <span className="badge bg-warning text-dark">
                                    {vendor.totalVendorProducts} pending
                                  </span>
                                </div>
                                {vendor.remainingProducts?.length > 0 && (
                                  <div className="mt-3">
                                    <small className="text-info fw-semibold d-block mb-2">
                                      Pending Products ({vendor.totalVendorProducts}):
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                      {vendor.remainingProducts.slice(0, 4).map((product, idx) => (
                                        <span key={idx} className="badge bg-light text-dark border me-1 mb-1">
                                          {product.displayName}
                                        </span>
                                      ))}
                                      {vendor.remainingProducts.length > 4 && (
                                        <span className="badge bg-info text-white">
                                          +{vendor.remainingProducts.length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={sendLoading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSendReminder}
          disabled={selectedVendors.length === 0 || sendLoading || loading}
        >
          {sendLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending...
            </>
          ) : (
            `Send Reminder to ${selectedVendors.length} vendor${selectedVendors.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VendorSelectionModal; 