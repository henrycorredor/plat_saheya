const db = require('../../lib/mysql')
const boom = require('@hapi/boom')

module.exports = function (roles_array) {
    return async function (req, res, next) {
        let authorized = roles_array.some(rol => rol === req.user.rol)

        const selfRole = roles_array.find(e => Array.isArray(e))
        if (selfRole) {
            const godsons = await db.getData('godparents', `godfather = ${req.user.id} AND active = 1`, 'godson')
            const location = selfRole[1] || 'params'
            const key = selfRole[2] || 'id'
            authorized = godsons.some(godsonList => godsonList.godson === Number(req[location][key]))
            if (Number(req[location][key]) === Number(req.user.id)) authorized = true
        }


        if (!authorized) {
            next(boom.unauthorized('no enough privileges'))
        }
        next()
    }
}