import FullLoading from '@/components/loading/FullLoading';
import { getRFQList } from '@/utils/services/rfq-management';
import Link from 'next/link';
import { useRouter, NextRouter } from 'next/router';
import React, { useEffect, useState, ChangeEvent } from 'react'
import ReactPaginate from 'react-paginate';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { getClientCompanylist } from '@/utils/services/rfq-management'

interface FilterData {
    rfq_status: string;
    admin_service_status: string;
    rfq_no: string;
    sort: string;
    company: number[];
}

interface RFQItem {
    id: number;
    rfq_no: string;
    company_name: string;
    response_email: string;
    contact_number: string;
    rfq_status: number;
    rfq_type: string;
    reverse_auction: number;
    total_products: number;
    stats?: {
        quotes_received: number;
        total_vendors: number;
    };
    admin_service?: {
        status: string;
    };
}

interface Company {
    id: number;
    company_name: string;
}

interface CompanyOption {
    value: string;
    label: string;
    id: number;
}

interface SelectOption {
    label: string;
    value: string;
}

interface FormValues {
    rfq_status: string;
    admin_service_status: string;
    sort: string;
    rfq_no: string;
}

const initialFilterData: Omit<FilterData, 'rfq_no' | 'company'> = {
    rfq_status: '',
    admin_service_status: '',
    sort: "DESC"
};

const RFQManagement: React.FC = () => {
    const router: NextRouter = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [rfqList, setRfqList] = useState<RFQItem[] | null>(null);
    const [filterData, setFilterData] = useState<FilterData>({
        rfq_status: (router.query.rfq_status as string) || '',
        admin_service_status: (router.query.admin_service_status as string) || '',
        rfq_no: (router.query.rfq_no as string) || '',
        sort: (router.query.sort as string) || "DESC",
        company: (router.query.company as any) || []
    });
    const [companyList, setCompanyList] = useState<Company[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<CompanyOption[]>([]);
    const [page, setPage] = useState<number>(parseInt(router.query.page as string) || 1);
    const [limit, setLimit] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    const customSelectStyles: StylesConfig<CompanyOption, true> = {
        control: (base) => ({
            ...base,
            height: "30px",
            maxWidth: "300px",
            borderRadius: "6px",
            paddingLeft: "10px",
            marginRight: "15px",
        }),
    };

    const rfqStatusOptions: SelectOption[] = [
        { label: "Open", value: '1' },
        { label: "Closed", value: '2' }
    ];

    const adminServiceOptions: SelectOption[] = [
        { label: "Pending", value: 'Pending' },
        { label: "Working", value: 'Working' },
        { label: "Complete", value: 'Complete' }
    ];

    const sortOptions: SelectOption[] = [
        { label: "Latest to Oldest", value: "DESC" },
        { label: "Oldest to Latest", value: "ASC" }
    ];

    // Fetch company list for the dropdown
      const fetchCompanyList = async (): Promise<void> => {
        try {
          const response : any = await getClientCompanylist();
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
  const companyOptions: CompanyOption[] = companyList.map(c => ({
    value: c.company_name,
    label: c.company_name,
    id: c.id
  }));

    const textCapitalize = (str: string): string => {
        if (!str) return str;
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const updateUrlParams = (newParams: Record<string, unknown>): void => {
        const query : any = { ...router.query, ...newParams };
        // Remove empty/null params
        Object.keys(query).forEach(key => !query[key] && delete query[key]);
        router.push({
            pathname: router.pathname,
            query
        }, undefined, { shallow: true });
    };

      const resetFilters = (): void => {
        const emptyFilter: FilterData = {
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

    const submitHandler = (values: FormValues & { company?: number[] }): void =>{
        console.log("Filter Values:", values);

        if(values.rfq_no === '' || values.rfq_no === '0') {
            values.rfq_no = '';
        }


        if(selectedCompanies.length > 0) {
            const companyIds = selectedCompanies.map((c) => c.id || parseInt(c.value)).filter(Boolean);
            values.company = companyIds;
        }

        setFilterData(values as FilterData);
        setPage(1);
        updateUrlParams({ ...values, page: 1 });
    }

    const getAllRFQs = (): void => {
        setLoading(true);
        getRFQList({ page, limit, ...filterData })
            .then((res : any) => {
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

        const newFilterData: FilterData = {
            rfq_status: (rfq_status as string) || '',
            admin_service_status: (admin_service_status as string) || '',
            sort: (sort as string) || "DESC",
            rfq_no: (rfq_no as string) || '',
            company: []
        };

        if (urlPage) setPage(parseInt(urlPage as string));
        setFilterData(newFilterData);
    }, [router.isReady]);

    // Separate effect for data fetching
    useEffect(() => {
        if (!router.isReady) return;
        getAllRFQs();
    }, [page, filterData, router.isReady]);

    const handlePageChange = (e: { selected: number }): void => {
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
                            onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
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
                                                onChange={(selected: MultiValue<CompanyOption>) => setSelectedCompanies(selected as CompanyOption[] || [])}
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
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                                            const input = document.querySelector('input[type="number"]') as HTMLInputElement;
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
