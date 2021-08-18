const config = require('../config')
const boom = require('@hapi/boom')

function errorLogger(err, req, res, next) {
    if (config.dev) {
        console.log("Error stack:", err.stack)
    }
    console.log("Error message:", err.message)
    next(err)
}

function errorWrapper(err, req, res, next) {
    if (!boom.isBoom(err)) {
        next(boom.badRequest('Error en el servidor.'))
    }
    next(err)
}

function errorHandler(err, req, res, next) {
    const data = (config.dev) ? { Message: err.message, Stack: err.stack } : { Message: err.message }

    res.status(err.output.statusCode).json(err.output.payload)
}

module.exports = { errorHandler, errorLogger, errorWrapper }