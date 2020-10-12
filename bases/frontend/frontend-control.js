module.exports = function (respuesta, plantilla) {
    respuesta.sendFile(__dirname + '/' + plantilla)
}