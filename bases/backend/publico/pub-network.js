const express = require('express')
const enrutador = express.Router()
const seg = require('../seguridad/seg-controlador')
const plantillas = require('../../frontend/frontend-control')

enrutador.get('/', portada)
enrutador.get('/lista', seg.caso('pasar'), lista)
enrutador.get('/inscribir', seg.caso('nopasar'), inscribir)
enrutador.get('/autenticarse', autenticarse)

function portada(peticion, respuesta) {
    plantillas(respuesta, 'ingresar.html')
}

function lista(peticion, respuesta) {
    plantillas(respuesta, 'listar.html')
}

function inscribir(pet, res) {
    plantillas(res, 'inscribir.html')
}

function autenticarse(pet, res) {
    plantillas(res, 'autenticarse.html')
}

module.exports = enrutador