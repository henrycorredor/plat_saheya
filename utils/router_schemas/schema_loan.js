const joi = require("@hapi/joi")

const applyLoanSchema = joi.object({
    debtor_id: joi.number().required(),
    initial_date: joi.date().required(),
    initial_month: joi.string().valid(
        'this',
        'next'
    ).required(),
    instalments_in_total: joi.number().required(),
    amount: joi.number().required(),
    type: joi.number().required(),
    cosigners: joi.array().items(joi.object({
        cosigner_id: joi.number().required(),
        guaranteed_amount: joi.number().required()
    })).required()
})

const updateLoanStatus = joi.object({
    rol: joi.number().required(),
    new_status: joi.string().valid(
        '2-reject',
        '3-accept',
        '5-treasurer-approve',
        '6-treasurer-confirm-disbursement',
        '7-user-confirm-disbursement',
        '8-loan-ended',
        '10-freeze'
    ).required()
})

module.exports = { applyLoanSchema, updateLoanStatus }