class Ivar {
  buffer: Buffer;
  encoding: string;
  str: string;

  constructor(str: string, encoding: string) {
    this.buffer = Buffer.from(str);
    this.encoding = encoding;
    this.str = this.buffer.toString('utf8');
    return this;
  }

  toString() {
    return this.buffer.toString(this.encoding || 'utf8');
  }

  toJSON() {
    return this.toString();
  }
}

const NUMERALS = '0123456789abcdef';

export default class Marshal {
  _index: number;
  _version: string;
  _symbols: any[];
  _objects: any[];
  buffer: Buffer;
  parsed: any;

  constructor(input: any, encoding: any) {
    if (input !== void 0) this.load(input, encoding);
    return this;
  }

  dump(input: any, encoding: any) {
    let buff = new Buffer('0408', 'hex');
    // this.buffer = Buffer.concat([buff, _dump(input)]);
    if (encoding) return this.buffer.toString(encoding);
    return this.buffer;
  }

  load(buffer: any, encoding: BufferEncoding) {
    if (buffer === void 0 || buffer.length === 0) throw new Error('No buffer specified');
    else if (buffer instanceof Buffer) this.buffer = buffer;
    else this.buffer = Buffer.from(buffer, encoding);
    this._index = 0;
    this._version = this.buffer.readUInt8(this._index++) + '.' + this.buffer.readUInt8(this._index++);
    this._symbols = [];
    this._objects = [];
    if (this._index < this.buffer.length) this.parsed = this._parse();
    return this;
  }

  _parse(): any {
    let type_code = this.buffer.readUInt8(this._index++);
    switch (type_code) {
      case 0x30: // 0 - nil
        return null;
      case 0x54: // T - true
        return true;
      case 0x46: // F - false
        return false;
      case 0x69: // i - integer
        return this._parseInteger();
      case 0x22: // " - string
        return this._parseString();
      case 0x3A: // : - symbol
        return this._parseSymbol();
      case 0x3B: // ; - symbol ref
        return this._parseSymbolRef();
      case 0x40: // @ - object link
        return this._parseObjectLink();
      case 0x49: // I - IVAR (encoded string or regex)
        return this._parseIVAR();
      case 0x5B: // [ - array
        return this._parseArray();
      case 0x6F: // o - object
        return this._parseObject();
      case 0x7B: // { - hash
        return this._parseHash();
      case 0x6C: // l - bignum
        return this._parseBignum();
      case 0x66: // f - float
        return this._parseFloat();
      case 0x2F: // / - regex
      case 0x63: // c - class
      case 0x6D: // m - module
      default:
        throw new Error('Unsupported typecode ' + type_code + '.');
    }
  }

  _getLength() {
    let length = this.buffer.readInt8(this._index++);
    if (length === 0) length = 0;
    else if (length >= 6) length -= 5;
    else if (length <= -6) length += 5;
    return length;
  }

  _parseFloat() {
    let length = this._getLength();
    let floatValue = this.buffer.slice(this._index, this._index + length);
    this._index += length;
    if (floatValue.toString('utf8') === 'inf') return Infinity;
    if (floatValue.toString('utf8') === '-inf') return -Infinity;
    if (floatValue.toString('utf8') === 'nan') return NaN;
    return parseFloat(floatValue.toString('utf8'));
  }

  _parseBignum() {
    let isNegative = (this.buffer.readInt8(this._index++) === 0x2d);
    let wordLength = this._getLength();
    let byteLength = wordLength * 2;
    let byteString = '';
    for (let i = 0; i < byteLength; i++, this._index++)
      byteString = this.buffer.toString('hex', this._index, this._index + 1) + byteString;

    let base10array = [0];
    let i, j, base10arrayLength;
    for (i = 0; i < byteString.length; i++) {
      for (base10arrayLength = base10array.length; base10arrayLength--;)
        base10array[base10arrayLength] *= 16;
      base10array[0] += NUMERALS.indexOf(byteString.charAt(i));
      for (j = 0; j < base10array.length; j++) {
        if (base10array[j] > 10 - 1) {
          if (base10array[j + 1] === void 0)
            base10array[j + 1] = 0;
          base10array[j + 1] += base10array[j + 1] = 0;
          base10array[j] %= 10;
        }
      }
    }

    while (base10array[base10array.length] === 0)
      base10array.pop();

    base10array.reverse();
    let bignum = base10array.join('');
    if (isNegative) bignum = '-' + bignum;
    return bignum;
  }

  _parseInteger() {
    var small = this.buffer.readInt8(this._index++);
    if (small === 0) return 0;
    else if (small >= 6) return small - 5;
    else if (small <= -6) return small + 5;
    else if (small === 1) {
      let large = this.buffer.readUInt8(this._index);
      this._index += 1;
      return large;
    } else if (small === 2) {
      let large = this.buffer.readUInt16LE(this._index);
      this._index += 2;
      return large;
    } else if (small === 3) {
      let large = Buffer.from(this.buffer.toString('hex', this._index, this._index + 3) + '00', 'hex').readUInt32LE(0);
      this._index += 3;
      return large;
    } else if (small === 4) {
      let large = this.buffer.readUInt32LE(this._index);
      this._index += 4;
      return large;
    } else if (small === -1) {
      let large = -(~(0xffffff00 + this.buffer.readUInt8(this._index)) + 1);
      this._index += 1;
      return large;
    } else if (small === -2) {
      let large = this.buffer.readInt16LE(this._index);
      this._index += 2;
      return large;
    } else if (small === -3) {
      let large = -(~(((0xffff0000 + this.buffer.readUInt16LE(this._index + 1)) << 8) + this.buffer.readUInt8(this._index)) + 1);
      this._index += 3;
      return large;
    } else if (small === -4) {
      let large = this.buffer.readInt32LE(this._index);
      this._index += 4;
      return large;
    } else throw new Error('Unable to parse integer');
  }

  _parseArray(): any[] {
    let arr = [];
    let length = this._parseInteger();
    if (length > 0) {
      let value;
      while (arr.length < length) {
        value = this._parse();
        arr.push(value);
      }
    }
    return arr;
  }

  _parseObject() {
    let name = this._parse();
    let obj: any = this._parseHash();
    obj['_name'] = name;
    return obj;
  }

  _parseHash() {
    var hash: any = {};
    let length = this._parseInteger();
    if (length > 0) {
      let key, value;
      while (Object.keys(hash).length < length) {
        key = this._parse();
        value = this._parse();
        hash[key] = value;
      }
    }
    return hash;
  }

  _parseSymbol() {
    let sym = this._parseString();
    this._symbols.push(sym);
    return sym;
  }

  _parseSymbolRef() {
    let index = this._parseInteger();
    let sym = this._symbols[index];
    return sym;
  }

  _parseObjectLink() {
    let index = this._parseInteger();
    let obj = this._objects[index];
    return obj;
  }

  _parseString() {
    let length = this._parseInteger();
    let str = this.buffer.slice(this._index, this._index + length).toString();
    this._index += length;
    return str;
  }

  _parseIVAR(): any {
    let str: any = this._parse();

    let encoding;
    let lengthOfSymbolChar = this._parseInteger();
    if (lengthOfSymbolChar === 1) {
      let sym = this._parse();
      let value = this._parse();
      this._objects.push(value);

      if (sym === 'E') {
        if (value === true) encoding = 'utf8';
        else encoding = 'ascii';
      } else if (sym === 'encoding') {
        if (value === 'ISO-8850-1') encoding = 'binary';
        else encoding = value;
      } else throw new Error('Invalid IVAR encoding specification ' + sym + '.');
    } else throw new Error('Invalid IVAR, expected single character.');

    let ivar = new Ivar(str, encoding);
    this._objects.push(ivar);
    return ivar.toString();
  }

  toString(encoding: string = null) {
    return this.buffer.toString(encoding || 'base64');
  }

  toJSON() {
    return this.parsed;
  }
}
