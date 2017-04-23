(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("gzNCgL"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\browserify\\node_modules\\base64-js\\lib\\b64.js","/..\\..\\node_modules\\browserify\\node_modules\\base64-js\\lib")
},{"buffer":2,"gzNCgL":3}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("gzNCgL"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\browserify\\node_modules\\buffer\\index.js","/..\\..\\node_modules\\browserify\\node_modules\\buffer")
},{"base64-js":1,"buffer":2,"gzNCgL":3,"ieee754":4}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("gzNCgL"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\browserify\\node_modules\\process\\browser.js","/..\\..\\node_modules\\browserify\\node_modules\\process")
},{"buffer":2,"gzNCgL":3}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("gzNCgL"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/..\\..\\node_modules\\ieee754\\index.js","/..\\..\\node_modules\\ieee754")
},{"buffer":2,"gzNCgL":3}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";

window.onload = function () {
  // m_Menu
  this.menu = {
    items: Array.from(document.querySelector('.menu').children),
    appear: function appear() {
      this.items.forEach(function (item, i) {
        item.order = i;
        setTimeout(function () {
          var items = this.parentElement.children,
              rotateValue = 360 / items.length * this.order,
              list = this.querySelector('.list');
          for (var i = 0; i < items.length; i++) {
            if (i >= this.order) items[i].style.transform = ' rotate(' + rotateValue + 'deg)';
          }list.style.transform = getComputedStyle(list).transform + ' rotate(' + rotateValue * -1 + 'deg)';
          list.classList.add('enabled');
        }.bind(item), i * 500);
      });
    },
    activate: function activate() {
      // My next step
    },
    deactivate: function deactivate() {}
  };
  console.log(menu);
};
}).call(this,require("gzNCgL"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_52078bc6.js","/")
},{"buffer":2,"gzNCgL":3}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6XFxQcm9qZWN0c1xcc291bmRzdXJyb3VuZFxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovUHJvamVjdHMvc291bmRzdXJyb3VuZC9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJDOi9Qcm9qZWN0cy9zb3VuZHN1cnJvdW5kL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanMiLCJDOi9Qcm9qZWN0cy9zb3VuZHN1cnJvdW5kL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJDOi9Qcm9qZWN0cy9zb3VuZHN1cnJvdW5kL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiQzovUHJvamVjdHMvc291bmRzdXJyb3VuZC9zcmMvanMvZmFrZV81MjA3OGJjNi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZ3pOQ2dMXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcXFxcYjY0LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImd6TkNnTFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxicm93c2VyaWZ5XFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcYnJvd3NlcmlmeVxcXFxub2RlX21vZHVsZXNcXFxcYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZ3pOQ2dMXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcXFxcYnJvd3Nlci5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxicm93c2VyaWZ5XFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZ3pOQ2dMXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcXFxcaW5kZXguanNcIixcIi8uLlxcXFwuLlxcXFxub2RlX21vZHVsZXNcXFxcaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblwidXNlIHN0cmljdFwiO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAvLyBtX01lbnVcbiAgdGhpcy5tZW51ID0ge1xuICAgIGl0ZW1zOiBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51JykuY2hpbGRyZW4pLFxuICAgIGFwcGVhcjogZnVuY3Rpb24gYXBwZWFyKCkge1xuICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtLCBpKSB7XG4gICAgICAgIGl0ZW0ub3JkZXIgPSBpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLnBhcmVudEVsZW1lbnQuY2hpbGRyZW4sXG4gICAgICAgICAgICAgIHJvdGF0ZVZhbHVlID0gMzYwIC8gaXRlbXMubGVuZ3RoICogdGhpcy5vcmRlcixcbiAgICAgICAgICAgICAgbGlzdCA9IHRoaXMucXVlcnlTZWxlY3RvcignLmxpc3QnKTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA+PSB0aGlzLm9yZGVyKSBpdGVtc1tpXS5zdHlsZS50cmFuc2Zvcm0gPSAnIHJvdGF0ZSgnICsgcm90YXRlVmFsdWUgKyAnZGVnKSc7XG4gICAgICAgICAgfWxpc3Quc3R5bGUudHJhbnNmb3JtID0gZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS50cmFuc2Zvcm0gKyAnIHJvdGF0ZSgnICsgcm90YXRlVmFsdWUgKiAtMSArICdkZWcpJztcbiAgICAgICAgICBsaXN0LmNsYXNzTGlzdC5hZGQoJ2VuYWJsZWQnKTtcbiAgICAgICAgfS5iaW5kKGl0ZW0pLCBpICogNTAwKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgYWN0aXZhdGU6IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICAgICAgLy8gTXkgbmV4dCBzdGVwXG4gICAgfSxcbiAgICBkZWFjdGl2YXRlOiBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge31cbiAgfTtcbiAgY29uc29sZS5sb2cobWVudSk7XG59O1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJnek5DZ0xcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzUyMDc4YmM2LmpzXCIsXCIvXCIpIl19
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xyXG5cclxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXHJcbiAgICA/IFVpbnQ4QXJyYXlcclxuICAgIDogQXJyYXlcclxuXHJcblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXHJcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxyXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXHJcblxyXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XHJcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXHJcblx0XHRpZiAoY29kZSA9PT0gUExVUyB8fFxyXG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXHJcblx0XHRcdHJldHVybiA2MiAvLyAnKydcclxuXHRcdGlmIChjb2RlID09PSBTTEFTSCB8fFxyXG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxyXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXHJcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcclxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcclxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXHJcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxyXG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxyXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXHJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXHJcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xyXG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcclxuXHJcblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcclxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcclxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxyXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXHJcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXHJcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxyXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXHJcblxyXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXHJcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcclxuXHJcblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXHJcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxyXG5cclxuXHRcdHZhciBMID0gMFxyXG5cclxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcclxuXHRcdFx0YXJyW0wrK10gPSB2XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xyXG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxyXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXHJcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcclxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcclxuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXHJcblx0XHRcdHB1c2godG1wICYgMHhGRilcclxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XHJcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxyXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxyXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIGFyclxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcclxuXHRcdHZhciBpLFxyXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcclxuXHRcdFx0b3V0cHV0ID0gXCJcIixcclxuXHRcdFx0dGVtcCwgbGVuZ3RoXHJcblxyXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcclxuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XHJcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xyXG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxyXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xyXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XHJcblx0XHRcdGNhc2UgMTpcclxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cclxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcclxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcclxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xyXG5cdFx0XHRcdGJyZWFrXHJcblx0XHRcdGNhc2UgMjpcclxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxyXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcclxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcclxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcclxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXHJcblx0XHRcdFx0YnJlYWtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gb3V0cHV0XHJcblx0fVxyXG5cclxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcclxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XHJcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcclxuXHJcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZ3pOQ2dMXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcXFxcYjY0LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXGJhc2U2NC1qc1xcXFxsaWJcIilcclxufSx7XCJidWZmZXJcIjoyLFwiZ3pOQ2dMXCI6M31dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XHJcbi8qIVxyXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cclxuICpcclxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XHJcbiAqIEBsaWNlbnNlICBNSVRcclxuICovXHJcblxyXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcclxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcclxuXHJcbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXHJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcclxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxyXG5cclxuLyoqXHJcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcclxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcclxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxyXG4gKi9cclxuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XHJcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcclxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXHJcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxyXG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXHJcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxyXG4gIHRyeSB7XHJcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXHJcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxyXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cclxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXHJcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn0pKClcclxuXHJcbi8qKlxyXG4gKiBDbGFzczogQnVmZmVyXHJcbiAqID09PT09PT09PT09PT1cclxuICpcclxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXHJcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxyXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXHJcbiAqIGEgc2luZ2xlIG9jdGV0LlxyXG4gKlxyXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxyXG4gKiBwcm90b3R5cGUuXHJcbiAqL1xyXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcclxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcclxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXHJcblxyXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcclxuXHJcbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xyXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cclxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxyXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xyXG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gRmluZCB0aGUgbGVuZ3RoXHJcbiAgdmFyIGxlbmd0aFxyXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcclxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxyXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxyXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXHJcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXHJcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXHJcbiAgZWxzZVxyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXHJcblxyXG4gIHZhciBidWZcclxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xyXG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxyXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXHJcbiAgICBidWYgPSB0aGlzXHJcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXHJcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgdmFyIGlcclxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xyXG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcclxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXHJcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XHJcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcclxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxyXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxyXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGJ1ZltpXSA9IDBcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBidWZcclxufVxyXG5cclxuLy8gU1RBVElDIE1FVEhPRFNcclxuLy8gPT09PT09PT09PT09PT1cclxuXHJcbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XHJcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgIGNhc2UgJ2hleCc6XHJcbiAgICBjYXNlICd1dGY4JzpcclxuICAgIGNhc2UgJ3V0Zi04JzpcclxuICAgIGNhc2UgJ2FzY2lpJzpcclxuICAgIGNhc2UgJ2JpbmFyeSc6XHJcbiAgICBjYXNlICdiYXNlNjQnOlxyXG4gICAgY2FzZSAncmF3JzpcclxuICAgIGNhc2UgJ3VjczInOlxyXG4gICAgY2FzZSAndWNzLTInOlxyXG4gICAgY2FzZSAndXRmMTZsZSc6XHJcbiAgICBjYXNlICd1dGYtMTZsZSc6XHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XHJcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxyXG59XHJcblxyXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XHJcbiAgdmFyIHJldFxyXG4gIHN0ciA9IHN0ciArICcnXHJcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcclxuICAgIGNhc2UgJ2hleCc6XHJcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1dGY4JzpcclxuICAgIGNhc2UgJ3V0Zi04JzpcclxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2FzY2lpJzpcclxuICAgIGNhc2UgJ2JpbmFyeSc6XHJcbiAgICBjYXNlICdyYXcnOlxyXG4gICAgICByZXQgPSBzdHIubGVuZ3RoXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiYXNlNjQnOlxyXG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1Y3MyJzpcclxuICAgIGNhc2UgJ3Vjcy0yJzpcclxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxyXG4gICAgY2FzZSAndXRmLTE2bGUnOlxyXG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcclxuICB9XHJcbiAgcmV0dXJuIHJldFxyXG59XHJcblxyXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XHJcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xyXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcclxuXHJcbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxyXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcclxuICAgIHJldHVybiBsaXN0WzBdXHJcbiAgfVxyXG5cclxuICB2YXIgaVxyXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XHJcbiAgICB0b3RhbExlbmd0aCA9IDBcclxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcclxuICB2YXIgcG9zID0gMFxyXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cclxuICAgIGl0ZW0uY29weShidWYsIHBvcylcclxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxyXG4gIH1cclxuICByZXR1cm4gYnVmXHJcbn1cclxuXHJcbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXHJcbi8vID09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcclxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxyXG4gIGlmICghbGVuZ3RoKSB7XHJcbiAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICB9IGVsc2Uge1xyXG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcclxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcclxuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xyXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXHJcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxyXG5cclxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xyXG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxyXG4gIH1cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcclxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxyXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxyXG4gIH1cclxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXHJcbiAgcmV0dXJuIGlcclxufVxyXG5cclxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cclxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcclxuICByZXR1cm4gY2hhcnNXcml0dGVuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxyXG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcclxuICByZXR1cm4gY2hhcnNXcml0dGVuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XHJcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxufVxyXG5cclxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxyXG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxyXG59XHJcblxyXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcclxuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxyXG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xyXG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXHJcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XHJcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcclxuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcclxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXHJcbiAgICB9XHJcbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxyXG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xyXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcclxuICAgIG9mZnNldCA9IGxlbmd0aFxyXG4gICAgbGVuZ3RoID0gc3dhcFxyXG4gIH1cclxuXHJcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxyXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxyXG4gIGlmICghbGVuZ3RoKSB7XHJcbiAgICBsZW5ndGggPSByZW1haW5pbmdcclxuICB9IGVsc2Uge1xyXG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcclxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcclxuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXHJcbiAgICB9XHJcbiAgfVxyXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxyXG5cclxuICB2YXIgcmV0XHJcbiAgc3dpdGNoIChlbmNvZGluZykge1xyXG4gICAgY2FzZSAnaGV4JzpcclxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICd1dGY4JzpcclxuICAgIGNhc2UgJ3V0Zi04JzpcclxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYXNjaWknOlxyXG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAnYmluYXJ5JzpcclxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiYXNlNjQnOlxyXG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3VjczInOlxyXG4gICAgY2FzZSAndWNzLTInOlxyXG4gICAgY2FzZSAndXRmMTZsZSc6XHJcbiAgICBjYXNlICd1dGYtMTZsZSc6XHJcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcclxuICAgICAgYnJlYWtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXHJcbiAgfVxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xyXG4gIHZhciBzZWxmID0gdGhpc1xyXG5cclxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcclxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxyXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcclxuICAgID8gTnVtYmVyKGVuZClcclxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcclxuXHJcbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xyXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxyXG4gICAgcmV0dXJuICcnXHJcblxyXG4gIHZhciByZXRcclxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XHJcbiAgICBjYXNlICdoZXgnOlxyXG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ3V0ZjgnOlxyXG4gICAgY2FzZSAndXRmLTgnOlxyXG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdhc2NpaSc6XHJcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBjYXNlICdiaW5hcnknOlxyXG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcclxuICAgICAgYnJlYWtcclxuICAgIGNhc2UgJ2Jhc2U2NCc6XHJcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgY2FzZSAndWNzMic6XHJcbiAgICBjYXNlICd1Y3MtMic6XHJcbiAgICBjYXNlICd1dGYxNmxlJzpcclxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcclxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxyXG4gICAgICBicmVha1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcclxuICB9XHJcbiAgcmV0dXJuIHJldFxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4ge1xyXG4gICAgdHlwZTogJ0J1ZmZlcicsXHJcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcclxuICB9XHJcbn1cclxuXHJcbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcclxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIHNvdXJjZSA9IHRoaXNcclxuXHJcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXHJcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxyXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXHJcblxyXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxyXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cclxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cclxuXHJcbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xyXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXHJcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXHJcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcclxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcclxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXHJcblxyXG4gIC8vIEFyZSB3ZSBvb2I/XHJcbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxyXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcclxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxyXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XHJcblxyXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxyXG5cclxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxyXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cclxuICB9IGVsc2Uge1xyXG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xyXG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcclxuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgcmVzID0gJydcclxuICB2YXIgdG1wID0gJydcclxuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXHJcblxyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XHJcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcclxuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcclxuICAgICAgdG1wID0gJydcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxyXG59XHJcblxyXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgdmFyIHJldCA9ICcnXHJcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxyXG5cclxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcclxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcclxuICByZXR1cm4gcmV0XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XHJcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcclxufVxyXG5cclxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG5cclxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXHJcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxyXG5cclxuICB2YXIgb3V0ID0gJydcclxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xyXG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcclxuICB9XHJcbiAgcmV0dXJuIG91dFxyXG59XHJcblxyXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcclxuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcclxuICB2YXIgcmVzID0gJydcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XHJcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXHJcbiAgfVxyXG4gIHJldHVybiByZXNcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XHJcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXHJcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxyXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXHJcblxyXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XHJcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XHJcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XHJcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ld0J1ZlxyXG4gIH1cclxufVxyXG5cclxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcclxuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XHJcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXHJcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcclxufVxyXG5cclxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcclxuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XHJcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXHJcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gIH1cclxuXHJcbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcclxuICAgIHJldHVyblxyXG5cclxuICByZXR1cm4gdGhpc1tvZmZzZXRdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZhciB2YWxcclxuICBpZiAobGl0dGxlRW5kaWFuKSB7XHJcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxyXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXHJcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxyXG4gIH0gZWxzZSB7XHJcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XHJcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcclxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxyXG4gIH1cclxuICByZXR1cm4gdmFsXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbFxyXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcclxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxyXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcclxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcclxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxyXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXHJcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxyXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcclxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcclxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxyXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXHJcbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXHJcbiAgfVxyXG4gIHJldHVybiB2YWxcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxyXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXHJcbiAgaWYgKG5lZylcclxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcclxuICBlbHNlXHJcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXHJcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxyXG4gIGlmIChuZWcpXHJcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcclxuICBlbHNlXHJcbiAgICByZXR1cm4gdmFsXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxyXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXHJcbiAgaWYgKG5lZylcclxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcclxuICBlbHNlXHJcbiAgICByZXR1cm4gdmFsXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICB9XHJcblxyXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcclxuICB9XHJcblxyXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxyXG5cclxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcclxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XHJcbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cclxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XHJcbiAgfVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcclxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XHJcbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxyXG4gIH1cclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXHJcbiAgfVxyXG5cclxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmICh2YWx1ZSA+PSAwKVxyXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxyXG4gIGVsc2VcclxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XHJcbiAgaWYgKCFub0Fzc2VydCkge1xyXG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcclxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcclxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxyXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGlmICh2YWx1ZSA+PSAwKVxyXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcclxuICBlbHNlXHJcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcclxuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXHJcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxyXG4gIH1cclxuXHJcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcclxuICBpZiAob2Zmc2V0ID49IGxlbilcclxuICAgIHJldHVyblxyXG5cclxuICBpZiAodmFsdWUgPj0gMClcclxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXHJcbiAgZWxzZVxyXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xyXG4gIGlmICghbm9Bc3NlcnQpIHtcclxuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXHJcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXHJcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxyXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXHJcbiAgfVxyXG5cclxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxyXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxyXG4gICAgcmV0dXJuXHJcblxyXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxyXG59XHJcblxyXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcclxuICBpZiAoIW5vQXNzZXJ0KSB7XHJcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxyXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxyXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcclxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcclxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcclxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcclxuICB9XHJcblxyXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXHJcbiAgaWYgKG9mZnNldCA+PSBsZW4pXHJcbiAgICByZXR1cm5cclxuXHJcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xyXG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcclxufVxyXG5cclxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XHJcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcclxufVxyXG5cclxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXHJcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xyXG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxyXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxyXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxyXG5cclxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXHJcbiAgfVxyXG5cclxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcclxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxyXG5cclxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcclxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXHJcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cclxuXHJcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxyXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXHJcblxyXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XHJcbiAgICB0aGlzW2ldID0gdmFsdWVcclxuICB9XHJcbn1cclxuXHJcbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcclxuICB2YXIgb3V0ID0gW11cclxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxyXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcclxuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXHJcbiAgICAgIGJyZWFrXHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxyXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cclxuICovXHJcbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcclxuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xyXG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxyXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxyXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cclxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXHJcbiAgfVxyXG59XHJcblxyXG4vLyBIRUxQRVIgRlVOQ1RJT05TXHJcbi8vID09PT09PT09PT09PT09PT1cclxuXHJcbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xyXG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcclxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxyXG59XHJcblxyXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXHJcblxyXG4vKipcclxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xyXG4gKi9cclxuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xyXG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXHJcblxyXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xyXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxyXG4gIGFyci5fc2V0ID0gYXJyLnNldFxyXG5cclxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xyXG4gIGFyci5nZXQgPSBCUC5nZXRcclxuICBhcnIuc2V0ID0gQlAuc2V0XHJcblxyXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXHJcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcclxuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xyXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cclxuICBhcnIuY29weSA9IEJQLmNvcHlcclxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxyXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcclxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXHJcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxyXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcclxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXHJcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcclxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxyXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXHJcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcclxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxyXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXHJcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcclxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXHJcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxyXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxyXG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxyXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxyXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxyXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxyXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcclxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXHJcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxyXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcclxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXHJcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxyXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcclxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcclxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcclxuICBhcnIuZmlsbCA9IEJQLmZpbGxcclxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcclxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcclxuXHJcbiAgcmV0dXJuIGFyclxyXG59XHJcblxyXG4vLyBzbGljZShzdGFydCwgZW5kKVxyXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcclxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cclxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXHJcbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxyXG4gIGluZGV4ICs9IGxlblxyXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcclxuICByZXR1cm4gMFxyXG59XHJcblxyXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xyXG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXHJcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXHJcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XHJcbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcclxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcclxufVxyXG5cclxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xyXG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xyXG4gIH0pKHN1YmplY3QpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcclxuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcclxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcclxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b0hleCAobikge1xyXG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxyXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxyXG59XHJcblxyXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XHJcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcclxuICAgIGlmIChiIDw9IDB4N0YpXHJcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHZhciBzdGFydCA9IGlcclxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcclxuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxyXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXHJcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gYnl0ZUFycmF5XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XHJcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcclxuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxyXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxyXG4gIH1cclxuICByZXR1cm4gYnl0ZUFycmF5XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcclxuICB2YXIgYywgaGksIGxvXHJcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcclxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxyXG4gICAgaGkgPSBjID4+IDhcclxuICAgIGxvID0gYyAlIDI1NlxyXG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXHJcbiAgICBieXRlQXJyYXkucHVzaChoaSlcclxuICB9XHJcblxyXG4gIHJldHVybiBieXRlQXJyYXlcclxufVxyXG5cclxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XHJcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xyXG4gIHZhciBwb3NcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXHJcbiAgICAgIGJyZWFrXHJcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cclxuICB9XHJcbiAgcmV0dXJuIGlcclxufVxyXG5cclxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXHJcbiAgfVxyXG59XHJcblxyXG4vKlxyXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxyXG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxyXG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cclxuICovXHJcbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xyXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXHJcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXHJcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxyXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XHJcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcclxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcclxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXHJcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50JylcclxufVxyXG5cclxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcclxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxyXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxyXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcclxufVxyXG5cclxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XHJcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXHJcbn1cclxuXHJcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZ3pOQ2dMXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXGJ1ZmZlclxcXFxpbmRleC5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxicm93c2VyaWZ5XFxcXG5vZGVfbW9kdWxlc1xcXFxidWZmZXJcIilcclxufSx7XCJiYXNlNjQtanNcIjoxLFwiYnVmZmVyXCI6MixcImd6TkNnTFwiOjMsXCJpZWVlNzU0XCI6NH1dLDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XHJcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxyXG5cclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xyXG5cclxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcclxuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XHJcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXHJcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcclxuICAgIDtcclxuXHJcbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNhblBvc3QpIHtcclxuICAgICAgICB2YXIgcXVldWUgPSBbXTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xyXG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xyXG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcclxuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XHJcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xyXG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcclxuICAgIH07XHJcbn0pKCk7XHJcblxyXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xyXG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xyXG5wcm9jZXNzLmVudiA9IHt9O1xyXG5wcm9jZXNzLmFyZ3YgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIG5vb3AoKSB7fVxyXG5cclxucHJvY2Vzcy5vbiA9IG5vb3A7XHJcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xyXG5wcm9jZXNzLm9uY2UgPSBub29wO1xyXG5wcm9jZXNzLm9mZiA9IG5vb3A7XHJcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xyXG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XHJcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XHJcblxyXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xyXG59XHJcblxyXG4vLyBUT0RPKHNodHlsbWFuKVxyXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xyXG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcclxufTtcclxuXHJcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiZ3pOQ2dMXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGJyb3dzZXJpZnlcXFxcbm9kZV9tb2R1bGVzXFxcXHByb2Nlc3NcXFxcYnJvd3Nlci5qc1wiLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxicm93c2VyaWZ5XFxcXG5vZGVfbW9kdWxlc1xcXFxwcm9jZXNzXCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImd6TkNnTFwiOjN9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcclxuKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xyXG5leHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xyXG4gIHZhciBlLCBtXHJcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcclxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxyXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxyXG4gIHZhciBuQml0cyA9IC03XHJcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxyXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxyXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXHJcblxyXG4gIGkgKz0gZFxyXG5cclxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxyXG4gIHMgPj49ICgtbkJpdHMpXHJcbiAgbkJpdHMgKz0gZUxlblxyXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XHJcblxyXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXHJcbiAgZSA+Pj0gKC1uQml0cylcclxuICBuQml0cyArPSBtTGVuXHJcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cclxuXHJcbiAgaWYgKGUgPT09IDApIHtcclxuICAgIGUgPSAxIC0gZUJpYXNcclxuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcclxuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxyXG4gIH0gZWxzZSB7XHJcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXHJcbiAgICBlID0gZSAtIGVCaWFzXHJcbiAgfVxyXG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXHJcbn1cclxuXHJcbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcclxuICB2YXIgZSwgbSwgY1xyXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXHJcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcclxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcclxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXHJcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxyXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxyXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXHJcblxyXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXHJcblxyXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XHJcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcclxuICAgIGUgPSBlTWF4XHJcbiAgfSBlbHNlIHtcclxuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxyXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xyXG4gICAgICBlLS1cclxuICAgICAgYyAqPSAyXHJcbiAgICB9XHJcbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcclxuICAgICAgdmFsdWUgKz0gcnQgLyBjXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcclxuICAgIH1cclxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xyXG4gICAgICBlKytcclxuICAgICAgYyAvPSAyXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XHJcbiAgICAgIG0gPSAwXHJcbiAgICAgIGUgPSBlTWF4XHJcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XHJcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxyXG4gICAgICBlID0gZSArIGVCaWFzXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcclxuICAgICAgZSA9IDBcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XHJcblxyXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cclxuICBlTGVuICs9IG1MZW5cclxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XHJcblxyXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxyXG59XHJcblxyXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImd6TkNnTFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uXFxcXC4uXFxcXG5vZGVfbW9kdWxlc1xcXFxpZWVlNzU0XFxcXGluZGV4LmpzXCIsXCIvLi5cXFxcLi5cXFxcbm9kZV9tb2R1bGVzXFxcXGllZWU3NTRcIilcclxufSx7XCJidWZmZXJcIjoyLFwiZ3pOQ2dMXCI6M31dLDU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xyXG4oZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAvLyBtX01lbnVcclxuICB0aGlzLm1lbnUgPSB7XHJcbiAgICBpdGVtczogQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudScpLmNoaWxkcmVuKSxcclxuICAgIGFwcGVhcjogZnVuY3Rpb24gYXBwZWFyKCkge1xyXG4gICAgICB0aGlzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGkpIHtcclxuICAgICAgICBpdGVtLm9yZGVyID0gaTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZhciBpdGVtcyA9IHRoaXMucGFyZW50RWxlbWVudC5jaGlsZHJlbixcclxuICAgICAgICAgICAgICByb3RhdGVWYWx1ZSA9IDM2MCAvIGl0ZW1zLmxlbmd0aCAqIHRoaXMub3JkZXIsXHJcbiAgICAgICAgICAgICAgbGlzdCA9IHRoaXMucXVlcnlTZWxlY3RvcignLmxpc3QnKTtcclxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGkgPj0gdGhpcy5vcmRlcikgaXRlbXNbaV0uc3R5bGUudHJhbnNmb3JtID0gJyByb3RhdGUoJyArIHJvdGF0ZVZhbHVlICsgJ2RlZyknO1xyXG4gICAgICAgICAgfWxpc3Quc3R5bGUudHJhbnNmb3JtID0gZ2V0Q29tcHV0ZWRTdHlsZShsaXN0KS50cmFuc2Zvcm0gKyAnIHJvdGF0ZSgnICsgcm90YXRlVmFsdWUgKiAtMSArICdkZWcpJztcclxuICAgICAgICAgIGxpc3QuY2xhc3NMaXN0LmFkZCgnZW5hYmxlZCcpO1xyXG4gICAgICAgIH0uYmluZChpdGVtKSwgaSAqIDUwMCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGFjdGl2YXRlOiBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcclxuICAgICAgLy8gTXkgbmV4dCBzdGVwXHJcbiAgICB9LFxyXG4gICAgZGVhY3RpdmF0ZTogZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHt9XHJcbiAgfTtcclxuICBjb25zb2xlLmxvZyhtZW51KTtcclxufTtcclxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJnek5DZ0xcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9mYWtlXzUyMDc4YmM2LmpzXCIsXCIvXCIpXHJcbn0se1wiYnVmZmVyXCI6MixcImd6TkNnTFwiOjN9XX0se30sWzVdKVxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWtNNlhGeFFjbTlxWldOMGMxeGNjMjkxYm1SemRYSnliM1Z1WkZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhpY205M2MyVnlMWEJoWTJ0Y1hGOXdjbVZzZFdSbExtcHpJaXdpUXpvdlVISnZhbVZqZEhNdmMyOTFibVJ6ZFhKeWIzVnVaQzl1YjJSbFgyMXZaSFZzWlhNdlluSnZkM05sY21sbWVTOXViMlJsWDIxdlpIVnNaWE12WW1GelpUWTBMV3B6TDJ4cFlpOWlOalF1YW5NaUxDSkRPaTlRY205cVpXTjBjeTl6YjNWdVpITjFjbkp2ZFc1a0wyNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlhV1o1TDI1dlpHVmZiVzlrZFd4bGN5OWlkV1ptWlhJdmFXNWtaWGd1YW5NaUxDSkRPaTlRY205cVpXTjBjeTl6YjNWdVpITjFjbkp2ZFc1a0wyNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlhV1o1TDI1dlpHVmZiVzlrZFd4bGN5OXdjbTlqWlhOekwySnliM2R6WlhJdWFuTWlMQ0pET2k5UWNtOXFaV04wY3k5emIzVnVaSE4xY25KdmRXNWtMMjV2WkdWZmJXOWtkV3hsY3k5cFpXVmxOelUwTDJsdVpHVjRMbXB6SWl3aVF6b3ZVSEp2YW1WamRITXZjMjkxYm1SemRYSnliM1Z1WkM5emNtTXZhbk12Wm1GclpWODFNakEzT0dKak5pNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVR0QlEwRkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUXpsSVFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUTNac1EwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUTJwRlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRkRVpCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWlobWRXNWpkR2x2YmlCbEtIUXNiaXh5S1h0bWRXNWpkR2x2YmlCektHOHNkU2w3YVdZb0lXNWJiMTBwZTJsbUtDRjBXMjlkS1h0MllYSWdZVDEwZVhCbGIyWWdjbVZ4ZFdseVpUMDlYQ0ptZFc1amRHbHZibHdpSmlaeVpYRjFhWEpsTzJsbUtDRjFKaVpoS1hKbGRIVnliaUJoS0c4c0lUQXBPMmxtS0drcGNtVjBkWEp1SUdrb2J5d2hNQ2s3ZEdoeWIzY2dibVYzSUVWeWNtOXlLRndpUTJGdWJtOTBJR1pwYm1RZ2JXOWtkV3hsSUNkY0lpdHZLMXdpSjF3aUtYMTJZWElnWmoxdVcyOWRQWHRsZUhCdmNuUnpPbnQ5ZlR0MFcyOWRXekJkTG1OaGJHd29aaTVsZUhCdmNuUnpMR1oxYm1OMGFXOXVLR1VwZTNaaGNpQnVQWFJiYjExYk1WMWJaVjA3Y21WMGRYSnVJSE1vYmo5dU9tVXBmU3htTEdZdVpYaHdiM0owY3l4bExIUXNiaXh5S1gxeVpYUjFjbTRnYmx0dlhTNWxlSEJ2Y25SemZYWmhjaUJwUFhSNWNHVnZaaUJ5WlhGMWFYSmxQVDFjSW1aMWJtTjBhVzl1WENJbUpuSmxjWFZwY21VN1ptOXlLSFpoY2lCdlBUQTdienh5TG14bGJtZDBhRHR2S3lzcGN5aHlXMjlkS1R0eVpYUjFjbTRnYzMwcElpd2lLR1oxYm1OMGFXOXVJQ2h3Y205alpYTnpMR2RzYjJKaGJDeENkV1ptWlhJc1gxOWhjbWQxYldWdWREQXNYMTloY21kMWJXVnVkREVzWDE5aGNtZDFiV1Z1ZERJc1gxOWhjbWQxYldWdWRETXNYMTltYVd4bGJtRnRaU3hmWDJScGNtNWhiV1VwZTF4dWRtRnlJR3h2YjJ0MWNDQTlJQ2RCUWtORVJVWkhTRWxLUzB4TlRrOVFVVkpUVkZWV1YxaFpXbUZpWTJSbFptZG9hV3ByYkcxdWIzQnhjbk4wZFhaM2VIbDZNREV5TXpRMU5qYzRPU3N2Snp0Y2JseHVPeWhtZFc1amRHbHZiaUFvWlhod2IzSjBjeWtnZTF4dVhIUW5kWE5sSUhOMGNtbGpkQ2M3WEc1Y2JpQWdkbUZ5SUVGeWNpQTlJQ2gwZVhCbGIyWWdWV2x1ZERoQmNuSmhlU0FoUFQwZ0ozVnVaR1ZtYVc1bFpDY3BYRzRnSUNBZ1B5QlZhVzUwT0VGeWNtRjVYRzRnSUNBZ09pQkJjbkpoZVZ4dVhHNWNkSFpoY2lCUVRGVlRJQ0FnUFNBbkt5Y3VZMmhoY2tOdlpHVkJkQ2d3S1Z4dVhIUjJZWElnVTB4QlUwZ2dJRDBnSnk4bkxtTm9ZWEpEYjJSbFFYUW9NQ2xjYmx4MGRtRnlJRTVWVFVKRlVpQTlJQ2N3Snk1amFHRnlRMjlrWlVGMEtEQXBYRzVjZEhaaGNpQk1UMWRGVWlBZ1BTQW5ZU2N1WTJoaGNrTnZaR1ZCZENnd0tWeHVYSFIyWVhJZ1ZWQlFSVklnSUQwZ0owRW5MbU5vWVhKRGIyUmxRWFFvTUNsY2JseDBkbUZ5SUZCTVZWTmZWVkpNWDFOQlJrVWdQU0FuTFNjdVkyaGhja052WkdWQmRDZ3dLVnh1WEhSMllYSWdVMHhCVTBoZlZWSk1YMU5CUmtVZ1BTQW5YeWN1WTJoaGNrTnZaR1ZCZENnd0tWeHVYRzVjZEdaMWJtTjBhVzl1SUdSbFkyOWtaU0FvWld4MEtTQjdYRzVjZEZ4MGRtRnlJR052WkdVZ1BTQmxiSFF1WTJoaGNrTnZaR1ZCZENnd0tWeHVYSFJjZEdsbUlDaGpiMlJsSUQwOVBTQlFURlZUSUh4OFhHNWNkRngwSUNBZ0lHTnZaR1VnUFQwOUlGQk1WVk5mVlZKTVgxTkJSa1VwWEc1Y2RGeDBYSFJ5WlhSMWNtNGdOaklnTHk4Z0p5c25YRzVjZEZ4MGFXWWdLR052WkdVZ1BUMDlJRk5NUVZOSUlIeDhYRzVjZEZ4MElDQWdJR052WkdVZ1BUMDlJRk5NUVZOSVgxVlNURjlUUVVaRktWeHVYSFJjZEZ4MGNtVjBkWEp1SURZeklDOHZJQ2N2SjF4dVhIUmNkR2xtSUNoamIyUmxJRHdnVGxWTlFrVlNLVnh1WEhSY2RGeDBjbVYwZFhKdUlDMHhJQzh2Ym04Z2JXRjBZMmhjYmx4MFhIUnBaaUFvWTI5a1pTQThJRTVWVFVKRlVpQXJJREV3S1Z4dVhIUmNkRngwY21WMGRYSnVJR052WkdVZ0xTQk9WVTFDUlZJZ0t5QXlOaUFySURJMlhHNWNkRngwYVdZZ0tHTnZaR1VnUENCVlVGQkZVaUFySURJMktWeHVYSFJjZEZ4MGNtVjBkWEp1SUdOdlpHVWdMU0JWVUZCRlVseHVYSFJjZEdsbUlDaGpiMlJsSUR3Z1RFOVhSVklnS3lBeU5pbGNibHgwWEhSY2RISmxkSFZ5YmlCamIyUmxJQzBnVEU5WFJWSWdLeUF5Tmx4dVhIUjlYRzVjYmx4MFpuVnVZM1JwYjI0Z1lqWTBWRzlDZVhSbFFYSnlZWGtnS0dJMk5Da2dlMXh1WEhSY2RIWmhjaUJwTENCcUxDQnNMQ0IwYlhBc0lIQnNZV05sU0c5c1pHVnljeXdnWVhKeVhHNWNibHgwWEhScFppQW9ZalkwTG14bGJtZDBhQ0FsSURRZ1BpQXdLU0I3WEc1Y2RGeDBYSFIwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMGx1ZG1Gc2FXUWdjM1J5YVc1bkxpQk1aVzVuZEdnZ2JYVnpkQ0JpWlNCaElHMTFiSFJwY0d4bElHOW1JRFFuS1Z4dVhIUmNkSDFjYmx4dVhIUmNkQzh2SUhSb1pTQnVkVzFpWlhJZ2IyWWdaWEYxWVd3Z2MybG5ibk1nS0hCc1lXTmxJR2h2YkdSbGNuTXBYRzVjZEZ4MEx5OGdhV1lnZEdobGNtVWdZWEpsSUhSM2J5QndiR0ZqWldodmJHUmxjbk1zSUhSb1lXNGdkR2hsSUhSM2J5QmphR0Z5WVdOMFpYSnpJR0psWm05eVpTQnBkRnh1WEhSY2RDOHZJSEpsY0hKbGMyVnVkQ0J2Ym1VZ1lubDBaVnh1WEhSY2RDOHZJR2xtSUhSb1pYSmxJR2x6SUc5dWJIa2diMjVsTENCMGFHVnVJSFJvWlNCMGFISmxaU0JqYUdGeVlXTjBaWEp6SUdKbFptOXlaU0JwZENCeVpYQnlaWE5sYm5RZ01pQmllWFJsYzF4dVhIUmNkQzh2SUhSb2FYTWdhWE1nYW5WemRDQmhJR05vWldGd0lHaGhZMnNnZEc4Z2JtOTBJR1J2SUdsdVpHVjRUMllnZEhkcFkyVmNibHgwWEhSMllYSWdiR1Z1SUQwZ1lqWTBMbXhsYm1kMGFGeHVYSFJjZEhCc1lXTmxTRzlzWkdWeWN5QTlJQ2M5SnlBOVBUMGdZalkwTG1Ob1lYSkJkQ2hzWlc0Z0xTQXlLU0EvSURJZ09pQW5QU2NnUFQwOUlHSTJOQzVqYUdGeVFYUW9iR1Z1SUMwZ01Ta2dQeUF4SURvZ01GeHVYRzVjZEZ4MEx5OGdZbUZ6WlRZMElHbHpJRFF2TXlBcklIVndJSFJ2SUhSM2J5QmphR0Z5WVdOMFpYSnpJRzltSUhSb1pTQnZjbWxuYVc1aGJDQmtZWFJoWEc1Y2RGeDBZWEp5SUQwZ2JtVjNJRUZ5Y2loaU5qUXViR1Z1WjNSb0lDb2dNeUF2SURRZ0xTQndiR0ZqWlVodmJHUmxjbk1wWEc1Y2JseDBYSFF2THlCcFppQjBhR1Z5WlNCaGNtVWdjR3hoWTJWb2IyeGtaWEp6TENCdmJteDVJR2RsZENCMWNDQjBieUIwYUdVZ2JHRnpkQ0JqYjIxd2JHVjBaU0EwSUdOb1lYSnpYRzVjZEZ4MGJDQTlJSEJzWVdObFNHOXNaR1Z5Y3lBK0lEQWdQeUJpTmpRdWJHVnVaM1JvSUMwZ05DQTZJR0kyTkM1c1pXNW5kR2hjYmx4dVhIUmNkSFpoY2lCTUlEMGdNRnh1WEc1Y2RGeDBablZ1WTNScGIyNGdjSFZ6YUNBb2Rpa2dlMXh1WEhSY2RGeDBZWEp5VzB3cksxMGdQU0IyWEc1Y2RGeDBmVnh1WEc1Y2RGeDBabTl5SUNocElEMGdNQ3dnYWlBOUlEQTdJR2tnUENCc095QnBJQ3M5SURRc0lHb2dLejBnTXlrZ2UxeHVYSFJjZEZ4MGRHMXdJRDBnS0dSbFkyOWtaU2hpTmpRdVkyaGhja0YwS0drcEtTQThQQ0F4T0NrZ2ZDQW9aR1ZqYjJSbEtHSTJOQzVqYUdGeVFYUW9hU0FySURFcEtTQThQQ0F4TWlrZ2ZDQW9aR1ZqYjJSbEtHSTJOQzVqYUdGeVFYUW9hU0FySURJcEtTQThQQ0EyS1NCOElHUmxZMjlrWlNoaU5qUXVZMmhoY2tGMEtHa2dLeUF6S1NsY2JseDBYSFJjZEhCMWMyZ29LSFJ0Y0NBbUlEQjRSa1l3TURBd0tTQStQaUF4TmlsY2JseDBYSFJjZEhCMWMyZ29LSFJ0Y0NBbUlEQjRSa1l3TUNrZ1BqNGdPQ2xjYmx4MFhIUmNkSEIxYzJnb2RHMXdJQ1lnTUhoR1JpbGNibHgwWEhSOVhHNWNibHgwWEhScFppQW9jR3hoWTJWSWIyeGtaWEp6SUQwOVBTQXlLU0I3WEc1Y2RGeDBYSFIwYlhBZ1BTQW9aR1ZqYjJSbEtHSTJOQzVqYUdGeVFYUW9hU2twSUR3OElESXBJSHdnS0dSbFkyOWtaU2hpTmpRdVkyaGhja0YwS0drZ0t5QXhLU2tnUGo0Z05DbGNibHgwWEhSY2RIQjFjMmdvZEcxd0lDWWdNSGhHUmlsY2JseDBYSFI5SUdWc2MyVWdhV1lnS0hCc1lXTmxTRzlzWkdWeWN5QTlQVDBnTVNrZ2UxeHVYSFJjZEZ4MGRHMXdJRDBnS0dSbFkyOWtaU2hpTmpRdVkyaGhja0YwS0drcEtTQThQQ0F4TUNrZ2ZDQW9aR1ZqYjJSbEtHSTJOQzVqYUdGeVFYUW9hU0FySURFcEtTQThQQ0EwS1NCOElDaGtaV052WkdVb1lqWTBMbU5vWVhKQmRDaHBJQ3NnTWlrcElENCtJRElwWEc1Y2RGeDBYSFJ3ZFhOb0tDaDBiWEFnUGo0Z09Da2dKaUF3ZUVaR0tWeHVYSFJjZEZ4MGNIVnphQ2gwYlhBZ0ppQXdlRVpHS1Z4dVhIUmNkSDFjYmx4dVhIUmNkSEpsZEhWeWJpQmhjbkpjYmx4MGZWeHVYRzVjZEdaMWJtTjBhVzl1SUhWcGJuUTRWRzlDWVhObE5qUWdLSFZwYm5RNEtTQjdYRzVjZEZ4MGRtRnlJR2tzWEc1Y2RGeDBYSFJsZUhSeVlVSjVkR1Z6SUQwZ2RXbHVkRGd1YkdWdVozUm9JQ1VnTXl3Z0x5OGdhV1lnZDJVZ2FHRjJaU0F4SUdKNWRHVWdiR1ZtZEN3Z2NHRmtJRElnWW5sMFpYTmNibHgwWEhSY2RHOTFkSEIxZENBOUlGd2lYQ0lzWEc1Y2RGeDBYSFIwWlcxd0xDQnNaVzVuZEdoY2JseHVYSFJjZEdaMWJtTjBhVzl1SUdWdVkyOWtaU0FvYm5WdEtTQjdYRzVjZEZ4MFhIUnlaWFIxY200Z2JHOXZhM1Z3TG1Ob1lYSkJkQ2h1ZFcwcFhHNWNkRngwZlZ4dVhHNWNkRngwWm5WdVkzUnBiMjRnZEhKcGNHeGxkRlJ2UW1GelpUWTBJQ2h1ZFcwcElIdGNibHgwWEhSY2RISmxkSFZ5YmlCbGJtTnZaR1VvYm5WdElENCtJREU0SUNZZ01IZ3pSaWtnS3lCbGJtTnZaR1VvYm5WdElENCtJREV5SUNZZ01IZ3pSaWtnS3lCbGJtTnZaR1VvYm5WdElENCtJRFlnSmlBd2VETkdLU0FySUdWdVkyOWtaU2h1ZFcwZ0ppQXdlRE5HS1Z4dVhIUmNkSDFjYmx4dVhIUmNkQzh2SUdkdklIUm9jbTkxWjJnZ2RHaGxJR0Z5Y21GNUlHVjJaWEo1SUhSb2NtVmxJR0o1ZEdWekxDQjNaU2RzYkNCa1pXRnNJSGRwZEdnZ2RISmhhV3hwYm1jZ2MzUjFabVlnYkdGMFpYSmNibHgwWEhSbWIzSWdLR2tnUFNBd0xDQnNaVzVuZEdnZ1BTQjFhVzUwT0M1c1pXNW5kR2dnTFNCbGVIUnlZVUo1ZEdWek95QnBJRHdnYkdWdVozUm9PeUJwSUNzOUlETXBJSHRjYmx4MFhIUmNkSFJsYlhBZ1BTQW9kV2x1ZERoYmFWMGdQRHdnTVRZcElDc2dLSFZwYm5RNFcya2dLeUF4WFNBOFBDQTRLU0FySUNoMWFXNTBPRnRwSUNzZ01sMHBYRzVjZEZ4MFhIUnZkWFJ3ZFhRZ0t6MGdkSEpwY0d4bGRGUnZRbUZ6WlRZMEtIUmxiWEFwWEc1Y2RGeDBmVnh1WEc1Y2RGeDBMeThnY0dGa0lIUm9aU0JsYm1RZ2QybDBhQ0I2WlhKdmN5d2dZblYwSUcxaGEyVWdjM1Z5WlNCMGJ5QnViM1FnWm05eVoyVjBJSFJvWlNCbGVIUnlZU0JpZVhSbGMxeHVYSFJjZEhOM2FYUmphQ0FvWlhoMGNtRkNlWFJsY3lrZ2UxeHVYSFJjZEZ4MFkyRnpaU0F4T2x4dVhIUmNkRngwWEhSMFpXMXdJRDBnZFdsdWREaGJkV2x1ZERndWJHVnVaM1JvSUMwZ01WMWNibHgwWEhSY2RGeDBiM1YwY0hWMElDczlJR1Z1WTI5a1pTaDBaVzF3SUQ0K0lESXBYRzVjZEZ4MFhIUmNkRzkxZEhCMWRDQXJQU0JsYm1OdlpHVW9LSFJsYlhBZ1BEd2dOQ2tnSmlBd2VETkdLVnh1WEhSY2RGeDBYSFJ2ZFhSd2RYUWdLejBnSnowOUoxeHVYSFJjZEZ4MFhIUmljbVZoYTF4dVhIUmNkRngwWTJGelpTQXlPbHh1WEhSY2RGeDBYSFIwWlcxd0lEMGdLSFZwYm5RNFczVnBiblE0TG14bGJtZDBhQ0F0SURKZElEdzhJRGdwSUNzZ0tIVnBiblE0VzNWcGJuUTRMbXhsYm1kMGFDQXRJREZkS1Z4dVhIUmNkRngwWEhSdmRYUndkWFFnS3owZ1pXNWpiMlJsS0hSbGJYQWdQajRnTVRBcFhHNWNkRngwWEhSY2RHOTFkSEIxZENBclBTQmxibU52WkdVb0tIUmxiWEFnUGo0Z05Da2dKaUF3ZUROR0tWeHVYSFJjZEZ4MFhIUnZkWFJ3ZFhRZ0t6MGdaVzVqYjJSbEtDaDBaVzF3SUR3OElESXBJQ1lnTUhnelJpbGNibHgwWEhSY2RGeDBiM1YwY0hWMElDczlJQ2M5SjF4dVhIUmNkRngwWEhSaWNtVmhhMXh1WEhSY2RIMWNibHh1WEhSY2RISmxkSFZ5YmlCdmRYUndkWFJjYmx4MGZWeHVYRzVjZEdWNGNHOXlkSE11ZEc5Q2VYUmxRWEp5WVhrZ1BTQmlOalJVYjBKNWRHVkJjbkpoZVZ4dVhIUmxlSEJ2Y25SekxtWnliMjFDZVhSbFFYSnlZWGtnUFNCMWFXNTBPRlJ2UW1GelpUWTBYRzU5S0hSNWNHVnZaaUJsZUhCdmNuUnpJRDA5UFNBbmRXNWtaV1pwYm1Wa0p5QS9JQ2gwYUdsekxtSmhjMlUyTkdweklEMGdlMzBwSURvZ1pYaHdiM0owY3lrcFhHNWNibjBwTG1OaGJHd29kR2hwY3l4eVpYRjFhWEpsS0Z3aVozcE9RMmRNWENJcExIUjVjR1Z2WmlCelpXeG1JQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJRDhnYzJWc1ppQTZJSFI1Y0dWdlppQjNhVzVrYjNjZ0lUMDlJRndpZFc1a1pXWnBibVZrWENJZ1B5QjNhVzVrYjNjZ09pQjdmU3h5WlhGMWFYSmxLRndpWW5WbVptVnlYQ0lwTGtKMVptWmxjaXhoY21kMWJXVnVkSE5iTTEwc1lYSm5kVzFsYm5Seld6UmRMR0Z5WjNWdFpXNTBjMXMxWFN4aGNtZDFiV1Z1ZEhOYk5sMHNYQ0l2TGk1Y1hGeGNMaTVjWEZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhjWEdKeWIzZHpaWEpwWm5sY1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hHSmhjMlUyTkMxcWMxeGNYRnhzYVdKY1hGeGNZalkwTG1welhDSXNYQ0l2TGk1Y1hGeGNMaTVjWEZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhjWEdKeWIzZHpaWEpwWm5sY1hGeGNibTlrWlY5dGIyUjFiR1Z6WEZ4Y1hHSmhjMlUyTkMxcWMxeGNYRnhzYVdKY0lpa2lMQ0lvWm5WdVkzUnBiMjRnS0hCeWIyTmxjM01zWjJ4dlltRnNMRUoxWm1abGNpeGZYMkZ5WjNWdFpXNTBNQ3hmWDJGeVozVnRaVzUwTVN4ZlgyRnlaM1Z0Wlc1ME1peGZYMkZ5WjNWdFpXNTBNeXhmWDJacGJHVnVZVzFsTEY5ZlpHbHlibUZ0WlNsN1hHNHZLaUZjYmlBcUlGUm9aU0JpZFdabVpYSWdiVzlrZFd4bElHWnliMjBnYm05a1pTNXFjeXdnWm05eUlIUm9aU0JpY205M2MyVnlMbHh1SUNwY2JpQXFJRUJoZFhSb2IzSWdJQ0JHWlhKdmMzTWdRV0p2ZFd0b1lXUnBhbVZvSUR4bVpYSnZjM05BWm1WeWIzTnpMbTl5Wno0Z1BHaDBkSEE2THk5bVpYSnZjM011YjNKblBseHVJQ29nUUd4cFkyVnVjMlVnSUUxSlZGeHVJQ292WEc1Y2JuWmhjaUJpWVhObE5qUWdQU0J5WlhGMWFYSmxLQ2RpWVhObE5qUXRhbk1uS1Z4dWRtRnlJR2xsWldVM05UUWdQU0J5WlhGMWFYSmxLQ2RwWldWbE56VTBKeWxjYmx4dVpYaHdiM0owY3k1Q2RXWm1aWElnUFNCQ2RXWm1aWEpjYm1WNGNHOXlkSE11VTJ4dmQwSjFabVpsY2lBOUlFSjFabVpsY2x4dVpYaHdiM0owY3k1SlRsTlFSVU5VWDAxQldGOUNXVlJGVXlBOUlEVXdYRzVDZFdabVpYSXVjRzl2YkZOcGVtVWdQU0E0TVRreVhHNWNiaThxS2x4dUlDb2dTV1lnWUVKMVptWmxjaTVmZFhObFZIbHdaV1JCY25KaGVYTmdPbHh1SUNvZ0lDQTlQVDBnZEhKMVpTQWdJQ0JWYzJVZ1ZXbHVkRGhCY25KaGVTQnBiWEJzWlcxbGJuUmhkR2x2YmlBb1ptRnpkR1Z6ZENsY2JpQXFJQ0FnUFQwOUlHWmhiSE5sSUNBZ1ZYTmxJRTlpYW1WamRDQnBiWEJzWlcxbGJuUmhkR2x2YmlBb1kyOXRjR0YwYVdKc1pTQmtiM2R1SUhSdklFbEZOaWxjYmlBcUwxeHVRblZtWm1WeUxsOTFjMlZVZVhCbFpFRnljbUY1Y3lBOUlDaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDOHZJRVJsZEdWamRDQnBaaUJpY205M2MyVnlJSE4xY0hCdmNuUnpJRlI1Y0dWa0lFRnljbUY1Y3k0Z1UzVndjRzl5ZEdWa0lHSnliM2R6WlhKeklHRnlaU0JKUlNBeE1Dc3NJRVpwY21WbWIzZ2dOQ3NzWEc0Z0lDOHZJRU5vY205dFpTQTNLeXdnVTJGbVlYSnBJRFV1TVNzc0lFOXdaWEpoSURFeExqWXJMQ0JwVDFNZ05DNHlLeTRnU1dZZ2RHaGxJR0p5YjNkelpYSWdaRzlsY3lCdWIzUWdjM1Z3Y0c5eWRDQmhaR1JwYm1kY2JpQWdMeThnY0hKdmNHVnlkR2xsY3lCMGJ5QmdWV2x1ZERoQmNuSmhlV0FnYVc1emRHRnVZMlZ6TENCMGFHVnVJSFJvWVhRbmN5QjBhR1VnYzJGdFpTQmhjeUJ1YnlCZ1ZXbHVkRGhCY25KaGVXQWdjM1Z3Y0c5eWRGeHVJQ0F2THlCaVpXTmhkWE5sSUhkbElHNWxaV1FnZEc4Z1ltVWdZV0pzWlNCMGJ5QmhaR1FnWVd4c0lIUm9aU0J1YjJSbElFSjFabVpsY2lCQlVFa2diV1YwYUc5a2N5NGdWR2hwY3lCcGN5QmhiaUJwYzNOMVpWeHVJQ0F2THlCcGJpQkdhWEpsWm05NElEUXRNamt1SUU1dmR5Qm1hWGhsWkRvZ2FIUjBjSE02THk5aWRXZDZhV3hzWVM1dGIzcHBiR3hoTG05eVp5OXphRzkzWDJKMVp5NWpaMmsvYVdROU5qazFORE00WEc0Z0lIUnllU0I3WEc0Z0lDQWdkbUZ5SUdKMVppQTlJRzVsZHlCQmNuSmhlVUoxWm1abGNpZ3dLVnh1SUNBZ0lIWmhjaUJoY25JZ1BTQnVaWGNnVldsdWREaEJjbkpoZVNoaWRXWXBYRzRnSUNBZ1lYSnlMbVp2YnlBOUlHWjFibU4wYVc5dUlDZ3BJSHNnY21WMGRYSnVJRFF5SUgxY2JpQWdJQ0J5WlhSMWNtNGdORElnUFQwOUlHRnljaTVtYjI4b0tTQW1KbHh1SUNBZ0lDQWdJQ0IwZVhCbGIyWWdZWEp5TG5OMVltRnljbUY1SUQwOVBTQW5ablZ1WTNScGIyNG5JQzh2SUVOb2NtOXRaU0E1TFRFd0lHeGhZMnNnWUhOMVltRnljbUY1WUZ4dUlDQjlJR05oZEdOb0lDaGxLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHWmhiSE5sWEc0Z0lIMWNibjBwS0NsY2JseHVMeW9xWEc0Z0tpQkRiR0Z6Y3pvZ1FuVm1abVZ5WEc0Z0tpQTlQVDA5UFQwOVBUMDlQVDA5WEc0Z0tseHVJQ29nVkdobElFSjFabVpsY2lCamIyNXpkSEoxWTNSdmNpQnlaWFIxY201eklHbHVjM1JoYm1ObGN5QnZaaUJnVldsdWREaEJjbkpoZVdBZ2RHaGhkQ0JoY21VZ1lYVm5iV1Z1ZEdWa1hHNGdLaUIzYVhSb0lHWjFibU4wYVc5dUlIQnliM0JsY25ScFpYTWdabTl5SUdGc2JDQjBhR1VnYm05a1pTQmdRblZtWm1WeVlDQkJVRWtnWm5WdVkzUnBiMjV6TGlCWFpTQjFjMlZjYmlBcUlHQlZhVzUwT0VGeWNtRjVZQ0J6YnlCMGFHRjBJSE54ZFdGeVpTQmljbUZqYTJWMElHNXZkR0YwYVc5dUlIZHZjbXR6SUdGeklHVjRjR1ZqZEdWa0lDMHRJR2wwSUhKbGRIVnlibk5jYmlBcUlHRWdjMmx1WjJ4bElHOWpkR1YwTGx4dUlDcGNiaUFxSUVKNUlHRjFaMjFsYm5ScGJtY2dkR2hsSUdsdWMzUmhibU5sY3l3Z2QyVWdZMkZ1SUdGMmIybGtJRzF2WkdsbWVXbHVaeUIwYUdVZ1lGVnBiblE0UVhKeVlYbGdYRzRnS2lCd2NtOTBiM1I1Y0dVdVhHNGdLaTljYm1aMWJtTjBhVzl1SUVKMVptWmxjaUFvYzNWaWFtVmpkQ3dnWlc1amIyUnBibWNzSUc1dldtVnlieWtnZTF4dUlDQnBaaUFvSVNoMGFHbHpJR2x1YzNSaGJtTmxiMllnUW5WbVptVnlLU2xjYmlBZ0lDQnlaWFIxY200Z2JtVjNJRUoxWm1abGNpaHpkV0pxWldOMExDQmxibU52WkdsdVp5d2dibTlhWlhKdktWeHVYRzRnSUhaaGNpQjBlWEJsSUQwZ2RIbHdaVzltSUhOMVltcGxZM1JjYmx4dUlDQXZMeUJYYjNKcllYSnZkVzVrT2lCdWIyUmxKM01nWW1GelpUWTBJR2x0Y0d4bGJXVnVkR0YwYVc5dUlHRnNiRzkzY3lCbWIzSWdibTl1TFhCaFpHUmxaQ0J6ZEhKcGJtZHpYRzRnSUM4dklIZG9hV3hsSUdKaGMyVTJOQzFxY3lCa2IyVnpJRzV2ZEM1Y2JpQWdhV1lnS0dWdVkyOWthVzVuSUQwOVBTQW5ZbUZ6WlRZMEp5QW1KaUIwZVhCbElEMDlQU0FuYzNSeWFXNW5KeWtnZTF4dUlDQWdJSE4xWW1wbFkzUWdQU0J6ZEhKcGJtZDBjbWx0S0hOMVltcGxZM1FwWEc0Z0lDQWdkMmhwYkdVZ0tITjFZbXBsWTNRdWJHVnVaM1JvSUNVZ05DQWhQVDBnTUNrZ2UxeHVJQ0FnSUNBZ2MzVmlhbVZqZENBOUlITjFZbXBsWTNRZ0t5QW5QU2RjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0F2THlCR2FXNWtJSFJvWlNCc1pXNW5kR2hjYmlBZ2RtRnlJR3hsYm1kMGFGeHVJQ0JwWmlBb2RIbHdaU0E5UFQwZ0oyNTFiV0psY2ljcFhHNGdJQ0FnYkdWdVozUm9JRDBnWTI5bGNtTmxLSE4xWW1wbFkzUXBYRzRnSUdWc2MyVWdhV1lnS0hSNWNHVWdQVDA5SUNkemRISnBibWNuS1Z4dUlDQWdJR3hsYm1kMGFDQTlJRUoxWm1abGNpNWllWFJsVEdWdVozUm9LSE4xWW1wbFkzUXNJR1Z1WTI5a2FXNW5LVnh1SUNCbGJITmxJR2xtSUNoMGVYQmxJRDA5UFNBbmIySnFaV04wSnlsY2JpQWdJQ0JzWlc1bmRHZ2dQU0JqYjJWeVkyVW9jM1ZpYW1WamRDNXNaVzVuZEdncElDOHZJR0Z6YzNWdFpTQjBhR0YwSUc5aWFtVmpkQ0JwY3lCaGNuSmhlUzFzYVd0bFhHNGdJR1ZzYzJWY2JpQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMFpwY25OMElHRnlaM1Z0Wlc1MElHNWxaV1J6SUhSdklHSmxJR0VnYm5WdFltVnlMQ0JoY25KaGVTQnZjaUJ6ZEhKcGJtY3VKeWxjYmx4dUlDQjJZWElnWW5WbVhHNGdJR2xtSUNoQ2RXWm1aWEl1WDNWelpWUjVjR1ZrUVhKeVlYbHpLU0I3WEc0Z0lDQWdMeThnVUhKbFptVnljbVZrT2lCU1pYUjFjbTRnWVc0Z1lYVm5iV1Z1ZEdWa0lHQlZhVzUwT0VGeWNtRjVZQ0JwYm5OMFlXNWpaU0JtYjNJZ1ltVnpkQ0J3WlhKbWIzSnRZVzVqWlZ4dUlDQWdJR0oxWmlBOUlFSjFabVpsY2k1ZllYVm5iV1Z1ZENodVpYY2dWV2x1ZERoQmNuSmhlU2hzWlc1bmRHZ3BLVnh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJQzh2SUVaaGJHeGlZV05yT2lCU1pYUjFjbTRnVkVoSlV5QnBibk4wWVc1alpTQnZaaUJDZFdabVpYSWdLR055WldGMFpXUWdZbmtnWUc1bGQyQXBYRzRnSUNBZ1luVm1JRDBnZEdocGMxeHVJQ0FnSUdKMVppNXNaVzVuZEdnZ1BTQnNaVzVuZEdoY2JpQWdJQ0JpZFdZdVgybHpRblZtWm1WeUlEMGdkSEoxWlZ4dUlDQjlYRzVjYmlBZ2RtRnlJR2xjYmlBZ2FXWWdLRUoxWm1abGNpNWZkWE5sVkhsd1pXUkJjbkpoZVhNZ0ppWWdkSGx3Wlc5bUlITjFZbXBsWTNRdVlubDBaVXhsYm1kMGFDQTlQVDBnSjI1MWJXSmxjaWNwSUh0Y2JpQWdJQ0F2THlCVGNHVmxaQ0J2Y0hScGJXbDZZWFJwYjI0Z0xTMGdkWE5sSUhObGRDQnBaaUIzWlNkeVpTQmpiM0I1YVc1bklHWnliMjBnWVNCMGVYQmxaQ0JoY25KaGVWeHVJQ0FnSUdKMVppNWZjMlYwS0hOMVltcGxZM1FwWEc0Z0lIMGdaV3h6WlNCcFppQW9hWE5CY25KaGVXbHphQ2h6ZFdKcVpXTjBLU2tnZTF4dUlDQWdJQzh2SUZSeVpXRjBJR0Z5Y21GNUxXbHphQ0J2WW1wbFkzUnpJR0Z6SUdFZ1lubDBaU0JoY25KaGVWeHVJQ0FnSUdadmNpQW9hU0E5SURBN0lHa2dQQ0JzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ2FXWWdLRUoxWm1abGNpNXBjMEoxWm1abGNpaHpkV0pxWldOMEtTbGNiaUFnSUNBZ0lDQWdZblZtVzJsZElEMGdjM1ZpYW1WamRDNXlaV0ZrVlVsdWREZ29hU2xjYmlBZ0lDQWdJR1ZzYzJWY2JpQWdJQ0FnSUNBZ1luVm1XMmxkSUQwZ2MzVmlhbVZqZEZ0cFhWeHVJQ0FnSUgxY2JpQWdmU0JsYkhObElHbG1JQ2gwZVhCbElEMDlQU0FuYzNSeWFXNW5KeWtnZTF4dUlDQWdJR0oxWmk1M2NtbDBaU2h6ZFdKcVpXTjBMQ0F3TENCbGJtTnZaR2x1WnlsY2JpQWdmU0JsYkhObElHbG1JQ2gwZVhCbElEMDlQU0FuYm5WdFltVnlKeUFtSmlBaFFuVm1abVZ5TGw5MWMyVlVlWEJsWkVGeWNtRjVjeUFtSmlBaGJtOWFaWEp2S1NCN1hHNGdJQ0FnWm05eUlDaHBJRDBnTURzZ2FTQThJR3hsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNCaWRXWmJhVjBnUFNBd1hHNGdJQ0FnZlZ4dUlDQjlYRzVjYmlBZ2NtVjBkWEp1SUdKMVpseHVmVnh1WEc0dkx5QlRWRUZVU1VNZ1RVVlVTRTlFVTF4dUx5OGdQVDA5UFQwOVBUMDlQVDA5UFQxY2JseHVRblZtWm1WeUxtbHpSVzVqYjJScGJtY2dQU0JtZFc1amRHbHZiaUFvWlc1amIyUnBibWNwSUh0Y2JpQWdjM2RwZEdOb0lDaFRkSEpwYm1jb1pXNWpiMlJwYm1jcExuUnZURzkzWlhKRFlYTmxLQ2twSUh0Y2JpQWdJQ0JqWVhObElDZG9aWGduT2x4dUlDQWdJR05oYzJVZ0ozVjBaamduT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTA0SnpwY2JpQWdJQ0JqWVhObElDZGhjMk5wYVNjNlhHNGdJQ0FnWTJGelpTQW5ZbWx1WVhKNUp6cGNiaUFnSUNCallYTmxJQ2RpWVhObE5qUW5PbHh1SUNBZ0lHTmhjMlVnSjNKaGR5YzZYRzRnSUNBZ1kyRnpaU0FuZFdOek1pYzZYRzRnSUNBZ1kyRnpaU0FuZFdOekxUSW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFpqRTJiR1VuT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTB4Tm14bEp6cGNiaUFnSUNBZ0lISmxkSFZ5YmlCMGNuVmxYRzRnSUNBZ1pHVm1ZWFZzZERwY2JpQWdJQ0FnSUhKbGRIVnliaUJtWVd4elpWeHVJQ0I5WEc1OVhHNWNia0oxWm1abGNpNXBjMEoxWm1abGNpQTlJR1oxYm1OMGFXOXVJQ2hpS1NCN1hHNGdJSEpsZEhWeWJpQWhJU2hpSUNFOVBTQnVkV3hzSUNZbUlHSWdJVDA5SUhWdVpHVm1hVzVsWkNBbUppQmlMbDlwYzBKMVptWmxjaWxjYm4xY2JseHVRblZtWm1WeUxtSjVkR1ZNWlc1bmRHZ2dQU0JtZFc1amRHbHZiaUFvYzNSeUxDQmxibU52WkdsdVp5a2dlMXh1SUNCMllYSWdjbVYwWEc0Z0lITjBjaUE5SUhOMGNpQXJJQ2NuWEc0Z0lITjNhWFJqYUNBb1pXNWpiMlJwYm1jZ2ZId2dKM1YwWmpnbktTQjdYRzRnSUNBZ1kyRnpaU0FuYUdWNEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUhOMGNpNXNaVzVuZEdnZ0x5QXlYRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0ozVjBaamduT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTA0SnpwY2JpQWdJQ0FnSUhKbGRDQTlJSFYwWmpoVWIwSjVkR1Z6S0hOMGNpa3ViR1Z1WjNSb1hHNGdJQ0FnSUNCaWNtVmhhMXh1SUNBZ0lHTmhjMlVnSjJGelkybHBKenBjYmlBZ0lDQmpZWE5sSUNkaWFXNWhjbmtuT2x4dUlDQWdJR05oYzJVZ0ozSmhkeWM2WEc0Z0lDQWdJQ0J5WlhRZ1BTQnpkSEl1YkdWdVozUm9YRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0oySmhjMlUyTkNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JpWVhObE5qUlViMEo1ZEdWektITjBjaWt1YkdWdVozUm9YRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0ozVmpjekluT2x4dUlDQWdJR05oYzJVZ0ozVmpjeTB5SnpwY2JpQWdJQ0JqWVhObElDZDFkR1l4Tm14bEp6cGNiaUFnSUNCallYTmxJQ2QxZEdZdE1UWnNaU2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQnpkSEl1YkdWdVozUm9JQ29nTWx4dUlDQWdJQ0FnWW5KbFlXdGNiaUFnSUNCa1pXWmhkV3gwT2x4dUlDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RWYm10dWIzZHVJR1Z1WTI5a2FXNW5KeWxjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdjbVYwWEc1OVhHNWNia0oxWm1abGNpNWpiMjVqWVhRZ1BTQm1kVzVqZEdsdmJpQW9iR2x6ZEN3Z2RHOTBZV3hNWlc1bmRHZ3BJSHRjYmlBZ1lYTnpaWEowS0dselFYSnlZWGtvYkdsemRDa3NJQ2RWYzJGblpUb2dRblZtWm1WeUxtTnZibU5oZENoc2FYTjBMQ0JiZEc5MFlXeE1aVzVuZEdoZEtWeGNiaWNnSzF4dUlDQWdJQ0FnSjJ4cGMzUWdjMmh2ZFd4a0lHSmxJR0Z1SUVGeWNtRjVMaWNwWEc1Y2JpQWdhV1lnS0d4cGMzUXViR1Z1WjNSb0lEMDlQU0F3S1NCN1hHNGdJQ0FnY21WMGRYSnVJRzVsZHlCQ2RXWm1aWElvTUNsY2JpQWdmU0JsYkhObElHbG1JQ2hzYVhOMExteGxibWQwYUNBOVBUMGdNU2tnZTF4dUlDQWdJSEpsZEhWeWJpQnNhWE4wV3pCZFhHNGdJSDFjYmx4dUlDQjJZWElnYVZ4dUlDQnBaaUFvZEhsd1pXOW1JSFJ2ZEdGc1RHVnVaM1JvSUNFOVBTQW5iblZ0WW1WeUp5a2dlMXh1SUNBZ0lIUnZkR0ZzVEdWdVozUm9JRDBnTUZ4dUlDQWdJR1p2Y2lBb2FTQTlJREE3SUdrZ1BDQnNhWE4wTG14bGJtZDBhRHNnYVNzcktTQjdYRzRnSUNBZ0lDQjBiM1JoYkV4bGJtZDBhQ0FyUFNCc2FYTjBXMmxkTG14bGJtZDBhRnh1SUNBZ0lIMWNiaUFnZlZ4dVhHNGdJSFpoY2lCaWRXWWdQU0J1WlhjZ1FuVm1abVZ5S0hSdmRHRnNUR1Z1WjNSb0tWeHVJQ0IyWVhJZ2NHOXpJRDBnTUZ4dUlDQm1iM0lnS0drZ1BTQXdPeUJwSUR3Z2JHbHpkQzVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUhaaGNpQnBkR1Z0SUQwZ2JHbHpkRnRwWFZ4dUlDQWdJR2wwWlcwdVkyOXdlU2hpZFdZc0lIQnZjeWxjYmlBZ0lDQndiM01nS3owZ2FYUmxiUzVzWlc1bmRHaGNiaUFnZlZ4dUlDQnlaWFIxY200Z1luVm1YRzU5WEc1Y2JpOHZJRUpWUmtaRlVpQkpUbE5VUVU1RFJTQk5SVlJJVDBSVFhHNHZMeUE5UFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFQwOVBWeHVYRzVtZFc1amRHbHZiaUJmYUdWNFYzSnBkR1VnS0dKMVppd2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNrZ2UxeHVJQ0J2Wm1aelpYUWdQU0JPZFcxaVpYSW9iMlptYzJWMEtTQjhmQ0F3WEc0Z0lIWmhjaUJ5WlcxaGFXNXBibWNnUFNCaWRXWXViR1Z1WjNSb0lDMGdiMlptYzJWMFhHNGdJR2xtSUNnaGJHVnVaM1JvS1NCN1hHNGdJQ0FnYkdWdVozUm9JRDBnY21WdFlXbHVhVzVuWEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnYkdWdVozUm9JRDBnVG5WdFltVnlLR3hsYm1kMGFDbGNiaUFnSUNCcFppQW9iR1Z1WjNSb0lENGdjbVZ0WVdsdWFXNW5LU0I3WEc0Z0lDQWdJQ0JzWlc1bmRHZ2dQU0J5WlcxaGFXNXBibWRjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0F2THlCdGRYTjBJR0psSUdGdUlHVjJaVzRnYm5WdFltVnlJRzltSUdScFoybDBjMXh1SUNCMllYSWdjM1J5VEdWdUlEMGdjM1J5YVc1bkxteGxibWQwYUZ4dUlDQmhjM05sY25Rb2MzUnlUR1Z1SUNVZ01pQTlQVDBnTUN3Z0owbHVkbUZzYVdRZ2FHVjRJSE4wY21sdVp5Y3BYRzVjYmlBZ2FXWWdLR3hsYm1kMGFDQStJSE4wY2t4bGJpQXZJRElwSUh0Y2JpQWdJQ0JzWlc1bmRHZ2dQU0J6ZEhKTVpXNGdMeUF5WEc0Z0lIMWNiaUFnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCc1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lIWmhjaUJpZVhSbElEMGdjR0Z5YzJWSmJuUW9jM1J5YVc1bkxuTjFZbk4wY2locElDb2dNaXdnTWlrc0lERTJLVnh1SUNBZ0lHRnpjMlZ5ZENnaGFYTk9ZVTRvWW5sMFpTa3NJQ2RKYm5aaGJHbGtJR2hsZUNCemRISnBibWNuS1Z4dUlDQWdJR0oxWmx0dlptWnpaWFFnS3lCcFhTQTlJR0o1ZEdWY2JpQWdmVnh1SUNCQ2RXWm1aWEl1WDJOb1lYSnpWM0pwZEhSbGJpQTlJR2tnS2lBeVhHNGdJSEpsZEhWeWJpQnBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTFkR1k0VjNKcGRHVWdLR0oxWml3Z2MzUnlhVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2tnZTF4dUlDQjJZWElnWTJoaGNuTlhjbWwwZEdWdUlEMGdRblZtWm1WeUxsOWphR0Z5YzFkeWFYUjBaVzRnUFZ4dUlDQWdJR0pzYVhSQ2RXWm1aWElvZFhSbU9GUnZRbmwwWlhNb2MzUnlhVzVuS1N3Z1luVm1MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDbGNiaUFnY21WMGRYSnVJR05vWVhKelYzSnBkSFJsYmx4dWZWeHVYRzVtZFc1amRHbHZiaUJmWVhOamFXbFhjbWwwWlNBb1luVm1MQ0J6ZEhKcGJtY3NJRzltWm5ObGRDd2diR1Z1WjNSb0tTQjdYRzRnSUhaaGNpQmphR0Z5YzFkeWFYUjBaVzRnUFNCQ2RXWm1aWEl1WDJOb1lYSnpWM0pwZEhSbGJpQTlYRzRnSUNBZ1lteHBkRUoxWm1abGNpaGhjMk5wYVZSdlFubDBaWE1vYzNSeWFXNW5LU3dnWW5WbUxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdjbVYwZFhKdUlHTm9ZWEp6VjNKcGRIUmxibHh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZZbWx1WVhKNVYzSnBkR1VnS0dKMVppd2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNrZ2UxeHVJQ0J5WlhSMWNtNGdYMkZ6WTJscFYzSnBkR1VvWW5WbUxDQnpkSEpwYm1jc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJmWW1GelpUWTBWM0pwZEdVZ0tHSjFaaXdnYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDa2dlMXh1SUNCMllYSWdZMmhoY25OWGNtbDBkR1Z1SUQwZ1FuVm1abVZ5TGw5amFHRnljMWR5YVhSMFpXNGdQVnh1SUNBZ0lHSnNhWFJDZFdabVpYSW9ZbUZ6WlRZMFZHOUNlWFJsY3loemRISnBibWNwTENCaWRXWXNJRzltWm5ObGRDd2diR1Z1WjNSb0tWeHVJQ0J5WlhSMWNtNGdZMmhoY25OWGNtbDBkR1Z1WEc1OVhHNWNibVoxYm1OMGFXOXVJRjkxZEdZeE5teGxWM0pwZEdVZ0tHSjFaaXdnYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDa2dlMXh1SUNCMllYSWdZMmhoY25OWGNtbDBkR1Z1SUQwZ1FuVm1abVZ5TGw5amFHRnljMWR5YVhSMFpXNGdQVnh1SUNBZ0lHSnNhWFJDZFdabVpYSW9kWFJtTVRac1pWUnZRbmwwWlhNb2MzUnlhVzVuS1N3Z1luVm1MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDbGNiaUFnY21WMGRYSnVJR05vWVhKelYzSnBkSFJsYmx4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbElEMGdablZ1WTNScGIyNGdLSE4wY21sdVp5d2diMlptYzJWMExDQnNaVzVuZEdnc0lHVnVZMjlrYVc1bktTQjdYRzRnSUM4dklGTjFjSEJ2Y25RZ1ltOTBhQ0FvYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDd2daVzVqYjJScGJtY3BYRzRnSUM4dklHRnVaQ0IwYUdVZ2JHVm5ZV041SUNoemRISnBibWNzSUdWdVkyOWthVzVuTENCdlptWnpaWFFzSUd4bGJtZDBhQ2xjYmlBZ2FXWWdLR2x6Um1sdWFYUmxLRzltWm5ObGRDa3BJSHRjYmlBZ0lDQnBaaUFvSVdselJtbHVhWFJsS0d4bGJtZDBhQ2twSUh0Y2JpQWdJQ0FnSUdWdVkyOWthVzVuSUQwZ2JHVnVaM1JvWEc0Z0lDQWdJQ0JzWlc1bmRHZ2dQU0IxYm1SbFptbHVaV1JjYmlBZ0lDQjlYRzRnSUgwZ1pXeHpaU0I3SUNBdkx5QnNaV2RoWTNsY2JpQWdJQ0IyWVhJZ2MzZGhjQ0E5SUdWdVkyOWthVzVuWEc0Z0lDQWdaVzVqYjJScGJtY2dQU0J2Wm1aelpYUmNiaUFnSUNCdlptWnpaWFFnUFNCc1pXNW5kR2hjYmlBZ0lDQnNaVzVuZEdnZ1BTQnpkMkZ3WEc0Z0lIMWNibHh1SUNCdlptWnpaWFFnUFNCT2RXMWlaWElvYjJabWMyVjBLU0I4ZkNBd1hHNGdJSFpoY2lCeVpXMWhhVzVwYm1jZ1BTQjBhR2x6TG14bGJtZDBhQ0F0SUc5bVpuTmxkRnh1SUNCcFppQW9JV3hsYm1kMGFDa2dlMXh1SUNBZ0lHeGxibWQwYUNBOUlISmxiV0ZwYm1sdVoxeHVJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lHeGxibWQwYUNBOUlFNTFiV0psY2loc1pXNW5kR2dwWEc0Z0lDQWdhV1lnS0d4bGJtZDBhQ0ErSUhKbGJXRnBibWx1WnlrZ2UxeHVJQ0FnSUNBZ2JHVnVaM1JvSUQwZ2NtVnRZV2x1YVc1blhHNGdJQ0FnZlZ4dUlDQjlYRzRnSUdWdVkyOWthVzVuSUQwZ1UzUnlhVzVuS0dWdVkyOWthVzVuSUh4OElDZDFkR1k0SnlrdWRHOU1iM2RsY2tOaGMyVW9LVnh1WEc0Z0lIWmhjaUJ5WlhSY2JpQWdjM2RwZEdOb0lDaGxibU52WkdsdVp5a2dlMXh1SUNBZ0lHTmhjMlVnSjJobGVDYzZYRzRnSUNBZ0lDQnlaWFFnUFNCZmFHVjRWM0pwZEdVb2RHaHBjeXdnYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDbGNiaUFnSUNBZ0lHSnlaV0ZyWEc0Z0lDQWdZMkZ6WlNBbmRYUm1PQ2M2WEc0Z0lDQWdZMkZ6WlNBbmRYUm1MVGduT2x4dUlDQWdJQ0FnY21WMElEMGdYM1YwWmpoWGNtbDBaU2gwYUdsekxDQnpkSEpwYm1jc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1Z4dUlDQWdJQ0FnWW5KbFlXdGNiaUFnSUNCallYTmxJQ2RoYzJOcGFTYzZYRzRnSUNBZ0lDQnlaWFFnUFNCZllYTmphV2xYY21sMFpTaDBhR2x6TENCemRISnBibWNzSUc5bVpuTmxkQ3dnYkdWdVozUm9LVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGlhVzVoY25rbk9seHVJQ0FnSUNBZ2NtVjBJRDBnWDJKcGJtRnllVmR5YVhSbEtIUm9hWE1zSUhOMGNtbHVaeXdnYjJabWMyVjBMQ0JzWlc1bmRHZ3BYRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0oySmhjMlUyTkNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmWW1GelpUWTBWM0pwZEdVb2RHaHBjeXdnYzNSeWFXNW5MQ0J2Wm1aelpYUXNJR3hsYm1kMGFDbGNiaUFnSUNBZ0lHSnlaV0ZyWEc0Z0lDQWdZMkZ6WlNBbmRXTnpNaWM2WEc0Z0lDQWdZMkZ6WlNBbmRXTnpMVEluT2x4dUlDQWdJR05oYzJVZ0ozVjBaakUyYkdVbk9seHVJQ0FnSUdOaGMyVWdKM1YwWmkweE5teGxKenBjYmlBZ0lDQWdJSEpsZENBOUlGOTFkR1l4Tm14bFYzSnBkR1VvZEdocGN5d2djM1J5YVc1bkxDQnZabVp6WlhRc0lHeGxibWQwYUNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1pHVm1ZWFZzZERwY2JpQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduVlc1cmJtOTNiaUJsYm1OdlpHbHVaeWNwWEc0Z0lIMWNiaUFnY21WMGRYSnVJSEpsZEZ4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5JRDBnWm5WdVkzUnBiMjRnS0dWdVkyOWthVzVuTENCemRHRnlkQ3dnWlc1a0tTQjdYRzRnSUhaaGNpQnpaV3htSUQwZ2RHaHBjMXh1WEc0Z0lHVnVZMjlrYVc1bklEMGdVM1J5YVc1bktHVnVZMjlrYVc1bklIeDhJQ2QxZEdZNEp5a3VkRzlNYjNkbGNrTmhjMlVvS1Z4dUlDQnpkR0Z5ZENBOUlFNTFiV0psY2loemRHRnlkQ2tnZkh3Z01GeHVJQ0JsYm1RZ1BTQW9aVzVrSUNFOVBTQjFibVJsWm1sdVpXUXBYRzRnSUNBZ1B5Qk9kVzFpWlhJb1pXNWtLVnh1SUNBZ0lEb2daVzVrSUQwZ2MyVnNaaTVzWlc1bmRHaGNibHh1SUNBdkx5QkdZWE4wY0dGMGFDQmxiWEIwZVNCemRISnBibWR6WEc0Z0lHbG1JQ2hsYm1RZ1BUMDlJSE4wWVhKMEtWeHVJQ0FnSUhKbGRIVnliaUFuSjF4dVhHNGdJSFpoY2lCeVpYUmNiaUFnYzNkcGRHTm9JQ2hsYm1OdlpHbHVaeWtnZTF4dUlDQWdJR05oYzJVZ0oyaGxlQ2M2WEc0Z0lDQWdJQ0J5WlhRZ1BTQmZhR1Y0VTJ4cFkyVW9jMlZzWml3Z2MzUmhjblFzSUdWdVpDbGNiaUFnSUNBZ0lHSnlaV0ZyWEc0Z0lDQWdZMkZ6WlNBbmRYUm1PQ2M2WEc0Z0lDQWdZMkZ6WlNBbmRYUm1MVGduT2x4dUlDQWdJQ0FnY21WMElEMGdYM1YwWmpoVGJHbGpaU2h6Wld4bUxDQnpkR0Z5ZEN3Z1pXNWtLVnh1SUNBZ0lDQWdZbkpsWVd0Y2JpQWdJQ0JqWVhObElDZGhjMk5wYVNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmWVhOamFXbFRiR2xqWlNoelpXeG1MQ0J6ZEdGeWRDd2daVzVrS1Z4dUlDQWdJQ0FnWW5KbFlXdGNiaUFnSUNCallYTmxJQ2RpYVc1aGNua25PbHh1SUNBZ0lDQWdjbVYwSUQwZ1gySnBibUZ5ZVZOc2FXTmxLSE5sYkdZc0lITjBZWEowTENCbGJtUXBYRzRnSUNBZ0lDQmljbVZoYTF4dUlDQWdJR05oYzJVZ0oySmhjMlUyTkNjNlhHNGdJQ0FnSUNCeVpYUWdQU0JmWW1GelpUWTBVMnhwWTJVb2MyVnNaaXdnYzNSaGNuUXNJR1Z1WkNsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1kyRnpaU0FuZFdOek1pYzZYRzRnSUNBZ1kyRnpaU0FuZFdOekxUSW5PbHh1SUNBZ0lHTmhjMlVnSjNWMFpqRTJiR1VuT2x4dUlDQWdJR05oYzJVZ0ozVjBaaTB4Tm14bEp6cGNiaUFnSUNBZ0lISmxkQ0E5SUY5MWRHWXhObXhsVTJ4cFkyVW9jMlZzWml3Z2MzUmhjblFzSUdWdVpDbGNiaUFnSUNBZ0lHSnlaV0ZyWEc0Z0lDQWdaR1ZtWVhWc2REcGNiaUFnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblZXNXJibTkzYmlCbGJtTnZaR2x1WnljcFhHNGdJSDFjYmlBZ2NtVjBkWEp1SUhKbGRGeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5SdlNsTlBUaUE5SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnY21WMGRYSnVJSHRjYmlBZ0lDQjBlWEJsT2lBblFuVm1abVZ5Snl4Y2JpQWdJQ0JrWVhSaE9pQkJjbkpoZVM1d2NtOTBiM1I1Y0dVdWMyeHBZMlV1WTJGc2JDaDBhR2x6TGw5aGNuSWdmSHdnZEdocGN5d2dNQ2xjYmlBZ2ZWeHVmVnh1WEc0dkx5QmpiM0I1S0hSaGNtZGxkRUoxWm1abGNpd2dkR0Z5WjJWMFUzUmhjblE5TUN3Z2MyOTFjbU5sVTNSaGNuUTlNQ3dnYzI5MWNtTmxSVzVrUFdKMVptWmxjaTVzWlc1bmRHZ3BYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbU52Y0hrZ1BTQm1kVzVqZEdsdmJpQW9kR0Z5WjJWMExDQjBZWEpuWlhSZmMzUmhjblFzSUhOMFlYSjBMQ0JsYm1RcElIdGNiaUFnZG1GeUlITnZkWEpqWlNBOUlIUm9hWE5jYmx4dUlDQnBaaUFvSVhOMFlYSjBLU0J6ZEdGeWRDQTlJREJjYmlBZ2FXWWdLQ0ZsYm1RZ0ppWWdaVzVrSUNFOVBTQXdLU0JsYm1RZ1BTQjBhR2x6TG14bGJtZDBhRnh1SUNCcFppQW9JWFJoY21kbGRGOXpkR0Z5ZENrZ2RHRnlaMlYwWDNOMFlYSjBJRDBnTUZ4dVhHNGdJQzh2SUVOdmNIa2dNQ0JpZVhSbGN6c2dkMlVuY21VZ1pHOXVaVnh1SUNCcFppQW9aVzVrSUQwOVBTQnpkR0Z5ZENrZ2NtVjBkWEp1WEc0Z0lHbG1JQ2gwWVhKblpYUXViR1Z1WjNSb0lEMDlQU0F3SUh4OElITnZkWEpqWlM1c1pXNW5kR2dnUFQwOUlEQXBJSEpsZEhWeWJseHVYRzRnSUM4dklFWmhkR0ZzSUdWeWNtOXlJR052Ym1ScGRHbHZibk5jYmlBZ1lYTnpaWEowS0dWdVpDQStQU0J6ZEdGeWRDd2dKM052ZFhKalpVVnVaQ0E4SUhOdmRYSmpaVk4wWVhKMEp5bGNiaUFnWVhOelpYSjBLSFJoY21kbGRGOXpkR0Z5ZENBK1BTQXdJQ1ltSUhSaGNtZGxkRjl6ZEdGeWRDQThJSFJoY21kbGRDNXNaVzVuZEdnc1hHNGdJQ0FnSUNBbmRHRnlaMlYwVTNSaGNuUWdiM1YwSUc5bUlHSnZkVzVrY3ljcFhHNGdJR0Z6YzJWeWRDaHpkR0Z5ZENBK1BTQXdJQ1ltSUhOMFlYSjBJRHdnYzI5MWNtTmxMbXhsYm1kMGFDd2dKM052ZFhKalpWTjBZWEowSUc5MWRDQnZaaUJpYjNWdVpITW5LVnh1SUNCaGMzTmxjblFvWlc1a0lENDlJREFnSmlZZ1pXNWtJRHc5SUhOdmRYSmpaUzVzWlc1bmRHZ3NJQ2R6YjNWeVkyVkZibVFnYjNWMElHOW1JR0p2ZFc1a2N5Y3BYRzVjYmlBZ0x5OGdRWEpsSUhkbElHOXZZajljYmlBZ2FXWWdLR1Z1WkNBK0lIUm9hWE11YkdWdVozUm9LVnh1SUNBZ0lHVnVaQ0E5SUhSb2FYTXViR1Z1WjNSb1hHNGdJR2xtSUNoMFlYSm5aWFF1YkdWdVozUm9JQzBnZEdGeVoyVjBYM04wWVhKMElEd2daVzVrSUMwZ2MzUmhjblFwWEc0Z0lDQWdaVzVrSUQwZ2RHRnlaMlYwTG14bGJtZDBhQ0F0SUhSaGNtZGxkRjl6ZEdGeWRDQXJJSE4wWVhKMFhHNWNiaUFnZG1GeUlHeGxiaUE5SUdWdVpDQXRJSE4wWVhKMFhHNWNiaUFnYVdZZ0tHeGxiaUE4SURFd01DQjhmQ0FoUW5WbVptVnlMbDkxYzJWVWVYQmxaRUZ5Y21GNWN5a2dlMXh1SUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2diR1Z1T3lCcEt5c3BYRzRnSUNBZ0lDQjBZWEpuWlhSYmFTQXJJSFJoY21kbGRGOXpkR0Z5ZEYwZ1BTQjBhR2x6VzJrZ0t5QnpkR0Z5ZEYxY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCMFlYSm5aWFF1WDNObGRDaDBhR2x6TG5OMVltRnljbUY1S0hOMFlYSjBMQ0J6ZEdGeWRDQXJJR3hsYmlrc0lIUmhjbWRsZEY5emRHRnlkQ2xjYmlBZ2ZWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZlltRnpaVFkwVTJ4cFkyVWdLR0oxWml3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCcFppQW9jM1JoY25RZ1BUMDlJREFnSmlZZ1pXNWtJRDA5UFNCaWRXWXViR1Z1WjNSb0tTQjdYRzRnSUNBZ2NtVjBkWEp1SUdKaGMyVTJOQzVtY205dFFubDBaVUZ5Y21GNUtHSjFaaWxjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0J5WlhSMWNtNGdZbUZ6WlRZMExtWnliMjFDZVhSbFFYSnlZWGtvWW5WbUxuTnNhV05sS0hOMFlYSjBMQ0JsYm1RcEtWeHVJQ0I5WEc1OVhHNWNibVoxYm1OMGFXOXVJRjkxZEdZNFUyeHBZMlVnS0dKMVppd2djM1JoY25Rc0lHVnVaQ2tnZTF4dUlDQjJZWElnY21WeklEMGdKeWRjYmlBZ2RtRnlJSFJ0Y0NBOUlDY25YRzRnSUdWdVpDQTlJRTFoZEdndWJXbHVLR0oxWmk1c1pXNW5kR2dzSUdWdVpDbGNibHh1SUNCbWIzSWdLSFpoY2lCcElEMGdjM1JoY25RN0lHa2dQQ0JsYm1RN0lHa3JLeWtnZTF4dUlDQWdJR2xtSUNoaWRXWmJhVjBnUEQwZ01IZzNSaWtnZTF4dUlDQWdJQ0FnY21WeklDczlJR1JsWTI5a1pWVjBaamhEYUdGeUtIUnRjQ2tnS3lCVGRISnBibWN1Wm5KdmJVTm9ZWEpEYjJSbEtHSjFabHRwWFNsY2JpQWdJQ0FnSUhSdGNDQTlJQ2NuWEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lIUnRjQ0FyUFNBbkpTY2dLeUJpZFdaYmFWMHVkRzlUZEhKcGJtY29NVFlwWEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnY21WMGRYSnVJSEpsY3lBcklHUmxZMjlrWlZWMFpqaERhR0Z5S0hSdGNDbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1gyRnpZMmxwVTJ4cFkyVWdLR0oxWml3Z2MzUmhjblFzSUdWdVpDa2dlMXh1SUNCMllYSWdjbVYwSUQwZ0p5ZGNiaUFnWlc1a0lEMGdUV0YwYUM1dGFXNG9ZblZtTG14bGJtZDBhQ3dnWlc1a0tWeHVYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQnpkR0Z5ZERzZ2FTQThJR1Z1WkRzZ2FTc3JLVnh1SUNBZ0lISmxkQ0FyUFNCVGRISnBibWN1Wm5KdmJVTm9ZWEpEYjJSbEtHSjFabHRwWFNsY2JpQWdjbVYwZFhKdUlISmxkRnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZZbWx1WVhKNVUyeHBZMlVnS0dKMVppd2djM1JoY25Rc0lHVnVaQ2tnZTF4dUlDQnlaWFIxY200Z1gyRnpZMmxwVTJ4cFkyVW9ZblZtTENCemRHRnlkQ3dnWlc1a0tWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmFHVjRVMnhwWTJVZ0tHSjFaaXdnYzNSaGNuUXNJR1Z1WkNrZ2UxeHVJQ0IyWVhJZ2JHVnVJRDBnWW5WbUxteGxibWQwYUZ4dVhHNGdJR2xtSUNnaGMzUmhjblFnZkh3Z2MzUmhjblFnUENBd0tTQnpkR0Z5ZENBOUlEQmNiaUFnYVdZZ0tDRmxibVFnZkh3Z1pXNWtJRHdnTUNCOGZDQmxibVFnUGlCc1pXNHBJR1Z1WkNBOUlHeGxibHh1WEc0Z0lIWmhjaUJ2ZFhRZ1BTQW5KMXh1SUNCbWIzSWdLSFpoY2lCcElEMGdjM1JoY25RN0lHa2dQQ0JsYm1RN0lHa3JLeWtnZTF4dUlDQWdJRzkxZENBclBTQjBiMGhsZUNoaWRXWmJhVjBwWEc0Z0lIMWNiaUFnY21WMGRYSnVJRzkxZEZ4dWZWeHVYRzVtZFc1amRHbHZiaUJmZFhSbU1UWnNaVk5zYVdObElDaGlkV1lzSUhOMFlYSjBMQ0JsYm1RcElIdGNiaUFnZG1GeUlHSjVkR1Z6SUQwZ1luVm1Mbk5zYVdObEtITjBZWEowTENCbGJtUXBYRzRnSUhaaGNpQnlaWE1nUFNBbkoxeHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUdKNWRHVnpMbXhsYm1kMGFEc2dhU0FyUFNBeUtTQjdYRzRnSUNBZ2NtVnpJQ3M5SUZOMGNtbHVaeTVtY205dFEyaGhja052WkdVb1lubDBaWE5iYVYwZ0t5QmllWFJsYzF0cEt6RmRJQ29nTWpVMktWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCeVpYTmNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1emJHbGpaU0E5SUdaMWJtTjBhVzl1SUNoemRHRnlkQ3dnWlc1a0tTQjdYRzRnSUhaaGNpQnNaVzRnUFNCMGFHbHpMbXhsYm1kMGFGeHVJQ0J6ZEdGeWRDQTlJR05zWVcxd0tITjBZWEowTENCc1pXNHNJREFwWEc0Z0lHVnVaQ0E5SUdOc1lXMXdLR1Z1WkN3Z2JHVnVMQ0JzWlc0cFhHNWNiaUFnYVdZZ0tFSjFabVpsY2k1ZmRYTmxWSGx3WldSQmNuSmhlWE1wSUh0Y2JpQWdJQ0J5WlhSMWNtNGdRblZtWm1WeUxsOWhkV2R0Wlc1MEtIUm9hWE11YzNWaVlYSnlZWGtvYzNSaGNuUXNJR1Z1WkNrcFhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ2RtRnlJSE5zYVdObFRHVnVJRDBnWlc1a0lDMGdjM1JoY25SY2JpQWdJQ0IyWVhJZ2JtVjNRblZtSUQwZ2JtVjNJRUoxWm1abGNpaHpiR2xqWlV4bGJpd2dkVzVrWldacGJtVmtMQ0IwY25WbEtWeHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2MyeHBZMlZNWlc0N0lHa3JLeWtnZTF4dUlDQWdJQ0FnYm1WM1FuVm1XMmxkSUQwZ2RHaHBjMXRwSUNzZ2MzUmhjblJkWEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCdVpYZENkV1pjYmlBZ2ZWeHVmVnh1WEc0dkx5QmdaMlYwWUNCM2FXeHNJR0psSUhKbGJXOTJaV1FnYVc0Z1RtOWtaU0F3TGpFeksxeHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNW5aWFFnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwS1NCN1hHNGdJR052Ym5OdmJHVXViRzluS0NjdVoyVjBLQ2tnYVhNZ1pHVndjbVZqWVhSbFpDNGdRV05qWlhOeklIVnphVzVuSUdGeWNtRjVJR2x1WkdWNFpYTWdhVzV6ZEdWaFpDNG5LVnh1SUNCeVpYUjFjbTRnZEdocGN5NXlaV0ZrVlVsdWREZ29iMlptYzJWMEtWeHVmVnh1WEc0dkx5QmdjMlYwWUNCM2FXeHNJR0psSUhKbGJXOTJaV1FnYVc0Z1RtOWtaU0F3TGpFeksxeHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXpaWFFnUFNCbWRXNWpkR2x2YmlBb2Rpd2diMlptYzJWMEtTQjdYRzRnSUdOdmJuTnZiR1V1Ykc5bktDY3VjMlYwS0NrZ2FYTWdaR1Z3Y21WallYUmxaQzRnUVdOalpYTnpJSFZ6YVc1bklHRnljbUY1SUdsdVpHVjRaWE1nYVc1emRHVmhaQzRuS1Z4dUlDQnlaWFIxY200Z2RHaHBjeTUzY21sMFpWVkpiblE0S0hZc0lHOW1abk5sZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1ZVbHVkRGdnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JwWmlBb0lXNXZRWE56WlhKMEtTQjdYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JRzltWm5ObGRDQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2diMlptYzJWMEp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJRHdnZEdocGN5NXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdjbVZoWkNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUgxY2JseHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlIUm9hWE11YkdWdVozUm9LVnh1SUNBZ0lISmxkSFZ5Ymx4dVhHNGdJSEpsZEhWeWJpQjBhR2x6VzI5bVpuTmxkRjFjYm4xY2JseHVablZ1WTNScGIyNGdYM0psWVdSVlNXNTBNVFlnS0dKMVppd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1NCN1hHNGdJR2xtSUNnaGJtOUJjM05sY25RcElIdGNiaUFnSUNCaGMzTmxjblFvZEhsd1pXOW1JR3hwZEhSc1pVVnVaR2xoYmlBOVBUMGdKMkp2YjJ4bFlXNG5MQ0FuYldsemMybHVaeUJ2Y2lCcGJuWmhiR2xrSUdWdVpHbGhiaWNwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUc5bVpuTmxkQ0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnYjJabWMyVjBKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNzZ01TQThJR0oxWmk1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2NtVmhaQ0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJSDFjYmx4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1SUNCcFppQW9iMlptYzJWMElENDlJR3hsYmlsY2JpQWdJQ0J5WlhSMWNtNWNibHh1SUNCMllYSWdkbUZzWEc0Z0lHbG1JQ2hzYVhSMGJHVkZibVJwWVc0cElIdGNiaUFnSUNCMllXd2dQU0JpZFdaYmIyWm1jMlYwWFZ4dUlDQWdJR2xtSUNodlptWnpaWFFnS3lBeElEd2diR1Z1S1Z4dUlDQWdJQ0FnZG1Gc0lIdzlJR0oxWmx0dlptWnpaWFFnS3lBeFhTQThQQ0E0WEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnZG1Gc0lEMGdZblZtVzI5bVpuTmxkRjBnUER3Z09GeHVJQ0FnSUdsbUlDaHZabVp6WlhRZ0t5QXhJRHdnYkdWdUtWeHVJQ0FnSUNBZ2RtRnNJSHc5SUdKMVpsdHZabVp6WlhRZ0t5QXhYVnh1SUNCOVhHNGdJSEpsZEhWeWJpQjJZV3hjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrVlVsdWRERTJURVVnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSVlNXNTBNVFlvZEdocGN5d2diMlptYzJWMExDQjBjblZsTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1ZVbHVkREUyUWtVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUlZTVzUwTVRZb2RHaHBjeXdnYjJabWMyVjBMQ0JtWVd4elpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOXlaV0ZrVlVsdWRETXlJQ2hpZFdZc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURNZ1BDQmlkV1l1YkdWdVozUm9MQ0FuVkhKNWFXNW5JSFJ2SUhKbFlXUWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQjlYRzVjYmlBZ2RtRnlJR3hsYmlBOUlHSjFaaTVzWlc1bmRHaGNiaUFnYVdZZ0tHOW1abk5sZENBK1BTQnNaVzRwWEc0Z0lDQWdjbVYwZFhKdVhHNWNiaUFnZG1GeUlIWmhiRnh1SUNCcFppQW9iR2wwZEd4bFJXNWthV0Z1S1NCN1hHNGdJQ0FnYVdZZ0tHOW1abk5sZENBcklESWdQQ0JzWlc0cFhHNGdJQ0FnSUNCMllXd2dQU0JpZFdaYmIyWm1jMlYwSUNzZ01sMGdQRHdnTVRaY2JpQWdJQ0JwWmlBb2IyWm1jMlYwSUNzZ01TQThJR3hsYmlsY2JpQWdJQ0FnSUhaaGJDQjhQU0JpZFdaYmIyWm1jMlYwSUNzZ01WMGdQRHdnT0Z4dUlDQWdJSFpoYkNCOFBTQmlkV1piYjJabWMyVjBYVnh1SUNBZ0lHbG1JQ2h2Wm1aelpYUWdLeUF6SUR3Z2JHVnVLVnh1SUNBZ0lDQWdkbUZzSUQwZ2RtRnNJQ3NnS0dKMVpsdHZabVp6WlhRZ0t5QXpYU0E4UENBeU5DQStQajRnTUNsY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCcFppQW9iMlptYzJWMElDc2dNU0E4SUd4bGJpbGNiaUFnSUNBZ0lIWmhiQ0E5SUdKMVpsdHZabVp6WlhRZ0t5QXhYU0E4UENBeE5seHVJQ0FnSUdsbUlDaHZabVp6WlhRZ0t5QXlJRHdnYkdWdUtWeHVJQ0FnSUNBZ2RtRnNJSHc5SUdKMVpsdHZabVp6WlhRZ0t5QXlYU0E4UENBNFhHNGdJQ0FnYVdZZ0tHOW1abk5sZENBcklETWdQQ0JzWlc0cFhHNGdJQ0FnSUNCMllXd2dmRDBnWW5WbVcyOW1abk5sZENBcklETmRYRzRnSUNBZ2RtRnNJRDBnZG1Gc0lDc2dLR0oxWmx0dlptWnpaWFJkSUR3OElESTBJRDQrUGlBd0tWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCMllXeGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1eVpXRmtWVWx1ZERNeVRFVWdQU0JtZFc1amRHbHZiaUFvYjJabWMyVjBMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnlaWFIxY200Z1gzSmxZV1JWU1c1ME16SW9kR2hwY3l3Z2IyWm1jMlYwTENCMGNuVmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrVlVsdWRETXlRa1VnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSVlNXNTBNeklvZEdocGN5d2diMlptYzJWMExDQm1ZV3h6WlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpFbHVkRGdnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JwWmlBb0lXNXZRWE56WlhKMEtTQjdYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JRzltWm5ObGRDQWhQVDBnYm5Wc2JDeGNiaUFnSUNBZ0lDQWdKMjFwYzNOcGJtY2diMlptYzJWMEp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJRHdnZEdocGN5NXNaVzVuZEdnc0lDZFVjbmxwYm1jZ2RHOGdjbVZoWkNCaVpYbHZibVFnWW5WbVptVnlJR3hsYm1kMGFDY3BYRzRnSUgxY2JseHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlIUm9hWE11YkdWdVozUm9LVnh1SUNBZ0lISmxkSFZ5Ymx4dVhHNGdJSFpoY2lCdVpXY2dQU0IwYUdselcyOW1abk5sZEYwZ0ppQXdlRGd3WEc0Z0lHbG1JQ2h1WldjcFhHNGdJQ0FnY21WMGRYSnVJQ2d3ZUdabUlDMGdkR2hwYzF0dlptWnpaWFJkSUNzZ01Ta2dLaUF0TVZ4dUlDQmxiSE5sWEc0Z0lDQWdjbVYwZFhKdUlIUm9hWE5iYjJabWMyVjBYVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZjbVZoWkVsdWRERTJJQ2hpZFdZc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFI1Y0dWdlppQnNhWFIwYkdWRmJtUnBZVzRnUFQwOUlDZGliMjlzWldGdUp5d2dKMjFwYzNOcGJtY2diM0lnYVc1MllXeHBaQ0JsYm1ScFlXNG5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FySURFZ1BDQmlkV1l1YkdWdVozUm9MQ0FuVkhKNWFXNW5JSFJ2SUhKbFlXUWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQjlYRzVjYmlBZ2RtRnlJR3hsYmlBOUlHSjFaaTVzWlc1bmRHaGNiaUFnYVdZZ0tHOW1abk5sZENBK1BTQnNaVzRwWEc0Z0lDQWdjbVYwZFhKdVhHNWNiaUFnZG1GeUlIWmhiQ0E5SUY5eVpXRmtWVWx1ZERFMktHSjFaaXdnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lIUnlkV1VwWEc0Z0lIWmhjaUJ1WldjZ1BTQjJZV3dnSmlBd2VEZ3dNREJjYmlBZ2FXWWdLRzVsWnlsY2JpQWdJQ0J5WlhSMWNtNGdLREI0Wm1abVppQXRJSFpoYkNBcklERXBJQ29nTFRGY2JpQWdaV3h6WlZ4dUlDQWdJSEpsZEhWeWJpQjJZV3hjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXlaV0ZrU1c1ME1UWk1SU0E5SUdaMWJtTjBhVzl1SUNodlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJSEpsZEhWeWJpQmZjbVZoWkVsdWRERTJLSFJvYVhNc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVjbVZoWkVsdWRERTJRa1VnUFNCbWRXNWpkR2x2YmlBb2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0J5WlhSMWNtNGdYM0psWVdSSmJuUXhOaWgwYUdsekxDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNKbFlXUkpiblF6TWlBb1luVm1MQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMGVYQmxiMllnYkdsMGRHeGxSVzVrYVdGdUlEMDlQU0FuWW05dmJHVmhiaWNzSUNkdGFYTnphVzVuSUc5eUlHbHVkbUZzYVdRZ1pXNWthV0Z1SnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2IyWm1jMlYwSUNFOVBTQnVkV3hzTENBbmJXbHpjMmx1WnlCdlptWnpaWFFuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0t5QXpJRHdnWW5WbUxteGxibWQwYUN3Z0oxUnllV2x1WnlCMGJ5QnlaV0ZrSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnZlZ4dVhHNGdJSFpoY2lCc1pXNGdQU0JpZFdZdWJHVnVaM1JvWEc0Z0lHbG1JQ2h2Wm1aelpYUWdQajBnYkdWdUtWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lIWmhjaUIyWVd3Z1BTQmZjbVZoWkZWSmJuUXpNaWhpZFdZc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0IwY25WbEtWeHVJQ0IyWVhJZ2JtVm5JRDBnZG1Gc0lDWWdNSGc0TURBd01EQXdNRnh1SUNCcFppQW9ibVZuS1Z4dUlDQWdJSEpsZEhWeWJpQW9NSGhtWm1abVptWm1aaUF0SUhaaGJDQXJJREVwSUNvZ0xURmNiaUFnWld4elpWeHVJQ0FnSUhKbGRIVnliaUIyWVd4Y2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1NXNTBNekpNUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpFbHVkRE15S0hSb2FYTXNJRzltWm5ObGRDd2dkSEoxWlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1Y21WaFpFbHVkRE15UWtVZ1BTQm1kVzVqZEdsdmJpQW9iMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCeVpYUjFjbTRnWDNKbFlXUkpiblF6TWloMGFHbHpMQ0J2Wm1aelpYUXNJR1poYkhObExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1gzSmxZV1JHYkc5aGRDQW9ZblZtTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dibTlCYzNObGNuUXBJSHRjYmlBZ2FXWWdLQ0Z1YjBGemMyVnlkQ2tnZTF4dUlDQWdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2JHbDBkR3hsUlc1a2FXRnVJRDA5UFNBblltOXZiR1ZoYmljc0lDZHRhWE56YVc1bklHOXlJR2x1ZG1Gc2FXUWdaVzVrYVdGdUp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ3NnTXlBOElHSjFaaTVzWlc1bmRHZ3NJQ2RVY25scGJtY2dkRzhnY21WaFpDQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnYVdWbFpUYzFOQzV5WldGa0tHSjFaaXdnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lESXpMQ0EwS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSR2JHOWhkRXhGSUQwZ1puVnVZM1JwYjI0Z0tHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnY21WMGRYSnVJRjl5WldGa1JteHZZWFFvZEdocGN5d2diMlptYzJWMExDQjBjblZsTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzV5WldGa1JteHZZWFJDUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpFWnNiMkYwS0hSb2FYTXNJRzltWm5ObGRDd2dabUZzYzJVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmNtVmhaRVJ2ZFdKc1pTQW9ZblZtTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dibTlCYzNObGNuUXBJSHRjYmlBZ2FXWWdLQ0Z1YjBGemMyVnlkQ2tnZTF4dUlDQWdJR0Z6YzJWeWRDaDBlWEJsYjJZZ2JHbDBkR3hsUlc1a2FXRnVJRDA5UFNBblltOXZiR1ZoYmljc0lDZHRhWE56YVc1bklHOXlJR2x1ZG1Gc2FXUWdaVzVrYVdGdUp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ3NnTnlBOElHSjFaaTVzWlc1bmRHZ3NJQ2RVY25scGJtY2dkRzhnY21WaFpDQmlaWGx2Ym1RZ1luVm1abVZ5SUd4bGJtZDBhQ2NwWEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnYVdWbFpUYzFOQzV5WldGa0tHSjFaaXdnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lEVXlMQ0E0S1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbkpsWVdSRWIzVmliR1ZNUlNBOUlHWjFibU4wYVc5dUlDaHZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUhKbGRIVnliaUJmY21WaFpFUnZkV0pzWlNoMGFHbHpMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5KbFlXUkViM1ZpYkdWQ1JTQTlJR1oxYm1OMGFXOXVJQ2h2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lISmxkSFZ5YmlCZmNtVmhaRVJ2ZFdKc1pTaDBhR2x6TENCdlptWnpaWFFzSUdaaGJITmxMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlZWSmJuUTRJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J2Wm1aelpYUXNJRzV2UVhOelpYSjBLU0I3WEc0Z0lHbG1JQ2doYm05QmMzTmxjblFwSUh0Y2JpQWdJQ0JoYzNObGNuUW9kbUZzZFdVZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCMllXeDFaU0FoUFQwZ2JuVnNiQ3dnSjIxcGMzTnBibWNnZG1Gc2RXVW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUJ2Wm1aelpYUWdJVDA5SUc1MWJHd3NJQ2R0YVhOemFXNW5JRzltWm5ObGRDY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0E4SUhSb2FYTXViR1Z1WjNSb0xDQW5kSEo1YVc1bklIUnZJSGR5YVhSbElHSmxlVzl1WkNCaWRXWm1aWElnYkdWdVozUm9KeWxjYmlBZ0lDQjJaWEpwWm5WcGJuUW9kbUZzZFdVc0lEQjRabVlwWEc0Z0lIMWNibHh1SUNCcFppQW9iMlptYzJWMElENDlJSFJvYVhNdWJHVnVaM1JvS1NCeVpYUjFjbTVjYmx4dUlDQjBhR2x6VzI5bVpuTmxkRjBnUFNCMllXeDFaVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZkM0pwZEdWVlNXNTBNVFlnS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFpoYkhWbElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2RtRnNkV1VnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUhaaGJIVmxKeWxjYmlBZ0lDQmhjM05sY25Rb2RIbHdaVzltSUd4cGRIUnNaVVZ1WkdsaGJpQTlQVDBnSjJKdmIyeGxZVzRuTENBbmJXbHpjMmx1WnlCdmNpQnBiblpoYkdsa0lHVnVaR2xoYmljcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNU0E4SUdKMVppNXNaVzVuZEdnc0lDZDBjbmxwYm1jZ2RHOGdkM0pwZEdVZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNBZ0lIWmxjbWxtZFdsdWRDaDJZV3gxWlN3Z01IaG1abVptS1Z4dUlDQjlYRzVjYmlBZ2RtRnlJR3hsYmlBOUlHSjFaaTVzWlc1bmRHaGNiaUFnYVdZZ0tHOW1abk5sZENBK1BTQnNaVzRwWEc0Z0lDQWdjbVYwZFhKdVhHNWNiaUFnWm05eUlDaDJZWElnYVNBOUlEQXNJR29nUFNCTllYUm9MbTFwYmloc1pXNGdMU0J2Wm1aelpYUXNJRElwT3lCcElEd2dhanNnYVNzcktTQjdYRzRnSUNBZ1luVm1XMjltWm5ObGRDQXJJR2xkSUQxY2JpQWdJQ0FnSUNBZ0tIWmhiSFZsSUNZZ0tEQjRabVlnUER3Z0tEZ2dLaUFvYkdsMGRHeGxSVzVrYVdGdUlEOGdhU0E2SURFZ0xTQnBLU2twS1NBK1BqNWNiaUFnSUNBZ0lDQWdJQ0FnSUNoc2FYUjBiR1ZGYm1ScFlXNGdQeUJwSURvZ01TQXRJR2twSUNvZ09GeHVJQ0I5WEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWVlNXNTBNVFpNUlNBOUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JmZDNKcGRHVlZTVzUwTVRZb2RHaHBjeXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dkSEoxWlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZDNKcGRHVlZTVzUwTVRaQ1JTQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCZmQzSnBkR1ZWU1c1ME1UWW9kR2hwY3l3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnWm1Gc2MyVXNJRzV2UVhOelpYSjBLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQmZkM0pwZEdWVlNXNTBNeklnS0dKMVppd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2tnZTF4dUlDQnBaaUFvSVc1dlFYTnpaWEowS1NCN1hHNGdJQ0FnWVhOelpYSjBLSFpoYkhWbElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2RtRnNkV1VnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUhaaGJIVmxKeWxjYmlBZ0lDQmhjM05sY25Rb2RIbHdaVzltSUd4cGRIUnNaVVZ1WkdsaGJpQTlQVDBnSjJKdmIyeGxZVzRuTENBbmJXbHpjMmx1WnlCdmNpQnBiblpoYkdsa0lHVnVaR2xoYmljcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElDc2dNeUE4SUdKMVppNXNaVzVuZEdnc0lDZDBjbmxwYm1jZ2RHOGdkM0pwZEdVZ1ltVjViMjVrSUdKMVptWmxjaUJzWlc1bmRHZ25LVnh1SUNBZ0lIWmxjbWxtZFdsdWRDaDJZV3gxWlN3Z01IaG1abVptWm1abVppbGNiaUFnZlZ4dVhHNGdJSFpoY2lCc1pXNGdQU0JpZFdZdWJHVnVaM1JvWEc0Z0lHbG1JQ2h2Wm1aelpYUWdQajBnYkdWdUtWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3TENCcUlEMGdUV0YwYUM1dGFXNG9iR1Z1SUMwZ2IyWm1jMlYwTENBMEtUc2dhU0E4SUdvN0lHa3JLeWtnZTF4dUlDQWdJR0oxWmx0dlptWnpaWFFnS3lCcFhTQTlYRzRnSUNBZ0lDQWdJQ2gyWVd4MVpTQStQajRnS0d4cGRIUnNaVVZ1WkdsaGJpQS9JR2tnT2lBeklDMGdhU2tnS2lBNEtTQW1JREI0Wm1aY2JpQWdmVnh1ZlZ4dVhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuZHlhWFJsVlVsdWRETXlURVVnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdYM2R5YVhSbFZVbHVkRE15S0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lIUnlkV1VzSUc1dlFYTnpaWEowS1Z4dWZWeHVYRzVDZFdabVpYSXVjSEp2ZEc5MGVYQmxMbmR5YVhSbFZVbHVkRE15UWtVZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnWDNkeWFYUmxWVWx1ZERNeUtIUm9hWE1zSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR1poYkhObExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1M2NtbDBaVWx1ZERnZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnYVdZZ0tDRnViMEZ6YzJWeWRDa2dlMXh1SUNBZ0lHRnpjMlZ5ZENoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JSFpoYkhWbElDRTlQU0J1ZFd4c0xDQW5iV2x6YzJsdVp5QjJZV3gxWlNjcFhHNGdJQ0FnWVhOelpYSjBLRzltWm5ObGRDQWhQVDBnZFc1a1pXWnBibVZrSUNZbUlHOW1abk5sZENBaFBUMGdiblZzYkN3Z0oyMXBjM05wYm1jZ2IyWm1jMlYwSnlsY2JpQWdJQ0JoYzNObGNuUW9iMlptYzJWMElEd2dkR2hwY3k1c1pXNW5kR2dzSUNkVWNubHBibWNnZEc4Z2QzSnBkR1VnWW1WNWIyNWtJR0oxWm1abGNpQnNaVzVuZEdnbktWeHVJQ0FnSUhabGNtbG1jMmx1ZENoMllXeDFaU3dnTUhnM1ppd2dMVEI0T0RBcFhHNGdJSDFjYmx4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUhSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUhKbGRIVnlibHh1WEc0Z0lHbG1JQ2gyWVd4MVpTQStQU0F3S1Z4dUlDQWdJSFJvYVhNdWQzSnBkR1ZWU1c1ME9DaDJZV3gxWlN3Z2IyWm1jMlYwTENCdWIwRnpjMlZ5ZENsY2JpQWdaV3h6WlZ4dUlDQWdJSFJvYVhNdWQzSnBkR1ZWU1c1ME9DZ3dlR1ptSUNzZ2RtRnNkV1VnS3lBeExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCZmQzSnBkR1ZKYm5ReE5pQW9ZblZtTENCMllXeDFaU3dnYjJabWMyVjBMQ0JzYVhSMGJHVkZibVJwWVc0c0lHNXZRWE56WlhKMEtTQjdYRzRnSUdsbUlDZ2hibTlCYzNObGNuUXBJSHRjYmlBZ0lDQmhjM05sY25Rb2RtRnNkV1VnSVQwOUlIVnVaR1ZtYVc1bFpDQW1KaUIyWVd4MVpTQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2dkbUZzZFdVbktWeHVJQ0FnSUdGemMyVnlkQ2gwZVhCbGIyWWdiR2wwZEd4bFJXNWthV0Z1SUQwOVBTQW5ZbTl2YkdWaGJpY3NJQ2R0YVhOemFXNW5JRzl5SUdsdWRtRnNhV1FnWlc1a2FXRnVKeWxjYmlBZ0lDQmhjM05sY25Rb2IyWm1jMlYwSUNFOVBTQjFibVJsWm1sdVpXUWdKaVlnYjJabWMyVjBJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUJ2Wm1aelpYUW5LVnh1SUNBZ0lHRnpjMlZ5ZENodlptWnpaWFFnS3lBeElEd2dZblZtTG14bGJtZDBhQ3dnSjFSeWVXbHVaeUIwYnlCM2NtbDBaU0JpWlhsdmJtUWdZblZtWm1WeUlHeGxibWQwYUNjcFhHNGdJQ0FnZG1WeWFXWnphVzUwS0haaGJIVmxMQ0F3ZURkbVptWXNJQzB3ZURnd01EQXBYRzRnSUgxY2JseHVJQ0IyWVhJZ2JHVnVJRDBnWW5WbUxteGxibWQwYUZ4dUlDQnBaaUFvYjJabWMyVjBJRDQ5SUd4bGJpbGNiaUFnSUNCeVpYUjFjbTVjYmx4dUlDQnBaaUFvZG1Gc2RXVWdQajBnTUNsY2JpQWdJQ0JmZDNKcGRHVlZTVzUwTVRZb1luVm1MQ0IyWVd4MVpTd2diMlptYzJWMExDQnNhWFIwYkdWRmJtUnBZVzRzSUc1dlFYTnpaWEowS1Z4dUlDQmxiSE5sWEc0Z0lDQWdYM2R5YVhSbFZVbHVkREUyS0dKMVppd2dNSGhtWm1abUlDc2dkbUZzZFdVZ0t5QXhMQ0J2Wm1aelpYUXNJR3hwZEhSc1pVVnVaR2xoYml3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZDNKcGRHVkpiblF4Tmt4RklEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUY5M2NtbDBaVWx1ZERFMktIUm9hWE1zSUhaaGJIVmxMQ0J2Wm1aelpYUXNJSFJ5ZFdVc0lHNXZRWE56WlhKMEtWeHVmVnh1WEc1Q2RXWm1aWEl1Y0hKdmRHOTBlWEJsTG5keWFYUmxTVzUwTVRaQ1JTQTlJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2diMlptYzJWMExDQnViMEZ6YzJWeWRDa2dlMXh1SUNCZmQzSnBkR1ZKYm5ReE5paDBhR2x6TENCMllXeDFaU3dnYjJabWMyVjBMQ0JtWVd4elpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JtWjFibU4wYVc5dUlGOTNjbWwwWlVsdWRETXlJQ2hpZFdZc0lIWmhiSFZsTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dibTlCYzNObGNuUXBJSHRjYmlBZ2FXWWdLQ0Z1YjBGemMyVnlkQ2tnZTF4dUlDQWdJR0Z6YzJWeWRDaDJZV3gxWlNBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUhaaGJIVmxJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUIyWVd4MVpTY3BYRzRnSUNBZ1lYTnpaWEowS0hSNWNHVnZaaUJzYVhSMGJHVkZibVJwWVc0Z1BUMDlJQ2RpYjI5c1pXRnVKeXdnSjIxcGMzTnBibWNnYjNJZ2FXNTJZV3hwWkNCbGJtUnBZVzRuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCdlptWnpaWFFnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUc5bVpuTmxkQ2NwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBcklETWdQQ0JpZFdZdWJHVnVaM1JvTENBblZISjVhVzVuSUhSdklIZHlhWFJsSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnSUNCMlpYSnBabk5wYm5Rb2RtRnNkV1VzSURCNE4yWm1abVptWm1Zc0lDMHdlRGd3TURBd01EQXdLVnh1SUNCOVhHNWNiaUFnZG1GeUlHeGxiaUE5SUdKMVppNXNaVzVuZEdoY2JpQWdhV1lnS0c5bVpuTmxkQ0ErUFNCc1pXNHBYRzRnSUNBZ2NtVjBkWEp1WEc1Y2JpQWdhV1lnS0haaGJIVmxJRDQ5SURBcFhHNGdJQ0FnWDNkeWFYUmxWVWx1ZERNeUtHSjFaaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2diR2wwZEd4bFJXNWthV0Z1TENCdWIwRnpjMlZ5ZENsY2JpQWdaV3h6WlZ4dUlDQWdJRjkzY21sMFpWVkpiblF6TWloaWRXWXNJREI0Wm1abVptWm1abVlnS3lCMllXeDFaU0FySURFc0lHOW1abk5sZEN3Z2JHbDBkR3hsUlc1a2FXRnVMQ0J1YjBGemMyVnlkQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlVsdWRETXlURVVnUFNCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUc5bVpuTmxkQ3dnYm05QmMzTmxjblFwSUh0Y2JpQWdYM2R5YVhSbFNXNTBNeklvZEdocGN5d2dkbUZzZFdVc0lHOW1abk5sZEN3Z2RISjFaU3dnYm05QmMzTmxjblFwWEc1OVhHNWNia0oxWm1abGNpNXdjbTkwYjNSNWNHVXVkM0pwZEdWSmJuUXpNa0pGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVbHVkRE15S0hSb2FYTXNJSFpoYkhWbExDQnZabVp6WlhRc0lHWmhiSE5sTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWDNkeWFYUmxSbXh2WVhRZ0tHSjFaaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2diR2wwZEd4bFJXNWthV0Z1TENCdWIwRnpjMlZ5ZENrZ2UxeHVJQ0JwWmlBb0lXNXZRWE56WlhKMEtTQjdYRzRnSUNBZ1lYTnpaWEowS0haaGJIVmxJQ0U5UFNCMWJtUmxabWx1WldRZ0ppWWdkbUZzZFdVZ0lUMDlJRzUxYkd3c0lDZHRhWE56YVc1bklIWmhiSFZsSnlsY2JpQWdJQ0JoYzNObGNuUW9kSGx3Wlc5bUlHeHBkSFJzWlVWdVpHbGhiaUE5UFQwZ0oySnZiMnhsWVc0bkxDQW5iV2x6YzJsdVp5QnZjaUJwYm5aaGJHbGtJR1Z1WkdsaGJpY3BYRzRnSUNBZ1lYTnpaWEowS0c5bVpuTmxkQ0FoUFQwZ2RXNWtaV1pwYm1Wa0lDWW1JRzltWm5ObGRDQWhQVDBnYm5Wc2JDd2dKMjFwYzNOcGJtY2diMlptYzJWMEp5bGNiaUFnSUNCaGMzTmxjblFvYjJabWMyVjBJQ3NnTXlBOElHSjFaaTVzWlc1bmRHZ3NJQ2RVY25scGJtY2dkRzhnZDNKcGRHVWdZbVY1YjI1a0lHSjFabVpsY2lCc1pXNW5kR2duS1Z4dUlDQWdJSFpsY21sbVNVVkZSVGMxTkNoMllXeDFaU3dnTXk0ME1ESTRNak0wTmpZek9EVXlPRGcyWlNzek9Dd2dMVE11TkRBeU9ESXpORFkyTXpnMU1qZzRObVVyTXpncFhHNGdJSDFjYmx4dUlDQjJZWElnYkdWdUlEMGdZblZtTG14bGJtZDBhRnh1SUNCcFppQW9iMlptYzJWMElENDlJR3hsYmlsY2JpQWdJQ0J5WlhSMWNtNWNibHh1SUNCcFpXVmxOelUwTG5keWFYUmxLR0oxWml3Z2RtRnNkV1VzSUc5bVpuTmxkQ3dnYkdsMGRHeGxSVzVrYVdGdUxDQXlNeXdnTkNsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpVWnNiMkYwVEVVZ1BTQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHOW1abk5sZEN3Z2JtOUJjM05sY25RcElIdGNiaUFnWDNkeWFYUmxSbXh2WVhRb2RHaHBjeXdnZG1Gc2RXVXNJRzltWm5ObGRDd2dkSEoxWlN3Z2JtOUJjM05sY25RcFhHNTlYRzVjYmtKMVptWmxjaTV3Y205MGIzUjVjR1V1ZDNKcGRHVkdiRzloZEVKRklEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUY5M2NtbDBaVVpzYjJGMEtIUm9hWE1zSUhaaGJIVmxMQ0J2Wm1aelpYUXNJR1poYkhObExDQnViMEZ6YzJWeWRDbGNibjFjYmx4dVpuVnVZM1JwYjI0Z1gzZHlhWFJsUkc5MVlteGxJQ2hpZFdZc0lIWmhiSFZsTENCdlptWnpaWFFzSUd4cGRIUnNaVVZ1WkdsaGJpd2dibTlCYzNObGNuUXBJSHRjYmlBZ2FXWWdLQ0Z1YjBGemMyVnlkQ2tnZTF4dUlDQWdJR0Z6YzJWeWRDaDJZV3gxWlNBaFBUMGdkVzVrWldacGJtVmtJQ1ltSUhaaGJIVmxJQ0U5UFNCdWRXeHNMQ0FuYldsemMybHVaeUIyWVd4MVpTY3BYRzRnSUNBZ1lYTnpaWEowS0hSNWNHVnZaaUJzYVhSMGJHVkZibVJwWVc0Z1BUMDlJQ2RpYjI5c1pXRnVKeXdnSjIxcGMzTnBibWNnYjNJZ2FXNTJZV3hwWkNCbGJtUnBZVzRuS1Z4dUlDQWdJR0Z6YzJWeWRDaHZabVp6WlhRZ0lUMDlJSFZ1WkdWbWFXNWxaQ0FtSmlCdlptWnpaWFFnSVQwOUlHNTFiR3dzSUNkdGFYTnphVzVuSUc5bVpuTmxkQ2NwWEc0Z0lDQWdZWE56WlhKMEtHOW1abk5sZENBcklEY2dQQ0JpZFdZdWJHVnVaM1JvTEZ4dUlDQWdJQ0FnSUNBblZISjVhVzVuSUhSdklIZHlhWFJsSUdKbGVXOXVaQ0JpZFdabVpYSWdiR1Z1WjNSb0p5bGNiaUFnSUNCMlpYSnBaa2xGUlVVM05UUW9kbUZzZFdVc0lERXVOemszTmprek1UTTBPRFl5TXpFMU4wVXJNekE0TENBdE1TNDNPVGMyT1RNeE16UTROakl6TVRVM1JTc3pNRGdwWEc0Z0lIMWNibHh1SUNCMllYSWdiR1Z1SUQwZ1luVm1MbXhsYm1kMGFGeHVJQ0JwWmlBb2IyWm1jMlYwSUQ0OUlHeGxiaWxjYmlBZ0lDQnlaWFIxY201Y2JseHVJQ0JwWldWbE56VTBMbmR5YVhSbEtHSjFaaXdnZG1Gc2RXVXNJRzltWm5ObGRDd2diR2wwZEd4bFJXNWthV0Z1TENBMU1pd2dPQ2xjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNTNjbWwwWlVSdmRXSnNaVXhGSUQwZ1puVnVZM1JwYjI0Z0tIWmhiSFZsTENCdlptWnpaWFFzSUc1dlFYTnpaWEowS1NCN1hHNGdJRjkzY21sMFpVUnZkV0pzWlNoMGFHbHpMQ0IyWVd4MVpTd2diMlptYzJWMExDQjBjblZsTENCdWIwRnpjMlZ5ZENsY2JuMWNibHh1UW5WbVptVnlMbkJ5YjNSdmRIbHdaUzUzY21sMFpVUnZkV0pzWlVKRklEMGdablZ1WTNScGIyNGdLSFpoYkhWbExDQnZabVp6WlhRc0lHNXZRWE56WlhKMEtTQjdYRzRnSUY5M2NtbDBaVVJ2ZFdKc1pTaDBhR2x6TENCMllXeDFaU3dnYjJabWMyVjBMQ0JtWVd4elpTd2dibTlCYzNObGNuUXBYRzU5WEc1Y2JpOHZJR1pwYkd3b2RtRnNkV1VzSUhOMFlYSjBQVEFzSUdWdVpEMWlkV1ptWlhJdWJHVnVaM1JvS1Z4dVFuVm1abVZ5TG5CeWIzUnZkSGx3WlM1bWFXeHNJRDBnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0J6ZEdGeWRDd2daVzVrS1NCN1hHNGdJR2xtSUNnaGRtRnNkV1VwSUhaaGJIVmxJRDBnTUZ4dUlDQnBaaUFvSVhOMFlYSjBLU0J6ZEdGeWRDQTlJREJjYmlBZ2FXWWdLQ0ZsYm1RcElHVnVaQ0E5SUhSb2FYTXViR1Z1WjNSb1hHNWNiaUFnYVdZZ0tIUjVjR1Z2WmlCMllXeDFaU0E5UFQwZ0ozTjBjbWx1WnljcElIdGNiaUFnSUNCMllXeDFaU0E5SUhaaGJIVmxMbU5vWVhKRGIyUmxRWFFvTUNsY2JpQWdmVnh1WEc0Z0lHRnpjMlZ5ZENoMGVYQmxiMllnZG1Gc2RXVWdQVDA5SUNkdWRXMWlaWEluSUNZbUlDRnBjMDVoVGloMllXeDFaU2tzSUNkMllXeDFaU0JwY3lCdWIzUWdZU0J1ZFcxaVpYSW5LVnh1SUNCaGMzTmxjblFvWlc1a0lENDlJSE4wWVhKMExDQW5aVzVrSUR3Z2MzUmhjblFuS1Z4dVhHNGdJQzh2SUVacGJHd2dNQ0JpZVhSbGN6c2dkMlVuY21VZ1pHOXVaVnh1SUNCcFppQW9aVzVrSUQwOVBTQnpkR0Z5ZENrZ2NtVjBkWEp1WEc0Z0lHbG1JQ2gwYUdsekxteGxibWQwYUNBOVBUMGdNQ2tnY21WMGRYSnVYRzVjYmlBZ1lYTnpaWEowS0hOMFlYSjBJRDQ5SURBZ0ppWWdjM1JoY25RZ1BDQjBhR2x6TG14bGJtZDBhQ3dnSjNOMFlYSjBJRzkxZENCdlppQmliM1Z1WkhNbktWeHVJQ0JoYzNObGNuUW9aVzVrSUQ0OUlEQWdKaVlnWlc1a0lEdzlJSFJvYVhNdWJHVnVaM1JvTENBblpXNWtJRzkxZENCdlppQmliM1Z1WkhNbktWeHVYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQnpkR0Z5ZERzZ2FTQThJR1Z1WkRzZ2FTc3JLU0I3WEc0Z0lDQWdkR2hwYzF0cFhTQTlJSFpoYkhWbFhHNGdJSDFjYm4xY2JseHVRblZtWm1WeUxuQnliM1J2ZEhsd1pTNXBibk53WldOMElEMGdablZ1WTNScGIyNGdLQ2tnZTF4dUlDQjJZWElnYjNWMElEMGdXMTFjYmlBZ2RtRnlJR3hsYmlBOUlIUm9hWE11YkdWdVozUm9YRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2JHVnVPeUJwS3lzcElIdGNiaUFnSUNCdmRYUmJhVjBnUFNCMGIwaGxlQ2gwYUdselcybGRLVnh1SUNBZ0lHbG1JQ2hwSUQwOVBTQmxlSEJ2Y25SekxrbE9VMUJGUTFSZlRVRllYMEpaVkVWVEtTQjdYRzRnSUNBZ0lDQnZkWFJiYVNBcklERmRJRDBnSnk0dUxpZGNiaUFnSUNBZ0lHSnlaV0ZyWEc0Z0lDQWdmVnh1SUNCOVhHNGdJSEpsZEhWeWJpQW5QRUoxWm1abGNpQW5JQ3NnYjNWMExtcHZhVzRvSnlBbktTQXJJQ2MrSjF4dWZWeHVYRzR2S2lwY2JpQXFJRU55WldGMFpYTWdZU0J1WlhjZ1lFRnljbUY1UW5WbVptVnlZQ0IzYVhSb0lIUm9aU0FxWTI5d2FXVmtLaUJ0WlcxdmNua2diMllnZEdobElHSjFabVpsY2lCcGJuTjBZVzVqWlM1Y2JpQXFJRUZrWkdWa0lHbHVJRTV2WkdVZ01DNHhNaTRnVDI1c2VTQmhkbUZwYkdGaWJHVWdhVzRnWW5KdmQzTmxjbk1nZEdoaGRDQnpkWEJ3YjNKMElFRnljbUY1UW5WbVptVnlMbHh1SUNvdlhHNUNkV1ptWlhJdWNISnZkRzkwZVhCbExuUnZRWEp5WVhsQ2RXWm1aWElnUFNCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUdsbUlDaDBlWEJsYjJZZ1ZXbHVkRGhCY25KaGVTQWhQVDBnSjNWdVpHVm1hVzVsWkNjcElIdGNiaUFnSUNCcFppQW9RblZtWm1WeUxsOTFjMlZVZVhCbFpFRnljbUY1Y3lrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUNodVpYY2dRblZtWm1WeUtIUm9hWE1wS1M1aWRXWm1aWEpjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2RtRnlJR0oxWmlBOUlHNWxkeUJWYVc1ME9FRnljbUY1S0hSb2FYTXViR1Z1WjNSb0tWeHVJQ0FnSUNBZ1ptOXlJQ2gyWVhJZ2FTQTlJREFzSUd4bGJpQTlJR0oxWmk1c1pXNW5kR2c3SUdrZ1BDQnNaVzQ3SUdrZ0t6MGdNU2xjYmlBZ0lDQWdJQ0FnWW5WbVcybGRJRDBnZEdocGMxdHBYVnh1SUNBZ0lDQWdjbVYwZFhKdUlHSjFaaTVpZFdabVpYSmNiaUFnSUNCOVhHNGdJSDBnWld4elpTQjdYRzRnSUNBZ2RHaHliM2NnYm1WM0lFVnljbTl5S0NkQ2RXWm1aWEl1ZEc5QmNuSmhlVUoxWm1abGNpQnViM1FnYzNWd2NHOXlkR1ZrSUdsdUlIUm9hWE1nWW5KdmQzTmxjaWNwWEc0Z0lIMWNibjFjYmx4dUx5OGdTRVZNVUVWU0lFWlZUa05VU1U5T1UxeHVMeThnUFQwOVBUMDlQVDA5UFQwOVBUMDlQVnh1WEc1bWRXNWpkR2x2YmlCemRISnBibWQwY21sdElDaHpkSElwSUh0Y2JpQWdhV1lnS0hOMGNpNTBjbWx0S1NCeVpYUjFjbTRnYzNSeUxuUnlhVzBvS1Z4dUlDQnlaWFIxY200Z2MzUnlMbkpsY0d4aFkyVW9MMTVjWEhNcmZGeGNjeXNrTDJjc0lDY25LVnh1ZlZ4dVhHNTJZWElnUWxBZ1BTQkNkV1ptWlhJdWNISnZkRzkwZVhCbFhHNWNiaThxS2x4dUlDb2dRWFZuYldWdWRDQmhJRlZwYm5RNFFYSnlZWGtnS21sdWMzUmhibU5sS2lBb2JtOTBJSFJvWlNCVmFXNTBPRUZ5Y21GNUlHTnNZWE56SVNrZ2QybDBhQ0JDZFdabVpYSWdiV1YwYUc5a2MxeHVJQ292WEc1Q2RXWm1aWEl1WDJGMVoyMWxiblFnUFNCbWRXNWpkR2x2YmlBb1lYSnlLU0I3WEc0Z0lHRnljaTVmYVhOQ2RXWm1aWElnUFNCMGNuVmxYRzVjYmlBZ0x5OGdjMkYyWlNCeVpXWmxjbVZ1WTJVZ2RHOGdiM0pwWjJsdVlXd2dWV2x1ZERoQmNuSmhlU0JuWlhRdmMyVjBJRzFsZEdodlpITWdZbVZtYjNKbElHOTJaWEozY21sMGFXNW5YRzRnSUdGeWNpNWZaMlYwSUQwZ1lYSnlMbWRsZEZ4dUlDQmhjbkl1WDNObGRDQTlJR0Z5Y2k1elpYUmNibHh1SUNBdkx5QmtaWEJ5WldOaGRHVmtMQ0IzYVd4c0lHSmxJSEpsYlc5MlpXUWdhVzRnYm05a1pTQXdMakV6SzF4dUlDQmhjbkl1WjJWMElEMGdRbEF1WjJWMFhHNGdJR0Z5Y2k1elpYUWdQU0JDVUM1elpYUmNibHh1SUNCaGNuSXVkM0pwZEdVZ1BTQkNVQzUzY21sMFpWeHVJQ0JoY25JdWRHOVRkSEpwYm1jZ1BTQkNVQzUwYjFOMGNtbHVaMXh1SUNCaGNuSXVkRzlNYjJOaGJHVlRkSEpwYm1jZ1BTQkNVQzUwYjFOMGNtbHVaMXh1SUNCaGNuSXVkRzlLVTA5T0lEMGdRbEF1ZEc5S1UwOU9YRzRnSUdGeWNpNWpiM0I1SUQwZ1FsQXVZMjl3ZVZ4dUlDQmhjbkl1YzJ4cFkyVWdQU0JDVUM1emJHbGpaVnh1SUNCaGNuSXVjbVZoWkZWSmJuUTRJRDBnUWxBdWNtVmhaRlZKYm5RNFhHNGdJR0Z5Y2k1eVpXRmtWVWx1ZERFMlRFVWdQU0JDVUM1eVpXRmtWVWx1ZERFMlRFVmNiaUFnWVhKeUxuSmxZV1JWU1c1ME1UWkNSU0E5SUVKUUxuSmxZV1JWU1c1ME1UWkNSVnh1SUNCaGNuSXVjbVZoWkZWSmJuUXpNa3hGSUQwZ1FsQXVjbVZoWkZWSmJuUXpNa3hGWEc0Z0lHRnljaTV5WldGa1ZVbHVkRE15UWtVZ1BTQkNVQzV5WldGa1ZVbHVkRE15UWtWY2JpQWdZWEp5TG5KbFlXUkpiblE0SUQwZ1FsQXVjbVZoWkVsdWREaGNiaUFnWVhKeUxuSmxZV1JKYm5ReE5reEZJRDBnUWxBdWNtVmhaRWx1ZERFMlRFVmNiaUFnWVhKeUxuSmxZV1JKYm5ReE5rSkZJRDBnUWxBdWNtVmhaRWx1ZERFMlFrVmNiaUFnWVhKeUxuSmxZV1JKYm5Rek1reEZJRDBnUWxBdWNtVmhaRWx1ZERNeVRFVmNiaUFnWVhKeUxuSmxZV1JKYm5Rek1rSkZJRDBnUWxBdWNtVmhaRWx1ZERNeVFrVmNiaUFnWVhKeUxuSmxZV1JHYkc5aGRFeEZJRDBnUWxBdWNtVmhaRVpzYjJGMFRFVmNiaUFnWVhKeUxuSmxZV1JHYkc5aGRFSkZJRDBnUWxBdWNtVmhaRVpzYjJGMFFrVmNiaUFnWVhKeUxuSmxZV1JFYjNWaWJHVk1SU0E5SUVKUUxuSmxZV1JFYjNWaWJHVk1SVnh1SUNCaGNuSXVjbVZoWkVSdmRXSnNaVUpGSUQwZ1FsQXVjbVZoWkVSdmRXSnNaVUpGWEc0Z0lHRnljaTUzY21sMFpWVkpiblE0SUQwZ1FsQXVkM0pwZEdWVlNXNTBPRnh1SUNCaGNuSXVkM0pwZEdWVlNXNTBNVFpNUlNBOUlFSlFMbmR5YVhSbFZVbHVkREUyVEVWY2JpQWdZWEp5TG5keWFYUmxWVWx1ZERFMlFrVWdQU0JDVUM1M2NtbDBaVlZKYm5ReE5rSkZYRzRnSUdGeWNpNTNjbWwwWlZWSmJuUXpNa3hGSUQwZ1FsQXVkM0pwZEdWVlNXNTBNekpNUlZ4dUlDQmhjbkl1ZDNKcGRHVlZTVzUwTXpKQ1JTQTlJRUpRTG5keWFYUmxWVWx1ZERNeVFrVmNiaUFnWVhKeUxuZHlhWFJsU1c1ME9DQTlJRUpRTG5keWFYUmxTVzUwT0Z4dUlDQmhjbkl1ZDNKcGRHVkpiblF4Tmt4RklEMGdRbEF1ZDNKcGRHVkpiblF4Tmt4RlhHNGdJR0Z5Y2k1M2NtbDBaVWx1ZERFMlFrVWdQU0JDVUM1M2NtbDBaVWx1ZERFMlFrVmNiaUFnWVhKeUxuZHlhWFJsU1c1ME16Sk1SU0E5SUVKUUxuZHlhWFJsU1c1ME16Sk1SVnh1SUNCaGNuSXVkM0pwZEdWSmJuUXpNa0pGSUQwZ1FsQXVkM0pwZEdWSmJuUXpNa0pGWEc0Z0lHRnljaTUzY21sMFpVWnNiMkYwVEVVZ1BTQkNVQzUzY21sMFpVWnNiMkYwVEVWY2JpQWdZWEp5TG5keWFYUmxSbXh2WVhSQ1JTQTlJRUpRTG5keWFYUmxSbXh2WVhSQ1JWeHVJQ0JoY25JdWQzSnBkR1ZFYjNWaWJHVk1SU0E5SUVKUUxuZHlhWFJsUkc5MVlteGxURVZjYmlBZ1lYSnlMbmR5YVhSbFJHOTFZbXhsUWtVZ1BTQkNVQzUzY21sMFpVUnZkV0pzWlVKRlhHNGdJR0Z5Y2k1bWFXeHNJRDBnUWxBdVptbHNiRnh1SUNCaGNuSXVhVzV6Y0dWamRDQTlJRUpRTG1sdWMzQmxZM1JjYmlBZ1lYSnlMblJ2UVhKeVlYbENkV1ptWlhJZ1BTQkNVQzUwYjBGeWNtRjVRblZtWm1WeVhHNWNiaUFnY21WMGRYSnVJR0Z5Y2x4dWZWeHVYRzR2THlCemJHbGpaU2h6ZEdGeWRDd2daVzVrS1Z4dVpuVnVZM1JwYjI0Z1kyeGhiWEFnS0dsdVpHVjRMQ0JzWlc0c0lHUmxabUYxYkhSV1lXeDFaU2tnZTF4dUlDQnBaaUFvZEhsd1pXOW1JR2x1WkdWNElDRTlQU0FuYm5WdFltVnlKeWtnY21WMGRYSnVJR1JsWm1GMWJIUldZV3gxWlZ4dUlDQnBibVJsZUNBOUlINSthVzVrWlhnN0lDQXZMeUJEYjJWeVkyVWdkRzhnYVc1MFpXZGxjaTVjYmlBZ2FXWWdLR2x1WkdWNElENDlJR3hsYmlrZ2NtVjBkWEp1SUd4bGJseHVJQ0JwWmlBb2FXNWtaWGdnUGowZ01Da2djbVYwZFhKdUlHbHVaR1Y0WEc0Z0lHbHVaR1Y0SUNzOUlHeGxibHh1SUNCcFppQW9hVzVrWlhnZ1BqMGdNQ2tnY21WMGRYSnVJR2x1WkdWNFhHNGdJSEpsZEhWeWJpQXdYRzU5WEc1Y2JtWjFibU4wYVc5dUlHTnZaWEpqWlNBb2JHVnVaM1JvS1NCN1hHNGdJQzh2SUVOdlpYSmpaU0JzWlc1bmRHZ2dkRzhnWVNCdWRXMWlaWElnS0hCdmMzTnBZbXg1SUU1aFRpa3NJSEp2ZFc1a0lIVndYRzRnSUM4dklHbHVJR05oYzJVZ2FYUW5jeUJtY21GamRHbHZibUZzSUNobExtY3VJREV5TXk0ME5UWXBJSFJvWlc0Z1pHOGdZVnh1SUNBdkx5QmtiM1ZpYkdVZ2JtVm5ZWFJsSUhSdklHTnZaWEpqWlNCaElFNWhUaUIwYnlBd0xpQkZZWE41TENCeWFXZG9kRDljYmlBZ2JHVnVaM1JvSUQwZ2ZuNU5ZWFJvTG1ObGFXd29LMnhsYm1kMGFDbGNiaUFnY21WMGRYSnVJR3hsYm1kMGFDQThJREFnUHlBd0lEb2diR1Z1WjNSb1hHNTlYRzVjYm1aMWJtTjBhVzl1SUdselFYSnlZWGtnS0hOMVltcGxZM1FwSUh0Y2JpQWdjbVYwZFhKdUlDaEJjbkpoZVM1cGMwRnljbUY1SUh4OElHWjFibU4wYVc5dUlDaHpkV0pxWldOMEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUU5aWFtVmpkQzV3Y205MGIzUjVjR1V1ZEc5VGRISnBibWN1WTJGc2JDaHpkV0pxWldOMEtTQTlQVDBnSjF0dlltcGxZM1FnUVhKeVlYbGRKMXh1SUNCOUtTaHpkV0pxWldOMEtWeHVmVnh1WEc1bWRXNWpkR2x2YmlCcGMwRnljbUY1YVhOb0lDaHpkV0pxWldOMEtTQjdYRzRnSUhKbGRIVnliaUJwYzBGeWNtRjVLSE4xWW1wbFkzUXBJSHg4SUVKMVptWmxjaTVwYzBKMVptWmxjaWh6ZFdKcVpXTjBLU0I4ZkZ4dUlDQWdJQ0FnYzNWaWFtVmpkQ0FtSmlCMGVYQmxiMllnYzNWaWFtVmpkQ0E5UFQwZ0oyOWlhbVZqZENjZ0ppWmNiaUFnSUNBZ0lIUjVjR1Z2WmlCemRXSnFaV04wTG14bGJtZDBhQ0E5UFQwZ0oyNTFiV0psY2lkY2JuMWNibHh1Wm5WdVkzUnBiMjRnZEc5SVpYZ2dLRzRwSUh0Y2JpQWdhV1lnS0c0Z1BDQXhOaWtnY21WMGRYSnVJQ2N3SnlBcklHNHVkRzlUZEhKcGJtY29NVFlwWEc0Z0lISmxkSFZ5YmlCdUxuUnZVM1J5YVc1bktERTJLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQjFkR1k0Vkc5Q2VYUmxjeUFvYzNSeUtTQjdYRzRnSUhaaGNpQmllWFJsUVhKeVlYa2dQU0JiWFZ4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJSE4wY2k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lIWmhjaUJpSUQwZ2MzUnlMbU5vWVhKRGIyUmxRWFFvYVNsY2JpQWdJQ0JwWmlBb1lpQThQU0F3ZURkR0tWeHVJQ0FnSUNBZ1lubDBaVUZ5Y21GNUxuQjFjMmdvYzNSeUxtTm9ZWEpEYjJSbFFYUW9hU2twWEc0Z0lDQWdaV3h6WlNCN1hHNGdJQ0FnSUNCMllYSWdjM1JoY25RZ1BTQnBYRzRnSUNBZ0lDQnBaaUFvWWlBK1BTQXdlRVE0TURBZ0ppWWdZaUE4UFNBd2VFUkdSa1lwSUdrcksxeHVJQ0FnSUNBZ2RtRnlJR2dnUFNCbGJtTnZaR1ZWVWtsRGIyMXdiMjVsYm5Rb2MzUnlMbk5zYVdObEtITjBZWEowTENCcEt6RXBLUzV6ZFdKemRISW9NU2t1YzNCc2FYUW9KeVVuS1Z4dUlDQWdJQ0FnWm05eUlDaDJZWElnYWlBOUlEQTdJR29nUENCb0xteGxibWQwYURzZ2Fpc3JLVnh1SUNBZ0lDQWdJQ0JpZVhSbFFYSnlZWGt1Y0hWemFDaHdZWEp6WlVsdWRDaG9XMnBkTENBeE5pa3BYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCaWVYUmxRWEp5WVhsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWVhOamFXbFViMEo1ZEdWeklDaHpkSElwSUh0Y2JpQWdkbUZ5SUdKNWRHVkJjbkpoZVNBOUlGdGRYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2MzUnlMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnTHk4Z1RtOWtaU2R6SUdOdlpHVWdjMlZsYlhNZ2RHOGdZbVVnWkc5cGJtY2dkR2hwY3lCaGJtUWdibTkwSUNZZ01IZzNSaTR1WEc0Z0lDQWdZbmwwWlVGeWNtRjVMbkIxYzJnb2MzUnlMbU5vWVhKRGIyUmxRWFFvYVNrZ0ppQXdlRVpHS1Z4dUlDQjlYRzRnSUhKbGRIVnliaUJpZVhSbFFYSnlZWGxjYm4xY2JseHVablZ1WTNScGIyNGdkWFJtTVRac1pWUnZRbmwwWlhNZ0tITjBjaWtnZTF4dUlDQjJZWElnWXl3Z2FHa3NJR3h2WEc0Z0lIWmhjaUJpZVhSbFFYSnlZWGtnUFNCYlhWeHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUhOMGNpNXNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJR01nUFNCemRISXVZMmhoY2tOdlpHVkJkQ2hwS1Z4dUlDQWdJR2hwSUQwZ1l5QStQaUE0WEc0Z0lDQWdiRzhnUFNCaklDVWdNalUyWEc0Z0lDQWdZbmwwWlVGeWNtRjVMbkIxYzJnb2JHOHBYRzRnSUNBZ1lubDBaVUZ5Y21GNUxuQjFjMmdvYUdrcFhHNGdJSDFjYmx4dUlDQnlaWFIxY200Z1lubDBaVUZ5Y21GNVhHNTlYRzVjYm1aMWJtTjBhVzl1SUdKaGMyVTJORlJ2UW5sMFpYTWdLSE4wY2lrZ2UxeHVJQ0J5WlhSMWNtNGdZbUZ6WlRZMExuUnZRbmwwWlVGeWNtRjVLSE4wY2lsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWW14cGRFSjFabVpsY2lBb2MzSmpMQ0JrYzNRc0lHOW1abk5sZEN3Z2JHVnVaM1JvS1NCN1hHNGdJSFpoY2lCd2IzTmNiaUFnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCc1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lHbG1JQ2dvYVNBcklHOW1abk5sZENBK1BTQmtjM1F1YkdWdVozUm9LU0I4ZkNBb2FTQStQU0J6Y21NdWJHVnVaM1JvS1NsY2JpQWdJQ0FnSUdKeVpXRnJYRzRnSUNBZ1pITjBXMmtnS3lCdlptWnpaWFJkSUQwZ2MzSmpXMmxkWEc0Z0lIMWNiaUFnY21WMGRYSnVJR2xjYm4xY2JseHVablZ1WTNScGIyNGdaR1ZqYjJSbFZYUm1PRU5vWVhJZ0tITjBjaWtnZTF4dUlDQjBjbmtnZTF4dUlDQWdJSEpsZEhWeWJpQmtaV052WkdWVlVrbERiMjF3YjI1bGJuUW9jM1J5S1Z4dUlDQjlJR05oZEdOb0lDaGxjbklwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdVM1J5YVc1bkxtWnliMjFEYUdGeVEyOWtaU2d3ZUVaR1JrUXBJQzh2SUZWVVJpQTRJR2x1ZG1Gc2FXUWdZMmhoY2x4dUlDQjlYRzU5WEc1Y2JpOHFYRzRnS2lCWFpTQm9ZWFpsSUhSdklHMWhhMlVnYzNWeVpTQjBhR0YwSUhSb1pTQjJZV3gxWlNCcGN5QmhJSFpoYkdsa0lHbHVkR1ZuWlhJdUlGUm9hWE1nYldWaGJuTWdkR2hoZENCcGRGeHVJQ29nYVhNZ2JtOXVMVzVsWjJGMGFYWmxMaUJKZENCb1lYTWdibThnWm5KaFkzUnBiMjVoYkNCamIyMXdiMjVsYm5RZ1lXNWtJSFJvWVhRZ2FYUWdaRzlsY3lCdWIzUmNiaUFxSUdWNFkyVmxaQ0IwYUdVZ2JXRjRhVzExYlNCaGJHeHZkMlZrSUhaaGJIVmxMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQjJaWEpwWm5WcGJuUWdLSFpoYkhWbExDQnRZWGdwSUh0Y2JpQWdZWE56WlhKMEtIUjVjR1Z2WmlCMllXeDFaU0E5UFQwZ0oyNTFiV0psY2ljc0lDZGpZVzV1YjNRZ2QzSnBkR1VnWVNCdWIyNHRiblZ0WW1WeUlHRnpJR0VnYm5WdFltVnlKeWxjYmlBZ1lYTnpaWEowS0haaGJIVmxJRDQ5SURBc0lDZHpjR1ZqYVdacFpXUWdZU0J1WldkaGRHbDJaU0IyWVd4MVpTQm1iM0lnZDNKcGRHbHVaeUJoYmlCMWJuTnBaMjVsWkNCMllXeDFaU2NwWEc0Z0lHRnpjMlZ5ZENoMllXeDFaU0E4UFNCdFlYZ3NJQ2QyWVd4MVpTQnBjeUJzWVhKblpYSWdkR2hoYmlCdFlYaHBiWFZ0SUhaaGJIVmxJR1p2Y2lCMGVYQmxKeWxjYmlBZ1lYTnpaWEowS0UxaGRHZ3VabXh2YjNJb2RtRnNkV1VwSUQwOVBTQjJZV3gxWlN3Z0ozWmhiSFZsSUdoaGN5QmhJR1p5WVdOMGFXOXVZV3dnWTI5dGNHOXVaVzUwSnlsY2JuMWNibHh1Wm5WdVkzUnBiMjRnZG1WeWFXWnphVzUwSUNoMllXeDFaU3dnYldGNExDQnRhVzRwSUh0Y2JpQWdZWE56WlhKMEtIUjVjR1Z2WmlCMllXeDFaU0E5UFQwZ0oyNTFiV0psY2ljc0lDZGpZVzV1YjNRZ2QzSnBkR1VnWVNCdWIyNHRiblZ0WW1WeUlHRnpJR0VnYm5WdFltVnlKeWxjYmlBZ1lYTnpaWEowS0haaGJIVmxJRHc5SUcxaGVDd2dKM1poYkhWbElHeGhjbWRsY2lCMGFHRnVJRzFoZUdsdGRXMGdZV3hzYjNkbFpDQjJZV3gxWlNjcFhHNGdJR0Z6YzJWeWRDaDJZV3gxWlNBK1BTQnRhVzRzSUNkMllXeDFaU0J6YldGc2JHVnlJSFJvWVc0Z2JXbHVhVzExYlNCaGJHeHZkMlZrSUhaaGJIVmxKeWxjYmlBZ1lYTnpaWEowS0UxaGRHZ3VabXh2YjNJb2RtRnNkV1VwSUQwOVBTQjJZV3gxWlN3Z0ozWmhiSFZsSUdoaGN5QmhJR1p5WVdOMGFXOXVZV3dnWTI5dGNHOXVaVzUwSnlsY2JuMWNibHh1Wm5WdVkzUnBiMjRnZG1WeWFXWkpSVVZGTnpVMElDaDJZV3gxWlN3Z2JXRjRMQ0J0YVc0cElIdGNiaUFnWVhOelpYSjBLSFI1Y0dWdlppQjJZV3gxWlNBOVBUMGdKMjUxYldKbGNpY3NJQ2RqWVc1dWIzUWdkM0pwZEdVZ1lTQnViMjR0Ym5WdFltVnlJR0Z6SUdFZ2JuVnRZbVZ5SnlsY2JpQWdZWE56WlhKMEtIWmhiSFZsSUR3OUlHMWhlQ3dnSjNaaGJIVmxJR3hoY21kbGNpQjBhR0Z1SUcxaGVHbHRkVzBnWVd4c2IzZGxaQ0IyWVd4MVpTY3BYRzRnSUdGemMyVnlkQ2gyWVd4MVpTQStQU0J0YVc0c0lDZDJZV3gxWlNCemJXRnNiR1Z5SUhSb1lXNGdiV2x1YVcxMWJTQmhiR3h2ZDJWa0lIWmhiSFZsSnlsY2JuMWNibHh1Wm5WdVkzUnBiMjRnWVhOelpYSjBJQ2gwWlhOMExDQnRaWE56WVdkbEtTQjdYRzRnSUdsbUlDZ2hkR1Z6ZENrZ2RHaHliM2NnYm1WM0lFVnljbTl5S0cxbGMzTmhaMlVnZkh3Z0owWmhhV3hsWkNCaGMzTmxjblJwYjI0bktWeHVmVnh1WEc1OUtTNWpZV3hzS0hSb2FYTXNjbVZ4ZFdseVpTaGNJbWQ2VGtOblRGd2lLU3gwZVhCbGIyWWdjMlZzWmlBaFBUMGdYQ0oxYm1SbFptbHVaV1JjSWlBL0lITmxiR1lnT2lCMGVYQmxiMllnZDJsdVpHOTNJQ0U5UFNCY0luVnVaR1ZtYVc1bFpGd2lJRDhnZDJsdVpHOTNJRG9nZTMwc2NtVnhkV2x5WlNoY0ltSjFabVpsY2x3aUtTNUNkV1ptWlhJc1lYSm5kVzFsYm5Seld6TmRMR0Z5WjNWdFpXNTBjMXMwWFN4aGNtZDFiV1Z1ZEhOYk5WMHNZWEpuZFcxbGJuUnpXelpkTEZ3aUx5NHVYRnhjWEM0dVhGeGNYRzV2WkdWZmJXOWtkV3hsYzF4Y1hGeGljbTkzYzJWeWFXWjVYRnhjWEc1dlpHVmZiVzlrZFd4bGMxeGNYRnhpZFdabVpYSmNYRnhjYVc1a1pYZ3Vhbk5jSWl4Y0lpOHVMbHhjWEZ3dUxseGNYRnh1YjJSbFgyMXZaSFZzWlhOY1hGeGNZbkp2ZDNObGNtbG1lVnhjWEZ4dWIyUmxYMjF2WkhWc1pYTmNYRnhjWW5WbVptVnlYQ0lwSWl3aUtHWjFibU4wYVc5dUlDaHdjbTlqWlhOekxHZHNiMkpoYkN4Q2RXWm1aWElzWDE5aGNtZDFiV1Z1ZERBc1gxOWhjbWQxYldWdWRERXNYMTloY21kMWJXVnVkRElzWDE5aGNtZDFiV1Z1ZERNc1gxOW1hV3hsYm1GdFpTeGZYMlJwY201aGJXVXBlMXh1THk4Z2MyaHBiU0JtYjNJZ2RYTnBibWNnY0hKdlkyVnpjeUJwYmlCaWNtOTNjMlZ5WEc1Y2JuWmhjaUJ3Y205alpYTnpJRDBnYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0I3ZlR0Y2JseHVjSEp2WTJWemN5NXVaWGgwVkdsamF5QTlJQ2htZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnZG1GeUlHTmhibE5sZEVsdGJXVmthV0YwWlNBOUlIUjVjR1Z2WmlCM2FXNWtiM2NnSVQwOUlDZDFibVJsWm1sdVpXUW5YRzRnSUNBZ0ppWWdkMmx1Wkc5M0xuTmxkRWx0YldWa2FXRjBaVHRjYmlBZ0lDQjJZWElnWTJGdVVHOXpkQ0E5SUhSNWNHVnZaaUIzYVc1a2IzY2dJVDA5SUNkMWJtUmxabWx1WldRblhHNGdJQ0FnSmlZZ2QybHVaRzkzTG5CdmMzUk5aWE56WVdkbElDWW1JSGRwYm1SdmR5NWhaR1JGZG1WdWRFeHBjM1JsYm1WeVhHNGdJQ0FnTzF4dVhHNGdJQ0FnYVdZZ0tHTmhibE5sZEVsdGJXVmthV0YwWlNrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z0tHWXBJSHNnY21WMGRYSnVJSGRwYm1SdmR5NXpaWFJKYlcxbFpHbGhkR1VvWmlrZ2ZUdGNiaUFnSUNCOVhHNWNiaUFnSUNCcFppQW9ZMkZ1VUc5emRDa2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2NYVmxkV1VnUFNCYlhUdGNiaUFnSUNBZ0lDQWdkMmx1Wkc5M0xtRmtaRVYyWlc1MFRHbHpkR1Z1WlhJb0oyMWxjM05oWjJVbkxDQm1kVzVqZEdsdmJpQW9aWFlwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCemIzVnlZMlVnUFNCbGRpNXpiM1Z5WTJVN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0tITnZkWEpqWlNBOVBUMGdkMmx1Wkc5M0lIeDhJSE52ZFhKalpTQTlQVDBnYm5Wc2JDa2dKaVlnWlhZdVpHRjBZU0E5UFQwZ0ozQnliMk5sYzNNdGRHbGpheWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGRpNXpkRzl3VUhKdmNHRm5ZWFJwYjI0b0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvY1hWbGRXVXViR1Z1WjNSb0lENGdNQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnWm00Z1BTQnhkV1YxWlM1emFHbG1kQ2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm1iaWdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlN3Z2RISjFaU2s3WEc1Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUc1bGVIUlVhV05yS0dadUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeGRXVjFaUzV3ZFhOb0tHWnVLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIZHBibVJ2ZHk1d2IzTjBUV1Z6YzJGblpTZ25jSEp2WTJWemN5MTBhV05ySnl3Z0p5b25LVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNGdibVY0ZEZScFkyc29abTRwSUh0Y2JpQWdJQ0FnSUNBZ2MyVjBWR2x0Wlc5MWRDaG1iaXdnTUNrN1hHNGdJQ0FnZlR0Y2JuMHBLQ2s3WEc1Y2JuQnliMk5sYzNNdWRHbDBiR1VnUFNBblluSnZkM05sY2ljN1hHNXdjbTlqWlhOekxtSnliM2R6WlhJZ1BTQjBjblZsTzF4dWNISnZZMlZ6Y3k1bGJuWWdQU0I3ZlR0Y2JuQnliMk5sYzNNdVlYSm5kaUE5SUZ0ZE8xeHVYRzVtZFc1amRHbHZiaUJ1YjI5d0tDa2dlMzFjYmx4dWNISnZZMlZ6Y3k1dmJpQTlJRzV2YjNBN1hHNXdjbTlqWlhOekxtRmtaRXhwYzNSbGJtVnlJRDBnYm05dmNEdGNibkJ5YjJObGMzTXViMjVqWlNBOUlHNXZiM0E3WEc1d2NtOWpaWE56TG05bVppQTlJRzV2YjNBN1hHNXdjbTlqWlhOekxuSmxiVzkyWlV4cGMzUmxibVZ5SUQwZ2JtOXZjRHRjYm5CeWIyTmxjM011Y21WdGIzWmxRV3hzVEdsemRHVnVaWEp6SUQwZ2JtOXZjRHRjYm5CeWIyTmxjM011WlcxcGRDQTlJRzV2YjNBN1hHNWNibkJ5YjJObGMzTXVZbWx1WkdsdVp5QTlJR1oxYm1OMGFXOXVJQ2h1WVcxbEtTQjdYRzRnSUNBZ2RHaHliM2NnYm1WM0lFVnljbTl5S0Nkd2NtOWpaWE56TG1KcGJtUnBibWNnYVhNZ2JtOTBJSE4xY0hCdmNuUmxaQ2NwTzF4dWZWeHVYRzR2THlCVVQwUlBLSE5vZEhsc2JXRnVLVnh1Y0hKdlkyVnpjeTVqZDJRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3SUhKbGRIVnliaUFuTHljZ2ZUdGNibkJ5YjJObGMzTXVZMmhrYVhJZ1BTQm1kVzVqZEdsdmJpQW9aR2x5S1NCN1hHNGdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2R3Y205alpYTnpMbU5vWkdseUlHbHpJRzV2ZENCemRYQndiM0owWldRbktUdGNibjA3WEc1Y2JuMHBMbU5oYkd3b2RHaHBjeXh5WlhGMWFYSmxLRndpWjNwT1EyZE1YQ0lwTEhSNWNHVnZaaUJ6Wld4bUlDRTlQU0JjSW5WdVpHVm1hVzVsWkZ3aUlEOGdjMlZzWmlBNklIUjVjR1Z2WmlCM2FXNWtiM2NnSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lnUHlCM2FXNWtiM2NnT2lCN2ZTeHlaWEYxYVhKbEtGd2lZblZtWm1WeVhDSXBMa0oxWm1abGNpeGhjbWQxYldWdWRITmJNMTBzWVhKbmRXMWxiblJ6V3pSZExHRnlaM1Z0Wlc1MGMxczFYU3hoY21kMWJXVnVkSE5iTmwwc1hDSXZMaTVjWEZ4Y0xpNWNYRnhjYm05a1pWOXRiMlIxYkdWelhGeGNYR0p5YjNkelpYSnBabmxjWEZ4Y2JtOWtaVjl0YjJSMWJHVnpYRnhjWEhCeWIyTmxjM05jWEZ4Y1luSnZkM05sY2k1cWMxd2lMRndpTHk0dVhGeGNYQzR1WEZ4Y1hHNXZaR1ZmYlc5a2RXeGxjMXhjWEZ4aWNtOTNjMlZ5YVdaNVhGeGNYRzV2WkdWZmJXOWtkV3hsYzF4Y1hGeHdjbTlqWlhOelhDSXBJaXdpS0daMWJtTjBhVzl1SUNod2NtOWpaWE56TEdkc2IySmhiQ3hDZFdabVpYSXNYMTloY21kMWJXVnVkREFzWDE5aGNtZDFiV1Z1ZERFc1gxOWhjbWQxYldWdWRESXNYMTloY21kMWJXVnVkRE1zWDE5bWFXeGxibUZ0WlN4ZlgyUnBjbTVoYldVcGUxeHVaWGh3YjNKMGN5NXlaV0ZrSUQwZ1puVnVZM1JwYjI0Z0tHSjFabVpsY2l3Z2IyWm1jMlYwTENCcGMweEZMQ0J0VEdWdUxDQnVRbmwwWlhNcElIdGNiaUFnZG1GeUlHVXNJRzFjYmlBZ2RtRnlJR1ZNWlc0Z1BTQnVRbmwwWlhNZ0tpQTRJQzBnYlV4bGJpQXRJREZjYmlBZ2RtRnlJR1ZOWVhnZ1BTQW9NU0E4UENCbFRHVnVLU0F0SURGY2JpQWdkbUZ5SUdWQ2FXRnpJRDBnWlUxaGVDQStQaUF4WEc0Z0lIWmhjaUJ1UW1sMGN5QTlJQzAzWEc0Z0lIWmhjaUJwSUQwZ2FYTk1SU0EvSUNodVFubDBaWE1nTFNBeEtTQTZJREJjYmlBZ2RtRnlJR1FnUFNCcGMweEZJRDhnTFRFZ09pQXhYRzRnSUhaaGNpQnpJRDBnWW5WbVptVnlXMjltWm5ObGRDQXJJR2xkWEc1Y2JpQWdhU0FyUFNCa1hHNWNiaUFnWlNBOUlITWdKaUFvS0RFZ1BEd2dLQzF1UW1sMGN5a3BJQzBnTVNsY2JpQWdjeUErUGowZ0tDMXVRbWwwY3lsY2JpQWdia0pwZEhNZ0t6MGdaVXhsYmx4dUlDQm1iM0lnS0RzZ2JrSnBkSE1nUGlBd095QmxJRDBnWlNBcUlESTFOaUFySUdKMVptWmxjbHR2Wm1aelpYUWdLeUJwWFN3Z2FTQXJQU0JrTENCdVFtbDBjeUF0UFNBNEtTQjdmVnh1WEc0Z0lHMGdQU0JsSUNZZ0tDZ3hJRHc4SUNndGJrSnBkSE1wS1NBdElERXBYRzRnSUdVZ1BqNDlJQ2d0YmtKcGRITXBYRzRnSUc1Q2FYUnpJQ3M5SUcxTVpXNWNiaUFnWm05eUlDZzdJRzVDYVhSeklENGdNRHNnYlNBOUlHMGdLaUF5TlRZZ0t5QmlkV1ptWlhKYmIyWm1jMlYwSUNzZ2FWMHNJR2tnS3owZ1pDd2dia0pwZEhNZ0xUMGdPQ2tnZTMxY2JseHVJQ0JwWmlBb1pTQTlQVDBnTUNrZ2UxeHVJQ0FnSUdVZ1BTQXhJQzBnWlVKcFlYTmNiaUFnZlNCbGJITmxJR2xtSUNobElEMDlQU0JsVFdGNEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUcwZ1B5Qk9ZVTRnT2lBb0tITWdQeUF0TVNBNklERXBJQ29nU1c1bWFXNXBkSGtwWEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnYlNBOUlHMGdLeUJOWVhSb0xuQnZkeWd5TENCdFRHVnVLVnh1SUNBZ0lHVWdQU0JsSUMwZ1pVSnBZWE5jYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdLSE1nUHlBdE1TQTZJREVwSUNvZ2JTQXFJRTFoZEdndWNHOTNLRElzSUdVZ0xTQnRUR1Z1S1Z4dWZWeHVYRzVsZUhCdmNuUnpMbmR5YVhSbElEMGdablZ1WTNScGIyNGdLR0oxWm1abGNpd2dkbUZzZFdVc0lHOW1abk5sZEN3Z2FYTk1SU3dnYlV4bGJpd2dia0o1ZEdWektTQjdYRzRnSUhaaGNpQmxMQ0J0TENCalhHNGdJSFpoY2lCbFRHVnVJRDBnYmtKNWRHVnpJQ29nT0NBdElHMU1aVzRnTFNBeFhHNGdJSFpoY2lCbFRXRjRJRDBnS0RFZ1BEd2daVXhsYmlrZ0xTQXhYRzRnSUhaaGNpQmxRbWxoY3lBOUlHVk5ZWGdnUGo0Z01WeHVJQ0IyWVhJZ2NuUWdQU0FvYlV4bGJpQTlQVDBnTWpNZ1B5Qk5ZWFJvTG5CdmR5Z3lMQ0F0TWpRcElDMGdUV0YwYUM1d2IzY29NaXdnTFRjM0tTQTZJREFwWEc0Z0lIWmhjaUJwSUQwZ2FYTk1SU0EvSURBZ09pQW9ia0o1ZEdWeklDMGdNU2xjYmlBZ2RtRnlJR1FnUFNCcGMweEZJRDhnTVNBNklDMHhYRzRnSUhaaGNpQnpJRDBnZG1Gc2RXVWdQQ0F3SUh4OElDaDJZV3gxWlNBOVBUMGdNQ0FtSmlBeElDOGdkbUZzZFdVZ1BDQXdLU0EvSURFZ09pQXdYRzVjYmlBZ2RtRnNkV1VnUFNCTllYUm9MbUZpY3loMllXeDFaU2xjYmx4dUlDQnBaaUFvYVhOT1lVNG9kbUZzZFdVcElIeDhJSFpoYkhWbElEMDlQU0JKYm1acGJtbDBlU2tnZTF4dUlDQWdJRzBnUFNCcGMwNWhUaWgyWVd4MVpTa2dQeUF4SURvZ01GeHVJQ0FnSUdVZ1BTQmxUV0Y0WEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnWlNBOUlFMWhkR2d1Wm14dmIzSW9UV0YwYUM1c2IyY29kbUZzZFdVcElDOGdUV0YwYUM1TVRqSXBYRzRnSUNBZ2FXWWdLSFpoYkhWbElDb2dLR01nUFNCTllYUm9MbkJ2ZHlneUxDQXRaU2twSUR3Z01Ta2dlMXh1SUNBZ0lDQWdaUzB0WEc0Z0lDQWdJQ0JqSUNvOUlESmNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tHVWdLeUJsUW1saGN5QStQU0F4S1NCN1hHNGdJQ0FnSUNCMllXeDFaU0FyUFNCeWRDQXZJR05jYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ2RtRnNkV1VnS3owZ2NuUWdLaUJOWVhSb0xuQnZkeWd5TENBeElDMGdaVUpwWVhNcFhHNGdJQ0FnZlZ4dUlDQWdJR2xtSUNoMllXeDFaU0FxSUdNZ1BqMGdNaWtnZTF4dUlDQWdJQ0FnWlNzclhHNGdJQ0FnSUNCaklDODlJREpjYmlBZ0lDQjlYRzVjYmlBZ0lDQnBaaUFvWlNBcklHVkNhV0Z6SUQ0OUlHVk5ZWGdwSUh0Y2JpQWdJQ0FnSUcwZ1BTQXdYRzRnSUNBZ0lDQmxJRDBnWlUxaGVGeHVJQ0FnSUgwZ1pXeHpaU0JwWmlBb1pTQXJJR1ZDYVdGeklENDlJREVwSUh0Y2JpQWdJQ0FnSUcwZ1BTQW9kbUZzZFdVZ0tpQmpJQzBnTVNrZ0tpQk5ZWFJvTG5CdmR5Z3lMQ0J0VEdWdUtWeHVJQ0FnSUNBZ1pTQTlJR1VnS3lCbFFtbGhjMXh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNCdElEMGdkbUZzZFdVZ0tpQk5ZWFJvTG5CdmR5Z3lMQ0JsUW1saGN5QXRJREVwSUNvZ1RXRjBhQzV3YjNjb01pd2diVXhsYmlsY2JpQWdJQ0FnSUdVZ1BTQXdYRzRnSUNBZ2ZWeHVJQ0I5WEc1Y2JpQWdabTl5SUNnN0lHMU1aVzRnUGowZ09Ec2dZblZtWm1WeVcyOW1abk5sZENBcklHbGRJRDBnYlNBbUlEQjRabVlzSUdrZ0t6MGdaQ3dnYlNBdlBTQXlOVFlzSUcxTVpXNGdMVDBnT0NrZ2UzMWNibHh1SUNCbElEMGdLR1VnUER3Z2JVeGxiaWtnZkNCdFhHNGdJR1ZNWlc0Z0t6MGdiVXhsYmx4dUlDQm1iM0lnS0RzZ1pVeGxiaUErSURBN0lHSjFabVpsY2x0dlptWnpaWFFnS3lCcFhTQTlJR1VnSmlBd2VHWm1MQ0JwSUNzOUlHUXNJR1VnTHowZ01qVTJMQ0JsVEdWdUlDMDlJRGdwSUh0OVhHNWNiaUFnWW5WbVptVnlXMjltWm5ObGRDQXJJR2tnTFNCa1hTQjhQU0J6SUNvZ01USTRYRzU5WEc1Y2JuMHBMbU5oYkd3b2RHaHBjeXh5WlhGMWFYSmxLRndpWjNwT1EyZE1YQ0lwTEhSNWNHVnZaaUJ6Wld4bUlDRTlQU0JjSW5WdVpHVm1hVzVsWkZ3aUlEOGdjMlZzWmlBNklIUjVjR1Z2WmlCM2FXNWtiM2NnSVQwOUlGd2lkVzVrWldacGJtVmtYQ0lnUHlCM2FXNWtiM2NnT2lCN2ZTeHlaWEYxYVhKbEtGd2lZblZtWm1WeVhDSXBMa0oxWm1abGNpeGhjbWQxYldWdWRITmJNMTBzWVhKbmRXMWxiblJ6V3pSZExHRnlaM1Z0Wlc1MGMxczFYU3hoY21kMWJXVnVkSE5iTmwwc1hDSXZMaTVjWEZ4Y0xpNWNYRnhjYm05a1pWOXRiMlIxYkdWelhGeGNYR2xsWldVM05UUmNYRnhjYVc1a1pYZ3Vhbk5jSWl4Y0lpOHVMbHhjWEZ3dUxseGNYRnh1YjJSbFgyMXZaSFZzWlhOY1hGeGNhV1ZsWlRjMU5Gd2lLU0lzSWlobWRXNWpkR2x2YmlBb2NISnZZMlZ6Y3l4bmJHOWlZV3dzUW5WbVptVnlMRjlmWVhKbmRXMWxiblF3TEY5ZllYSm5kVzFsYm5ReExGOWZZWEpuZFcxbGJuUXlMRjlmWVhKbmRXMWxiblF6TEY5ZlptbHNaVzVoYldVc1gxOWthWEp1WVcxbEtYdGNibHdpZFhObElITjBjbWxqZEZ3aU8xeHVYRzUzYVc1a2IzY3ViMjVzYjJGa0lEMGdablZ1WTNScGIyNGdLQ2tnZTF4dUlDQXZMeUJ0WDAxbGJuVmNiaUFnZEdocGN5NXRaVzUxSUQwZ2UxeHVJQ0FnSUdsMFpXMXpPaUJCY25KaGVTNW1jbTl0S0dSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeTV0Wlc1MUp5a3VZMmhwYkdSeVpXNHBMRnh1SUNBZ0lHRndjR1ZoY2pvZ1puVnVZM1JwYjI0Z1lYQndaV0Z5S0NrZ2UxeHVJQ0FnSUNBZ2RHaHBjeTVwZEdWdGN5NW1iM0pGWVdOb0tHWjFibU4wYVc5dUlDaHBkR1Z0TENCcEtTQjdYRzRnSUNBZ0lDQWdJR2wwWlcwdWIzSmtaWElnUFNCcE8xeHVJQ0FnSUNBZ0lDQnpaWFJVYVcxbGIzVjBLR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQjJZWElnYVhSbGJYTWdQU0IwYUdsekxuQmhjbVZ1ZEVWc1pXMWxiblF1WTJocGJHUnlaVzRzWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSEp2ZEdGMFpWWmhiSFZsSUQwZ016WXdJQzhnYVhSbGJYTXViR1Z1WjNSb0lDb2dkR2hwY3k1dmNtUmxjaXhjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdiR2x6ZENBOUlIUm9hWE11Y1hWbGNubFRaV3hsWTNSdmNpZ25MbXhwYzNRbktUdGNiaUFnSUNBZ0lDQWdJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUdsMFpXMXpMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2FTQStQU0IwYUdsekxtOXlaR1Z5S1NCcGRHVnRjMXRwWFM1emRIbHNaUzUwY21GdWMyWnZjbTBnUFNBbklISnZkR0YwWlNnbklDc2djbTkwWVhSbFZtRnNkV1VnS3lBblpHVm5LU2M3WEc0Z0lDQWdJQ0FnSUNBZ2ZXeHBjM1F1YzNSNWJHVXVkSEpoYm5ObWIzSnRJRDBnWjJWMFEyOXRjSFYwWldSVGRIbHNaU2hzYVhOMEtTNTBjbUZ1YzJadmNtMGdLeUFuSUhKdmRHRjBaU2duSUNzZ2NtOTBZWFJsVm1Gc2RXVWdLaUF0TVNBcklDZGtaV2NwSnp0Y2JpQWdJQ0FnSUNBZ0lDQnNhWE4wTG1Oc1lYTnpUR2x6ZEM1aFpHUW9KMlZ1WVdKc1pXUW5LVHRjYmlBZ0lDQWdJQ0FnZlM1aWFXNWtLR2wwWlcwcExDQnBJQ29nTlRBd0tUdGNiaUFnSUNBZ0lIMHBPMXh1SUNBZ0lIMHNYRzRnSUNBZ1lXTjBhWFpoZEdVNklHWjFibU4wYVc5dUlHRmpkR2wyWVhSbEtDa2dlMXh1SUNBZ0lDQWdMeThnVFhrZ2JtVjRkQ0J6ZEdWd1hHNGdJQ0FnZlN4Y2JpQWdJQ0JrWldGamRHbDJZWFJsT2lCbWRXNWpkR2x2YmlCa1pXRmpkR2wyWVhSbEtDa2dlMzFjYmlBZ2ZUdGNiaUFnWTI5dWMyOXNaUzVzYjJjb2JXVnVkU2s3WEc1OU8xeHVmU2t1WTJGc2JDaDBhR2x6TEhKbGNYVnBjbVVvWENKbmVrNURaMHhjSWlrc2RIbHdaVzltSUhObGJHWWdJVDA5SUZ3aWRXNWtaV1pwYm1Wa1hDSWdQeUJ6Wld4bUlEb2dkSGx3Wlc5bUlIZHBibVJ2ZHlBaFBUMGdYQ0oxYm1SbFptbHVaV1JjSWlBL0lIZHBibVJ2ZHlBNklIdDlMSEpsY1hWcGNtVW9YQ0ppZFdabVpYSmNJaWt1UW5WbVptVnlMR0Z5WjNWdFpXNTBjMXN6WFN4aGNtZDFiV1Z1ZEhOYk5GMHNZWEpuZFcxbGJuUnpXelZkTEdGeVozVnRaVzUwYzFzMlhTeGNJaTltWVd0bFh6VXlNRGM0WW1NMkxtcHpYQ0lzWENJdlhDSXBJbDE5Il19
