import React from "react";

const SendNotification = () => {
  let BuyerData = [
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
  let ServiceData = [
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
            <h1 class="m-0 text-dark">Send Notification</h1>
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
                        <div class="form-group">
                          <label for="inputEmail3" class="col-form-label">
                            Notification Type
                          </label>
                          <div>
                            <select
                              class="form-select"
                              id="inputEmail3"
                              placeholder="Email"
                            >
                              <option>select</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div class="form-group">
                          <label for="inputEmail3" class="col-form-label">
                            Notification Title
                          </label>
                          <div class="">
                            <input
                              type="text"
                              class="form-control"
                              id="inputEmail3"
                              placeholder=""
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div class="form-group">
                          <label for="inputEmail3" class="col-form-label">
                            Notification Content
                          </label>
                          <div class="">
                            <textarea
                              class="form-control"
                              id="exampleFormControlTextarea1"
                              rows="3"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div class="form-group">
                          <label for="inputEmail3" class="col-form-label">
                            Send to
                          </label>
                          <div class="d-flex flex-wrap">
                            <div class="form-check col-md-4">
                              <input
                                class="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios1"
                                value="option1"
                                checked
                              />
                              <label
                                class="form-check-label"
                                for="exampleRadios1"
                              >
                                Every One
                              </label>
                            </div>
                            <div class="form-check col-md-4">
                              <input
                                class="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios2"
                                value="option1"
                                checked
                              />
                              <label
                                class="form-check-label"
                                for="exampleRadios2"
                              >
                                Buyer's
                              </label>
                            </div>
                            <div class="form-check col-md-4">
                              <input
                                class="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios3"
                                value="option1"
                                checked
                              />
                              <label
                                class="form-check-label"
                                for="exampleRadios3"
                              >
                                Vendors
                              </label>
                            </div>
                            <div class="form-check col-md-4">
                              <input
                                class="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios4"
                                value="option1"
                                checked
                              />
                              <label
                                class="form-check-label"
                                for="exampleRadios4"
                              >
                                Paid Users
                              </label>
                            </div>
                            <div class="form-check col-md-4">
                              <input
                                class="form-check-input"
                                type="radio"
                                name="exampleRadios"
                                id="exampleRadios5"
                                value="option1"
                                checked
                              />
                              <label
                                class="form-check-label"
                                for="exampleRadios5"
                              >
                                Unpaid Users
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button class="btn btn-primary float-center">
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
