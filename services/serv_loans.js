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
        ON pre.prestamo_id = coo.id_prestamo AND coo.id_codeudor != 0
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

            //if loan doesn't need further aproval, it directly goes to state 4
            if (cosigners.length === 0) { data.estado = 4 } //default state in DB = 1

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
            loan[0].coodeudores = cosigners.filter(cos => cos.id_codeudor !== 0)
        }
        return loan
    }

    async updateLoan(rol, loan_id, status) {

        const toReturn = { msg: '', newStatus: 0, rol: 1 }
        const currentTimeStamp = moment().format("YYYY-MM-DD hh:mm:ss")

        rol = Number(rol)
        status = Number(status)
        const userId = (rol === 1) ? Number(process.env.USER_ID) : 0

        const relationships = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id}`)

        if (relationships) {
            switch (status) {
                // DESCRIPCIÓN DE ESTADOS DE PRÉSTAMO

                // 1 - solicitado - esperando aprobación
                // (primer estado del prestamo una vez acentada la aplicacion)

                // 2 - rechazado
                // (el estado 2 se asigna a la coorelacion del usuario que rechazo y al prestamo)

                case 2:
                    //reject loan - admin and users
                    // status 1 -> 2
                    const myRelcase2 = relationships.filter(rel => (rel.rol === rol && rel.id_codeudor === userId && rel.aprobado === 1))

                    if (myRelcase2.length === 0) {
                        throw boom.badRequest('wrong request')
                    } else {
                        await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                    }
                    await this.db.upsert('relaciones_coodeudores', { aprobado: status, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${userId} AND rol = ${rol}`)

                    toReturn.msg = `loan id ${loan_id} has been rejected`
                    toReturn.newStatus = status
                    toReturn.rol = rol

                    break

                // 3 - en espera de aprobacion de admin y codeudores
                // (los coodeudores aprueban primero, luego administracion)

                case 3:
                    // accept - cosigners
                    // status 1 -> 3
                    const myRelcase3 = relationships.filter(rel => rel.rol === rol && rel.aprobado === 1 && rel.id_codeudor === userId)

                    if (myRelcase3.length === 0) {
                        throw boom.badRequest('no resource found')
                    } else {
                        const isTheLast = relationships.filter(rels => rels.aprobado === 1)
                        if (isTheLast.length === 1) {
                            await this.db.upsert('prestamos', { estado: 4, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                        }
                    }
                    await this.db.upsert('relaciones_coodeudores', { aprobado: status, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${userId} AND rol = ${rol}`)

                    toReturn.msg = `loan id ${loan_id} has been apoved by user ${userId} rol ${rol}`
                    toReturn.newStatus = status
                    toReturn.rol = rol

                    break

                //4 - aprobado, esperando documentos de soporte
                // (este paso se puede saltar en el sistema.
                // En futuro se puede implementar una vez se registren los documentos en el sistema)

                // 5 - aprobado, esperando desembolso
                // (Una vez recibidas toda las aprobaciones se realiza esta confirmacion)

                case 5:
                    //rol 3 confirm, waiting for furhter docs and confirm balance releace
                    //status 3 -> 5
                    const [loanInfo] = await this.db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado, deudor_id, monto')

                    if (loanInfo.estado === 4 && rol === 3) {
                        await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                        const cosigners = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id} and rol = 1`, "monto_avalado, id_codeudor")

                        let cosignedAmount = 0

                        if (cosigners) {
                            for (let i = 0; i < cosigners.length; i++) {
                                await this.db.doQuery(`UPDATE usuarios SET en_deuda = en_deuda + ${cosigners[i].monto_avalado} where usuario_id = ${cosigners[i].id_codeudor}`)
                                cosignedAmount += Number(cosigners[i].monto_avalado)
                            }
                        }

                        const selfSupported = Number(loanInfo.monto) - cosignedAmount
                        await this.db.doQuery(`UPDATE usuarios SET en_deuda = en_deuda + ${selfSupported} where usuario_id = ${loanInfo.deudor_id}`)
                    } else {
                        throw boom.badRequest('Wrong request')
                    }

                    toReturn.msg = `loan id ${loan_id} has confirmed`
                    toReturn.newStatus = status
                    toReturn.rol = rol

                    break

                //6 - desembolso confirmado usuario, préstamo en proceso
                // (Rol 3 y 1 lo puede realizar)

                case 6:
                    //status 5 -> 6 (nobody has confirmed, jumps to 6 to wait treasury's confirmation)
                    //status 7 -> 8 (treasury has confirmed, jumps to 8 as both sides confirmation)

                    const [loanStatusCase6] = await this.db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado')

                    if (rol !== 1) {
                        throw boom.unauthorized('not autorized petition')
                    }

                    if (loanStatusCase6.estado === 5 || loanStatusCase6.estado === 7) {
                        const status = (loanStatusCase6.estado === 5) ? 6 : 8
                        await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                    } else {
                        throw boom.badRequest('no resource found')
                    }

                    toReturn.msg = `loan id ${loan_id} disbursement has been confirmed by user ${userId}`
                    toReturn.newStatus = status
                    toReturn.rol = rol

                    break

                //7 - desembolso confirmado tesorería, préstamo en proceso
                //(Lo realiza la contraparte de quien no lo haya hecho)
                case 7:
                    //status 5 -> 7 (nobody has confirmed, jumps to 7 to wait user confirmation)
                    //status 6 -> (user has confirmed, jumps to 8 as both sides confirmation)
                    const [loanStatusCase7] = await this.db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado')

                    if (rol !== 3) {
                        throw boom.unauthorized('not autorized petition')
                    }

                    if (loanStatusCase7.estado === 5 || loanStatusCase7.estado === 6) {
                        const status = (loanStatusCase7.estado === 5) ? 7 : 8
                        await this.db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                    } else {
                        throw boom.badRequest('no resource found')
                    }

                    toReturn.msg = `loan id ${loan_id} disbursement has been confirmed by rol ${rol}`
                    toReturn.newStatus = status
                    toReturn.rol = rol

                    break
                // 8 - desembolso confirmado ambas partes, préstamo en proceso
                // (el sistema verifica que el prestamo ha sido pagado completamete, se pasa a 9)
                case 10:
                    // congelar prestamo. Por definir. 

                    break
                default:
                    throw boom.badRequest('wrong status code')
                    break
            }
        } else {
            throw boom.notFound('inexistent resource')
        }

        return toReturn
    }
}

module.exports = LoanServices