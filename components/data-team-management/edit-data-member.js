import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { updateSubAdmin, getSubAdminDetails } from '@/utils/services/subadmin-management';
import { getCountryCodes } from '@/utils/services/location-management';

const EditDataMemberPage = () => {
  const router = useRouter();

  const [dataMemberData, setdataMemberData] = useState(null);
  const [countryCode, setCountryCode] = useState([]);


   useEffect(() => {
          fetchCountryCodes();
        }, []);
      
        const fetchCountryCodes = () => {
          getCountryCodes()
            .then((response) => {
              if (response?.data) {
                setCountryCode(response.data);
              } else {
                setCountryCode([]);
              }
            })
            .catch((error) => {
              console.log("Error fetching countries:", error);
              setCountryCode([]);
            });
        };
  

  const initialValues = {
    name: dataMemberData ? dataMemberData[0]?.name : "",
    mobile: dataMemberData ? dataMemberData[0]?.mobile.replace(/^\+\d{1,4}-/, '') : "",
    image: "",
    countryCode:""
    
  }

  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    mobile: yup
      .string()
      .matches(
        /^\+?[0-9]{1,4}[-.\s]?[0-9]{7,15}$/,
        "Please enter a valid mobile number"
      )
      .required("Mobile is required"),
    
    image: yup.mixed().nullable().required("Please select a file"),
  });

  const handledataMemberData = () => {
    getSubAdminDetails(router?.query?.id)
      .then((res) => {
        setdataMemberData(res.data)
      })
      .catch((err) => console.log("err", err));
  }

  const submitHandler = (values, resetForm) => {
    console.log("values", values);
    let fullMobile;
    if(values.countryCode ==""){
       fullMobile = `${selectedCountryCode?.phone_code}-${values.mobile.trim().replace(/^0+/, "")}`;
       console.log("fullMobile without ion =? ",selectedCountryCode.phone_code);
    }else{
       fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;
       console.log("fullMobile with selection else ",fullMobile);
    }
     
    const {countryCode, ...updatedValues} ={
        ...values,
        mobile: fullMobile
    }
    
    
    updateSubAdmin(updatedValues, router?.query?.id)
      .then((res) => {
        resetForm();
        toast(res.message);
        setTimeout(() => {
          router.push("/data-team-management");
        }, 1000);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  }

  useEffect(() => {
    if(router?.query?.id){
      handledataMemberData();
    }
  }, [router])


  const extractedCountryCode = dataMemberData ? dataMemberData[0]?.mobile.match(/^\+\d{1,4}/)?.[0] :"" ;
 
  
  const selectedCountryCode = countryCode.find(
    (item) => item.phone_code === extractedCountryCode
  );
 
  

  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Edit Data Member</h1>
          </div>
        </div>
      </div>

      <section className="content p-2">
        <div className="container-fluid">
          <div className="text-left pb-4">
            <Link className="btn btn-primary" href="/data-team-management">
              <span className="fa fa-angle-left mr-2"></span>Go Back
            </Link>
          </div>

          <div class="card col-12">
            <div class="card-body">
              <div className="container-fluid">
                <div className="col-md-12">
                  <Formik
                    enableReinitialize={true}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, { resetForm }) => {
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
                        <div className="add-product">
                          <div className="row mb-4">
                            <div className="col-sm-4">
                              <div className="form-group">
                                <FormikField
                                  label="Name"
                                  isRequired={true}
                                  name="name"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="row mb-4">
                              <div className="col-sm-8">
                                <div className="form-group">
                                  <label htmlFor="mobile">
                                    Mobile{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="d-flex">
                                    <Field
                                      as="select"
                                      name="countryCode"
                                      className="form-control"
                                      style={{
                                        height: "44px",
                                        width: "30%",
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                      }}
                                    >
                                      <option value="countryCode">
                                     
                                        {selectedCountryCode?.country_code} ({selectedCountryCode?.phone_code})
                                        
                                      </option>
                                      {countryCode.map((item) => (
                                        <option
                                          key={item.country_code}
                                          value={item.phone_code}
                                        >
                                          {item.country_code} ({item.phone_code}
                                          )
                                        </option>
                                      ))}
                                    </Field>
                                    <div
                                      style={{
                                        marginLeft: "6px",
                                        width: "70%",
                                      }}
                                    >
                                      <Field
                                        type="text"
                                        name="mobile"
                                        placeholder="Mobile"
                                        className={`form-control ${
                                          touched.mobile && errors.mobile
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                        style={{
                                          height: "44px",
                                          borderTopLeftRadius: 0,
                                          borderBottomLeftRadius: 0,
                                        }}
                                      />
                                      {touched.mobile && errors.mobile && (
                                        <div className="invalid-feedback">
                                          {errors.mobile}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="row mb-4">
                            <div class="col">
                              <label htmlFor="subadmin-image">Image</label>
                              <Field
                                name="image"
                                type="file"
                                value={undefined}
                                className="form-control p-1"
                                onChange={(event) => {
                                  let files = event.target.files[0];
                                  setFieldValue("image", files);
                                }}
                              />
                              <ErrorMessage
                                name="image"
                                render={(msg) => (
                                  <div className="form-error">{msg}</div>
                                )}
                              />
                            </div>
                          </div>

                          <div className="d-flex float-left">
                            <button
                              type="submit"
                              class="btn btn-primary justify"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default EditDataMemberPage