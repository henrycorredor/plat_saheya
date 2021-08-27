module.exports = function (err, req, res, next) {
    console.log('aqui se reporta el error lol')
    const errEstatus = err.statusCode || 500
    console.error(err.stack)
    res.status(errEstatus).send(err.message)
}