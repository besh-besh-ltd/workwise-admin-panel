import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import FormikField from "@/components/shared/FormikField";
import { Form, Formik, FormikErrors, FormikTouched } from "formik";
import * as yup from "yup";
import UploadFiles from "@/components/shared/ImagesUpload";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { handleAddBlog, handleBlogCategoryList } from '@/utils/services/blog-management';

interface BlogFormValues {
    title: string;
    description: string;
    status: string;
    blog_category: string;
    slug: string;
}

interface CategoryOption {
    label: string;
    value: number;
}

interface CategoryItem {
    id: number;
    title: string;
}

interface ApiError {
    error?: {
        response?: {
            data?: {
                errors?: Record<string, string>;
            };
        };
    };
}

const AddBlog: React.FC = () => {
    const router = useRouter();
    const [categoryDropdown, setCategoryDropdown] = useState<CategoryOption[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedFilesReset, setSelectedFilesReset] = useState<boolean>(false);

    const initialValues: BlogFormValues = {
        title: "",
        description: "",
        status: "",
        blog_category: "",
        slug: ""
    };

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
                    if (!value) return true;
                    const words = value.toLowerCase().split("_");
                    return words.every((word) => /^[a-z]+$/.test(word));
                }
            ),
    });

    const getBlogCategory = (): void => {
        handleBlogCategoryList()
            .then((res: { data: CategoryItem[] }) => {
                let arr: CategoryOption[] = res?.data?.map((item) => {
                    return {
                        label: item?.title,
                        value: item?.id
                    };
                });
                setCategoryDropdown(arr);
            })
            .catch((error: ApiError) => {
                let txt = "";
                for (let x in error?.error?.response?.data?.errors) {
                    txt = error?.error?.response?.data?.errors[x];
                }
                toast.error(txt);
            });
    };

    const submitHandler = (values: BlogFormValues, resetForm: () => void): void => {
        const payload = new FormData();
        payload.append(`title`, values.title);
        payload.append(`description`, values.description);
        payload.append(`status`, values.status);
        payload.append(`blog_category`, values.blog_category);
        payload.append(`slug`, values.slug);
        selectedFiles.forEach((file) => {
            payload.append(`image`, file, file.name);
        });
        handleAddBlog(payload)
            .then((res: { message: string }) => {
                resetForm();
                toast.success(res.message);
                setTimeout(() => {
                    router.push("/blog-management");
                }, 1000);
            })
            .catch((error: ApiError) => {
                let txt = "";
                for (let x in error?.error?.response?.data?.errors) {
                    txt = error?.error?.response?.data?.errors[x];
                }
                toast.error(txt);
            });
    };

    useEffect(() => {
        getBlogCategory();
    }, []);

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

                    <div className="card col-12">
                        <div className="card-body">
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
                                        {({ errors, touched, values, handleChange }) => (
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
                                                                cols={30}
                                                                rows={10}
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
                                                                    accept={[".png", ".jpg", ".jpeg", ".gif"]}
                                                                    upload={setSelectedFiles}
                                                                    reset={selectedFilesReset}
                                                                    label="Upload Image"
                                                                    isMultiple={false}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="d-flex float-left">
                                                            <button type="submit" className="btn btn-primary">
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
    );
};

export default AddBlog;
