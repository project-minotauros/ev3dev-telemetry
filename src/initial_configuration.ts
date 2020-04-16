import * as ImGui from 'imgui-js';
import {IM_ARRAYSIZE, ImStringBuffer, ImGuiWindowFlags} from 'imgui-js';
import {Static, STATIC} from './imgui_helpers'

let error: boolean = false;
let error_text: string = "";
let connecting: boolean = false;

export function initialize_popup(state: any, socket: any) {
  if (!(state.ready)) ImGui.OpenPopup("Enter ev3 address");
  if (ImGui.BeginPopupModal("Enter ev3 address", null, ImGuiWindowFlags.NoResize | ImGuiWindowFlags.NoMove)) {
    if (connecting && !error) {
      ImGui.Text("Connecting... Please wait...");
    } else {
      if (state.ready) ImGui.CloseCurrentPopup();
      const ev3_address: Static<ImStringBuffer> = STATIC("ev3_address", new ImStringBuffer(32, "ev3dev"));
      ImGui.Text("Please enter the local address of your ev3 brick...");
      ImGui.InputText("ev3 address", ev3_address.value, IM_ARRAYSIZE(ev3_address.value));
      if (ImGui.Button("Connect"))
        connect(socket, ev3_address.value.buffer, state);
      if (error)
        ImGui.Text("[Error while connecting]: " + error_text);
      ImGui.EndPopup();
    }
  }
}

function connect(socket: any, ev3_address: string, state: any) {
  connecting = true;
  socket = new WebSocket(`ws://${ev3_address}:4567`);
  socket.onerror = (event: any) => {
    error_text = event.toString();
    error = true;
  };
  socket.onclose = (event: any) => {
    state.ready = false;
  };
  socket.onopen = (event: any) => {
    state.ready = true;
    error = false;
    error_text = "";
    connecting = false;
  }
}
