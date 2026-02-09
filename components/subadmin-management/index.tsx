import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from '../modal/delete-modal';
import { getSubAdminList } from '@/utils/services/subadmin-management';
import { capitalize } from '../shared/TitleCase';

interface SubAdminItem {
    id: number;
    name: string;
    email: string;
    mobile: string;
}

const SubadminManagement: React.FC = () => {
    const router = useRouter();
    const [subAdminList, setSubAdminList] = useState<SubAdminItem[]>([]);
    const [limit, setlimit] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [totalPages, settotalPages] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [id, setId] = useState<number | undefined>();
    const [searchString, setSearchString] = useState<string>('');
    const userTypeRef = useRef<number>(5);

    const handleClose = (): void => setShowModal(false);

    const handleDeleteItem = (id: number): void => {
        setShowModal(true);
        setId(id);
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearchString(e.target.value);
    }

    const handlePageClick = (e: { selected: number }): void => {
        setPage(e.selected + 1);
    };

    const handleRolePermission = (item: SubAdminItem): void => {
        router.push(`/role-permission/${item.id}`);
    }

    const getSubAdmin = (): void => {
        getSubAdminList(page, limit, searchString, userTypeRef.current)
            .then((res: any) => {
                settotalPages(res.total_count);
                setSubAdminList(res.data);
            })
            .catch((err: any) => {
                console.log("err", err)
            });
    }

    const handleSubAdminUpdate = (item: SubAdminItem): void => {
        router.push(`/subadmin-management/edit-subadmin/${item.id}`);
    }

    useEffect(() => {
        getSubAdmin();
    }, [page, searchString])

    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">SubAdmin List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/subadmin-management/add-subadmin")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add Subadmin
                        </button>
                    </div>
                </div>

                <div className="card card-body product-table mt-3">
                    <div className="row justify-content-end">
                        <div className="col-sm-4 mb-4">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search SubAdmin"
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Email</th>
                                <th scope="col">Mobile Number</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                subAdminList && subAdminList?.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{capitalize(item?.name)}</td>
                                            <td>{item?.email}</td>
                                            <td>{item?.mobile}</td>
                                            <td>
                                                <span
                                                    className="fa fa-eye mr-3"
                                                    onClick={() =>
                                                        router.push(
                                                            `/subadmin-management/subadmin-details/${item.id}`
                                                        )
                                                    }
                                                ></span>
                                                <span
                                                    className="fa fa-edit"
                                                    data-toggle="tooltip" title="Edit Subadmin"
                                                    onClick={() => handleSubAdminUpdate(item)}
                                                ></span>
                                                <span
                                                    className="fa fa-trash ml-3"
                                                    onClick={() => handleDeleteItem(item?.id)}
                                                ></span>
                                                <span
                                                    className="fa fa-edit ml-3"
                                                    data-toggle="tooltip" title="Edit Role"
                                                    onClick={() => handleRolePermission(item)}
                                                ></span>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    {totalPages !== null && Math.ceil(totalPages / 10) > 1 && (
                        <ReactPaginate
                            breakLabel="..."
                            nextLabel={<i className="fa fa-angle-right"></i>}
                            onPageChange={handlePageClick}
                            pageRangeDisplayed={2}
                            pageCount={Math.ceil(totalPages / 10)}
                            previousLabel={<i className="fa fa-angle-left"></i>}
                            renderOnZeroPageCount={null}
                            className="pagination"
                        />
                    )}
                    <div className="d-flex align-items-center gap-2 mt-2">
                        <input
                            type="number"
                            className="form-control"
                            style={{ width: "125px" }}
                            placeholder="Go to page"
                            min="1"
                            max={totalPages !== null ? Math.ceil(totalPages / 10) : 1}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const maxPage = totalPages !== null ? Math.ceil(totalPages / 10) : 1;
                                const pageNum = Math.max(1, Math.min(maxPage, parseInt(e.target.value) || 1));
                                setPage(pageNum);
                            }}
                        />
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                                const pageNum = parseInt(input.value);
                                const maxPage = totalPages !== null ? Math.ceil(totalPages / 10) : 1;
                                if (pageNum && pageNum >= 1 && pageNum <= maxPage) {
                                    setPage(pageNum);
                                }
                            }}
                        >
                            Go
                        </button>
                    </div>
                </div>
            </section>
            <DeleteModal
                show={showModal}
                onHide={handleClose}
            />
        </>
    )
}

export default SubadminManagement
