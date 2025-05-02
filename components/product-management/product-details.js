import React, { useEffect, useState } from "react";
import { getProductDetailsById } from "../../utils/services/product-management";
import { useRouter } from "next/router";
import ProductVariantsTab from './ProductVariantsTab';

const ProductDetails = () => {
    const [productData, setProductData] = useState(null);
    const [vendorData, setVendorData] = useState([]);
    const [loading, setLoading] = useState(false);
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
        try {
            const response = await getProductDetailsById(id);
            if (response?.data?.data) {
                setProductData(response.data.data);
                setVendorData(response.data.vendor_list || []);
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!productData) {
        return <div className="p-4">Loading product details...</div>;
    }

    return (
        <>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1>Product Details</h1>
                    </div>
                </div>
            </div>

            <div className="container-fluid">
                <div className="card">
                    <div className="card-body">
                        <div className="product-info mb-4">
                            <h2>{productData.name}</h2>
                            <p><strong>Manufacturer:</strong> {productData.manufacturer}</p>
                            <p><strong>Vendor:</strong> {productData.vendor_name}</p>
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
                                                <div className="gallery-panel">
                                                    {productData.product_images &&
                                                        productData.product_images.length > 0 &&
                                                        productData.product_images
                                                            .filter(image => image.is_featured === 0)
                                                            .map((image, index) => (
                                                                <div className="gallery-image-panel" key={index}>
                                                                    <img
                                                                        src={image.product_image_url}
                                                                        alt="Gallery Image"
                                                                    />
                                                                </div>
                                                            ))
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
                                                <div className="featured-panel">
                                                    {productData.product_images &&
                                                        productData.product_images.length > 0 &&
                                                        productData.product_images
                                                            .filter(image => image.is_featured === 1)
                                                            .map((image, index) => (
                                                                <div className="featured-image-panel" key={index}>
                                                                    <img
                                                                        src={image.product_image_url}
                                                                        alt="Featured Image"
                                                                    />
                                                                </div>
                                                            ))
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
                                                        productData.product_categories.length > 0 &&
                                                        productData.product_categories.map((data, index) => (
                                                            <div className="product-categories" key={index}>
                                                                <ul>
                                                                    <li>{data.category_name}</li>
                                                                </ul>
                                                            </div>
                                                        ))
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
                                                        {vendorData.length > 0 ? (
                                                            vendorData.map((item, index) => (
                                                                <tr key={item.id || index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{item.vendor_name}</td>
                                                                    <td className="d-flex">
                                                                        {item.vendor_approved_by &&
                                                                            item.vendor_approved_by.length > 0 &&
                                                                            item.vendor_approved_by.map((data, i) => (
                                                                                <div key={i}>
                                                                                    {data.name}
                                                                                    {i !== item.vendor_approved_by.length - 1 && <span>,&nbsp;</span>}
                                                                                </div>
                                                                            ))}
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
