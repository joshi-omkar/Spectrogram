import React, { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { string } from "../assets/ColorString";
import { vertexShader, fragmentShader } from "./Shader";
import audio from "../assets/2.wav";

export const Home1 = () => {
  const canvasID = "myThreeJsCanvas";
  let scene, camera, controls, renderer, analyser, dataArray, heights;

  const frequency_samples = 512;
  const time_samples = 300;
  const n_vertices = (frequency_samples + 1) * (time_samples + 1);
  const xsegments = time_samples;
  const ysegments = frequency_samples;
  const xsize = 55;
  const ysize = 35;
  const xhalfSize = xsize / 2;
  const yhalfSize = ysize / 2;
  const xsegmentSize = xsize / xsegments;
  const ysegmentSize = ysize / ysegments;

  const lut = [];
  for (let n = 0; n < 256; n++) {
    lut.push(
      new THREE.Vector3(
        (string[n][0] * 255 - 49) / 206,
        (string[n][1] * 255 - 19) / 236,
        (string[n][2] * 255 - 50) / 190
      )
    );
  }

  const initScene = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.set(0, 10, 0); // Set position like this
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.position.z = 34;

    // const box = getBox(1, 1, 1);

    const canvas = document.getElementById(canvasID);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    // scene.add(box)
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    // ambientLight.castShadow = false;
    // scene.add(ambientLight);

    // const spotLight = new THREE.SpotLight(0xffffff, 0.55);
    // spotLight.castShadow = true;
    // spotLight.position.set(0, 80, 10);
    // scene.add(spotLight);

    window.addEventListener("resize", onWindowResize, false);
  };

  const setupAudioContext = () => {
    const audioContext = new window.AudioContext();
    const audioElement = document.getElementById("myAudio");
    const source = audioContext.createMediaElementSource(audioElement);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  };

  const play = () => {
    if (!analyser) {
      setupAudioContext();
    }

    const uniforms = {
      vLut: { type: "v3v", value: lut },
    };

    let geometry = new THREE.BufferGeometry();
    let indices = [];
    heights = [];
    let vertices = [];

    for (let i = 0; i <= xsegments; i++) {
      let x = i * xsegmentSize - xhalfSize;
      for (let j = 0; j <= ysegments; j++) {
        let y = j * ysegmentSize - yhalfSize;
        vertices.push(x, y, 0);
        heights.push(0);
      }
    }
    heights = new Uint8Array(heights);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    for (let i = 0; i < xsegments; i++) {
      for (let j = 0; j < ysegments; j++) {
        let a = i * (ysegments + 1) + (j + 1);
        let b = i * (ysegments + 1) + j;
        let c = (i + 1) * (ysegments + 1) + j;
        let d = (i + 1) * (ysegments + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
    geometry.setIndex(indices);
    geometry.setAttribute(
      "displacement",
      new THREE.Uint8BufferAttribute(heights, 1)
    );
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
    });
    const planeMesh = new THREE.Mesh(geometry, material);
    planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    planeMesh.scale.x = 1;
    planeMesh.scale.y = 1;
    planeMesh.scale.z = 1;
    planeMesh.position.y = 4;
    scene.add(planeMesh);

    planeMesh.geometry.computeVertexNormals();
    // planeMesh.geometry.computeFaceNormals();

    const animate = () => {
      requestAnimationFrame(animate);
    };

    const render = (time) => {
      update_geometry();
      // analyser.getByteFrequencyData(dataArray);
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    const update_geometry = () => {
      // crypto.getRandomValues(dataArray);
      analyser.getByteFrequencyData(dataArray);
      let start_val = frequency_samples + 1;
      let end_val = n_vertices - start_val;
      heights.copyWithin(0, start_val, n_vertices + 1);
      heights.set(dataArray, end_val - start_val);
      planeMesh.geometry.setAttribute(
        "displacement",
        new THREE.Uint8BufferAttribute(heights, 1)
      );
    };

    render();
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  useEffect(() => {
    initScene();
    play();
  }, []);

  return (
    <div>
      <div>
        <audio id="myAudio" src={audio} className="w-80" controls autoPlay />
      </div>
      <canvas
        width={1000}
        style={{ overflow: "hidden", width: "1000px" }}
        id={canvasID}
      ></canvas>
    </div>
  );
};
