// Attachment Section Component
import * as React from "react";

interface Attachment {
  id: number | string;
  file_name: string;
  file_path: string;
}

interface FileAttachmentsProps {
  attachments?: Attachment[];
}

const getFileIcon = (filename?: string): { icon: string; color: string } => {
  const ext = filename?.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return { icon: "fa-file-pdf-o", color: "#dc3545" };
    case "doc":
    case "docx":
      return { icon: "fa-file-word-o", color: "#2b579a" };
    case "xls":
    case "xlsx":
      return { icon: "fa-file-excel-o", color: "#1d6f42" };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return { icon: "fa-file-image-o", color: "#17a2b8" };
    default:
      return { icon: "fa-file-o", color: "#6c757d" };
  }
};

export const FileAttachments: React.FC<FileAttachmentsProps> = ({
  attachments,
}) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-3">
      <label className="text-uppercase small fw-semibold text-muted mb-2 d-block">
        <i className="fa fa-paperclip me-1"></i>
        Attachments ({attachments.length})
      </label>
      <div className="d-flex flex-wrap gap-2">
        {attachments.map((file) => {
          const { icon, color } = getFileIcon(file.file_name);
          return (
            <a
              key={file.id}
              href={file.file_path}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="d-flex align-items-center gap-2 bg-white border rounded px-2 py-1 text-decoration-none text-dark small"
              style={{ maxWidth: "200px" }}
              title={file.file_name}
            >
              <i
                className={`fa ${icon}`}
                style={{ color, fontSize: "16px" }}
              ></i>
              <span className="text-truncate" style={{ maxWidth: "120px" }}>
                {file.file_name}
              </span>
              <i
                className="fa fa-download text-muted"
                style={{ fontSize: "12px" }}
              ></i>
            </a>
          );
        })}
      </div>
    </div>
  );
};
