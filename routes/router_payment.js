const express = require('express')
const router = express.Router()
const { setPaymentSchema, updatePaymentSchema } = require('../utils/schemas/schema_payments')
const validation = require('../utils/middlewares/validation_handler')

const paymentService = require('../services/serv_payments')
const service = new paymentService()

router.get('/', async (req, res, next) => {
    try {
        const payment_list = await service.listPayments()
        res.status(200).json({
            message: `Payments list`,
            statusCode: '200',
            data: payment_list
        })
    } catch (error) {
        next(error)
    }
})

router.post('/', validation(setPaymentSchema), async (req, res, next) => {
    try {
        const result = await service.setNewPayment(req.body)
        res.status(201).json({
            message: `Payment ${result.insertId} setted`,
            statusCode: '201',
            data: result
        })
    } catch (error) {
        next(error)
    }

})

router.put('/:cuoteId', validation(updatePaymentSchema), async (req, res, next) => {
    try {
        const result = await service.updatePayment(req.params.cuoteId, req.body)
        res.status(201).json({
            message: `Payment ${req.params.cuoteId} updated`,
            statusCode: '201',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router