const { query } = require('express')
const mysqlConectar = require('./conectar')

function agregarUsuario(datos) {
    return new Promise((resuelto, rechazado) => {
        const query = `INSERT INTO `
        mysqlConectar.query(`INSERT INTO contasenias SET ?`, datos, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
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

function retornarContrasenia(numIdentificacion){
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

function traerDato(tabla,columna,condicion){
    return new Promise((resuelto, rechazado) => {
        const query = `SELECT ${columna} FROM ${tabla} WHERE ${condicion}`
        console.log(query)
        mysqlConectar.query(query, (err, resultado) => {
            if (err) return rechazado(err)
            resuelto(resultado)
        })
    })
}

module.exports = { agregarUsuario, listar, retornarContrasenia, traerDato }