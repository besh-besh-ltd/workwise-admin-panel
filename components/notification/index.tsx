import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { handleDeleteNotification, handleGetNotificationList } from "@/utils/services/notification";
import DeleteModal from "../modal/delete-modal";
import { toast } from "react-toastify";

interface NotificationItem {
  id: number;
  title: string;
  name?: string;
  content: string;
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

const SystemNotification: React.FC = () => {
  const [notificationData, setNotificationData] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<number>(1);
  const [page, setPage] = useState<string>("");
  const [notificationType, setNotificationType] = useState<string>("");
  const [name, setName] = useState<string>("");
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [id, setId] = useState<number | undefined>();

  const handleClose = (): void => setShowModal(false);
  const handleDeleteItem = (itemId: number): void => {
    setShowModal(true);
    setId(itemId);
  };

  const DeleteNotification = (): void => {
    handleDeleteNotification(id)
      .then((res: { message: string }) => {
        handleClose();
        toast.success(res.message);
        getNotificationList();
      })
      .catch((error: ApiError) => {
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

  const getNotificationList = (): void => {
    setNotificationData([]);
    handleGetNotificationList(10, Number(page), status, notificationType, name)
      .then((res: { data: NotificationItem[] }) => {
        console.log(res);
        // settotalPages(Math.ceil(res.total_count / limit));
        setNotificationData(res.data);
      })
      .catch((err: unknown) => console.log("err", err));
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
                    className="btn btn-primary mr-2"
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
