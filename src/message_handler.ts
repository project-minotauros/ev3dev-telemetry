import Marshal from './marshal';
import {InboundFlags, OutboundFlags, AvailableDevices} from './message_type';

export function handle_message(state: any, cpanel_state: any) {
  if (state.ready && state.socket.onmessage == null) state.socket.onmessage = (message: any) => {
    console.log(message, cpanel_state);
    let header = message.data[0].charCodeAt(0);
    let response_type = header >> 7;
    let device_type = (header >> 3) & 15;
    let device_id = (header >> 0) & 7;
    let payload = new Marshal(message.data.slice(1), 'utf8').parsed;
    switch (response_type) {
      case InboundFlags.CONSOLE_OUTPUT:
        break;
      case InboundFlags.CONSOLE_ERROR:
        break;
      case InboundFlags.AVAILABLE_DEVICES:
        break;
      case InboundFlags.UPDATE_INFO:
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
  return String.fromCharCode((command << 10) | (sub_command << 7) | (device_type << 3) | device_id);
}

export function send_command(state: any, command: any, payload: string = "") {
  state.socket.send(command + payload);
}
