module.exports = function (err, req, res, next) {
    const errEstatus = err.statusCode || 500
    console.error(err.stack)
    res.status(errEstatus).send(err.message)
}