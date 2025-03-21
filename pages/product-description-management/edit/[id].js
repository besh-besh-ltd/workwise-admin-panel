import { getOneProductDescription, editProductsDescription } from "@/utils/services/product-management";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";

const Index = () => {
  const [oneProductDescription, setOneProductDescription] = useState({});
  const editorRef = useRef(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      getOneProductDescription(id)
        .then((res) => setOneProductDescription(res.data))
        .catch((err) => console.log(err));
    }
  }, [id]);

  const handleSubmit = async () => {
    if (editorRef.current) {
      const updatedDescription = editorRef.current.getContent();

      const { created_at, ...filteredProduct } = oneProductDescription;
      const productObj = {
        ...filteredProduct,
        description: updatedDescription
      };
      try {
        await editProductsDescription(productObj);
        alert("Product description updated successfully!");
      } catch (error) {
        console.error("Error updating product description:", error);
      }
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
        style = {{marginTop:"20px"}}
      >
        Save Description
      </button>
    </div>
  );
};

export default Index;
