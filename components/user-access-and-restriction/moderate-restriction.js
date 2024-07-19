import React from "react";

const ModerateRestriction = () => {
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            {/* <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Dashboard</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <NavLink to="#">Home</NavLink>
                                </li>
                                <li className="breadcrumb-item active">Dashboard</li>
                            </ol>
                        </div> */}
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid pb-5">
          <div class="card col-12">
            <div class="card-body mt-3 ">
              <div className="mb-4">
                <h4 className="heading-container">Create Moderator Profile</h4>
                <h6>
                  Manage Restriction of the admin module. Control who can access
                  and edit administrator privileges.
                </h6>
              </div>
              <div id="accordion">
                <div class="card">
                  <div class="card-header" id="headingOne">
                    <h5 class="mb-0">
                      <button
                        class="btn btn-link"
                        data-toggle="collapse"
                        data-target="#collapseOne"
                        aria-expanded="true"
                        aria-controls="collapseOne"
                      >
                        Moderate #1
                      </button>
                    </h5>
                  </div>

                  <div
                    id="collapseOne"
                    class="collapse show"
                    aria-labelledby="headingOne"
                    data-parent="#accordion"
                  >
                    <div class="card-body">
                      <form>
                        <div>
                          <h5 className="heading-container">
                            Create Moderator Profile
                          </h5>
                        </div>
                        <div class="form-group col-4">
                          <input
                            type="text"
                            class="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            placeholder="Enter Name"
                          />
                        </div>
                        <div class="form-group col-4">
                          <input
                            type="email"
                            class="form-control"
                            id="exampleInputPassword1"
                            placeholder="Email"
                          />
                        </div>
                        <div class="form-group col-4">
                          <input
                            type="number"
                            class="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            placeholder="Enter Mobile"
                          />
                        </div>
                        <div class="form-group col-4">
                          <input
                            type="text"
                            class="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            placeholder="Enter Role"
                          />
                        </div>
                        <div class="form-group col-4">
                          <input
                            type="password"
                            class="form-control"
                            id="exampleInputPassword1"
                            placeholder="Password"
                          />
                        </div>
                        <div>
                          <h5 className="heading-container">
                            Create Moderator Profile
                          </h5>
                        </div>
                        <div>
                          <div className="d-flex justify-content-around">
                            <div>
                              <label for="inputZip">User Management</label>
                              <input
                                class="form-check-input mt-5"
                                type="checkbox"
                                id="inputZip"
                              />
                            </div>
                            <div>
                              <label for="inputZip">Payment Management</label>
                              <input
                                class="form-check-input mt-5"
                                type="checkbox"
                                id="inputZip"
                              />
                            </div>
                            <div>
                              <label for="inputZip">Product Management</label>
                              <input
                                class="form-check-input mt-5"
                                type="checkbox"
                                id="inputZip"
                              />
                            </div>
                            <div>
                              <label for="inputZip">
                                Pricing and Subscription Management
                              </label>
                              <input
                                class="form-check-input mt-5"
                                type="checkbox"
                                id="inputZip"
                              />
                            </div>
                            <div>
                              <label for="inputZip">
                                User Access and Restriction
                              </label>
                              <input
                                class="form-check-input mt-5"
                                type="checkbox"
                                id="inputZip"
                              />
                            </div>
                            <div>
                              <label for="inputZip">
                                Communication and Notification
                              </label>
                              <input
                                class="form-check-input mt-5"
                                type="checkbox"
                                id="inputZip"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="d-flex float-right mt-5 pt-5">
                          <button type="submit" class="btn btn-primary justify">
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="headingTwo">
                    <h5 class="mb-0">
                      <button
                        class="btn btn-link collapsed"
                        data-toggle="collapse"
                        data-target="#collapseTwo"
                        aria-expanded="false"
                        aria-controls="collapseTwo"
                      >
                        Moderate #2
                      </button>
                    </h5>
                  </div>
                  <div
                    id="collapseTwo"
                    class="collapse"
                    aria-labelledby="headingTwo"
                    data-parent="#accordion"
                  >
                    <div class="card-body">
                      Anim pariatur cliche reprehenderit, enim eiusmod high life
                      accusamus terry richardson ad squid. 3 wolf moon officia
                      aute, non cupidatat skateboard dolor brunch. Food truck
                      quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon
                      tempor, sunt aliqua put a bird on it squid single-origin
                      coffee nulla assumenda shoreditch et. Nihil anim keffiyeh
                      helvetica, craft beer labore wes anderson cred nesciunt
                      sapiente ea proident. Ad vegan excepteur butcher vice
                      lomo. Leggings occaecat craft beer farm-to-table, raw
                      denim aesthetic synth nesciunt you probably haven't heard
                      of them accusamus labore sustainable VHS.
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header" id="headingThree">
                    <h5 class="mb-0">
                      <button
                        class="btn btn-link collapsed"
                        data-toggle="collapse"
                        data-target="#collapseThree"
                        aria-expanded="false"
                        aria-controls="collapseThree"
                      >
                        Moderate #3
                      </button>
                    </h5>
                  </div>
                  <div
                    id="collapseThree"
                    class="collapse"
                    aria-labelledby="headingThree"
                    data-parent="#accordion"
                  >
                    <div class="card-body">
                      Anim pariatur cliche reprehenderit, enim eiusmod high life
                      accusamus terry richardson ad squid. 3 wolf moon officia
                      aute, non cupidatat skateboard dolor brunch. Food truck
                      quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon
                      tempor, sunt aliqua put a bird on it squid single-origin
                      coffee nulla assumenda shoreditch et. Nihil anim keffiyeh
                      helvetica, craft beer labore wes anderson cred nesciunt
                      sapiente ea proident. Ad vegan excepteur butcher vice
                      lomo. Leggings occaecat craft beer farm-to-table, raw
                      denim aesthetic synth nesciunt you probably haven't heard
                      of them accusamus labore sustainable VHS.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ModerateRestriction;
