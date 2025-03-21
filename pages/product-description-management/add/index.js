import React, { useEffect, useRef, useState } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import { Editor } from "@tinymce/tinymce-react";
import { addProductDescription, getAllProducts, searchProductsV2 } from "@/utils/services/product-management";


const Index = () => {
  const [productList, setProductList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState({ name: "", id: "" });
  const editorRef = useRef(null);

  useEffect(() => {
    if (searchTerm.length > 2) {
      const fetchProducts = async () => {
        try {
            
          const res = await searchProductsV2({ search_key: searchTerm });
          setProductList(res.data);
          setShowDropdown(true);
        } catch (err) {
          console.error("Error fetching products:", err);
          setShowDropdown(false);
        }
      };
  
      const debounceFetch = setTimeout(fetchProducts, 300);
      return () => clearTimeout(debounceFetch);
    } else {
      setShowDropdown(false);
      setProductList([]);
    }
  }, [searchTerm]);
  

  const handleProductSelect = (product) => {
    setSelectedProduct({ product_name: product.product_name, product_id: product.product_id });
    setSearchTerm(product.product_name);
    setShowDropdown(false);
    
  };

  const submitHandler = async (values) => {
    try {
      const formData = new FormData();
      formData.append("product_id", selectedProduct.product_id);
  
      if (editorRef.current) {
        let editorContent = editorRef.current.getContent();
        formData.append("content", editorContent);
      }
  
      // Call the API service to add the product description
      const response = await addProductDescription(formData);
  
      window.alert(response.message)
    } catch (error) {
      // Show error message
      window.alert(error?.response?.data?.message || "Failed to add product description.");
    }
  };
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Add Product Description</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="col-12 offset-md-0">
            <div className="text-left pb-4">
              <Link className="btn btn-primary" href="/product-description-management">
                <span className="fa fa-angle-left mr-2"></span>Go Back
              </Link>
            </div>
            <div className="card">
              <div className="card-body mt-3">
                <Formik
                  initialValues={{
                    product_name: "",
                    content: "",
                  }}
                  
                  onSubmit={(values) => {
                    submitHandler(values);
                  }}
                >
                  {({ errors, touched, setFieldValue }) => (
                    <Form>
                      <div className="row mb-4">
                        <div className="col position-relative">
                          <label htmlFor="product_name">Product Name *</label>
                          <input
                            type="text"
                            name="product_name"
                            className="form-control"
                            id="product_name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          {touched.product_name && errors.product_name && (
                            <div className="form-error">{errors.product_name}</div>
                          )}

                          {/* Dropdown */}
                          {showDropdown && (
                            <ul className="dropdown-menu show w-100" style={{ position: "absolute", zIndex: 1000 }}>
                              {productList.map((product) => (
                                <li
                                  key={product.product_id}
                                  className="dropdown-item"
                                  onClick={() => handleProductSelect(product)}
                                  style={{ cursor: "pointer" }}
                                >
                                  {product.product_name}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col">
                          <div className="form-group">
                            <label htmlFor="content">Description *</label>
                            <Editor
                              name="content"
                              apiKey="wl0nyw8toagm8q8ngybdkcmq8xvyh1o9ncw1ptw9liaofo4w"
                              onInit={(evt, editor) => (editorRef.current = editor)}
                              initialValue=""
                              onKeyUp={() => setFieldValue("content", editorRef.current.getContent())}
                              init={{
                                height: 250,
                                menubar: false,
                                plugins: [
                                  "advlist",
                                  "autolink",
                                  "lists",
                                  "link",
                                  "image",
                                  "charmap",
                                  "preview",
                                  "anchor",
                                  "searchreplace",
                                  "visualblocks",
                                  "code",
                                  "fullscreen",
                                  "insertdatetime",
                                  "media",
                                  "table",
                                  "code",
                                  "help",
                                  "wordcount",
                                ],
                                toolbar:
                                  "undo redo | blocks | " +
                                  "bold italic forecolor | alignleft aligncenter " +
                                  "alignright alignjustify | bullist numlist outdent indent | " +
                                  "removeformat | help",
                                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-secondary">
                          Save
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </section>
    </>
  );
};

export default Index;
