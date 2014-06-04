#parse-irc
A simple writable stream IRC parser.

[![Build Status](https://img.shields.io/travis/tec27/parse-irc.png?style=flat)](https://travis-ci.org/tec27/parse-irc)
[![NPM](https://img.shields.io/npm/v/parse-irc.svg?style=flat)](https://www.npmjs.org/package/parse-irc)

[![NPM](https://nodei.co/npm/parse-irc.png)](https://nodei.co/npm/parse-irc/)

## Usage
```JavaScript
var net = require('net')
  , parser = require('parse-irc')()

parser.on('message', function(msg) {
  console.dir(msg)
})

net.connect(6667, 'irc.freenode.net').pipe(parser)
```

## API
```JavaScript
var createParser = require('parse-irc')
```
### methods
#### var parser = createParser()
Return a [Transform stream](http://nodejs.org/api/stream.html#stream_class_stream_transform_1)
that will parse messages as they are written to it, and emit decoded message objects. Streams
piping writing to this stream should be emitting buffers or strings, and streams reading from
it should be in `objectMode`.

### events
Like any Transform stream:
#### parser.on('data', function(msg) {})
Emitted each time a message has been fully parsed. A complete message structure looks like:
```JavaScript
// Example message:
// :server.example.com NOTICE * :*** Looking up your hostname...
{
  prefix: 'server.example.com',
  command: 'NOTICE',
  params: [ '*', '*** Looking up your hostname...' ]
}
```
Only `command` is guaranteed to be present. If the message had no prefix or had no parameters,
these fields will be `undefined` in the resulting message object.

#### parser.on('error', function(err) {})
Emitted when a parse error occurs. `err` contains information about what the invalid state was.

#### See also: [Readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable)

## Installation
`npm install parse-irc`

## Running tests
`npm test`

## License
MIT
