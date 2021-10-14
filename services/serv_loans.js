const boom = require('@hapi/boom')
const loanHandlerClass = require('../lib/loan_query_handler')

const loanUpdater = require('../utils/loan_handling/loan_updater')
const [
    extraExtraordinario,
    ordinarioCuotaFija,
    ordinarioSinCuotaFija,
    extraordinario
] = require('../utils/loan_handling/loan_schemas')

class LoanServices {
    constructor() {
        this.handler = new loanHandlerClass()
    }

    async getAllLoans() {
        return await this.handler.getAllLoans()
    }

    async applyNewLoan(req_user, loanApplicationData) {
        let loanSchema
        switch (Number(loanApplicationData.type)) {
            case 1:
                loanSchema = await ordinarioCuotaFija.validator(req_user, loanApplicationData)
                break
            case 2:
                loanSchema = await ordinarioSinCuotaFija.validator(req_user, loanApplicationData)
                break
            case 3:
                loanSchema = await extraordinario.validator(req_user, loanApplicationData)
                break
            case 4:
                loanSchema = await extraExtraordinario.validator(req_user, loanApplicationData)
                break
            default:
                throw boom.badRequest('wrong type code')
        }

        if (loanSchema.approval) {
            await this.handler.user(loanApplicationData.debtor_id).freezeUserCapital()

            const cosigners = (loanApplicationData.cosigners) ? loanApplicationData.cosigners : []
            delete loanApplicationData.cosigners

            const newLoanId = await this.handler.setLoan(loanApplicationData)

            const setCosigners = cosigners.map(async (cosigner, index) => {
                await this.handler.loan(newLoanId).setCosigner(cosigner, index)
                await this.handler.user(cosigner.cosigner_id).freezeUserCapital()
            })
            await Promise.all(setCosigners)

            const adminCredentials = (loanSchema.features.adminPermission) ? loanSchema.features.adminPermission : []
            const setAdmins = adminCredentials.map(async (adminRole) => {
                await this.handler.loan(newLoanId).setCosigner({ cosigner_id: 0, guaranteed_amount: 0, rol: adminRole })
            })
            await Promise.all(setAdmins)
            loanSchema.loanId = newLoanId
        }

        return loanSchema
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