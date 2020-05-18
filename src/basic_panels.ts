import * as ImGui from 'imgui-js';
import {ImVec2, ImVec4, ImVector, ImGuiStyleVar} from 'imgui-js';
import {IM_ARRAYSIZE, ImStringBuffer, ImGuiWindowFlags, ImGuiInputTextFlags, ImGuiCond, ImGuiCol} from 'imgui-js';
import {Static, STATIC} from './imgui_helpers';
import {send_execute_command} from './message_handler';

export function display_basic_panels(state: any, cpanel_state: any) {
  if (!state.ready) return;

  if (cpanel_state.console)
    console_panel(state, cpanel_state);

  if (cpanel_state.battery_info)
    battery_panel(state, cpanel_state);
}

var commandLine: ImStringBuffer = new ImStringBuffer(256, "");
var consoleHistory: ImVector<string> = new ImVector<string>();
var autoScroll: boolean = true;
var scrollToBottom: boolean = true;
function console_panel(state: any, cpanel_state: any) {
  if (!ImGui.Begin("Console", (v = cpanel_state.console) => cpanel_state.console = v)) {
    ImGui.End();
    return;
  }
  if (ImGui.Button("Clear")) {
    consoleHistory.clear();
    scrollToBottom = true;
  }
  ImGui.SameLine();
  if (ImGui.Button("v")) scrollToBottom = true;
  ImGui.SameLine();
  if (ImGui.Checkbox("Auto-scroll", (_ = autoScroll) => autoScroll = _))
    if (autoScroll) scrollToBottom = true;
  ImGui.Separator();

  const footer_height: number = ImGui.GetStyle().ItemSpacing.y + ImGui.GetFrameHeightWithSpacing();
  ImGui.BeginChild("consoleScrollingRegion", new ImVec2(0, -footer_height), false, ImGuiWindowFlags.HorizontalScrollbar);
  if (ImGui.BeginPopupContextWindow()) {
    if (ImGui.Selectable("Clear")) {
      consoleHistory.clear();
      scrollToBottom = true;
    }
    ImGui.EndPopup();
  }
  ImGui.PushStyleVar(ImGuiStyleVar.ItemSpacing, new ImVec2(4, 1));
  for (let i = 0; i < consoleHistory.Size; i++) {
    const item: string = consoleHistory.Data[i];
    let pop_color = false;
    if (/\[ERROR\]/.test(item)) { ImGui.PushStyleColor(ImGuiCol.Text, new ImVec4(1.0, 0.4, 0.4, 1.0)); pop_color = true; }
    if (/^# /.test(item)) { ImGui.PushStyleColor(ImGuiCol.Text, new ImVec4(1.0, 0.8, 0.6, 1.0)); pop_color = true; }
    ImGui.TextUnformatted(item);
    if (pop_color) ImGui.PopStyleColor();
  }
  if (scrollToBottom) ImGui.SetScrollHereY(1.0);
  scrollToBottom = false;
  ImGui.PopStyleVar();
  ImGui.EndChild();
  ImGui.Separator();

  let reclaim_focus: boolean = false;
  ImGui.Text("$"); ImGui.SameLine();
  if (ImGui.InputText("Command", commandLine, IM_ARRAYSIZE(commandLine), ImGuiInputTextFlags.EnterReturnsTrue)) {
    commandLine.buffer = commandLine.buffer.trim();
    if (commandLine.buffer.length > 0) {
      logToConsole("$ " + commandLine.buffer);
      send_execute_command(state, commandLine.buffer);
    }
    commandLine.buffer = "";
    reclaim_focus = true;
  }

  ImGui.SetItemDefaultFocus();
  if (reclaim_focus) ImGui.SetKeyboardFocusHere(-1);

  ImGui.End();
}

export function logToConsole(message: string, error: boolean = false) {
  if (error) message = "[ERROR] " + message;
  consoleHistory.push_back(message);
  if (autoScroll) scrollToBottom = true;
}

const current_voltages: Static<number[]> = STATIC("voltages_a", [0]);
const current_currents: Static<number[]> = STATIC("currents_a", [0]);
function battery_panel(state: any, cpanel_state: any) {
  if (!ImGui.Begin("Battery Info", (v = cpanel_state.battery_info) => cpanel_state.battery_info = v)) {
    ImGui.End();
    return;
  }

  if (state.devices.battery["current_now"]) {
    let current = parseInt(state.devices.battery["current_now"]);
    if (current_currents.value.length > 90) current_currents.value.shift();
    current_currents.value.push(current);
  }
  if (state.devices.battery["voltage_now"]) {
    let voltage = parseInt(state.devices.battery["voltage_now"]);
    if (current_voltages.value.length > 90) current_voltages.value.shift();
    current_voltages.value.push(voltage);
  }

  ImGui.Text("Type:"); ImGui.SameLine(); ImGui.Text(state.devices.battery.type);
  ImGui.Text("Scope:"); ImGui.SameLine(); ImGui.Text(state.devices.battery.scope);
  ImGui.Text("Technology:"); ImGui.SameLine(); ImGui.Text(state.devices.battery.technology);
  ImGui.Text("");
  ImGui.Text("Minimum Voltage:"); ImGui.SameLine(); ImGui.Text(state.devices.battery.voltage_min_design);
  ImGui.Text("Maximum Voltage:"); ImGui.SameLine(); ImGui.Text(state.devices.battery.voltage_max_design);
  ImGui.Text("");
  ImGui.Text("Current now:"); ImGui.SameLine(); ImGui.Text(state.devices.battery["current_now"] || "");
  ImGui.PlotLines("Current", current_currents.value, IM_ARRAYSIZE(current_currents.value));
  ImGui.Text("Voltage now:"); ImGui.SameLine(); ImGui.Text(state.devices.battery["voltage_now"] || "");
  ImGui.PlotLines("Voltage", current_voltages.value, IM_ARRAYSIZE(current_voltages.value));

  ImGui.End();
}
