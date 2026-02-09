import React from 'react'
import { createNotification } from '@/utils/services/notification';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import TextEditor from "../editor";
import Link from "next/link";

interface NotificationFormValues {
  title: string;
  notification_type: string;
  name: string;
  status: string;
  content: string;
  send_to: string;
}

interface ApiError {
  message?: {
    response: {
      data: {
        message: string;
      };
    };
  };
  response?: {
    status: number;
    data: {
      status: number;
      message: string;
      errors: Record<string, string>;
    };
  };
}

const AddNotification: React.FC = () => {
  const [notificationData, setNotificationData] = useState<unknown[]>([]);
  const router = useRouter();

  const initialValues: NotificationFormValues = {
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

  const submitHandler = (values: NotificationFormValues, resetForm: () => void): void => {
    createNotification(values)
      .then((res: { message: string }) => {
        resetForm();
        toast(res.message);
        setTimeout(() => {
          router.push("/system-notification");
        }, 1000);
      })
      .catch((error: ApiError) => {
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
          toast.error((error as any).message, {
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
            <h1 className="m-0 text-dark">Add Notification</h1>
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
                    onSubmit={(values: NotificationFormValues, { resetForm }: FormikHelpers<NotificationFormValues>) => {
                      submitHandler(values, resetForm);
                    }}
                  >
                    {({ errors, touched, values, handleChange, setFieldValue }) => (
                      <Form>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="inputEmail3" className="col-form-label">
                                Notification Type
                              </label>
                              <div>
                                <Field
                                  as="select"
                                  name="notification_type"
                                  className="form-select"
                                  id="inputEmail3"
                                  placeholder="Email"
                                >
                                  <option>Select</option>
                                  <option value={1}>Email</option>
                                  <option value={2}>Push Notification</option>
                                </Field>
                                <ErrorMessage
                                  name="notification_type"
                                  render={(msg: string) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="inputEmail3" className="col-form-label">
                                Notification Title
                              </label>
                              <div className="">
                                <Field
                                  type="text"
                                  name="title"
                                  className="form-control"
                                  id="inputEmail3"
                                  placeholder=""
                                />
                                <ErrorMessage
                                  name="title"
                                  render={(msg: string) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="inputEmail3" className="col-form-label">
                                Notification Name
                              </label>
                              <div className="">
                                <Field
                                  type="text"
                                  name="name"
                                  className="form-control"
                                  id="inputEmail3"
                                  placeholder=""
                                />
                                <ErrorMessage
                                  name="name"
                                  render={(msg: string) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="inputEmail3" className="col-form-label">
                                Notification Content
                              </label>
                              <div className="">
                                <Field
                                  name="content"
                                  component="textarea"
                                  className="form-control"
                                  id="exampleFormControlTextarea1"
                                  rows="3"
                                />
                                <ErrorMessage
                                  name="content"
                                  render={(msg: string) => (
                                    <div className="form-error">{msg}</div>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label htmlFor="inputEmail3" className="col-form-label">
                                Send to
                              </label>
                              <div className="d-flex flex-wrap">
                                <div className="form-check col-md-4">
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
                                    render={(msg: string) => (
                                      <div className="form-error">{msg}</div>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='pull-right'>
                          <button className="btn btn-primary float-center">
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
