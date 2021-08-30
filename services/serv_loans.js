const MySqlClass = require('../lib/mysql')
const moment = require('moment')


class LoanServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getAllLoans() {
        const query = `SELECT pre.*, GROUP_CONCAT(coo.id_codeudor, '-' ,coo.monto_avalado ORDER BY coo.orden) AS coodeudores
        FROM prestamos pre
        LEFT JOIN relaciones_coodeudores coo
        ON pre.prestamo_id = coo.id_prestamo
        GROUP BY pre.prestamo_id`

        const data = this.db.doQuery(query)
        return data
    }

    async applyNewLoan(data) {
        //aca deberia ir todo el proceso de verifiacion
        //si el usuario esta autorizado o no si se puede aplicar el prestamo.
        //de momento se acepta todo.
        const cosigners = (data.coodeudores) ? data.coodeudores : []

        delete data.coodeudores
        const result = await this.db.upsert('prestamos', data)

        if (cosigners.length > 0) {
            cosigners.forEach(async (coodeudor, index) => {
                await this.db.upsert('relaciones_coodeudores', {
                    id_prestamo: result.insertId,
                    id_codeudor: coodeudor.id_codeudor,
                    monto_avalado: coodeudor.monto_avalado,
                    orden: index + 1
                })
            })
        }

        return result
    }

    async getLoan(id) {
        const loan = await this.db.getData('prestamos', `prestamo_id = ${id}`)
        if (loan) {
            const cosigners = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${id}`)
            loan[0].coodeudores = cosigners
        }
        return loan
    }

    async cosignerUpdateLoan(loan_id, user_id, new_status) {
        //here will be a validation
        //operation able only if the validated user id is the same as the provided user_id

        /*
        approved:
            only mine/one left
                set loan loan to 3
            set rel status = 3
        no approved:
            set rel status = 2
            set loan status = 2 
        */
        let msg
        const currentTimeStamp = moment().format("YYYY-MM-DD hh:mm:ss")
        const relationships = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id} AND aprobado = 1 AND id_codeudor = ${user_id}`, 'COUNT(2) AS res')
        if (relationships[0].res === 0) {
            msg = { status: 0, msg: "inexistent resources" }
        } else {
            if (new_status) {
                const cosigners = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id} AND aprobado = 1`, 'COUNT(2) AS res')
                if (cosigners[0].res === 1) {
                    await this.db.upsert('prestamos', { estado: 3, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                }
                await this.db.upsert('relaciones_coodeudores', { aprobado: 3, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${user_id}`)
                msg = { status: 3, msg: "setted aproved succesfuly" }
            } else {
                await this.db.upsert('prestamos', { estado: 2, ultima_actualizacion: currentTimeStamp }, `prestamo_id = ${loan_id}`)
                await this.db.upsert('relaciones_coodeudores', { aprobado: 2, fecha_aprobacion: currentTimeStamp }, `id_prestamo = ${loan_id} AND id_codeudor = ${user_id}`)
                msg = { status: 2, msg: "setted rejected succesfuly" }
            }
        }
        return msg
    }
}

module.exports = LoanServices