const boom = require('@hapi/boom')

module.exports = function (schema, location = 'body') {
    return function (req, res, next) {
        console.log('--------------------------------',req[location])
        const result = schema.validate(req[location])
        if (result.error) {
            next(boom.badRequest(result.error))
        }
        next()
    }
}