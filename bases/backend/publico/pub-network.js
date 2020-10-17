const express = require('express')
const enrutador = express.Router()
const seg = require('../seguridad/seg-controlador')
const plantillas = require('../../frontend/frontend-control')

enrutador.get('/', portada)
enrutador.get('/lista', seg.caso('validarFicha'), lista)
enrutador.get('/inscribir', seg.caso('validarFicha'), inscribir)

function portada(pet, respuesta) {
    plantillas(respuesta, 'ingresar.html')
}

function lista(pet, respuesta) {
    plantillas(respuesta, 'listar.html')
}

function inscribir(pet, res) {
    plantillas(res, 'inscribir.html')
}

module.exports = enrutador