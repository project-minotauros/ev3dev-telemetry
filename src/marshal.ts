const MARSHAL_TRUE        = 'T'.charCodeAt(0);
const MARSHAL_FALSE       = 'F'.charCodeAt(0);
const MARSHAL_NULL        = '0'.charCodeAt(0);
const MARSHAL_ARRAY       = '['.charCodeAt(0);
const MARSHAL_HASH        = '{'.charCodeAt(0);
const MARSHAL_INT         = 'i'.charCodeAt(0);
const MARSHAL_SYM         = ':'.charCodeAt(0);
const MARSHAL_SYM_REF     = ';'.charCodeAt(0);
const MARSHAL_INSTANCEVAR = 'I'.charCodeAt(0);
const MARSHAL_IVAR_STR    = '"'.charCodeAt(0);
const MARSHAL_FLOAT       = 'f'.charCodeAt(0);

function __load(buffer: Buffer) {
  switch (buffer.length) {
    case 1:
      if (buffer[0] === 0) return 0;
      var num = buffer.readInt8(0);

      if (num > 0) num -= 5;
      else num += 5;

      return num;
    case 2:
      var num = buffer.readUInt8(1);
      if (buffer[0] === 255) num = -(256 - num);
      return num;
    case 3:
      var num = buffer.readUInt16LE(1);
      if (buffer[0] === 254) num = -(65536 - num);
      return num;
    case 4:
      var tmpBuffer = Buffer.concat([buffer.slice(1), new Buffer([0])]);
      var num = tmpBuffer.readInt32LE(0);
      if (buffer[0] === 253) num = -(16777216 - num);
      return num;
    case 5:
      return buffer.readInt32LE(1);
    default:
      throw new Error('Not an int');
  }
}

function __length(initial_byte: number) {
  switch (initial_byte) {
    case 4:
    case 252:
      return 5;
    case 3:
    case 253:
      return 4;
    case 2:
    case 254:
      return 3;
    case 1:
    case 255:
      return 2;
    case 0:
    default:
      return 1;
  }
}

function __dump(input: any) {
  if (input === 0) return new Buffer([0]);

  if (input > 0) {
    if (input < 123) return new Buffer([input + 5]);
    else if (input < 256) return new Buffer([1, input]);
    else if (input < 65536) {
      var uint = new Buffer(2);
      uint.writeUInt16LE(input, 0);
      return Buffer.concat([new Buffer([2]), uint]);
    } else if (input < 16777216) {
      var uint = new Buffer(4);
      uint.writeUInt32LE(input, 0);
      return Buffer.concat([new Buffer([3]), uint.slice(0, uint.length - 1)]);
    } else {
      var uint = new Buffer(4);
      uint.writeUInt32LE(input, 0);
      return Buffer.concat([new Buffer([4]), uint]);
    }
  } else {
    if (input > -124) return Buffer.concat([new Buffer([input - 5])]);
    else if (input > -257) return Buffer.concat([new Buffer([255, input])]);
    else if (input > -65537) {
      var uint = new Buffer(2);
      uint.writeUInt16LE(65536 - Math.abs(input), 0);
      return Buffer.concat([new Buffer([254]), uint]);
    } else if (input > - 16777217) {
      var uint = new Buffer(4);
      uint.writeUInt16LE(16777216 - Math.abs(input), 0);
      return Buffer.concat([new Buffer([253]), uint.slice(0, uint.length - 1)]);
    } else {
      var uint = new Buffer(4);
      uint.writeUInt32LE(4294967296 - Math.abs(input), 0);
      return Buffer.concat([new Buffer([252]), uint]);
    }
  }
}

function parse(buffer: Buffer) {
  var offset = 0;
  var symbols: any = [];

  var _identify_next_token = function(): any {
    var output;

    var _parse_string = function() {
      var length = __load(buffer.slice(offset + 2, offset + 3));
      var isIvar = buffer[offset + 1] === 34;
      var offsetFastForward = isIvar ? 3 : 2;
      var tempBuf = buffer.slice(offset + offsetFastForward, offset + offsetFastForward + length);

      offset += tempBuf.length + 3;
      if (buffer[offset + 1] === MARSHAL_SYM) offset += 5;
      else if (buffer[offset + 1] === MARSHAL_SYM_REF) offset += 4;
      else if (buffer[offset + 1] === undefined) {}
      else throw new Error('String not terminated with encoding symbol. Expected 3a or 3b, got ' + buffer[offset + 1].toString(16) + ' instead.');

      return tempBuf.toString('utf8');
    };

    switch (buffer[offset]) {
      case MARSHAL_TRUE: offset += 1; return true;
      case MARSHAL_FALSE: offset += 1; return false;
      case MARSHAL_NULL: offset += 1; return null;
      case MARSHAL_INT:
        var length = __length(buffer[offset + 1]);
        var slice = buffer.slice(offset + 1, offset + 1 + length);
        offset += length + 1;
        return __load(slice);
      case MARSHAL_FLOAT:
        var length = __load(buffer.slice(offset + 1, offset + 2));
        var tempBuf = buffer.slice(offset + 2, offset + 2 + length);
        offset += length + 2;
        if (tempBuf.toString('utf8') === 'inf') return Infinity;
        if (tempBuf.toString('utf8') ==='-inf') return -Infinity;
        return parseFloat(tempBuf.toString('utf8'));
      case MARSHAL_SYM:
        var length = __load(buffer.slice(offset + 1, offset + 2));
        var tempBuf = buffer.slice(offset + 2, offset + 2 + length);
        offset += length + 2;
        var sym = tempBuf.toString('utf8');
        symbols.push(sym);
        return sym;
      case MARSHAL_SYM_REF:
        var index = __load(buffer.slice(offset + 1, offset + 2));
        offset += 2;
        return symbols[index];
      case MARSHAL_IVAR_STR:
        return _parse_string();
      case MARSHAL_INSTANCEVAR:
        var ivarType = buffer[offset + 1];
        switch (ivarType) {
          case MARSHAL_IVAR_STR:
            return _parse_string();
          default:
            throw new Error('Unrecognized instance variable type (only strings supported).');
        }
        throw new Error(ivarType.toString());
      case MARSHAL_ARRAY:
        var tokensExpected = __load(buffer.slice(offset + 1, offset + 2));
        var elements = [];
        offset += 2;
        for (let i = 0; i < tokensExpected; i++)
          elements.push(_identify_next_token());
        return elements;
      case MARSHAL_HASH:
        var tokensExpected = __load(buffer.slice(offset + 1, offset + 2));
        var hashOut: any = {};
        offset += 2;
        for (let i = 0; i < tokensExpected; i += 2) {
          var key = _identify_next_token();
          var val = _identify_next_token();
          hashOut[key] = val;
        }
        return hashOut;
      default:
        throw new Error('Unespected data, value ' + buffer[offset].toString(16) + ' at offset ' + offset + ' on ' + buffer.toString('hex') + '. Probably unimplemented?');
    }

    return output;
  }

  return _identify_next_token();
}

function _dump(value: any) {
  var stringEncodingOffset: any;

  var _dumpValue = function(value: any): any {
    var _ivar = function(tyype: any, value: any) {
      var trail;
      if (stringEncodingOffset) trail = new Buffer([6, MARSHAL_SYM_REF, 0, 84]);
      else {
        trail = new Buffer([6, MARSHAL_SYM, 6, 9, 84]);
        stringEncodingOffset = true;
      }

      return Buffer.concat([
        new Buffer([MARSHAL_INSTANCEVAR]),
        new Buffer([tyype]),
        new Buffer([value.length + 5]),
        new Buffer(value, 'utf8'),
        trail
      ]);
    };

    if (value === true) return new Buffer([MARSHAL_TRUE]);
    if (value === false) return new Buffer([MARSHAL_FALSE]);

    if (typeof value === 'number') {
      if (value === Math.round(value)) {
        if (value === Infinity) {
          var str = 'inf';
          return Buffer.concat([new Buffer([MARSHAL_FLOAT]), __dump(str.length), new Buffer(str, 'utf8')]);
        } else if (value === -Infinity) {
          var str = '-inf';
          return Buffer.concat([new Buffer([MARSHAL_FLOAT]), __dump(str.length), new Buffer(str, 'utf8')]);
        } else return Buffer.concat([new Buffer([MARSHAL_INT]), __dump(value)]);
      } else {
        var str = value.toString();
        return Buffer.concat([new Buffer([MARSHAL_FLOAT]), __dump(str.length), new Buffer(str, 'utf8')]);
      }
    }

    if (typeof value === 'string') return _ivar(MARSHAL_IVAR_STR, value);

    if (Array.isArray(value)) {
      return Buffer.concat([
        new Buffer([MARSHAL_ARRAY]),
        __dump(value.length),
      ].concat(value.map(function (item) { return _dumpValue(item); })));
    }

    if (value === Object(value)) {
      return Buffer.concat([
        new Buffer([MARSHAL_HASH]),
        __dump(Object.keys(value).length)
      ].concat([].concat.apply([], Object.keys(value).map(function(key) {
        return [_dumpValue(key), _dumpValue(value[key])];
      }))));
    }

    return new Buffer([MARSHAL_NULL]);
  };
}

export function load(input: any, encoding: any) {
  if (!(input instanceof Buffer)) {
    if (!encoding)
      throw new Error('A second "encoding" argument is expected if the first argument is not a buffer');
    input = new Buffer(input, encoding);
  }
  if (input[0] !== 4 && input[1] !== 8)
    throw new Error('Input is not in marshal 4.8 format');

  return parse(input.slice(2));
}

export function dump(input: any, encoding: any) {
  var buffer: any = new Buffer('0408', 'hex');
  buffer = Buffer.concat([buffer, _dump(input)]);
  if (encoding)
    return buffer.toString(encoding);
  return buffer;
}
