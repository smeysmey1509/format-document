import React, { useState } from "react";
import TiptapEditor from "../TiptapEditor/TiptapEditor";
import './FileManagement.css';

const FileManagement: React.FC = () => {
  const [fileCreated, setFileCreated] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState<any>(null);

  const createFile = () => {
    // Set a default file name
    const newFileName = "new_document.json";
    setFileName(newFileName);
    setFileCreated(true);
  };

  const openFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedContent = JSON.parse(e.target?.result as string);
          setFileContent(parsedContent);
          setFileCreated(true);
        } catch (error) {
          console.error("Error reading file", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className="one-two">
        <button onClick={createFile}>Create File</button>
        <input
          type="file"
          onChange={openFile}
          placeholder="Open File"
        />
      </div>
      {fileCreated && <TiptapEditor fileContent={fileContent} />}
    </>
  );
};

export default FileManagement;
