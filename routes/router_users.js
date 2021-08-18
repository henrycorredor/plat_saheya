const express = require('express')
const router = express.Router()

const boom = require('@hapi/boom')
const validateData = require('../utils/validationHandler')
const schemas = require('../utils/schemas/schema_user')
const Services = require('../services/serv_users')

const services = new Services()

router.get('/', async (req, res, next) => {
    try {
        const users = await services.getAllUsers()
        res.json({
            message: 'Listed all users',
            statusCode: '200',
            data: [...users]
        })
    } catch (error) {
        next(error)
    }
})

router.post('/', validateData(schemas, 'body'), async (req, res, next) => {
    try {
        const result = await services.createUser(req.body)
        res.status(201).json({
            message: 'User created',
            statusCode: '201',
            data: [req.body]
        })
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const user = await services.getUser(req.params.id)
        if (user.length > 0) {
            res.json({
                message: 'User finded',
                statusCode: '200',
                data: user
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const result = await services.editUser(req.params.id, req.body)
        if (result.affectedRows > 0) {
            res.json({
                message: 'User edited',
                statusCode: '200',
                data: [{
                    id: req.params.id,
                    ...req.body
                }]
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const data = await services.deleteUser(req.params.id)
        if (data[1].affectedRows > 0) {
            res.json({
                message: 'User deleted',
                statusCode: '200',
                data: data[0]
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router