module.exports = function (err, req, res, next) {
    console.error(err.stack)
    res.status(err.statusCode).send(err.message)
}