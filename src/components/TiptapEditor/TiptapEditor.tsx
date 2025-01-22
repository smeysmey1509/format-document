import React, { useState, useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import "./TiptapEditor.css";
import axios from "axios";

interface TiptapEditorProps {
  fileContent?: any;
  fileName?: string;
}

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  fileContent,
  fileName,
}) => {
  const [fileNameState, setFileNameState] = useState(fileName || "");
  const [metadata, setMetadata] = useState({
    doc_id: 123,
    title: fileNameState || "Untitled Document",
    author: "Raksmey",
    created_date: new Date().toISOString().split("T")[0],
    last_modified: new Date().toISOString().split("T")[0],
    version: "1.0",
    icon: "https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg",
  });
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [editorContent, setEditorContent] = useState("");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileContent) {
      const { metadata: fileMetadata, content } = fileContent;
      setMetadata({
        ...metadata,
        title: fileMetadata?.title || "Untitled Document",
        author: fileMetadata?.author || "Anonymous",
        last_modified:
          fileMetadata?.last_modified || new Date().toISOString().split("T")[0],
      });
      setEditorContent(content);
    }
  }, [fileContent]);

  const saveContentToFile = async () => {
    if (editor) {
      const jsonContent = editor.getJSON();
      const structuredJSON = {
        metadata: {
          ...metadata,
          last_modified: new Date().toISOString().split("T")[0],
        },
        content: jsonContent,
      };
      const jsonString = JSON.stringify(structuredJSON, null, 2);

      // Ensure fileNameState does not include `.scl`
      const sanitizedFileName = fileNameState.replace(/\.scl$/, "");

      try {
        const response = await axios.post(
          "http://localhost:3005/api/writeFile",
          {
            fileName: sanitizedFileName,
            content: jsonString,
          }
        );

        if (response.status === 200) {
          console.log(response.data.message);
        } else {
          console.error("Failed to save file");
        }
      } catch (error) {
        console.error("Error saving file:", error);
      }
    } else {
      console.warn("Editor instance is not ready.");
    }
  };

  const debouncedSaveContentToFile = debounce(saveContentToFile, 500);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: editorContent,
    editable: true,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
      debouncedSaveContentToFile();
    },
    editorProps: {
      attributes: {
        class: `text-editor__editor`,
        style: "outline: none",
      },
    },
  });

  const addImage = () => {
    const url = window.prompt("URL");

    if (url) {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const importFile = async (fileNameState: string) => {
    if (!fileNameState || fileNameState.trim() === "") {
      console.warn("File name is empty or invalid.");
      return;
    }

    try {
      // Step 1: Encrypt the file
      const encryptResponse = await axios.post(
        "http://localhost:3005/api/encryptFile",
        {
          fileName: fileNameState.replace(/\.scl$/, ""),
        }
      );

      if (encryptResponse.status === 200) {
        console.log(
          encryptResponse.data.message || "File encrypted successfully."
        );

        // Step 2: Download the encrypted file
        const downloadResponse = await axios.get(
          `http://localhost:3005/api/downloadFile/${fileNameState}`,
          {
            responseType: "blob", // Treat the response as a binary blob
          }
        );

        // Step 3: Create a Blob URL for the file
        const url = window.URL.createObjectURL(
          new Blob([downloadResponse.data])
        );
        const link = document.createElement("a");
        link.href = url;

        // Step 4: Set the downloaded file's name
        link.setAttribute("download", `${fileNameState}`);

        // Step 5: Append the link to the document and trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("File downloaded successfully.");
      } else {
        console.error("Failed to encrypt the file.");
      }
    } catch (error: any) {
      // Log detailed error information
      if (error.response) {
        console.error(
          `Error: ${error.response.data?.message || error.message}`
        );
      } else {
        console.error(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (editor && editorContent) {
      editor.commands.setContent(editorContent); // Insert content into the editor
    }
  }, [editorContent, editor]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateToolbarPosition = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setToolbarPosition(null);
        return;
      }

      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const editorBounds = editor.view.dom.getBoundingClientRect();

      const top = Math.min(start.top, end.top) - editorBounds.top - 20;
      const left = (start.left + end.left) / 2.5 - editorBounds.left;

      setToolbarPosition({ top, left });
    };

    const handleMouseUp = () => {
      updateToolbarPosition();
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editor]);

  if (!editor) {
    return <p>Loading editor...</p>;
  }

  return (
    <div style={{ marginTop: "20px" }} ref={editorContainerRef}>
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => importFile(fileNameState)}
          className="form-button"
        >
          Import File
        </button>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "10px",
        }}
      >
        <EditorContent editor={editor} />
        <div
          className="toolbar"
          ref={toolbarRef}
          style={{
            position: "absolute",
            top: toolbarPosition?.top ?? 0,
            left: toolbarPosition?.left ?? 0,
            background: "rgb(37, 37, 37)",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            padding: "8px",
            display: toolbarPosition !== null ? "flex" : "none",
            gap: "5px",
          }}
        >
          {/* Add a button for image insertion */}
          <button onClick={addImage}>Insert Image</button>
          <button onClick={() => editor.chain().toggleBold().run()}>
            Bold
          </button>
          <button onClick={() => editor.chain().toggleItalic().run()}>
            Italic
          </button>
          <button onClick={() => editor.chain().toggleStrike().run()}>
            Strike
          </button>
          <button onClick={() => editor.chain().toggleCode().run()}>
            Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
