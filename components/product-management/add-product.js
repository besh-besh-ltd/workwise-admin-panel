import React, { useEffect, useState } from "react";
import Link from "next/link";
import FormikField from "@/components/shared/FormikField";
import {
	categoryList,
} from "@/utils/services/rfq";
import { addProducts } from "@/utils/services/products";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import { useRouter } from "next/router";


const AddProduct = () => {
	const [catloading, setcatloading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [selectedValues, setSelectedValues] = useState([]);
	const [groupedCategories, setgroupedCategories] = useState(new Map());

	const [mainLoading, setMainLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		getCategories();
	}, []);

	const initialValues = {
		name: "",
		description: "",
		// manufacturer: "",
		// availability: "",
		categories: [],
		status: 1,
		approved_id: "",
		approved_name: "",
		variations: [{ attribute: "", attributeValue: "" }],
		vendor: "",
		is_featured: "",
		product_type: "single",
		package_items: [{ name: "" }],
	};

	const customSelectStyles = {
		control: (base) => ({
			...base,
			height: 50,
			minHeight: 50,
		}),
	};

	const getCategories = async () => {
		try {
			setcatloading(true);
			const res = await categoryList();
			const groupedData = res.data.reduce((acc, item) => {
				const parentId = parseInt(item.parent_id) || 0;
				if (!acc[parentId]) {
					acc[parentId] = [];
				}
				acc[parentId].push({ value: item?.id, label: item?.title });
				return acc;
			}, []);

			const catMap = new Map(
				Object.entries(groupedData).map(([key, value]) => [parseInt(key), value])
			);
			setCategories([catMap.get(0)]);
			setgroupedCategories(catMap);
		} catch (error) {
			console.error("Failed to fetch categories:", error);
		} finally {
			setcatloading(false);
		}
	};

	const hideChildLevels = (level) => {
		const updatedCategories = categories.slice(0, level);
		const updatedSelectedValues = selectedValues.slice(0, level);

		setCategories(updatedCategories);
		setSelectedValues(updatedSelectedValues);
	};

	const getChildCategories = (id, level) => {
		const childItems = groupedCategories.get(id);

		if (childItems && childItems.length > 0) {
			const updatedCategories = [...categories];
			updatedCategories[level] = childItems;
			setCategories(updatedCategories.slice(0, level + 1));
		} else {
			setCategories(categories.slice(0, level));
		}
	};

	const submitHandler = (values) => {
		let payload = {
			...values,
			status: 1,
			categories: selectedValues
				.filter(cat => cat != null)
				.map(cat => cat.value),
		}

		setMainLoading(true);
		addProducts(payload)
			.then((res) => {
				toast.success(res.message);
				setTimeout(() => {
					router.push("/product-management");
				}, 1000);
			})
			.catch((error) => {
				console.error(error);
				toast.error(error.message);
			});

			setMainLoading(false);
	};

	return (
		<>
			<div className="content-header">
				<div className="container-fluid">
					<div className="row mb-2">
						<h1 className="m-0 text-dark">Add Product</h1>
					</div>
				</div>
			</div>

			<section className="content p-2">
				<div className="container-fluid">
					<div className="text-left pb-4">
						<Link className="btn btn-primary" href="/product-management">
							<span className="fa fa-angle-left mr-2"></span>Go Back
						</Link>
					</div>
					<div class="card col-12">
						<div class="card-body mt-3">
							<div className="container-fluid">
								<div className="row">
									<div className="col-md-12">
										<div className="add-prod-con">
											<Formik
												enableReinitialize={true}
												initialValues={initialValues}
												validationSchema={yup.object().shape({
													name: yup.string().required("Name is required"),
													description: yup.string(),
													// .required("Description is required"),
													// manufacturer: yup
													//   .string()
													//   .required("Manufacturer is required"),
													// availability: yup.string(),
													// .required("Availability is required"),
													approved_id: yup.array(),
													// .required("Approved Vendor is required"),
													// vendor: yup.string().required("Vendor is required"),
													// is_featured: yup
													// 	.string()
													// 	.required("Vendor is required"),
													// featured: yup
													//   .string()
													//   .required("Featured is required"),
												})}
												onSubmit={(values, { resetForm }) => {
													submitHandler(values);
												}}
											>
												{({
													errors,
													touched,
													values,
													handleChange,
													setFieldValue,
												}) => (
													<Form>
														<div className="row add-product">
															<div className="col-md-12">
																<div className="form-group">
																	<FormikField
																		label="Product Name"
																		isRequired={true}
																		name="name"
																		touched={touched}
																		errors={errors}
																	/>
																</div>
															</div>

															{!catloading && categories?.length > 0 &&
																<>
																	<div className="form-group mb-0">
																		<label htmlFor="categories">Categories *</label>
																		{touched.categories && errors.categories && (
																			<div className="text-danger">{errors.categories}</div>
																		)}
																	</div>
										{categories.map((options, index) => (
																		<div className="col-md-3" key={`cat_level_${index}`}>
																			<div className="form-group">
																				<Select
																					id={`category_level_${index}`}
																					options={options}
																					placeholder={`Select ${index == 0 ? 'Category' : 'Sub-category'}`}
																					isClearable={index !== 0}
																					value={selectedValues[index] || null}
																					styles={customSelectStyles}
																					onChange={(selectedOption) => {
																						const updatedSelectedValues = [...selectedValues];
																						updatedSelectedValues[index] = selectedOption || null;

																						const truncatedValues = updatedSelectedValues.slice(0, index + 1);
																						setSelectedValues(truncatedValues);

																						if (selectedOption) {
																							getChildCategories(selectedOption.value, index + 1);
																						} else {
																							hideChildLevels(index);
																						}
																					}}
																				/>
																			</div>
																		</div>
																	))}

										{/* Product Type (beside categories) */}
										<div className="col-md-2">
											<div className="form-group">
												<label>Product Type</label>
												<select
													name="product_type"
													className="form-control"
													value={values.product_type}
													onChange={(e) => {
														handleChange(e);
														if (e.target.value === "single") {
															setFieldValue("package_items", [{ name: "" }]);
														}
													}}
												>
													<option value="single">Single</option>
													<option value="package">Package</option>
												</select>
											</div>
										</div>
																</>
									}

									{/* Product Type moved beside categories above */}

									{/* Package Items (visible when type is package) */}
									{values.product_type === "package" && (
										<div className="col-md-12 mt-3">
											<label>Package Items</label>
											{values.package_items.map((item, idx) => (
												<div className="row mb-2" key={`pkg_item_${idx}`}>
													<div className="col-md-10">
														<input
															type="text"
															name={`package_items[${idx}].name`}
															value={item.name}
															onChange={handleChange}
															className="form-control"
															placeholder="Enter item name"
														/>
													</div>
													<div className="col-md-2">
														<button
															type="button"
															className="btn btn-danger"
															onClick={() => {
															const updated = [...values.package_items];
															updated.splice(idx, 1);
															setFieldValue("package_items", updated);
														}}
														disabled={values.package_items.length === 1}
													>
														Remove
														</button>
													</div>
											</div>
											))}

											<div className="text-right">
												<button
													type="button"
													className="btn btn-success"
													onClick={() => {
														const updated = [...values.package_items, { name: "" }];
														setFieldValue("package_items", updated);
													}}
												>
													Add Item
												</button>
											</div>
										</div>
									)}

									<div className="col-md-12">
										<div className="form-group">
											<FormikField
												label="Product Description"
												type="textarea"
												isRequired={false}
												name="description"
												touched={touched}
												errors={errors}
												className="text-editor-area"
												cols="30"
												rows="10"
											/>
										</div>
									</div>

															{/* <div className="col-md-8">
																<div className="form-group">
																	<FormikField
																		label="Manufacturer"
																		isRequired={true}
																		name="manufacturer"
																		touched={touched}
																		errors={errors}
																	/>
																</div>
															</div> */}

															{/* <div className="col-md-4">
																<div className="form-group">
																	<FormikField
																		label="Availability"
																		type="select"
																		selectOptions={[
																			{
																				label: "Select Availability",
																				value: "",
																			},
																			{ label: "Unavailable", value: 0 },
																			{ label: "Available", value: 1 },
																		]}
																		isRequired={false}
																		name="availability"
																		touched={touched}
																		errors={errors}
																	/>
																</div>
															</div> */}

															<div className="col-md-4">
																{/* <div className="form-group">
                                  <FormikField
                                    label="Approved Vendor"
                                    type="select"
                                    selectOptions={vendorApprovedList}
                                    isRequired={true}
                                    name="approved_id"
                                    touched={touched}
                                    errors={errors}
                                  />
                                </div> */}
																{/* <div className="form-group">
																	<label htmlFor="approved_id">
																		Approved Vendor
																	</label>
																	<Select
																		isMulti
																		name={"approved_id"}
																		options={vendorApprovedList}
																		placeholder="Select Vendor list"
																		isClearable={true}
																		styles={customSelectStyles}
																		onChange={(options) => {
																			setFieldValue(
																				"approved_id",
																				options.map((option) => option.value)
																			);
																		}}
																	/>
																	<ErrorMessage
																		name={"approved_id"}
																		component="div"
																		className="form-error"
																	/>
																</div> */}
															</div>

															{/* {values.approved_id == "o" && (
																<div className="col-md-8">
																	<div className="form-group">
																		<FormikField
																			label="Approved name"
																			isRequired={true}
																			name="approved_name"
																			touched={touched}
																			errors={errors}
																		/>
																	</div>
																</div>
															)} */}

															{/* REMOVED AFTER PRODUCT -> VARIANT MAPPING */}

															{/* <div className="prod-spec-sec p-0">
																<div className="col-md-12">
																	<div className="specification ">
																		<FieldArray name="variations">
																			{({ push, remove }) => (
																				<>
																					{values.variations.map(
																						(field, index) => (
																							<div key={index} className="row">
																								<div className="col-md-3">
																									<div className="form-group">
																										<Field
																											name={`variations.${index}.attribute`}
																											type="text"
																											placeholder="Attribute"
																										/>
																										<div className="form-error">
																											<ErrorMessage
																												name={`variations.${index}.attribute`}
																												className="form-error"
																											/>
																										</div>
																									</div>
																								</div>

																								<div className="col-md-3">
																									<div className="form-group">
																										<Field
																											name={`variations.${index}.attributeValue`}
																											type="text"
																											placeholder="Attribute Value"
																										/>
																										<div className="form-error">
																											<ErrorMessage
																												name={`variations.${index}.attributeValue`}
																												className="form-error"
																											/>
																										</div>
																									</div>
																								</div>

																								{values.variations.length >
																									1 && (
																										<div className="col-md-3">
																											<div className="form-group">
																												<Link
																													href="/"
																													onClick={(event) => {
																														event.preventDefault();
																														remove(index);
																													}}
																													className="btn btn-primary"
																												>
																													Remove
																												</Link>
																											</div>
																										</div>
																									)}
																							</div>
																						)
																					)}
																					<button
																						type="button"
																						className="btn btn-primary"
																						onClick={() =>
																							push({
																								attribute: "",
																								attributeValue: "",
																							})
																						}
																					>
																						Add Field
																					</button>
																				</>
																			)}
																		</FieldArray>
																	</div>
																	<div className="d-flex gap-4 mt-2">
																		<div className="form-group">
																			<FormikField
																				label="Is Featured"
																				type="select"
																				selectOptions={isFeaturesArray}
																				isRequired={true}
																				name="is_featured"
																				touched={touched}
																				errors={errors}
																			/>
																		</div>
																	</div>
																</div>
															</div> */}
														</div>

														<button
															type="submit"
															className="page-link btn btn-secondary"
															disabled={mainLoading}
														>

                            <button
                              type="submit"
                              className="page-link btn btn-secondary"
                              disabled={mainLoading}
                            >
                              {mainLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Saving...
                                </>
                              ) : (
                                "Save"
                              )}
                            </button>
														</button>
													</Form>
												)}
											</Formik>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<ToastContainer />
			</section>
		</>
	);
};

export default AddProduct;
