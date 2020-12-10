const jsonwebtoken = require("jsonwebtoken")
const { jwt_secreto } = require('../config_serv')
const { traerDato } = require('../../baseDatos/bd-controlador')

function decodificarFicha(cabecera) {
    const ficha = cabecera.headers.cookie.replace("ficha=", "")
    return jsonwebtoken.decode(ficha, jwt_secreto)
}

async function usuarioInfo(cabecera) {
    const ficha = decodificarFicha(cabecera)
    const datos = await traerDato('usuarios', 'nombres, apellidos, rol, usuario_id, capital, en_deuda', `usuario_id = ${ficha.id}`)
    return datos[0]
}

module.exports = { decodificarFicha, usuarioInfo }