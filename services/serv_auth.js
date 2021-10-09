const config = require('../config')
const jwt = require('jsonwebtoken')
const argon2 = require('argon2')
const boom = require('@hapi/boom')
const MySqlClass = require('../lib/mysql')

class auth {
    constructor() {
        this.db = MySqlClass
    }

    async login(identificacion, contrasenia) {

        const dbUserData = await this.db.doQuery(
            `SELECT users.id, users.rol, passwords.password
            FROM users
            JOIN passwords ON users.id_document_number = ${identificacion} AND passwords.user_id = users.id`)
        if (!dbUserData) {
            throw boom.unauthorized('Wrong credentials')
        } else {
            const match = await argon2.verify(dbUserData[0].password, contrasenia)
            if (match) {
                const payload = {
                    id: dbUserData[0].id,
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