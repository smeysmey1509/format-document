import React, { useState, useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import "./TiptapEditor.css";

interface TiptapEditorProps {
  title?: string;
  onTitleChage?: (title: string) => void;
  fileContent?: any;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  title,
  onTitleChage,
  fileContent,
}) => {
  const [metadata, setMetadata] = useState({
    title: title || "Untitled Document",
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

  const updateTitle = (title: string) => {
    setMetadata({ ...metadata, title });
    if (onTitleChage) {
      onTitleChage(title);
    }
  };

  const saveFileAsJSON = () => {
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
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${metadata.title}.scl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.warn("Editor instance is not ready.");
    }
  };

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: editorContent,
    editable: true,
    // autofocus: true,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node) &&
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target as Node)
      ) {
        setToolbarPosition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!editor) {
    return <p>Loading editor...</p>;
  }

  return (
    <div style={{ marginTop: "20px" }} ref={editorContainerRef}>
      <div
        style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}
      >
        <label className="form-label">Title:</label>
        <input
          type="text"
          value={metadata.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="form-input"
        />
        <button onClick={saveFileAsJSON} className="form-button">
          Save File
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
