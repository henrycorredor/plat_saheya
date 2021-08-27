const boom = require('@hapi/boom')

function notFoundhandler(req, res) {
    const { output } = boom.notFound()
    res.status(output.statusCode).json(output.payload)
}

module.exports = notFoundhandler