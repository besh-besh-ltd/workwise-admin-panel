import React, { useEffect, useState } from "react";
import { getProducts } from "@/utils/services/products";
import { useRouter } from "next/router";

const ProductDetails = () => {
    const [productData, setProductData] = useState([])
    const [vendorData, setVendorData] = useState([])
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        getProductDetails()
    }, [id])

    const getProductDetails = () => {
        getProducts(id)
            .then((response) => {
                setProductData([response.data])
                setVendorData(response.vendor_list)
            })
            .catch((error) => {
                console.log(error)
            });
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

            {productData &&
                productData.length != 0 &&
                productData?.map((dt) => {
                    return (
                        <section className="product-content">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="card col-12">
                                        <div className="card-body mt-3">
                                            <div className="d-flex">
                                                <div className="text-center">
                                                    <h3></h3>
                                                </div>
                                                <div className="ml-2">
                                                    <p>Product Name- <span className="text-bold">{dt.name}</span></p>
                                                    <p>Manufacturer- <span className="text-bold">{dt.manufacturer}</span></p>
                                                    <p>Vendor Name- <span className="text-bold">{dt.vendor_name}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card col-md-12">
                                        <div className="card-header">Gallery Images</div>
                                        <div className="gallery-panel">
                                            {dt.product_images &&
                                                dt.product_images.length != 0 &&
                                                dt.product_images.map((image) => {
                                                    return (
                                                        (image.is_featured == 0 &&
                                                            <div className="gallery-image-panel">
                                                                <img
                                                                    src={image.product_image_url}
                                                                    alt="image"
                                                                />
                                                            </div>
                                                        )
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="card col-md-6">
                                        <div className="card-header">Featured Image</div>
                                        <div className="featured-panel">
                                            <div className="gallery-panel">
                                                {dt.product_images &&
                                                    dt.product_images.length != 0 &&
                                                    dt.product_images.map((image) => {
                                                        return (
                                                            (image.is_featured == 1 &&
                                                                <div className="featured-image-panel">
                                                                    <img
                                                                        src={image.product_image_url}
                                                                        alt="image"
                                                                    />
                                                                </div>
                                                            )
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card col-md-6">
                                        <div className="card-header">Product Categories</div>
                                        <div className="product-categories-panel">
                                            {dt.product_categories &&
                                                dt.product_categories.length != 0 &&
                                                dt.product_categories.map((data) => {
                                                    return (
                                                        <div className="product-categories">
                                                            <ul>
                                                                <li>{data.category_name}</li>
                                                            </ul>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="card col-md-12">
                                        <div className="card-header">Product Variants</div>
                                        <div className="product-variants">
                                            <table className="table table-striped table-hover mb-3">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Sl. No.</th>
                                                        <th scope="col">Variant Name</th>
                                                        <th scope="col">Variant Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dt.product_variants &&
                                                        dt.product_variants.length != 0 &&
                                                        dt.product_variants.map((item, index) => {
                                                            return (
                                                                <tr key={item.id}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{item.variant_name}</td>
                                                                    <td>{item.variant_value}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )
                })
            }
            <section className="product-content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="card col-md-12">
                            <div className="card-header">Vendor List</div>
                            <div className="product-variants">
                                <table className="table table-striped table-hover mb-3">
                                    <thead>
                                        <tr>
                                            <th scope="col">Sl. No.</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Approved By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendorData &&
                                            vendorData.length != 0 &&
                                            vendorData.map((item, index) => {
                                                return (
                                                    <tr key={item.id}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.vendor_name}</td>
                                                        <td className="d-flex">{item.vendor_approved_by &&
                                                            item.vendor_approved_by.length != 0 &&
                                                            item.vendor_approved_by.map((data, index) => {
                                                                return (
                                                                    <div key={index}>
                                                                        {data.name}{data !== item.vendor_approved_by[item.vendor_approved_by.length - 1] && <span>,&nbsp;</span>}
                                                                    </div>
                                                                )
                                                            })}</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default ProductDetails
