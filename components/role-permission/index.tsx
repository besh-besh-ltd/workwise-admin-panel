import React, { useEffect, useState, useMemo } from 'react'
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
    section: string | null;
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

    // Group menu items by section
    const groupedMenu = useMemo(() => {
        const groups: Record<string, MenuItem[]> = {};
        menuList.forEach((item) => {
            const section = item.section || 'Other';
            if (!groups[section]) groups[section] = [];
            groups[section].push(item);
        });
        return groups;
    }, [menuList]);

    const sectionOrder = useMemo(() => Object.keys(groupedMenu), [groupedMenu]);

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

    const handleSectionToggle = (section: string): void => {
        const sectionIds = groupedMenu[section]?.map((m) => m.id) || [];
        const allSelected = sectionIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(selectedIds.filter((id) => !sectionIds.includes(id)));
        } else {
            const merged = new Set([...selectedIds, ...sectionIds]);
            setSelectedIds(Array.from(merged));
        }
    };

    const isSectionFullySelected = (section: string): boolean => {
        const sectionIds = groupedMenu[section]?.map((m) => m.id) || [];
        return sectionIds.length > 0 && sectionIds.every((id) => selectedIds.includes(id));
    };

    const isSectionPartiallySelected = (section: string): boolean => {
        const sectionIds = groupedMenu[section]?.map((m) => m.id) || [];
        const someSelected = sectionIds.some((id) => selectedIds.includes(id));
        return someSelected && !isSectionFullySelected(section);
    };

    const handleSelectAll = (): void => {
        const allIds = menuList.map((m) => m.id);
        const allSelected = allIds.every((id) => selectedIds.includes(id));
        setSelectedIds(allSelected ? [] : allIds);
    };

    const getSubAdminList = (): void => {
        getSubadminDropdown()
            .then((res: any) => {
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
                .then(() => {
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
                .then(() => {
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
            .then((res: any) => {
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
            .then((res: any) => {
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

    const selectedCount = selectedIds.length;
    const totalCount = menuList.length;

    return (
        <>
            <ToastContainer />
            <section className="content">
                <div className="card card-body product-table mt-3">
                    {/* User selection */}
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

                    {/* Menu permissions — grouped by section */}
                    <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="mb-0">Menu Permissions</h4>
                            <div className="d-flex align-items-center gap-3">
                                <small className="text-muted">{selectedCount} / {totalCount} selected</small>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handleSelectAll}
                                >
                                    {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                        </div>

                        <div className="row g-3">
                            {sectionOrder.map((section) => {
                                const items = groupedMenu[section];
                                const fullySelected = isSectionFullySelected(section);
                                const partiallySelected = isSectionPartiallySelected(section);

                                return (
                                    <div className="col-md-6 col-lg-4" key={section}>
                                        <div className="card h-100">
                                            <div
                                                className="card-header d-flex align-items-center gap-2 py-2"
                                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                                onClick={() => handleSectionToggle(section)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={fullySelected}
                                                    ref={(el) => {
                                                        if (el) el.indeterminate = partiallySelected;
                                                    }}
                                                    onChange={() => handleSectionToggle(section)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ width: '1rem', height: '1rem', margin: 0, marginRight: '0.75rem', flexShrink: 0, cursor: 'pointer' }}
                                                />
                                                <strong style={{ fontSize: '0.85rem' }}>{section}</strong>
                                                <small className="text-muted ms-auto">
                                                    {items.filter((m) => selectedIds.includes(m.id)).length}/{items.length}
                                                </small>
                                            </div>
                                            <div className="card-body py-2">
                                                {items.map((menu) => (
                                                    <div className="form-check mb-1" key={menu.id}>
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={selectedIds.includes(menu.id)}
                                                            onChange={() => handleCheckboxChange(menu.id)}
                                                            id={`checkbox-${menu.id}`}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`checkbox-${menu.id}`}
                                                            style={{ fontSize: '0.85rem' }}
                                                        >
                                                            {menu.tile}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
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
