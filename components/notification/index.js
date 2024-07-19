import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { handleDeleteNotification, handleGetNotificationList } from "@/utils/services/notification";
import DeleteModal from "../modal/delete-modal";
import { toast } from "react-toastify";

const SystemNotification = () => {
  const [notificationData, setNotificationData] = useState([]);
  const [status, setStatus] = useState(1);
  const [page, setPage] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [id, setId] = useState();

  const handleClose = () => setShowModal(false);
  const handleDeleteItem = (id) => {
    setShowModal(true);
    setId(id);
  };

  const DeleteNotification = () => {
    handleDeleteNotification(id)
      .then((res) => {
        handleClose();
        toast.success(res.message);
        getNotificationList();
      })
      .catch((error) => {
        handleClose();
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
  }


  useEffect(() => {
    getNotificationList();
  }, []);

  const getNotificationList = () => {
    setNotificationData([]);
    handleGetNotificationList(10, page, status, notificationType, name)
      .then((res) => {
        console.log(res);
        // settotalPages(Math.ceil(res.total_count / limit));
        setNotificationData(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">System Notification</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-primary mr-2"
                    onClick={() => router.push("notification/add-notification")}
                  >
                    <i className="fa fa-plus mr-2"></i>Add Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5">
            <div className="col-12">
              <div className="card product-table">
                <div className="card-body">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Title</th>
                        <th scope="col">Name</th>
                        <th scope="col">Push Notification Content</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationData.map((item) => {
                        return (
                          <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>{item?.name}</td>
                            <td>{item.content}</td>
                            <td>
                              {/* <span
                                className="fa fa-eye mr-3"
                              ></span> */}
                              <span
                                className="fa fa-edit"
                                onClick={() =>
                                  router.push(
                                    `/notification/edit-notification/${item.id}`
                                  )
                                }
                              ></span>
                              <span className="fa fa-trash ml-3" onClick={() => handleDeleteItem(item?.id)}></span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <DeleteModal
        show={showModal}
        onHide={handleClose}
        data={DeleteNotification}
      />
    </>
  );
};

export default SystemNotification;
