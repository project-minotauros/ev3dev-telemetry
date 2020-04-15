export class Static<T> {
  constructor(public value: T){}
}

const _static: {[key: string]: Static<any>} = {};

export function STATIC<T>(key: string, value: T): Static<T> {
  return _static[key] || (_static[key] = new Static<T>(value));
}

export function IM_MAX(_A: number, _B: number): number {
  return ((_A) >= (_B)) ? (_A) : (_B);
}

export const IM_NEWLINE: string = "\n";

export function format_number(n: number, radix: number = 10, pad: number = 0, pad_char: string = "0"): string {
  return pad > 0 ? (pad_char.repeat(pad) + n.toString(radix)).substr(-pad) : n.toString(radix);
}

export function format_number_dec(n: number, pad: number = 0, pad_char: string = "0"): string {
  return format_number(n, 10, pad, pad_char);
}

export function format_number_hex(n: number, pad: number = 0, pad_char: string = "0"): string {
  return format_number(n, 16, pad, pad_char);
}
