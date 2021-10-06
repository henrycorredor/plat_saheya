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
            const adminCredentials = (loanData.features.adminPermission) ? loanData.features.adminPermission : []

            delete data.coodeudores

            await this.db.upsert('usuarios', { capital_congelado: 1 }, `usuario_id = ${data.deudor_id}`)
            const setLoanQuery = await this.db.upsert('prestamos', data)

            result.loanId = setLoanQuery.insertId

            const setCosigners = cosigners.map(async (cosigner, index) => {
                await this.db.upsert('relaciones_coodeudores', {
                    id_prestamo: setLoanQuery.insertId,
                    id_codeudor: cosigner.id_codeudor,
                    monto_avalado: cosigner.monto_avalado,
                    orden: index
                })
                await this.db.upsert('usuarios', { capital_congelado: 1 }, `usuario_id = ${cosigner.id_codeudor}`)
            })
            await Promise.all(setCosigners)

            const setAdmin = adminCredentials.map(async adminRole => {
                await this.db.upsert('relaciones_coodeudores', {
                    id_prestamo: setLoanQuery.insertId,
                    id_codeudor: 0,
                    monto_avalado: 0,
                    orden: 0,
                    rol: adminRole
                })
            })
            await Promise.all(setAdmin)
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

        //if is an admin user, user ID is useless and is setted to 0
        const userId = (rol === 1) ? Number(process.env.USER_ID) : 0

        const relationships = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan_id}`)

        if (relationships) {
            return loanUpdater(relationships, loan_id, status, userId, rol)
        } else {
            throw boom.notFound('inexistent resource')
        }
    }

    async getLoanCuotes(loan_id) {
        const cuotes = await this.db.getData('cuotas', `id_prestamo = ${loan_id}`)
        if (cuotes) {
            return cuotes
        } else {
            throw boom.notFound('inexistent resource')
        }
    }

    async getCuote(cuote_id) {
        const cuote = await this.db.getData('cuotas', `cuota_id = ${cuote_id}`)
        console.log(cuote_id, cuote)
        if (cuote) {
            return cuote[0]
        } else {
            throw boom.notFound('inexistent resource')
        }
    }
}

module.exports = LoanServices