const { string } = require('@hapi/joi')
const joi = require('@hapi/joi')

const createUser = joi.object({
    names: joi.string().required(),
    lastnames: joi.string().required(),
    birthdate: joi.date().required(),
    id_document_number: joi.number().required(),
    join_date: joi.date().required(),
    ppal_phone: joi.number(),
    email: joi.string().email(),
    password: joi.string(),
    rol: joi.string().valid('1-normal', '2-super-user', '3-treasurer', '4-president', '5-fiscal')
})

const userId = joi.object({
    id: joi.number().min(1).max(5000).required()
})

const editUser = joi.object({
    names: joi.string(),
    lastnames: joi.string(),
    birthdate: joi.date(),
    id_document_number: joi.number(),
    join_date: joi.date(),
    ppal_phone: joi.number(),
    email: joi.string().email(),
    password: joi.string(),
    rol: joi.string().valid('1-normal', '2-super-user', '3-treasurer', '4-president', '5-fiscal')
})

const freePercent = joi.object({
    percent: joi.number().min(1).max(99).required(),
    id_document_number: joi.number().required()
})

const godparents = joi.object({
    gp: joi.number().min(1).max(5000).required(),
    gs: joi.number().min(1).max(5000).required()
})

const editGodfather = joi.object({
    status: joi.valid(1, 0).required()
})

module.exports = { createUser, userId, editUser, freePercent, godparents, editGodfather }