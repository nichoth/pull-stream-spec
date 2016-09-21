# pull stream spec
What is a pull stream? 

The source stream takes two params: abort and cb.
It calls the cb with two params: `(end, value)`.
The source stream has a contract: if it is passed a truthy `abort`
param, it must call the callback with a truthy `end` param. It must
not call the callback more than once (before it has been called again).

The sink takes a source stream and calls it with a cb and an `abort` param.
The cb gets passed `end` and `data` params from the source stream.
If the callback gets a truthy `end` param, it must not call source again.
If `end` is falsy, the cb can call source again, which signals that
the sink is ready for more data. It should call the source with a truthy
`abort` if the sink can no longer consume data. It also must not call the
source multiple times before getting a callback.

Both sources and sinks should work whether they are called synchronously
or not.

## install

    npm install pull-stream-spec

## example

```js
var test = require('tape')
var S = require('pull-stream')
S.cat = require('pull-cat')
var spec = require('../')

// test a source stream
spec.source(test, S.values.bind(S, [1,2,3]))

// test a sink stream
function mySink () {
    return S.drain(function onData () {}, function onEnd (err) {
        // caught error
    })
}
spec.sink(test, mySink)

// compose a pipeline with a through stream that makes assertions
// about how it is called. Since it is a proxy to a source and sink,
// it could be used to test either.
test('I want to test this sink with special source streams', function (t) {
    t.plan(1)

    // emit 3 values then error
    var testSource = S.cat([
        S.values([1,2,3]),
        S.error(new Error('test'))
    ])

    var mySink = S.drain(function onData (d) {}, function onEnd (err) {
        // caught error, do nothing
    })

    t.doesNotThrow(
        S.bind(null,
            testSource,
            spec.through(),
            mySink
        ),
        'should not throw'
    )
})
```
