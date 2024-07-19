import Link from "next/link";
import React, { useEffect, useState } from "react";
import FormikField from "@/components/shared/FormikField";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import {
  handleGetTestimonialDetails,
  handleUpdateTestimonial,
} from "@/utils/services/testimonial-management";
import UploadFiles from "../shared/ImagesUpload";

const EditTestimonial = () => {
  const router = useRouter();
  const { id } = router?.query;
  const [testimonialDetails, setTestimonialDetails] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesCreated, setSelectedFilesCreated] = useState([]);
  const [selectedFilesReset, setSelectedFilesReset] = useState(false);

  const initialValues = {
    title: testimonialDetails ? testimonialDetails[0]?.title : "",
    created_name: testimonialDetails ? testimonialDetails[0]?.created_name : "",
    description: testimonialDetails ? testimonialDetails[0]?.description : "",
    status: testimonialDetails ? testimonialDetails[0]?.status : "",
    url: testimonialDetails ? testimonialDetails[0]?.url : "",
  };

  const validationSchema = yup.object().shape({
    title: yup.string().required("Title Name is required"),
    created_name: yup.string().required("Created Name is required"),
    description: yup.string().required("Description is required"),
    status: yup.string().required("Status is required"),
    url: yup.string().url("Invalid URL").required("URL is required"),
  });

  const submitHandler = (values, resetForm) => {
    const payload = new FormData();
    payload.append(`title`, values.title);
    payload.append(`created_name`, values.created_name);
    payload.append(`description`, values.description);
    payload.append(`status`, values.status);
    payload.append(`url`, values.url);
    if (selectedFiles?.length > 0) {
      payload.append(`image`, selectedFiles[0]);
    } else {
      payload.append(`image`, "");
    }
    if (selectedFilesCreated?.length > 0) {
      payload.append(`created_image`, selectedFilesCreated[0]);
    } else {
      payload.append(`created_image`, "");
    }

    /*     if (selectedFiles?.length > 0) {
      selectedFiles.forEach((file, i) => {
        payload.append(`image`, file, file.name);
      });
    } */

    handleUpdateTestimonial(id, payload)
      .then((res) => {
        toast.success(res?.message);
        resetForm();
        setTimeout(() => {
          router.push(`/testimonial-management`);
        }, 1000);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
  };

  const getTestimonialDetails = () => {
    handleGetTestimonialDetails(id)
      .then((res) => {
        setTestimonialDetails(res?.data);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
      });
  };

  useEffect(() => {
    console.log(selectedFiles, "selectedFiles *");
  }, [selectedFiles]);

  useEffect(() => {
    if (id) {
      getTestimonialDetails();
    }
  }, [id]);
  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Edit Testimonial</h1>
          </div>
        </div>

        <section className="content p-2">
          <div className="container-fluid">
            <div className="text-left pb-4">
              <Link className="btn btn-primary" href="/testimonial-management">
                <span className="fa fa-angle-left mr-2"></span>Go Back
              </Link>
            </div>
          </div>

          <div class="card col-12">
            <div class="card-body">
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
                    {({ errors, touched }) => (
                      <Form>
                        <div className="add-product">
                          <div className="col-sm-12">
                            <div className="form-group">
                              <FormikField
                                label="Title"
                                isRequired={true}
                                name="title"
                                touched={touched}
                                errors={errors}
                              />
                            </div>
                          </div>

                          <div className="col-sm-12">
                            <div className="form-group">
                              <FormikField
                                label="Testimony name"
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
                                cols="30"
                                rows="10"
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
                                  label="URL"
                                  isRequired={true}
                                  name="url"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="col-md-12">
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
                            {selectedFiles?.length === 0 &&
                              testimonialDetails &&
                              testimonialDetails?.length > 0 && (
                                <div className="mb-4">
                                  <img
                                    src={
                                      testimonialDetails &&
                                      testimonialDetails[0]?.image_url
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
                                accept=".png, .jpg, .jpeg, .gif"
                                upload={setSelectedFilesCreated}
                                reset={selectedFilesReset}
                                label="Testimony Image"
                                isMultiple={false}
                                touched={touched}
                                errors={errors}
                              />
                            </div>
                            {selectedFilesCreated?.length === 0 &&
                              testimonialDetails &&
                              testimonialDetails?.length > 0 && (
                                <div className="mb-4">
                                  <img
                                    src={
                                      testimonialDetails &&
                                      testimonialDetails[0]?.created_image_url
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
                          <div className="d-flex float-left">
                            <button type="submit" class="btn btn-primary">
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
        </section>
      </div>
    </>
  );
};

export default EditTestimonial;
