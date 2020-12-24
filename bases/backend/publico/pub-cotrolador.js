const plantillas = require('../../frontend/frontend-control')
const DB = require('../../baseDatos/bd-controlador')
const decodFicha = require('../utiles/utiles')
const reglas = require('../config_reglas')
const moment = require('moment')
const e = require('express')

moment.locale('es')

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
        case 'registrar':
            registrar(res, { usuario: infoUsuario, titulo: tituloPagina })
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
        const prestamos = await DB.traerDato(
            'prestamos',
            'prestamo_id, monto, pagado, fecha_inicial, num_cuotas, cuotas_pagadas',
            `deudor_id = ${datos.usuario.usuario_id} AND estado = 2`)
        const cuota_este_mes = {}
        for (i = 0; i < prestamos.length; i++) {
            const ultima_cuota = await DB.traerDatoUnico(
                'transacciones_prestamos',
                'cuota_numero, cuotas_restantes, por_pagar',
                `prestamo_id = ${prestamos[i].prestamo_id} ORDER BY fecha_realizacion DESC`)
            let interes, abono_capital, fecha_inicial, fecha_limite, cuota_numero, estado
            if (ultima_cuota === undefined) {
                cuota_numero = 1
                interes = Math.ceil((parseInt(prestamos[i].monto) * reglas.interes) / 100)
                abono_capital = Math.ceil(parseInt(prestamos[i].monto) / parseInt(prestamos[i].num_cuotas))
                fecha_inicial = moment(prestamos[i].fecha_inicial).add(1, 'month')
                fecha_limite = moment(prestamos[i].fecha_inicial).add(2, 'month')
            } else {
                cuota_numero = parseInt(ultima_cuota.cuota_numero) + 1
                interes = Math.ceil((parseInt(ultima_cuota.por_pagar) * reglas.interes) / 100)
                abono_capital = Math.ceil(parseInt(ultima_cuota.por_pagar) / parseInt(ultima_cuota.cuotas_restantes))
                fecha_inicial = moment(prestamos[i].fecha_inicial).add(parseInt(ultima_cuota.cuota_numero) + 1, 'month')
                fecha_limite = moment(prestamos[i].fecha_inicial).add(parseInt(ultima_cuota.cuota_numero) + 2, 'month')
            }

            const dias_para_inicio = moment(fecha_inicial).diff(moment(), 'days')
            const dias_para_limite = moment(fecha_limite).diff(moment(), 'days')

            if (dias_para_inicio >= 0) {
                estado = 0 //estado inicial, es la primera cuota
            } else if (dias_para_inicio < 0 && dias_para_limite >= 0) {
                estado = 1 //no hay cuotas atrasadas
            } else {
                estado = 2 //la cuota está atrasada
            }

            cuota_este_mes[prestamos[i].prestamo_id] = {
                id: prestamos[i].prestamo_id,
                cuota_numero: cuota_numero,
                interes: interes,
                abono_capital: abono_capital,
                cuota: interes + abono_capital,
                fecha_inicial: moment(fecha_inicial).format('D [de] MMMM, YYYY'),
                fecha_limite: moment(fecha_limite).format('D [de] MMMM, YYYY'),
                estado: estado
            }
        }
        plantillas.pugTemplate(res, 'portada', { ...datos, coodeudor_por_aprobar, cuota_este_mes })
    } catch (error) {
        console.log(error)
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
        const prestamos_por_aprobar = await DB.prestamosPorAprobar()
        const coodeudores = {}
        for (let i = 0; i < prestamos_por_aprobar.length; i++) {
            const datos = await DB.consultaLibre(`SELECT
                u.nombres,
                u.apellidos,
                r.monto_avalado
            FROM 
            relaciones_coodeudores r
            JOIN usuarios u ON r.id_codeudor = u.usuario_id
            WHERE r.id_prestamo = ${prestamos_por_aprobar[i].prestamo_id}
            `)
            coodeudores[prestamos_por_aprobar[i].prestamo_id] = datos
        }
        const prestamos_esperando_coodeudores = await DB.consultaLibre(
            `SELECT
                p.prestamo_id,
                u.nombres,
                u.apellidos,
                p.monto,
                p.fecha_registro,
                p.fecha_inicial
            FROM prestamos p
            JOIN usuarios u ON p.deudor_id = u.usuario_id
            WHERE p.estado = 0`
        )
        const lista_coodeudores_en_espera = {}
        for (let i = 0; i < prestamos_esperando_coodeudores.length; i++) {
            const datos = await DB.consultaLibre(`SELECT
            u.nombres,
            u.apellidos,
            r.monto_avalado,
            r.aprobado
        FROM relaciones_coodeudores r
        JOIN usuarios u ON r.id_codeudor = u.usuario_id
        WHERE r.id_prestamo = ${prestamos_esperando_coodeudores[i].prestamo_id}`)
            lista_coodeudores_en_espera[prestamos_esperando_coodeudores[i].prestamo_id] = datos
        }
        const prestamos_en_proceso = await DB.consultaLibre(`SELECT
            u.nombres,
            u.apellidos,
            p.prestamo_id,
            p.monto,
            p.pagado,
            p.num_cuotas,
            p.cuotas_pagadas,
            p.deudor_id,
            p.fecha_inicial
        FROM prestamos p
        JOIN usuarios u ON p.deudor_id = u.usuario_id
        WHERE p.estado = 2`)
        const movimientos_por_aprobar = []
        const i = {
            ...datos,
            usuarios: usuarios,
            prestamos_en_proceso: prestamos_en_proceso,
            prestamos_por_aprobar: prestamos_por_aprobar,
            coodeudores: coodeudores,
            prestamos_esperando_coodeudores: prestamos_esperando_coodeudores,
            lista_coodeudores_en_espera: lista_coodeudores_en_espera,
            movimientos: movimientos_por_aprobar
        }
        plantillas.pugTemplate(res, 'administracion', i)
    } catch (error) {
        plantillas.pugTemplate(res, 'prestamos', { ...datos, err: error })
    }
}

async function registrar(res, datos) {
    try {
        console.log(datos)
        const deudas = await DB.traerDato('prestamos', '*', `deudor_id = ${datos.usuario.usuario_id}`)
        plantillas.pugTemplate(res, 'registrar', {...datos, prestamos: deudas})
    } catch (error) {
        plantillas.pugTemplate(res, 'registrar', { ...datos, err: error })
    }
}

module.exports = { pugPlantilla }