const boom = require('@hapi/boom')

module.exports = function (roles_array) {
    return function (req, res, next) {
        if (!roles_array.some(rol => rol === req.user.rol)) {
            next(boom.unauthorized('no enough privileges'))
        }
        next()
    }
}

