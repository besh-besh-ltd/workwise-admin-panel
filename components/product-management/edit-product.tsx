import React, { useEffect, useState, ChangeEvent } from "react";
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
import { ErrorMessage, Field, FieldArray, Form, Formik, FormikHelpers, FormikErrors, FormikTouched } from "formik";
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
	category_name?: string;
}

interface ProductCategory {
	id: number;
	category_name: string;
}

interface ProductVariant {
	variant_name: string;
	variant_value: string;
}

interface VendorApproval {
	id: number;
	name?: string;
}

interface ProductDetailsData {
	id: number;
	name: string;
	description?: string;
	status: number;
	added_by?: number;
	vendor?: number;
	vendor_approved_by?: VendorApproval[] | string;
	product_categories?: ProductCategory[];
	product_variants?: ProductVariant[];
	created_at?: string;
	updated_at?: string;
}

interface Variation {
	attribute: string;
	attributeValue: string;
}

interface FormValues {
	name: string;
	categories: ProductCategory[] | ProductCategory[][];
	approved_id: number[];
	variations: Variation[];
}

interface UpdatePayload {
	name: string;
	status: string;
	categories: number[];
	approved_id: number[] | string;
	variations?: Variation[];
}

const EditProduct: React.FC = () => {
	const [catloading, setcatloading] = useState<boolean>(false);
	const [categories, setCategories] = useState<SelectOption[][]>([]);
	const [selectedValues, setSelectedValues] = useState<(SelectOption | null)[]>([]);
	const [groupedCategories, setgroupedCategories] = useState<Map<number, SelectOption[]>>(new Map());
	const [categoryData, setCategoryData] = useState<SelectOption[]>([]);
	const [mainLoading, setMainLoading] = useState<boolean>(false);
	const [productDetailsData, setProductDetailsData] = useState<ProductDetailsData | null>(null);
	const [variantData, setVariantData] = useState<Variation[]>([]);
	const [isEditable, setIsEditable] = useState<boolean>(true);
	const [vendorApprovalChanged, setVendorApprovalChanged] = useState<boolean>(false);
	const router: NextRouter = useRouter();
	const { id } = router.query;

	useEffect(() => {
		if (id) {
			getCategories();
			getProductDetails();
		}
	}, [id]);

	useEffect(() => {
		if (categoryData.length > 0 && groupedCategories) {
			const updatedSelectedValues = categoryData.map((item) => item || null);
			setSelectedValues(updatedSelectedValues);

			const initializedCategories: SelectOption[][] = [];

			updatedSelectedValues.forEach((selectedOption, index) => {
				const parentId = index === 0 ? 0 : updatedSelectedValues[index - 1]?.value;
				const currentOptions = parentId !== undefined ? groupedCategories.get(parentId) || [] : [];

				if (currentOptions.length > 0)
					initializedCategories[index] = currentOptions;
			});
			setCategories(initializedCategories);
		}
	}, [categoryData, groupedCategories]);

	const customSelectStyles: StylesConfig<SelectOption, false> = {
		control: (base) => ({
			...base,
			height: 50,
			minHeight: 50
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

	const getProductDetails = async (): Promise<void> => {
		try {
			const response = await getProducts(id as string);
			const { data } = response as { data: ProductDetailsData };

			setIsEditable(true);
			setProductDetailsData(data);

			const category: SelectOption[] = data.product_categories?.map((item: ProductCategory) => ({
				label: item.category_name,
				value: item.id,
			})) || [];
			setCategoryData(category);

			const variant: Variation[] = data.product_variants?.map(({ variant_name, variant_value }: ProductVariant) => ({
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

	const initialValues: FormValues = {
		name: productDetailsData?.name || "",
		categories: productDetailsData?.product_categories
			? [productDetailsData.product_categories]
			: [],
		approved_id: productDetailsData?.vendor_approved_by && Array.isArray(productDetailsData.vendor_approved_by) && productDetailsData.vendor_approved_by.length > 0
			? productDetailsData.vendor_approved_by.map((vendor: VendorApproval) => vendor.id)
			: [],
		variations: variantData.length
			? [...variantData]
			: [{ attribute: "", attributeValue: "" }],
	};

	const submitHandler = (values: FormValues): void => {
		try {
			let payload: UpdatePayload;

			if (!isEditable) {
				payload = {
					name: productDetailsData?.name || '',
					status: '1',
					categories: productDetailsData?.product_categories?.map((cat: ProductCategory) => cat.id) || [],
					approved_id: values.approved_id?.length > 0 ? values.approved_id : [],
				};
			} else {
				const categoriesArr = selectedValues
					.filter((cat): cat is SelectOption => cat !== null)
					.map(cat => cat.value);

				if (categoriesArr.length === 0) {
					throw new Error('At least one category is required');
				}

				payload = {
					name: values.name,
					status: '1',
					categories: categoriesArr,
					approved_id: '',
				};
			}

			setMainLoading(true);
			handleUpdateProduct(payload, id as string)
				.then((res: any) => {
					toast.success(res.message);
					getProducts(id as string).then((response: any) => {
						const { data } = response;
						setProductDetailsData(data);
						setMainLoading(false);
						setVendorApprovalChanged(false);
						toast.info("Product updated successfully. You can continue editing or go back to the product list.");
					}).catch((error: any) => {
						console.error("Failed to refresh product details:", error);
						setMainLoading(false);
					});
				})
				.catch((error: any) => {
					console.error('Error updating product:', error);
					const errorMessage = error.response?.data?.message ||
						error.response?.data?.error ||
						error.message ||
						"Failed to update product. Please try again.";

					toast.error(errorMessage);
					setMainLoading(false);
				});
		} catch (error: any) {
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
												onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
													if (!isEditable) {
														if (!vendorApprovalChanged) {
															toast.info("No changes made to vendor approvals");
															return;
														}

														const originalApprovals = productDetailsData?.vendor_approved_by && Array.isArray(productDetailsData.vendor_approved_by)
															? productDetailsData.vendor_approved_by.map((vendor: VendorApproval) => vendor.id)
															: [];
														const currentApprovals = values.approved_id || [];

														const hasChanges =
															originalApprovals.length !== currentApprovals.length ||
															originalApprovals.some((id: number) => !currentApprovals.includes(id)) ||
															currentApprovals.some((id: number) => !originalApprovals.includes(id));

														if (!hasChanges) {
															toast.info("No changes detected in vendor approvals");
															return;
														}

														submitHandler({
															...values,
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
												}: {
													errors: FormikErrors<FormValues>;
													touched: FormikTouched<FormValues>;
													values: FormValues;
													handleChange: (e: ChangeEvent<any>) => void;
													setFieldValue: (field: string, value: any) => void;
												}) => {
													useEffect(() => {
														if (productDetailsData?.vendor_approved_by) {
															let approvedIds: number[] = [];

															if (Array.isArray(productDetailsData.vendor_approved_by)) {
																approvedIds = productDetailsData.vendor_approved_by.map((vendor: VendorApproval | number) =>
																	typeof vendor === 'object' ? vendor.id : vendor
																);
															} else if (typeof productDetailsData.vendor_approved_by === 'string') {
																approvedIds = productDetailsData.vendor_approved_by.split(',').map((id: string) => parseInt(id.trim()));
															}

															approvedIds = approvedIds.filter((id: number) => id !== undefined && id !== null);

															if (approvedIds.length > 0 && JSON.stringify(approvedIds) !== JSON.stringify(values.approved_id)) {
																setFieldValue('approved_id', approvedIds);
															}
														}
													}, [productDetailsData, setFieldValue]);

													return (
														<Form>
															{productDetailsData &&
																Object.keys(productDetailsData).length !== 0 && (
																	<div className="row add-product">
																		<div className="col-md-12">
																			<div className="form-group">
																				<FormikField
																					label="Product Name"
																					isRequired={true}
																					name="name"
																					touched={touched as any}
																					errors={errors as any}
																					disabled={!isEditable}
																				/>
																			</div>
																		</div>

																		{!catloading && categories?.length > 0 &&
																			<>
																				<div className="form-group mb-0">
																					<label htmlFor="categories">Categories *</label>
																					{touched.categories && errors.categories && (
																						<div className="text-danger">{String(errors.categories)}</div>
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
																								onChange={(selectedOption: SingleValue<SelectOption>) => {
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
