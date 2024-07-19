import { Editor } from "@tinymce/tinymce-react";
import { useRef, useState } from "react";
export default function TextEditor({ content, setContent }) {
	const editorRef = useRef(null);

	const onEditorInputChange = (newValue, editor) => {
		setContent(newValue);
	};

	return (
		<>
			<Editor
				apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
				onEditorChange={(newValue, editor) =>
					onEditorInputChange(newValue, editor)
				}
				onInit={(evt, editor) => editor.getContent({ format: "text" })}
				value={content}
				initialValue={""}
				init={{
					height: 500,
					menubar: false,
					plugins: [
						"advlist",
						"autolink",
						"lists",
						"link",
						"image",
						"charmap",
						"preview",
						"anchor",
						"searchreplace",
						"visualblocks",
						"code",
						"fullscreen",
						"insertdatetime",
						"media",
						"table",
						"code",
						"help",
						"wordcount",
					  ],
					toolbar:
					"undo redo | blocks | " +
					"bold italic forecolor | alignleft aligncenter " +
					"alignright alignjustify | bullist numlist outdent indent | " + "code"+
					"removeformat | help",
					menubar: 'tools'
				}}
			/>
		</>
	);
}
