import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { deleteProductDescription, getProductDescription } from "@/utils/services/product-management";
import { toast } from "react-toastify";

interface ProductDescriptionItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const ProductTable: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const [productDescription, setProductDescription] = useState<ProductDescriptionItem[]>([]);

  useEffect(() => {
    getProductDescription()
      .then((res : any) => { setProductDescription(res) })
      .catch((err) => {
        console.log(err)
      })
  }, []);


  const handleDelete = async (id: string) => {
    try {
      const response : any = await deleteProductDescription(id);

      if (response?.status == 1) {
        toast.success(response.message || "Product description deleted successfully!");
      } else {
        toast.error(response.message || "Failed to delete product description.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Product Management</h2>
        <button
          className="btn btn-success btn-sm"
          onClick={() => router.push(`${currentPath}/add`)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Product
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover shadow">
          <thead className="table-dark">
            <tr>
              <th>S. No.</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {productDescription?.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.created_at}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => router.push(`${currentPath}/edit/${product.id}`)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>

                  <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(product.id)}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
