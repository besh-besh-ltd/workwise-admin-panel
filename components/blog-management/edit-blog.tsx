import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import FormikField from "@/components/shared/FormikField";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import UploadFiles from '../shared/ImagesUpload';
import { handleBlogCategoryList, handleGetBlogList, handleUpdateBlog } from '@/utils/services/blog-management';

interface BlogFormValues {
    title: string;
    description: string;
    status: string | number;
    blog_category: string | number;
    slug: string;
}

interface BlogData {
    id: number;
    title: string;
    description: string;
    status: number;
    blog_cat_id: number;
    slug: string;
    image_url: string;
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

const EditBlog: React.FC = () => {
    const router = useRouter();
    const { id } = router?.query as { id?: string };
    const [categoryDropdown, setCategoryDropdown] = useState<CategoryOption[]>([]);
    const [selectedBlogData, setSelectedBlogData] = useState<BlogData[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedFilesReset, setSelectedFilesReset] = useState<boolean>(false);

    const initialValues: BlogFormValues = {
        title: selectedBlogData ? selectedBlogData[0]?.title : "",
        description: selectedBlogData ? selectedBlogData[0]?.description : "",
        status: selectedBlogData ? selectedBlogData[0]?.status : "",
        blog_category: selectedBlogData ? selectedBlogData[0]?.blog_cat_id : "",
        slug: selectedBlogData ? selectedBlogData[0]?.slug : ""
    };

    const getBlogsDetail = (): void => {
        // provide default arguments: page = 1, limit = 10000, searchString = empty
        handleGetBlogList(1, 10000, "")
            .then((res: { data: BlogData[] }) => {
                let arr = res?.data?.filter((item) => item?.id === parseInt(id as string));
                setSelectedBlogData(arr);
            })
            .catch((error: { error: { response: { data: { errors: Record<string, string> } } } }) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast.error(txt);
            });
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

    const submitHandler = (values: BlogFormValues, resetForm: () => void): void => {
        const payload = new FormData();
        payload.append(`title`, values.title);
        payload.append(`description`, values.description);
        payload.append(`status`, String(values.status));
        payload.append(`blog_category`, String(values.blog_category));
        payload.append(`slug`, values.slug);
        if (selectedFiles?.length > 0) {
            selectedFiles.forEach((file) => {
                payload.append(`image`, file, file.name);
            });
        }
        handleUpdateBlog(id as string, payload)
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

    useEffect(() => {
        getBlogCategory();
        getBlogsDetail();
    }, [id]);

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
                                                            {selectedFiles?.length === 0 && selectedBlogData && selectedBlogData?.length > 0 &&
                                                                <div className="mb-4">
                                                                    <img
                                                                        src={selectedBlogData && selectedBlogData[0]?.image_url}
                                                                        style={{
                                                                            width: "80px",
                                                                            height: "80px",
                                                                            objectFit: "cover"
                                                                        }}
                                                                        alt="Blog image"
                                                                    />
                                                                </div>}
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
                </section>
            </div>
        </>
    );
};

export default EditBlog;
