import React, { useState, useEffect } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Image from '@tiptap/extension-image'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
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
    author: "Anonymous",
    created_date: new Date().toISOString().split("T")[0],
    last_modified: new Date().toISOString().split("T")[0],
    version: "1.0",
    icon: "https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg",
  });

  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    if (fileContent) {
      console.log("Loaded file content:", fileContent);
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
    extensions: [StarterKit, Document, Paragraph, Text, Image, Dropcursor],
    content: editorContent,
    editable: true,
    autofocus: true,
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
    const url = window.prompt('URL')

    if (url) {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }

  }

  useEffect(() => {
    if (editor && editorContent) {
      editor.commands.setContent(editorContent); // Insert content into the editor
    }
  }, [editorContent, editor]);

  React.useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return <p>Loading editor...</p>;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Title:
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => updateTitle(e.target.value)}
            style={{ marginLeft: "10px", marginRight: "20px" }}
          />
        </label>
        <button onClick={saveFileAsJSON} style={{ marginRight: "10px" }}>
          Save Files
        </button>
      </div>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "10px",
        }}
      >
        <div className="toolbar">
          {/* Add a button for image insertion */}
          <button onClick={addImage}>Insert Image</button>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
          >
            Strike
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
          >
            Code
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
