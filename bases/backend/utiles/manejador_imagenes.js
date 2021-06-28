const multer = require('multer')
const path = require('path')
const fs = require('fs')
const DB = require('../../baseDatos/bd-controlador')
const { usuarioInfo } = require('../utiles/utiles')

const almacenamiento = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../imagenes/en_proceso'))
    },
    filename: async function (req, file, cb) {
        const usuario = await usuarioInfo(req)
        const formato = (file.mimetype === 'image/png') ? 'png' : 'jpg'
        resultado = await DB.insertar('imagenes', 'autor, formato', `'${usuario.usuario_id}' , '${formato}'`)
        const nombre_archivo = `${resultado.insertId}.${formato}`
        cb(null, nombre_archivo)
    }
})

module.exports = multer({ storage: almacenamiento })