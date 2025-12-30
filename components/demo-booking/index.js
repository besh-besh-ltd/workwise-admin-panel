import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { getDemoBookingList, updateDemoBookingComment} from "@/utils/services/demo-booking";
import { Badge } from "react-bootstrap";
import { toast } from "react-toastify";

const DemoBook = () => {
  const [contactData, setContactData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editRow, setEditRow] = useState(null); // which row is editing
  const [tempComment, setTempComment] = useState(""); // temporary comment
  const [isRemoving, setIsRemoving] = useState(false);

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
              comment: item.comment
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

  const startAddComment = (item) => {
  setEditRow(item.id);
  setTempComment(item.comment || "");
};

const cancelEdit = () => {
  setEditRow(null);
  setTempComment("");
};

const saveComment = (item, remove = false) => {
  if (remove) {
    // Remove comment
    item.comment = null;
    setEditRow(null);
    setTempComment("");
    setIsRemoving(false);
  }
  
updateDemoBookingComment(item.id, tempComment.trim())
  .then((res) => {
    toast.success("Comment updated successfully");
  })
  .catch((err) => {
    toast.error("Error updating comment");
  });
  // Save normal comment
  item.comment = tempComment.trim();
  setEditRow(null);
  setTempComment("");
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
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {contactData.length > 0 ? (
            contactData.map((item , index) => (
              <tr key={item.id}>
                <th>{index+1}</th>
                <td>{item.mobile}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td className="d-flex justify-content-between align-items-center gap-2">
                {editRow === item.id ? (
                  // CASE 2: Editing
                  <>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add comment here"
                      value={tempComment}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        setTempComment(e.target.value);
                        setIsRemoving(value === "--");
                      }}
                    />
                    {isRemoving ? (
                      <Badge  bg="success" onClick={() => saveComment(item, true)}>Save</Badge>
                    ) : tempComment.trim() === "" ? (
                      <Badge bg="danger" onClick={cancelEdit}>Cancel</Badge>
                    ) : (
                      <Badge bg="success" onClick={() => saveComment(item, false)}>Save</Badge>
                    )}
                  </>
                ) : item.comment ? (
                  // CASE 3: Has comment
                  <>
                    <span>{item.comment}</span>
                    <Badge bg="secondary" onClick={() => startAddComment(item)}>Edit</Badge>
                  </>
                ) : (
                  // CASE 1: No comment
                  <>
                    <span>--</span>
                    <Badge onClick={() => startAddComment(item)}>Add Comment</Badge>
                  </>
                )}
              </td>
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
        <>
          <ReactPaginate
            breakLabel="..."
            nextLabel={<i className="fa fa-angle-right"></i>}
            previousLabel={<i className="fa fa-angle-left"></i>}
            onPageChange={handlePageClick}
            pageCount={totalPages}
            pageRangeDisplayed={5}
            marginPagesDisplayed={2}
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
              max={totalPages}
              onChange={(e) => {
                const pageNum = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1));
                setPage(pageNum);
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const input = document.querySelector('input[type="number"]');
                const pageNum = parseInt(input.value);
                if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
                  setPage(pageNum);
                }
              }}
            >
              Go
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DemoBook;
