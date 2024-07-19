import React, { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import * as yup from "yup";
import {
  handleAddOtherUser,
  handleGetOtherUserDetails,
  handleUpdateOtherUser,
} from "@/utils/services/other-user-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";

const UpdateOtherUser = () => {
  const [dtaCount, setdtaCount] = useState(0);
  const [editDetails, seteditDetails] = useState("");
  const router = useRouter();
  let id = router.query.id;
  if (id != undefined && dtaCount == 0) {
    seteditDetails(JSON.parse(localStorage.getItem("otherUserUpdate")));
    setdtaCount(1);
  }
  const initialValues = {
    name: editDetails?.name,

    mobile: editDetails?.mobile,
    organization_name: editDetails?.organization_name,
    image: "",
  };
  const submitHandler = (values, resetForm) => {
    handleUpdateOtherUser(values, editDetails)
      .then((res) => {
        resetForm();
        toast(res.message);
        router.push("/other-user-management");
      })
      .catch((error) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
  };
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2"></div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Update Other User</h5>
            </ol>
          </div>
          <div class="card col-12">
            <div class="card-body mt-3">
              <Formik
                initialValues={initialValues}
                validationSchema={yup.object().shape({
                  name: yup.string().required("Name is required"),
                  organization_name: yup
                    .string()
                    .required("Organization is required"),
                  mobile: yup
                    .string()
                    .matches(
                      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                      "please enter valid mobile number"
                    )
                    .min(10)
                    .max(11)
                    .required("mobile is required"),
                })}
                onSubmit={(values, { resetForm }) => {
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue }) => (
                  <Form>
                    <div class="row mb-4">
                      <div class="col">
                        <label htmlFor="Organization-Address">Name</label>
                        <Field
                          type="text"
                          name="name"
                          class="form-control"
                          placeholder="name"
                        />
                        <ErrorMessage
                          name="name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div class="row mb-4">
                      <div class="col">
                        <label htmlFor="Organization-Address">Mobile</label>
                        <Field
                          type="number"
                          name="mobile"
                          class="form-control"
                          placeholder="Mobile"
                        />
                        <ErrorMessage
                          name="mobile"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col">
                        <label htmlFor="Organization-Address">
                          Organization
                        </label>
                        <Field
                          type="text"
                          name="organization_name"
                          class="form-control"
                          placeholder="Organization"
                        />
                        <ErrorMessage
                          name="organization_name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div class="row mb-4">
                      <div class="col">
                        <label htmlFor="Organization-Address">Image</label>
                        <Field
                          //   id="file"
                          name="image"
                          type="file"
                          value={undefined}
                          className="form-control"
                          onChange={(event) => {
                            let files = event.target.files[0];
                            setFieldValue("image", files);
                          }}
                        />
                        {editDetails?.organization_name != null && (
                          <div style={{ display: "flex" }}>
                            <label htmlFor="year">
                              Prefilled Image-&nbsp;{" "}
                            </label>
                            <p htmlFor="year">
                              {" "}
                              {editDetails?.organization_name}
                            </p>
                          </div>
                        )}
                        <ErrorMessage
                          name="image"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="submit" class="btn btn-secondary">
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

export default UpdateOtherUser;
