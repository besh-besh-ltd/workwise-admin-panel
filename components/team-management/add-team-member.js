import { addTeamMember } from '@/utils/services/team-management';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import UploadFiles from "@/components/shared/ImagesUpload";
import FormikField from '../shared/FormikField';
import * as yup from "yup";
import Link from 'next/link';
import { getCountryCodes } from '@/utils/services/location-management';

const AddTeamMember = () => {
    const router = useRouter();
    const [selectedFilesCreated, setSelectedFilesCreated] = useState([]);
    const [selectedFilesReset, setSelectedFilesReset] = useState(false);
    const [countryCode , setCountryCode] = useState([]);
    const [oneCountry, setoneCountry] = useState("+91");

    

    const initialValues = {
        name: "",
        role: "",
        mobile: "",
        email: "",
        profile_image: null,
        page_id: 2,
        linkedin: null,
        twitter: null,
        facebook: null,
        whatsapp: null,
        status: 1,
        country_code:""
    };

    const validationSchema = yup.object().shape({
        name: yup.string().trim().required("Member Name is required"),
        role: yup.string().trim().required("Member Role is required"),
        mobile: yup.string().trim()
            .matches(/^[0-9]+$/, "Mobile number must only contain digits")
            .min(7, "Mobile number must be at least 7 digits")
            .max(15, "Mobile number must be at most 15 digits")
            .nullable()
            .notRequired(),
        email: yup.string().email("Invalid email address").nullable().notRequired(),
        profile_image: yup
            .mixed()
            .nullable()
            .notRequired()
            .test("fileType", "Invalid file type", (value) =>
                value ? ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(value.type) : true
            ),
        page_id: yup.string().trim().required("Page ID is required"),
        linkedin: yup.string().url("Invalid LinkedIn URL").nullable().notRequired(),
        twitter: yup.string().url("Invalid Twitter URL").nullable().notRequired(),
        facebook: yup.string().url("Invalid Facebook URL").nullable().notRequired(),
        whatsapp: yup.string().trim()
            .matches(/^[0-9]+$/, "WhatsApp number must only contain digits")
            .min(10, "WhatsApp number must be at least 10 digits")
            .max(15, "WhatsApp number must be at most 15 digits")
            .nullable().notRequired(),
        status: yup.number().oneOf([0, 1], "Status must be either 0 or 1").required("Status is required"),
    });

    const submitHandler = (values, resetForm) => {
 

        const fullMobile = `${values.country_code}-${values.mobile}`;

        const {country_code, ...updatedData} = {
            ...values,
            mobile: fullMobile,
        }
        // Team Member IMAGE IS REQUIRED
        if (!selectedFilesCreated[0]) {
            toast.error("Member Image is required");
            return 0;
        }

        let payload = {
            ...updatedData,
            profile_image: selectedFilesCreated[0],
        }

        addTeamMember(payload)
            .then((res) => {
                resetForm();
                toast.success(res.message);
                setTimeout(() => {
                    router.push("/team-management");
                }, 2000);
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

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

    useEffect(() => {
      fetchCountryCodes()
    }, []);

    return (
      <>
        <ToastContainer />
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <h1 className="m-0 text-dark">Add Team Member</h1>
            </div>
          </div>
        </div>

        <section className="content p-2">
          <div className="container-fluid">
            <div className="text-left pb-4">
              <Link className="btn btn-primary" href="/team-management">
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
                      {({ errors, touched, values }) => (
                        <Form>
                          <div className="add-product row">
                            <div className="col-md-6 col-lg-4">
                              <div className="form-group">
                                <FormikField
                                  label="Member Name"
                                  isRequired={true}
                                  name="name"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-6 col-lg-4">
                              <div className="form-group">
                                <FormikField
                                  label="Email"
                                  isRequired={false}
                                  name="email"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-6 col-lg-4">
                              <div className="form-group">
                                <label>Mobile</label>
                                <div className="d-flex">
                                  {/* Country Code Dropdown - Use Field instead of FormikField */}
                                  <Field
                                    as="select"
                                    name="country_code"
                                    className="form-select me-2"
                                    style={{ width: "90px", height: "48px" }}
                                  >
                                    {countryCode.map((country) => (
                                      <option
                                        key={country.id}
                                        value={country.phone_code}
                                      >
                                        {country.country_code} (
                                        {country.phone_code})
                                      </option>
                                    ))}
                                  </Field>

                                  {/* Mobile Number Input */}
                                  <FormikField
                                    name="mobile"
                                    placeholder="Enter mobile number"
                                    type="text"
                                    touched={touched}
                                    errors={errors}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <FormikField
                                  label="Member Role"
                                  isRequired={true}
                                  name="role"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-3">
                              <div className="form-group">
                                <FormikField
                                  label="Status"
                                  type="select"
                                  isRequired={true}
                                  selectOptions={[
                                    {
                                      label: "Select Status",
                                      value: "",
                                      disabled: true,
                                    },
                                    { label: "Active", value: "1" },
                                    { label: "Inactive", value: "0" },
                                  ]}
                                  name="status"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-3">
                              <FormikField
                                label="View On"
                                type="select"
                                isRequired={true}
                                selectOptions={[
                                  {
                                    label: "Select Page",
                                    value: "",
                                    disabled: true,
                                  },
                                  { label: "Home Page", value: "1" },
                                  { label: "About Us Page", value: "2" },
                                ]}
                                name="page_id"
                                touched={touched}
                                errors={errors}
                              />
                            </div>

                            <div className="col-md-12">
                              <div className="row">
                                <UploadFiles
                                  accept=".png, .jpg, .jpeg, .webp, .gif"
                                  upload={setSelectedFilesCreated}
                                  reset={selectedFilesReset}
                                  label="Member Image *"
                                  isMultiple={false}
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <FormikField
                                  label="LinkedIn URL"
                                  isRequired={true}
                                  name="linkedin"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <FormikField
                                  label="Facebook URL"
                                  isRequired={false}
                                  name="facebook"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <FormikField
                                  label="Twitter URL"
                                  isRequired={false}
                                  name="twitter"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <FormikField
                                  label="Whatsapp"
                                  isRequired={false}
                                  name="whatsapp"
                                  touched={touched}
                                  errors={errors}
                                />
                              </div>
                            </div>

                            <div className="d-flex float-left">
                              <button type="submit" class="btn btn-primary">
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

export default AddTeamMember
