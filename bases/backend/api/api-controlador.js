const bcrypt = require('bcrypt')
const baseDatos = require('../../baseDatos/bd-controlador')
const { usuarioInfo } = require('../utiles/utiles')
const reglas = require('../config_reglas')

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
        const valores = "monto, fecha_inicial, num_cuotas, deudor_id"
        const datos = `'${pet.body.monto}', '${pet.body.fecha_inicial}', '${pet.body.cuotas}', '${datosUsuario.usuario_id}'`
        try {
            const resultado = await baseDatos.insertar('prestamos', valores, datos)
            if (pet.body.coodeudores.length > 0) {
                const q_col_relaciones = "id_prestamo, id_codeudor, monto_avalado, orden"
                let monto_avalado = 0
                pet.body.coodeudores.forEach(async (coodeudor, indice) => {
                    monto_avalado += parseInt(coodeudor.monto)
                    console.log('monto avalado: ', monto_avalado)
                    const cood_en_deuda = await baseDatos.traerDatoUnico('usuarios', 'usuario_id, en_deuda', `num_identificacion = ${coodeudor.cedula}`)
                    const q_val_relaciones = `${resultado.insertId},${cood_en_deuda.usuario_id},${coodeudor.monto},${indice + 1}`
                    await baseDatos.insertar('relaciones_coodeudores', q_col_relaciones, q_val_relaciones)
                    await baseDatos.actualizar('usuarios', `en_deuda = ${parseInt(cood_en_deuda.en_deuda) + parseInt(coodeudor.monto)}`, "`usuario_id` = " + cood_en_deuda.usuario_id)
                })
                await baseDatos.actualizar('usuarios', `en_deuda = ${parseInt(pet.body.monto) - monto_avalado}`, "`usuario_id` = " + datosUsuario.usuario_id)
            } else {
                await baseDatos.actualizar('usuarios', `en_deuda = ${parseInt(datosUsuario.en_deuda) + parseInt(pet.body.monto)}`, "`usuario_id` = " + datosUsuario.usuario_id)
            }
            res(true)
        } catch (err) {
            rec(false)
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

module.exports = { inscribir, listar, registrarMovimiento, aplicarPrestamo, ver_coodeudor, aprov_prestamo }