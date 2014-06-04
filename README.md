#parse-irc
A simple writable stream IRC parser.

[![Build Status](https://travis-ci.org/tec27/parse-irc.png?branch=master)](https://travis-ci.org/tec27/parse-irc) [![NPM](https://img.shields.io/npm/v/parse-irc.svg)](https://www.npmjs.org/package/parse-irc)

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
Return a [Writable stream](http://nodejs.org/docs/latest/api/stream.html#stream_class_stream_writable)
that will parse messages as they are written to it.

### events
#### parser.on('message', function(msg) {})
Emitted each time a message has been fully parsed. A complete message structure looks like:
```JavaScript
{
  prefix: 'server.example.com',
  command: 'NOTICE',
  params: [ '*', '*** Looking up your hostname...' ]
}
```
Only `command` is guaranteed to be present. If the message had no prefix or had no parameters,
these fields will be `undefined` in the resulting message object.
```

#### parser.on('error', function(err) {})
Emitted when a parse error occurs. `err` contains information about what the invalid state was.

## Installation
`npm install parse-irc`

## Running tests
`npm test`

## License
MIT
