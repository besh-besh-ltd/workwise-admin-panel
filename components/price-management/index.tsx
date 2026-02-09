import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
	handleDeleteSubscription,
	handleGetSubscriptionList,
} from "@/utils/services/price-subscription-management";
import DeleteModal from "../modal/delete-modal";
import { toast } from "react-toastify";
import { capitalize } from "../shared/TitleCase";

interface FeatureItem {
	feature_name: string;
	allocated_feature: string | number;
}

interface SubscriptionItem {
	id: number;
	plan_name: string;
	plan_type: string;
	price: number;
	duration: number;
	feature: FeatureItem[];
}

interface SubscriptionDurationMap {
	[key: number]: string;
}

interface SubscriptionUserTypesMap {
	[key: string]: string;
}

const PricingManagement: React.FC = () => {
	const [subscriptionLists, setSubscriptionLists] = useState<SubscriptionItem[]>([]);
	const [selectedUserType, setSelectedUserType] = useState<string>('2');
	const [showModal, setShowModal] = useState<boolean>(false);
	const [id, setId] = useState<number | undefined>();
	const navigate = useRouter();
	const handleClose = (): void => setShowModal(false);

	const getSubscriptionLists = (): void => {
		handleGetSubscriptionList(selectedUserType)
			.then((res: { data: SubscriptionItem[] }) => {
				setSubscriptionLists(res.data);
			})
			.catch((err: unknown) => console.log("err", err));
	};

	const submitDeleteSection = (): void => {
		handleDeleteSubscription(id)
			.then((res: { message: string }) => {
				handleClose();
				toast(res.message);
				getSubscriptionLists();
			})
			.catch((error: unknown) => {
				let txt = "";
				// for (let x in error.error.response.data.errors) {
				// 	txt = error.error.response.data.errors[x];
				// }
				toast("Internal server error");
				handleClose();
			});
	};
	const handleDeleteItem = (id: number): void => {
		setShowModal(true);
		setId(id);
	};

	const handleUserTypeChange = (user_type: string): void => setSelectedUserType(user_type);

	let getSubscriptionDuration: SubscriptionDurationMap = {
		1: "Monthly",
		3: "Quarterly",
		12: "Yearly",
	};

	let subscriptionUserTypes: SubscriptionUserTypesMap = {
		2: 'Buyer',
		3: 'Vendor',
	}

	useEffect(() => {
		getSubscriptionLists();
	}, [selectedUserType]);

	return (
    <div className="container">
      <div className="card card-body product-table-body">
        <div className="d-flex justify-content-between p-4">
          <h5>Subscription Plan</h5>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate.push("/pricing-management/pricing-plan-add")
            }
          >
            Add a Plan
          </button>
        </div>
        <div className="d-flex gap-2 mb-4 ml-4">
          {Object.entries(subscriptionUserTypes).map(([user_type, label]) => (
            <button
              key={user_type}
              onClick={() => handleUserTypeChange(user_type)}
              className={`btn btn-outline-secondary btn-sm px-4 ${
                selectedUserType == user_type ? 'active' : ''
              }`}
              style={{
                padding: 8,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="d-flex col-12 flex-wrap">
          {subscriptionLists?.map((item, index) => {
            return (
              <div
                className="card mb-3 col-3 border-secondary card-price-management"
                key={index}
              >
                <div className="card-header bg-transparent border-secondary">
                  <h5>{capitalize(item.plan_name)}</h5>
                  <h3>
                    {item.plan_type == "f"
                      ? "FREE"
                      : `₹ ${item.price} / ${
                          getSubscriptionDuration[item.duration]
                        }`}
                  </h3>
                </div>
                <div className="card-body text-dark" style={{ height: "300px" }}>
                  <h5>Features Included:</h5>
                  {item?.feature?.map((itemF, indexF) => {
                    return (
                      <p className="m-0" key={indexF}>
                        {itemF.feature_name} - {itemF.allocated_feature}
                      </p>
                    );
                  })}
                </div>
                <div className="card-footer bg-transparent border-secondary">
                  <div className="actionStyle">
                    <span
                      className="fa fa-edit mr-3"
                      onClick={() =>
                        navigate.push(
                          `pricing-management/pricing-plan-edit/${item.id}`
                        )
                      }
                    ></span>
                    <span
                      className="fa fa-trash"
                      onClick={() => handleDeleteItem(item.id)}
                    ></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* <div className="card card-body product-table-body">
				<div class="d-flex justify-content-between p-4">
					<h5>Custom Pricing</h5>
					<button
						type="button"
						onClick={() =>
							navigate.push("/pricing-management/create-service-add")
						}
						class="btn btn-secondary"
					>
						Create Add-On Service
					</button>
				</div>
				<div className="row pb-5">
					<div className="col-12">
						<div className="card product-table">
							<div className="card-body">
								<table class="table table-striped table-hover">
									<thead>
										<tr>
											<th scope="col">Title</th>
											<th scope="col">Description</th>
											<th scope="col">Target User Type</th>
											<th scope="col">Price</th>
											<th scope="col">Action</th>
										</tr>
									</thead>
									<tbody>
										{ProductData.map((item) => {
											return (
												<tr key={item.name}>
													<td>{item.product}</td>
													<td>
														{item.verification_status == 1
															? "Verified"
															: "Unverified"}
													</td>
													<td>Vendor</td>
													<td>₹</td>
													<td>view</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div> */}
      <DeleteModal
        show={showModal}
        onHide={handleClose}
        data={submitDeleteSection}
      />
    </div>
  );
};

export default PricingManagement;
