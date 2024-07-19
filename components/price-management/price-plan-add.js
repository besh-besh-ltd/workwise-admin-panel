import {
	handleAddSubscription,
	handleGetSubscriptionFeatureList,
} from "@/utils/services/price-subscription-management";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useRouter } from "next/router";

const PlanAdd = () => {
	const [featureLists, setFeatureLists] = useState([]);
	const router = useRouter();
	const getSubscriptionFeatureLists = () => {
		handleGetSubscriptionFeatureList()
			.then((res) => {
				setFeatureLists(res.data);
			})
			.catch((err) => console.log("err", err));
	};

	const initialValues = {
		name: "",
		type: "",
		price: "",
		duration: "",
		status: "1",
		feature: [{ feature_id: "", allocated_feature: "" },]
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

		const filteredFeature = values?.feature.filter(featureItem => featureItem !== undefined);
		const formData = {
			name: values.name,
			type: values.type,
			price: values.price,
			duration: values.duration,
			status: values.status,
			feature: filteredFeature,
		};

		const manipulatedFeature = formData?.feature.map(item => ({
			feature_id: item.feature_id[0],
			allocated_feature: (item.allocated_feature).toString()
		}));
		  
		const manipulatedObj = {
			...formData,
			feature: manipulatedFeature
		};

		const tempFeature = manipulatedObj?.feature?.filter(item => item.feature_id !== undefined);
		const planData = {...manipulatedObj, feature: tempFeature};

		handleAddSubscription(planData)
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
		getSubscriptionFeatureLists();
	}, []);

	return (
		<div className="container">
			<div class="d-flex justify-content-between p-4">
				<h3>Add a Plan</h3>
			</div>
			<div class="card col-12">
				<div class="card-body mt-3">
					<Formik
						enableReinitialize={true}
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={(values, { resetForm }) => {
							submitHandler(values, resetForm);
						}}
					>
						{({ errors, touched, values, handleChange, setFieldValue }) => (
							<Form>
								<div class="form-group row">
									<label for="inputEmail3" class="col-sm-2 col-form-label">
										Plan Name
									</label>
									<div class="col-sm-4">
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
								<div class="form-group row">
									<label for="inputEmail3" class="col-sm-2 col-form-label">
										Plan Type
									</label>
									<div class="col-sm-4">
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
								<div class="form-group row">
									<label for="inputEmail3" class="col-sm-2 col-form-label">
										Subscription Fees
									</label>
									<div class="col-sm-2">
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
									<label for="inputEmail3" class="col-sm-2 col-form-label">
										to be charged
									</label>
									<div class="col-sm-3">
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
									<label htmlFor="inputEmail3" className="col-sm-2 col-form-label">Featured Included</label>
									{featureLists?.map((item, index) => (
										<div className="col-sm-12" key={index}>
											<div className="form-check">
												<Field
													type="checkbox"
													name={`feature[${index}].feature_id`}
													className="form-check-input"
													value={`${item.id}`}
													onChange={(e) => {
														const { checked } = e.target;
														if (!checked) {
														  // If unchecked, reset feature_id and allocated_feature to clear the input field
														  setFieldValue(`feature[${index}].feature_id`, "");
														  setFieldValue(`feature[${index}].allocated_feature`, "");
														} else {
														  // If checked, set the feature_id to the corresponding value
														  handleChange(e);
														}
													  }}
												/>
												<label className="form-check-label">{item.title}</label>
											</div>
											<div className="col-sm-2">
												<Field
													type="number"
													name={`feature[${index}].allocated_feature`}
													className="form-control"
													placeholder="Quantity"
												/>
											</div>
										</div>
									))}
									<ErrorMessage name="feature" render={(msg) => <div className="form-error">{msg}</div>} />
								</div>
								<div className="d-flex float-right">
									<button type="submit" class="btn btn-primary justify">
										Save Plan
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

export default PlanAdd;
