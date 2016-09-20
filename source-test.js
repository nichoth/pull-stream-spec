// the source stream takes two params: abort and cb
// it calls the cb with two params: (end, value)
// the source stream has a contract: if it is passed a truthy `abort`
// param, it must call the callback with a truthy `end` param
function SourceTest (test, source) {
    test('sink that aborts right away', function (t) {
        AbortingSink(t)(source)
    })

    test('Async Sink', function (t) {
        AsyncSink(t)(source)
    })

    test('Slow Sink', function (t) {
        SlowSink(t)(source)
    })
}

function AbortingSink (t) {
    t.plan(1)
    return function sink (source) {
        source(true, function (end, data) {
            t.ok(end, 'should end after getting `abort`')
        })
    }
}

function AsyncSink (t) {
    return function asyncSink (source) {
        var called = []
        var i = 0
        process.nextTick(function () {
            source(null, function onNext (end, data) {
                if (called[i]) {
                    t.fail('should not callback before the sink is ready')
                }
                called[i] = true
                i++
                if (end) return t.end()
                process.nextTick(function () {
                    source(null, onNext)
                })
            })
        })
    }
}

function SlowSink (t, time) {
    time = time || 50
    return function asyncSink (source) {
        var called = []
        var i = 0
        setTimeout(function () {
            source(null, function onNext (end, data) {
                if (called[i]) {
                    t.fail('should not callback before the sink is ready')
                }
                called[i] = true
                i++
                if (end) return t.end()
                setTimeout(function () {
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
