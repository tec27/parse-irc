#parse-irc
A simple writable stream IRC parser.

## Installation
`npm install parse-irc`

## Usage
```
var net = require('net')
  , parser = require('parse-irc')()

parser.on('message', function(msg) {
  console.dir(msg)
})

net.connect(6667, 'irc.freenode.net').pipe(parser)
```

## Running tests
`npm test`

## License
MIT
