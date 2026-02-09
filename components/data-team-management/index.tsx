import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from '../modal/delete-modal';
import { getSubAdminList } from '@/utils/services/subadmin-management';
import { capitalize } from '../shared/TitleCase';

interface DataTeamMember {
    id: number | string;
    name: string;
    email: string;
    mobile: string;
}

interface PageClickEvent {
    selected: number;
}

const DataTeamManagement: React.FC = () => {
    const router = useRouter();
    const [dataTeamList, setDataTeamList] = useState<DataTeamMember[]>([]);
    const [limit, setlimit] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [totalPages, settotalPages] = useState<number | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [id, setId] = useState<number | string | undefined>();
    const [searchString, setSearchString] = useState<string>('');
    const userTypeRef = useRef<number>(6);

    const handleClose = (): void => setShowModal(false);

    const handleDeleteItem = (id: number | string): void => {
        setShowModal(true);
        setId(id);
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearchString(e.target.value);
    }
    const handlePageClick = (e: PageClickEvent): void => {
        setPage(e.selected + 1);
    };


    const handleRolePermission = (item: DataTeamMember): void => {
        router.push(`/role-permission/${item.id}`);
    }

    const getDataTeamList = (): void => {
        getSubAdminList(page, limit, searchString, userTypeRef.current)
            .then((res : any) => {
                settotalPages(res.total_count);
                setDataTeamList(res.data);
            })
            .catch((err) => {
                console.log("err", err)
            });
    }

    const handleDataTeamUpdate = (item: DataTeamMember): void => {
        router.push(`/data-team-management/edit-data-member/${item.id}`);
    }

    useEffect(() => {
        getDataTeamList();
    }, [page, searchString])

    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Data Member List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/data-team-management/add-data-member")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add Member
                        </button>
                    </div>
                </div>

                <div className="card card-body product-table mt-3">
                    <div className="row justify-content-end">
                        <div className="col-sm-4 mb-4">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search Member"
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
                                dataTeamList && dataTeamList?.map((item, index) => {
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
                                                            `/data-team-management/data-member-details/${item.id}`
                                                        )
                                                    }
                                                ></span>
                                                <span
                                                    className="fa fa-edit"
                                                    data-toggle="tooltip" title="Edit Member"
                                                    onClick={() => handleDataTeamUpdate(item)}
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

                    {Math.ceil((totalPages || 0) / 10) > 1 && (
                        <div className="d-flex flex-column align-items-center gap-2">
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel={<i className="fa fa-angle-right"></i>}
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={2}
                                pageCount={Math.ceil((totalPages || 0) / 10)}
                                previousLabel={<i className="fa fa-angle-left"></i>}
                                renderOnZeroPageCount={null}
                                className="pagination"
                            />
                            <div className="d-flex align-items-center gap-2 mt-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    style={{ width: "125px" }}
                                    placeholder="Go to page"
                                    min="1"
                                    max={Math.ceil((totalPages || 0) / 10)}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const pageNum = Math.max(1, Math.min(Math.ceil((totalPages || 0) / 10), parseInt(e.target.value) || 1));
                                        setPage(pageNum);
                                    }}
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                                        const pageNum = parseInt(input.value);
                                        if (pageNum && pageNum >= 1 && pageNum <= Math.ceil((totalPages || 0) / 10)) {
                                            setPage(pageNum);
                                        }
                                    }}
                                >
                                    Go
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <DeleteModal
                show={showModal}
                onHide={handleClose}
                data={()=>{}}
            />
        </>
    )
}

export default DataTeamManagement
