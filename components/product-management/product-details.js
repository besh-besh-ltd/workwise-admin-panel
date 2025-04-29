import React, { useEffect, useState } from "react";
import { getProductDetailsById } from "../../utils/services/product-management";
import { useRouter } from "next/router";
import { Tabs, Card } from 'antd';
import ProductVariantsTab from './ProductVariantsTab';

const { TabPane } = Tabs;

const ProductDetails = () => {
    const [productData, setProductData] = useState(null);
    const [vendorData, setVendorData] = useState([]);
    const [loading, setLoading] = useState(false);
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
                <Card>
                    <div className="product-info mb-4">
                        <h2>{productData.name}</h2>
                        <p><strong>Manufacturer:</strong> {productData.manufacturer}</p>
                        <p><strong>Vendor:</strong> {productData.vendor_name}</p>
                    </div>

                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Basic Details" key="1">
                            <div className="row">
                                <div className="col-md-12">
                                    <Card title="Gallery Images" className="mb-4">
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
                                    </Card>
                                </div>

                                <div className="col-md-6">
                                    <Card title="Featured Image" className="mb-4">
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
                                    </Card>
                                </div>

                                <div className="col-md-6">
                                    <Card title="Product Categories" className="mb-4">
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
                                    </Card>
                                </div>

                                <div className="col-md-12">
                                    <Card title="Vendor List" className="mb-4">
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
                                    </Card>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane tab="Variants" key="2">
                            <ProductVariantsTab product={productData} />
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </>
    );
};

export default ProductDetails;
