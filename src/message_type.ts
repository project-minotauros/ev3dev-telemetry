const AvailableDevices = {
  NONE: 0,
  DISPLAY: 1,
  SOUND: 2,
  PORT: 3,
  LED: 4,
  BATTERY: 5,
  SENSOR: 6,
  TMOTOR: 7,
  DMOTOR: 8,
  SMOTOR: 9
};

const OutboundFlags = {
  SCAN_DEVICES: 0,
  REQUEST_UPDATE: 1,
  DATA_RW: 2,
  EXECUTE_COMMAND: 3,
  FILE_OPERATION: 4
};

const OutboundModifiers = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  LIST: 3,
  MOVE: 4,
  REMOVE: 5,
  EXECUTE: 6
};

const InboundFlags = {
  CONSOLE_OUTPUT: 0,
  CONSOLE_ERROR: 1,
  AVAILABLE_DEVICES: 2,
  UPDATE_INFO: 3
};

Object.freeze(AvailableDevices);
Object.freeze(OutboundFlags);
Object.freeze(OutboundModifiers);
Object.freeze(InboundFlags);

export {AvailableDevices, OutboundFlags, OutboundModifiers, InboundFlags};
