const bcrypt = require('bcrypt')
const baseDatos = require('../../baseDatos/bd-controlador')

async function inscribir(pet) {
    datos = {
        nombres: pet.body.nombres,
        apellidos: pet.body.nombres,
        num_identificacion: pet.body.num_identificacion,
        contrasenia: await bcrypt.hash(pet.body.contrasenia, 5)
    }
    return baseDatos.agregarUsuario(datos)
}

function listar() {
    return baseDatos.listar()
}

module.exports = { inscribir, listar }