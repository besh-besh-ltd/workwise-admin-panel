import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray, FormikHelpers } from "formik";
import * as yup from "yup";
import {
  handleAddBanner,
  getPageList,
} from "@/utils/services/banner-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import { Editor } from "@tinymce/tinymce-react";

interface PageItem {
  id: number | string;
  name: string;
}

interface FormValues {
  page_id: string;
  image: File | string;
  status: string;
  content: string;
}

interface EditorRef {
  getContent: () => string;
}

const AddBanner: React.FC = () => {
  const router = useRouter();
  const [allPageList, setAllPageList] = useState<PageItem[]>([]);
  const [loading, setloading] = useState<boolean>(false);
  const [listLoading, setlistLoading] = useState<boolean>(false);
  const uploadedImage = React.useRef<HTMLImageElement>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileType, setFileType] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const editorRef = useRef<EditorRef | null>(null);
  useEffect(() => {
    getAllPageList();
  }, []);

  const getAllPageList = (): void => {
    setloading(true);
    setlistLoading(true);
    getPageList().then((res : any) => {
      setloading(false);
      setlistLoading(false);
      setAllPageList(res.data);
    });
  };

  const submitHandler = (values: FormValues, resetForm: () => void): void => {
    var formData = new FormData();
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        if (key == "image") {
          if (selectedFile != "" && image) {
            formData.append("file", image);
          }
        } else {
          formData.append(key, (values as Record<string, any>)[key]);
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
  const imageUploadHandler = (events: ChangeEvent<HTMLInputElement>): void => {
    const files = events.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      const current = uploadedImage.current;
      if (current) {
        (current as any).file = file;
        reader.onload = (e) => {
          if (e.target?.result) {
            current.src = e.target.result as string;
            setSelectedFile(current.src);
          }
        };
        reader.readAsDataURL(file);
        setFileType([file.type]);
      }
    }
  };
  const onEditorInit = (editor: EditorRef): void => {
    editorRef.current = editor;
  };
  const handleOnEditorChange = (setFieldValue: (field: string, value: any) => void): void => {
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
            <h1 className="m-0 text-dark"> Add Banner</h1>
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
            <div className="card ">
              <div className="card-body mt-3">
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
                  onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
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
                      <div className="row mb-4">
                        <div className="col">
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
                                  <option key={item.id} value={`${item?.id}`}>
                                    {item?.name}
                                  </option>
                                );
                              })}
                          </Field>
                          {touched.page_id && errors.page_id && (
                            <div className="form-error">{errors.page_id}</div>
                          )}
                        </div>
                        <div className="col">
                          <label htmlFor="Status">Status</label>
                          <Field
                            as="select"
                            name="status"
                            className="form-control"
                            placeholder="Status"
                          >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                          </Field>
                          <ErrorMessage
                            name="status"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                      </div>

                      <div className="row mb-4">
                        <div className="col">
                          <div className="form-group">
                            <label htmlFor="address">Description *</label>
                            <div className="">
                              <Editor
                                apiKey="wl0nyw8toagm8q8ngybdkcmq8xvyh1o9ncw1ptw9liaofo4w"
                                onInit={(evt, editor) => onEditorInit(editor as unknown as EditorRef)}
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

                      <div className="row mb-4">
                        <div className="col">
                          <label htmlFor="Organization-Address">Image</label>
                          <div className="">
                            <input
                              id="image"
                              name="image"
                              type="file"
                              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                imageUploadHandler(event);
                                setFieldValue(
                                  "image",
                                  event.currentTarget.files?.[0]
                                );
                              }}
                            />
                            <div>
                              <img
                                ref={uploadedImage}
                                className="max-width-image mt-4"
                              />
                            </div>
                            {touched.image && errors.image && (
                              <div className="form-error">{errors.image}</div>
                            )}
                          </div>
                          <ErrorMessage
                            name="image"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
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

export default AddBanner;
