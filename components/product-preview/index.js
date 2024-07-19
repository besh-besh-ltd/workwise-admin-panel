import {
  productReviewListAPI,
  productReview,
} from "@/utils/services/product-preview";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";

const ProductReview = () => {
  const router = useRouter();
  const [productReviewList, setProductReviewList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);

  // Function to handle select all products
  const selectAllProduct = (e) => {
    const isChecked = e.target.checked;
    const updatedSelectedProducts = isChecked
      ? productReviewList.map((item) => item.id)
      : [];
    setSelectedProducts(updatedSelectedProducts);
  };

  // Function to handle select individual product
  const selectProduct = (e, item) => {
    const productId = item.id;
    const isChecked = e.target.checked;
    let updatedSelectedProducts = [...selectedProducts];

    if (isChecked) {
      updatedSelectedProducts.push(productId);
    } else {
      updatedSelectedProducts = updatedSelectedProducts.filter(
        (id) => id !== productId
      );
    }

    setSelectedProducts(updatedSelectedProducts);
  };
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  // Function to check if all products are selected
  const isAllProductsSelected =
    selectedProducts.length === productReviewList.length;

  const getProductReviewList = () => {
    productReviewListAPI(page)
      .then((res) => {
        settotalPages(res.total_count);
        setProductReviewList(res.data);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };
  const handleReviewProduct = () => {
    const payload = {
      all: selectedProducts?.length === productReviewList?.length,
      products: selectedProducts,
    };
    productReview(payload)
      .then((res) => {
        getProductReviewList();
        setSelectedProducts([]);
        toast.success(res?.message);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };
  /* useEffect(() => {
    getProductReviewList();
  }, []); */
  useEffect(() => {
    getProductReviewList();
  }, [page]);
  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Product Preview List</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="card card-body product-table mt-3">
          <div className="row justify-content-end">
            <div className="col-sm-2 mb-4">
              <button
                type="button"
                onClick={() => handleReviewProduct()}
                className="btn btn-primary mr-2"
              >
                Finalize
              </button>
            </div>
          </div>
          <table className="table table-striped table-hover mb-3">
            <thead>
              <tr>
                <th scope="col">
                  <input
                    type="checkbox"
                    name="select_all_products"
                    checked={isAllProductsSelected}
                    value=""
                    onClick={(e) => selectAllProduct(e)}
                  />
                </th>
                <th>Name</th>
                {/* <th>Manufacturer</th> */}
                <th>Vendor Name</th>
                {/* <th>Availability</th> */}
                <th>Product Categories</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {productReviewList &&
                productReviewList?.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="checkbox"
                          name="select_product"
                          checked={selectedProducts.includes(item.id)}
                          value=""
                          onClick={(e) => selectProduct(e, item)}
                        />
                      </td>
                      <td>{item?.name}</td>
                      {/* <td>{item?.manufacturer?.trim()}</td> */}
                      <td>{item?.vendor_name}</td>
                      {/* <td>
                        {item?.is_review === 1 ? "Reviewed" : "Not Reviewed"}
                      </td> */}
                      {/* <td>
                        {item?.availability === 1
                          ? "Available"
                          : "Not Available"}
                      </td> */}
                      <td>
                        {item.product_categories.map((cat, planIndex) => (
                          <span
                            key={planIndex}
                            className="badge bg-primary me-2"
                          >
                            {cat?.category_name}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span
                          className="fa fa-edit mr-3"
                          onClick={() =>
                            router.push(
                              `/product-preview/edit-product/${item?.id}`
                            )
                          }
                        ></span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {Math.ceil(totalPages / 10) > 1 && (
            <ReactPaginate
              breakLabel="..."
              nextLabel={<i className="fa fa-angle-right"></i>}
              onPageChange={handlePageClick}
              pageRangeDisplayed={2}
              pageCount={Math.ceil(totalPages / 10)}
              previousLabel={<i className="fa fa-angle-left"></i>}
              renderOnZeroPageCount={null}
              className="pagination"
            />
          )}
        </div>
      </section>
    </>
  );
};

export default ProductReview;
