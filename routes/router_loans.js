const express = require('express')
const router = express.Router()
const boom = require('@hapi/boom')

const validationHandler = require('../utils/middlewares/validationHandler')
const { applyLoanSchema, cosignerUpdateRels } = require('../utils/schemas/schema_loan')

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
        res.status(201).json({
            message: 'Loan setted',
            statusCode: '201',
            data: {
                new_loan_id: result.insertId
            }
        })
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

router.put('/:loandId', validationHandler(cosignerUpdateRels, 'body'), async (req, res, next) => {
    try {
        const { user_id, new_status, action } = req.body
        const result = await services.updateLoan(req.params.loandId, user_id, new_status, action)
        if (result.status === 0) {
            next(boom.notFound('Inexistent resource'))
        } else if (result.status === 400) {
            next(boom.badRequest('invalid or inexistent action'))
        } else {
            res.status(200).json({
                message: result.msg,
                statusCode: '200',
                data: result
            })
        }
    } catch (error) {
        next(error)
    }
})


module.exports = router