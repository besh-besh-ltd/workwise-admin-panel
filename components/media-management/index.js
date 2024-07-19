import React, { useEffect, useState } from "react";
import Link from "next/link";
// import {
// 	handleDeleteSection,
// 	handleGetPageManagement,
// } from "@/utils/services/page-management";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import { handleGetMediaManagement } from "@/utils/services/media-management";
import axiosFormData from "@/utils/axios/form-data";
import FullLoading from "../loading/FullLoading";

const MediaManagement = () => {
	const [pageData, setPageData] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [showModal, setShowModal] = useState(false);
	const [loading, setloading] = useState(false);
	const [page, setPage] = useState(1);
	const [id, setId] = useState();
	const [uploadProgress, setuploadProgress] = useState(0);
	const [enableImageUpload, setEnableImageUpload] = useState(false);
	const [file, setFile] = useState(null);
	const router = useRouter();
	const handleClose = () => setShowModal(false);
	const getPageLists = () => {
		setloading(true);
		handleGetMediaManagement(page)
			.then((res) => {
				setPageData(res.data);
				setTotalPages(res.count);
				setloading(false);
			})
			.catch((err) => console.log("err", err));
	};

	const submitDeleteSection = () => {
		handleDeleteSection(id)
			.then((res) => {
				handleClose();
				toast(res.message);
				getPageLists();
			})
			.catch((error) => {
				let txt = "";
				for (let x in error.error.response.data.errors) {
					txt = error.error.response.data.errors[x];
				}
				toast(txt);
				handleClose();
			});
	};

	useEffect(() => {
		getPageLists();
	}, [page]);
	const handlePageClick = (e) => {
		setPage(e.selected + 1);
	};
	const handleDeleteItem = (id) => {
		setShowModal(true);
		setId(id);
	};

	const uploadToClient = (event) => {
		if (event.target.files && event.target.files[0]) {
			const i = event.target.files[0];
			setFile(i);
		}
	};

	const uploadToServer = async () => {
		if (!file) {
			toast.error("Please select a file!");
			return;
		}
		setloading(true);
		const formData = new FormData();
		formData.append("file", file);

		axiosFormData
			.post(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/media/upload-file`,
				formData,
				{
					onUploadProgress: (progressEvent) => {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						setuploadProgress(percentCompleted);
					},
				}
			)
			.then((response) => {
				setloading(false);
				toast.success("Image has been uploaded successfully");
				setFile(null);
				setEnableImageUpload(false);
				getPageLists();
			})
			.catch((error) => {
				setloading(false);
			});
	};

	return (
		<>
			<div className="content-header">
				<div className="container-fluid">
					<div className="row">
						<h1 className="m-0 text-dark">Media Management</h1>
					</div>
				</div>
			</div>

			<section className="content">
				<div className="container-fluid">
					<div className="card card-body">
						{!enableImageUpload && (
							<div className="row">
								<div className="col-md-12">
									<div className="d-flex justify-content-end">
										<button
											type="button"
											className="btn btn-primary mr-2"
											onClick={() => {
												setuploadProgress(0);
												setEnableImageUpload(!enableImageUpload);
											}}
										>
											<i className="fa fa-plus mr-2"></i> Add Media
										</button>
									</div>
								</div>
							</div>
						)}
						{enableImageUpload && (
							<div className="row">
								<div className="col-md-8">
									<div className="input-group buyers-search">
										<input
											type="file"
											className="form-control"
											name="file"
											accept="image/png, image/gif, image/jpeg"
											onChange={uploadToClient}
										/>
									</div>
									<div className="d-flex mt-4">
										<button
											type="button"
											className="btn btn-primary mr-2"
											onClick={() => uploadToServer()}
										>
											Upload Image
										</button>
										<div className="d-flex justify-content-end">
											<button
												type="button"
												className="btn btn-secondary mr-2"
												onClick={() => {
													setuploadProgress(0);
													setEnableImageUpload(false);
												}}
											>
												Cancel
											</button>
										</div>
									</div>
									{file && (
										<div className={`progress mt-4 progress-${uploadProgress}`}>
											<div
												className="progress-bar progress-bar-striped progress-bar-animated"
												role="progressbar"
												style={{ width: `${uploadProgress}%` }}
												aria-valuenow={uploadProgress}
												aria-valuemin="0"
												aria-valuemax="100"
											>{`${uploadProgress}%`}</div>
										</div>
									)}
								</div>
								<div className="col-md-4"></div>
							</div>
						)}
					</div>

					<div className="card card-body product-table mt-3">
						{loading && <FullLoading />}
						{!loading && (
							<>
								<table className="table table-striped table-hover mb-3">
									<thead>
										<tr>
											<th scope="col">Image</th>
											<th scope="col">Action</th>
										</tr>
									</thead>
									<tbody>
										{pageData.map((item) => {
											return (
												<tr key={item.id}>
													<td>
														<img
															src={item.file_path}
															alt={item.new_file_name}
															width="180"
															height="110"
														/>
													</td>
													<td>
														<div className="card-footer bg-transparent border-secondary">
															<div className="actionStyle">
																
																<span
																	className="fa fa-clone text-success"
																	data-toggle="tooltip"
																	title="Copy image link"
																	onClick={() => {

																		if (navigator.clipboard) {
																			navigator.clipboard.writeText(
																				item.file_path
																			);
																		}
																		alert(item.file_path);
																		toast("Copied to image link");
																	}}
																><span className="pl-2">Copy image link</span></span>
																{/* <span
															className="fa fa-trash"
															onClick={() => handleDeleteItem(item.id)}
														></span> */}
															</div>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{Math.ceil(totalPages / 10) > 1 && (
									<ReactPaginate
										breakLabel="..."
										nextLabel={<i className="fa fa-angle-right"></i>}
										onPageChange={handlePageClick}
										pageRangeDisplayed={2}
										pageCount={Math.ceil(totalPages / 10)}
										previousLabel={<i className="fa fa-angle-left"></i>}
										renderOnZeroPageCount={null}
										className="pagination"
									/>
								)}
							</>
						)}
						<DeleteModal
							show={showModal}
							onHide={handleClose}
							data={submitDeleteSection}
						/>
						<ToastContainer />
					</div>
				</div>
			</section>
		</>
	);
};

export default MediaManagement;
