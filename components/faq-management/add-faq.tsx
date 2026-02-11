import {
  handleGetFaqList,
  handleAddFaq,
} from "@/utils/services/faq-management";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import TextEditor from "../editor";
import Link from "next/link";

interface FaqItem {
  id: number | string;
  question: string;
  content: string;
  status: number;
}

interface FormValues {
  question: string;
  description: string;
  status: string;
}

const AddPageManagementComponent: React.FC = () => {
  const [pageData, setPageData] = useState<FaqItem[]>([]);
  const router = useRouter();
  const getPageLists = (): void => {
    handleGetFaqList(1)
      .then((res : any) => {
        setPageData(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  const initialValues: FormValues = {
    question: "",
    description: "",
    status: "",
  };

  const validationSchema = yup.object().shape({
    question: yup.string().required("Question is required"),
    description: yup.string().required("Description is required"),
    status: yup.string().required("Status is required"),
  });

  const submitHandler = (values: FormValues, resetForm: () => void): void => {
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
    handleGetFaqList(1);
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
                onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue }) => (
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
                          name="name"
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
        <ToastContainer />
      </section>
    </>
  );
};

export default AddPageManagementComponent;
