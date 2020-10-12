const baseDatos = require('../../baseDatos/bd-controlador')

function inscribir(pet) {
    datos = {
        nombre: pet.body.nombre,
        contrasenia: pet.body.contrasenia
    }
    return baseDatos.agregarUsuario(datos)
}

function listar(){
    return baseDatos.listar()
}

module.exports = { inscribir , listar }