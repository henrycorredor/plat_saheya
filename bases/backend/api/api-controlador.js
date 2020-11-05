const bcrypt = require('bcrypt')
const baseDatos = require('../../baseDatos/bd-controlador')
const { usuarioInfo } = require('../utiles/utiles')

async function inscribir(pet) {
    const datos = pet.body
    datos.contrasenia = await bcrypt.hash(pet.body.contrasenia, 5)
    return baseDatos.agregarUsuario(datos)
}

function listar() {
    return baseDatos.listar()
}

async function registrarMovimiento(pet) {
    const datosUsuario = await usuarioInfo(pet)
    const insertarDatos = { usuario_id: `${datosUsuario.usuario_id}`, ...pet.body }
    baseDatos.registrarMovimiento(insertarDatos)
        .then(res => { return res })
        .catch(err => { return err })
}




module.exports = { inscribir, listar, registrarMovimiento }