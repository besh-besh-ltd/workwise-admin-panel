import { getAllProducts, getProductDetailsById } from '@/utils/services/product-management';
import { vendorApproveList } from '@/utils/services/rfq';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select, { components } from 'react-select';
import { toast, ToastContainer } from 'react-toastify';

// Custom styles for Product Select Component
const customStyles = {
    option: (provided, state) => ({
        ...provided,
        marginBottom: '1px solid #000',
        color: state.isSelected ? '#0d6efd' : '#212529',
        backgroundColor: state.isSelected ? '#f0f0f0' : provided.backgroundColor,
    }),
};

// Modified Select Component to show category along with Product Name
const CustomSelectOption = (props) => (
    <components.Option {...props}>
        <div>
            {props.data.label}
            <br />
            <small>{props.data.categories}</small>
        </div>
    </components.Option>
);


// Modal Component Starts Here
const VendorApprovalModal = ({
    modalState,
    closeModal,
    handleVendorStatusChange,
    data

}) => {
    const [productLoading, setProductLoading] = useState(false);
    const [vendorApprovedList, setVendorApprovedList] = useState([]);
    const [vendorProductsList, setVendorProductsList] = useState([]);
    const [rejectReason, setRejectreason] = useState('');
    const [productDetails, setProductDetails] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedApprovedBy, setSelectedApprovedBy] = useState([]);

    const handleReasonChange = (e) => {
        setRejectreason(e.target.value);
    }

    // Function to fetch vendor approved-by list
    const getVendorApproveList = () => {
        vendorApproveList()
            .then((res) => {
                let approved_options = res.data.map((s) => ({
                    label: s.vendor_approve,
                    value: s.id,
                }));
                setVendorApprovedList(approved_options);
            })
            .catch((error) => {
                console.log(error)
            });
    };

    // Function to format product data along with it's categories 
    const formatGroupedData = (groupedData) => {
        return Object.values(groupedData).flatMap(items =>
            items.map(item => ({
                value: item.id,
                label: item.name,
                categories: item.product_categories.map(cat => cat.category_name).join(" | ")
            }))
        );
    }

    // Function to filter out unique products with categories
    const groupBySlug = (data) => {
        const groupedData = data.reduce((acc, item) => {
            const slug = item.slug;
            if (!acc[slug]) acc[slug] = [];

            const isUnique = !acc[slug].some((existingItem) =>
                JSON.stringify(existingItem.product_categories) === JSON.stringify(item.product_categories)
            );
            if (isUnique) acc[slug].push(item);
            return acc;
        }, {});
        return formatGroupedData(groupedData);
    }

    // Search Product Function
    const getVendorProductList = useCallback((search_key) => {
        setProductLoading(true);
        getAllProducts(20, 1, search_key)
            .then((res) => {
                const product_options = groupBySlug(res.data);
                setVendorProductsList(product_options);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => setProductLoading(false));
    }, []);

    // Debouncing the search product API call for 300ms
    const debounceGetVendorProductList = useCallback(
        (inputValue) => {
            const debounceTimeout = 300;
            clearTimeout(window.debounceTimer);
            window.debounceTimer = setTimeout(() => {
                getVendorProductList(inputValue);
            }, debounceTimeout);
        },
        [getVendorProductList]
    );

    // Function to get product details by product_id
    const getProductDetails = (selectedOption, id) => {
        if (!id) return;
        getProductDetailsById(id)
            .then((res) => {
                const prodItem = {
                    master_id: res.data.id || '',
                    name: res.data.name || '',
                    description: res.data.description,
                    status: 1,
                    approved_id: [],
                    approved_name: [],
                    categories: res.data.product_categories?.map((data) => data.id)
                }
                setCurrentProduct(prodItem);
                setSelectedProduct(selectedOption);
                setSelectedApprovedBy([]);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // Function to add product/approved-by in FormData
    const handleSelectChange = (selectedOption, { name }) => {
        if (name === "product") {
            const prodId = selectedOption?.value || null;
            if (prodId) getProductDetails(selectedOption, prodId);
        } else {
            if (!currentProduct) {
                toast.error("Please Choose a Product First.", {position: "top-right"})
            } else {
                let approved_ids = [];
                let approved_names = [];
                selectedOption.map((option) => {
                    approved_ids.push(option.value)
                    approved_names.push(option.label)
                })

                setSelectedApprovedBy(selectedOption);
                setCurrentProduct((prevState) => ({
                    ...prevState,
                    approved_id: approved_ids,
                    approved_name: approved_names
                }))
            }
        }
    }

    const handleSingleProductAdd = () => {
        setProductDetails((prevState) => [
            ...prevState,
            currentProduct
        ])
        setCurrentProduct(null)
        setSelectedProduct(null)
        setSelectedApprovedBy([])
    }

    useEffect(() => {
        getVendorApproveList();
        getVendorProductList();
    }, [])

    return (
        <>
        <ToastContainer style={{ zIndex: 1056 }} />
        <Modal show={modalState.is_open} onHide={closeModal} size={modalState.type === "approve" ? "lg" : "md"} backdrop="static" keyboard={false} centered>
            <Modal.Header closeButton>
                <Modal.Title>{modalState.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {modalState.type === "approve"
                        ?
                        <Row className="mb-3">
                            <Col className="col-sm-12 col-md-6 mb-2" >
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

                            <Col className="col-sm-12 col-md-6 mb-2" >
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
                                        onChange={handleSelectChange}
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
                                        onChange={handleSelectChange}
                                        isMulti
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-between">
                                    {currentProduct && <span className="badge badge-danger p-2">{currentProduct.name}</span>}
                                    <button type="button" className="btn btn-primary btn-sm ms-auto" onClick={handleSingleProductAdd}>Add</button>
                                </div>
                            </Col>

                            {productDetails.length > 0 &&
                                <Col className="col-12" >
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
}

export default VendorApprovalModal;
