import Marshal from './marshal';

export function handle_message(state: any, cpanel_state: any) {
  if (state.ready && state.socket.onmessage == null) state.socket.onmessage = (message: any) => {
    console.log(message, cpanel_state);
    let header = message.data[0];
    console.log(header, new Marshal(message.data.slice(1), 'utf8'));
  };
}
