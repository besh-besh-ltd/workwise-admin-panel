import React, { useEffect, useState } from 'react'
import DeleteModal from '../modal/delete-modal'
import { toast, ToastContainer } from 'react-toastify'
import ReactPaginate from 'react-paginate'
import { useRouter } from 'next/router'
import { deleteTeamMember, getTeamMemberList } from '@/utils/services/team-management'
import Image from 'next/image'

const TeamManagement = () => {
    const router = useRouter();
    const [teamList, setTeamList] = useState([])
    const [limit, setlimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, settotalPages] = useState(null);
    const [searchString, setSearchString] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [id, setId] = useState();

    const handleDeleteItem = (id) => {
        setShowModal(true);
        setId(id);
    };

    const handlePageClick = (e) => {
        setPage(e.selected + 1);
    };

    const handleTeamMemberUpdate = (item) => {
        router.push(`/team-management/edit-team-member/${item.id}`);
    }

    const handleClose = () => setShowModal(false);

    const submitDeleteSection = () => {
        deleteTeamMember(id)
            .then((res) => {
                toast(res.message);
                getTeamList();
            })
            .catch((error) => {
                toast.error(error.message);
            })
            .finally(() => {
                handleClose()
            })
    }


    const handleSearch = (e) => {
        setSearchString(e.target.value);
    }

    const getTeamList = () => {
        getTeamMemberList(page, limit, searchString)
            .then((res) => {
                settotalPages(res.total_count);
                setTeamList(res.data);
            })
            .catch((error) => {
                toast.error(error.message);
            });
    }

    useEffect(() => {
        getTeamList();
    }, [page, searchString])

    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Team Members List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/team-management/add-team-member")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add new Member
                        </button>
                    </div>
                </div>

                <div className="card card-body product-table mt-3">
                    <div className="row justify-content-end">
                        <div className="col-sm-4 mb-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search member"
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <table className="table table-striped table-hover mb-3">
                        <thead className='text-nowrap'>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Role</th>
                                <th scope="col">Profile Image</th>
                                <th scope="col">Social Links</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamList && teamList.length > 0 &&
                                teamList.map((teamMember) => (
                                    <tr key={`team_member_${teamMember.id}`} >
                                        <td>{teamMember.name}</td>
                                        <td>{teamMember.role}</td>
                                        <td>
                                            <Image
                                                src={teamMember.profile_image}
                                                alt={teamMember.name}
                                                width={120}
                                                height={120}
                                            />
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: "200px" }}>
                                            {teamMember.linkedin}
                                            {teamMember.facebook
                                                ? <><br />{teamMember.facebook}</>
                                                : null}
                                            {teamMember.twitter
                                                ? <><br />{teamMember.twitter}</>
                                                : null}
                                        </td>
                                        <td>
                                            {teamMember.status == 1
                                                ? <button className="btn btn-success">Active</button>
                                                : <button className="btn btn-danger">Inactive</button>
                                            }
                                        </td>
                                        <td className='col-md-2'>
                                            <span
                                                className="fa fa-edit mr-3"
                                                onClick={() => handleTeamMemberUpdate(teamMember)}
                                            ></span>
                                            <span
                                                className="fa fa-trash ml-3"
                                                onClick={() => handleDeleteItem(teamMember.id)}
                                            ></span>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>

                    {Math.ceil(totalPages / 10) > 1 && (
                        <div className="d-flex flex-column align-items-center gap-2">
                            <ReactPaginate
                                previousLabel={<i className="fa fa-angle-left"></i>}
                                nextLabel={<i className="fa fa-angle-right"></i>}
                                breakLabel="..."
                                pageCount={Math.ceil(totalPages / 10)}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                                onPageChange={handlePageClick}
                                forcePage={page - 1}
                                containerClassName="pagination mb-0"
                                pageClassName="page-item"
                                pageLinkClassName="page-link"
                                previousClassName="page-item"
                                previousLinkClassName="page-link"
                                nextClassName="page-item" 
                                nextLinkClassName="page-link"
                                activeClassName="active"
                            />
                        </div>
                    )}
                </div>
            </section>
            <DeleteModal
                show={showModal}
                onHide={handleClose}
                data={submitDeleteSection}
            />
        </>
    )
}

export default TeamManagement
