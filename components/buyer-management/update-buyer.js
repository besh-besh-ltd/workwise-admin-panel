import React, { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import Image from "next/image";
import {
  handleUpdateBuyer,
} from "@/utils/services/buyer-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import img1 from "../../public/assets/images/products.png";
import { getCountryCodes } from "@/utils/services/location-management";

const UpdateVendor = () => {
  const [editDetails, setEditDetails] = useState(null);
  const [dtaCount, setdtaCount] = useState(0);
  const [onecountrycode,setonecountrycode] =useState("");
  const [countryCode, setCountryCode] = useState([]);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      setEditDetails(JSON.parse(localStorage.getItem("buyerUpdate")));
    }
    setdtaCount(1);
    fetchCountryCodes();
  }, [id]);

  const fetchCountryCodes = async () => {
    try {
      const response = await getCountryCodes();
      setCountryCode(response?.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountryCode([]);
    }
  };

  const initialValues = {
    name: editDetails?.name || "",
    email: editDetails?.email || "",
    mobile: editDetails?.mobile ? editDetails.mobile.replace(/^\+?\d+-/, "") : "",
    organization_name: editDetails?.organization_name || "",
    image: editDetails?.profile_image || null,
  };

  

  const submitHandler = (values, { resetForm }) => {
    let fullMobile;
    if(values.countryCode)
      {
        fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;
    
      }    else{
        fullMobile = `${selectedCountry.phone_code}-${values.mobile.trim().replace(/^0+/, "")}`;
      }
    const { countryCode, ...updatedValues } = { 
      ...values, 
      mobile: fullMobile 
    };
    
   
    handleUpdateBuyer(updatedValues, editDetails)
      .then((res) => {
        resetForm();
        toast.success(res.message);
        router.push("/buyer-management");
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
  const extractedCountryCode = editDetails?.mobile.match(/^\+?\d+/)?.[0] || "+91";
 
  
  const selectedCountry = countryCode.find(
    (item) => item.phone_code === extractedCountryCode
  );

 
  return (
    <div className="container mt-4">
      <h5 className="mb-3">Update Buyer</h5>
      <div className="card">
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={yup.object({
              name: yup.string().required("Name is required"),
              organization_name: yup.string().required("Organization is required"),
              email: yup
                .string()
                    .email()
                    .matches(
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      "please enter valid email address"
                    )
                    .required("email is required"),
              mobile: yup
                .string()
                .matches(/^[0-9]{10,15}$/, "Enter a valid mobile number")
                .min(10)
                    .max(11)
                .required("Mobile is required"),
            })}
            onSubmit={submitHandler}
          >
            {({ setFieldValue }) => (
              <Form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <Field type="text" name="name" className="form-control" />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <Field type="email" name="email" className="form-control" />
                    <ErrorMessage name="email" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Mobile</label>
                    <div className="d-flex">
                      <Field as="select" name="countryCode" className="form-select me-2 w-auto">
                      <option value="countryCode">{selectedCountry?.country_code} ({selectedCountry?.phone_code})</option> {/* Default selected */}
                        {countryCode.map((item) => (
                          <option key={item.id} value={item.phone_code}>
                            {item.country_code} ({item.phone_code})
                          </option>
                        ))}
                      </Field>
                      <Field type="text" name="mobile" className="form-control" />
                    </div>
                    <ErrorMessage name="mobile" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Organization</label>
                    <Field type="text" name="organization_name" className="form-control" />
                    <ErrorMessage name="organization_name" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(event) => setFieldValue("image", event.target.files[0])}
                  />
                  {editDetails?.profile_image && (
                    <div className="mt-2">
                      <Image
                        src={editDetails.profile_image || img1}
                        width={100}
                        height={100}
                        className="img-thumbnail"
                        alt="Profile"
                      />
                    </div>
                  )}
                </div>
                <div className="text-end">
                  <button type="submit" className="btn btn-primary">Save</button>
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

export default UpdateVendor;
