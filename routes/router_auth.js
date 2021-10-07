const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const boom = require('@hapi/boom')

require('dotenv').config()

const MySqlClass = require('../lib/mysql')
const db = new MySqlClass()

router.post('/login', async (req, res, next) => {
    try {
        const { identificacion, contrasenia } = req.body
        const dbUserData = await db.doQuery(
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
                const bearer = await jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5 days' })
                res.json({
                    message: `Wellcome!`,
                    statusCode: '200',
                    data: bearer
                })
            } else {
                throw boom.unauthorized('Wrong credentials')
            }
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router