// the sink takes a source stream and calls it with a cb
// the cb gets passed `end` and `data` params from the source stream
// if the callback gets a truthy end param, it must not call source again
// if end is falsy, the cb can call source again, which signals that
// the sink is ready for a new event
function SinkTest (test, sink) {
    test('end event', function (t) {
        sink(End(t))
    })

    test('error event', function (t) {
        sink(ErrorSource(t))
    })

    test('async source', function (t) {
        sink(AsyncSource(t))
    })
}

function End (t) {
    t.plan(0)
    var i = 0
    return function source (abort, emitNext) {
        if (i > 0) t.fail('should not call source after ending')
        i++
        emitNext(true)
    }
}

function ErrorSource (t) {
    t.plan(0)
    var i = 0
    return function source (abort, emitNext) {
        if (i > 0) t.fail('should not call source after error')
        i++
        emitNext(new Error('test'))
    }
}

function AsyncSource (t) {
    var called = [false, false, false]
    var i = 0
    return function asyncSource (abort, emitNext) {
        if (abort || i > 2) return process.nextTick(function () {
            t.end()
            emitNext(true)
        })
        if (called[i]) {
            t.fail('should not ask for more data before the '+
                'source is ready')
        }
        called[i] = true
        i++
        process.nextTick(function () {
            emitNext(null, 'test')
        })
    }
}

module.exports = SinkTest
module.exports.SourceThatEnds = End
module.exports.AsyncSource = AsyncSource
