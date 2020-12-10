const reglas = require('../backend/config_reglas')
function plano(respuesta, plantilla) {
    respuesta.sendFile(__dirname + '/' + plantilla)
}

async function pugTemplate(respuesta, plantilla, datos) {
    const cargarDatos = { ...datos, reglas: reglas }
    respuesta.render(__dirname + '/' + plantilla, cargarDatos)
}

module.exports = { plano, pugTemplate }