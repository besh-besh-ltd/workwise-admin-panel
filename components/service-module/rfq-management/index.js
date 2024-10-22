import FullLoading from '@/components/loading/FullLoading';
import { getRFQList } from '@/utils/services/rfq-management';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate';
import Select from 'react-select'

const initialFilterData = {
    rfq_status: null,
    admin_service_status: null,
    sort: "DESC"
}

const RFQManagement = () => {
    const [loading, setLoading] = useState(false);
    const [rfqList, setRfqList] = useState(null);
    const [filterData, setFilterData] = useState(initialFilterData);

    const [page, setPage] = useState(1);
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
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize each word
            .join(' ');                               // Join them back with spaces
    }

    const handleFilterChange = (selectedOption, actionMeta) => {
        const name = actionMeta.name;
        const value = selectedOption ? selectedOption.value : null;

        setFilterData((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const getAllRFQs = () => {
        setLoading(true);
        getRFQList({ page, limit, ...filterData })
            .then((res) => {
                setRfqList(res.data)
                setTotalPages(res.total_items?.total || 1)
            })
            .catch((error) => {
                console.log(error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    useEffect(() => {
        getAllRFQs()
    }, [page, limit, filterData])

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
                                <Select
                                    id="rfq_status"
                                    name="rfq_status"
                                    options={[
                                        {label: "Open", value: '1'},
                                        {label: "Closed", value: '2'}
                                    ]}
                                    placeholder="Select RFQ Status"
                                    styles={customSelectStyles}
                                    isClearable={true}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-sm-3">
                                <Select
                                    id="admin_service_status"
                                    name="admin_service_status"
                                    options={[
                                        {label: "Pending", value: 'Pending'},
                                        {label: "Working", value: 'Working'},
                                        {label: "Complete", value: 'Complete'}
                                    ]}
                                    placeholder="Select Admin Status"
                                    styles={customSelectStyles}
                                    isClearable={true}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-sm-3"></div>
                            <div className="col-sm-3">
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
                                    defaultValue={{ label: "Latest to Oldest", value: "DESC" }}
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
                                                    <td>{rfqItem.stats?.quotes_received}</td>
                                                    <td>{rfqItem.stats?.total_vendors}</td>
                                                    <td>
                                                        {rfqItem.admin_service?.status ?
                                                            rfqItem.admin_service?.status == "Working" ?
                                                                <span className="badge badge-info">Working</span>
                                                                : <span className="badge badge-success">Complete</span>
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

                        {Math.ceil(totalPages / 10) > 1 && (
                            <ReactPaginate
                                breakLabel="..."
                                nextLabel={<i className="fa fa-angle-right"></i>}
                                onPageChange={(e) => setPage(e.selected + 1)}
                                pageRangeDisplayed={2}
                                pageCount={Math.ceil(totalPages / limit)}
                                previousLabel={<i className="fa fa-angle-left"></i>}
                                renderOnZeroPageCount={null}
                                className="pagination"
                            />
                        )}

                    </div>
                </div>
            </section>
        </>
    )
}

export default RFQManagement
