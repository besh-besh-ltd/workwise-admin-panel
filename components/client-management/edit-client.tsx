import Link from "next/link";
import React, { useEffect, useState } from "react";
import FormikField from "@/components/shared/FormikField";
import { Form, Formik, FormikErrors, FormikTouched } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import UploadFiles from "../shared/ImagesUpload";
import {
  handleGetClient,
  handleUpdateClient,
} from "@/utils/services/client-management";

interface ClientData {
  vendor_approve: string;
  status: number;
  vendor_image: string;
}

interface FormValues {
  name: string;
  status: string;
}

interface ApiError {
  error?: {
    response?: {
      data?: {
        errors?: Record<string, string>;
      };
    };
  };
}

interface ClientResponse {
  data: ClientData[];
}

interface UpdateResponse {
  message: string;
}

const EditBlog: React.FC = () => {
  const router = useRouter();
  const { id } = router?.query;
  const [categoryDropdown, setCategoryDropdown] = useState<unknown[]>([]);
  const [selectedBlogData, setSelectedBlogData] = useState<ClientData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFilesTds, setSelectedFilesTds] = useState<File[]>([]);
  const [selectedFilesQap, setSelectedFilesQap] = useState<File[]>([]);
  const [selectedFilesReset, setSelectedFilesReset] = useState<boolean>(false);

  const initialValues: FormValues = {
    name: selectedBlogData ? selectedBlogData?.vendor_approve : "",
    status: selectedBlogData ? String(selectedBlogData?.status) : "",
  };

  const getBlogsDetail = (): void => {
    if (id == undefined) return;
    handleGetClient(id as string)
      .then((res: ClientResponse) => {
        console.log("response===", res);
        setSelectedBlogData(res.data[0]);
      })
      .catch((error: ApiError) => {
        let txt = "";
        for (let x in error.error?.response?.data?.errors) {
          txt = error.error?.response?.data?.errors[x] || "";
        }
        toast.error(txt);
      });
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    status: yup.string().required("Status is required"),
  });

  const submitHandler = (values: FormValues, resetForm: () => void): void => {
    const payload = new FormData();
    payload.append(`name`, values.name);
    payload.append(`status`, values.status);
    payload.append(`logo`, selectedFiles[0]);
    payload.append(`tds`, selectedFilesTds[0]);

    handleUpdateClient(id as string, payload)
      .then((res: UpdateResponse) => {
        resetForm();
        toast.success(res.message);
        setTimeout(() => {
          router.push("/client-management");
        }, 1000);
      })
      .catch((error: ApiError) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x] || "";
        }
        toast.error(txt);
      });
  };

  useEffect(() => {
    getBlogsDetail();
  }, [id]);

  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Edit Client</h1>
          </div>
        </div>

        <section className="content p-2">
          <div className="container-fluid">
            <div className="text-left pb-4">
              <Link className="btn btn-primary" href="/client-management">
                <span className="fa fa-angle-left mr-2"></span>Go Back
              </Link>
            </div>
          </div>

          <div className="card col-12">
            <div className="card-body">
              <div className="container-fluid">
                <div className="col-md-12">
                  <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
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
                    }: {
                      errors: FormikErrors<FormValues>;
                      touched: FormikTouched<FormValues>;
                      values: FormValues;
                      handleChange: (e: React.ChangeEvent<unknown>) => void;
                      setFieldValue: (field: string, value: unknown) => void;
                    }) => (
                      <Form>
                        <div className="add-product">
                          <div className="col-sm-12">
                            <div className="form-group">
                              <FormikField
                                label="Name"
                                isRequired={true}
                                name="name"
                                touched={touched}
                                errors={errors}
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-12">
                              <div className="row">
                                <UploadFiles
                                  accept={[".png, .jpg, .jpeg, .gif"]}
                                  upload={setSelectedFiles}
                                  reset={selectedFilesReset}
                                  label="Logo [.JPG, .PNG, .jpeg]"
                                  isMultiple={false}
                                />
                              </div>
                              {selectedFiles?.length === 0 &&
                                selectedBlogData && (
                                  <div className="mb-4">
                                    <img
                                      src={
                                        selectedBlogData &&
                                        selectedBlogData?.vendor_image
                                      }
                                      style={{
                                        width: "80px",
                                        height: "80px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>
                                )}
                            </div>
                            <div className="col-md-12">
                              <div className="row">
                                <UploadFiles
                                  accept={[".pdf"]}
                                  upload={setSelectedFilesTds}
                                  reset={selectedFilesReset}
                                  label="Datasheet File [.PDF]"
                                  isMultiple={false}
                                />
                              </div>
                              {selectedFilesTds?.length === 0 &&
                                selectedBlogData && (
                                  <div className="mb-4">
                                    <i
                                      className="fa fa-file-pdf-o"
                                      style={{
                                        color: "red",
                                        fontSize: "31px",
                                      }}
                                    ></i>
                                  </div>
                                )}
                            </div>
                            <div className="col-md-12">
                            </div>
                            <div className="col-sm-4">
                              <div className="form-group">
                                <FormikField
                                  label="Status"
                                  type="select"
                                  isRequired={true}
                                  selectOptions={[
                                    {
                                      label: "Select Status",
                                      value: "",
                                      disabled: true,
                                    },
                                    { label: "Active", value: "1" },
                                    { label: "Inactive", value: "0" },
                                  ]}
                                  name="status"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>
                            <div className="d-flex float-left">
                              <button type="submit" className="btn btn-primary">
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EditBlog;
