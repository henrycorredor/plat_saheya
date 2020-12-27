const express = require('express')
const controlador = require('./api-controlador')
const seg = require('../seguridad/seg-controlador')
const respuestas = require('../utiles/respuestas')
const lanzaError = require('../utiles/errores')

const enrutador = express.Router()

enrutador.post('/identificarse', seg.caso('identificarse'), claveValida)
enrutador.get('/listar', seg.caso('validarFicha'), listar)
enrutador.get('/verificar_coodeudor', seg.caso('validarFicha'), ver_coodeudor)
enrutador.post('/inscribir', seg.caso('validarFicha'), inscribir)
enrutador.post('/registrar_movimiento', seg.caso('validarFicha'), reg_movimiento)
enrutador.post('/aplicar_prestamo', seg.caso('validarFicha'), aplicar_prestamo)
enrutador.post('/apr_prestamo', seg.caso('validarFicha', 5), apr_prestamo)
enrutador.post('/autorizar_coodeudor', seg.caso('validarFicha'), autorizar_coodeudor)

enrutador.post('/experimentos', (pet, res) => {
    console.log(pet.body)
    res.json(pet.body)
})

function listar(pet, respuesta) {
    controlador.listar()
        .then(datos => {
            respuestas.exito(respuesta, datos)
        })
        .catch(err => {
            respuestas.error(res, err)
        })
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

async function reg_movimiento(pet, res) {
    try {
        await controlador.registrarMovimiento(pet)
        respuestas.exito(res, `registrado`)
    } catch (error) {
        respuestas.error(res, error)
    }
}

async function aplicar_prestamo(pet, res) {
    try {
        const respuesta = await controlador.aplicarPrestamo(pet)
        respuestas.exito(res, respuesta)
    } catch (err) {
        if (err.error === 0) {
            respuestas.error(res, error)
        } else {
            respuestas.error(res, err, err.error)
        }
    }
}

async function ver_coodeudor(pet, res) {
    try {
        const respuesta = await controlador.ver_coodeudor(pet)
        respuestas.exito(res, respuesta)
    } catch (error) {
        respuestas.error(res, error)
    }
}

async function apr_prestamo(pet, res) {
    try {
        const respuesta = await controlador.aprov_prestamo(pet)
        respuestas.exito(res, respuesta)
    } catch (error) {
        respuestas.error(res, error)
    }
}

async function autorizar_coodeudor(pet, res) {
    try {
        const resultado = await controlador.autorizar_coodeudor(pet)
        respuestas.exito(res, resultado)
    } catch (error) {
        console.log(error)
        respuestas.error(res, error)
    }
}

const multer = require('multer')
const path = require('path')

function imageFilter(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

enrutador.post('/recibir_imagenes', (req, res) => {
    console.log(req.file)
    console.log(req.body)
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'cargas/')
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    })

    let upload = multer({ storage: storage, fileFilter: imageFilter }).single('recibo')
    upload(req, res, function (err) {
        console.log('file: ', req.file, 'body: ', req.body)
        if (req.fileValidationError) {
            respuestas.error(res, req.fileValidationError)
        }
        else if (!req.file) {
            respuestas.error(res, 'Please select an image to upload')
        }
        else if (err instanceof multer.MulterError) {
            respuestas.error(res, err)
        }
        else if (err) {
            respuestas.error(res, err)
        } else {
            respuestas.exito(res, 'hecho')
        }
    })

})

module.exports = enrutador