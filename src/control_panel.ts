import * as ImGui from 'imgui-js';
import {ImVec2} from 'imgui-js';
import {ImGuiWindowFlags, ImGuiCond} from 'imgui-js';
import {AvailableDevices} from './message_type';
import {send_update_request} from './message_handler';

export var cpanel_state: any = {
  ports: false,
  portsListener: () => null,
  set ports(value) {
    this.portsListener(value);
    this.ports = value;
  }

  leds: false,
  ledsListener: () => null,
  set leds(value) {
    this.ledsListener(value);
    this.leds = value;
  }

  battery_info: false,
  batteryListener: () => null,
  set battery_info(value) {
    this.batteryListener(value);
    this.battery_info = value;
  }

  audio_controls: false,
  audioListener: () => null,
  set audio_controls(value) {
    this.audioListener(value);
    this.audio_controls = value;
  }

  display: false,
  displayListener: () => null,
  set display(value) {
    this.displayListener(value);
    this.display = value;
  }

  console: false
  consoleListener: () => null,
  set console(value) {
    this.consoleListener(value);
    this.console = value;
  }
};

export function display_control_panel(state: any, cpanel_state: any) {
  if (!state.ready) return;

  ImGui.SetNextWindowSize(new ImVec2(227, 196), ImGuiCond.Always);
  ImGui.Begin("Control Panel", null, ImGuiWindowFlags.NoResize);

  ImGui.Checkbox("Show ports", (_ = cpanel_state.ports) => cpanel_state.ports = _);
  ImGui.Checkbox("Show leds", (_ = cpanel_state.leds) => cpanel_state.leds = _);
  ImGui.Checkbox("Show battery info", (_ = cpanel_state.battery_info) => cpanel_state.battery_info = _)
  ImGui.Checkbox("Show audio controls", (_ = cpanel_state.audio_controls) => cpanel_state.audio_controls = _);
  ImGui.Checkbox("Show display", (_ = cpanel_state.display) => cpanel_state.display = _);
  ImGui.Checkbox("Show console", (_ = cpanel_state.console) => cpanel_state.console = _);

  ImGui.Separator();
  if (ImGui.Button("SCAN DEVICES", new ImVec2(ImGui.GetContentRegionAvail().x, 0.0))) {
    console.log("scan devices message");
  }

  ImGui.End();
}

export function reset_cpanel_state(cpanel_state: any) {
}


    send_update_request(state, AvailableDevices.BATTERY, 0, !cpanel_state.battery_info);
