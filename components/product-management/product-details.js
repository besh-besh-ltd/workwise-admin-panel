import React, { useEffect, useState } from "react";
import { getProductDetailsById } from "../../utils/services/product-management";
import { useRouter } from "next/router";
import ProductVariantsTab from './ProductVariantsTab';

// Changes by Agnij May 02, 2025 [Improved product details component to fix loading issues]
const ProductDetails = () => {
    const [productData, setProductData] = useState(null);
    const [vendorData, setVendorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            getProductDetails();
        }
    }, [id]);

    const getProductDetails = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log("Fetching product details for ID:", id);
            const response = await getProductDetailsById(id);
            
            console.log("API Response:", response);
            
            if (response?.data?.data) {
                console.log("Setting product data:", response.data.data);
                setProductData(response.data.data);
                
                // Check if vendor_list exists, otherwise use an empty array
                if (response.data.vendor_list) {
                    console.log("Setting vendor data:", response.data.vendor_list);
                    setVendorData(response.data.vendor_list);
                } else {
                    console.log("No vendor list found, setting empty array");
                    setVendorData([]);
                }
            } else {
                console.error("Invalid response format:", response);
                
                if (response?.data?.error) {
                    setError(`Failed to load product details: ${response.data.error}`);
                } else if (response?.data?.message) {
                    setError(`Failed to load product details: ${response.data.message}`);
                } else {
                    setError("Failed to load product details: Invalid response format");
                }
                
                if (response?.data?.data) {
                    console.log("Using fallback data from response");
                    setProductData(response.data.data);
                    setVendorData(response.data.vendor_list || []);
                }
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            setError(`Failed to load product details: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Add retry function
    const retryFetchProductDetails = () => {
        setLoading(true);
        setError(null);
        
        setTimeout(() => {
            getProductDetails();
        }, 500);
    };

    // Show appropriate loading or error state
    if (loading) {
        return (
            <div className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading product details...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Error Loading Product</h4>
                    <p>{error}</p>
                    <hr/>
                    <button 
                        className="btn btn-outline-danger"
                        onClick={retryFetchProductDetails}
                    >
                        <i className="fas fa-sync-alt mr-2"></i> Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!productData) {
        return (
            <div className="p-4">
                <div className="alert alert-warning">
                    <h4 className="alert-heading">No Product Found</h4>
                    <p>Could not find the requested product. It may have been deleted or you don't have permission to view it.</p>
                    <hr/>
                    <button 
                        className="btn btn-primary"
                        onClick={() => router.push('/product-management')}
                    >
                        <i className="fas fa-arrow-left mr-2"></i> Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Product Details</h1>
                        </div>
                        <div className="col-sm-6">
                            <div className="float-sm-right">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => router.push('/product-management')}
                                >
                                    <i className="fas fa-arrow-left mr-2"></i> Back to Products
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="product-info mb-4">
                            <h2>{productData.name}</h2>
                            {productData.manufacturer && <p><strong>Manufacturer:</strong> {productData.manufacturer}</p>}
                            {productData.vendor_name && <p><strong>Vendor:</strong> {productData.vendor_name}</p>}
                        </div>

                        {/* Bootstrap Tabs */}
                        <ul className="nav nav-tabs" id="productTabs" role="tablist">
                            <li className="nav-item" role="presentation">
                                <a 
                                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('basic')}
                                    id="basic-tab" 
                                    data-toggle="tab" 
                                    href="#basic" 
                                    role="tab" 
                                    aria-controls="basic" 
                                    aria-selected={activeTab === 'basic'}
                                >
                                    Basic Details
                                </a>
                            </li>
                            <li className="nav-item" role="presentation">
                                <a 
                                    className={`nav-link ${activeTab === 'variants' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('variants')}
                                    id="variants-tab" 
                                    data-toggle="tab" 
                                    href="#variants" 
                                    role="tab" 
                                    aria-controls="variants" 
                                    aria-selected={activeTab === 'variants'}
                                >
                                    Variants
                                </a>
                            </li>
                        </ul>

                        <div className="tab-content pt-3" id="productTabsContent">
                            <div 
                                className={`tab-pane fade ${activeTab === 'basic' ? 'show active' : ''}`} 
                                id="basic" 
                                role="tabpanel" 
                                aria-labelledby="basic-tab"
                            >
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <div className="card-header">
                                                <h3 className="card-title">Gallery Images</h3>
                                            </div>
                                            <div className="card-body">
                                                <div className="gallery-panel d-flex flex-wrap">
                                                    {productData.product_images &&
                                                        productData.product_images.length > 0 ?
                                                        (productData.product_images
                                                            .filter(image => image.is_featured === 0)
                                                            .map((image, index) => (
                                                                <div className="gallery-image-panel m-2" key={index}>
                                                                    <img
                                                                        src={image.product_image_url}
                                                                        alt="Gallery Image"
                                                                        style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
                                                                        className="img-thumbnail"
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted">No gallery images available</p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card mb-4">
                                            <div className="card-header">
                                                <h3 className="card-title">Featured Image</h3>
                                            </div>
                                            <div className="card-body">
                                                <div className="featured-panel text-center">
                                                    {productData.product_images &&
                                                        productData.product_images.length > 0 ?
                                                        (productData.product_images
                                                            .filter(image => image.is_featured === 1)
                                                            .map((image, index) => (
                                                                <div className="featured-image-panel" key={index}>
                                                                    <img
                                                                        src={image.product_image_url}
                                                                        alt="Featured Image"
                                                                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                                                        className="img-fluid"
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted">No featured image available</p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="card mb-4">
                                            <div className="card-header">
                                                <h3 className="card-title">Product Categories</h3>
                                            </div>
                                            <div className="card-body">
                                                <div className="product-categories-panel">
                                                    {productData.product_categories &&
                                                        productData.product_categories.length > 0 ?
                                                        (
                                                            <div className="product-categories">
                                                                <ul className="list-group">
                                                                    {productData.product_categories.map((data, index) => (
                                                                        <li className="list-group-item" key={index}>
                                                                            {data.category_name}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted">No categories assigned</p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="card mb-4">
                                            <div className="card-header">
                                                <h3 className="card-title">Vendor List</h3>
                                            </div>
                                            <div className="card-body">
                                                <table className="table table-striped table-hover mb-3">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Sl. No.</th>
                                                            <th scope="col">Name</th>
                                                            <th scope="col">Approved By</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {vendorData && vendorData.length > 0 ? (
                                                            vendorData.map((item, index) => (
                                                                <tr key={item.id || index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{item.vendor_name}</td>
                                                                    <td>
                                                                        {item.vendor_approved_by &&
                                                                            item.vendor_approved_by.length > 0 ?
                                                                            (
                                                                                <div className="d-flex flex-wrap">
                                                                                    {item.vendor_approved_by.map((data, i) => (
                                                                                        <div key={i} className="mr-2">
                                                                                            {data.name || data}
                                                                                            {i !== item.vendor_approved_by.length - 1 && <span>,&nbsp;</span>}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-muted">Not approved</span>
                                                                            )
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="3" className="text-center">No vendors available</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div 
                                className={`tab-pane fade ${activeTab === 'variants' ? 'show active' : ''}`} 
                                id="variants" 
                                role="tabpanel" 
                                aria-labelledby="variants-tab"
                            >
                                <ProductVariantsTab product={productData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
