import React, { useEffect, useState } from "react";
import { getProductDetailsById } from "../../utils/services/product-management";
import { useRouter } from "next/router";
import ProductVariantsTab from './ProductVariantsTab';

// Changes by Agnij May 8, 2025 [Removed unnecessary sections: images, description, vendor list, and categories]
const ProductDetails = () => {
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            const response = await getProductDetailsById(id);
            
            // Check for proper data structure
            if (response?.data?.data) {
                setProductData(response.data.data);
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
                    setProductData(response.data.data);
                }
            }
        } catch (error) {
            setError(`Failed to load product details: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Add retry function
    const retryFetchProductDetails = () => {
        getProductDetails();
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
                            <div className="row">
                                <div className="col-md-6">
                                    {productData.vendor_name && (
                                        <p><strong>Vendor:</strong> {productData.vendor_name}</p>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    {productData.status !== undefined && (
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span className={`badge badge-${productData.status === 1 ? 'success' : 'secondary'}`}>
                                                {productData.status === 1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                    )}
                                    {productData.created_at && (
                                        <p>
                                            <strong>Created:</strong>{" "}
                                            {productData.created_at_formatted || new Date(productData.created_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="main-content pt-3">
                            <div className="row">
                                {/* Product Variants */}
                                <div className="col-md-12">
                                    <ProductVariantsTab product={productData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
