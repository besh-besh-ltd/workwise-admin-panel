import React from "react";

interface BuyerDataItem {
  customer_id: string;
  customer_info: string;
  customer_type: string;
  subscription_plan: string;
  status: string;
  subscribed_on: string;
  next_renewal: string;
}

interface ServiceDataItem {
  customer_id: string;
  customer_info: string;
  customer_type: string;
  subscribed_service: string;
  description: string;
}

const SendNotification: React.FC = () => {
  let BuyerData: BuyerDataItem[] = [
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "0",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024"
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "1",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024"
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "0",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024"
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "1",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024"
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "0",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024"
    }
  ];
  let ServiceData: ServiceDataItem[] = [
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)"
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)"
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)"
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)"
    }
  ];

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Send Notification</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card ">
                <div className="card-body">
                  <form>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="inputEmail3" className="col-form-label">
                            Notification Type
                          </label>
                          <div>
                            <select
                              className="form-select"
                              id="inputEmail3"
                            >
                              <option>select</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="inputEmail3" className="col-form-label">
                            Notification Title
                          </label>
                          <div className="">
                            <input
                              type="text"
                              className="form-control"
                              id="inputEmail3"
                              placeholder=""
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="inputEmail3" className="col-form-label">
                            Notification Content
                          </label>
                          <div className="">
                            <textarea
                              className="form-control"
                              id="exampleFormControlTextarea1"
                              rows={3}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="inputEmail3" className="col-form-label">
                            Send to
                          </label>
                          <div className="d-flex flex-wrap">
                            <div className="form-check col-md-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios1"
                                value="option1"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="exampleRadios1"
                              >
                                Every One
                              </label>
                            </div>
                            <div className="form-check col-md-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios2"
                                value="option1"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="exampleRadios2"
                              >
                                Buyer's
                              </label>
                            </div>
                            <div className="form-check col-md-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios3"
                                value="option1"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="exampleRadios3"
                              >
                                Vendors
                              </label>
                            </div>
                            <div className="form-check col-md-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios4"
                                value="option1"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="exampleRadios4"
                              >
                                Paid Users
                              </label>
                            </div>
                            <div className="form-check col-md-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios5"
                                value="option1"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="exampleRadios5"
                              >
                                Unpaid Users
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-primary float-center">
                      Send Notification
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SendNotification;
