const express = require('express')
const controlador = require('./api-controlador')
const seg = require('../seguridad/seg-controlador')
const respuestas = require('../utiles/respuestas')

const enrutador = express.Router()

enrutador.post('/identificarse', seg.caso('identificarse'), claveValida)
enrutador.get('/listar', seg.caso('validarFicha'), listar)
enrutador.post('/inscribir', seg.caso('validarFicha'), inscribir)
enrutador.post('/registrar_movimiento', seg.caso('validarFicha'), reg_movimiento)

enrutador.post('/experimentos', (pet, res) => {
    console.log(pet.body)
    res.json(pet.body)
})

function listar(pet, respuesta) {
    controlador.listar()
        .then(datos => {
            respuestas.exito(respuesta, datos)
        })
        .catch(err => { })
}

function inscribir(pet, respuesta) {
    controlador.inscribir(pet)
        .then(datos => respuestas.exito(respuesta, datos))
        .catch(err => {
            if (err = 'Usuario existente') {
                respuestas.error(respuesta, 'El usuario ya existe, verifique e intentelo de nuevo')
            } else {
                respuestas.error(respuesta, err)
            }
        })
}

function claveValida(pet, respuesta) {
    seg.generarFicha(pet, respuesta)
}

function reg_movimiento(pet, res) {
    controlador.registrarMovimiento(pet)
        .then(mensaje => respuestas.exito(res, `Registrado ${mensaje}`))
        .catch(error => respuestas.error(res, error))
}

module.exports = enrutador