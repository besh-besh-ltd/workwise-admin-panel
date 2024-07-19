import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
// import { ToastContainer, toast } from "react-toastify";
const UploadFiles = ({
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
  const [uid, setUid] = useState();
  const [selectedFiles, setSelectedFiles] = useState(undefined);
  const [filePreviews, setFilePreviews] = useState([]);
  const [progressInfos, setProgressInfos] = useState(0);
  const [viewFiles, setViewFiles] = useState([]);

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
    setFilePreviews(gallery);
  }, [gallery]);

  useEffect(() => {
    if (preview) {
      setSelectedFiles([]);
      setViewFiles(preview);
    }
  }, [preview]);

  const selectFiles = (event) => {
    console.log("event==>>>>", event);
    let files = [];

    console.log(files);
    for (let i = 0; i < event.target.files.length; i++) {
      files.push({
        file: URL.createObjectURL(event.target.files[i]),
        type: event.target.files[i].type,
      });
    }
    upload(Array.from(event.target.files));
    setSelectedFiles(Array.from(event.target.files));
    console.log(files);
    setFilePreviews(files);
  };

  const handleRemoveFile = (index) => {
    console.log(index);
    upload(selectedFiles.filter((_, i) => i !== index));
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
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

          {/* <label htmlFor={`file_upload${uid}`} className="label-file">
						<span>Choose file</span>
					</label> */}
        </div>
        {progressInfos > 0 && (
          <div className="progress mb-3">
            <div
              className="progress-bar progress-bar-striped bg-success progress-bar-animated"
              role="progressbar"
              style={{ width: `${progressInfos}%` }}
              aria-valuenow={progressInfos}
              aria-valuemin="0"
              aria-valuemax="100"
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
                    priority="true"
                  />
                )}
                {/*  {img.type == "application/pdf" && (
                  <>
                    <a href={img.file} target="_blank">
                      <i class="fa fa-file"></i>
                    </a>
                  </>
                )} */}
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
                  priority="true"
                />
              </div>
            );
          })}
      </div>
    </>
  );
};

export default UploadFiles;
