import { handleGetFeedbackList } from '@/utils/services/feedback';
import React, { useEffect, useState } from 'react'
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from 'react-toastify'
import moment from 'moment';

interface Feedback {
    id: number;
    name: string;
    action_key: string;
    event: string;
    rating: number;
    comment: string;
    created_at: string;
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

const ACTION_KEY_OPTIONS: Record<string, string> = {
    'created_rfq': 'Created RFQ',
    'boq_ai': 'BOQ AI',
    'pr_submitted': 'PR Submitted',
    'overall_experience': 'Overall Experience',
};

const EVENT_OPTIONS: Record<string, string> = {
    'submitted': 'Submitted',
    'dismissed': 'Dismissed',
};

const FeedbackManagement: React.FC = () => {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [limit] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [totalPages, settotalPages] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        action_key: '',
        event: '',
        start_date: '',
        end_date: '',
    });

    const handlePageClick = (e: PageClickEvent): void => {
        setPage(e.selected + 1);
    };

    const [goToPage, setGoToPage] = useState<string>('');

    const handleFilterChange = (key: string, value: string): void => {
        if (key === 'start_date') {
            const updates: Record<string, string> = { start_date: value };
            if (filters.end_date && value && filters.end_date < value) {
                updates.end_date = '';
            }
            setFilters(prev => ({ ...prev, ...updates }));
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
        setPage(1);
    };

    const getFeedbackList = (): void => {
        handleGetFeedbackList(page, limit, {
            action_key: filters.action_key || undefined,
            event: filters.event || undefined,
            start_date: filters.start_date || undefined,
            end_date: filters.end_date || undefined,
        })
            .then((res: any) => {
                settotalPages(res.total_count);
                setFeedbackList(res.data);
            })
            .catch((error: ApiError) => {
                let txt = "";
                for (let x in error.error.response.data.errors) {
                    txt = error.error.response.data.errors[x];
                }
                toast.error(txt);
            });
    }

    const renderStars = (rating: number) => {
        const stars: React.ReactElement[] = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`fa fa-star${i <= rating ? '' : '-o'}`}
                    style={{ color: i <= rating ? '#ffc107' : '#ccc', marginRight: 2 }}
                />
            );
        }
        return stars;
    };

    const handleClearFilters = (): void => {
        setFilters({ action_key: '', event: '', start_date: '', end_date: '' });
        setPage(1);
    };

    useEffect(() => {
        getFeedbackList();
    }, [page, filters])

    const pageCount = Math.ceil((totalPages || 0) / limit);

    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">User Feedback</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="card card-body product-table mt-3">
                    <div className="row mb-3">
                        <div className="col-sm-3 mb-2">
                            <label className="form-label small">Action Key</label>
                            <select
                                className="form-control form-control-sm"
                                value={filters.action_key}
                                onChange={(e) => handleFilterChange('action_key', e.target.value)}
                            >
                                <option value="">All</option>
                                {Object.entries(ACTION_KEY_OPTIONS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-sm-2 mb-2">
                            <label className="form-label small">Event</label>
                            <select
                                className="form-control form-control-sm"
                                value={filters.event}
                                onChange={(e) => handleFilterChange('event', e.target.value)}
                            >
                                <option value="">All</option>
                                {Object.entries(EVENT_OPTIONS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-sm-2 mb-2">
                            <label className="form-label small">Start Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={filters.start_date}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            />
                        </div>
                        <div className="col-sm-2 mb-2">
                            <label className="form-label small">End Date</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={filters.end_date}
                                min={filters.start_date || undefined}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            />
                        </div>
                        <div className="col-sm-1 mb-2 d-flex align-items-end">
                            <button
                                className="btn btn-secondary btn-sm w-100"
                                onClick={handleClearFilters}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">User</th>
                                <th scope="col">Action Key</th>
                                <th scope="col">Event</th>
                                <th scope="col">Rating</th>
                                <th scope="col">Comment</th>
                                <th scope="col">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                feedbackList && feedbackList.length > 0 ? feedbackList.map((item, index) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{(page - 1) * limit + index + 1}</td>
                                            <td>{item?.name || "unknown user"}</td>
                                            <td>{ACTION_KEY_OPTIONS[item?.action_key] || '--'}</td>
                                            <td>{EVENT_OPTIONS[item?.event] || '--'}</td>
                                            <td>{renderStars(item?.rating)}</td>
                                            <td>{item?.comment || '--'}</td>
                                            <td>{item?.created_at ? moment(item.created_at).format('DD MMM YYYY, hh:mm A') : '--'}</td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan={7} className="text-center">No Data was Found !!</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>

                    {pageCount > 1 && (
                        <div className="d-flex flex-column align-items-center gap-2">
                            <ReactPaginate
                                breakLabel="..."
                                previousLabel={<i className="fa fa-angle-left"></i>}
                                nextLabel={<i className="fa fa-angle-right"></i>}
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={2}
                                marginPagesDisplayed={2}
                                pageCount={pageCount}
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
                                    type="text"
                                    className="form-control"
                                    style={{ width: "125px" }}
                                    placeholder="Go to page"
                                    value={goToPage}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const val = e.target.value;
                                        if (val === '' || /^[1-9]\d*$/.test(val)) {
                                            setGoToPage(val);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const pageNum = parseInt(goToPage);
                                            if (pageNum >= 1 && pageNum <= pageCount) {
                                                setPage(pageNum);
                                                setGoToPage('');
                                            }
                                        }
                                    }}
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        const pageNum = parseInt(goToPage);
                                        if (pageNum >= 1 && pageNum <= pageCount) {
                                            setPage(pageNum);
                                            setGoToPage('');
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
        </>
    )
}

export default FeedbackManagement
