const express = require('express')
const router = express.Router()
const imageHandler = require('../lib/image_handler')
const { setPaymentSchema, updatePaymentSchema, paymentId } = require('../utils/router_schemas/schema_payments')
const { userId } = require('../utils/router_schemas/schema_user')
const validation = require('../utils/middlewares/validation_handler')

const passport = require('passport').authenticate('jwt', { session: false })
const scopes = require('../utils/middlewares/scopes_validation')

const paymentService = require('../services/serv_payments')
const service = new paymentService()

//list all payments in DB
router.get('/', passport, scopes(['2-super-user', '3-treasurer', '4-president', '5-fiscal']), async (req, res, next) => {
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

// set a payment
router.post('/', passport, scopes([['self', 'body', 'issuer']]), validation(setPaymentSchema), async (req, res, next) => {
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

// make transaction valid
router.put('/:paymentId', passport, scopes(['2-super-user', '3-treasurer']), validation(updatePaymentSchema), validation(paymentId, 'params'), async (req, res, next) => {
    try {
        const result = await service.updatePayment(req.params.paymentId, req.body, req.user)
        res.status(201).json({
            message: `Payment ${req.params.paymentId} updated`,
            statusCode: '201',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

//configure multer to get pictures
const path = require('path')
const multer = require('multer')
const validation_handler = require('../utils/middlewares/validation_handler')
const updaload = multer({
    dest: '../images/receiver',
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg') {
            return cb(null, false)
        }
        cb(null, true)
    }
})

//post a picture
router.post('/user/:id/picture', passport, validation(userId, 'params'), scopes([['self']]), updaload.single('receipt'), async (req, res, next) => {
    try {
        const destinationPath = path.join(__dirname, `../images/receipts/${req.params.id}`)
        const imageId = await imageHandler(req.file, destinationPath)
        res.json({
            message: `Imagen stored with id ${imageId}`,
            statusCode: '201',
            data: imageId
        })
    } catch (e) {
        next(e)
    }
})
module.exports = router