import Marshal from './marshal';
import {InboundFlags, OutboundFlags, AvailableDevices, GetDeviceName} from './message_type';
import {logToConsole} from './basic_panels';

export function handle_message(state: any, cpanel_state: any) {
  if (state.ready && state.socket.onmessage == null) state.socket.onmessage = (message: any) => {
    let header = parseInt(message.data.slice(0, message.data.indexOf('P')));
    let response_type = header >> 7;
    let device_type = (header >> 3) & 15;
    let device_id = (header >> 0) & 7;
    let payload = new Marshal(message.data.slice(message.data.indexOf('P') + 1), 'utf8').parsed;
    console.log(header, payload);
    switch (response_type) {
      case InboundFlags.CONSOLE_OUTPUT:
        logToConsole(payload);
        break;
      case InboundFlags.CONSOLE_ERROR:
        logToConsole(payload, true);
        break;
      case InboundFlags.AVAILABLE_DEVICES:
        save_available_devices(state, device_type, payload);
        break;
      case InboundFlags.UPDATE_INFO:
        Object.assign(state.devices[GetDeviceName(device_type)], payload);
        break;
      default:
        throw new Error('Response type not recognized.');
    }
  };
}

export function send_scan_devices(state: any, device: number = AvailableDevices.NONE) {
  send_command(state, encode_command(OutboundFlags.SCAN_DEVICES, 0, device, 0));
}

export function send_execute_command(state: any, cmd: string) {
  send_command(state, encode_command(OutboundFlags.EXECUTE_COMMAND, 0, 0, 0), cmd);
}

export function encode_command(command: number, sub_command: number, device_type: number, device_id: number) {
  command = Math.abs(Math.min(command, 15));
  sub_command = Math.abs(Math.min(sub_command, 7));
  device_type = Math.abs(Math.min(device_type, 15));
  device_id = Math.abs(Math.min(device_id, 7));
  return `${((command << 10) | (sub_command << 7) | (device_type << 3) | device_id)}P`;
}

export function send_command(state: any, command: string, payload: string = "") {
  state.socket.send(command + payload);
}

function save_available_devices(state: any, device_type: any, payload: any) {
  // TODO handle different device types
  state.devices = payload;
}
