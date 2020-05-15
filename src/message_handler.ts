import Marshal from './marshal';
import {InboundFlags, AvailableDevices} from './message_type';

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
