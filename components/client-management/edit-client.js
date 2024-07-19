import Link from "next/link";
import React, { useEffect, useState } from "react";
import pdf from "../../public/assets/images/pdf.png";
import FormikField from "@/components/shared/FormikField";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import UploadFiles from "../shared/ImagesUpload";
import {
  //   handleBlogCategoryList,
  handleGetClient,
  handleGetClientList,
  handleUpdateClient,
} from "@/utils/services/client-management";

const EditBlog = () => {
  const router = useRouter();
  const { id } = router?.query;
  const [categoryDropdown, setCategoryDropdown] = useState([]);
  const [selectedBlogData, setSelectedBlogData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesTds, setSelectedFilesTds] = useState([]);
  const [selectedFilesQap, setSelectedFilesQap] = useState([]);
  const [selectedFilesReset, setSelectedFilesReset] = useState(false);

  const initialValues = {
    name: selectedBlogData ? selectedBlogData?.vendor_approve : "",
    status: selectedBlogData ? selectedBlogData?.status : "",
  };

  const getBlogsDetail = () => {
    if (id == undefined) return;
    handleGetClient(id)
      .then((res) => {
        console.log("response===", res);
        setSelectedBlogData(res.data[0]);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    status: yup.string().required("Status is required"),
    // tds: yup.string().required("tds is required"),
    // name: yup.string().required("Name is required"),
    // name: yup.string().required("Name is required"),
  });

  const submitHandler = (values, resetForm) => {
    const payload = new FormData();
    payload.append(`name`, values.name);
    payload.append(`status`, values.status);
    payload.append(`logo`, selectedFiles[0]);
    payload.append(`tds`, selectedFilesTds[0]);
    // payload.append(`qap`, selectedFilesQap[0]);
    /*     if (selectedFiles?.length > 0) {
      selectedFiles.forEach((file, i) => {
        payload.append(`image`, file, file.name);
      });
    } */
    handleUpdateClient(id, payload)
      .then((res) => {
        resetForm();
        toast.success(res.message);
        setTimeout(() => {
          router.push("/client-management");
        }, 1000);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  /*   const getBlogCategory = () => {
    handleBlogCategoryList()
      .then((res) => {
        let arr = res?.data?.map((item) => {
          return {
            label: item?.title,
            value: item?.id,
          };
        });
        setCategoryDropdown(arr);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  }; */

  useEffect(() => {
    // getBlogCategory();
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
                    {({
                      errors,
                      touched,
                      values,
                      handleChange,
                      setFieldValue,
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
                                  accept=".png, .jpg, .jpeg, .gif"
                                  upload={setSelectedFiles}
                                  reset={selectedFilesReset}
                                  label="Logo [.JPG, .PNG, .jpeg]"
                                  isMultiple={false}
                                  touched={touched}
                                  errors={errors}
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
                                  accept=".pdf"
                                  upload={setSelectedFilesTds}
                                  reset={selectedFilesReset}
                                  label="Datasheet File [.PDF]"
                                  isMultiple={false}
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                              {selectedFilesTds?.length === 0 &&
                                selectedBlogData && (
                                  <div className="mb-4">
                                    <i
                                      class="fa fa-file-pdf-o"
                                      style={{
                                        color: "red",
                                        fontSize: "31px",
                                      }}
                                    ></i>
                                  </div>
                                )}
                            </div>
                            <div className="col-md-12">
                              {/* {console.log(
                                "selectedBlogData-->",
                                selectedBlogData
                              )} */}
                              {/* <div className="row">
                                <UploadFiles
                                  accept=".pdf"
                                  upload={setSelectedFilesQap}
                                  reset={selectedFilesReset}
                                  label="QAP File [.PDF]"
                                  isMultiple={false}
                                  touched={touched}
                                  errors={errors}
                                />
                                {selectedFilesQap?.length === 0 &&
                                  selectedBlogData && (
                                    <div className="mb-4">
                                      <i
                                        class="fa fa-file-pdf-o"
                                        style={{
                                          color: "red",
                                          fontSize: "31px",
                                        }}
                                      ></i>
                                    </div>
                                  )}
                              </div> */}
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
                              <button type="submit" class="btn btn-primary">
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
