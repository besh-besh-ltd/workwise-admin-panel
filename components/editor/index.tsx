import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";
import type { Editor as TinyMCEEditor } from "tinymce";

interface TextEditorProps {
  content: string;
  setContent: (content: string) => void;
}

export default function TextEditor({ content, setContent }: TextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const onEditorInputChange = (newValue: string, editor: TinyMCEEditor) => {
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
          menubar: "tools",
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
            "alignright alignjustify | bullist numlist outdent indent | " + "code" +
            "removeformat | help",
        }}
      />
    </>
  );
}
