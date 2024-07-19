import {
	handleAddSubscription,
	handleGetSubscriptionDetail,
	handleGetSubscriptionFeatureList,
	handleUpdateSubscription,
} from "@/utils/services/price-subscription-management";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { useRouter } from "next/router";

const PlanEdit = () => {
	const [featureLists, setFeatureLists] = useState([]);
	const [subscriptionDetails, setSubscriptionDetails] = useState({
		name: "",
		type: "",
		price: "",
		duration: "",
		status: "1",
		feature: [],
	});
	const router = useRouter();
	const id = router.query.id;
	const getSubscriptionFeatureLists = () => {
		handleGetSubscriptionFeatureList()
			.then((res) => {
				setFeatureLists(res.data);
			})
			.catch((err) => console.log("err", err));
	};

	const getSubscriptionDetails = () => {
		handleGetSubscriptionDetail(id)
			.then((res) => {
				if (res.data.length > 0) {
					setSubscriptionDetails({
						name: res.data[0].plan_name,
						type: res.data[0].plan_type,
						price: res.data[0].price,
						duration: res.data[0].duration,
						status: "1",
						// feature: res.data[0].feature.map((item) => item.feature_id),
						feature: res.data[0].feature.map((item) => {
							return {feature_id: item?.feature_id, allocated_feature: item?.allocated_feature}
						}),
					});
				}
			})
			.catch((err) => console.log("err", err));
	};

	const validationSchema = yup.object().shape({
		name: yup.string().required("Name is required"),
		type: yup.string().required("Type is required"),
		price: yup.number().when("type", {
			is: (type) => type === "p",
			then: () => yup.number().required("Price is required"),
		}),
		duration: yup.number().when("type", {
			is: (type) => type === "p",
			then: () => yup.number().required("Price is required"),
		}),
		feature: yup.array().optional(""),
	});

	const submitHandler = (values, resetForm) => {
		values?.feature.forEach(obj => {
			obj.feature_id = String(obj.feature_id);
			obj.allocated_feature = String(obj.allocated_feature);
		});
		handleUpdateSubscription(values, id)
			.then((res) => {
				resetForm();
				toast(res.message);
				setTimeout(() => {
					router.push("/pricing-management");
				}, 2000);
			})
			.catch((err) => console.log("err", err));
	};

	useEffect(() => {
		// Function to update featureLists with allocated_feature values
		const updateAWithFeatures = () => {
			const featureMap = {};
			subscriptionDetails?.feature.forEach(item => {
				featureMap[item.feature_id] = item.allocated_feature;
			});

			const updatedA = featureLists.map(item => ({
				...item,
				allocated_feature: featureMap[item.id] || 0
			}));

			setFeatureLists(updatedA);
		}

		updateAWithFeatures();
	},[subscriptionDetails])

	useEffect(() => {
		getSubscriptionFeatureLists();
		if (id) {
			getSubscriptionDetails();
		}
	}, [id]);

	return (
		<div className="container">
			<div className="d-flex justify-content-between p-4">
				<h3>Edit a Plan</h3>
			</div>
			<div className="card col-12">
				<div className="card-body mt-3">
					<Formik
						enableReinitialize={true}
						initialValues={subscriptionDetails}
						validationSchema={validationSchema}
						onSubmit={(values, { resetForm }) => {
							submitHandler(values, resetForm);
						}}
					>
						{({ errors, touched, values, handleChange, setFieldValue }) => (
							<Form>
								<div className="form-group row">
									<label for="inputEmail3" className="col-sm-2 col-form-label">
										Plan Name
									</label>
									<div className="col-sm-4">
										<Field
											type="text"
											name="name"
											className="form-control"
											placeholder="Plan Name"
										/>
										<ErrorMessage
											name="name"
											render={(msg) => <div className="form-error">{msg}</div>}
										/>
									</div>
								</div>
								<div className="form-group row">
									<label for="inputEmail3" className="col-sm-2 col-form-label">
										Plan Type
									</label>
									<div className="col-sm-4">
										<Field
											as="select"
											name="type"
											className="form-select"
											placeholder="Plan Type"
										>
											<option value="" disabled>
												Select Plan Type
											</option>
											<option value="p">Paid</option>
											<option value="f">Free</option>
										</Field>
										<ErrorMessage
											name="type"
											render={(msg) => <div className="form-error">{msg}</div>}
										/>
									</div>
								</div>
								<div className="form-group row">
									<label for="inputEmail3" className="col-sm-2 col-form-label">
										Subscription Fees
									</label>
									<div className="col-sm-2">
										<Field
											type="number"
											name="price"
											className="form-control"
											placeholder="Subscription Fees"
										/>
										<ErrorMessage
											name="price"
											render={(msg) => <div className="form-error">{msg}</div>}
										/>
									</div>
									<label for="inputEmail3" className="col-sm-2 col-form-label">
										to be charged
									</label>
									<div className="col-sm-3">
										<Field
											as="select"
											name="duration"
											className="form-select"
											placeholder="Duration"
										>
											<option value="" disabled>
												Select Duration
											</option>
											<option value="1">Monthly</option>
											<option value="3">Quarterly</option>
											<option value="12">Yearly</option>
										</Field>
										<ErrorMessage
											name="duration"
											render={(msg) => <div className="form-error">{msg}</div>}
										/>
									</div>
								</div>
								<div className="form-group row">
									<label for="inputEmail3" className="col-sm-2 col-form-label">
										Featured Included
									</label>
									<FieldArray
										name="feature"
										render={(arrayHelpers) => (
											<div>
												{featureLists.map((item, index) => (
													<div className="col-sm-12" key={item.id}>
														<div className="form-check">
															<input
																name={`feature[${index}].id`}
																type="checkbox"
																value={item.id}
																className="form-check-input"
																checked={subscriptionDetails?.feature.some(feature => feature.feature_id === item.id)}
																onChange={(e) => {
																	const isChecked = e.target.checked;
																	const itemId = parseInt(e.target.value);

																	const updatedFeatures = [...subscriptionDetails.feature];

																	if (isChecked) {
																		// Check if the item already exists in subscriptionDetails.feature array
																		if (!updatedFeatures.some(feature => feature.feature_id === itemId)) {
																			// If not, add it to subscriptionDetails.feature array
																			updatedFeatures.push({ feature_id: itemId, allocated_feature: 0 }); // You can set default value here
																			setSubscriptionDetails(prev => ({
																				...prev,
																				feature: updatedFeatures
																			}));
																		}
																		// Push the item.id to formik values
																		arrayHelpers.push(itemId);
																	} else {
																		// Remove the item.id from subscriptionDetails.feature array
																		const featureIndex = updatedFeatures.findIndex(feature => feature.feature_id === itemId);
																		if (featureIndex !== -1) {
																			updatedFeatures.splice(featureIndex, 1);
																			setSubscriptionDetails(prev => ({
																				...prev,
																				feature: updatedFeatures
																			}));
																		}
																		// Remove the item.id from formik values
																		const idx = values.feature.indexOf(itemId);
																		arrayHelpers.remove(idx);
																	}
																}}
															/>
															<label className="form-check-label">
																{item.title}
															</label>
														</div>
														<div className="col-sm-2">
															<Field
																type="number"
																name={`feature[${index}].allocated_feature`}
																value={(item && item.allocated_feature) || ''}
																className="form-control"
																placeholder="Quantity"
																onChange={e => {
																	const newValue = e.target.value;
																	let updatedSubscriptionDetails = [...subscriptionDetails.feature];
																	let updatedFeatureLists = [...featureLists];

																	// Update subscriptionDetails and featureLists with the new value
																	const itemId = item.id;
																	const featureIndex = updatedSubscriptionDetails.findIndex(feature => feature.feature_id === itemId);
																	if (featureIndex !== -1) {
																		updatedSubscriptionDetails[featureIndex].allocated_feature = newValue;
																		setSubscriptionDetails(prev => ({
																			...prev,
																			feature: updatedSubscriptionDetails
																		}));
																	}

																	const listIndex = updatedFeatureLists.findIndex(feature => feature.id === itemId);
																	if (listIndex !== -1) {
																		updatedFeatureLists[listIndex].allocated_feature = newValue;
																		setFeatureLists(updatedFeatureLists);
																	}

																	// Update the corresponding item in formik values
																	const formikIndex = values.feature.findIndex(feature => feature.id === itemId);
																	if (formikIndex !== -1) {
																		arrayHelpers.replace(formikIndex, { ...values.feature[formikIndex], allocated_feature: newValue });
																	}
																}}
															/>
														</div>
													</div>
												))}
											</div>
										)}
									/>

									<ErrorMessage
										name="feature"
										render={(msg) => <div className="form-error">{msg}</div>}
									/>
								</div>
								<div className="d-flex float-right">
									<button type="submit" className="btn btn-primary justify">
										Update Plan
									</button>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
			<ToastContainer />
		</div>
	);
};

export default PlanEdit;
