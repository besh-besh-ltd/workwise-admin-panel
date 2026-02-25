import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface Product {
  name: string;
  displayName?: string;
}

interface Vendor {
  vendor_id: number;
  vendor_name: string;
  remainingProducts?: Product[];
  totalVendorProducts?: number;
}

interface ProcessedVendor extends Vendor {
  remainingProducts: (Product & { displayName: string })[];
  totalVendorProducts: number;
}

interface VendorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendReminder: (selectedVendors: number[], useMailGun: boolean) => Promise<void>;
  vendors?: Vendor[];
  loading?: boolean;
}

const VendorSelectionModal: React.FC<VendorSelectionModalProps> = ({
  isOpen,
  onClose,
  onSendReminder,
  vendors = [],
  loading = false
}) => {
  const [selectedVendors, setSelectedVendors] = useState<number[]>([]);
  const [sendLoading, setSendLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [useMailGun, setUseMailGun] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedVendors([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fuzzySearch = (companyName: string, searchTerm: string): boolean => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    const companyLower = companyName.toLowerCase();

    let searchIndex = 0;
    for (let i = 0; i < companyLower.length; i++) {
      if (companyLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
      if (searchIndex === searchLower.length) {
        return true;
      }
    }
    return false;
  };

  const filteredVendors = useMemo(() => {
    if (!searchTerm.trim()) return vendors;

    return vendors.filter(vendor => {
      const vendorName = vendor.vendor_name || '';
      return fuzzySearch(vendorName, searchTerm);
    });
  }, [vendors, searchTerm]);

  const { totalGlobalProducts, processedVendors } = useMemo(() => {
    let totalGlobal = 0;
    const processed: ProcessedVendor[] = filteredVendors.map(vendor => {
      const remainingProducts = vendor.remainingProducts || [];
      totalGlobal += remainingProducts.length;

      const productNameCounts: Record<string, number> = {};
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
  }, [filteredVendors]);

  const handleVendorToggle = (vendorId: number) => {
    setSelectedVendors(prev => {
      if (prev.includes(vendorId)) {
        return prev.filter(id => id !== vendorId);
      } else {
        return [...prev, vendorId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(filteredVendors.map(vendor => vendor.vendor_id));
    }
  };

  const handleSendReminder = async () => {
    if (selectedVendors.length === 0) return;

    setSendLoading(true);
    try {
      await onSendReminder(selectedVendors, useMailGun);
      setUseMailGun(false);
      onClose();
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size="lg"
      dialogClassName="vendor-selection-modal"
      centered
      scrollable
    >
      <Modal.Header className="border-bottom">
        <Modal.Title className="fs-5 fw-bold">Select Vendors for Reminder</Modal.Title>
        {!!selectedVendors.length &&
          <div className='d-flex justify-content-center align-items-center gap-2'>
            <input
              id='mail-gun'
              type="checkbox"
              checked={useMailGun}
              className="btn-close mx-1"
              aria-label="send mail via mailgun"
              onClick={() => { setUseMailGun((prev) => !prev) }}
            />
            <label htmlFor="mail-gun" className="m-0">Use MailGun to send Email</label>
          </div>}
      </Modal.Header>

      <Modal.Body className="p-0">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading vendors...</span>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-4 px-3">
            <p className="text-muted mb-0">No vendors found who haven&apos;t submitted quotes yet.</p>
          </div>
        ) : (
          <div className="vendor-modal-content">
            <div className="p-3 border-bottom">
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search vendors by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-pill"
                />
                {searchTerm && (
                  <div className="mt-2 text-muted small">
                    Showing {filteredVendors.length} of {vendors.length} vendors
                  </div>
                )}
              </Form.Group>
            </div>

            <div className="alert alert-info mx-3 mt-3 mb-3">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                <div className="text-center text-sm-start">
                  <strong>Total Products Pending:</strong> {totalGlobalProducts}
                </div>
                <div className="text-center text-sm-end">
                  <strong>Total Vendors:</strong> {filteredVendors.length}
                  {searchTerm && <span className="ms-1">(Filtered)</span>}
                </div>
              </div>
            </div>

            <div className="px-3 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAll"
                  checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                  onChange={handleSelectAll}
                  disabled={filteredVendors.length === 0}
                />
                <label className="form-check-label fw-bold" htmlFor="selectAll">
                  Select All ({filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''})
                </label>
              </div>
            </div>

            <div className="vendor-list-container">
              {filteredVendors.length === 0 ? (
                <div className="text-center py-4 px-3">
                  <p className="text-muted mb-0">
                    {searchTerm ? 'No vendors found matching your search.' : 'No vendors available.'}
                  </p>
                </div>
              ) : (
                <div className="vendor-list">
                  {processedVendors.map((vendor) => (
                    <div key={vendor.vendor_id} className="vendor-card">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                          <div className="form-check h-100">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`vendor-${vendor.vendor_id}`}
                              checked={selectedVendors.includes(vendor.vendor_id)}
                              onChange={() => handleVendorToggle(vendor.vendor_id)}
                            />
                            <label className="form-check-label w-100 h-100" htmlFor={`vendor-${vendor.vendor_id}`}>
                              <div className="d-flex flex-column h-100">
                                <div className="mb-2">
                                  <h6 className="mb-0 fw-bold text-primary text-break">{vendor.vendor_name}</h6>
                                </div>
                                {vendor.remainingProducts?.length > 0 && (
                                  <div className="mt-auto">
                                    <small className="text-muted fw-semibold d-block mb-2">
                                      Pending Products ({vendor.totalVendorProducts}):
                                    </small>
                                    <div className="product-tags">
                                      {vendor.remainingProducts.slice(0, 3).map((product, idx) => (
                                        <span key={idx} className="product-tag">
                                          {product.displayName}
                                        </span>
                                      ))}
                                      {vendor.remainingProducts.length > 3 && (
                                        <span className="product-tag more-tag">
                                          +{vendor.remainingProducts.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-top">
        <div className="d-flex flex-column flex-sm-row gap-2 w-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={sendLoading}
            className="flex-fill"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSendReminder}
            disabled={selectedVendors.length === 0 || sendLoading || loading}
            className="flex-fill"
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
        </div>
      </Modal.Footer>

      <style jsx>{`
        .vendor-selection-modal {
          max-width: 95vw;
          margin: 1rem auto;
        }

        .vendor-modal-content {
          max-height: 60vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .vendor-list-container {
          flex: 1;
          overflow: hidden;
          padding: 0 1rem;
        }

        .vendor-list {
          max-height: 40vh;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .vendor-card {
          margin-bottom: 1rem;
        }

        .product-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .product-tag {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #495057;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          white-space: nowrap;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-tag {
          background-color: #0dcaf0;
          color: white;
          border-color: #0dcaf0;
        }

        @media (max-width: 768px) {
          .vendor-selection-modal {
            max-width: 100vw;
            margin: 0.5rem;
          }

          .vendor-modal-content {
            max-height: 70vh;
          }

          .vendor-list {
            max-height: 50vh;
          }

          .product-tags {
            gap: 0.25rem;
          }

          .product-tag {
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
          }
        }

        @media (max-width: 576px) {
          .vendor-selection-modal {
            margin: 0.25rem;
          }

          .vendor-modal-content {
            max-height: 80vh;
          }

          .vendor-list {
            max-height: 60vh;
          }
        }
      `}</style>
    </Modal>
  );
};

export default VendorSelectionModal;
