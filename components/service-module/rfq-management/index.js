import FullLoading from '@/components/loading/FullLoading';
import { getRFQList } from '@/utils/services/rfq-management';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate';
import Select from 'react-select'

const initialFilterData = {
    rfq_status: null,
    admin_service_status: null,
    sort: "DESC"
};

const RFQManagement = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [rfqList, setRfqList] = useState(null);
    const [filterData, setFilterData] = useState({
        rfq_status: router.query.rfq_status || null,
        admin_service_status: router.query.admin_service_status || null,
        sort: router.query.sort || "DESC"
    });

    const [page, setPage] = useState(parseInt(router.query.page) || 1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            height: "30px",
            maxWidth: "300px",
            borderRadius: "6px",
            paddingLeft: "10px",
            marginRight: "15px",
        }),
    };

    const textCapitalize = (str) => {
        if (!str) return str;
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const updateUrlParams = (newParams) => {
        const query = { ...router.query, ...newParams };
        // Remove empty/null params
        Object.keys(query).forEach(key => !query[key] && delete query[key]);
        router.push({
            pathname: router.pathname,
            query
        }, undefined, { shallow: true });
    };

    const handleFilterChange = (selectedOption, actionMeta) => {
        const name = actionMeta.name;
        const value = selectedOption ? selectedOption.value : null;

        const newFilterData = {
            ...filterData,
            [name]: value
        };

        setFilterData(newFilterData);
        setPage(1);
        updateUrlParams({ 
            ...newFilterData, 
            page: 1 
        });
    }

    const getAllRFQs = () => {
        setLoading(true);
        getRFQList({ page, limit, ...filterData })
            .then((res) => {
                setRfqList(res.data);
                setTotalPages(res.total_items?.total || 1);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    // Sync with URL parameters
    useEffect(() => {
        if (!router.isReady) return;

        const { page: urlPage, rfq_status, admin_service_status, sort } = router.query;
        
        const newFilterData = {
            rfq_status: rfq_status || null,
            admin_service_status: admin_service_status || null,
            sort: sort || "DESC"
        };

        if (urlPage) setPage(parseInt(urlPage));
        setFilterData(newFilterData);
    }, [router.isReady]);

    // Separate effect for data fetching
    useEffect(() => {
        if (!router.isReady) return;
        getAllRFQs();
    }, [page, filterData, router.isReady]);

    const handlePageChange = (e) => {
        const newPage = e.selected + 1;
        setPage(newPage);
        updateUrlParams({
            ...filterData,
            page: newPage
        });
    };

    return (
        <>
            {/* Title section */}
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">RFQ List</h1>
                    </div>
                </div>
            </section>

            <section className="content">
                <div className="container-fluid">

                    {/* Table Header Section */}
                    <div className="card card-body">
                        <div className="row">
                            <div className="col-sm-3">
                                <label htmlFor="rfq_status">RFQ Status</label>
                                <Select
                                    id="rfq_status"
                                    name="rfq_status"
                                    options={[
                                        {label: "Open", value: '1'},
                                        {label: "Closed", value: '2'}
                                    ]}
                                    placeholder="Select"
                                    styles={customSelectStyles}
                                    isClearable={true}
                                    onChange={handleFilterChange}
                                    value={filterData.rfq_status ? {
                                        label: filterData.rfq_status === '1' ? "Open" : "Closed",
                                        value: filterData.rfq_status
                                    } : null}
                                />
                            </div>
                            <div className="col-sm-3">
                                <label htmlFor="admin_service_status">Admin Service Status</label>
                                <Select
                                    id="admin_service_status"
                                    name="admin_service_status"
                                    options={[
                                        {label: "Pending", value: 'Pending'},
                                        {label: "Working", value: 'Working'},
                                        {label: "Complete", value: 'Complete'}
                                    ]}
                                    placeholder="Select"
                                    styles={customSelectStyles}
                                    isClearable={true}
                                    onChange={handleFilterChange}
                                    value={filterData.admin_service_status ? {
                                        label: filterData.admin_service_status,
                                        value: filterData.admin_service_status
                                    } : null}
                                />
                            </div>
                            <div className="col-sm-3"></div>
                            <div className="col-sm-3">
                                <label htmlFor="sort">Sort Order</label>
                                <Select
                                    id="sort"
                                    name="sort"
                                    options={[
                                        {label: "Latest to Oldest", value: "DESC"},
                                        {label: "Oldest to Latest", value: "ASC"}
                                    ]}
                                    placeholder="Latest to Oldest"
                                    styles={customSelectStyles}
                                    isClearable={false}                                    
                                    onChange={handleFilterChange}
                                    value={{
                                        label: filterData.sort === "DESC" ? "Latest to Oldest" : "Oldest to Latest",
                                        value: filterData.sort
                                    }}
                                />
                            </div>
                        </div>

                    </div>

                    {/* Table Section */}
                    <div className="card card-body product-table">
                        {loading && <FullLoading />}
                        {!loading && (
                            <table className="table table-striped table-hover table-responsive text-nowrap mb-3">
                                <thead>
                                    <tr>
                                        <th scope="col">RFQ No.</th>
                                        <th scope="col">Buyer Name</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Phone No.</th>
                                        <th scope="col">RFQ Status</th>
                                        <th scope="col">RFQ Type</th>
                                        <th scope="col">Reverse Auction</th>
                                        <th scope="col">Total Products</th>
                                        <th scope="col">Quotes Recieved</th>
                                        <th scope="col">Total Vendors</th>
                                        <th scope="col">Admin Status</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rfqList && rfqList.length > 0 &&
                                        rfqList.map((rfqItem) => {
                                            return (
                                                <tr key={rfqItem.id}>
                                                    <td>{rfqItem.rfq_no}</td>
                                                    <td>{rfqItem.company_name}</td>
                                                    <td>{rfqItem.response_email}</td>
                                                    <td>{rfqItem.contact_number}</td>
                                                    <td>{rfqItem.rfq_status == 1 ? "Open" : "Closed"}</td>
                                                    <td>{rfqItem.rfq_type ? textCapitalize(rfqItem.rfq_type) : "---"}</td>
                                                    <td>{rfqItem.reverse_auction == 1 ? "Enabled" : "Disabled"}</td>
                                                    <td>{rfqItem.total_products}</td>
                                                    <td>{rfqItem.stats?.quotes_received}</td>
                                                    <td>{rfqItem.stats?.total_vendors}</td>
                                                    <td>
                                                        {rfqItem.admin_service?.status ?
                                                            rfqItem.admin_service?.status == "Working" ?
                                                                <span className="badge badge-info">Working</span>
                                                                : rfqItem.admin_service?.status == "Complete" ?
                                                                    <span className="badge badge-success">Complete</span>
                                                                    :<span className="badge badge-warning">Pending</span>
                                                            : <span className="badge badge-warning">Pending</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <Link href={`./rfq-management/${rfqItem.id}`} className="page-link " >
                                                        View
                                                    </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        )}

                        {Math.ceil(totalPages / limit) > 1 && (
                            <div className="d-flex flex-column align-items-center gap-2">
                                <ReactPaginate
                                    previousLabel={<i className="fa fa-angle-left"></i>}
                                    nextLabel={<i className="fa fa-angle-right"></i>}
                                    breakLabel="..."
                                    pageCount={Math.ceil(totalPages / limit)}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                    onPageChange={handlePageChange}
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
                                        max={Math.ceil(totalPages / limit)}
                                        onChange={(e) => {
                                            const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / limit), parseInt(e.target.value) || 1));
                                            setPage(pageNum);
                                            updateUrlParams({ 
                                                ...filterData, 
                                                page: pageNum 
                                            });
                                        }}
                                    />
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            const input = document.querySelector('input[type="number"]');
                                            const pageNum = parseInt(input.value);
                                            if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / limit)) {
                                                setPage(pageNum);
                                                updateUrlParams({ 
                                                    ...filterData, 
                                                    page: pageNum 
                                                });
                                            }
                                        }}
                                    >
                                        Go
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </section>
        </>
    )
}

export default RFQManagement
