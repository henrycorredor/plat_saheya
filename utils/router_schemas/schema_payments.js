const joi = require('@hapi/joi')

const setPaymentSchema = joi.object({
    issuer: joi.number().required(),
    issuer_rol: joi.string().valid('1-normal', '2-super-user', '3-treasurer', '4-president', '5-fiscal').required(),
    transaction_date: joi.date().required(),
    amount: joi.number().required(),
    comment: joi.string(),
    receiver: joi.number().required(),
    receipt: joi.string(),
    transactions: joi.array().items(joi.object({
        aim: joi.string().valid('instalment', 'suscription').required(),
        data: joi.alternatives().conditional('aim', {
            is: 'instalment',
            then: joi.object({
                instalment_id: joi.number().required(),
                total_amount: joi.number().required(),
                amount: joi.number().required(),
                interest: joi.number().required(),
                penalty: joi.number().required()
            }),
            otherwise: joi.object({
                amount: joi.number().required()
            })
        }).required()
    }).required()).required()
})

const updatePaymentSchema = joi.object({
    status: joi.string().valid('2-rejected', '3-approved').required()
})

const paymentId = joi.object({
    paymentId: joi.number().required()
})

module.exports = { setPaymentSchema, updatePaymentSchema, paymentId }
