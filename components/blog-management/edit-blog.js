import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import UploadFiles from '../shared/ImagesUpload';
import { handleBlogCategoryList, handleGetBlogList, handleUpdateBlog } from '@/utils/services/blog-management';

const EditBlog = () => {
    const router = useRouter();
    const { id } = router?.query;
    const [categoryDropdown, setCategoryDropdown] = useState([]);
    const [selectedBlogData, setSelectedBlogData] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFilesReset, setSelectedFilesReset] = useState(false);
    const initialValues = {
        title: selectedBlogData ? selectedBlogData[0]?.title : "",
        description: selectedBlogData ? selectedBlogData[0]?.description : "",
        status: selectedBlogData ? selectedBlogData[0]?.status : "",
        blog_category: selectedBlogData ?  selectedBlogData[0]?.blog_cat_id : "",
        slug: selectedBlogData ? selectedBlogData[0]?.slug : ""
    }

    const getBlogsDetail = () => {
        handleGetBlogList()
            .then((res) => {
                let arr = res?.data?.filter((item) => item?.id === parseInt(id));
                setSelectedBlogData(arr);
            })
            .catch((error) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast.error(txt);
            });
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

    const submitHandler = (values, resetForm) => {
        const payload = new FormData();
        payload.append(`title`, values.title);
        payload.append(`description`, values.description);
        payload.append(`status`, values.status);
        payload.append(`blog_category`, values.blog_category);
        payload.append(`slug`, values.slug);
        if (selectedFiles?.length > 0) {
            selectedFiles.forEach((file, i) => {
                payload.append(`image`, file, file.name);
            });
        }
        handleUpdateBlog(id, payload)
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

    useEffect(() => {
        getBlogCategory();
        getBlogsDetail();
    }, [id])
    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">Edit Blog</h1>
                    </div>
                </div>

                <section className="content p-2">
                    <div className="container-fluid">
                        <div className="text-left pb-4">
                            <Link className="btn btn-primary" href="/blog-management">
                                <span className="fa fa-angle-left mr-2"></span>Go Back
                            </Link>
                        </div>
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
                                                            {selectedFiles?.length === 0 && selectedBlogData && selectedBlogData?.length > 0 &&
                                                                <div className="mb-4">
                                                                    <img
                                                                        src={selectedBlogData && selectedBlogData[0]?.image_url}
                                                                        style={{
                                                                            width: "80px",
                                                                            height: "80px",
                                                                            objectFit: "cover"
                                                                        }}
                                                                    />
                                                                </div>}
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
                </section>
            </div>
        </>
    )
}

export default EditBlog