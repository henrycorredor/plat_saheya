const { string } = require('@hapi/joi')
const joi = require('@hapi/joi')

module.exports = joi.object({
    id: joi.number().required(),
    nombre: joi.string().required(),
    apellido: joi.string().required()
})