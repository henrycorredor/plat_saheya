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
            .catch(err => rechazado(err))
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
        let query = `SELECT ${columna} FROM ${tabla}`
        query += (!condicion) ? '' : ` WHERE ${condicion}`
        mysqlConectar.query(query, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
    })
}

function traerDatoUnico(tabla, columna, condicion) {
    return new Promise(async (res, rec) => {
        try {
            const datos = await traerDato(tabla, columna, condicion)
            res(datos[0])
        } catch (error) {
            rec(error)
        }
    })
}

function traerUltimoRegistro(tabla, columna) {
    return new Promise((resuelto, rechazado) => {
        const query = `select * from ${tabla} order by ${columna} desc limit 1;`
        mysqlConectar.query(query, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado[0])
        })
    })
}

function regAbonoCapital(datos) {
    return new Promise((res, rec) => {
        const query = `INSERT INTO transacciones (usuario_id, fecha_realizacion, monto, motivo, comentario) VALUES ('${datos.usuario_id}', '${datos.fecha_realizacion}', '${datos.monto}', '${datos.motivo}', '${datos.comentario}');`
        mysqlConectar.query(query, (error, resultado) => {
            if (error) return rec(error)
            traerUltimoRegistro('capital', 'id_movimiento')
                .then(capital => {
                    const totalActual = capital.total_actual + datos.monto
                    return insertar('capital', { monto: `${datos.monto}`, transaccion_id: resultado.insertId, total_anterior: capital.total_actual, total_actual: totalActual })
                        .then(exito => res(true))
                        .catch(fallo => rec(fallo))
                })
                .catch(error => {
                    console.log(error)
                    rec(error)
                })
        })
    })
}

function insertar(tabla, valores, datos) {
    return new Promise((resuelto, rechazado) => {
        const query = `INSERT INTO ${tabla} (${valores}) VALUES (${datos});`
        mysqlConectar.query(query, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
    })
}

function actualizar(tabla, dato, condicion) {
    return new Promise((resuelto, rechazado) => {
        const query = `UPDATE ${tabla} SET ${dato} WHERE ${condicion};`
        mysqlConectar.query(query, (err, res) => {
            if (err) return rechazado(err)
            resuelto(res)
        })
    })
}

function prestamosPorAprobar() {
    return new Promise((res, rec) => {
        const query = `SELECT p.prestamo_id, u.nombres, u.apellidos, p.monto, p.fecha_registro, p.fecha_inicial FROM prestamos p JOIN usuarios u ON p.deudor_id = u.usuario_id WHERE p.estado = 1;`
        mysqlConectar.query(query, (error, datos) => {
            if (error) return rec(error)
            res(datos)
        })
    })
}

function consultaLibre(query) {
    return new Promise((res, rec) => {
        mysqlConectar.query(query, (error, datos) => {
            if (error) return rec(error)
            res(datos)
        })
    })
}

module.exports = { consultaLibre, agregarUsuario, listar, retornarContrasenia, traerDato, traerDatoUnico, regAbonoCapital, insertar, actualizar, prestamosPorAprobar }