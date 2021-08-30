const joi = require("@hapi/joi")

const applyLoanSchema = joi.object({
    fecha_inicial: joi.date().required(),
    num_cuotas: joi.string().required(),
    deudor_id: joi.number().required(),
    monto: joi.number().required(),
    coodeudores: joi.array().items(joi.object({
        id_codeudor: joi.number().required(),
        monto_avalado: joi.number().required()
    })).required()
})

const cosignerUpdateRels = joi.object({
    user_id: joi.number().required(),
    new_status: joi.boolean().required()
})

module.exports = { applyLoanSchema, cosignerUpdateRels }

/*
prestamo_id    | int unsigned | NO   | PRI | NULL              | auto_increment    |
| fecha_inicial  | timestamp    | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| num_cuotas     | tinyint      | NO   |     | NULL              |                   |
| cuotas_pagadas | tinyint      | NO   |     | 0                 |                   |
| deudor_id      | int unsigned | NO   |     | NULL              |                   |
| estado         | tinyint(1)   | NO   |     | 1                 |                   |
| monto          | int          | YES  |     | NULL              |                   |
| fecha_registro | timestamp    | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| pagado
*/