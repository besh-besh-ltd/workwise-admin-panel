import React, { useEffect, useRef, useState } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import * as yup from "yup";
import { handleGetFaq, handleUpdateFaq } from "@/utils/services/faq-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import TextEditor from "../editor";

const EditFaq = () => {
  const router = useRouter();
  const id = router.query.id;

  const [currentFaqDetails, setCurrentFaqDetails] = useState([]);

  const getFaqDetails = () => {
    handleGetFaq(id)
      .then((res) => {
        setCurrentFaqDetails(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  useEffect(() => {
    if (id) {
      getFaqDetails();
    }
  }, [id]);

  const submitHandler = (values, resetForm) => {
    values.status = values?.status ? values?.status.toString() : "";
    handleUpdateFaq(values, id)
      .then((res) => {
        toast(res.message);
        setTimeout(() => {
          router.push("/faq-management");
        }, 1000);
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark"> Update FAQ</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="col-12 offset-md-0">
            <div className="text-left pb-4">
              <Link className="btn btn-primary" href="/faq-management">
                <span className="fa fa-angle-left mr-2"></span>Go Back
              </Link>
            </div>
            <div class="card ">
              <div class="card-body mt-3">
                <Formik
                  enableReinitialize={true}
                  initialValues={{
                    status:
                      currentFaqDetails?.status != undefined ||
                      currentFaqDetails?.status != null
                        ? currentFaqDetails?.status
                        : "1",
                    question: currentFaqDetails?.question || "",
                    description: currentFaqDetails?.description || "",
                  }}
                  validationSchema={yup.object().shape({
                    question: yup.string().required("Question id is required"),
                    status: yup.string().required("Status id is required"),
                    description: yup
                      .string()
                      .required("Description is required"),
                  })}
                  onSubmit={(values, { resetForm }) => {
                    // console.log("values ==>>>", values);
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
                            name="question"
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
        </div>
        <ToastContainer />
      </section>
    </>
  );
};

export default EditFaq;
