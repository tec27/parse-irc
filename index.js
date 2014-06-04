var Writable = require('stream').Writable
  , inherits = require('inherits')

function Parser() {
  Writable.call(this, { decodeStrings: false })
  this._state = message
  this._temp = {}
  this._decoded = {}
}
inherits(Parser, Writable)

Parser.prototype._write = function(chunk, enc, cb) {
  var isBuffer = Buffer.isBuffer(chunk)
  for (var i = 0; i < chunk.length; i++) {
    try {
      this._state = this._state(this,
          (!isBuffer ? chunk[i] : chunk.toString('utf8', i, i + 1)))
    } catch (err) {
      return cb(err)
    }
  }
  cb()
}

// Emits a fully parsed message
Parser.prototype._parsed = function() {
  this.emit('message', this._decoded)
  this._temp = {}
  this._decoded = {}
}

// Throws an error due to an invalid character
Parser.prototype._throwError = function(char) {
  // TODO(tec27): generate better errors using the available decoded info?
  throw new Error('Parse error: unexpected \'' + char + '\' in state: ' +
      this._state.name)
}

module.exports = function() {
  return new Parser()
}

// Possible states
// (names correspond to http://tools.ietf.org/html/rfc2812#section-2.3.1,
// reproduced below)
//
// message    =  [ ":" prefix SPACE ] command [ params ] crlf
// prefix     =  servername / ( nickname [ [ "!" user ] "@" host ] )
// command    =  1*letter / 3digit
// params     =  *14( SPACE middle ) [ SPACE ":" trailing ]
//            =/ 14( SPACE middle ) [ SPACE [ ":" ] trailing ]
//
// nospcrlfcl =  %x01-09 / %x0B-0C / %x0E-1F / %x21-39 / %x3B-FF
//                 ; any octet except NUL, CR, LF, " " and ":"
// middle     =  nospcrlfcl *( ":" / nospcrlfcl )
// trailing   =  *( ":" / " " / nospcrlfcl )
//
// SPACE      =  %x20        ; space character
// crlf       =  %x0D %x0A   ; "carriage return" "linefeed"

function message(parser, char) {
  parser._decoded.command = ''
  if (char === ':') {
    parser._decoded.prefix = ''
    return prefixedMessage
  } else {
    return messagePostPrefix(parser, char)
  }
}

// TODO(tec27): parse prefixes more?
function prefixedMessage(parser, char) {
  if (char === ' ') {
    return messagePostPrefix
  }

  parser._decoded.prefix += char
  return prefixedMessage
}

function messagePostPrefix(parser, char) {
  if (char === ' ') {
    parser._decoded.params = []
    parser._temp.param = ''
    return params
  } else if (char === '\r') {
    return newline
  }

  parser._decoded.command += char
  return messagePostPrefix
}

function newline(parser, char) {
  if (char === '\n') {
    parser._parsed()
    return message
  } else {
    parser._throwError(char)
  }
}

function params(parser, char) {
  if (char === ' ' && parser._temp.param.length) {
    parser._decoded.params.push(parser._temp.param)
    parser._temp.param = ''

    if (parser._decoded.params.length < 14) {
      return params
    } else {
      parser._temp.trailing = ''
      return trailing
    }
  } else if (!parser._temp.param.length && char === ':') {
    parser._temp.trailing = ''
    return trailing
  } else if (char === '\r') {
    if (parser._temp.param.length) {
      parser._decoded.params.push(parser._temp.param)
      parser._temp.param = ''
    }

    return newline
  }

  parser._temp.param += char
  return params
}

function trailing(parser, char) {
  if (char === '\r') {
    parser._decoded.params.push(parser._temp.trailing)
    return newline
  }

  parser._temp.trailing += char
  return trailing
}
