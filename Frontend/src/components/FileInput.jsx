import React, { useState } from "react";
import axios from "axios";
import Heatmap from "./Histogram";

const UploadFile = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioData, setAudioData] = useState([]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
      mode: "cors",
    })
      .then((res) => res.json())
      .then((data) => setAudioData(data));
  };

  console.log(audioData);

  return (
    <div>
      <input type="file" accept=".wav" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {audioData.length === 0 ? (
        ""
      ) : (
        <Heatmap audioData={audioData} setAudioData={setAudioData} />
      )}
    </div>
  );
};

export default UploadFile;
