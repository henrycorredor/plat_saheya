const express = require('express')
const router = express.Router()
const boom = require('@hapi/boom')

const validationHandler = require('../utils/middlewares/validation_handler')
const { applyLoanSchema, updateLoanStatus } = require('../utils/router_schemas/schema_loan')

const passport = require('passport').authenticate('jwt', { session: false })
const scopes = require('../utils/middlewares/scopes_validation')

const Services = require('../services/serv_loans')
const services = new Services()

// get all loans list
router.get('/', passport, async (req, res, next) => {
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

// apply new loan
router.post('/', passport, scopes([['self', 'body', 'debtor_id']]), validationHandler(applyLoanSchema), async (req, res, next) => {
    try {
        const result = await services.applyNewLoan(req.user, req.body)
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

//get one loan info
router.get('/:loanId', passport, async (req, res, next) => {
    try {
        const { params, user } = req
        const result = await services.getLoan(params.loanId, user)
        res.status(200).json({
            message: `Loan id ${req.params.loanId}`,
            statusCode: '200',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

//update loan status
router.put('/:loandId', passport, validationHandler(updateLoanStatus, 'body'), async (req, res, next) => {
    try {
        const { rol, new_status } = req.body
        const result = await services.updateLoan(req.params.loandId, rol, new_status, req.user)
        res.status(200).json({
            message: result.msg,
            statusCode: '200',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

router.get('/:loanId/cuote', async (req, res, next) => {
    try {
        const result = await services.getLoanCuotes(req.params.loanId)
        res.json({
            message: `Cuote list for ${req.params.loanId}`,
            statusCode: '200',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

//get one instalment
router.get('/:loanId/cuote/:cuoteNumber', validationHandler(updateLoanStatus, 'params'), async (req, res, next) => {
    try {
        const result = await services.getCuote(req.params.loanId, req.params.cuoteNumber)
        res.json({
            message: `Cuote id ${req.params.cuoteId} for ${req.params.cuoteId}`,
            statusCode: '200',
            data: result
        })
    } catch (error) {
        next(error)
    }
})

router.put('/:loanId/cuote/:cuoteId', async (req, res, next) => {
    res.json({
        message: `Cuote id ${req.params.cuoteId} for ${req.params.loanId} updated`,
        statusCode: '200',
        data: 'miau'
    })
})

module.exports = router