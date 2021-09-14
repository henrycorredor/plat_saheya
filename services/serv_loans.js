const MySqlClass = require('../lib/mysql')
const [
    extraExtraordinario,
    ordinarioCuotaFija,
    ordinarioSinCuotaFija,
    extraordinario
] = require('../utils/schemas/schemas_loan_conditions')
const moment = require('moment')
const boom = require('@hapi/boom')

class LoanServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getAllLoans() {
        const query = `SELECT pre.*, GROUP_CONCAT(coo.id_codeudor, '-', coo.monto_avalado, '-', coo.aprobado ORDER BY coo.orden) AS coodeudores
        FROM prestamos pre
        LEFT JOIN relaciones_coodeudores coo
        ON pre.prestamo_id = coo.id_prestamo
        GROUP BY pre.prestamo_id`

        const data = this.db.doQuery(query)
        return data
    }

    async applyNewLoan(data) {
        let result
        switch (Number(data.tipo)) {
            case 1:
                result = await ordinarioCuotaFija.validator(data)
                break
            case 2:
                result = await ordinarioSinCuotaFija.validator(data)
                break
            case 3:
                result = await extraordinario.validator(data)
                break
            case 4:
                result = await extraExtraordinario.validator(data)
                break
            default:
                throw boom.badRequest('wrong type code')
        }

        const loanData = result
        if (result.approval) {

            const cosigners = (data.coodeudores) ? data.coodeudores : []
            const admin_credentials = (loanData.features.adminPermission) ? loanData.features.adminPermission : []

            delete data.coodeudores

            if (cosigners.length === 0) { data.estado = 3 }
            const result = await this.db.upsert('prestamos', data)

            for (i = 0; i < cosigners.length; i++) {
                await this.db.upsert('relaciones_coodeudores', {
                    id_prestamo: result.insertId,
                    id_codeudor: cosigners[i].id_codeudor,
                    monto_avalado: cosigners[i].monto_avalado,
                    orden: i + 1
                })
            }

            for (i = 0; i < admin_credentials.length; i++) {
                await this.db.upsert('relaciones_coodeudores', {
                    id_prestamo: result.insertId,
                    id_codeudor: 0,
                    monto_avalado: 0,
                    orden: 0,
                    rol: admin_credentials[i]
                })
            }
        }

        return result
    }

    async getLoan(id) {
        const loan = await this.db.getData('prestamos', `prestamo_id = ${id}`)
        if (loan) {
            const cosigners = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${id}`, `id_codeudor, monto_avalado, aprobado`)
            loan[0].coodeudores = cosigners
        }
        return loan
    }

    async updateLoan(rol, loan_id, status) {

        let msg
        const currentTimeStamp = moment().format("YYYY-MM-DD hh:mm:ss")

        /*
        1 - solicitado - esperando aprobación
            (primer estado del prestamo una vez acentada la aplicacion)

        2 - rechazado
            (el estado 2 se asigna a la coorelacion del usuario que rechazo y al prestamo)

        3 - en espera de aprobacion de admin y codeudores
            (los coodeudores aprueban primero, luego administracion)

        4 - aprobado, esperando documentos de soporte
            (este paso se puede saltar en el sistema. En futuro se puede implementar una vez se registren los documentos en el sistema)

        5 - aprobado, esperando desembolso
            (Una vez recibidas toda las aprobaciones se realiza esta confirmacion)

        6 - desembolso confirmado una parte, préstamo en proceso
            (Rol 3 y 1 lo puede realizar)

        7 - desembolso confirmado dos partes, préstamo en proceso
            (Lo realiza la contraparte de quien no lo haya hecho)

        8 - prestamo pagado
            (el sistema verifica si la ultima cuota se pago a conformidad y cierra el prestamo)

        9 - congelado
            (a definir)
        */
        rol = Number(rol)
        status = Number(status)
        const userId = (rol === 1) ? process.env.USER_ID : 0

        const relationships = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id}`)

        if (relationships) {
            switch (status) {
                case 2:
                    //reject loan - admin and users
                    const myRel = relationships.filter(rel => rel.rol === rol && rel.id_codeudor === userId && rel.aprobado === 1)

                    if (myRel.length === 0) {
                        throw boom.badRequest('no resource found')
                    } else {
                        await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                        msg = { msg: `Loan ${loan_id} have been rejected` }
                    }

                    await this.db.upsert('relaciones_coodeudores', { aprobado: status, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${userId} AND rol = ${rol}`)
                    break
                case 3:
                    // accept - cosigners
                    const myRel = relationships.filter(rel => rel.rol === rol && rel.aprobado === 1 && rel.id_codeudor === userId)

                    if (myRel.length === 0) {
                        throw boom.badRequest('no resource found')
                    } else {
                        const isTheLast = relationships.filter(rels => rels.aprobado === 1)
                        if (isTheLast.length === 1) {
                            await this.db.upsert('prestamos', { estado: 4, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                        }
                    }
                    await this.db.upsert('relaciones_coodeudores', { aprobado: status, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${userId} AND rol = ${rol}`)

                    break
                case 5:
                    //rol 3 confirm, waiting for furhter docs and confirm balance releace
                    const [loanStatus] = this.db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado')

                    if (loanStatus.estado === 4 && rol === 3) {
                        await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `restamo_id = ${loan_id}`)
                        await this.db.upsert('relaciones_coodeudores', { aprobado: status, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND rol = 3 AND (rol = 1 AND id_codeudor = ${process.env.USER_ID})`)
                    } else {
                        throw boom.badRequest('no resource found')
                    }

                    break
                case 6:


                // falta agregar un egistro en la tabla de relaciones del mismo usuario
                // para poder registrar los recibidos de parte de tesoreria y del usuario por separado
                // ademas para calcular mas eficazmente los valores. Seguimos manana.

                    const [loanStatus] = this.db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado')

                    if (loanStatus.estado === 5) {
                        const getRels = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id} and (rol = 3 or (rol=1 and id_codeudor = ${process.env.USER_ID}))`)
                        const getUnaproved = getRels.filter(rel => rel.estado === 5 && getUnaproved.rol === rol)
                        if (getUnaproved.length === 1) {
                            await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `restamo_id = ${loan_id}`)
                            await this.db.upsert('relaciones_coodeudores', { aprobado: status, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${userId} AND rol = ${rol}`)
                        }else{
                            throw boom.badRequest('no resource found')
                        }
                    } else {
                        throw boom.badRequest('no resource found')
                    }
                    break
                case 7:
                    break
                case 8:
                    break
                default:
                    throw boom.badRequest('wrong status code')
                    break

            }
        } else {
            throw boom.notFound('inexistent resource')
        }
        /*
        switch (action) {
            case 'cosigner_approval':
                //common user
                const relationships = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id} AND aprobado = 1`,)
                if (!relationships) {
                    msg = { status: 0, msg: "inexistent resources" }
                } else {
                    const my_rel = relationships.filter(rel => rel.id_codeudor === user_id && rel.aprobado === 1)
                    if (my_rel.length === 0) {
                        msg = { status: 0, msg: "inexistent resources" }
                    } else {
                        const newStatus = (new_status) ? 3 : 2
                        if (relationships.length === 1) {
                            await this.db.upsert('prestamos', { estado: newStatus, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                        }
                        await this.db.upsert('relaciones_coodeudores', { aprobado: newStatus, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${user_id}`)
                        msg = (new_status) ? { status: 3, msg: "setted aproved succesfuly" } : { status: 2, msg: "setted rejected succesfuly" }
                    }
                }
                break;

            case 'treasury_approval':
                const status = (new_status) ? 4 : 2
                const treAprovResult = await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id} AND estado = 3`)
                msg = (treAprovResult.affectedRows === 0) ? { status: 0, msg: "inexistent resources" } : { status: 4, msg: "setted aproved succesfuly" }
                break;

            case 'conf_one_side_disbursement':
                const OneSideConfRes = await this.db.upsert('prestamos', { estado: 5, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id} AND estado = 4`)
                msg = (OneSideConfRes.affectedRows === 0) ? { status: 0, msg: "inexistent resources" } : { status: 5, msg: "one side disbursement succesfuly confirmed" }
                break;

            case 'conf_double_side_disbursement':
                const doubleSideConf = await this.db.upsert('prestamos', { estado: 6, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id} AND estado = 5`)
                msg = (doubleSideConf.affectedRows === 0) ? { status: 0, msg: "inexistent resources" } : { status: 6, msg: "one side disbursement succesfuly confirmed" }
                break;

            default:
                msg = { status: 400, msg: "inexistent resources" }
        }
        */
        return msg
    }
}

module.exports = LoanServices