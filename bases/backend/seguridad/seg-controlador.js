const baseDatos = require('../../baseDatos/bd-controlador')
const config = require('../config_serv')
const respuestas = require('../respuestas')
const jsonwebtoken = require('jsonwebtoken')

const secretojwt = config.jwt_secreto


function caso(caso) {
    function mediador(pet, res, siguiente) {
        switch (caso) {
            case 'identificarse':
                console.log('preparandose para comparar clave')
                compararClave(pet, res, siguiente)
                break
            case 'validarFicha':
                console.log('preparandose para validar ficha')
                if (validarFicha(pet)) { siguiente() } else { throw new Error('No autorizado') }
                break
            default:
                siguiente()
                break
        }
    }
    return mediador
}

function generarFicha(pet, res) {
    baseDatos.traerDato(pet.body.nombre, 'id')
        .then(dato => {
            const carga = { id: dato[0].id }
            const ficha = jsonwebtoken.sign(carga, secretojwt)
            respuestas.entregarFicha(res, ficha)
        })
        .catch(err => {
            respuestas.error(res, 'Error en el servidor: ' + err, 503)
        })
}

function validarFicha(pet) {
    const cabecera = pet.headers.cookie || '';
    if (!cabecera) {
        throw new Error('No pasa, no hay cabeceras')
    }
    if (cabecera.indexOf('ficha=') === -1) {
        throw new Error('Formato inválido')
    }
    const ficha = cabecera.replace('ficha=', '')
    return jsonwebtoken.verify(ficha, secretojwt)
}

function compararClave(pet, res, siguiente) {
    baseDatos.traerDato(pet.body.nombre, 'contrasenia')
        .then(dato => {
            if (dato[0] === undefined) {
                respuestas.error(res, 'Usuario Inexistente', 401)
            } else {
                if (dato[0].contrasenia === pet.body.contrasenia) {
                    siguiente()
                } else {
                    respuestas.error(res, 'Contraseña incorrecta', 401)
                }
            }
        }).catch(err => {
            respuestas.error(res, 'Error en el servidor, por favor reportele a Alejo Corredor', 503)
        })
}

module.exports = { caso, generarFicha, validarFicha }