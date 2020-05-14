export function handle_message(state: any, cpanel_state: any) {
  if (state.ready && state.socket.onmessage == null) state.socket.onmessage = (message: string) => {
    console.log(message, cpanel_state);
  };
}
