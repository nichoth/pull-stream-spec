// the source stream takes two params: abort and cb
// it calls the cb with two params: (end, value)
// the source stream has a contract: if it is passed a truthy `abort`
// param, it must call the callback with a truthy `end` param
function SourceTest (test, source) {
    test('source that aborts right away', function (t) {
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
    return function sink (source) {
        source(true, function (end, data) {
            t.ok(end, 'should end after getting `abort`')
        })
    }
}

function AsyncSink (t) {
    return function asyncSink (source) {
        var called = [false,false,false]
        var i = 0
        process.nextTick(function () {
            source(null, function onNext (end, data) {
                if (end || i > 2) return t.end()
                if (called[i]) {
                    t.fail('should not callback before the sink is ready')
                }
                called[i] = true
                i++
                process.nextTick(function () {
                    source(null, onNext)
                })
            })
        })
    }
}

function SlowSink (t) {
    return function asyncSink (source) {
        var called = [false,false,false]
        var i = 0
        setTimeout(function () {
            source(null, function onNext (end, data) {
                if (end || i > 2) return t.end()
                if (called[i]) {
                    t.fail('should not callback before the sink is ready')
                }
                called[i] = true
                i++
                process.nextTick(function () {
                    source(null, onNext)
                })
            })
        }, 50)
    }
}

SourceTest.AbortingSink = AbortingSink
SourceTest.AsyncSink = AsyncSink
SourceTest.SlowSink = SlowSink
module.exports = SourceTest
