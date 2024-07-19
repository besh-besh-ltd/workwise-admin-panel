import {
  handleAddSection,
  handleGetFaqList,
  handleAddFaq,
} from "@/utils/services/faq-management";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import TextEditor from "../editor";
import Link from "next/link";

const AddPageManagementComponent = () => {
  const [pageData, setPageData] = useState([]);
  const router = useRouter();
  const getPageLists = () => {
    handleGetFaqList()
      .then((res) => {
        setPageData(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  const initialValues = {
    question: "",
    description: "",
    status: "",
  };

  const validationSchema = yup.object().shape({
    question: yup.string().required("Question is required"),
    description: yup.string().required("Description is required"),
    status: yup.string().required("Status is required"),
  });

  /*   const submitHandler = (values, resetForm) => {
    console.log("values-->", values);
    handleAddFaq(values)
      .then((res) => {
        resetForm();
        toast(res.message);
        setTimeout(() => {
          router.push("/faq-management");
        }, 1000);
      })
      .catch((err) => console.log("err", err));
  }; */

  const submitHandler = (values, resetForm) => {
    /*  var formData = new FormData();
    console.log("values form--", values.question);
    // formData.append("question", values.question);
    // formData.append("description", values.description);
    // formData.append("status", values.status);
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        formData.append(key, values[key]);
      }
    } */
    // console.log("formData form--", formData);
    handleAddFaq(values)
      .then((res) => {
        console.log("res--", res);
        resetForm();
        toast("Banner Successfully added!");
        router.push("/faq-management");
      })
      .catch((err) => console.log("err", err));
  };
  useEffect(() => {
    handleGetFaqList();
  }, []);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Add FAQ</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* <div className="col-12 mb-3">
						<ol className="breadcrumb float-sm-left">
							<h5 className="heading-container">Add Section</h5>
						</ol>
					</div> */}
          <div className="text-left pb-4">
            <Link className="btn btn-primary" href="/faq-management">
              <span className="fa fa-angle-left mr-2"></span>Go Back
            </Link>
          </div>
          <div className="card col-12">
            <div className="card-body mt-3">
              <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue }) => (
                  <Form>
                    <div className="row mb-4">
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
                      <div class="col">
                        <label htmlFor="Organization-Address">Question</label>
                        <Field
                          type="text"
                          name="question"
                          class="form-control"
                          placeholder="Question"
                        />
                        <ErrorMessage
                          name="name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col">
                        <label htmlFor="Organization-Address">
                          Description
                        </label>
                        <TextEditor
                          content={values.description}
                          setContent={(value) => {
                            setFieldValue("description", value);
                          }}
                        />

                        <ErrorMessage
                          name="description"
                          render={(msg) => (
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
        <ToastContainer />
      </section>
    </>
  );
};

export default AddPageManagementComponent;
