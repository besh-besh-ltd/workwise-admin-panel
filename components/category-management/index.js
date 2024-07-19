import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/utils/services/product-management";
import { Form, Formik, Field } from "formik";
import * as yup from "yup";
import FullLoading from "../loading/FullLoading";
import { ToastContainer, toast } from "react-toastify";
import NestedCategory from "./nested-category";

const CategoryManagementPage = () => {
  const navigate = useRouter();
  const [allCategories, setAllCategories] = useState([]);
  const [addCategories, setAddCategories] = useState([]);
  const [loading, setloading] = useState(false);
  const [listLoading, setlistLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [updateData, setUpdateData] = useState("");
  const [addStatus, setAddStatus] = useState(false);
  const router = useRouter();
  const formRef = useRef(null);
  useEffect(() => {
    getAllCategories();
  }, []);

  const buildTree = async (data) => {
    const map = {};
    const roots = [];

    // Initialize the map
    data.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    // Build the tree
    data.forEach((item) => {
      if (item.parent_id !== 0) {
        if (map[item.parent_id]) {
          map[item.parent_id].children.push(map[item.id]);
        }
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  const getAllCategories = () => {
    setloading(true);
    setlistLoading(true);
    getCategories(1, 1000).then(async (res) => {
      setloading(false);
      setlistLoading(false);
      let transformedCategory = await buildTree(res?.data);

      console.log(transformedCategory);

      /* console.log(
        res?.data?.reduce(
          (acc, item) => (
            (item.children = []),
            (acc[item.id] = item),
            item.parent_id
              ? (
                  acc[item.parent_id] ||
                  (acc[item.parent_id] = { children: [] })
                ).children.push(item)
              : acc.roots.push(item),
            acc
          ),
          { roots: [] }
        ).roots
      ); */
      setAllCategories(transformedCategory);
    });
  };

  const handleSubmit = (values, resetForm) => {
    setloading(true);
    if (updateStatus) {
      updateCategory(values, updateData?.id)
        .then((res) => {
          toast(res?.message);
          setUpdateStatus(false);
          getAllCategories();
          setUpdateData("");
          setloading(false);
        })
        .catch((error) => {
          setloading(false);
          console.log("err", error);
          let txt = "";
          for (let x in error.message.response.data.errors) {
            txt = error.message.response.data.errors[x];
          }
          toast(txt);
        });
    } else {
      createCategory(values).then((res) => {
        setloading(false);
        setAddStatus(false);
        resetForm();
        getAllCategories();
        setAddCategories([]);
      });
    }
  };

  const handleChangeTitle = (e, setFieldValue) => {
    setFieldValue("slug", e.target.value.replace(" ", "-"));
  };

  const findParentsCount = (item) => {
    const targetCategory = allCategories.find(
      (category) => category.id === item.id
    );

    if (targetCategory) {
      let parentsCount = 0;
      let currentId = targetCategory.id;

      while (currentId !== 0) {
        const parentCategory = allCategories.find(
          (category) => category.id === currentId
        );
        if (parentCategory) {
          currentId = parentCategory.parent_id;
          parentsCount += 1;
        } else {
          break;
        }
      }

      return Array.from(Array(parentsCount - 1), (e, i) => {
        return <span className="parentindent"></span>;
      });
    } else {
      return 0;
    }
  };

  const getSVG = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="256"
        height="256"
      >
        <path
          d="M20.92,16.62a1,1,0,0,0-.21-.33l-3-3a1,1,0,0,0-1.42,1.42L17.59,16H9a1,1,0,0,1-1-1V6.41l1.29,1.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-3-3a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-3,3A1,1,0,0,0,4.71,7.71L6,6.41V15a3,3,0,0,0,3,3h8.59l-1.3,1.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l3-3a1,1,0,0,0,.21-.33A1,1,0,0,0,20.92,16.62Z"
          fill="#000000"
          class="color000 svgShape"
        ></path>
      </svg>
    );
  };
  const handleUpdateCategory = (item) => {
    setAddStatus(false);
    setAddCategories([]);
    setUpdateStatus(true);
    setUpdateData(item);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const getChildCat = (item) => {
    let html = "";
    let childs = allCategories.filter((i) => i.parent_id == item.id);
    if (childs.length > 0) {
      childs.map((c) => {
        html = (
          <>
            {html}
            <tr
              key={c.title}
              className={`${c.is_deleted == 0 ? "" : "deleted"}`}
            >
              <td>{c.id}</td>
              <td>
                {findParentsCount(c)}
                {getSVG()}
                {c.title}
              </td>
              <td>{c.slug}</td>
              {/* <td>{c.parent_id}</td> */}
              <td>
                <div className="card-footer bg-transparent border-secondary">
                  <div className="actionStyle">
                    <span
                      className="fa fa-eye mr-3"
                      onClick={() =>
                        router.push(
                          `/category-management/category-details/${c.id}`
                        )
                      }
                    ></span>
                    <span
                      className="fa fa-edit mr-3"
                      onClick={() => handleUpdateCategory(c)}
                    ></span>
                    <span
                      className="fa fa-trash"
                      onClick={(e) => handleDeleteCat(e, c)}
                    ></span>
                  </div>
                </div>
                {/* <a href="" onClick={(e) => handleDeleteCat(e, c)}>
                  Delete
                </a> */}
              </td>
            </tr>
            {getChildCat(c)}
          </>
        );
      });
    }
    return html;
  };

  const handleDeleteCat = (e, item) => {
    e.preventDefault();
    setlistLoading(true);
    deleteCategory(item.id).then((res) => {
      toast(res?.message);
      setlistLoading(false);
      getAllCategories();
    });
  };
  const handleAddCategory = (item) => {
    // console.log("item", item);
    setUpdateStatus(false);
    setUpdateData("");
    setAddStatus(true);
    setAddCategories([{ id: item.id, title: item.title, is_deleted: 0 }]);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            {/* <h1 class="m-0 text-dark">Category Management</h1> */}
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div
            className="d-flex justify-content-start align-items-start w-100"
            ref={formRef}
          >
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6>Add new category</h6>
                </div>
                <div className="card-body hasFullLoading">
                  {loading && <FullLoading />}
                  <Formik
                    enableReinitialize
                    initialValues={{
                      title: updateStatus ? updateData?.title : "",
                      slug: updateStatus ? updateData?.slug : "",
                      parent_id: updateStatus
                        ? updateData?.parent_id
                        : addStatus
                        ? addCategories[0]?.id
                        : "0",
                      status: updateStatus ? updateData?.status : "1",
                    }}
                    validationSchema={yup.object().shape({
                      title: yup
                        .string()
                        .required("Category title is required!"),
                      slug: yup.string().required("Slug is required"),
                      parent_id: yup.string().required("Parent is required"),
                      status: yup.string().required("Status is required"),
                    })}
                    onSubmit={(values, { resetForm }) => {
                      if (addStatus) {
                        values.parent_id = values.parent_id.toString();
                      }
                      handleSubmit(values, resetForm);
                    }}
                  >
                    {({ errors, touched, setFieldValue }) => (
                      <Form>
                        <div className="form-group has-feedback">
                          <label htmlFor="title">Title *</label>
                          <Field
                            type="text"
                            name="title"
                            className="form-control"
                            id="title"
                            placeholder="Enter category title"
                            onBlur={(e) => handleChangeTitle(e, setFieldValue)}
                          />
                          {touched.title && errors.title && (
                            <div className="form-error">{errors.title}</div>
                          )}
                        </div>

                        <div className="form-group has-feedback">
                          <label htmlFor="slug">Slug *</label>
                          <Field
                            type="text"
                            name="slug"
                            className="form-control"
                            id="slug"
                            placeholder="Enter category slug"
                          />
                          {touched.slug && errors.slug && (
                            <div className="form-error">{errors.slug}</div>
                          )}
                        </div>

                        {!updateStatus && (
                          <div className="form-group has-feedback">
                            <label htmlFor="parent_id">Parent Category *</label>
                            <Field
                              as="select"
                              name="parent_id"
                              className="form-control"
                              id="parent_id"
                            >
                              <option value="0">No parent</option>
                              {allCategories &&
                                !addStatus &&
                                allCategories.map((item) => {
                                  if (item.is_deleted == 0) {
                                    return (
                                      <option value={`${item?.id}`}>
                                        {item?.title}
                                      </option>
                                    );
                                  }
                                })}
                              {addStatus &&
                                addCategories.map((item) => {
                                  if (item.is_deleted == 0) {
                                    return (
                                      <option value={`${item?.id}`}>
                                        {item?.title}
                                      </option>
                                    );
                                  }
                                })}
                            </Field>
                            {touched.parent_id && errors.parent_id && (
                              <div className="form-error">
                                {errors.parent_id}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="row">
                          <div className="col-4">
                            <button
                              type="submit"
                              className="btn btn-primary btn-block btn-flat create-cat"
                            >
                              {updateStatus
                                ? "Update category"
                                : " Create category"}
                            </button>
                          </div>
                          {updateStatus && (
                            <div className="col-4 ml-4">
                              <button
                                type="button"
                                className="btn btn-danger btn-block btn-flat create-cat"
                                onClick={() => {
                                  setUpdateData("");
                                  setUpdateStatus(false);
                                  setAddStatus(false);
                                }}
                              >
                                Cancel Edit
                              </button>
                            </div>
                          )}
                          {addStatus && (
                            <div className="col-4 ml-4">
                              <button
                                type="button"
                                className="btn btn-danger btn-block btn-flat create-cat"
                                onClick={() => {
                                  setAddStatus(false);
                                  setAddCategories([]);
                                  setUpdateData("");
                                  setUpdateStatus(false);
                                }}
                              >
                                Cancel Create
                              </button>
                            </div>
                          )}
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>

            <NestedCategory
              allCategories={allCategories}
              listLoading={listLoading}
              handleUpdateCategory={handleUpdateCategory}
              handleDeleteCat={handleDeleteCat}
              handleAddCategory={handleAddCategory}
            />
          </div>
          <ToastContainer />
        </div>
      </section>
    </>
  );
};

export default CategoryManagementPage;
