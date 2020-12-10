const plantillas = require('../../frontend/frontend-control')
const DB = require('../../baseDatos/bd-controlador')
const decodFicha = require('../utiles/utiles')

async function pugPlantilla(pet, res, plantilla, tituloPagina) {
    const infoUsuario = await decodFicha.usuarioInfo(pet)
    switch (plantilla) {
        case 'portada':
            portada(res, { usuario: infoUsuario, titulo: tituloPagina })
            break
        case 'prestamos':
            prestamos(res, { usuario: infoUsuario, titulo: tituloPagina })
            break
        case 'administracion':
            administracion(res, { usuario: infoUsuario, titulo: tituloPagina })
            break
        default:
            plantillas.pugTemplate(res, plantilla, { usuario: infoUsuario, titulo: tituloPagina })
            break
    }
}

async function portada(res, datos) {
    try {
        const coodeudor_por_aprobar = await DB.consultaLibre(
            `SELECT
                r.id_relacion,
                r.monto_avalado,
                u.nombres,
                u.apellidos,
                p.monto
            FROM relaciones_coodeudores r
            JOIN prestamos p ON r.id_prestamo = p.prestamo_id
            JOIN usuarios u ON p.deudor_id = u.usuario_id
            WHERE r.id_codeudor = ${datos.usuario.usuario_id} AND r.aprobado = 2 `
        )
        const cuota_este_mes = []
        plantillas.pugTemplate(res, 'portada', { ...datos, coodeudor_por_aprobar, cuota_este_mes })
    } catch (error) {
        plantillas.pugTemplate(res, 'portada', { ...datos, err: error })
    }
}

async function prestamos(res, datos) {
    try {
        const prestamosPorAprobar = await DB.traerDato('prestamos', 'monto, fecha_registro', `deudor_id = ${datos.usuario.usuario_id} AND estado = 1`)
        const prestamosPagando = await DB.traerDato('prestamos', 'monto, fecha_registro, cuotas_pagadas', `deudor_id = ${datos.usuario.usuario_id} AND estado = 2`)
        const prestamosFinalizados = await DB.traerDato('prestamos', 'monto, fecha_registro', `deudor_id = ${datos.usuario.usuario_id} AND estado = 3`)
        const prestamosRechazados = await DB.traerDato('prestamos', 'monto, fecha_registro', `deudor_id = ${datos.usuario.usuario_id} AND estado = 4`)
        const i = {
            ...datos,
            prestamos: {
                poraprobar: prestamosPorAprobar,
                aprobados: prestamosPagando,
                finalizados: prestamosFinalizados,
                rechazados: prestamosRechazados
            }
        }
        plantillas.pugTemplate(res, 'prestamos', i)
    } catch (error) {
        plantillas.pugTemplate(res, 'prestamos', { ...datos, err: error })
    }
}

async function administracion(res, datos) {
    try {
        const usuarios = await DB.traerDato('usuarios', 'usuario_id, nombres, apellidos')
        const prestamos_por_aprobar = await DB.prestamosNoAprobados()
        const movimientos_por_aprobar = []
        const i = { ...datos, usuarios: usuarios, prestamos_en_proceso: {}, prestamos_por_aprobar: prestamos_por_aprobar, movimientos: movimientos_por_aprobar }
        plantillas.pugTemplate(res, 'administracion', i)
    } catch (error) {
        plantillas.pugTemplate(res, 'prestamos', { ...datos, err: error })
    }
}

module.exports = { pugPlantilla }