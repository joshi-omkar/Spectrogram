import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

const Heatmap = ({ audioData, setAudioData }) => {
  let count = 0;
  const [yRange, setYRange] = useState([0, 5]);
  const [currDuration, setCurrDuration] = useState(count);
  const duration = 20;

  // const fetchAudioData = () => {
  //   const newData = [];
  //   for (let y = 0; y < 50; y++) {
  //     for (let x = 0; x < 512; x++) {
  //       const z = Math.random() * (x + y);
  //       newData.push({ x, y, z });
  //     }
  //   }
  //   setAudioData(newData);
  // };

  const yRangeStart = Math.floor(audioData[0]?.y || 0);
  const yRangeEnd = yRangeStart + 5;

  const data = [
    {
      x: audioData.freqs,
      y: audioData.times,
      z: audioData.stft,
      type: "heatmap",
      colorscale: [
        [0, "#000000"], //# Define the lowest value color (black)
        [0.1, "#000080"], // # Define a darker color for small values
        [0.3, "#008000"], //# Define a color for values around 0.3
        [0.5, "#00FF00"], // # Define a middle color for intermediate values
        [0.7, "#FFFF00"], // # Define a color for values around 0.7
        [0.9, "#FFA500"], // # Define a brighter color for larger values
        [1, "#FF0000"], // # Define the highest value color (red)
      ],
    },
  ];
  const layout = {
    title: "Audio Heatmap",
    xaxis: {
      title: "Frequency",
    },
    yaxis: {
      title: "Duration of Audio",
      range: yRange,
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      count++;
      setCurrDuration(count);
      if (count > 5)
        setYRange((prevRange) => [prevRange[0] + 1, prevRange[1] + 1]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  console.log(count);

  return (
    <div>
      <h3>Audio</h3>
      <p>{currDuration}</p>
      <Plot data={data} layout={layout} />
    </div>
  );
};

export default Heatmap;
