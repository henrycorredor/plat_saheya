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

function traerDato(nombreUsuario, columna) {
    return new Promise((resuelto, rechazado) => {
        const query = `SELECT ${columna} FROM usuarios_prueba WHERE nombre='${nombreUsuario}'`
        mysqlConectar.query(query, (err, datos) => {
            if (err) return rechazado(err)
            resuelto(JSON.stringify(datos))
        })
    })
}

module.exports = { agregarUsuario, listar, traerDato }