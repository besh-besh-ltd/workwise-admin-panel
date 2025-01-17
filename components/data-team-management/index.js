import React, { useEffect, useRef, useState } from 'react'
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from '../modal/delete-modal';
import { getSubAdminList } from '@/utils/services/subadmin-management';
import { capitalize } from '../shared/TitleCase';

const DataTeamManagement = () => {
    const router = useRouter();
    const [dataTeamList, setDataTeamList] = useState([]);
    const [limit, setlimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, settotalPages] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [id, setId] = useState();
    const [searchString, setSearchString] = useState('');
    const userTypeRef = useRef(6);

    const handleClose = () => setShowModal(false);
    
    const handleDeleteItem = (id) => {
        setShowModal(true);
        setId(id);
    };

    const handleSearch = (e) => {
        setSearchString(e.target.value);
    }
    const handlePageClick = (e) => {
        setPage(e.selected + 1);
    };


    const handleRolePermission = (item) => {
        router.push(`/role-permission/${item.id}`);
    }

    const getDataTeamList = () => {
        getSubAdminList(page, limit, searchString, userTypeRef.current)
            .then((res) => {
                settotalPages(res.total_count);
                setDataTeamList(res.data);
            })
            .catch((err) => {
                console.log("err", err)
            });
    }

    const handleDataTeamUpdate = (item) => {
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
                    
                    {Math.ceil(totalPages / 10) > 1 && (
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
                </div>
            </section>
            <DeleteModal
                show={showModal}
                onHide={handleClose}
            />
        </>
    )
}

export default DataTeamManagement
