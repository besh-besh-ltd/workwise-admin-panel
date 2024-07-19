import {
  handleAddSection,
  handleGetPageContentDetail,
  handleGetPageList,
  handleUpdateSection,
} from "@/utils/services/page-management";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import TextEditor from "../editor";
import Link from "next/link";

const EditPageManagementComponent = () => {
  const [pageData, setPageData] = useState([]);
  const [pageDetails, setPageDetails] = useState({
    page_id: "",
    section_name: "",
    content: "",
  });
  const router = useRouter();
  const id = router.query.id;
  const getPageLists = () => {
    handleGetPageList()
      .then((res) => {
        setPageData(res.data);
      })
      .catch((err) => console.log("err", err));
  };
  const getPageDetails = () => {
    handleGetPageContentDetail(id)
      .then((res) => {
        setPageDetails({
          page_id: res.data.page_id.toString(),
          section_name: res.data.section_name,
          content: res.data.content,
        });
      })
      .catch((err) => console.log("err", err));
  };

  const validationSchema = yup.object().shape({
    page_id: yup.string().required("Page is required"),
    section_name: yup.string().required("Section is required"),
    content: yup.string().required("Content is required"),
  });

  const submitHandler = (values, resetForm) => {
    handleUpdateSection(values, id)
      .then((res) => {
        toast(res.message);
        setTimeout(() => {
          router.push("/page-management");
        }, 1000);
      })
      .catch((err) => console.log("err", err));
  };
  useEffect(() => {
    if (id) {
      getPageLists();
      getPageDetails();
    }
  }, [id]);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Edit Section</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="text-left pb-4">
            <Link className="btn btn-primary" href="/page-management">
              <span className="fa fa-angle-left mr-2"></span>Go Back
            </Link>
          </div>
          {/* <div className="col-12 mb-3">
						<ol className="breadcrumb float-sm-left">
							<h5 className="heading-container">Edit Section</h5>
						</ol>
					</div> */}
          <div className="card col-12">
            <div className="card-body mt-3">
              <Formik
                enableReinitialize={true}
                initialValues={pageDetails}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue }) => (
                  <Form>
                    <div className="row mb-4">
                      <div className="col">
                        <label htmlFor="Organization-Address">Page</label>
                        <Field
                          as="select"
                          name="page_id"
                          className="form-control"
                          placeholder="Page"
                        >
                          <option key="01" value="" disabled>
                            Select Page
                          </option>
                          {pageData?.map((item, index) => {
                            return (
                              <option key={index} value={item.id}>
                                {item.name}
                              </option>
                            );
                          })}
                        </Field>
                        <ErrorMessage
                          name="page_id"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div className="col">
                        <label htmlFor="Section">Section</label>
                        <Field
                          type="text"
                          name="section_name"
                          readonly="true"
                          className="form-control"
                          placeholder="Section"
                        />
                        <ErrorMessage
                          name="section_name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div className="row mb-4">
                      <div className="col">
                        <label htmlFor="Organization-Address">Content</label>
                        <TextEditor
                          content={values.content}
                          setContent={(value) => {
                            setFieldValue("content", value);
                          }}
                        />

                        <ErrorMessage
                          name="content"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-secondary">
                        Update
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

export default EditPageManagementComponent;
