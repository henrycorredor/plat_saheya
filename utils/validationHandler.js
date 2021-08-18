const boom = require('@hapi/boom')

module.exports = function (schema, location) {
    return function (req, res, next) {
        const result = schema.validate(req[location])
        if (result.error) {
            next(boom.badRequest(result.error))
        }
        next()
    }
}