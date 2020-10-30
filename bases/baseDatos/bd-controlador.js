const mysqlConectar = require('./conectar')

function agregarUsuario(datos) {
    return new Promise((resuelto, rechazado) => {
        traerDato('usuarios', 'num_identificacion', `num_identificacion = ${datos.num_identificacion}`)
            .then(usuario => {
                if (usuario[0] === undefined) {
                    const query = `INSERT INTO usuarios(nombres, apellidos, num_identificacion) VALUES ('${datos.nombres}', '${datos.apellidos}', '${datos.num_identificacion}');`
                    mysqlConectar.query(query, (err, recienRegistrado) => {
                        if (err) {
                            return rechazado(err)
                        }
                        mysqlConectar.query('INSERT INTO contrasenias SET ?', { id: recienRegistrado.insertId, contrasenia: datos.contrasenia }, (err, resultado) => {
                            if (err) {
                                return rechazado(err)
                            }
                            resuelto(resultado)
                        })
                    })
                } else {
                    rechazado('Usuario existente')
                }
            })
            .catch(err=> rechazado(err) )
    })
}

function listar() {
    return new Promise((resuelto, rechazado) => {
        mysqlConectar.query(`SELECT * FROM contrasenias`, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
    })
}

function retornarContrasenia(numIdentificacion) {
    return new Promise((resuelto, rechazado) => {
        const query = `SELECT contrasenia
        FROM contrasenias C, usuarios U
        WHERE U.num_identificacion = '${numIdentificacion}' AND U.usuario_id = C.id`
        mysqlConectar.query(query, (err, datos) => {
            if (err) return rechazado(err)
            resuelto(datos)
        })
    })
}

function traerDato(tabla, columna, condicion) {
    return new Promise((resuelto, rechazado) => {
        const query = `SELECT ${columna} FROM ${tabla} WHERE ${condicion}`
        mysqlConectar.query(query, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
    })
}

module.exports = { agregarUsuario, listar, retornarContrasenia, traerDato }