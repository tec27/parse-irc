#parse-irc
A simple writable stream IRC parser.

[![Build Status](https://travis-ci.org/tec27/parse-irc.png?branch=master)](https://travis-ci.org/tec27/parse-irc)

## Usage
```
var net = require('net')
  , parser = require('parse-irc')()

parser.on('message', function(msg) {
  console.dir(msg)
})

net.connect(6667, 'irc.freenode.net').pipe(parser)
```

## Installation
`npm install parse-irc`

## Running tests
`npm test`

## License
MIT
