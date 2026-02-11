import React, { useState, useEffect } from "react";
import { FormikTouched, FormikErrors } from "formik";

interface FilePreview {
	file: string;
	type: string;
}

interface ViewFile {
	file_path: string;
}

interface UploadFilesProps {
	noLabel?: string;
	accept: string[];
	upload: (files: File[]) => void;
	reset?: boolean;
	preview?: ViewFile[];
	label?: string;
	feature?: string;
	gallery?: FilePreview[];
	isMultiple?: boolean;
	touched?: FormikTouched<Record<string, unknown>>;
	errors?: FormikErrors<Record<string, unknown>>;
}

const UploadFiles: React.FC<UploadFilesProps> = ({
	noLabel,
	accept,
	upload,
	reset,
	preview,
	label,
	feature,
	gallery,
	isMultiple = true,
}) => {
	const [uid, setUid] = useState<string>();
	const [selectedFiles, setSelectedFiles] = useState<File[] | undefined>(undefined);
	const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
	const [progressInfos, setProgressInfos] = useState<number>(0);
	const [viewFiles, setViewFiles] = useState<ViewFile[]>([]);

	useEffect(() => {
		setUid(Date.now() + (Math.random() * 100000).toFixed());
	}, []);

	useEffect(() => {
		if (reset) {
			setSelectedFiles(undefined);
			setFilePreviews([]);
			upload([]);
		}
	}, [reset]);

	useEffect(() => {
		setSelectedFiles([]);
		setFilePreviews(gallery || []);
	}, [gallery]);

	useEffect(() => {
		if (preview) {
			setSelectedFiles([]);
			setViewFiles(preview);
		}
	}, [preview]);

	const selectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log("event==>>>>", event);
		const files: FilePreview[] = [];

		console.log(files);
		const inputFiles = event.target.files;
		if (!inputFiles) return;

		for (let i = 0; i < inputFiles.length; i++) {
			files.push({
				file: URL.createObjectURL(inputFiles[i]),
				type: inputFiles[i].type,
			});
		}
		upload(Array.from(inputFiles));
		setSelectedFiles(Array.from(inputFiles));
		console.log(files);
		setFilePreviews(files);
	};

	const handleRemoveFile = (index: number) => {
		console.log(index);
		if (selectedFiles) {
			upload(selectedFiles.filter((_, i) => i !== index));
			setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
		}
		setFilePreviews(filePreviews.filter((_, i) => i !== index));
	};

	return (
		<>
			<div className="col-md-12">
				<div className="form-group">
					{noLabel != "true" ? (
						<label htmlFor="">{label ? label : "Upload files"}</label>
					) : (
						""
					)}
					{isMultiple == true ? (
						<input
							type="file"
							data-multiple-caption="{count} files selected"
							className="file-control"
							multiple
							onChange={selectFiles}
							id={`file_upload${uid}`}
							accept={accept.toString()}
						/>
					) : (
						<input
							type="file"
							data-multiple-caption="{count} files selected"
							className="file-control"
							onChange={selectFiles}
							id={`file_upload${uid}`}
							accept={accept.toString()}
						/>
					)}
				</div>
				{progressInfos > 0 && (
					<div className="progress mb-3">
						<div
							className="progress-bar progress-bar-striped bg-success progress-bar-animated"
							role="progressbar"
							style={{ width: `${progressInfos}%` }}
							aria-valuenow={progressInfos}
							aria-valuemin={0}
							aria-valuemax={100}
						></div>
					</div>
				)}
			</div>
			<div className="image-panel">
				{filePreviews &&
					filePreviews.map((img, i) => {
						return (
							<div
								className="doc-thumb"
								key={i}
								onClick={() => {
									handleRemoveFile(i);
								}}
							>
								{img.type !== "application/pdf" && (
									<img
										className="preview"
										src={img.file}
										alt={"file-" + i}
										width={80}
									/>
								)}
							</div>
						);
					})}
				{viewFiles &&
					viewFiles.map((item, i) => {
						return (
							<div className="doc-thumb hide-close" key={i}>
								<img
									className="preview"
									src={item.file_path}
									alt={"file-" + i}
									width={80}
								/>
							</div>
						);
					})}
			</div>
		</>
	);
};

export default UploadFiles;
