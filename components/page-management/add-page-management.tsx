import {
	handleAddSection,
	handleGetPageList,
} from "@/utils/services/page-management";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import TextEditor from "../editor";
import Link from "next/link";

interface PageDataItem {
	id: number;
	name: string;
}

interface FormValues {
	page_id: string;
	section_name: string;
	content: string;
}

const AddPageManagementComponent: React.FC = () => {
	const [pageData, setPageData] = useState<PageDataItem[]>([]);
	const router = useRouter();
	const getPageLists = (): void => {
		handleGetPageList()
			.then((res: { data: PageDataItem[] }) => {
				setPageData(res.data);
			})
			.catch((err: unknown) => console.log("err", err));
	};

	const initialValues: FormValues = {
		page_id: "",
		section_name: "",
		content: "",
	};

	const validationSchema = yup.object().shape({
		page_id: yup.string().required("Page is required"),
		section_name: yup.string().required("Section is required"),
		content: yup.string().required("Content is required"),
	});

	const submitHandler = (values: FormValues, resetForm: () => void): void => {
		handleAddSection(values)
			.then((res: { message: string }) => {
				resetForm();
				toast(res.message);
				setTimeout(() => {
					router.push("/page-management");
				}, 1000);
			})
			.catch((err: unknown) => console.log("err", err));
	};
	useEffect(() => {
		getPageLists();
	}, []);

	return (
		<>
			<div className="content-header">
				<div className="container-fluid">
					<div className="row mb-2">
						<h1 className="m-0 text-dark">Add Section</h1>
					</div>
				</div>
			</div>

			<section className="content">
				<div className="container-fluid">
					{/* <div className="col-12 mb-3">
						<ol className="breadcrumb float-sm-left">
							<h5 className="heading-container">Add Section</h5>
						</ol>
					</div> */}
					<div className="text-left pb-4">
					<Link className="btn btn-primary" href="/page-management">
						<span className="fa fa-angle-left mr-2"></span>Go Back
					</Link>
					</div>
					<div className="card col-12">
						<div className="card-body mt-3">
							<Formik
								enableReinitialize={true}
								initialValues={initialValues}
								validationSchema={validationSchema}
								onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
									submitHandler(values, resetForm);
								}}
							>
								{({ errors, touched, values, handleChange, setFieldValue }) => (
									<Form>
										<div className="row mb-4">
											<div className="col">
												<label htmlFor="Organization-Address">Page</label>
												<Field
													as="select"
													name="page_id"
													className="form-control"
													placeholder="Page"
												>
													<option key="01" value="" disabled>
														Select Page
													</option>
													{pageData?.map((item, index) => {
														return (
															<option key={index} value={item.id}>
																{item.name}
															</option>
														);
													})}
												</Field>
												<ErrorMessage
													name="page_id"
													render={(msg: string) => (
														<div className="form-error">{msg}</div>
													)}
												/>
											</div>
											<div className="col">
												<label htmlFor="Section">Section</label>
												<Field
													type="text"
													name="section_name"
													className="form-control"
													placeholder="Section"
												/>
												<ErrorMessage
													name="section_name"
													render={(msg: string) => (
														<div className="form-error">{msg}</div>
													)}
												/>
											</div>
										</div>
										<div className="row mb-4">
											<div className="col">
												<label htmlFor="Organization-Address">Content</label>
												<TextEditor
													content={values.content}
													setContent={(value: string) => {
														setFieldValue("content", value);
													}}
												/>

												<ErrorMessage
													name="content"
													render={(msg: string) => (
														<div className="form-error">{msg}</div>
													)}
												/>
											</div>
										</div>
										<div className="d-flex justify-content-end">
											<button type="submit" className="btn btn-secondary">
												Save
											</button>
										</div>
									</Form>
								)}
							</Formik>
						</div>
					</div>
				</div>
				<ToastContainer />
			</section>
		</>
	);
};

export default AddPageManagementComponent;
