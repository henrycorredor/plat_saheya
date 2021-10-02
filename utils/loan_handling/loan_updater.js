const moment = require('moment')
const boom = require('@hapi/boom')
const generateCuotes = require('./cuotes_generator')
const MySqlClass = require('../../lib/mysql')

const loanUpdater = async function (relationships, loan_id, status, user_id, rol) {
    const db = new MySqlClass()
    const currentTimeStamp = moment().format("YYYY-MM-DD hh:mm:ss")
    const toReturn = { msg: '', newStatus: 0, rol: 1 }

    switch (status) {
        // DESCRIPCIÓN DE ESTADOS DE PRÉSTAMO

        // 1 - solicitado - esperando aprobación
        // (primer estado del prestamo una vez acentada la aplicacion)

        // 2 - rechazado
        // (el estado 2 se asigna a la coorelacion del usuario que rechazo y al prestamo)

        case '2-reject':
            //reject loan - admin and users
            // status 1 -> 2
            const myRelcase2 = relationships.filter(rel => (rel.rol === rol && rel.id_codeudor === user_id && rel.aprobado === 1))

            if (myRelcase2.length === 0) {
                throw boom.badRequest('wrong request')
            } else {
                await db.upsert('prestamos', { estado: 2, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
            }
            await db.upsert('relaciones_coodeudores', { aprobado: 2, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${user_id} AND rol = ${rol}`)

            toReturn.msg = `loan id ${loan_id} has been rejected`
            toReturn.newStatus = 2
            toReturn.rol = rol

            break

        // 3 - en espera de aprobacion de admin y codeudores
        // (los coodeudores aprueban primero, luego administracion)

        case '3-accept':
            // accept - cosigners
            // status 1 -> 3
            const myRelcase3 = relationships.filter(rel => rel.rol === rol && rel.aprobado === 1 && rel.id_codeudor === user_id)

            if (myRelcase3.length === 0) {
                throw boom.badRequest('no resource found')
            } else {
                const isTheLast = relationships.filter(rels => rels.aprobado === 1)
                if (isTheLast.length === 1) await db.upsert('prestamos', { estado: 4, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
            }
            await db.upsert('relaciones_coodeudores', { aprobado: 3, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${user_id} AND rol = ${rol}`)

            toReturn.msg = `loan id ${loan_id} has been apoved by user ${user_id} rol ${rol}`
            toReturn.newStatus = 3
            toReturn.rol = rol

            break

        //4 - aprobado, esperando documentos de soporte
        // (este paso se puede saltar en el sistema.
        // En futuro se puede implementar una vez se registren los documentos en el sistema)

        // 5 - aprobado, esperando desembolso
        // (Una vez recibidas toda las aprobaciones se realiza esta confirmacion)

        case '5-treasurer-approve':
            //rol 3 confirm, waiting for furhter docs and confirm balance releace
            //status 3 -> 5
            const [loanInfo] = await db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado, deudor_id, monto')

            if (loanInfo.estado === 4 && rol === 3) {
                await db.upsert('prestamos', { estado: 5, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                const cosigners = await db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id} and rol = 1`, "monto_avalado, id_codeudor")

                let cosignedAmount = 0

                if (cosigners) {
                    const updateCosigners = cosigners.map(async cosigner => {
                        await db.doQuery(`UPDATE usuarios SET en_deuda = en_deuda + ${cosigner.monto_avalado} where usuario_id = ${cosigner.id_codeudor}`)
                        cosignedAmount += Number(cosigner.monto_avalado)
                    })
                    await Promise.all(updateCosigners)
                }

                await generateCuotes(loan_id)
                
                const selfSupported = Number(loanInfo.monto) - cosignedAmount
                await db.doQuery(`UPDATE usuarios SET en_deuda = en_deuda + ${selfSupported} where usuario_id = ${loanInfo.deudor_id}`)
            } else {
                throw boom.badRequest('Wrong request')
            }

            toReturn.msg = `loan id ${loan_id} has confirmed`
            toReturn.newStatus = 5
            toReturn.rol = rol

            break

        //6 - desembolso confirmado usuario, préstamo en proceso
        // (Rol 3 y 1 lo puede realizar)

        case '6-treasurer-confirm-disbursement':
            //status 5 -> 6 (nobody has confirmed, jumps to 6 to wait treasury's confirmation)
            //status 7 -> 8 (treasury has confirmed, jumps to 8 as both sides confirmation)

            const [loanStatusCase6] = await db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado')

            if (rol !== 1) {
                throw boom.unauthorized('not autorized petition')
            }

            if (loanStatusCase6.estado === 5 || loanStatusCase6.estado === 7) {
                const status = (loanStatusCase6.estado === 5) ? 6 : 8
                await db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                const [loanData] = await db.getData('prestamos',`prestamo_id = ${loan_id}`, )
//                 if(status === 6){
//                     const transaction = await db.upsert('transacciones', {
//                         fecha_realizacion: currentTimeStamp,
//                         monto
//                     }) 



// | emisor            | int          | NO   |     | NULL              |                   |
// | destinatario      | int          | NO   |     | NULL              |                   |
// | estado    
//                 }else{

//                 }
            } else {
                throw boom.badRequest('no resource found')
            }

            toReturn.msg = `loan id ${loan_id} disbursement has been confirmed by user ${user_id}`
            toReturn.newStatus = status
            toReturn.rol = rol

            break

        //7 - desembolso confirmado tesorería, préstamo en proceso
        //(Lo realiza la contraparte de quien no lo haya hecho)
        case '7-user-confirm-disbursement':
            //status 5 -> 7 (nobody has confirmed, jumps to 7 to wait user confirmation)
            //status 6 -> (user has confirmed, jumps to 8 as both sides confirmation)
            const [loanStatusCase7] = await db.getData('prestamos', `prestamo_id = ${loan_id}`, 'estado')

            if (rol !== 3) {
                throw boom.unauthorized('not autorized petition')
            }

            if (loanStatusCase7.estado === 5 || loanStatusCase7.estado === 6) {
                const status = (loanStatusCase7.estado === 5) ? 7 : 8
                await db.upsert('prestamos', { estado: status, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
            } else {
                throw boom.badRequest('no resource found')
            }

            toReturn.msg = `loan id ${loan_id} disbursement has been confirmed by rol ${rol}`
            toReturn.newStatus = status
            toReturn.rol = rol

            break
        case '8-loan-ended':
            // 8 - desembolso confirmado ambas partes, préstamo en proceso
            // (el sistema verifica que el prestamo ha sido pagado completamete, se pasa a 9)
            break
        case '10-freeze':
            // congelar prestamo. Por definir. 

            break
        default:
            throw boom.badRequest('wrong status code')
    }

    return toReturn
}

module.exports = loanUpdater