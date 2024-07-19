import React, { useEffect, useRef, useState } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import * as yup from "yup";
import {
  handleAddBanner,
  getPageList,
} from "@/utils/services/banner-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import { Editor } from "@tinymce/tinymce-react";

const AddBanner = () => {
  const router = useRouter();
  const [allPageList, setAllPageList] = useState([]);
  const [loading, setloading] = useState(false);
  const [listLoading, setlistLoading] = useState(false);
  const uploadedImage = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileType, setFileType] = useState([]);
  const [image, setImage] = useState(null);
  const editorRef = useRef(null);
  useEffect(() => {
    getAllPageList();
  }, []);

  const getAllPageList = () => {
    setloading(true);
    setlistLoading(true);
    getPageList().then((res) => {
      setloading(false);
      setlistLoading(false);
      setAllPageList(res.data);
    });
  };

  const submitHandler = (values, resetForm) => {   
    var formData = new FormData();
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        if (key == "image") {
          if (selectedFile != "") {
            formData.append("file", image);
          }
        } else {
          formData.append(key, values[key]);
        }
      }
    }
    handleAddBanner(formData)
      .then((res) => {
        resetForm();
        toast('Banner Successfully added!');
        router.push("/banner-management");
      })
      .catch((err) => console.log("err", err));
  };
  const imageUploadHandler = (events) => {
    const [file] = events.target.files;
    setImage(events.target.files[0]);
    if (file) {
      const reader = new FileReader();
      const { current } = uploadedImage;
      current.file = file;
      reader.onload = (events) => {
        current.src = events.target.result;
        setSelectedFile(current.src);
      };
      reader.readAsDataURL(file);
      setFileType(file.type);
    }
  };
  const onEditorInit = (editor) => {
    editorRef.current = editor;
  };
  const handleOnEditorChange = (setFieldValue) => {
    if (editorRef.current) {
      let editorvalue = editorRef.current.getContent();
      setFieldValue("content", editorvalue);
    }
  };
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark"> Add Banner</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="col-12 offset-md-0">
            <div className="text-left pb-4">
              <Link className="btn btn-primary" href="/banner-management">
                <span className="fa fa-angle-left mr-2"></span>Go Back
              </Link>
            </div>
            <div class="card ">
              <div class="card-body mt-3">
                <Formik
                  initialValues={{
                    page_id: "",
                    image: "",
                    status: "1",
                    content: " ",
                  }}
                  validationSchema={yup.object().shape({
                    page_id: yup.string().required("Page id is required"),
                    status: yup.string().required("Status id is required"),
                    image: yup
                      .mixed()
                      .nullable()
                      .required("Please select a file"),
                  })}
                  onSubmit={(values, { resetForm }) => {
                    submitHandler(values, resetForm);
                  }}
                >
                  {({
                    errors,
                    touched,
                    values,
                    handleChange,
                    setFieldValue,
                  }) => (
                    <Form>
                      <div class="row mb-4">
                        <div class="col">
                          <label htmlFor="parent_id">Page ID *</label>
                          <Field
                            as="select"
                            name="page_id"
                            className="form-control"
                            id="page_id"
                          >
                            <option value="">Select Page ID</option>
                            {allPageList &&
                              allPageList.map((item) => {
                                return (
                                  <option value={`${item?.id}`}>
                                    {item?.name}
                                  </option>
                                );
                              })}
                          </Field>
                          {touched.page_id && errors.page_id && (
                            <div className="form-error">{errors.page_id}</div>
                          )}
                        </div>
                        <div class="col">
                          <label htmlFor="Status">Status</label>
                          <Field
                            as="select"
                            name="status"
                            class="form-control"
                            placeholder="Status"
                          >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                          </Field>
                          <ErrorMessage
                            name="status"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                      </div>
                      {/* <div class="row mb-4">
                        <div class="col">
                          <label htmlFor="Organization-Address">Content</label>
                          <Field
                            type="text"
                            name="content"
                            class="form-control"
                            placeholder="Content"
                          />
                          <ErrorMessage
                            name="content"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                      </div> */}

                      <div class="row mb-4">
                        <div class="col">
                        <div className="form-group">
                          <label htmlFor="address">Description *</label>
                          <div className="">
                            <Editor
                              name="content"
                              apiKey="wl0nyw8toagm8q8ngybdkcmq8xvyh1o9ncw1ptw9liaofo4w"
                              onInit={(evt, editor) => onEditorInit(editor)}
                              initialValue={``}
                              onKeyUp={() =>
                                handleOnEditorChange(setFieldValue)
                              }
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
                                content_style:
                                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                              }}
                            />
                            {touched.content && errors.content && (
                              <div className="form-error">{errors.content}</div>
                            )}
                          </div>
                        </div>

                        </div>
                      </div>

                      <div class="row mb-4">
                        <div class="col">
                          <label htmlFor="Organization-Address">Image</label>
                          {/* <Field
                            //   id="file"
                            name="image"
                            type="file"
                            value={undefined}
                            className="form-control"
                            onChange={(event) => {
                              let files = event.target.files[0];
                              setFieldValue("image", files);
                            }}
                          /> */}
                          <div className="">
                            <input
                              id="image"
                              name="image"
                              type="file"
                              onChange={(event) => {
                                imageUploadHandler(event);
                                setFieldValue(
                                  "image",
                                  event.currentTarget.files[0]
                                );
                              }}
                            />
                            <div>
                              <img
                                ref={uploadedImage}
                                className="max-width-image mt-4"
                              />
                            </div>
                            {/* <span className="fa fa-map-marker form-control-feedback formleftIcon"></span> */}
                            {touched.image && errors.image && (
                              <div className="form-error">{errors.image}</div>
                            )}
                          </div>
                          <ErrorMessage
                            name="image"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button type="submit" class="btn btn-secondary">
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

export default AddBanner;
