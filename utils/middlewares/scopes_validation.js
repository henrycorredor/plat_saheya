const boom = require('@hapi/boom')

module.exports = function (roles_array) {
    return function (req, res, next) {
        let authorized = roles_array.some(rol => rol === req.user.rol)

        const selfRole = roles_array.find(e => Array.isArray(e))
        if (selfRole) {
            const location = selfRole[1] || 'params'
            const key = selfRole[2] || 'id'
            if (Number(req[location][key]) === Number(req.user.id)) authorized = true
        }

        if (!authorized) {
            next(boom.unauthorized('no enough privileges'))
        }
        next()
    }
}