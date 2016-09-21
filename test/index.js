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
// about how it is called
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
