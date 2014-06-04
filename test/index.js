var test = require('tap').test
  , spigot = require('stream-spigot')
  , parser = require('../')

function stream(str) {
  return spigot.array([ str ])
}

function parsed(str, cb) {
  var p = parser()
  p.on('data', function (message) {
    cb(message)
  })
  stream(str).pipe(p)
}

function parseTest(t, tests) {
  t.plan(tests.length)
  tests.forEach(function(test) {
    parsed(test[0], function(message) {
      t.deepEqual(message, test[1])
    })
  })
}

test('unprefixed simple commands', function(t) {
  parseTest(t, [
    [ 'HELLO\r\n', { command: 'HELLO' } ],
    [ '123\r\n', { command: '123' } ]
  ])
})

test('prefixed simple commands', function(t) {
  parseTest(t, [
    [ ':AwesomeUser!moo@cows.computer HELLO\r\n',
        { prefix: 'AwesomeUser!moo@cows.computer', command: 'HELLO' } ],
    [ ':server.freenode.net WELCOME\r\n',
        { prefix: 'server.freenode.net', command: 'WELCOME' } ],
    [ ':nickname HI\r\n',
        { prefix: 'nickname', command: 'HI' } ],
    [ ':nickname@host.singles OHHEY\r\n',
        { prefix: 'nickname@host.singles', command: 'OHHEY' } ]
  ])
})

test('commands with parameters', function(t) {
  parseTest(t, [
    [ 'JOIN #secret awesomesauce\r\n',
        { command: 'JOIN', params: [ '#secret', 'awesomesauce' ] } ],
    [ 'LONG commands with up to 14 parameters wow mom wow mom wow mom wow mom\r\n',
        { command: 'LONG', params: [
            'commands', 'with', 'up', 'to', '14', 'parameters', 'wow', 'mom',
            'wow', 'mom', 'wow', 'mom', 'wow', 'mom'
        ] } ],
    [ ':prefixing.everything.com WHOA hold up\r\n',
        { prefix: 'prefixing.everything.com', command: 'WHOA', params: [
            'hold', 'up'
        ] } ],
    [ 'LOOK at this colon in a para:meter\r\n',
        { command: 'LOOK', params: [
            'at', 'this', 'colon', 'in', 'a', 'para:meter'
        ] } ]
    ])
})

test('commands with parameters and trailing', function(t) {
  parseTest(t, [
    [ 'PRIVMSG #channel :oh hey\r\n',
        { command: 'PRIVMSG', params: [ '#channel', 'oh hey' ] } ],
    [ ':user PRIVMSG #channel :hello there\r\n',
        { prefix: 'user', command: 'PRIVMSG', params: [
            '#channel', 'hello there'
        ] } ],
    [ 'MORE crazy colons he:re :trailing stuff\r\n',
        { command: 'MORE', params: [
            'crazy', 'colons', 'he:re', 'trailing stuff'
        ] } ],
    [ 'SUPER long commands with more than 14 params automatically get the trailing effect for ' +
        'sure. these should all be trailing\r\n',
        { command: 'SUPER', params: [
            'long', 'commands', 'with', 'more', 'than', '14', 'params', 'automatically', 'get',
            'the', 'trailing', 'effect', 'for', 'sure.', 'these should all be trailing'
        ] } ]
  ])
})

test('handles multiple messages', function(t) {
  var results = [
    { command: 'WHOA', params: [ 'hold', 'up' ] },
    { command: 'SECOND', params: [ 'message', 'coming', 'right through' ] }
  ]

  test('completed in one chunk', function(t) {
    t.plan(2)
    var i = 0
    parsed('WHOA hold up\r\nSECOND message coming :right through\r\n', function(msg) {
      t.deepEqual(msg, results[i++])
    })
  })

  test('completed over multiple chunks', function(t) {
    t.plan(2)
    var p = parser()
      , i = 0
    p.on('data', function(msg) {
      t.deepEqual(msg, results[i++])
    })

    spigot
      .array([ 'WHOA hold up\r\nSECOND message comi', 'ng :right through\r\n' ])
      .pipe(p)
  })

  t.end()
})
