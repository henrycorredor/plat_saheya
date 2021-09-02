const express = require('express')
const router = express.Router()

const boom = require('@hapi/boom')
const validationHandler = require('../utils/middlewares/validation_handler')
const { userIdSchema, createUserSchema, editUserSchema } = require('../utils/schemas/schema_user')
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

router.post('/', validationHandler(createUserSchema), async (req, res, next) => {
    try {
        const result = await services.createUser(req.body)
        res.status(201).json({
            message: 'User created',
            statusCode: '201',
            data: req.body
        })
    } catch (error) {
        next(error)
    }
})

router.get('/:usuario_id', validationHandler(userIdSchema, 'params'), async (req, res, next) => {
    try {
        const user = await services.getUser(req.params.usuario_id)
        if (user) {
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

router.put('/:usuario_id', validationHandler(userIdSchema, 'params'), validationHandler(editUserSchema), async (req, res, next) => {
    try {
        const result = await services.editUser(req.params.usuario_id, req.body)
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

router.get('/:usuario_id/loan', validationHandler(userIdSchema, 'params'), async (req, res, next) => {
    try {
        const data = await services.getUserLoans(req.params.usuario_id)
        if (data) {
            res.json({
                message: `User ${req.params.usuario_id} loans`,
                statusCode: '200',
                data: data
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

router.delete('/:usuario_id', validationHandler(userIdSchema, 'params'), async (req, res, next) => {
    try {
        const data = await services.deleteUser(req.params.usuario_id)
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