const express = require('express')
const enrutador = express.Router()
const seg = require('../seguridad/seg-controlador')
const plantillas = require('../../frontend/frontend-control')

enrutador.get('/', acceso)
enrutador.get('/portada', seg.caso('validarFicha'), portada)
enrutador.get('/lista', seg.caso('validarFicha'), lista)
enrutador.get('/inscribir', seg.caso('validarFicha'), inscribir)
enrutador.get('/registrar', seg.caso('validarFicha'), registrar)

function acceso(pet, respuesta) {
    plantillas.plano(respuesta, 'ingresar.html')
}

function lista(pet, respuesta) {
    plantillas.plano(respuesta, 'listar.html')
}

function inscribir(pet, res) {
    plantillas.plano(res, 'inscribir.html')
}

function portada(pet, res) {
    plantillas.pugTemplate(pet, res, 'portada')
}

function registrar(pet,res){
    plantillas.pugTemplate(pet, res, 'registrar')
}

module.exports = enrutador