import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FormikField from "@/components/shared/FormikField";
import {
	categoryList,
	vendorApproveList,
	vendorList,
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


const EditProduct = () => {
	const [catloading, setcatloading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [selectedValues, setSelectedValues] = useState([]);
	const [groupedCategories, setgroupedCategories] = useState(new Map());
	const [categoryData, setCategoryData] = useState([]);

	const [vendorApprovedList, setVendorApprovedList] = useState([]);
	const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);
	const [selectedFeaturedFiles, setSelectedFeaturedFiles] = useState([]);
	const [selectedQapFiles, setSelectedQapFiles] = useState([]);
	const [selectedTdsFiles, setSelectedTdsFiles] = useState([]);
	const [mainLoading, setMainLoading] = useState(false);
	const [vendorData, setVendorData] = useState([]);
	const [productDetailsData, setProductDetailsData] = useState([]);
	const [variantData, setVariantData] = useState("");
	const [selectedFile, setSelectedFile] = useState([]);
	const [fileType, setFileType] = useState([]);
	const [images, setImages] = useState([]);
	const [image, setImage] = useState(null);
	const [qapFile, setQapFile] = useState(null);
	const [tdsFile, setTdsFile] = useState(null);
	const [galleryImages, setGalleryImages] = useState([]);
	const [vendorListData, setVendorListData] = useState([])
	const [isEditable, setIsEditable] = useState(true);
	const [vendorApprovalChanged, setVendorApprovalChanged] = useState(false);
	const router = useRouter();
	const { id } = router.query;
	const uploadedImage = React.useRef(null);
	const imageUploader = React.useRef(null);
	let files;
	let gallery;

	const isFeaturesArray = [
		{ label: "Select is Featured", value: "" },
		{ label: "Yes", value: "1" },
		{ label: "No", value: "0" },
	];

	useEffect(() => {
		if (id) {
			getCategories();
			getVendorApproveList();
			getVendor();
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

	useEffect(() => {
		getGalleryImage();
	}, [productDetailsData]);

	// Track vendor approval data structure for debugging
	useEffect(() => {
		if (productDetailsData?.vendor_approved_by) {
			console.log("Vendor approved_by structure:", productDetailsData.vendor_approved_by);
			if (Array.isArray(productDetailsData.vendor_approved_by)) {
				console.log("Vendor IDs:", productDetailsData.vendor_approved_by.map(vendor => vendor.id));
			}
		}
	}, [productDetailsData]);

	// Special handling for vendor list data to combine vendor_list and vendor_approved_by
	useEffect(() => {
		if (vendorListData && vendorListData.length > 0) {
			// Extract all approved by data from vendor list
			const allApprovals = [];
			vendorListData.forEach(vendor => {
				if (vendor.vendor_approved_by && vendor.vendor_approved_by.length > 0) {
					vendor.vendor_approved_by.forEach(approval => {
						if (!allApprovals.includes(approval.id)) {
							allApprovals.push(approval.id);
						}
					});
				}
			});
			
			console.log("All approvals extracted from vendor list:", allApprovals);
			
			// If we have approvals but the form doesn't, update the form
			if (allApprovals.length > 0) {
				// This will be picked up by the Formik component's useEffect
				setProductDetailsData(prev => ({
					...prev,
					vendor_approved_by: allApprovals.map(id => ({ id }))
				}));
			}
		}
	}, [vendorListData]);

	const initialValues = {
		name: productDetailsData?.name || "",
		description: productDetailsData?.description || "",
		categories: productDetailsData?.product_categories
			? [productDetailsData.product_categories]
			: [],
		featured: productDetailsData?.featured || [],
		status: 1,
		approved_id: productDetailsData?.vendor_approved_by && Array.isArray(productDetailsData.vendor_approved_by) && productDetailsData.vendor_approved_by.length > 0
			? productDetailsData.vendor_approved_by.map(vendor => vendor.id) 
			: [],
		approved_name: productDetailsData?.approved_name || "",
		variations: variantData.length
			? [...variantData]
			: [{ attribute: "", attributeValue: "" }],
		is_featured:
			productDetailsData?.is_featured === 0 || productDetailsData?.is_featured === 1
				? productDetailsData.is_featured
				: "",
	};

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

	const getVendor = () => {
		vendorList()
			.then((rsp) => {
				let lists = rsp.data.map((s) => ({
					label: s.name,
					value: s.id,
				}));
				lists.unshift({ label: "Select Vendor list", value: "" });
				lists.push({ label: "Other", value: "o" });
				setVendorData(lists);
			})
			.catch((error) => {
				setcatloading(false);
			});
	};
	const getVendorApproveList = () => {
		vendorApproveList().then((res) => {
			let lists = res.data.map((s) => ({
				label: s.vendor_approve,
				value: s.id,
			}));
			// lists.unshift({ label: "Select Vendor list", value: "" });
			// lists.push({ label: "Other", value: "o" });
			setVendorApprovedList(lists);
		});
	};
	const getProductDetails = async () => {
		try {
			const response = await getProducts(id);
			const { data, vendor_list } = response;
			
			// Set editability based on conditions
			const isEditableProduct = (data.added_by === 1 || data.added_by === 111) && !data.vendor;
			setIsEditable(isEditableProduct);

			// Log the raw data to verify what we're getting
			console.log("Product Details Data:", data);
			console.log("Vendor List Data:", vendor_list);
			console.log("Vendor Approved By:", data.vendor_approved_by);

			setProductDetailsData(data);
			setVendorListData(vendor_list);

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

	// const imageUploadHandler = (events) => {
	//   const [file] = events.target.files;
	//   const selectedFiles = Array.from(events.target.files);
	//   setSelectedFeaturedFiles(selectedFiles)
	//   if (file) {
	//     const reader = new FileReader();
	//     const { current } = uploadedImage;
	//     current.file = file;
	//     reader.onload = events => {
	//       current.src = events.target.result;
	//       setSelectedFile(current.src)
	//     };
	//     reader.readAsDataURL(file);
	//     setFileType(file.type)
	//   }
	// }
	const handleImageChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		setImages(selectedFiles);
		setGalleryImages("");
		setSelectedGalleryFiles(selectedFiles);
	};

	const getGalleryImage = () => {
		let image = [];
		productDetailsData?.product_images?.map((img) => {
			if (img.is_featured == 0) {
				image.push(img.product_image_url);
			}
		});
		setGalleryImages(image);
	};

	const submitHandler = (values) => {
		// Create FormData object
		const formData = new FormData();

		try {
			// For non-editable products, only update vendor approvals while preserving other fields
			if (!isEditable) {
				// Include required fields from existing data
				formData.append('name', productDetailsData.name);
				formData.append('status', '1');
				formData.append('is_featured', productDetailsData.is_featured.toString());
				formData.append('description', productDetailsData.description || '');
				
				// Handle categories array
				const existingCategories = productDetailsData.product_categories?.map(cat => cat.id) || [];
				existingCategories.forEach((categoryId) => {
					formData.append('categories[]', categoryId.toString());
				});

				// Handle approved_id array - Send as comma-separated string as required by backend
				const approvedIds = values.approved_id || [];
				if (approvedIds.length > 0) {
					// Convert the array to a comma-separated string
					formData.append('approved_id', approvedIds.join(','));
					console.log('Sending approved vendors as string:', approvedIds.join(','));
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
					// Send an empty variation
					formData.append('variations[0][attribute]', '');
					formData.append('variations[0][attributeValue]', '');
				}
			} else {
				// For editable products, send all values
				formData.append('name', values.name);
				formData.append('status', '1');
				formData.append('is_featured', values.is_featured.toString());
				formData.append('description', values.description || '');

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

				// Handle approved_id array - Send as comma-separated string as required by backend
				const approvedIds = values.approved_id || [];
				if (approvedIds.length > 0) {
					// Convert the array to a comma-separated string
					formData.append('approved_id', approvedIds.join(','));
					console.log('Sending approved vendors as string:', approvedIds.join(','));
				} else {
					formData.append('approved_id', '');
				}

				// Handle variations array
				if (values.variations && values.variations.length > 0) {
					// Filter out empty variations
					const filteredVariations = values.variations.filter(
						v => v.attribute.trim() !== '' || v.attributeValue.trim() !== ''
					);
					
					// Send each variation as a separate field
					filteredVariations.forEach((variation, index) => {
						formData.append(`variations[${index}][attribute]`, variation.attribute || '');
						formData.append(`variations[${index}][attributeValue]`, variation.attributeValue || '');
					});
				} else {
					// Send an empty array by appending a single empty variation
					formData.append('variations[0][attribute]', '');
					formData.append('variations[0][attributeValue]', '');
				}

				// Append files if present
				if (selectedGalleryFiles.length > 0) {
					selectedGalleryFiles.forEach(file => {
						formData.append('gallery[]', file);
					});
				}
				if (selectedFeaturedFiles.length > 0) {
					selectedFeaturedFiles.forEach(file => {
						formData.append('featured[]', file);
					});
				}
				if (selectedQapFiles.length > 0) {
					selectedQapFiles.forEach(file => {
						formData.append('qap[]', file);
					});
				}
				if (selectedTdsFiles.length > 0) {
					selectedTdsFiles.forEach(file => {
						formData.append('tds[]', file);
					});
				}
			}

			// For debugging - log the FormData contents
			console.log('Form Data Contents:');
			for (let [key, value] of formData.entries()) {
				console.log(`${key}: ${value}`);
			}

			setMainLoading(true);
			handleUpdateProduct(formData, id)
				.then((res) => {
					toast.success(res.message);
					
					// Don't redirect automatically
					// Instead, update the product data in place
					getProducts(id).then(response => {
						const { data, vendor_list } = response;
						setProductDetailsData(data);
						setVendorListData(vendor_list);
						console.log("Updated product details:", data);
						console.log("Updated vendor list:", vendor_list);
						setMainLoading(false);
						setVendorApprovalChanged(false); // Reset the change flag
						
						// Don't auto-redirect, let the user decide when to go back
						toast.info("Product updated successfully. You can continue editing or go back to the product list.");
					}).catch(error => {
						console.error("Failed to refresh product details:", error);
						setMainLoading(false);
					});
				})
				.catch((error) => {
					console.error('Error updating product:', error);
					// Show the actual error message from the backend if available
					const errorMessage = error.response?.data?.message || 
						error.response?.data?.error || 
						error.message ||
						"Failed to update product. Please try again.";
					
					toast.error(errorMessage, {
						position: "top-right",
						autoClose: 5000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
					});
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

					{/* Add warning message for uneditable products */}
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
													approved_id: !isEditable ? yup.array().min(1, "At least one approved vendor is required") : yup.array(),
													is_featured: yup.string().required("Is featured is required"),
												})}
												onSubmit={(values, { resetForm }) => {
													// For non-editable products, only allow vendor approval changes
													if (!isEditable) {
														if (!vendorApprovalChanged) {
															toast.info("No changes made to vendor approvals");
															return;
														}
														
														// Compare the current approvals with the original approvals
														const originalApprovals = productDetailsData?.vendor_approved_by?.map(vendor => vendor.id) || [];
														const currentApprovals = values.approved_id || [];
														
														// Check if there are actual changes in the approvals
														const hasChanges = 
															originalApprovals.length !== currentApprovals.length || 
															originalApprovals.some(id => !currentApprovals.includes(id)) ||
															currentApprovals.some(id => !originalApprovals.includes(id));
														
														if (!hasChanges) {
															toast.info("No changes detected in vendor approvals");
															return;
														}
														
														// Only send approved_id in payload for non-editable products
														submitHandler({
															approved_id: values.approved_id
														});
														return;
													}
													
													// For editable products, send all values
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
													// Initialize vendor approvals when productDetailsData changes
													useEffect(() => {
														if (productDetailsData?.vendor_approved_by) {
															console.log("Re-initializing vendor approvals from:", productDetailsData.vendor_approved_by);
															
															// Handle different data structures that might come from the API
															let approvedIds = [];
															
															if (Array.isArray(productDetailsData.vendor_approved_by)) {
																// If it's already an array, map out the IDs
																approvedIds = productDetailsData.vendor_approved_by.map(vendor => 
																	typeof vendor === 'object' ? vendor.id : vendor
																);
															} else if (typeof productDetailsData.vendor_approved_by === 'string') {
																// If it's a comma-separated string
																approvedIds = productDetailsData.vendor_approved_by.split(',').map(id => parseInt(id.trim()));
															}
															
															// Filter out any invalid values
															approvedIds = approvedIds.filter(id => id !== undefined && id !== null);
															
															console.log("Setting vendor approvals to:", approvedIds);
															
															// Only update if there are actual IDs and they're different from current values
															if (approvedIds.length > 0 && JSON.stringify(approvedIds) !== JSON.stringify(values.approved_id)) {
																setFieldValue('approved_id', approvedIds);
															}
														}
													}, [productDetailsData, setFieldValue]);

													// Log when values change
													useEffect(() => {
														console.log("Current approved_id values:", values.approved_id);
													}, [values.approved_id]);

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
																					disabled={!isEditable}
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
																					value={vendorApprovedList.filter(
																						(option) =>
																							values?.approved_id?.includes(
																								option?.value
																							)
																					)}
																					styles={customSelectStyles}
																					onChange={(selectedOptions) => {
																						const selectedValues = selectedOptions
																							? selectedOptions?.map(
																								(option) => option.value
																							)
																								: [];
																						setFieldValue(
																								"approved_id",
																								selectedValues
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

																		{/* Vendor Approval Section - Show when product is NOT editable */}
																		{!isEditable && (
																			<div className="col-md-12">
																				<div className="form-group">
																					<label htmlFor="approved_id">
																						<strong>Approved Vendors</strong>
																						<span className="text-danger ml-1">*</span>
																					</label>
																					{/* Debug values */}
																					<div className="small text-muted mb-2">
																						{values?.approved_id?.length > 0 ? (
																							<span>Selected approvals: {values.approved_id.join(', ')}</span>
																						) : (
																							<span>No approvals selected</span>
																						)}
																					</div>
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
																							
																							// Log detailed information about the selection
																							console.log('Selected vendor options:', selectedOptions);
																							console.log('Mapped to values:', selectedValues);
																							
																							// Set the field value immediately
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

																		{isEditable && (
																			<>
																				<div className="col-md-12">
																					<div className="row">
																						<div className="form-group">
																							<label>
																								Upload Product Images
																								<small className="form-text d-inline-flex text-muted ms-2">
																									( Accepted formats: .jpg, .jpeg, .png, .webp. Maximum size: 2MB. Limit: 8 Images )
																								</small>
																							</label>
																							<Field
																								id="gallery"
																								name="gallery"
																								type="file"
																								className="file-control"
																								value={undefined}
																								multiple
																								ref={imageUploader}
																								onChange={handleImageChange}
																							/>
																						</div>
																					</div>
																				</div>
																				{/* ... rest of file upload sections ... */}
																			</>
																		)}

																		<div className="gallery-image-pane d-flex">
																			{galleryImages &&
																				galleryImages.length != 0 &&
																				galleryImages.map((data, index) => {
																					return (
																						<div className="image-panel">
																							<img
																								key={index}
																								src={data}
																								style={{
																									width: "80px",
																									height: "80px",
																									objectFit: "cover",
																								}}
																							/>
																						</div>
																					);
																				})}
																			{images &&
																				images.length != 0 &&
																				images.map((data, index) => {
																					return (
																						<div className="image-panel">
																							<img
																								key={index}
																								src={URL.createObjectURL(data)}
																								style={{
																									width: "80px",
																									height: "80px",
																									objectFit: "cover",
																								}}
																							/>
																						</div>
																					);
																				})}
																		</div>

																		{isEditable && (
																			<>
																				<div className="col-md-12">
																					<div className="row featured-image">
																						<div className="form-group">
																							<label>
																								Upload Featured Image
																								<small className="form-text d-inline-flex text-muted ms-2">
																									( Accepted formats: .jpg, .jpeg, .png, .webp. Maximum size: 2MB. Limit: 1 Image )
																								</small>
																							</label>
																							<Field
																								id="file"
																								name="featured"
																								type="file"
																								className="file-control"
																								touched={touched}
																								errors={errors}
																								value={undefined}
																								onChange={(e) => {
																									const selectFiles = e.target.files[0];
																									setFieldValue(
																										"featured",
																										selectFiles
																									);
																									setImage(
																										URL.createObjectURL(selectFiles)
																									);
																									setSelectedFeaturedFiles([
																										selectFiles,
																									]);
																								}}
																							/>
																						</div>
																						{/* {touched.featured && errors.featured && <div className="form-error">{errors.featured}</div>} */}

																						{productDetailsData.product_images &&
																							!image &&
																							productDetailsData.product_images
																								.length != 0 &&
																							productDetailsData.product_images.map(
																								(data, index) => {
																									return (
																										data.is_featured == 1 && (
																											<div className="m-2">
																												<img
																													key={index}
																													ref={uploadedImage}
																													src={data.product_image_url}
																													style={{
																														width: "80px",
																														height: "80px",
																														objectFit: "cover",
																													}}
																												/>
																											</div>
																										)
																									);
																								}
																							)}
																						{image && (
																								<div className="mt-2 mb-2">
																									<img
																										src={image}
																										style={{
																											width: "80px",
																											height: "80px",
																											objectFit: "cover",
																										}}
																									/>
																								</div>
																						)}
																					</div>
																				</div>
																				<div className="col-md-12">
																					<div className="row qap-file">
																						<div className="form-group">
																							<label>
																								Upload QAP File
																								<small className="form-text d-inline-flex text-muted ms-2">
																									( Accepted formats: .pdf. Maximum size: 2MB. Limit: 1 File )
																								</small>
																							</label>
																							<Field
																								id="qap-file"
																								name="qap"
																								accept=".pdf"
																								type="file"
																								className="file-control"
																								touched={touched}
																								errors={errors}
																								value={undefined}
																								onChange={(e) => {
																									const qap = e.target.files[0];
																									setFieldValue("qap", qap);
																									setQapFile(URL.createObjectURL(qap));
																									setSelectedQapFiles([qap]);
																								}}
																							/>
																						</div>
																						{/* {touched.featured && errors.featured && <div className="form-error">{errors.featured}</div>} */}

																						{productDetailsData?.qap_new_file_name &&
																								!qapFile && (
																									<div className="m-2">
																										<>
																											<a
																												href={
																													productDetailsData?.qap_new_file_name
																												}
																												target="_blank"
																											>
																												<i class="fa fa-file"></i>
																											</a>
																											<a>
																												{
																													productDetailsData?.qap_original_file_name
																												}
																											</a>
																										</>
																	</div>
																								)}
																					</div>
																				</div>
																				<div className="col-md-12">
																					<div className="row qap-file">
																						<div className="form-group">
																							<label>
																								Upload TDS File
																								<small className="form-text d-inline-flex text-muted ms-2">
																									( Accepted formats: .pdf. Maximum size: 2MB. Limit: 1 File )
																								</small>
																							</label>
																							<Field
																								id="tds-file"
																								name="tds"
																								accept=".pdf"
																								type="file"
																								className="file-control"
																								touched={touched}
																								errors={errors}
																								value={undefined}
																								onChange={(e) => {
																									const tds = e.target.files[0];
																									setFieldValue("tds", tds);
																									setTdsFile(URL.createObjectURL(tds));
																									setSelectedTdsFiles([tds]);
																								}}
																							/>
																						</div>
																						{/* {touched.featured && errors.featured && <div className="form-error">{errors.featured}</div>} */}

																						{productDetailsData?.tds_new_file_name &&
																								!tdsFile && (
																									<div className="m-2">
																										<>
																											<a
																												href={
																													productDetailsData?.tds_new_file_name
																												}
																												target="_blank"
																											>
																												<i class="fa fa-file"></i>
																											</a>
																											<a>
																												{
																													productDetailsData?.tds_original_file_name
																												}
																											</a>
																										</>
																	</div>
																								)}
																					</div>
																				</div>
																			</>
																		)}

																		<div className="prod-spec-sec p-0 pt-3">
																			<div className="col-md-12">
																				<div className="form-group specification ">
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
																				<div className="d-flex gap-4 mt-2">
																					{/* <div className="form-group">
																						<FormikField
																							label="Vendor"
																							type="select"
																							selectOptions={vendorData}
																							isRequired={true}
																							name="vendor"
																							touched={touched}
																							errors={errors}
																						/>
																					</div> */}
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
													)}
												}
											</Formik>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="card col-12">
						<div className="card-header">Vendor List</div>
						<div className="card-body">
							<table className="table table-striped table-hover mb-3">
								<thead>
									<tr>
										<th scope="col">Sl. No.</th>
										<th scope="col">Name</th>
										<th scope="col">Approved By</th>
									</tr>
								</thead>
								<tbody>
									{vendorListData &&
										vendorListData.length != 0 &&
										vendorListData.map((item, index) => {
											return (
												<tr key={item.id}>
													<td>{index + 1}</td>
													<td>{item.vendor_name ? item.vendor_name : '--'}</td>
													<td>
														<span className="d-flex">
															{item.vendor_approved_by &&
																item.vendor_approved_by.length != 0 &&
																item.vendor_approved_by.map((data, index) => {
																	return (
																		<span className="badge text-bg-info rounded-pill py-1 px-3" key={index}>
																			{data.name}{data !== item.vendor_approved_by[item.vendor_approved_by.length - 1] && <span>,&nbsp;</span>}
																		</span>
																	)
																})}
														</span>
													</td>
												</tr>
											);
										})}
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<ToastContainer />
			</section>
		</>
	);
};

export default EditProduct;
