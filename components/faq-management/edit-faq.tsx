import React, { useEffect, useRef, useState } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray, FormikHelpers } from "formik";
import * as yup from "yup";
import { handleGetFaq, handleUpdateFaq } from "@/utils/services/faq-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Link from "next/link";
import TextEditor from "../editor";

interface FaqDetails {
  id?: number | string;
  question: string;
  description: string;
  status: number | string;
}

interface FormValues {
  status: string;
  question: string;
  description: string;
}

const EditFaq: React.FC = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [currentFaqDetails, setCurrentFaqDetails] = useState<FaqDetails | null>(null);

  const getFaqDetails = (): void => {
    handleGetFaq(id)
      .then((res : any) => {
        setCurrentFaqDetails(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  useEffect(() => {
    if (id) {
      getFaqDetails();
    }
  }, [id]);

  const submitHandler = (values: FormValues, resetForm: () => void): void => {
    const updatedValues = {
      ...values,
      status: values?.status ? values?.status.toString() : ""
    };
    handleUpdateFaq(updatedValues, id)
      .then((res : any) => {
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
            <h1 className="m-0 text-dark"> Update FAQ</h1>
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
            <div className="card ">
              <div className="card-body mt-3">
                <Formik
                  enableReinitialize={true}
                  initialValues={{
                    status:
                      currentFaqDetails?.status != undefined ||
                        currentFaqDetails?.status != null
                        ? String(currentFaqDetails?.status)
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
                        <div className="col">
                          <label htmlFor="Organization-Address">Question</label>
                          <Field
                            type="text"
                            name="question"
                            className="form-control"
                            placeholder="Question"
                          />
                          <ErrorMessage
                            name="question"
                            render={(msg: string) => (
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
                            setContent={(value: string) => {
                              setFieldValue("description", value);
                            }}
                          />

                          <ErrorMessage
                            name="description"
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

export default EditFaq;
