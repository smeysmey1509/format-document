import React, { useState } from "react";
import TiptapEditor from "../TiptapEditor/TiptapEditor";
import "./FileManagement.css";
import axios from "axios";

const FileManagement: React.FC = () => {
  const [fileCreated, setFileCreated] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState<any>(null);

  console.log("fileName", fileName);

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

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const fileContent = e.target?.result as string;

        // Attempt to parse the file content as JSON
        try {
          const parsedContent = JSON.parse(fileContent);
          setFileContent(parsedContent);
          setFileCreated(true);
          console.log("File opened successfully as JSON");
        } catch {
          // If JSON parsing fails, assume the file is encrypted and proceed to decrypt
          console.warn(
            "File appears to be encrypted. Sending for decryption..."
          );

          const fileName = file.name; // Use the file name from the input
          try {
            const response = await axios.post(
              "http://localhost:3005/api/decryptFile",
              {
                fileName: fileName.replace(".scl", ""),
              }
            );

            if (response.status === 200) {
              const decryptedContent = response.data.content;

              try {
                const parsedDecryptedContent = JSON.parse(decryptedContent);
                setFileContent(parsedDecryptedContent);
                setFileCreated(true);
                console.log("Decrypted content loaded successfully");
              } catch (parseError) {
                console.error(
                  "Failed to parse decrypted content as JSON:",
                  parseError
                );
              }
            } else {
              console.error(
                `Failed to decrypt file. Status: ${response.statusText}`
              );
            }
          } catch (decryptionError) {
            console.error(
              "Error sending file for decryption:",
              decryptionError
            );
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
