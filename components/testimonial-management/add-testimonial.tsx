import Link from "next/link";
import React, { useState } from "react";
import FormikField from "@/components/shared/FormikField";
import {Form, Formik, FormikErrors, FormikTouched } from "formik";
import * as yup from "yup";
import UploadFiles from "@/components/shared/ImagesUpload";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { handleAddTestimonial } from "@/utils/services/testimonial-management";

interface FormValues {
  title: string;
  created_name: string;
  description: string;
  status: string;
  pageId: string;
  url: string;
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

const AddTestimonial: React.FC = () => {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFilesCreated, setSelectedFilesCreated] = useState<File[]>([]);
  const [selectedFilesReset, setSelectedFilesReset] = useState<boolean>(false);

  const initialValues: FormValues = {
    title: "",
    created_name: "",
    description: "",
    status: "",
    pageId: "",
    url: "",
  };

  const validationSchema = yup.object().shape({
    title: yup.string().required("Title Name is required"),
    created_name: yup.string().required("Created Name is required"),
    description: yup.string().required("Description is required"),
    status: yup.string().required("Status is required"),
    pageId: yup.string().required("Page is required"),
    url: yup.string().url("Invalid URL").required("URL is required")
});

  const submitHandler = (values: FormValues, resetForm: () => void): void => {

    // TESTOMINAL IMAGE IS REQUIRED
    if(!selectedFilesCreated[0]){
      toast.error("Testemonial Image is required");
      return;
    }

    let payload = {
      ...values,
      // image: selectedFiles[0],
      created_image: selectedFilesCreated[0],
    }
    // const payload = new FormData();
    // payload.append(`title`, values.title);
    // payload.append(`created_name`, values.created_name);
    // payload.append(`description`, values.description);
    // payload.append(`status`, values.status);
    // payload.append(`image`, selectedFiles[0]);
    // payload.append(`created_image`, selectedFilesCreated[0]);
    // payload.append(`url`, values.url);
    /*  selectedFiles.forEach((file, i) => {
      payload.append(`image`, file, file.name);
    }); */

    handleAddTestimonial(payload)
      .then((res: { message: string }) => {
        resetForm();
        toast.success(res.message);
        setTimeout(() => {
          router.push("/testimonial-management");
        }, 2000);
      })
      .catch((error: ApiError) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };
  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Add Testimonial</h1>
          </div>
        </div>
      </div>

      <section className="content p-2">
        <div className="container-fluid">
          <div className="text-left pb-4">
            <Link className="btn btn-primary" href="/testimonial-management">
              <span className="fa fa-angle-left mr-2"></span>Go Back
            </Link>
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
                      handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
                      setFieldValue: (field: string, value: any) => void;
                    }) => (
                      <Form>
                        <div className="add-product">
                          <div className="col-sm-4">
                            <div className="form-group">
                              <FormikField
                                label="Title"
                                isRequired={true}
                                name="title"
                                touched={touched}
                                errors={errors}
                              />
                            </div>

                            <div className="form-group">
                              <FormikField
                                label="Testimony Name"
                                isRequired={true}
                                name="created_name"
                                touched={touched}
                                errors={errors}
                              />
                            </div>
                          </div>

                          <div className="col-md-12">
                            <div className="form-group">
                              <FormikField
                                label="Testimonial Description"
                                type="textarea"
                                isRequired={true}
                                name="description"
                                touched={touched}
                                errors={errors}
                                className="text-editor-area"
                                cols={30}
                                rows={10}
                              />
                            </div>
                          </div>

                          <div className="row">
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

                            <div className="col-sm-4">
                              <div className="form-group">
                                <FormikField
                                  label="View On"
                                  type="select"
                                  isRequired={true}
                                  selectOptions={[
                                    {
                                      label: "Select Page",
                                      value: "",
                                      disabled: true,
                                    },
                                    { label: "Home Page", value: "1" },
                                    { label: "Vendor Page", value: "6" },
                                  ]}
                                  name="pageId"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="form-group">
                                <FormikField
                                  label="URL"
                                  isRequired={true}
                                  name="url"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>
                          </div>

                          {/* <div className="col-md-12">
                            <div className="row">
                              <UploadFiles
                                accept=".png, .jpg, .jpeg, .gif"
                                upload={setSelectedFiles}
                                reset={selectedFilesReset}
                                label="Upload Image"
                                isMultiple={false}
                                touched={touched}
                                errors={errors}
                              />
                            </div>
                          </div> */}
                          <div className="col-md-12">
                            <div className="row">
                              <UploadFiles
                                accept={[".png, .jpg, .jpeg, .gif"]}
                                upload={setSelectedFilesCreated}
                                reset={selectedFilesReset}
                                label="Testimony Image *"
                                isMultiple={false}
                                touched={touched}
                                errors={errors}
                              />
                              {/* {touched.featured && errors.featured && <div className="form-error">{errors.featured}</div>} */}
                            </div>
                          </div>
                          <div className="d-flex float-left">
                            <button type="submit" className="btn btn-primary">
                              Save
                            </button>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AddTestimonial;
