import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import FormikField from "@/components/shared/FormikField";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import * as yup from "yup";
import UploadFiles from "@/components/shared/ImagesUpload";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { handleAddBlog, handleBlogCategoryList } from '@/utils/services/blog-management';

const AddBlog = () => {
	const router = useRouter();
    const [categoryDropdown, setCategoryDropdown] = useState([])
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFilesReset, setSelectedFilesReset] = useState(false);
    const initialValues = {
        title: "",
        description: "",
        status: "",
        blog_category: "",
        slug: ""
    }

    const validationSchema = yup.object().shape({
        title: yup.string().required("Title Name is required"),
        description: yup.string().required("Description is required"),
        status: yup.string().required("Status is required"),
        blog_category: yup.string().required("Blog Category is required"),
        slug: yup
            .string()
            .test(
                "slug-empty",
                "Slug is required",
                (value) => value !== undefined && value.trim() !== ""
            )
            .test(
                "slug-format",
                "Slug must be in lowercase with words separated by '_'",
                (value) => {
                    if (!value) return true; // Skip format validation if value is falsy
                    const words = value.toLowerCase().split("_");
                    return words.every((word) => /^[a-z]+$/.test(word));
                }
            ),
    });

    const getBlogCategory = () => {
        handleBlogCategoryList()
            .then((res) => {
                let arr = res?.data?.map((item) => {
                    return {
                        label: item?.title,
                        value: item?.id
                    }
                })
                setCategoryDropdown(arr);
            })
            .catch((error) => {
                let txt = "";
                for (let x in error?.error?.response?.data?.errors) {
                    txt = error?.error?.response?.data?.errors[x];
                }
                toast.error(txt);
            });
    }

    const submitHandler = (values, resetForm) => {
        const payload = new FormData();
        payload.append(`title`, values.title);
        payload.append(`description`, values.description);
        payload.append(`status`, values.status);
        payload.append(`blog_category`, values.blog_category);
        payload.append(`slug`, values.slug);
        selectedFiles.forEach((file, i) => {
            payload.append(`image`, file, file.name);
        });
        handleAddBlog(payload)
            .then((res) => {
                resetForm();
                toast.success(res.message);
                setTimeout(() => {
                    router.push("/blog-management");
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
        getBlogCategory();
    }, [])
    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">Add Blog</h1>
                    </div>
                </div>
            </div>

            <section className="content p-2">
                <div className="container-fluid">
                    <div className="text-left pb-4">
                        <Link className="btn btn-primary" href="/blog-management">
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
                                        {({ errors, touched, values, handleChange, setFieldValue }) => (
                                            <Form>
                                                <div className="add-product">
                                                    <div className="col-sm-12">
                                                        <div className="form-group">
                                                            <FormikField
                                                                label="Title"
                                                                isRequired={true}
                                                                name="title"
                                                                touched={touched}
                                                                errors={errors}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <FormikField
                                                                label="Blog Description"
                                                                type="textarea"
                                                                isRequired={true}
                                                                name="description"
                                                                touched={touched}
                                                                errors={errors}
                                                                className="text-editor-area"
                                                                cols="30"
                                                                rows="10"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='row'>
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Status"
                                                                    type="select"
                                                                    isRequired={true}
                                                                    selectOptions={
                                                                        [
                                                                            { label: "Select Status", value: '', disabled: true },
                                                                            { label: "Active", value: "1" },
                                                                            { label: "Inactive", value: "0" },
                                                                        ]
                                                                    }
                                                                    name="status"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <label htmlFor="select-input" className="form-label">
                                                                    Select Blog Category
                                                                </label>
                                                                <select
                                                                    id="select-input"
                                                                    className="form-control"
                                                                    name="blog_category"
                                                                    value={values.blog_category}
                                                                    onChange={handleChange}
                                                                >
                                                                    <option value="" disabled>
                                                                        Select an option
                                                                    </option>
                                                                    {categoryDropdown?.map((option, index) => (
                                                                        <option key={index} value={option.value.toString()}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {touched.blog_category && errors.blog_category && (
                                                                    <div className="form-error">{errors.blog_category}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Slug"
                                                                    isRequired={true}
                                                                    name="slug"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-12">
                                                            <div className="row">
                                                                <UploadFiles
                                                                    accept=".png, .jpg, .jpeg, .gif"
                                                                    upload={setSelectedFiles}
                                                                    reset={selectedFilesReset}
                                                                    label="Upload Image"
                                                                    isMultiple={false}
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
    )
}

export default AddBlog