import React, { useEffect, useState } from "react";
import Link from "next/link";
import FormikField from "@/components/shared/FormikField";
import {
	categoryList,
	vendorApproveList,
} from "@/utils/services/rfq";
import {
	getProducts,
	handleUpdateProduct,
} from "@/utils/services/products";
import * as yup from "yup";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import { useRouter } from "next/router";

// Changes by Agnij May 02, 2025 [Cleaned up edit product page]
const EditProduct = () => {
	const [catloading, setcatloading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [selectedValues, setSelectedValues] = useState([]);
	const [groupedCategories, setgroupedCategories] = useState(new Map());
	const [categoryData, setCategoryData] = useState([]);
	const [vendorApprovedList, setVendorApprovedList] = useState([]);
	const [mainLoading, setMainLoading] = useState(false);
	const [productDetailsData, setProductDetailsData] = useState([]);
	const [variantData, setVariantData] = useState("");
	const [isEditable, setIsEditable] = useState(true);
	const [vendorApprovalChanged, setVendorApprovalChanged] = useState(false);
	const router = useRouter();
	const { id } = router.query;

	useEffect(() => {
		if (id) {
			getCategories();
			getVendorApproveList();
			getProductDetails();
		}
	}, [id]);

	useEffect(() => {
		if (categoryData.length > 0 && groupedCategories) {
			const updatedSelectedValues = categoryData.map((item) => item || null);
			setSelectedValues(updatedSelectedValues);

			const initializedCategories = [];

			updatedSelectedValues.forEach((selectedOption, index) => {
				const parentId = index === 0 ? 0 : updatedSelectedValues[index - 1]?.value;
				const currentOptions = groupedCategories.get(parentId) || [];

				if (currentOptions.length > 0)
					initializedCategories[index] = currentOptions;
			});
			setCategories(initializedCategories);
		}
	}, [categoryData, groupedCategories]);

	const customSelectStyles = {
		control: (base) => ({
			...base,
			height: 50,
			minHeight: 50
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

	const getVendorApproveList = () => {
		vendorApproveList().then((res) => {
			let lists = res.data.map((s) => ({
				label: s.vendor_approve,
				value: s.id,
			}));
			setVendorApprovedList(lists);
		});
	};

	const getProductDetails = async () => {
		try {
			const response = await getProducts(id);
			const { data } = response;
			
			// Set editability based on conditions
			const isEditableProduct = (data.added_by === 1 || data.added_by === 111) && !data.vendor;
			setIsEditable(isEditableProduct);

			setProductDetailsData(data);

			const category = data.product_categories?.map((item) => ({
				label: item.category_name,
				value: item.id,
			})) || [];
			setCategoryData(category);

			const variant = data.product_variants.map(({ variant_name, variant_value }) => ({
				attribute: variant_name,
				attributeValue: variant_value,
			})) || [];
			setVariantData(variant);
		} catch (error) {
			console.error("Failed to fetch product details:", error);
		} finally {
			setcatloading(false);
		}
	};

	const initialValues = {
		name: productDetailsData?.name || "",
		categories: productDetailsData?.product_categories
			? [productDetailsData.product_categories]
			: [],
		approved_id: productDetailsData?.vendor_approved_by && Array.isArray(productDetailsData.vendor_approved_by) && productDetailsData.vendor_approved_by.length > 0
			? productDetailsData.vendor_approved_by.map(vendor => vendor.id) 
			: [],
		variations: variantData.length
			? [...variantData]
			: [{ attribute: "", attributeValue: "" }],
	};

	const submitHandler = (values) => {
		const formData = new FormData();

		try {
			// For non-editable products, only update vendor approvals while preserving other fields
			if (!isEditable) {
				// Include required fields from existing data
				formData.append('name', productDetailsData.name);
				formData.append('status', '1');
				
				// Handle categories array
				const existingCategories = productDetailsData.product_categories?.map(cat => cat.id) || [];
				existingCategories.forEach((categoryId) => {
					formData.append('categories[]', categoryId.toString());
				});

				// Handle approved_id array
				const approvedIds = values.approved_id || [];
				if (approvedIds.length > 0) {
					formData.append('approved_id', approvedIds.join(','));
				} else {
					formData.append('approved_id', '');
				}

				// Include product variants
				if (productDetailsData.product_variants && productDetailsData.product_variants.length > 0) {
					productDetailsData.product_variants.forEach((variant, index) => {
						formData.append(`variations[${index}][attribute]`, variant.variant_name || '');
						formData.append(`variations[${index}][attributeValue]`, variant.variant_value || '');
					});
				} else {
					formData.append('variations[0][attribute]', '');
					formData.append('variations[0][attributeValue]', '');
				}
			} else {
				// For editable products, send all values
				formData.append('name', values.name);
				formData.append('status', '1');

				// Handle categories array
				const categories = selectedValues
					.filter(cat => cat != null)
					.map(cat => cat.value);
				
				if (categories.length === 0) {
					throw new Error('At least one category is required');
				}

				categories.forEach((categoryId) => {
					formData.append('categories[]', categoryId.toString());
				});

				// Handle approved_id array
				const approvedIds = values.approved_id || [];
				if (approvedIds.length > 0) {
					formData.append('approved_id', approvedIds.join(','));
				} else {
					formData.append('approved_id', '');
				}

				// Handle variations array
				if (values.variations && values.variations.length > 0) {
					const filteredVariations = values.variations.filter(
						v => v.attribute.trim() !== '' || v.attributeValue.trim() !== ''
					);
					
					filteredVariations.forEach((variation, index) => {
						formData.append(`variations[${index}][attribute]`, variation.attribute || '');
						formData.append(`variations[${index}][attributeValue]`, variation.attributeValue || '');
					});
				} else {
					formData.append('variations[0][attribute]', '');
					formData.append('variations[0][attributeValue]', '');
				}
			}

			setMainLoading(true);
			handleUpdateProduct(formData, id)
				.then((res) => {
					toast.success(res.message);
					getProducts(id).then(response => {
						const { data } = response;
						setProductDetailsData(data);
						setMainLoading(false);
						setVendorApprovalChanged(false);
						toast.info("Product updated successfully. You can continue editing or go back to the product list.");
					}).catch(error => {
						console.error("Failed to refresh product details:", error);
						setMainLoading(false);
					});
				})
				.catch((error) => {
					console.error('Error updating product:', error);
					const errorMessage = error.response?.data?.message || 
						error.response?.data?.error || 
						error.message ||
						"Failed to update product. Please try again.";
					
					toast.error(errorMessage);
					setMainLoading(false);
				});
		} catch (error) {
			console.error('Error preparing form data:', error);
			toast.error(error.message || 'Error preparing form data');
			setMainLoading(false);
		}
	};

	return (
		<>
			<div className="content-header">
				<div className="container-fluid">
					<div className="row mb-2">
						<h1 className="m-0 text-dark">Edit Product</h1>
					</div>
				</div>
			</div>

			<section className="content">
				<div className="container-fluid">
					<div className="text-left pb-4">
						<Link className="btn btn-primary" href="/product-management">
							<span className="fa fa-angle-left mr-2"></span>Go Back
						</Link>
					</div>

					{!isEditable && (
						<div className="alert alert-warning" role="alert" style={{
							backgroundColor: "#fff3cd",
							color: "#856404",
							border: "1px solid #ffeeba",
							borderRadius: "4px",
							padding: "15px",
							marginBottom: "20px",
							fontSize: "16px"
						}}>
							<i className="fas fa-exclamation-triangle mr-2"></i>
							This product cannot be edited as it is either mapped to a vendor or was not created by an admin. 
							You can only modify the vendor approvals.
						</div>
					)}

					<div className="card col-12">
						<div className="card-body mt-3">
							<div className="container-fluid">
								<div className="row">
									<div className="col-md-12">
										<div className="add-prod-con">
											<Formik
												enableReinitialize={true}
												initialValues={initialValues}
												validationSchema={yup.object().shape({
													name: yup.string().required("Name is required"),
													approved_id: !isEditable ? yup.array().min(1, "At least one approved vendor is required") : yup.array(),
												})}
												onSubmit={(values, { resetForm }) => {
													if (!isEditable) {
														if (!vendorApprovalChanged) {
															toast.info("No changes made to vendor approvals");
															return;
														}
														
														const originalApprovals = productDetailsData?.vendor_approved_by?.map(vendor => vendor.id) || [];
														const currentApprovals = values.approved_id || [];
														
														const hasChanges = 
															originalApprovals.length !== currentApprovals.length || 
															originalApprovals.some(id => !currentApprovals.includes(id)) ||
															currentApprovals.some(id => !originalApprovals.includes(id));
														
														if (!hasChanges) {
															toast.info("No changes detected in vendor approvals");
															return;
														}
														
														submitHandler({
															approved_id: values.approved_id
														});
														return;
													}
													
													submitHandler(values);
												}}
											>
												{({
													errors,
													touched,
													values,
													handleChange,
													setFieldValue,
												}) => {
													useEffect(() => {
														if (productDetailsData?.vendor_approved_by) {
															let approvedIds = [];
															
															if (Array.isArray(productDetailsData.vendor_approved_by)) {
																approvedIds = productDetailsData.vendor_approved_by.map(vendor => 
																	typeof vendor === 'object' ? vendor.id : vendor
																);
															} else if (typeof productDetailsData.vendor_approved_by === 'string') {
																approvedIds = productDetailsData.vendor_approved_by.split(',').map(id => parseInt(id.trim()));
															}
															
															approvedIds = approvedIds.filter(id => id !== undefined && id !== null);
															
															if (approvedIds.length > 0 && JSON.stringify(approvedIds) !== JSON.stringify(values.approved_id)) {
																setFieldValue('approved_id', approvedIds);
															}
														}
													}, [productDetailsData, setFieldValue]);

													return (
														<Form>
															{productDetailsData &&
																productDetailsData.length != 0 && (
																	<div className="row add-product">
																		<div className="col-md-12">
																			<div className="form-group">
																				<FormikField
																					label="Product Name"
																					isRequired={true}
																					name="name"
																					touched={touched}
																					errors={errors}
																					disabled={!isEditable}
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
																								isDisabled={!isEditable}
																								onChange={(selectedOption) => {
																									if (!isEditable) return;
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
																			</>
																		}

																		{!isEditable && (
																			<div className="col-md-12">
																				<div className="form-group">
																					<label htmlFor="approved_id">
																						<strong>Approved Vendors</strong>
																						<span className="text-danger ml-1">*</span>
																					</label>
																					<Select
																						isMulti
																						name="approved_id"
																						options={vendorApprovedList}
																						placeholder="Select Approved Vendors"
																						value={vendorApprovedList.filter(
																							(option) => Array.isArray(values?.approved_id) && 
																								values.approved_id.includes(option.value)
																						)}
																						styles={{
																							...customSelectStyles,
																							control: (base) => ({
																								...base,
																								borderColor: touched.approved_id && errors.approved_id ? '#dc3545' : base.borderColor,
																								'&:hover': {
																									borderColor: touched.approved_id && errors.approved_id ? '#dc3545' : base.borderColor
																								}
																							})
																						}}
																						onChange={(selectedOptions) => {
																							const selectedValues = selectedOptions
																								? selectedOptions.map((option) => option.value)
																								: [];
																							setFieldValue("approved_id", selectedValues);
																							setVendorApprovalChanged(true);
																						}}
																					/>
																					{vendorApprovalChanged && (
																						<div className="text-info mt-2">
																							<small>
																								<i className="fas fa-info-circle mr-1"></i>
																								Changes detected in vendor approvals. Click Save to apply changes.
																							</small>
																						</div>
																					)}
																					<ErrorMessage
																						name="approved_id"
																						component="div"
																						className="text-danger mt-1"
																					/>
																				</div>
																			</div>
																		)}

																		<div className="prod-spec-sec p-0 pt-3">
																			<div className="col-md-12">
																				<div className="form-group specification">
																					<label>Product Variants</label>
																					<FieldArray name="variations">
																						{({ push, remove }) => (
																							<>
																								{variantData &&
																										values.variations.map(
																											(field, index) => (
																												<div
																													key={index}
																													className="row"
																												>
																													<div className="col-md-3">
																														<div className="form-group">
																															<Field
																																name={`variations.${index}.attribute`}
																																type="text"
																																placeholder="Attribute"
																																disabled={!isEditable}
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
																																disabled={!isEditable}
																															/>
																															<div className="form-error">
																																<ErrorMessage
																																	name={`variations.${index}.attributeValue`}
																																	className="form-error"
																																/>
																															</div>
																														</div>
																													</div>

																													{isEditable && values.variations
																														.length > 1 && (
																															<div className="col-md-3">
																																<div className="form-group">
																																	<Link
																																		href="/"
																																		onClick={(
																																			event
																																		) => {
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
																								{isEditable && (
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
																								)}
																							</>
																						)}
																					</FieldArray>
																				</div>
																			</div>
																		</div>
																	</div>
																)}

															{(isEditable || vendorApprovalChanged) && (
																<button
																	type="submit"
																	className="page-link btn btn-secondary"
																>
																	Save
																</button>
															)}
														</Form>
													);
												}}
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

export default EditProduct;
