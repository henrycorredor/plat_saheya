const boom = require('@hapi/boom')

function notFoundhandler(req, res) {
    const { output: payload, statusCode } = boom.notFound()

    res.status(statusCode).json(payload)
}

module.exports = notFoundhandler