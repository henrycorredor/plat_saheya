const joi = require('@hapi/joi')

const updatePaymentSchema = joi.object({

})

const setPaymentSchema = joi.object({
    emisor: joi.number().required(),
    fecha_realizacion: joi.date().required(),
    monto: joi.number().required(),
    comentario: joi.string(),
    destinatario: joi.number().required(),
    transacciones: joi.array().items(joi.object({
        motivo: joi.string().valid('prestamo', 'abono'),
        datos: joi.alternatives().conditional('motivo', {
            is: 'prestamo',
            then: joi.object({
                prestamo_id: joi.number().required(),
                monto_total: joi.number().required(),
                abono: joi.number().required(),
                interes: joi.number().required(),
                cuota_numero: joi.number().required(),
                fecha_realizacion: joi.date().required()
            }),
            otherwise: joi.object({
                monto: joi.number().required()
            })
        }).required()
    }))
})

module.exports = { setPaymentSchema }