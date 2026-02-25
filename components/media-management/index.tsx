import React, { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import ReactPaginate from "react-paginate";
import { useRouter, NextRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import { handleGetMediaManagement } from "@/utils/services/media-management";
import axiosFormData from "@/utils/axios/form-data";
import FullLoading from "../loading/FullLoading";

interface MediaItem {
	id: number;
	file_path: string;
	new_file_name: string;
}

interface PaginateEvent {
	selected: number;
}

interface AxiosProgressEvent {
	loaded: number;
	total: number;
}

const MediaManagement: React.FC = () => {
	const [pageData, setPageData] = useState<MediaItem[]>([]);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [loading, setloading] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [id, setId] = useState<number | undefined>();
	const [uploadProgress, setuploadProgress] = useState<number>(0);
	const [enableImageUpload, setEnableImageUpload] = useState<boolean>(false);
	const [file, setFile] = useState<File | null>(null);
	const router: NextRouter = useRouter();
	const handleClose = (): void => setShowModal(false);

	const getPageLists = (): void => {
		setloading(true);
		handleGetMediaManagement(page)
			.then((res: { data: MediaItem[]; count: number }) => {
				setPageData(res.data);
				setTotalPages(res.count);
				setloading(false);
			})
			.catch((err: unknown) => console.log("err", err));
	};

	const submitDeleteSection = (): void => {
		// handleDeleteSection is commented out in original code
		// Keeping the structure for future implementation
		handleClose();
	};

	useEffect(() => {
		getPageLists();
	}, [page]);

	const handlePageClick = (e: PaginateEvent): void => {
		setPage(e.selected + 1);
	};

	const handleDeleteItem = (itemId: number): void => {
		setShowModal(true);
		setId(itemId);
	};

	const uploadToClient = (event: ChangeEvent<HTMLInputElement>): void => {
		if (event.target.files && event.target.files[0]) {
			const i = event.target.files[0];
			setFile(i);
		}
	};

	const uploadToServer = async (): Promise<void> => {
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
					onUploadProgress: (progressEvent: any) => {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						setuploadProgress(percentCompleted);
					},
				}
			)
			.then(() => {
				setloading(false);
				toast.success("Image has been uploaded successfully");
				setFile(null);
				setEnableImageUpload(false);
				getPageLists();
			})
			.catch(() => {
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
												aria-valuemin={0}
												aria-valuemax={100}
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
															</div>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{Math.ceil(totalPages / 10) > 1 && (
									<div className="d-flex flex-column align-items-center gap-2">
										<ReactPaginate
											previousLabel={<i className="fa fa-angle-left"></i>}
											nextLabel={<i className="fa fa-angle-right"></i>}
											breakLabel="..."
											pageCount={Math.ceil(totalPages / 10)}
											marginPagesDisplayed={2}
											pageRangeDisplayed={5}
											onPageChange={handlePageClick}
											forcePage={page - 1}
											containerClassName="pagination mb-0"
											pageClassName="page-item"
											pageLinkClassName="page-link"
											previousClassName="page-item"
											previousLinkClassName="page-link"
											nextClassName="page-item"
											nextLinkClassName="page-link"
											activeClassName="active"
											/>
										<div className="d-flex align-items-center gap-2 mt-2">
											<input
												type="number"
												className="form-control"
												style={{ width: "125px" }}
												placeholder="Go to page"
												min="1"
												max={Math.ceil(totalPages / 10)}
												onChange={(e: ChangeEvent<HTMLInputElement>) => {
													const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / 10), parseInt(e.target.value) || 1));
													setPage(pageNum);
												}}
											/>
											<button
												className="btn btn-primary btn-sm"
												onClick={() => {
													const input = document.querySelector('input[type="number"]') as HTMLInputElement;
													const pageNum = parseInt(input.value);
													if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 10)) {
														setPage(pageNum);
													}
												}}
											>
												Go
											</button>
										</div>
									</div>
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
