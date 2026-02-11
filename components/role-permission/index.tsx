import React, { useEffect, useState } from 'react'
import { useRouter, NextRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import { createRolePermission, getMenuList, getRolesDetails, getSubadminDropdown, updateRolePermission } from '@/utils/services/rolesPermission';
import Select, { SingleValue } from 'react-select';

interface SelectOption {
    label: string;
    value: number;
}

interface MenuItem {
    id: number;
    tile: string;
}

interface UserItem {
    id: number;
    name: string;
    user_type: number;
}

interface QueryUserDetails {
    type: 'subadmin' | 'datamember';
    details: SelectOption;
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

const RolesPermission: React.FC = () => {
    const router: NextRouter = useRouter();
    const [subAdminList, setSubAdminList] = useState<SelectOption[]>([]);
    const [dataMemberList, setDataMemberList] = useState<SelectOption[]>([]);
    const [menuList, setMenuList] = useState<MenuItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectedSubAdmin, setSelectedSubAdmin] = useState<SelectOption | null>(null);
    const [selectedDataMember, setSelectedDataMember] = useState<SelectOption | null>(null);
    const [userType, setUserType] = useState<string>("");
    const [queryUserDetails, setQueryUserDetails] = useState<QueryUserDetails | null>(null);

    const handleSubAdminChange = (selectedOption: SingleValue<SelectOption>): void => {
        setSelectedSubAdmin(selectedOption);
        setSelectedDataMember(null);
        setUserType(selectedOption ? "subadmin" : "");
        if (!selectedOption) {
            setSelectedIds([]);
        }
    };

    const handleDataMemberChange = (selectedOption: SingleValue<SelectOption>): void => {
        setSelectedDataMember(selectedOption);
        setSelectedSubAdmin(null);
        setUserType(selectedOption ? "datamember" : "");
        if (!selectedOption) {
            setSelectedIds([]);
        }
    };

    const handleCheckboxChange = (id: number): void => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const getSubAdminList = (): void => {
        getSubadminDropdown()
            .then((res : any) => {
                let subAdmins: SelectOption[] = [], dataMembers: SelectOption[] = [];
                res?.data?.forEach((item: UserItem) => {
                    const option: SelectOption = {
                        label: item?.name,
                        value: item?.id
                    };

                    if (item?.user_type === 5) {
                        subAdmins.push(option);
                        if (item.id === parseInt(router?.query?.id as string)) {
                            setQueryUserDetails({ type: "subadmin", details: option });
                        }
                    } else if (item?.user_type === 6) {
                        dataMembers.push(option);
                        if (item.id === parseInt(router?.query?.id as string)) {
                            setQueryUserDetails({ type: "datamember", details: option });
                        }
                    }
                });
                setSubAdminList(subAdmins);
                setDataMemberList(dataMembers);
            })
            .catch((err) => {
                console.log("Error fetching users:", err);
            });
    };

    const handleRolePermission = (): void => {
        const selectedUser = selectedSubAdmin || selectedDataMember;

        if (!selectedUser) {
            toast.error("Please select a user");
            return;
        }
        if (selectedIds?.length === 0) {
            toast.error("Please select at least 1 menu");
            return;
        }

        const payload: { user_id?: number; menu_id: number[] } = {
            user_id: selectedUser.value,
            menu_id: selectedIds
        };

        if (router?.query?.id) {
            delete payload.user_id;
            updateRolePermission(payload, router?.query?.id as string)
                .then((res) => {
                    toast.success("Roles updated successfully");
                    resetForm();
                    setTimeout(() => {
                        router.push("/subadmin-management");
                    }, 1000);
                })
                .catch((error: ApiError) => {
                    handleError(error);
                });
        } else {
            createRolePermission(payload)
                .then((res) => {
                    toast.success("Roles added successfully");
                    resetForm();
                    setTimeout(() => {
                        router.push("/subadmin-management");
                    }, 1000);
                })
                .catch((error: ApiError) => {
                    handleError(error);
                });
        }
    };

    const getMenu = (): void => {
        getMenuList()
            .then((res : any) => {
                setMenuList(res.data);
            })
            .catch((err) => {
                console.log("err", err)
            });
    };

    const getSelectedUserRolesDetails = (): void => {
        const selectedId = userType === "subadmin" ? selectedSubAdmin?.value : selectedDataMember?.value;
        if (!selectedId) return;

        getRolesDetails(selectedId)
            .then((res : any) => {
                const arr = res?.data?.map((item: { menu_id: number }) => item?.menu_id);
                setSelectedIds(arr);
            })
            .catch((err) => {
                console.log("Error fetching roles:", err);
            });
    };


    const resetForm = (): void => {
        setSelectedIds([]);
        setSelectedSubAdmin(null);
        setSelectedDataMember(null);
        setUserType("");
    };

    const handleError = (error: ApiError): void => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
            txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
    };

    useEffect(() => {
        if (router?.query?.id) {
            getSelectedUserRolesDetails();
        }
    }, [router]);

    useEffect(() => {
        if (selectedSubAdmin || selectedDataMember) {
            getSelectedUserRolesDetails();
        }
    }, [selectedSubAdmin, selectedDataMember]);

    useEffect(() => {
        getSubAdminList();
        getMenu();
    }, []);

    useEffect(() => {
        if (router?.query?.id && queryUserDetails) {
            if (queryUserDetails.type === "subadmin") {
                setSelectedSubAdmin(queryUserDetails.details);
                setUserType("subadmin");
            } else if (queryUserDetails.type === "datamember") {
                setSelectedDataMember(queryUserDetails.details);
                setUserType("datamember");
            }
        }
    }, [router?.query?.id, queryUserDetails]);

    return (
        <>
            <ToastContainer />
            <section className="content">
                <div className="card card-body product-table mt-3">
                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="select-subadmin" className="form-label">
                                    Select SubAdmin
                                </label>
                                <Select
                                    id="select-subadmin"
                                    name="subAdmin"
                                    value={selectedSubAdmin}
                                    options={subAdminList}
                                    onChange={handleSubAdminChange}
                                    isDisabled={!!router.query.id || !!selectedDataMember}
                                    isClearable
                                    isSearchable
                                    className="basic-single"
                                    classNamePrefix="select"
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="select-data-member" className="form-label">
                                    Select Data Member
                                </label>
                                <Select
                                    id="select-data-member"
                                    name="dataMember"
                                    value={selectedDataMember}
                                    options={dataMemberList}
                                    onChange={handleDataMemberChange}
                                    isDisabled={!!router.query.id || !!selectedSubAdmin}
                                    isClearable
                                    isSearchable
                                    className="basic-single"
                                    classNamePrefix="select"
                                />
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
                        <button onClick={handleRolePermission} className="btn btn-primary">
                            Save
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default RolesPermission;
