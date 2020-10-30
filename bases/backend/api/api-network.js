const express = require('express')
const controlador = require('./api-controlador')
const seg = require('../seguridad/seg-controlador')
const respuestas = require('../utiles/respuestas')

const enrutador = express.Router()

enrutador.post('/identificarse', seg.caso('identificarse'), claveValida)
enrutador.get('/listar', seg.caso('validarFicha'), listar)
enrutador.post('/inscribir', seg.caso('validarFicha'), inscribir)

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
            console.log('el error ',err)
            if (err = 'Usuario existente'){
                respuestas.error(respuesta, 'El usuario ya existe, verifique e intentelo de nuevo')
            }else{
                respuestas.error(respuesta, err)
            }
        })
}

function claveValida(pet, respuesta) {
    seg.generarFicha(pet, respuesta)
}

module.exports = enrutador