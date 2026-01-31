import { getAllProducts, getProductDetailsById } from '@/utils/services/product-management';
import { vendorApproveList } from '@/utils/services/rfq';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select, { components, OptionProps } from 'react-select';
import { toast, ToastContainer } from 'react-toastify';

interface ProductOption {
  value: number;
  label: string;
  categories: string;
}

interface ApprovedOption {
  label: string;
  value: number;
}

interface ProductCategory {
  id: number;
  category_name: string;
}

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_categories: ProductCategory[];
}

interface ProductDetail {
  master_id: number;
  name: string;
  description: string;
  status: number;
  approved_id: number[];
  approved_name: string[];
  categories: number[];
}

interface ModalState {
  is_open: boolean;
  type: 'approve' | 'reject';
  title: string;
  prod_string?: string;
}

interface VendorApprovalModalProps {
  modalState: ModalState;
  closeModal: () => void;
  handleVendorStatusChange: (data: any, status: number, payload: string | ProductDetail[]) => void;
  data: any;
}

const customStyles = {
  option: (provided: any, state: { isSelected: boolean }) => ({
    ...provided,
    marginBottom: '1px solid #000',
    color: state.isSelected ? '#0d6efd' : '#212529',
    backgroundColor: state.isSelected ? '#f0f0f0' : provided.backgroundColor,
  }),
};

const CustomSelectOption = (props: OptionProps<ProductOption>) => (
  <components.Option {...props}>
    <div>
      {props.data.label}
      <br />
      <small>{props.data.categories}</small>
    </div>
  </components.Option>
);

const VendorApprovalModal: React.FC<VendorApprovalModalProps> = ({
  modalState,
  closeModal,
  handleVendorStatusChange,
  data
}) => {
  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [vendorApprovedList, setVendorApprovedList] = useState<ApprovedOption[]>([]);
  const [vendorProductsList, setVendorProductsList] = useState<ProductOption[]>([]);
  const [rejectReason, setRejectreason] = useState<string>('');
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductDetail | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
  const [selectedApprovedBy, setSelectedApprovedBy] = useState<ApprovedOption[]>([]);

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRejectreason(e.target.value);
  };

  const getVendorApproveList = () => {
    vendorApproveList()
      .then((res : any) => {
        const approved_options = res.data.map((s: { vendor_approve: string; id: number }) => ({
          label: s.vendor_approve,
          value: s.id,
        }));
        setVendorApprovedList(approved_options);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const formatGroupedData = (groupedData: Record<string, ProductItem[]>): ProductOption[] => {
    return Object.values(groupedData).flatMap(items =>
      items.map(item => ({
        value: item.id,
        label: item.name,
        categories: item.product_categories.map(cat => cat.category_name).join(" | ")
      }))
    );
  };

  const groupBySlug = (data: ProductItem[]): ProductOption[] => {
    const groupedData = data.reduce<Record<string, ProductItem[]>>((acc, item) => {
      const slug = item.slug;
      if (!acc[slug]) acc[slug] = [];

      const isUnique = !acc[slug].some((existingItem) =>
        JSON.stringify(existingItem.product_categories) === JSON.stringify(item.product_categories)
      );
      if (isUnique) acc[slug].push(item);
      return acc;
    }, {});
    return formatGroupedData(groupedData);
  };

  const getVendorProductList = useCallback((search_key: string) => {
    setProductLoading(true);
    getAllProducts(20, 1, search_key, '', '', '', '', '', '', '', '', '')
      .then((res : any) => {
        const product_options = groupBySlug(res.data);
        setVendorProductsList(product_options);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setProductLoading(false));
  }, []);

  const debounceGetVendorProductList = useCallback(
    (inputValue: string) => {
      const debounceTimeout = 300;
      clearTimeout((window as any).debounceTimer);
      (window as any).debounceTimer = setTimeout(() => {
        getVendorProductList(inputValue);
      }, debounceTimeout);
    },
    [getVendorProductList]
  );

  const getProductDetails = (selectedOption: ProductOption, id: number) => {
    if (!id) return;
    getProductDetailsById(id)
      .then((res : any) => {
        const prodItem: ProductDetail = {
          master_id: res.data.id || '',
          name: res.data.name || '',
          description: res.data.description,
          status: 1,
          approved_id: [],
          approved_name: [],
          categories: res.data.product_categories?.map((data: ProductCategory) => data.id)
        };
        setCurrentProduct(prodItem);
        setSelectedProduct(selectedOption);
        setSelectedApprovedBy([]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSelectChange = (selectedOption: any, { name }: { name: string }) => {
    if (name === "product") {
      const prodId = selectedOption?.value || null;
      if (prodId) getProductDetails(selectedOption, prodId);
    } else {
      if (!currentProduct) {
        toast.error("Please Choose a Product First.", { position: "top-right" });
      } else {
        const approved_ids: number[] = [];
        const approved_names: string[] = [];
        selectedOption.forEach((option: ApprovedOption) => {
          approved_ids.push(option.value);
          approved_names.push(option.label);
        });

        setSelectedApprovedBy(selectedOption);
        setCurrentProduct((prevState) => prevState ? ({
          ...prevState,
          approved_id: approved_ids,
          approved_name: approved_names
        }) : null);
      }
    }
  };

  const handleSingleProductAdd = () => {
    if (currentProduct) {
      setProductDetails((prevState) => [
        ...prevState,
        currentProduct
      ]);
    }
    setCurrentProduct(null);
    setSelectedProduct(null);
    setSelectedApprovedBy([]);
  };

  useEffect(() => {
    getVendorApproveList();
    getVendorProductList('');
  }, []);

  return (
    <>
      <ToastContainer style={{ zIndex: 1056 }} />
      <Modal show={modalState.is_open} onHide={closeModal} size={modalState.type === "approve" ? "lg" : undefined} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalState.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {modalState.type === "approve"
              ?
              <Row className="mb-3">
                <Col className="col-sm-12 col-md-6 mb-2">
                  <Form.Group controlId="textarea">
                    <Form.Label>Product List</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={modalState.prod_string}
                      placeholder="Enter your comments here..."
                      disabled
                    />
                  </Form.Group>
                </Col>

                <Col className="col-sm-12 col-md-6 mb-2">
                  <Form.Group controlId="productSelect" className="mb-2">
                    <Form.Label>Search Product</Form.Label>
                    <Select
                      name="product"
                      options={vendorProductsList}
                      value={selectedProduct}
                      components={{ Option: CustomSelectOption }}
                      styles={customStyles}
                      isLoading={productLoading}
                      onInputChange={debounceGetVendorProductList}
                      onChange={()=>handleSelectChange}
                      placeholder="Search or select an option..."
                      isClearable
                      isSearchable
                    />
                  </Form.Group>
                  <Form.Group controlId="approvedBy" className="mb-2">
                    <Form.Label>Approved By</Form.Label>
                    <Select
                      name="approvedBy"
                      options={vendorApprovedList}
                      value={selectedApprovedBy}
                      placeholder="Select a Product"
                      isClearable={false}
                      onChange={()=>handleSelectChange}
                      isMulti
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-between">
                    {currentProduct && <span className="badge badge-danger p-2">{currentProduct.name}</span>}
                    <button type="button" className="btn btn-primary btn-sm ms-auto" onClick={handleSingleProductAdd}>Add</button>
                  </div>
                </Col>

                {productDetails.length > 0 &&
                  <Col className="col-12">
                    <Form.Group controlId="addedProducts">
                      <Form.Label>Added Products</Form.Label>
                      <div className="d-flex flex-wrap">
                        {productDetails.map((prodItem) => (
                          <div key={prodItem.master_id} className="badge badge-success p-2 me-2 d-flex align-items-center gap-2">
                            {prodItem.name}
                            <FontAwesomeIcon icon={faClose} fontSize={14} />
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                }
              </Row>
              : <Form.Group controlId="reasonTextarea">
                <Form.Label>Reject Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter your reason here..."
                  value={rejectReason}
                  onChange={handleReasonChange}
                />
              </Form.Group>
            }
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>Close</Button>
          {modalState.type === "reject"
            ? <Button variant="primary" onClick={() => handleVendorStatusChange(data, 2, rejectReason)}>Reject</Button>
            : <Button variant="primary" onClick={() => handleVendorStatusChange(data, 3, productDetails)}>Approve</Button>
          }
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VendorApprovalModal;
