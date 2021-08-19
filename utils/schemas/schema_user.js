const { string } = require('@hapi/joi')
const joi = require('@hapi/joi')

const userIdSchema = joi.object({
    usuario_id: joi.number().required()
})

const createUserSchema = joi.object({
    num_identificacion: joi.number().required(),
    nombres: joi.string().required(),
    apellidos: joi.string().required(),
    fecha_nacimiento: joi.date().required(),
    telefono_ppal: joi.number(),
    rol: joi.number().min(1).max(5),
    email: joi.string().email(),
    capital: joi.number()
})

const editUserSchema = {
    num_identificacion: joi.number(),
    nombres: joi.string(),
    apellidos: joi.string(),
    fecha_nacimiento: joi.date(),
    telefono_ppal: joi.number(),
    rol: joi.number().min(1).max(5),
    email: joi.string().email()
}

module.exports = { userIdSchema, createUserSchema, editUserSchema }