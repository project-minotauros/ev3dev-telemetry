import * as three from 'three';
var SystemJS = require('systemjs');

SystemJS.config({
  map: {
    "imgui-js": "https://flyover.github.io/imgui-js"
  },
  packages: {
    "imgui-js": { main: "imgui.js" }
  }
});

let ImGui, ImGui_Impl;
Promise.resolve().then(() => {
  return SystemJS.import("imgui-js").then((module) => {
    ImGui = module;
    return ImGui.default();
  });
}).then(() => {
  return SystemJS.import("imgui-js/example/imgui_impl").then((module) => {
    ImGui_Impl = module;
  });
}).then(() => {
  const canvas = document.getElementById("viewport");
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.scrollWidth * devicePixelRatio;
  canvas.height = canvas.scrollHeight * devicePixelRatio;
  window.addEventListener("resize", () => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.scrollWidth * devicePixelRatio;
    canvas.height = canvas.scrollHeight * devicePixelRatio;
  });
});

