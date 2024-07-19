import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Field, Form, Formik } from "formik";
import * as yup from "yup";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import { createRolePermission, getMenuList, getRolesDetails, getSubadminDropdown, updateRolePermission } from '@/utils/services/rolesPermission';

function RolesPermission() {
    const router = useRouter();
    const [subAdminList, setSubAdminList] = useState([]);
    const [menuList, setMenuList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedOption, setSelectedOption] = useState(router?.query?.id ?? "");

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleCheckboxChange = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const getSubAdminList = () => {
        getSubadminDropdown()
            .then((res) => {
                let arr = res?.data?.map((item) => {
                    return {
                        label: item?.name,
                        value: item?.id
                    }
                })
                setSubAdminList(arr);
            })
            .catch((err) => {
                console.log("err", err)
            });
    }

    const getSubadminRolesDetails = () => {
        getRolesDetails(router?.query?.id || selectedOption)
            .then((res) => {
                let arr = res?.data?.map((item) => item?.menu_id)
                setSelectedIds(arr)
            })
            .catch((err) => {
                console.log("err", err)
            });
    }

    const getMenu = () => {
        getMenuList()
            .then((res) => {
                setMenuList(res.data);
            })
            .catch((err) => {
                console.log("err", err)
            });
    }

    const handleRolePermission = () => {
        if (selectedOption === "") {
            return toast.error("Please select subAdmin")
        }
        if (selectedIds?.length === 0) {
            return toast.error("Please select atleast 1 menu")
        }
        const payload = {
            user_id: selectedOption,
            menu_id: selectedIds
        }
        if (router?.query?.id) {
            delete payload.user_id;
            updateRolePermission(payload, router?.query?.id)
                .then((res) => {
                    toast.success("Roles updated successfully")
                    setSelectedIds([]);
                    setSelectedOption("");
                    setTimeout(() => {
                        router.push("/subadmin-management");
                    }, 1000);
                })
                .catch((err) => {
                    let txt = "";
                    for (let x in error?.error?.response?.data?.errors) {
                        txt = error?.error?.response?.data?.errors[x];
                    }
                    toast.error(txt);
                });
        } else {
            createRolePermission(payload)
                .then((res) => {
                    toast.success("Roles added successfully")
                    setSelectedIds([]);
                    setSelectedOption("");
                    setTimeout(() => {
                        router.push("/subadmin-management");
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
    }

    useEffect(() => {
        if (router?.query?.id) {
            getSubadminRolesDetails()
        }
    }, [router])

    useEffect(() => {
        if(selectedOption){
            getSubadminRolesDetails()
        }
    },[selectedOption])

    useEffect(() => {
        getSubAdminList();
        getMenu();
    }, [])
    return (
        <>
            <ToastContainer />
            <section className="content">
                <div className="card card-body product-table mt-3">
                    <div className="">
                        <div className="col-sm-4">
                            <div className="form-group">
                                <div className="form-group">
                                    <label htmlFor="select-input" className="form-label">
                                        Select SubAdmin
                                    </label>
                                    <select
                                        id="select-input"
                                        className="form-control"
                                        value={selectedOption}
                                        onChange={handleChange}
                                        disabled={!!router.query.id}
                                    >
                                        <option value="" disabled>Select an option</option>
                                        {subAdminList?.map((option, index) => (
                                            <option key={index} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <h4>Menu List</h4>
                        <div className="row mt-3">
                            {menuList && menuList.map((menu) => (
                                <div className="col-md-4 mb-3" key={menu.id}>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={selectedIds.includes(menu.id)}
                                            onChange={() => handleCheckboxChange(menu.id)}
                                            id={`checkbox-${menu.id}`}
                                        />
                                        <label htmlFor={`checkbox-${menu.id}`}>
                                            {menu.tile}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="d-flex justify-content-end">
                        <button onClick={handleRolePermission} class="btn btn-primary justify">
                            Save
                        </button>
                    </div>
                </div>
            </section>
        </>
    )
}

export default RolesPermission