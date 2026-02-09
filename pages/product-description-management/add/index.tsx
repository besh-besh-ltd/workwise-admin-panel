import React, { useEffect, useRef, useState } from "react";
import { Form, Formik } from "formik";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import { Editor } from "@tinymce/tinymce-react";
import { addProductDescription, getAllProducts } from "@/utils/services/product-management";

interface Product {
  id: string;
  name: string;
}

interface SelectedProduct {
  product_name: string;
  product_id: string;
}

interface FormValues {
  product_name: string;
  content: string;
}

const decriptionSectionInitialSection = `
<div class="container p-4 border">
<h3>Description edited</h3>
<ul>
<li><strong>PN rating and #ratings:</strong> Engineered for industrial-grade applications, this ball valve is rated for pressures up to <strong>5000 PSI</strong>, ensuring durability and performance in high-pressure systems like oil refineries, chemical plants, and gas pipelines. It guarantees consistent control in demanding environments.</li>
<li><strong>Media Compatibility:</strong> These valves are suitable for various media, including <strong>gas, water, and acids</strong> (for which a plastic variant is required). It provides reliable performance across a range of industrial applications.</li>
</ul>

<h3 class="mt-4">Ideal For These Industries</h3>
<div class="d-flex gap-4">
<div class="text-center"><img src="https://img.icons8.com/ios/50/000000/oil-industry.png" alt="Oil and Gas" width="40" height="40">
<p>Oil and Gas</p>
</div>
<div class="text-center"><img src="https://img.icons8.com/ios/50/000000/test-tube.png" alt="Chemical" width="40" height="40">
<p>Chemical</p>
</div>

<div class="text-center"><img src="https://img.icons8.com/ios/50/000000/water.png" alt="Water Treatment" width="40" height="40">
<p>Water Treatment</p>
</div>
</div>
<h3 class="mt-4">Expert Tips</h3>
<div class="border p-3 rounded d-flex align-items-center"><img class="rounded-circle me-3" src="https://picsum.photos/80/80" alt="Expert" width="80" height="80">
<div>
<p><strong>Dr. Mark D.</strong></p>
<p class="text-muted">Senior Mechanical Engineer</p>
<a class="text-decoration-none" href="#">www.expertadvice.com</a></div>
</div>
</div>`

const Index: React.FC = () => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct>({ product_name: "", product_id: "" });
  const editorRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {

    console.log(selectedProduct.product_name, searchTerm)

    if (searchTerm?.length > 2 && searchTerm != selectedProduct.product_name) {
      const fetchProducts = async () => {
        try {

          // limit = 10, page = 1, searchString, vendorApprove, vendorId, isFeatured, onlyAddedByAdmin
          const res : any = await getAllProducts(10, 1, searchTerm, "", "", "", "", "",  "", "", "", "");
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


  const handleProductSelect = (product: Product) => {

    setSelectedProduct({ product_name: product.name, product_id: product.id });
    setSearchTerm(product.name);
    setShowDropdown(false);

  };

  const submitHandler = async (values: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("product_id", selectedProduct.product_id);

      if (editorRef.current) {
        let editorContent = editorRef.current.getContent();
        formData.append("content", editorContent);
      }

      // Call the API service to add the product description
      const response : any = await addProductDescription(formData);

      window.alert(response.message)

      console.log(response);

      router.push(`/product-description-management/edit/${response?.data?.id}`);


    } catch (error: any) {
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
                                  key={product.id}
                                  className="dropdown-item"
                                  onClick={() => handleProductSelect(product)}
                                  style={{ cursor: "pointer" }}
                                >
                                  {product.name}
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
                              apiKey="wl0nyw8toagm8q8ngybdkcmq8xvyh1o9ncw1ptw9liaofo4w"
                              onInit={(evt, editor) => (editorRef.current = editor)}
                              initialValue={decriptionSectionInitialSection}
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
