import {
  getOneProductDescription,
  editProductsDescription,
  addProductTechSpec,
  uploadProductImages,
} from "@/utils/services/product-management";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";

interface ProductDescription {
  id?: string;
  product_id?: string;
  description?: string;
  created_at?: string;
  [key: string]: any;
}

interface Spec {
  key: string;
  value: string;
}

const Index: React.FC = () => {
  const [oneProductDescription, setOneProductDescription] = useState<ProductDescription>({});
  const [specs, setSpecs] = useState<Spec[]>([{ key: "", value: "" }]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const editorRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      getOneProductDescription(id as string)
        .then((res : any) => setOneProductDescription(res.data))
        .catch((err) => console.log(err));
    }
  }, [id]);

  const handleSubmit = async () => {
    if (editorRef.current) {
      const updatedDescription = editorRef.current.getContent();

      const { created_at, ...filteredProduct } = oneProductDescription;
      const productObj = {
        ...filteredProduct,
        description: updatedDescription,
      };
      try {
        await editProductsDescription(productObj);
        alert("Product description updated successfully!");
      } catch (error) {
        console.error("Error updating product description:", error);
      }
    }
  };

  // add remove and sumit spec functions
  const handleAddSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (index: number) => {
    const updated = [...specs];
    updated.splice(index, 1);
    setSpecs(updated);
  };

  const handleSpecChange = (index: number, field: keyof Spec, value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleFinalSubmit = async () => {
    const updatedDescription = editorRef.current?.getContent() || "";
    const cleanedSpecs = specs.filter(
      (item) => item.key.trim() && item.value.trim()
    );

    if (!oneProductDescription?.product_id) {
      alert("Invalid product ID.");
      return;
    }

    try {
      const response = await addProductTechSpec(oneProductDescription?.product_id, cleanedSpecs);
      alert("Technical specifications saved successfully!");
    } catch (error) {
      console.error("Error saving product tech specs:", error);
      alert("Failed to save technical specifications.");
    }

    setSpecs([{ key: "", value: "" }])
  };

// upload images function

const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    setSelectedImages(Array.from(e.target.files));
  }
};

const handleUploadImages = async () => {
  if (!selectedImages.length) {
    alert("Please select image(s) to upload.");
    return;
  }

  try {
    const res = await uploadProductImages(oneProductDescription?.product_id as string, selectedImages);
    alert("Images uploaded successfully!");
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (err) {
    console.error("Image upload failed:", err);
    alert("Failed to upload images.");
  }

};

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Edit Product Description</h3>
      <Editor
        apiKey="wl0nyw8toagm8q8ngybdkcmq8xvyh1o9ncw1ptw9liaofo4w"
        initialValue={oneProductDescription.description}
        onInit={(evt, editor) => (editorRef.current = editor)}
        init={{
          height: 250,
          menubar: false,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table code help wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
      <button
        onClick={handleSubmit}
        className="btn btn-primary btn-md fw-bold shadow-sm px-4 py-2 "
        style={{ marginTop: "20px" }}
      >
        Save Description
      </button>

      {/*  add spec values */}
      <hr className="my-4" />
      <h5>Add Product Specs</h5>

      {specs.map((spec, index) => (
        <div className="d-flex mb-2" key={index}>
          <input
            type="text"
            className="form-control me-2"
            placeholder="Key"
            value={spec.key}
            onChange={(e) => handleSpecChange(index, "key", e.target.value)}
          />
          <input
            type="text"
            className="form-control me-2"
            placeholder="Value"
            value={spec.value}
            onChange={(e) => handleSpecChange(index, "value", e.target.value)}
          />
          <button
            className="btn btn-danger"
            onClick={() => handleRemoveSpec(index)}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="d-flex justify-content-between align-items-center mt-3">
      <button className="btn btn-success" onClick={handleFinalSubmit}>
        Save Specification
      </button>

      {specs[specs.length - 1].key.trim() &&
        specs[specs.length - 1].value.trim() && (
          <button className="btn btn-secondary " onClick={handleAddSpec}>
            + Add Spec
          </button>
        )}

      </div>


      <hr className="my-4" />
      <h5>Upload Product Images</h5>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="form-control mb-2"
        ref={fileInputRef}

      />
      <button className="btn btn-primary" onClick={handleUploadImages}>
        Upload Images
      </button>

      </div>
    );
};

export default Index;
