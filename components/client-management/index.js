import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { ToastContainer, toast } from "react-toastify";
import { handleGetClientList } from "@/utils/services/client-management";
import Select from "react-select";

const ClientManagement = () => {
  const router = useRouter();
  const [clientList, setClientList] = useState([]);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [status, setStatus] = useState("");

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      height: 27,
      minHeight: 40,
    }),
  };

  const handleStatus = (option) => {
    setStatus(option);
  };

  const handleClientUpdate = (item) => {
    router.push(`/client-management/edit-client/${item.id}`);
  };
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  const handleSearch = (e) => {
    setSearchString(e.target.value);
  };

  const statusArr = [
    { label: "Not-Approved", value: "f" },
    { label: "Approved", value: "t" },
  ];

  const getClientList = () => {
    handleGetClientList(page, limit, searchString, status?.value)
      .then((res) => {
        settotalPages(res.total_count);
        setClientList(res.data);
      })
      .catch((error) => {
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
                            priority={true}
                          />
                        )}
                      </td>
                      <td>
                        {item?.status === 1 ? "Approved" : "Not-Approved"}
                      </td>
                      {/* <td>
                        {item?.qap_file_file_url && (
                          <a href={item?.qap_file_file_url} target="_blank">
                            <i class="fa fa-file"></i>
                          </a>
                        )}
                      </td> */}
                      <td>
                        {item?.datasheet_file_url && (
                          <a href={item?.datasheet_file_url} target="_blank">
                            <i class="fa fa-file"></i>
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
    </>
  );
};

export default ClientManagement;
