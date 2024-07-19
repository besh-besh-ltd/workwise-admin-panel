import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
	handleDeleteSubscription,
	handleGetSubscriptionList,
} from "@/utils/services/price-subscription-management";
import DeleteModal from "../modal/delete-modal";
import { toast } from "react-toastify";
import { capitalize } from "../shared/TitleCase";

const PricingManagement = () => {
	const [subscriptionLists, setSubscriptionLists] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [id, setId] = useState();
	const navigate = useRouter();
	const handleClose = () => setShowModal(false);
	let ProductData = [
		{
			product: "Product A",
			status: "0",
			category: "Int",
			Vendors: "Tata",
		},
		{
			product: "Product A",
			status: "0",
			category: "Int",
			Vendors: "Tata",
		},
		{
			product: "Product A",
			status: "0",
			category: "Int",
			Vendors: "Tata",
		},
		{
			product: "Product A",
			status: "0",
			category: "Int",
			Vendors: "Tata",
		},
		{
			product: "Product A",
			status: "0",
			category: "Int",
			Vendors: "Tata",
		},
		{
			product: "Product A",
			status: "0",
			category: "Int",
			Vendors: "Tata",
		},
		{
			product: "Product A",
			status: "0",
			category: "Int",
			Vendors: "Tata",
		},
	];
	const getSubscriptionLists = () => {
		handleGetSubscriptionList()
			.then((res) => {
				setSubscriptionLists(res.data);
			})
			.catch((err) => console.log("err", err));
	};

	const submitDeleteSection = () => {
		handleDeleteSubscription(id)
			.then((res) => {
				handleClose();
				toast(res.message);
				getSubscriptionLists();
			})
			.catch((error) => {
				let txt = "";
				// for (let x in error.error.response.data.errors) {
				// 	txt = error.error.response.data.errors[x];
				// }
				toast("Internal server error");
				handleClose();
			});
	};
	const handleDeleteItem = (id) => {
		setShowModal(true);
		setId(id);
	};

	let getSubscriptionDuration = {
		1: "Monthly",
		3: "Quarterly",
		12: "Yearly",
	};

	useEffect(() => {
		getSubscriptionLists();
	}, []);
	return (
		<div className="container">
			<div className="card card-body product-table-body">
				<div class="d-flex justify-content-between p-4">
					<h5>Subscription Plan</h5>
					<button
						type="button"
						class="btn btn-secondary"
						onClick={() =>
							navigate.push("/pricing-management/pricing-plan-add")
						}
					>
						Add a Plan
					</button>
				</div>
				<div className="d-flex justify-content-center col-12">
					{subscriptionLists?.map((item, index) => {
						return (
							<div
								class="card mb-3 col-3 border-secondary card-price-management"
								key={index}
							>
								<div class="card-header bg-transparent border-secondary">
									<h5>{capitalize(item.plan_name)}</h5>
									<h3>
										{item.plan_type == "f"
											? "FREE"
											: `₹ ${item.price} / ${
													getSubscriptionDuration[item.duration]
											  }`}
									</h3>
								</div>
								<div class="card-body text-dark" style={{ height: "300px" }}>
									<h5>Features Included:</h5>
									{item?.feature?.map((itemF, indexF) => {
										return (
											<p className="m-0" key={indexF}>
												{itemF.feature_name} - {itemF.allocated_feature}
											</p>
										);
									})}
								</div>
								<div class="card-footer bg-transparent border-secondary">
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
