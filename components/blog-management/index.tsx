import { useRouter } from 'next/router';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DeleteModal from '../modal/delete-modal';
import ReactPaginate from "react-paginate";
import { handleDeleteBlog, handleGetBlogList } from '@/utils/services/blog-management';

interface BlogItem {
    id: number;
    title: string;
    description: string;
    status: number;
    category: string;
}

interface PageClickEvent {
    selected: number;
}

const BlogManagement: React.FC = () => {
    const router = useRouter();
    const [blogsList, setBlogsList] = useState<BlogItem[]>([]);
    const [limit, setlimit] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [totalPages, settotalPages] = useState<number | null>(null);
    const [searchString, setSearchString] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [id, setId] = useState<number | undefined>();

    const handleClose = (): void => setShowModal(false);

    const handleBlogUpdate = (item: BlogItem): void => {
        router.push(`/blog-management/edit-blog/${item.id}`);
    };

    const handleDeleteItem = (id: number): void => {
        setShowModal(true);
        setId(id);
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearchString(e.target.value);
    };

    const handlePageClick = (e: PageClickEvent): void => {
        setPage(e.selected + 1);
    };

    const submitDeleteSection = (): void => {
        handleDeleteBlog(id as number)
            .then((res: { message: string }) => {
                handleClose();
                toast(res.message);
                getBlogsList();
            })
            .catch((error: { error: { response: { data: { errors: Record<string, string> } } } }) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast(txt);
                handleClose();
            });
    };

    const getBlogsList = (): void => {
        handleGetBlogList(page, limit, searchString)
            .then((res: { total_count: number; data: BlogItem[] }) => {
                settotalPages(res.total_count);
                setBlogsList(res.data);
            })
            .catch((error: { error: { response: { data: { errors: Record<string, string> } } } }) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast.error(txt);
            });
    };

    useEffect(() => {
        getBlogsList();
    }, [page, searchString]);

    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Blogs List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/blog-management/add-blog")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add Blogs
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
                                <th scope="col">Description</th>
                                <th scope="col">Status</th>
                                <th scope="col">Category</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                blogsList && blogsList?.map((item) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{item?.title}</td>
                                            <td>{item?.description}</td>
                                            <td>{item?.status === 1 ? 'Active' : 'In-Active'}</td>
                                            <td>{item?.category}</td>
                                            <td className='col-md-2'>
                                                <span
                                                    className="fa fa-edit mr-3"
                                                    onClick={() => handleBlogUpdate(item)}
                                                ></span>
                                                <span
                                                    className="fa fa-trash ml-3"
                                                    onClick={() => handleDeleteItem(item?.id)}
                                                ></span>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                    {totalPages && Math.ceil(totalPages / 10) > 1 && (
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
                            <div className="d-flex align-items-center gap-2 mt-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    style={{ width: "125px" }}
                                    placeholder="Go to page"
                                    min="1"
                                    max={Math.ceil(totalPages / 10)}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / 10), parseInt(e.target.value) || 1));
                                        setPage(pageNum);
                                    }}
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                                        const pageNum = parseInt(input.value);
                                        if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 10)) {
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
    );
};

export default BlogManagement;
