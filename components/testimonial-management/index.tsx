import { handleDeleteTestimonial, handleGetTestimonialList } from '@/utils/services/testimonial-management';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from 'react-toastify'
import DeleteModal from '../modal/delete-modal';

interface Testimonial {
    id: number;
    title: string;
    description: string;
    status: number;
    url: string;
    page_id: number;
    image_url?: string;
}

interface PageClickEvent {
    selected: number;
}

interface ApiError {
    error: {
        response: {
            data: {
                errors: Record<string, string>;
            };
        };
    };
}

const TestimonialManagement: React.FC = () => {
    const router = useRouter();
    const [testimonialList, setTestimonialList] = useState<Testimonial[]>([])
    const [limit, setlimit] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [totalPages, settotalPages] = useState<number | null>(null);
    const [searchString, setSearchString] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [id, setId] = useState<number | undefined>();

    const handleDeleteItem = (id: number): void => {
        setShowModal(true);
        setId(id);
    };
    const handlePageClick = (e: PageClickEvent): void => {
        setPage(e.selected + 1);
    };

    const handleTestimonialUpdate = (item: Testimonial): void => {
        router.push(`/testimonial-management/edit-testimonial/${item.id}`);
    }

    const handleClose = (): void => setShowModal(false);

    const submitDeleteSection = (): void => {
        handleDeleteTestimonial(id)
            .then((res: { message: string }) => {
                handleClose();
                toast(res.message);
                getTestimonialList();
            })
            .catch((error: ApiError) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast(txt);
                handleClose();
            });
    }


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchString(e.target.value);
    }

    const getTestimonialList = (): void => {
        handleGetTestimonialList(page, limit, searchString)
            .then((res: { total_count: number; data: Testimonial[] }) => {
                // settotalPages(Math.ceil(res.total_count / limit));
                settotalPages(res.total_count);
                setTestimonialList(res.data);
            })
            .catch((error: ApiError) => {
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
                                <th scope="col">View</th>
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
                                            <td>{(item?.page_id == 1) ? "Home Page":"Vendor Page"}</td>
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                data={submitDeleteSection}
            />
        </>
    )
}

export default TestimonialManagement
