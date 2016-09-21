// the sink takes a source stream and calls it with a cb
// the cb gets passed `end` and `data` params from the source stream
// if the callback gets a truthy end param, it must not call source again
// if end is falsy, the cb can call source again, which signals that
// the sink is ready for a new event
function SinkTest (test, sink) {
    test('Source emits end', function (t) {
        sink()(End(t))
    })

    test('Source emits error', function (t) {
        sink()(Err(t))
    })

    test('Async source', function (t) {
        sink()(AsyncSource(t))
    })
}

function End (t, count) {
    count = count || 0
    var ended = false
    var i = 0
    function source (abort, next) {
        if (abort) t.fail('sink aborted before test finished')
        if (ended) t.fail('should not call source after end')
        if (i === count) {
            ended = true
            next(true)
            return t.end()
        }
        next(null, i++)
    }
    return source
}

function Err (t, count) {
    count = count || 0
    var errd = false
    var i = 0
    function source (abort, next) {
        if (abort) t.fail('sink aborted before test finished')
        if (errd) t.fail('should not call source after error')
        if (i === count) {
            errd = true
            next(new Error('test'))
            return t.end()
        }
        next(null, i++)
    }
    return source
}

function AsyncSource (t, count) {
    count = count || 0
    var ended = false
    var isResolving = false
    var i = 0
    return function asyncSource (abort, emitNext) {
        if (abort) t.fail('sink aborted before the test finished')
        if (ended) t.fail('should not call source after end')
        if (isResolving) t.fail('source was called out of turn')
        if (i === count) return process.nextTick(function () {
            ended = true
            emitNext(true)
            t.end()
        })
        isResolving = true
        process.nextTick(function () {
            isResolving = false
            emitNext(null, i++)
        })
    }
}

module.exports = SinkTest
module.exports.End = End
module.exports.Err = Err
module.exports.AsyncSource = AsyncSource
