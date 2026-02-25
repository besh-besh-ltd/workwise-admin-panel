import React, { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import FormikField from "@/components/shared/FormikField";
import {
	categoryList,
} from "@/utils/services/rfq";
import { addProducts } from "@/utils/services/products";
import * as yup from "yup";
import { Form, Formik, FormikHelpers, FormikErrors, FormikTouched } from "formik";
import { ToastContainer, toast } from "react-toastify";
import Select, { SingleValue, StylesConfig } from "react-select";
import { useRouter, NextRouter } from "next/router";

// Type definitions
interface SelectOption {
	value: number;
	label: string;
}

interface CategoryItem {
	id: number;
	title: string;
	parent_id: string | number;
}

interface Variation {
	attribute: string;
	attributeValue: string;
}

interface FormValues {
	name: string;
	description: string;
	categories: number[];
	status: number;
	approved_id: string;
	approved_name: string;
	variations: Variation[];
	vendor: string;
	is_featured: string;
}

interface AddProductPayload {
	name: string;
	description: string;
	status: number;
	categories: number[];
	approved_id?: string;
	approved_name?: string;
	variations?: Variation[];
	vendor?: string;
	is_featured?: string;
}

const AddProduct: React.FC = () => {
	const [catloading, setcatloading] = useState<boolean>(false);
	const [categories, setCategories] = useState<SelectOption[][]>([]);
	const [selectedValues, setSelectedValues] = useState<(SelectOption | null)[]>([]);
	const [groupedCategories, setgroupedCategories] = useState<Map<number, SelectOption[]>>(new Map());

	const [mainLoading, setMainLoading] = useState<boolean>(false);
	const router: NextRouter = useRouter();

	useEffect(() => {
		getCategories();
	}, []);

	const initialValues: FormValues = {
		name: "",
		description: "",
		categories: [],
		status: 1,
		approved_id: "",
		approved_name: "",
		variations: [{ attribute: "", attributeValue: "" }],
		vendor: "",
		is_featured: "",
	};

	const customSelectStyles: StylesConfig<SelectOption, false> = {
		control: (base) => ({
			...base,
			height: 50,
			minHeight: 50,
		}),
	};

	const getCategories = async (): Promise<void> => {
		try {
			setcatloading(true);
			const res : any = await categoryList();
			const groupedData = res.data.reduce((acc: Record<number, SelectOption[]>, item: CategoryItem) => {
				const parentId = parseInt(String(item.parent_id)) || 0;
				if (!acc[parentId]) {
					acc[parentId] = [];
				}
				acc[parentId].push({ value: item?.id, label: item?.title });
				return acc;
			}, {} as Record<number, SelectOption[]>);

			const catMap = new Map<number, SelectOption[]>(
				Object.entries(groupedData).map(([key, value]) => [parseInt(key), value as SelectOption[]])
			);
			const rootCategories = catMap.get(0);
			if (rootCategories) {
				setCategories([rootCategories]);
			}
			setgroupedCategories(catMap);
		} catch (error) {
			console.error("Failed to fetch categories:", error);
		} finally {
			setcatloading(false);
		}
	};

	const hideChildLevels = (level: number): void => {
		const updatedCategories = categories.slice(0, level);
		const updatedSelectedValues = selectedValues.slice(0, level);

		setCategories(updatedCategories);
		setSelectedValues(updatedSelectedValues);
	};

	const getChildCategories = (id: number, level: number): void => {
		const childItems = groupedCategories.get(id);

		if (childItems && childItems.length > 0) {
			const updatedCategories = [...categories];
			updatedCategories[level] = childItems;
			setCategories(updatedCategories.slice(0, level + 1));
		} else {
			setCategories(categories.slice(0, level));
		}
	};

	const submitHandler = (values: FormValues): void => {
		let payload: AddProductPayload = {
			...values,
			status: 1,
			categories: selectedValues
				.filter((cat): cat is SelectOption => cat != null)
				.map(cat => cat.value),
		}

		setMainLoading(true);
		addProducts(payload)
			.then((res: any) => {
				toast.success(res.message);
				setTimeout(() => {
					router.push("/product-management");
				}, 1000);
			})
			.catch((error: any) => {
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
													description: yup.string(),
													approved_id: yup.array(),
												})}
												onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
													submitHandler(values);
												}}
											>
												{({
													errors,
													touched,
													values,
													handleChange,
													setFieldValue,
												}: {
													errors: FormikErrors<FormValues>;
													touched: FormikTouched<FormValues>;
													values: FormValues;
													handleChange: (e: ChangeEvent<any>) => void;
													setFieldValue: (field: string, value: any) => void;
												}) => (
													<Form>
														<div className="row add-product">
															<div className="col-md-12">
																<div className="form-group">
																	<FormikField
																		label="Product Name"
																		isRequired={true}
																		name="name"
																		touched={touched as any}
																		errors={errors as any}
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
																					onChange={(selectedOption: SingleValue<SelectOption>) => {
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
																		touched={touched as any}
																		errors={errors as any}
																		className="text-editor-area"
																		cols={30}
																		rows={10}
																	/>
																</div>
															</div>

															<div className="col-md-4">
															</div>
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
