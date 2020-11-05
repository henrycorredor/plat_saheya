const decodFicha = require('../backend/utiles/utiles')
const { traerDato } = require('../baseDatos/bd-controlador')


function plano(respuesta, plantilla) {
    respuesta.sendFile(__dirname + '/' + plantilla)
}

const opciones = {
    usuarioId: 1,
    nombre: 'Henry',
    rol: '1'
}

async function pugTemplate(peticion, respuesta, plantilla) {
    const ficha = decodFicha(peticion)
    const infoUsuario = await traerDato('usuarios', 'nombres, apellidos, rol, usuario_id, capital', `usuario_id = ${ficha.id}`)
    console.log('consulta: ', infoUsuario)
    respuesta.render(__dirname + '/' + plantilla, infoUsuario[0])
}

module.exports = { plano, pugTemplate }