import React from 'react'
import { createNotification } from '@/utils/services/notification';
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import TextEditor from "../editor";
import Link from "next/link";

const AddNotification = () => {
  const [notificationData, setNotificationData] = useState([]);
  const router = useRouter();

  const initialValues = {
    title: "",
    notification_type: "",
    name: "",
    status: "1",
    content: "",
    send_to: ""
  };

  const validationSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    notification_type: yup.string().required("Notification Type is required"),
    name: yup
    .string()
    .required("Name is required")
    .test("name-format", "Name must be in lowercase with words separated by '_' ", (value) => {
      if (!value) return true; // Allow empty string

      const words = value.toLowerCase().split("_");
      return words.every((word) => /^[a-z]+$/.test(word));
    }),
    content: yup.string().required("Content is required"),
    send_to: yup.string().required("Send to is required")
  });

  const submitHandler = (values, resetForm) => {
    createNotification(values)
      .then((res) => {
        resetForm();
        toast(res.message);
        setTimeout(() => {
          router.push("/system-notification");
        }, 1000);
      })
      .catch((error) => {
        if (error?.message) {
          toast.error(error.message.response.data.message, {
            position: "top-right",
          });
        }
        if (error.response?.status === 400) {
          if (error.response.data.status === 2) {
            let txt = "";
            for (let x in error.response.data.errors) {
              txt = error.response.data.errors[x];
            }
            toast.error(txt, {
              position: "top-right",
            });
          } else if (error.response.data.status === 3) {
            let txt = "";
            for (let x in error.response.data.errors) {
              txt = error.response.data.errors[x];
            }
            toast.error(txt, {
              position: "top-right",
            });
          } else {
            toast.error(error.response.data.message, {
              position: "top-right",
            });
          }
        } else {
          toast.error(error.message, {
            position: "top-right",
          });
        }
      });
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark">Add Notification</h1>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card ">
                <div className="card-body">
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
                        <div className="row">
                          <div className="col-md-6">
                            <div class="form-group">
                              <label for="inputEmail3" class="col-form-label">
                                Notification Type
                              </label>
                              <div>
                                <Field
                                  as="select"
                                  name="notification_type"
                                  class="form-select"
                                  id="inputEmail3"
                                  placeholder="Email"
                                >
                                  <option>Select</option>
                                  <option value={1}>Email</option>
                                  <option value={2}>Push Notification</option>
                                </Field>
                                <ErrorMessage
                                  name="notification_type"
                                  render={(msg) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div class="form-group">
                              <label for="inputEmail3" class="col-form-label">
                                Notification Title
                              </label>
                              <div class="">
                                <Field
                                  type="text"
                                  name="title"
                                  class="form-control"
                                  id="inputEmail3"
                                  placeholder=""
                                />
                                <ErrorMessage
                                  name="title"
                                  render={(msg) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div class="form-group">
                              <label for="inputEmail3" class="col-form-label">
                                Notification Name
                              </label>
                              <div class="">
                                <Field
                                  type="text"
                                  name="name"
                                  class="form-control"
                                  id="inputEmail3"
                                  placeholder=""
                                />
                                <ErrorMessage
                                  name="name"
                                  render={(msg) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div class="form-group">
                              <label for="inputEmail3" class="col-form-label">
                                Notification Content
                              </label>
                              <div class="">
                                <Field
                                  name="content"
                                  component="textarea"
                                  class="form-control"
                                  id="exampleFormControlTextarea1"
                                  rows="3"
                                />
                                <ErrorMessage
                                  name="content"
                                  render={(msg) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div class="form-group">
                              <label for="inputEmail3" class="col-form-label">
                                Send to
                              </label>
                              <div class="d-flex flex-wrap">
                                <div class="form-check col-md-4">
                                  <label className='mr-2'>
                                    <Field type="radio" name="send_to" value="1" />
                                    Every One
                                  </label>
                                  <label className='mr-2'>
                                    <Field type="radio" name="send_to" value="2" />
                                    Buyer
                                  </label>
                                  <label className='mr-2'>
                                    <Field type="radio" name="send_to" value="3" />
                                    Vendors
                                  </label>
                                  <label>
                                    <Field type="radio" name="send_to" value="4" />
                                    Paid User
                                  </label>
                                  <label className='mr-2'>
                                    <Field type="radio" name="send_to" value="5" />
                                    Unpaid User
                                  </label>
                                  <ErrorMessage
                                    name="send_to"
                                    render={(msg) => (
                                      <div className="form-error">{msg}</div>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='pull-right'>
                          <button class="btn btn-primary float-center">
                            Add Notification
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >
    </>
  )
}

export default AddNotification