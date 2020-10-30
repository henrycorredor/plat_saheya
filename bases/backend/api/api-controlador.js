const bcrypt = require('bcrypt')
const baseDatos = require('../../baseDatos/bd-controlador')

async function inscribir(pet) {
    const datos = pet.body
    datos.contrasenia = await bcrypt.hash(pet.body.contrasenia, 5)
    return baseDatos.agregarUsuario(datos)
}

function listar() {
    return baseDatos.listar()
}

module.exports = { inscribir, listar }