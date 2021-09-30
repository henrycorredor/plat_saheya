const express = require('express')
const router = express.Router()
const { setPaymentSchema } = require('../utils/schemas/schema_payments')
const validation = require('../utils/middlewares/validation_handler')

const paymentService = require('../services/serv_payments')
const service = new paymentService()

router.get('/', (req, res, next) => {
    res.send("hola pecueca")
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

router.put('/:cuoteId', (req, res, next) => {
    res.send('hola pecuecas')
})

module.exports = router