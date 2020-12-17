const bcrypt = require('bcrypt')
const baseDatos = require('../../baseDatos/bd-controlador')
const { usuarioInfo } = require('../utiles/utiles')
const reglas = require('../config_reglas')
const e = require('express')

async function inscribir(pet) {
    const datos = pet.body
    datos.contrasenia = await bcrypt.hash(pet.body.contrasenia, 5)
    return baseDatos.agregarUsuario(datos)
}

function listar() {
    return baseDatos.listar()
}

async function registrarMovimiento(pet) {
    const datosUsuario = await usuarioInfo(pet)
    const insertarDatos = { usuario_id: `${datosUsuario.usuario_id}`, ...pet.body }
    return new Promise((res, rec) => {
        if (insertarDatos.motivo === '1') {
            baseDatos.regAbonoCapital(insertarDatos)
                .then(respuesta => res(respuesta))
                .catch(err => { return rec(err) })
        }/* else {
            baseDatos.regAbonoPrestamo(insertarDatos)
                .then(res => { return res })
                .catch(err => { return err })
        }*/})
}

async function aplicarPrestamo(pet) {
    const datosUsuario = await usuarioInfo(pet)
    return new Promise(async (res, rec) => {
        let permitido = true
        let comparador = []
        pet.body.coodeudores.forEach((coodeudor, indice) => {
            comparador.push(coodeudor)
            comparador.forEach((comparado, subindice) => {
                if (indice !== subindice) {
                    if (coodeudor.cedula === comparado.cedula) {
                        rec({ registrado: false, mensaje: 'No puede repetir coodeudores. Por favor verifique e inténtelo de nuevo.', error: 400 })
                        permitido = false
                    }
                }
            })
        })
        if (permitido) {
            const valores = "monto, fecha_inicial, num_cuotas, deudor_id"
            const datos = `'${pet.body.monto}', '${pet.body.fecha_inicial}', '${pet.body.cuotas}', '${datosUsuario.usuario_id}'`
            try {
                const resultado = await baseDatos.insertar('prestamos', valores, datos)
                if (pet.body.coodeudores.length > 0) {
                    await baseDatos.actualizar('prestamos', `estado = 0`, "`prestamo_id` = " + resultado.insertId)
                    const q_col_relaciones = "id_prestamo, id_codeudor, monto_avalado, orden"
                    let monto_avalado = 0
                    for (i = 0; i <= pet.body.coodeudores.length; i++) {
                        let usuario_id = ''
                        let en_deuda = ''
                        if (i === pet.body.coodeudores.length) {
                            usuario_id = datosUsuario.usuario_id
                            const datos_usuario = await baseDatos.traerDatoUnico('usuarios', 'en_deuda', `usuario_id = ${usuario_id}`)
                            en_deuda = parseInt(datos_usuario.en_deuda) + (parseInt(pet.body.monto) - monto_avalado)
                            console.log(en_deuda + ' = ' + datos_usuario.en_deuda + ' + (' + pet.body.monto + ' - ' + monto_avalado + ')')
                        } else {
                            monto_avalado += parseInt(pet.body.coodeudores[i].monto)
                            const cood_en_deuda = await baseDatos.traerDatoUnico('usuarios', 'usuario_id, en_deuda', `num_identificacion = ${pet.body.coodeudores[i].cedula}`)
                            const q_val_relaciones = `${resultado.insertId},${cood_en_deuda.usuario_id},${pet.body.coodeudores[i].monto},${i + 1}`
                            usuario_id = cood_en_deuda.usuario_id
                            en_deuda = parseInt(cood_en_deuda.en_deuda) + parseInt(pet.body.coodeudores[i].monto)
                            await baseDatos.insertar('relaciones_coodeudores', q_col_relaciones, q_val_relaciones)
                        }
                        await baseDatos.actualizar('usuarios', `en_deuda = ${en_deuda}`, "`usuario_id` = " + usuario_id)
                    }
                } else {
                    await baseDatos.actualizar('usuarios', `en_deuda = ${parseInt(datosUsuario.en_deuda) + parseInt(pet.body.monto)}`, "`usuario_id` = " + datosUsuario.usuario_id)
                }
                res({ registrado: true, mensaje: 'Su prestamo ha sido solicitado.' })
            } catch (err) {
                rec({ registrado: false, mensaje: 'Ha habido un error. Por favor reportar a Alejo. ' + err.message, error: 0 })
            }
        }
    })
}

function ver_coodeudor(pet) {
    return new Promise((res, rec) => {
        baseDatos.traerDatoUnico('usuarios', 'nombres, apellidos, capital, en_deuda', `num_identificacion = ${pet.query.num_identificacion}`)
            .then(async usuario_info => {
                if (!usuario_info) {
                    res({
                        existe: false,
                        nombre: '',
                        capital_libre: '',
                        mensaje: 'Usuario inexistente.'
                    })
                } else {
                    const datosUsuario = await usuarioInfo(pet)
                    const cedula_usuario = await baseDatos.traerDato('usuarios', 'num_identificacion', `usuario_id=${datosUsuario.usuario_id}`)
                    if (parseInt(cedula_usuario[0].num_identificacion) === parseInt(pet.query.num_identificacion)) {
                        res({
                            existe: false,
                            nombre: '',
                            capital_libre: ``,
                            mensaje: 'Ha ingresado su propio número de cédula, por favor verifique e intentelo nuevamente.'
                        })
                    } else {
                        res({
                            existe: true,
                            nombre: `${usuario_info.nombres} ${usuario_info.apellidos}`,
                            capital_libre: `${(usuario_info.capital * (reglas.tope_capital_prestamo / 100)) - usuario_info.en_deuda}`,
                            mensaje: `Permitido.`
                        })
                    }
                }
            })
            .catch(error => rec(error))
    })
}

function aprov_prestamo(pet) {
    return new Promise(async (resuelto, rechazado) => {
        try {
            let codigo_aprovado
            let mensaje
            if (pet.body.accion === 'aceptar') {
                codigo_aprovado = 2
                mensaje = `Préstamo número ${pet.body.prestamo_id} aprobado.`
            } else {
                const datos_usuario = await usuarioInfo(pet)
                const prestamo_monto = await baseDatos.traerDatoUnico('prestamos', 'monto', "`prestamo_id` = " + pet.body.prestamo_id)
                const en_deuda_actual = parseInt(datos_usuario.en_deuda) - parseInt(prestamo_monto.monto)
                await baseDatos.actualizar('usuarios', `en_deuda = ${en_deuda_actual}`, "`usuario_id` = " + datos_usuario.usuario_id)
                codigo_aprovado = 4
                mensaje = `Préstamo número ${pet.body.prestamo_id} rechazado.`
            }
            await baseDatos.actualizar('prestamos', `estado = ${codigo_aprovado}`, "`prestamo_id` = " + pet.body.prestamo_id)
            resuelto({ res: true, mensaje: mensaje })
        } catch (error) {
            rechazado({ res: false, mensaje: 'Ha ocurrido un error en el sistema, por favor reporte a Alejo: ' + error.message })
            console.log(error)
        }

    })
}

function autorizar_coodeudor(pet) {
    return new Promise(async (resuelto, rechazado) => {
        try {
            if (pet.body.aprobado) {
                await baseDatos.actualizar('relaciones_coodeudores', `aprobado = 1, fecha_aprobacion = CURRENT_TIME()`, "`id_relacion` = " + pet.body.relacion_id)
                const companeros = await baseDatos.consultaLibre(`SELECT
                    c.aprobado,
                    c.id_prestamo
                FROM relaciones_coodeudores o
                JOIN relaciones_coodeudores c ON c.id_prestamo = o.id_prestamo
                WHERE o.id_relacion = ${pet.body.relacion_id}`)
                let todos_aprobados = true
                companeros.forEach(companero => {
                    if (2 === parseInt(companero.aprobado))
                        todos_aprobados = false
                })
                if (todos_aprobados)
                    await baseDatos.actualizar('prestamos', 'estado = 1', "`prestamo_id` = " + companeros[0].id_prestamo)
                resuelto({ mensaje: '¡Gracias por su apoyo!' })
            } else {
                const datos_deuda = await baseDatos.consultaLibre(`
                SELECT
                    p.monto,
                    p.deudor_id,
                    r.id_prestamo
                FROM relaciones_coodeudores r
                JOIN prestamos p ON r.id_prestamo = p.prestamo_id
                WHERE r.id_relacion = ${pet.body.relacion_id}`)
                const lista_coodeudores = await baseDatos.traerDato('relaciones_coodeudores', 'monto_avalado, id_codeudor', `id_prestamo = ${datos_deuda[0].id_prestamo}`)
                let acumulado = 0
                for (let i = 0; i <= lista_coodeudores.length; i++) {
                    let usario_id = ""
                    let a_restar = ""
                    if (lista_coodeudores.length == i) {
                        usario_id = datos_deuda[0].deudor_id
                        a_restar = parseInt(datos_deuda[0].monto) - acumulado
                        console.log(a_restar)
                    } else {
                        usario_id = lista_coodeudores[i].id_codeudor
                        acumulado += parseInt(lista_coodeudores[i].monto_avalado)
                        a_restar = lista_coodeudores[i].monto_avalado
                    }
                    const datos_usuario = await baseDatos.traerDatoUnico('usuarios', 'en_deuda', `usuario_id = ${usario_id}`)
                    const nuevo_saldo_en_deuda = parseInt(datos_usuario.en_deuda) - a_restar
                    await baseDatos.actualizar('usuarios', `en_deuda = ${nuevo_saldo_en_deuda}`, "usuario_id = " + usario_id)
                }
                await baseDatos.actualizar('relaciones_coodeudores', `aprobado = 0`, "`id_prestamo` = " + datos_deuda[0].id_prestamo)
                await baseDatos.actualizar('prestamos', 'estado = 4', "`prestamo_id` = " + datos_deuda[0].id_prestamo)
                resuelto({ mensaje: 'Ha rechazado la solicitud de aval.' })
            }
        } catch (error) {
            rechazado({ mensaje: error })
        }
    })
}

module.exports = { inscribir, listar, registrarMovimiento, aplicarPrestamo, ver_coodeudor, aprov_prestamo, autorizar_coodeudor }