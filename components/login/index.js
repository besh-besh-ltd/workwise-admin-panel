import React from "react";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { handleLogin } from "@/utils/services/login";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { saveToken } from "@/app/login-slice";
const Login = () => {
  const route = useRouter();
  const dispatch = useDispatch();
  const loginHandler = (values) => {
    // onClick={() => {
    //   localStorage.setItem("isLogin", true);
    //   route.push("/");
    //   location.reload();
    // }}
    handleLogin(values)
      .then((res) => {
        toast(res.data.message);
        dispatch(saveToken(res.data.token));
        localStorage.setItem("access", JSON.stringify(res?.data?.user_access));
        route.push("/");
      })
      .catch((err) => console.log("err", err));
  };
  return (
    <div className="login-box">
      <div className="login-logo">
        <Link href="#">
          <b></b>Login
        </Link>
      </div>

      <div className="card">
        <div className="card-body login-card-body">
          <Formik
            initialValues={{
              username: "",
              password: ""
            }}
            validationSchema={yup.object().shape({
              username: yup
                .string()
                .email("Please enter a valid email")
                .required("email is required"),
              password: yup.string().required("Password is required")
            })}
            onSubmit={(values) => {
              loginHandler(values);
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <div className="form-group has-feedback withicon">
                  <label htmlFor="email">Email</label>
                  <div className="withicon">
                    <Field
                      type="email"
                      name="username"
                      className="form-control"
                      id="exampleInputEmail1"
                      placeholder="Enter email"
                    />
                    <span className="fa fa-envelope form-control-feedback formleftIcon"></span>
                    {touched.username && errors.username && (
                      <div className="form-error">{errors.username}</div>
                    )}
                  </div>
                </div>

                <div className="form-group has-feedback withicon">
                  <label htmlFor="password">Password</label>
                  <div className="withicon">
                    <Field
                      type="password"
                      name="password"
                      className="form-control"
                      id="exampleInputPassword1"
                      placeholder="Enter password"
                    />
                    <span className="fa fa-lock form-control-feedback formleftIcon"></span>
                    {touched.password && errors.password && (
                      <div className="form-error">{errors.password}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block btn-flat"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
