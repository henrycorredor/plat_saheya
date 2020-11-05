const decodFicha = require('../backend/utiles/utiles')
const { traerDato } = require('../baseDatos/bd-controlador')


function plano(respuesta, plantilla) {
    respuesta.sendFile(__dirname + '/' + plantilla)
}

async function pugTemplate(peticion, respuesta, plantilla) {
    const infoUsuario = await decodFicha.usuarioInfo(peticion)
    respuesta.render(__dirname + '/' + plantilla, infoUsuario[0])
}

module.exports = { plano, pugTemplate }