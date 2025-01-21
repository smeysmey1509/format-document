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

    if (!file) {
      console.warn("No file selected");
      return;
    }

    const reader = new FileReader();

    console.log("filename", file.name);

    reader.onload = async (e) => {
      try {
        // Check if the file content looks encrypted
        const fileContent = e.target?.result as string;

        // Detect non-JSON content by attempting a JSON parse
        try {
          const parsedContent = JSON.parse(fileContent);
          setFileContent(parsedContent);
          setFileCreated(true);
          console.log("File opened successfully as JSON");
        } catch {
          // If JSON parsing fails, assume the file is encrypted and send it for decryption
          console.warn(
            "File appears to be encrypted. Sending for decryption..."
          );

          try {
            const response = await axios.post(
              "http://localhost:3005/api/decryptFile",
              {
                fileName: file.name,
              }
            );

            if (response.status === 200) {
              const decryptedContent = response.data.content;

              try {
                const parsedDecryptedContent = JSON.parse(decryptedContent);
                setFileContent(parsedDecryptedContent);
                setFileCreated(true);
                console.log("Decrypted content loaded successfully");
              } catch (error) {
                console.error(
                  "Failed to parse decrypted content as JSON:",
                  error
                );
              }
            } else {
              console.error("Failed to decrypt file:", response.statusText);
            }
          } catch (error) {
            console.error("Error sending file for decryption:", error);
          }
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    };

    // Read the file content as text
    reader.readAsText(file);
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
        <input
          type="file"
          style={{ display: fileCreated ? "none" : "block" }}
          onChange={openFile}
          placeholder="Open File"
        />
      </div>
      {fileCreated && (
        <TiptapEditor fileContent={fileContent} fileName={fileName} />
      )}
    </>
  );
};

export default FileManagement;
