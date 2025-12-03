import FullLoading from '@/components/loading/FullLoading';
import { getRFQList } from '@/utils/services/rfq-management';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate';
import { Field, Form, Formik  } from 'formik';
import Select from 'react-select';
import { getClientCompanylist } from '@/utils/services/rfq-management'

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
        rfq_status: router.query.rfq_status || '',
        admin_service_status: router.query.admin_service_status || '',
        rfq_no: router.query.rfq_no || '',
        sort: router.query.sort || "DESC",
        company : router.query.company || []
    });
    const [companyList, setCompanyList] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
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

    const rfqStatusOptions = [
        { label: "Open", value: '1' },
        { label: "Closed", value: '2' }
    ];

    const adminServiceOptions = [
        { label: "Pending", value: 'Pending' },
        { label: "Working", value: 'Working' },
        { label: "Complete", value: 'Complete' }
    ];

    const sortOptions = [
        { label: "Latest to Oldest", value: "DESC" },
        { label: "Oldest to Latest", value: "ASC" }
    ];

    // Fetch company list for the dropdown
      const fetchCompanyList = async () => {
        try {
          const response = await getClientCompanylist();
          if (response.status === 1) {
            setCompanyList(response.data);
          }
        } catch (error) {
          console.error('Error fetching company list:', error);
          setCompanyList([]);
        }
      };

      useEffect(() => {
          fetchCompanyList();
        }, []);

        // Prepare react-select options format
  const companyOptions = companyList.map(c => ({
    value: c.company_name,
    label: c.company_name,
    id: c.id
  }));

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

      const resetFilters = () => {
        const emptyFilter = {
        rfq_status: '',
        admin_service_status: '',
        rfq_no: '',
        sort: "DESC",
        company : []
        };

        setFilterData(emptyFilter);
        setSelectedCompanies([]);
        setPage(1);
        updateUrlParams({ page: 1 });

        // Clear URL parameters by pushing empty query
    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true });
      }

    const submitHandler = (values) =>{
        console.log("Filter Values:", values);

        if(values.rfq_no === '' || values.rfq_no === 0) {
            values.rfq_no = '';
        }

        
        if(selectedCompanies.length > 0) {
            const companyIds = selectedCompanies.map((c) => c.id || c.value).filter(Boolean);
            values.company = companyIds;
        }

        setFilterData(values);
        setPage(1);
        updateUrlParams({ ...values, page: 1 });
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

        const { page: urlPage, rfq_status, admin_service_status, sort, rfq_no } = router.query;
        
        const newFilterData = {
            rfq_status: rfq_status || '',
            admin_service_status: admin_service_status || '',
            sort: sort || "DESC",
            rfq_no: rfq_no || ''
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
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                rfq_status: filterData.rfq_status,
                                admin_service_status: filterData.admin_service_status,
                                sort: filterData.sort,
                                rfq_no: filterData.rfq_no,
                            }}
                            // validationSchema={yup.object().shape({
                            // rfq_status: yup.string().optional(),
                            // admin_service_status: yup.string().optional(),
                            // sort: yup.string().optional(),
                            // rfq_no: yup.number().optional()
                            // })}
                            onSubmit={(values, { resetForm }) => {
                                submitHandler(values);
                            }}
                        >
                            {({ values, setFieldValue, resetForm }) => (
                                <Form>
                                    <div className="row align-items-end g-3">
                                        <div className="col-sm-3">
                                            <Field
                                                as="select"
                                                id="rfq_status"
                                                name="rfq_status"
                                                className="form-control"
                                                value={values.rfq_status}
                                            >
                                                <option value=''>RFQ Status</option>
                                                {rfqStatusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>
                                        <div className="col-sm-3">
                                            <Field
                                                as="select"
                                                id="admin_service_status"
                                                name="admin_service_status"
                                                className="form-control"
                                                value={values.admin_service_status}
                                            >
                                                <option value=''>Admin Service Status</option>
                                                {adminServiceOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>
                                        <div className="col-sm-3">
                                            <Field
                                                type="text"
                                                name="rfq_no"
                                                className="form-control"
                                                placeholder="Search by RFQ No."
                                                value={values.rfq_no}
                                            />
                                        </div>
                                        <div className="col-sm-3">
                                            <Field
                                                as="select"
                                                id="sort"
                                                name="sort"
                                                className="form-control"
                                                value={values.sort}
                                            >
                                                <option value="">Sort Order</option>
                                                {sortOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>
                                        <div className="col-sm-3">
                                            <Select
                                                isMulti
                                                name="companies"
                                                options={companyOptions}
                                                value={selectedCompanies}
                                                onChange={(selected) => setSelectedCompanies(selected || [])}
                                                placeholder="Search or select companies..."
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                />
                                        </div>
                                        <div className="col-md-3 mb-2 d-flex gap-2">
                                            <button type="submit" className="btn btn-info flex-grow-1">
                                                Search
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary flex-grow-1"
                                                onClick={() => {
                                                resetForm();
                                                resetFilters();
                                                }}
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
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
