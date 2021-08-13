const usersRouter = require('./users')
const loansRouter = require('./loans')

module.exports = function (app) {
    console.log('se agregan las rutas')
    app.use('/api/user', usersRouter)
    app.use('/api/loan', loansRouter)
}