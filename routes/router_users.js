const express = require('express')
const router = express.Router()
const boom = require('@hapi/boom')

const validateSchema = require('../utils/middlewares/validation_handler')
const { createUser, userId, editUser, freePercent } = require('../utils/router_schemas/schema_user')

const validScope = require('../utils/middlewares/scopes_validation')

const Services = require('../services/serv_users')
const services = new Services()

const passport = require('passport').authenticate('jwt', { session: false })

router.get('/', passport, validScope(['2-super-user', '4-president']), async (req, res, next) => {
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

router.get('/:id', passport, validScope(['1-normal', '2-super-user', '4-president']), validateSchema(userId, 'params'), async (req, res, next) => {
    try {
        const { id } = req.params

        if (req.user.rol === '1-normal' && Number(id) !== Number(req.user.id)) throw boom.unauthorized()

        const user = await services.getUser(req.params.id)
        if (user) {
            res.json({
                message: 'User finded',
                statusCode: '200',
                data: user
            })
        } else {
            throw boom.notFound('Inexistent resource')
        }
    } catch (error) {
        next(error)
    }
})

router.post('/', passport, validScope(['2-super-user', '4-president']), validateSchema(createUser), async (req, res, next) => {
    try {
        const newUserData = await services.createUser(req.body)
        res.status(201).json({
            message: 'User created',
            statusCode: '201',
            data: newUserData
        })
    } catch (error) {
        next(error)
    }
})

router.put('/:id', passport, validScope(['2-super-user', '4-president']), validateSchema(createUser), async (req, res, next) => {
    try {
        const result = await services.editUser(req.params.id, req.body)
        if (result) {
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

router.get('/:id/loans', passport, validateSchema(userId, 'params'), async (req, res, next) => {
    try {
        
        if (req.user.rol === '1-normal' && Number(id) !== Number(req.user.id)) throw boom.unauthorized()

        const data = await services.getUserLoans(req.params.id)
        if (data) {
            res.json({
                message: `User ${req.params.id} loans`,
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

router.get('/:id_document_number/free_capital/:percent', validateSchema(freePercent, 'params'), async (req, res, next) => {
    try {
        const { id_document_number, percent } = req.params
        const freeCapital = await services.getUserFreeCapital(id_document_number, percent)
        if (freeCapital || freeCapital === 0) {
            res.json({
                message: `User identified with number ${id_document_number} free capital`,
                statusCode: '200',
                data: freeCapital
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

router.get(':id/payments', validateSchema(userId, 'params'), async (req, res, next) => {
    try {
        
        if (req.user.rol === '1-normal' && Number(id) !== Number(req.user.id)) throw boom.unauthorized()
        
        const payments = await services.getUserPayments(req.params.id)
        res.json({
            message: `User ${req.params.id} payments list`,
            statusCode: '200',
            data: payments
        })
    } catch (err) {
        next(err)
    }
})

module.exports = router