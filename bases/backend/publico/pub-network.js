const express = require('express')
const enrutador = express.Router()
const seg = require('../seguridad/seg-controlador')
const plantillas = require('../../frontend/frontend-control')
const controlador = require('./pub-cotrolador')

enrutador.get('/', acceso)
enrutador.get('/portada', seg.caso('validarFicha'), portada)
enrutador.get('/lista', seg.caso('validarFicha'), lista)
enrutador.get('/inscribir', seg.caso('validarFicha'), inscribir)
enrutador.get('/registrar', seg.caso('validarFicha'), registrar)
enrutador.get('/prestamos', seg.caso('validarFicha'), prestamos)
enrutador.get('/administracion', seg.caso('validarFicha', 5), administracion)

function acceso(pet, respuesta) {
    plantillas.plano(respuesta, 'ingresar.html')
}

function lista(pet, respuesta) {
    plantillas.plano(respuesta, 'listar.html', 'Listar')
}

function inscribir(pet, res) {
    controlador.pugPlantilla(pet, res, 'inscribir', 'Inscribir usuarios')
}

function portada(pet, res) {
    controlador.pugPlantilla(pet, res, 'portada', 'Portada')
}

function registrar(pet, res) {
    controlador.pugPlantilla(pet, res, 'registrar', 'Registro de movimientos')
}

function prestamos(pet, res) {
    controlador.pugPlantilla(pet, res, 'prestamos', 'Préstamos')
}

function administracion(pet, res) {
    controlador.pugPlantilla(pet, res, 'administracion', 'Administración')
}

module.exports = enrutador