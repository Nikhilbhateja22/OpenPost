import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function Quill() {

    const module = {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          [{ "code-block": true }],
          ["clean"],
        ],
      };
      const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "link",
        "image",
        "code-block",
      ];
    
      return (
        <ReactQuill
              modules={module}
              formats={formats}
              theme="snow"
              placeholder="Write something..."
              className="h-72 mb-12"
              required
        />
      );
}
