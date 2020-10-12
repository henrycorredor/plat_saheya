const mysqlConectar = require('./conectar')

function agregarUsuario(datos) {
    return new Promise((resuelto, rechazado) => {
        mysqlConectar.query(`INSERT INTO usuarios_prueba SET ?`, datos, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
    })
}

function listar() {
    return new Promise((resuelto, rechazado) => {
        mysqlConectar.query(`SELECT * FROM usuarios_prueba`, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
    })
}

function traerClave(nombreUsuario) {
    return new Promise((resuelto, rechazado) => {
        const query = `SELECT contrasenia FROM usuarios_prueba WHERE nombre='${nombreUsuario}'`
        mysqlConectar.query(query, (err, datos) => {
            if (err) return rechazado(err)
            resuelto(datos)
        })
    })
}


module.exports = { agregarUsuario, listar, traerClave }