import React, { useState } from "react";
import FileManagement from "./components/FileManagement/FileManagement";

export default function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ display: "flex", justifyContent: "center" }}>
        Document Extension
      </h1>
      <FileManagement />
    </div>
  );
}
