import React from "react";

const CreateModerateProfile: React.FC = () => {
  return (
    <>
      <div className="content-header">
        <div className="container-fluid"></div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body mb-3">
            <form>
              <h5 className="heading-container">Create Moderator Profile</h5>

              <div className="row">
                <div className="form-group col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    placeholder="Enter Name"
                  />
                </div>
                <div className="form-group col-md-4">
                  <input
                    type="email"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Email"
                  />
                </div>
                <div className="form-group col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    placeholder="Enter Mobile"
                  />
                </div>
                <div className="form-group col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    placeholder="Enter Role"
                  />
                </div>
                <div className="form-group col-md-4">
                  <input
                    type="password"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Password"
                  />
                </div>
              </div>

              <hr />
              <h5 className="heading-container">Moderator Restriction</h5>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="User" />
                    <label htmlFor="User" className="form-check-label">
                      User Management
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="Payment"
                    />
                    <label htmlFor="Payment" className="form-check-label">
                      Payment Management
                    </label>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="Product"
                    />
                    <label htmlFor="Product" className="form-check-label">
                      Product Management
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="Pricing"
                    />
                    <label htmlFor="Pricing" className="form-check-label">
                      Pricing and Subscription Management
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="Restriction"
                    />
                    <label htmlFor="Restriction" className="form-check-label">
                      User Access and Restriction
                    </label>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="Notification"
                    />
                    <label htmlFor="Notification" className="form-check-label">
                      Communication and Notification
                    </label>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary justify">
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateModerateProfile;
