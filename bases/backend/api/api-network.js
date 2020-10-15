const express = require('express')
const controlador = require('./api-controlador')
const seg = require('../seguridad/seg-controlador')
const respuestas = require('../respuestas')
const { sign } = require('jsonwebtoken')

const enrutador = express.Router()

enrutador.post('/identificarse', seg.caso('identificarse'), claveValida)
enrutador.get('/listar', seg.caso('validarFicha'), listar)
enrutador.post('/inscribir', seg.caso('validarFicha'), inscribir)

function listar(peticion, respuesta) {
    controlador.listar()
        .then(datos => {
            respuestas.exito(peticion, respuesta, datos)
        })
        .catch(err => { })
}

function inscribir(peticion, respuesta) {
    controlador.inscribir(peticion)
        .then(datos => respuestas.exito(peticion, respuesta, datos))
        .catch(err => console.log(err))
}

function claveValida(peticion, respuesta) {
    console.log('preparado para generar ficha')
    seg.generarFicha(peticion, respuesta)
}

module.exports = enrutador