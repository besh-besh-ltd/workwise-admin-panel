import React, { useEffect, useState } from "react";
import Link from "next/link";
import FormikField from "@/components/shared/FormikField";
import UploadFiles from "@/components/shared/ImagesUpload";
import {
	categoryList,
	vendorApproveList,
	vendorList,
} from "@/utils/services/rfq";
import { addProducts } from "@/utils/services/products";
import * as yup from "yup";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import { useRouter } from "next/router";
import Image from "next/image";

const AddProduct = () => {
	const [isClient, setIsClient] = useState(false);
	const [catloading, setcatloading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [parentCategories, setParentCategories] = useState([]);
	const [cat_id, setCat_id] = useState("");
	const [levelOneCat, setlevelOneCat] = useState([]);
	const [levelTwoCat, setlevelTwoCat] = useState([]);
	const [levelThreeCat, setlevelThreeCat] = useState([]);
	const [levelFourCat, setlevelFourCat] = useState([]);
	const [levelFiveCat, setlevelFiveCat] = useState([]);
	const [levelSixCat, setlevelSixCat] = useState([]);
	const [vendorApprovedList, setVendorApprovedList] = useState([]);
	const [selectedGalleryFilesReset, setSelectedGalleryFilesReset] =
		useState(false);
	const [selectedGalleryFiles, setSelectedGalleryFiles] = useState([]);
	const [selectedFeaturedFilesReset, setSelectedFeaturedFilesReset] =
		useState(false);
	const [selectedFeaturedFiles, setSelectedFeaturedFiles] = useState([]);
	const [selectedTdsFilesReset, setSelectedTdsFilesReset] = useState(false);
	const [selectedTdsFiles, setSelectedTdsFiles] = useState([]);
	const [selectedQapFilesReset, setSelectedQapFilesReset] = useState(false);
	const [selectedQapFiles, setSelectedQapFiles] = useState([]);
	const [levelOneCatSelected, setlevelOneCatSelected] = useState("");
	const [levelTwoCatSelected, setlevelTwoCatSelected] = useState("");
	const [levelThreeCatSelected, setlevelThreeCatSelected] = useState("");
	const [levelFourCatSelected, setlevelFourCatSelected] = useState("");
	const [levelFiveCatSelected, setlevelFiveCatSelected] = useState("");
	const [levelSixCatSelected, setlevelSixCatSelected] = useState("");
	const [mainLoading, setMainLoading] = useState(false);
	const [vendorData, setVendorData] = useState([]);
	const router = useRouter();

	const isFeaturesArray = [
		{ label: "Select is Featured", value: "" },
		{ label: "Yes", value: "1" },
		{ label: "No", value: "0" },
	];

	const editorConfiguration = {
		toolbar: [
			"heading",
			"|",
			"bold",
			"italic",
			"link",
			"bulletedList",
			"numberedList",
			"|",
			"outdent",
			"indent",
			"|",
			"imageUpload",
			"blockQuote",
			"insertTable",
			"mediaEmbed",
			"undo",
			"redo",
		],
	};

	useEffect(() => {
		getCategories();
		getVendorApproveList();
		getVendor();
	}, []);

	const initialValues = {
		name: "",
		description: "",
		// manufacturer: "",
		// availability: "",
		categories: [],
		featured: "",
		tds: "",
		qap: "",
		status: 1,
		approved_id: "",
		approved_name: "",
		variations: [{ attribute: "", attributeValue: "" }],
		vendor: "",
		is_featured: "",
	};

	const customSelectStyles = {
		control: (base) => ({
			...base,
			height: 50,
			minHeight: 50,
		}),
	};

	const getCategories = () => {
		setcatloading(true);
		categoryList()
			.then((rsp) => {
				setcatloading(false);
				let options = [];
				let parentOptions = [];
				rsp.data.map((item) => {
					options.push({ value: item?.id, label: item?.title });
					if (item.parent_id == 0) {
						parentOptions.push({ value: item?.id, label: item?.title });
					}
				});
				setCategories(rsp.data);
				setParentCategories(parentOptions);
			})
			.catch((error) => {
				setcatloading(false);
			});
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
	const getChildCategories = (id, level) => {
		let childItems = categories.filter((item) => item.parent_id == id);
		let options = [];
		if (childItems.length > 0) {
			childItems.map((item) => {
				options.push({ value: item?.id, label: item?.title });
			});
		}
		if (level == 1) {
			setlevelOneCat(options);
			setlevelOneCatSelected(id);
			setlevelTwoCatSelected("");
			setlevelThreeCatSelected("");
			setlevelFourCatSelected("");
			setlevelFiveCatSelected("");
			setlevelSixCatSelected("");
		} else if (level == 2) {
			setlevelTwoCat(options);
			setlevelTwoCatSelected(id);
			setlevelThreeCatSelected("");
			setlevelFourCatSelected("");
			setlevelFiveCatSelected("");
			setlevelSixCatSelected("");
		} else if (level == 3) {
			setlevelThreeCat(options);
			setlevelThreeCatSelected(id);
			setlevelFourCatSelected("");
			setlevelFiveCatSelected("");
			setlevelSixCatSelected("");
		} else if (level == 4) {
			setlevelFourCat(options);
			setlevelFourCatSelected(id);
			setlevelFiveCatSelected("");
			setlevelSixCatSelected("");
		} else if (level == 5) {
			setlevelFiveCat(options);
			setlevelFiveCatSelected(id);
			setlevelSixCatSelected("");
		} else if (level == 6) {
			setlevelSixCat(options);
			setlevelSixCatSelected(id);
		} else {
		}
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

	const submitHandler = (values) => {
		const payload = new FormData();
		payload.append(`name`, values.name);
		payload.append(`description`, values.description);
		// payload.append(`manufacturer`, values.manufacturer);
		// payload.append(`availability`, values.availability);
		payload.append(`status`, 1);
		payload.append(
			`approved_id`,
			values.approved_id == "o" ? "" : JSON.stringify(values.approved_id)
		);
		payload.append(
			`approved_name`,
			values.approved_id == "o" ? values.approved_name : ""
		);
		payload.append(`variations`, JSON.stringify(values.variations));
		selectedGalleryFiles.forEach((file, i) => {
			payload.append(`gallery`, file, file.name);
		});
		selectedFeaturedFiles.forEach((file, i) => {
			payload.append(`featured`, file, file.name);
		});
		selectedQapFiles.forEach((file, i) => {
			payload.append(`qap`, file, file.name);
		});
		selectedTdsFiles.forEach((file, i) => {
			payload.append(`tds`, file, file.name);
		});
		let selectedCategories = [
			levelOneCatSelected,
			levelTwoCatSelected,
			levelThreeCatSelected,
			levelFourCatSelected,
			levelFiveCatSelected,
			levelSixCatSelected,
		];
		selectedCategories = selectedCategories.filter(
			(v) => v != "" && v !== null
		);
		payload.append(`categories`, JSON.stringify(selectedCategories));
		// payload.append(`vendor`, values.vendor);
		payload.append(`is_featured`, values.is_featured);
		setMainLoading(true);
		addProducts(payload)
			.then((res) => {
				toast(res.message);
				setTimeout(() => {
					router.push("/product-management");
				}, 1000);
			})
			.catch((error) => {
				if (error.message.response.status === 400) {
					if (error.message.response.data.status === 2) {
						let txt = "";
						for (let x in error?.message?.response?.data?.errors) {
							txt = error?.message?.response?.data?.errors[x];
						}
						toast(txt);
					}
				}
				setMainLoading(false);
			});
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
											<span className="title">Add Products</span>
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
													is_featured: yup
														.string()
														.required("Vendor is required"),
													// featured: yup
													//   .string()
													//   .required("Featured is required"),
												})}
												onSubmit={(values, { resetForm }) => {
													submitHandler(values);
													console.log(values, "values *");
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

															{!catloading && (
																<>
																	<div className="col-md-3">
																		<div className="form-group">
																			<Select
																				options={parentCategories}
																				placeholder="Select Category"
																				isClearable={true}
																				styles={customSelectStyles}
																				onChange={(e) => {
																					setlevelOneCat([]);
																					setlevelTwoCat([]);
																					setlevelThreeCat([]);
																					setlevelFourCat([]);
																					setlevelFiveCat([]);
																					setlevelSixCat([]);
																					getChildCategories(e?.value, "1");
																					if (e && e.value) {
																						setCat_id(e.value);
																						setFieldValue("categories", [
																							e.value,
																						]);
																					} else {
																						setFieldValue("categories", []);
																					}
																				}}
																			/>
																		</div>
																	</div>
																	{levelOneCat && levelOneCat.length > 0 && (
																		<div className="col-md-3">
																			<div className="form-group">
																				<Select
																					options={levelOneCat}
																					placeholder="Select Sub Category"
																					isClearable={true}
																					styles={customSelectStyles}
																					onChange={(e) => {
																						getChildCategories(e?.value, "2");
																						if (e && e.value) {
																							setCat_id(e.value);
																						} else {
																							setCat_id("");
																						}
																					}}
																				/>
																			</div>
																		</div>
																	)}
																	{levelTwoCat && levelTwoCat.length > 0 && (
																		<div className="col-md-3">
																			<div className="form-group">
																				<Select
																					options={levelTwoCat}
																					placeholder="Select Sub Category"
																					isClearable={true}
																					styles={customSelectStyles}
																					onChange={(e) => {
																						getChildCategories(e?.value, "3");
																						if (e && e.value) {
																							setCat_id(e.value);
																						} else {
																							setCat_id("");
																						}
																					}}
																				/>
																			</div>
																		</div>
																	)}
																	{levelThreeCat &&
																		levelThreeCat.length > 0 && (
																			<div className="col-md-3">
																				<div className="form-group">
																					<Select
																						options={levelThreeCat}
																						placeholder="Select Sub Category"
																						isClearable={true}
																						styles={customSelectStyles}
																						onChange={(e) => {
																							getChildCategories(e?.value, "4");
																							if (e && e.value) {
																								setCat_id(e.value);
																							} else {
																								setCat_id("");
																							}
																						}}
																					/>
																				</div>
																			</div>
																		)}

																	{levelFourCat && levelFourCat.length > 0 && (
																		<div className="col-md-3">
																			<div className="form-group">
																				<Select
																					options={levelFourCat}
																					placeholder="Select Sub Category"
																					isClearable={true}
																					styles={customSelectStyles}
																					onChange={(e) => {
																						getChildCategories(e?.value, "5");
																						if (e && e.value) {
																							setCat_id(e.value);
																						} else {
																							setCat_id("");
																						}
																					}}
																				/>
																			</div>
																		</div>
																	)}

																	{levelFiveCat && levelFiveCat.length > 0 && (
																		<div className="col-md-3">
																			<div className="form-group">
																				<Select
																					options={levelFiveCat}
																					placeholder="Select Sub Category"
																					isClearable={true}
																					styles={customSelectStyles}
																					onChange={(e) => {
																						getChildCategories(e?.value, "6");
																						if (e && e.value) {
																							setCat_id(e.value);
																						} else {
																							setCat_id("");
																						}
																					}}
																				/>
																			</div>
																		</div>
																	)}
																	{levelSixCat && levelSixCat.length > 0 && (
																		<div className="col-md-3">
																			<div className="form-group">
																				<Select
																					options={levelSixCat}
																					placeholder="Select Sub Category"
																					isClearable={true}
																					styles={customSelectStyles}
																					onChange={(e) => {
																						getChildCategories(e?.value, "7");
																						if (e && e.value) {
																							setCat_id(e.value);
																						} else {
																							setCat_id("");
																						}
																					}}
																				/>
																			</div>
																		</div>
																	)}
																</>
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
																<div className="form-group">
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
																</div>
															</div>

															{values.approved_id == "o" && (
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
															)}

															<div className="col-md-12">
																<div className="row">
																	<UploadFiles
																		accept=".png, .jpg, .jpeg, .gif"
																		upload={setSelectedGalleryFiles}
																		reset={selectedGalleryFilesReset}
																		label="Upload Product Images"
																	/>
																</div>
															</div>

															<div className="col-md-12">
																<div className="row">
																	<UploadFiles
																		accept=".png, .jpg, .jpeg, .gif"
																		upload={setSelectedFeaturedFiles}
																		reset={selectedFeaturedFilesReset}
																		label="Upload Featured Image"
																		isMultiple={false}
																		touched={touched}
																		errors={errors}
																	/>
																	{/* {touched.featured && errors.featured && <div className="form-error">{errors.featured}</div>} */}
																</div>
															</div>

															<div className="col-md-12">
																<div className="row">
																	<UploadFiles
																		accept=".pdf"
																		upload={setSelectedQapFiles}
																		reset={selectedQapFilesReset}
																		label="Upload QAP File"
																		isMultiple={false}
																		touched={touched}
																		errors={errors}
																	/>
																</div>
															</div>
															<div className="col-md-12">
																<div className="row">
																	<UploadFiles
																		accept=".pdf"
																		upload={setSelectedTdsFiles}
																		reset={selectedTdsFilesReset}
																		label="Upload TDS File"
																		isMultiple={false}
																		touched={touched}
																		errors={errors}
																	/>
																</div>
															</div>

															<div className="prod-spec-sec p-0">
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

														<button
															type="submit"
															className="page-link btn btn-secondary"
														>
															Save
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
