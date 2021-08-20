const express = require('express')
const router = express.Router()
const boom = require('@hapi/boom')

const validationHandler = require('../utils/middlewares/validationHandler')
const applyLoanSchema = require('../utils/schemas/schema_loan')

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
            statusCode: '200',
            data: []
        })
    } catch (error) {
        next(error)
    }
})

router.get('/:loanId', async (req, res, next) => {
    try {
        const result = await services.getLoan(req.params.loanId)
        if (result.length > 0) {
            res.status(200).json({
                message: `Loan id ${req.params.loanId}`,
                statusCode: '200',
                data: result
            })
        } else {
            next(boom.notFound('Inexistent resource'))
        }
    } catch (error) {
        next(error)
    }
})

router.put('/:loandId', (req, res, next) => {
    res.json({
        message: `Updating loan ID ${req.params.loandId}`
    })
})


module.exports = router