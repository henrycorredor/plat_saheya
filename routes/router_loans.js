const express = require('express')
const router = express.Router()
const boom = require('@hapi/boom')

const validationHandler = require('../utils/middlewares/validation_handler')
const { applyLoanSchema, updateLoanStatus } = require('../utils/schemas/schema_loan')

const Services = require('../services/serv_loans')

const services = new Services()

router.get('/', async (req, res, next) => {
    try {
        const result = await services.getAllLoans()
        res.status(200).json({
            message: 'Loans list',
            statusCode: '200',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

router.post('/', validationHandler(applyLoanSchema), async (req, res, next) => {
    try {
        const result = await services.applyNewLoan(req.body)
        if (result.approval) {
            res.status(201).json({
                message: 'Loan setted',
                statusCode: '201',
                data: result
            })
        } else {
            next(boom.notAcceptable(result.msg))
        }
    } catch (error) {
        next(error)
    }
})

router.get('/:loanId', async (req, res, next) => {
    try {
        const result = await services.getLoan(req.params.loanId)
        if (result) {
            res.status(200).json({
                message: `Loan id ${req.params.loanId}`,
                statusCode: '200',
                data: result[0]
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

router.put('/:loandId', validationHandler(updateLoanStatus, 'body'), async (req, res, next) => {
    try {
        const { rol, new_status } = req.body
        const result = await services.updateLoan(rol, req.params.loandId, new_status)
        // if (result.status === 0) {
        //     next(boom.notFound('Inexistent resource'))
        // } else if (result.status === 400) {
        //     next(boom.badRequest('invalid or inexistent action'))
        // } else {
        res.status(200).json({
            message: result.msg,
            statusCode: '200',
            data: result
        })
        // }
    } catch (error) {
        next(error)
    }
})


module.exports = router