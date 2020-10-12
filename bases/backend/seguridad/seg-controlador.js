const baseDatos = require('../../baseDatos/bd-controlador')
const config = require('../config_serv')
const respuestas = require('../respuestas')
const jsonwebtoken = require('jsonwebtoken')

const secretojwt = config.jwt_secreto


function caso(caso) {
    function mediador(pet, res, siguiente) {
        switch (caso) {
            case 'identificarse':
                compClave(pet, res, siguiente)
                break
            case 'validarficha':
                siguiente()
                break
            default:
                siguiente()
                break
        }
    }
    return mediador
}

function generarFicha(){
    return jsonwebtoken.sign({ info: 'esto va en el payload' }, secretojwt)
}

function compClave(pet, res, siguiente) {
    baseDatos.traerClave(pet.body.nombre)
        .then(dato => {
            if (dato[0] === undefined) {
                console.log('usuario inexistente')
                respuestas.error(pet,res,'Usuario Inexistente',401)
            } else {
                if (dato[0].contrasenia === pet.body.contrasenia) {
                    console.log('pasa funcion')
                    siguiente()
                } else {
                    console.log('contraseña incorrecta - controlador')
                    respuestas.error(pet,res,'Contraseñia incorrecta',401)
                }
            }
        }).catch(err => {
            respuestas.error(pet,res,'Error en el servidor, por favor reportele a Alejo Corredor',503)
        })
}

module.exports = {caso , generarFicha}