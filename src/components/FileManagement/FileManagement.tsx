import React, { useState } from "react";
import TiptapEditor from "../TiptapEditor/TiptapEditor";
import "./FileManagement.css";
import axios from "axios";

const FileManagement: React.FC = () => {
  const [fileCreated, setFileCreated] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState<any>(null);

  const createFile = async () => {
    setFileCreated(true);

    try {
      // Make a POST request to the backend API
      const response = await axios.post(
        "http://localhost:3005/api/createFile",
        {
          fileName: fileName,
        }
      );

      if (response.status === 200) {
        console.log(response.data.message);
      } else {
        console.error("Failed to create file");
      }
    } catch (error) {
      console.error("Error creating file:", error);
    }
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
        {!fileCreated ? (
          <div
            className="scl--filename"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              onChange={(e) => setFileName(e.target.value)}
              className="form-input"
              required
            />
            <button onClick={createFile}>Create File</button>
          </div>
        ) : (
          <h4>{fileName}</h4>
        )}
        <input type="file" style={{display: fileCreated ? "none" : 'block'}} onChange={openFile} placeholder="Open File" />
      </div>
      {fileCreated && <TiptapEditor fileContent={fileContent} fileName={fileName} />}
    </>
  );
};

export default FileManagement;
