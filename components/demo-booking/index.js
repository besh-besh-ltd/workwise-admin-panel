import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { getDemoBookingList } from "@/utils/services/demo-booking";

const DemoBook = () => {
  const [contactData, setContactData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const getBookDemoDetails = () => {
    setContactData([]); // Reset data before fetching
    getDemoBookingList(page, limit)
      .then((res) => {
        if (res?.data) {
          setTotalPages(Math.ceil(res.count / limit)); // Properly calculate pages
          setContactData(
            res.data.map((item) => ({
              id: item.id,
              mobile: item.mobile.trim(), // Trim spaces from mobile number
              createdAt: item.created_at,
            }))
          );
        }
      })
      .catch((err) => {
        console.log("Error fetching data:", err);
      });
  };

  useEffect(() => {
    getBookDemoDetails();
  }, [page, limit]);

  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  return (
    <div className="container mt-4">
      <h2>Demo Bookings</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>S No.</th>
            <th>Mobile</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {contactData.length > 0 ? (
            contactData.map((item , index) => (
              <tr key={item.id}>
                <th>{index+1}</th>
                <td>{item.mobile}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <ReactPaginate
          breakLabel="..."
          nextLabel={<i className="fa fa-angle-right"></i>}
          onPageChange={handlePageClick}
          pageRangeDisplayed={2}
          pageCount={totalPages}
          previousLabel={<i className="fa fa-angle-left"></i>}
          renderOnZeroPageCount={null}
          className="pagination"
        />
      )}
    </div>
  );
};

export default DemoBook;
