const express = require('express')
const controlador = require('./api-controlador')
const seg = require('../seguridad/seg-controlador')
const respuestas = require('../respuestas')

const enrutador = express.Router()

enrutador.post('/validarFicha', validarFicha)
enrutador.post('/identificarse', seg.caso('identificarse'), claveValida)
enrutador.get('/listar', seg.caso('pasar'), listar)
enrutador.post('/inscribir', seg.caso('pasar'), inscribir)

function listar(peticion, respuesta) {
    controlador.listar()
        .then(datos => {
            respuestas.exito(peticion, respuesta, datos)
        })
        .catch(err => {})
}

function inscribir(peticion, respuesta) {
    controlador.inscribir(peticion)
        .then(datos => respuestas.exito(peticion, respuesta, datos))
        .catch(err => console.log(err))
}

function claveValida(peticion, respuesta) {
    const ficha = seg.generarFicha
    console.log('preparado para entregar ficha')
    respuestas.entregarFicha(peticion,respuesta,ficha)
}

function validarFicha(pet,res){
    res.send()
}

module.exports = enrutador