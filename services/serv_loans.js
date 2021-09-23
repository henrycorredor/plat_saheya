const boom = require('@hapi/boom')
const MySqlClass = require('../lib/mysql')

const loanUpdater = require('../utils/loan_handling/loan_updater')
const [
    extraExtraordinario,
    ordinarioCuotaFija,
    ordinarioSinCuotaFija,
    extraordinario
] = require('../utils/loan_handling/loan_schemas')

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

        //statuses list:
        /*
        2-reject
        3-accept
        5-treasurer-approve
        6-treasurer-confirm-disbursement
        7-user-confirm-disbursement
        8-loan-ended
        10-freeze
        */

        rol = Number(rol)
        const userId = (rol === 1) ? Number(process.env.USER_ID) : 0
        const relationships = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id}`)

        if (relationships) {
            return loanUpdater(relationships, loan_id, status, userId, rol)
        } else {
            throw boom.notFound('inexistent resource')
        }
    }
}

module.exports = LoanServices