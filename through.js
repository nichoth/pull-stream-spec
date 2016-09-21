var assert = require('assert')

module.exports = function Through () {
    var isResolving = false
    var ended = false
    var errd = false
    var aborted = false
    return function sink (source) {
        return function newSource (abort, next) {
            assert(!aborted, 'should not call source after aborting')
            assert(!isResolving, 'should not call source before it returns')
            aborted = abort || aborted
            isResolving = true
            source(abort, function onNext (end, data) {
                isResolving = false
                assert(!ended, 'should not emit more after ending')
                assert(!errd, 'should not emit more after error')
                if (end === true) {
                    ended = true
                    return next(end)
                }
                if (end) {
                    errd = true
                    return next(end)
                }
                next(end, data)
            })
        }
    }
}


