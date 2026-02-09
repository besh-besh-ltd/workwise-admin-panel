import {
  productReviewListAPI,
  productReview,
} from "@/utils/services/product-preview";
import { useRouter, NextRouter } from "next/router";
import React, { useEffect, useState, ChangeEvent, MouseEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";

interface ProductCategory {
  id: number;
  category_name: string;
}

interface ProductItem {
  id: number;
  name: string;
  manufacturer?: string;
  vendor_name: string;
  is_review: number;
  availability: number;
  product_categories: ProductCategory[];
}

interface PaginateEvent {
  selected: number;
}

interface ReviewPayload {
  all: boolean;
  products: number[];
}

const ProductReview: React.FC = () => {
  const router: NextRouter = useRouter();
  const [productReviewList, setProductReviewList] = useState<ProductItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [limit, setlimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, settotalPages] = useState<number | null>(null);

  // Function to handle select all products
  const selectAllProduct = (e: MouseEvent<HTMLInputElement>): void => {
    const isChecked = (e.target as HTMLInputElement).checked;
    const updatedSelectedProducts = isChecked
      ? productReviewList.map((item) => item.id)
      : [];
    setSelectedProducts(updatedSelectedProducts);
  };

  // Function to handle select individual product
  const selectProduct = (e: MouseEvent<HTMLInputElement>, item: ProductItem): void => {
    const productId = item.id;
    const isChecked = (e.target as HTMLInputElement).checked;
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

  const handlePageClick = (e: PaginateEvent): void => {
    setPage(e.selected + 1);
  };

  // Function to check if all products are selected
  const isAllProductsSelected =
    selectedProducts.length === productReviewList.length;

  const getProductReviewList = (): void => {
    productReviewListAPI(page)
      .then((res: { total_count: number; data: ProductItem[] }) => {
        settotalPages(res.total_count);
        setProductReviewList(res.data);
      })
      .catch((error: { error?: { response?: { data?: { errors?: Record<string, string> } } } }) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  const handleReviewProduct = (): void => {
    const payload: ReviewPayload = {
      all: selectedProducts?.length === productReviewList?.length,
      products: selectedProducts,
    };
    productReview(payload)
      .then((res: { message?: string }) => {
        getProductReviewList();
        setSelectedProducts([]);
        toast.success(res?.message);
      })
      .catch((error: { error?: { response?: { data?: { errors?: Record<string, string> } } } }) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  useEffect(() => {
    getProductReviewList();
  }, [page]);

  return (
    <>
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
                <th>Vendor Name</th>
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
                      <td>{item?.vendor_name}</td>
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
          {totalPages && Math.ceil(totalPages / 10) > 1 && (
            <>
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
              <div className="d-flex align-items-center gap-2 mt-2">
                <input
                  type="number"
                  className="form-control"
                  style={{ width: "125px" }}
                  placeholder="Go to page"
                  min="1"
                  max={Math.ceil(totalPages / 10)}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / 10), parseInt(e.target.value) || 1));
                    setPage(pageNum);
                  }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                    const pageNum = parseInt(input.value);
                    if (totalPages && pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 10)) {
                      setPage(pageNum);
                    }
                  }}
                >
                  Go
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default ProductReview;
