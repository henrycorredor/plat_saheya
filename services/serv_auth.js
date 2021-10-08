const config = require('../config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const MySqlClass = require('../lib/mysql')

class auth {
    constructor() {
        this.db = MySqlClass
    }

    async login(identificacion, contrasenia) {

        const dbUserData = await this.db.doQuery(
            `SELECT usuarios.usuario_id, usuarios.rol, contrasenias.contrasenia
            FROM usuarios
            JOIN contrasenias ON usuarios.num_identificacion = ${identificacion} AND contrasenias.id = usuarios.usuario_id`)

        if (!dbUserData) {
            throw boom.unauthorized('Wrong credentials')
        } else {
            const match = await bcrypt.compare(contrasenia, dbUserData[0].contrasenia)
            if (match) {
                const payload = {
                    id: dbUserData[0].usuario_id,
                    rol: dbUserData[0].rol
                }
                return await jwt.sign(payload, config.jwtSecret, { expiresIn: '5 days' })
            } else {
                throw boom.unauthorized('Wrong credentials')
            }
        }
    }
}

module.exports = auth