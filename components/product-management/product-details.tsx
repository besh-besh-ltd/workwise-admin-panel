import React, { useEffect, useState } from "react";
import { getProductDetailsById } from "../../utils/services/product-management";
import { useRouter, NextRouter } from "next/router";
import ProductVariantsTab from './ProductVariantsTab';

// Type definitions
interface ProductCategory {
    id: number;
    category_name: string;
}

interface ProductData {
    id: number;
    name: string;
    description?: string;
    status?: number;
    vendor?: number;
    vendor_name?: string;
    vendor_approved_by?: string;
    is_approve?: number;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
    updated_by?: string;
    approved_at?: string;
    approved_by?: string;
    product_categories?: ProductCategory[];
    product_variants?: any[];
    company_id?: number | null;
    owner_company?: string | null;
}

const ProductDetails: React.FC = () => {
    const [productData, setProductData] = useState<ProductData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router: NextRouter = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            getProductDetails();
        }
    }, [id]);

    const getProductDetails = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const response : any = await getProductDetailsById(id as string);

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
            }
        } catch (error: any) {
            setError(`Failed to load product details: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    const retryFetchProductDetails = (): void => {
        getProductDetails();
    };

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
                            <h2>
                                {productData.name}{" "}
                                {productData.company_id ? (
                                    <span className="badge badge-info">
                                        Buyer: {productData.owner_company || 'Private'}
                                    </span>
                                ) : (
                                    <span className="badge badge-secondary">Global</span>
                                )}
                            </h2>
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
                                            {new Date(productData.created_at).toLocaleDateString()} - {productData.created_by}
                                        </p>
                                    )}
                                    {productData.updated_at && (
                                        <p>
                                            <strong>Last Updated:</strong>{" "}
                                            {new Date(productData.updated_at).toLocaleDateString()} - {productData.updated_by}
                                        </p>
                                    )}
                                    {productData.approved_at && (
                                        <p>
                                            <strong>Last Approved:</strong>{" "}
                                            {new Date(productData.approved_at).toLocaleDateString()} - {productData.vendor_approved_by}
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
