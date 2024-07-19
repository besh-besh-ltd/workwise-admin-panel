import React, { useState, useEffect } from 'react'
import { createNotification, getNotificationDetails, handleUpdateNotification } from '@/utils/services/notification';
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";

const EditNotification = () => {
  const [notificationData, setNotificationData] = useState([]);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      notificationDeatilsHandler();
    }
  }, [id])

  const initialValues = {
    title: notificationData.title ? notificationData.title : '' ,
    notification_type: notificationData.notification_type != undefined ? notificationData.notification_type : '',
    name: notificationData.name ? notificationData.name : '' ,
    status: "1",
    content: notificationData.content ? notificationData.content : '',
    send_to: notificationData.send_to != '' ? "" + notificationData.send_to : ''
  };

  const validationSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    notification_type: yup.string().required("Notification Type is required"),
    content: yup.string().required("Content is required"),
    name: yup
    .string()
    .required("Name is required")
    .test("name-format", "Name must be in lowercase with words separated by '_' ", (value) => {
      if (!value) return true; // Allow empty string

      const words = value.toLowerCase().split("_");
      return words.every((word) => /^[a-z]+$/.test(word));
    }),
    send_to: yup.string().required("Send to is required")
  });

  const notificationDeatilsHandler = () => {
    getNotificationDetails(id)
      .then((response) => {
        setNotificationData(response.data[0])
      })
      .catch((error) => {
        console.log(error)
      });
    }

  const updateHandler = (values, resetForm) => {
    values.notification_type = values.notification_type.toString();
    values.send_to = values.send_to.toString();
    handleUpdateNotification(values, id)
      .then((res) => {
        resetForm();
        console.log(res)
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
            <h1 class="m-0 text-dark">Edit Notification</h1>
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
                      updateHandler(values, resetForm);
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
                                  disabled={true}
                                >
                                  <option value="">Select</option>
                                  <option value="1">Email</option>
                                  <option value="2">Push Notification</option>
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
                                  disabled={true}
                                  placeholder="should be in lowercase"
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
                                    <Field  type="radio" id="send_id" name="send_to" value="1" disabled={true} />
                                    Every One
                                  </label>
                                  <label className='mr-2'>
                                    <Field type="radio" id="send_id" name="send_to" value="2" disabled={true}/>
                                    Buyer
                                  </label>
                                  <label className='mr-2'>
                                    <Field type="radio" id="send_id" name="send_to" value="3" disabled={true}/>
                                    Vendors
                                  </label>
                                  <label>
                                    <Field type="radio" id="send_id" name="send_to" value="4" disabled={true}/>
                                    Paid User
                                  </label>
                                  <label className='mr-2'>
                                    <Field type="radio" id="send_id" name="send_to" value="5" disabled={true}/>
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
        </div>
        <ToastContainer />
      </section >
    </>
  )
}

export default EditNotification