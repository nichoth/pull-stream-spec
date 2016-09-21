var S = require('pull-stream')

// the source stream takes two params: abort and cb
// it calls the cb with two params: (end, value)
// the source stream has a contract: if it is passed a truthy `abort`
// param, it must call the callback with a truthy `end` param
function SourceTest (test, source) {
    test('sink that aborts', function (t) {
        AbortingSink(t)(source())
    })

    test('Async Sink', function (t) {
        AsyncSink(t)(source())
    })

    test('Slow Sink', function (t) {
        SlowSink(t)(source())
    })
}

function AbortingSink (t, count) {
    t.plan(1)
    count = count || 0
    var i = 0
    return S.drain(function onData (d) {
        if (i === count) return false
        i++
    }, function onEnd (err) {
        t.pass('should end after the sink aborts')
    })
}

function AsyncSink (t) {
    t.plan(1)
    return function asyncSink (source) {
        var isResolving = false
        function onNext (end, data) {
            if (isResolving) {
                t.fail('should not callback before the sink is ready')
            }
            isResolving = true
            if (end) return t.pass('should not callback out of turn')
            process.nextTick(function () {
                isResolving = false
                source(null, onNext)
            })
        }
        process.nextTick(function () {
            source(null, onNext)
        })
    }
}

function SlowSink (t, time) {
    t.plan(1)
    time = time || 50
    return function asyncSink (source) {
        var isResolving = false
        setTimeout(function () {
            source(null, function onNext (end, data) {
                if (isResolving) {
                    t.fail('should not callback before the sink is ready')
                }
                isResolving = true
                if (end) return t.pass('should not callback out of turn')
                setTimeout(function () {
                    isResolving = false
                    source(null, onNext)
                }, time)
            })
        }, time)
    }
}

SourceTest.AbortingSink = AbortingSink
SourceTest.AsyncSink = AsyncSink
SourceTest.SlowSink = SlowSink
module.exports = SourceTest
