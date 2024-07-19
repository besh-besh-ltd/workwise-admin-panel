import { handleDeleteTestimonial, handleGetTestimonialList } from '@/utils/services/testimonial-management';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from 'react-toastify'
import DeleteModal from '../modal/delete-modal';

const TestimonialManagement = () => {
    const router = useRouter();
    const [testimonialList, setTestimonialList] = useState([])
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

    const handleTestimonialUpdate = (item) => {
        router.push(`/testimonial-management/edit-testimonial/${item.id}`);
    }

    const handleClose = () => setShowModal(false);

    const submitDeleteSection = () => {
        handleDeleteTestimonial(id)
            .then((res) => {
                handleClose();
                toast(res.message);
                getTestimonialList();
            })
            .catch((error) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast(txt);
                handleClose();
            });
    }


    const handleSearch = (e) => {
        setSearchString(e.target.value);
    }

    const getTestimonialList = () => {
        handleGetTestimonialList(page, limit, searchString)
            .then((res) => {
                // settotalPages(Math.ceil(res.total_count / limit));
                settotalPages(res.total_count);
                setTestimonialList(res.data);
            })
            .catch((error) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast.error(txt);
            });
    }

    useEffect(() => {
        getTestimonialList();
    }, [page, searchString])
    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Testimonial List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/testimonial-management/add-testimonial")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add Testimonial
                        </button>
                    </div>
                </div>

                <div className="card card-body product-table mt-3">
                    <div className="row justify-content-end">
                        <div className="col-sm-4 mb-4">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search testimonial"
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">Title</th>
                                {/* <th scope="col">Image</th> */}
                                <th scope="col">Description</th>
                                <th scope="col">Status</th>
                                <th scope="col">URL</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                testimonialList && testimonialList?.map((item) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{item?.title}</td>
                                            {/* <td>
                                                <img
                                                    src={item?.image_url}
                                                    alt="testi"
                                                    width={180}
                                                    height={100}
                                                    priority={true}
                                                />
                                            </td> */}
                                            <td>{item?.description}</td>
                                            <td>{item?.status === 1 ? 'Active' : 'In-Active'}</td>
                                            <td>{item?.url}</td>
                                            <td className='col-md-2'>
                                                <span
                                                    className="fa fa-edit mr-3"
                                                    onClick={() => handleTestimonialUpdate(item)}
                                                ></span>
                                                <span
                                                    className="fa fa-trash ml-3"
                                                    onClick={() => handleDeleteItem(item?.id)}
                                                ></span>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>

                    {/* <nav aria-label="Page navigation example">
                        <ul className="pagination">
                            {Array.from(Array(totalPages), (e, i) => {
                                if (i + 1 === page) {
                                    return (
                                        <li className="active page-item" key={i + 1}>
                                            <a
                                                className="page-link"
                                                href=""
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setpage(i + 1);
                                                }}
                                            >
                                                {i + 1}
                                            </a>
                                        </li>
                                    );
                                } else {
                                    return (
                                        <li className="page-item" key={i + 1}>
                                            <a
                                                className="page-link"
                                                href=""
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setpage(i + 1);
                                                }}
                                            >
                                                {i + 1}
                                            </a>
                                        </li>
                                    );
                                }
                            })}
                        </ul>
                    </nav> */}
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
                data={submitDeleteSection}
            />
        </>
    )
}

export default TestimonialManagement