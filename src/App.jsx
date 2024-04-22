import "./App.css";
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
      ]);
    };
    const startWebcam = async () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          webcamRef.current.srcObject = stream;
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const getLabeledFaceDescriptions = async () => {
      const labels = ["Edgar", "Messi"];
      return Promise.all(
        labels.map(async (label) => {
          const descriptions = [];
          for (let i = 0; i <= 1; i++) {
            const img = await faceapi.fetchImage(`./labels/${label}/${i}.jpg`);
            const detections = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();
            descriptions.push(detections.descriptor);
          }
          return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
      );
    };

    const startRecognition = async () => {
      const video = webcamRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: 640, height: 480 };

      video.addEventListener("play", async() => {
        const labeledFaceDescriptors = await getLabeledFaceDescriptions();
        console.log(labeledFaceDescriptors)
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

        setInterval(async () => {
            console.log(displaySize)
          const detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const results = resizedDetections.map((d) =>
            faceMatcher.findBestMatch(d.descriptor)
          );
          results.forEach((result, i) => {
            const { detection } = resizedDetections[i];
            const drawBox = new faceapi.draw.DrawBox(detection.box, {
              label: result.toString(),
            });
            drawBox.draw(canvas);
          });
        }, 100);
                
      })
    };
            

    loadModels().then(() => {
      startWebcam().then(() => {
        startRecognition();
      });
    });
  }, []);

  return (
    <div className="App">
      {/* <Webcam
        ref={webcamRef}
        muted={true}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      /> */}
      <video style={{
        position:"absolute",
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }} autoPlay ref={webcamRef}></video>

      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          position: "absolute",
        }}
      />
    </div>
  );
}

export default App;
