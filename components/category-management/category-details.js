import React, { useEffect, useState } from "react";
import img1 from "../../public/assets/images/products.png";
import Image from "next/image";
import { useRouter } from "next/router";
import { getCategoriesDetails } from "@/utils/services/product-management";
const CategoryDetails = () => {
  const [catData, setCatData] = useState("");
  const router = useRouter();
  let id = router.query.id;
  useEffect(() => {
    if (id != null) {
      handleDetails();
    }
  }, [id]);
  const handleDetails = () => {
    getCategoriesDetails(id)
      .then((res) => {
        setCatData(res.data[0]);
      })
      .catch((err) => console.log("err", err));
  };
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
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Category </h5>
              <li className="breadcrumb-item active"> / Category Details</li>
            </ol>
            {/* <ol className="breadcrumb float-sm-right">
              <li className="mr-4 ">
                <button type="button" class="btn btn-info">
                  EDIT
                </button>
              </li>
              <li className="mr-4">
                <button type="button" class="btn btn-warning">
                  DISABLE PROFILE
                </button>
              </li>
              <li className="mr-4">
                <button type="button" class="btn btn-danger">
                  DELETE PROFILE
                </button>
              </li>
            </ol> */}
          </div>
          <div class="card col-12">
            <div class="card-header">
              <strong>Category Details</strong>
            </div>
            <div class="card-body">
              <div className="d-flex">
                {/* <div class="text-center mr-5">
                  <Image src={img1} class="rounded" alt="..." />
                </div> */}
                <div>
                  <p>
                    <strong>Title-</strong> {catData?.title}
                  </p>
                  <p>
                    <strong>Slug-</strong> {catData?.slug}
                  </p>
                  <p>
                    <strong>Updated At-</strong>{" "}
                    {catData?.updatedAt?.split(" ")[0]}
                  </p>
                  <p>
                    <strong>Status-</strong>{" "}
                    {catData?.staus != 0 ? "Active" : "Inactive"}
                  </p>
                  <p>
                    <strong>Is Deleted-</strong>{" "}
                    {catData?.is_deleted == 1 ? "Deleted" : "Not Deleted"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="card col-12">
            <div className="card-header">SPOC Details</div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">Cras justo odio</li>
              <li className="list-group-item">Dapibus ac facilisis in</li>
              <li className="list-group-item">Vestibulum at eros</li>
            </ul>
          </div>
          <div className="d-flex">
            <div className="card col-7 mr-5">
              <div className="card-header">Profile Information</div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Cras justo odio</li>
                <li className="list-group-item">Dapibus ac facilisis in</li>
                <li className="list-group-item">Vestibulum at eros</li>
              </ul>
            </div>
            <div className="card col-4 ml-4">
              <div className="card-header">Notification</div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex">
                  <p className="col-8">Cras justo odio</p>
                  <button type="button" class="btn btn-secondary col-4">
                    Enabled
                  </button>
                </li>
                <li className="list-group-item d-flex">
                  <p className="col-8">Cras justo odio</p>
                  <button type="button" class="btn btn-secondary col-4">
                    Disabled
                  </button>
                </li>
                <li className="list-group-item d-flex">
                  <p className="col-8">Cras justo odio</p>
                  <button type="button" class="btn btn-secondary col-4">
                    Enabled
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <h5 className="heading-p mt-4">Subscription Information</h5>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card product-table">
                <div className="card-body">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Customer Id</th>
                        <th scope="col">Subscription Info</th>
                        <th scope="col">status</th>
                        <th scope="col">Subscription on</th>
                        <th scope="col">next renual</th>
                        <th scope="col">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>xxx</td>
                        <td>Gold</td>
                        <td>Active</td>
                        <td>24Aug2023</td>
                        <td>02sep2024</td>
                        <td>invoice</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h5 className="heading-p mt-4">
              Custom Premimum Services Subscribed
            </h5>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card product-table">
                <div className="card-body">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Customer Id</th>
                        <th scope="col">Subscription Service</th>
                        <th scope="col">Description</th>
                        <th scope="col">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>xxx</td>
                        <td>Banner Ad-Homepage</td>
                        <td>display Banner ad(__px x_px) on Homepage</td>
                        <td>invoice</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h5 className="heading-p mt-4">
              Custom Premimum Services Subscribed
            </h5>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card product-table">
                <div className="card-body">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th scope="col">RFQ ID</th>
                        <th scope="col">Location Posted</th>
                        <th scope="col">Product(s)</th>
                        <th scope="col">Publised Date</th>
                        <th scope="col">End Date</th>
                        <th scope="col">Detaild Requirements</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>##</td>
                        <td>Kolkata, West B...</td>
                        <td>Pipes;Valves</td>
                        <td>DD/MM/YY</td>
                        <td>DD/MM/YY</td>
                        <td>...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <button type="button" class="btn btn-secondary float-right mb-4">
                View All
              </button>
            </div>
          </div> */}
        </div>
      </section>
    </>
  );
};

export default CategoryDetails;
