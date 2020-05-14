import * as ImGui from 'imgui-js';
import {ImVec2} from 'imgui-js';
import {ImGuiWindowFlags, ImGuiCond} from 'imgui-js';

export function display_control_panel(state: any, cpanel_state: any) {
  if (!state.ready) return;

  ImGui.SetNextWindowSize(new ImVec2(227, 196), ImGuiCond.Always);
  ImGui.Begin("Control Panel", null, ImGuiWindowFlags.NoResize);

  if (ImGui.Checkbox("Show ports", (_ = cpanel_state.ports) => cpanel_state.ports = _))
    console.log("port!!");
  ImGui.Checkbox("Show leds", (_ = cpanel_state.leds) => cpanel_state.leds = _);
  ImGui.Checkbox("Show battery info", (_ = cpanel_state.battery_info) => cpanel_state.battery_info = _);
  ImGui.Checkbox("Show audio controls", (_ = cpanel_state.audio_controls) => cpanel_state.audio_controls = _);
  ImGui.Checkbox("Show display", (_ = cpanel_state.display) => cpanel_state.display = _);
  ImGui.Checkbox("Show console", (_ = cpanel_state.console) => cpanel_state.console = _);

  ImGui.Separator();
  if (ImGui.Button("SCAN DEVICES", new ImVec2(ImGui.GetContentRegionAvail().x, 0.0))) {
    console.log("scan devices message");
  }

  ImGui.End();
}
