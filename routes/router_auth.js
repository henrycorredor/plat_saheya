const router = require('express').Router()
const boom = require('@hapi/boom')

const Service = require('../services/serv_auth')
const service = new Service()

require('dotenv').config()

//const MySqlClass = require('../lib/mysql')
//const db = new MySqlClass()
const db = require('../lib/mysql')

router.post('/login', async (req, res, next) => {
    try {
        const { identificacion, contrasenia } = req.body
        const bearer = await service.login(identificacion, contrasenia)
        res.json({
            message: `Wellcome!`,
            statusCode: '200',
            data: bearer
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router