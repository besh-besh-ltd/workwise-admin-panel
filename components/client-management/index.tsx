import { useRouter } from "next/router";
import React, { useEffect, useState, ChangeEvent } from "react";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { handleGetClientList } from "@/utils/services/client-management";
import Select, { SingleValue, StylesConfig } from "react-select";

interface ClientItem {
  id: number;
  vendor_approve: string;
  vendor_image: string;
  status: number;
  datasheet_file_url?: string;
}

interface StatusOption {
  label: string;
  value: string;
}

interface ClientListResponse {
  total_count: number;
  data: ClientItem[];
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

const ClientManagement: React.FC = () => {
  const router = useRouter();
  const [clientList, setClientList] = useState<ClientItem[]>([]);
  const [limit, setlimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, settotalPages] = useState<number | null>(null);
  const [searchString, setSearchString] = useState<string>("");
  const [status, setStatus] = useState<StatusOption | null>(null);

  const customSelectStyles: StylesConfig<StatusOption, false> = {
    control: (base) => ({
      ...base,
      height: 27,
      minHeight: 40,
    }),
  };

  const handleStatus = (option: SingleValue<StatusOption>): void => {
    setStatus(option);
  };

  const handleClientUpdate = (item: ClientItem): void => {
    router.push(`/client-management/edit-client/${item.id}`);
  };

  const handlePageClick = (e: { selected: number }): void => {
    setPage(e.selected + 1);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchString(e.target.value);
  };

  const statusArr: StatusOption[] = [
    { label: "Not-Approved", value: "f" },
    { label: "Approved", value: "t" },
  ];

  const getClientList = (): void => {
    handleGetClientList(page, limit, searchString, status?.value)
      .then((res: ClientListResponse) => {
        settotalPages(res.total_count);
        setClientList(res.data);
      })
      .catch((error: ApiError) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
  };

  useEffect(() => {
    getClientList();
  }, [page, searchString, status]);

  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Client List</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="d-flex justify-content-end">
            <button
              type="button"
              onClick={() => router.push("/client-management/add-client")}
              className="btn btn-primary mr-2"
            >
              <i className="fa fa-plus"></i> Add Client
            </button>
          </div>
        </div>

        <div className="card card-body product-table mt-3">
          <div className="d-flex justify-content-end">
            <Select
              name="subscription_plan_id"
              options={statusArr}
              placeholder="Select status"
              isClearable={true}
              styles={customSelectStyles}
              onChange={handleStatus}
              value={status}
              className="mx-4"
            />
            <div className="row justify-content-end">
              <div className="col-m-4 mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search client"
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <table className="table table-striped table-hover mb-3">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Logo</th>
                <th scope="col">Status</th>
                {/* <th scope="col">QAP</th> */}
                <th scope="col">Datasheet</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {clientList &&
                clientList?.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td>{item?.vendor_approve}</td>
                      <td>
                        {item.vendor_image && (
                          <img
                            src={item.vendor_image}
                            alt="Logo"
                            width={180}
                            height={70}
                          />
                        )}
                      </td>
                      <td>
                        {item?.status === 1 ? "Approved" : "Not-Approved"}
                      </td>
                      {/* <td>
                        {item?.qap_file_file_url && (
                          <a href={item?.qap_file_file_url} target="_blank">
                            <i className="fa fa-file"></i>
                          </a>
                        )}
                      </td> */}
                      <td>
                        {item?.datasheet_file_url && (
                          <a href={item?.datasheet_file_url} target="_blank" rel="noreferrer">
                            <i className="fa fa-file"></i>
                          </a>
                        )}
                      </td>
                      <td className="col-md-2">
                        <span
                          className="fa fa-edit mr-3"
                          onClick={() => handleClientUpdate(item)}
                        ></span>
                      </td>
                    </tr>
                  );
                })}
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
                    if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages! / 10)) {
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
    </>
  );
};

export default ClientManagement;
