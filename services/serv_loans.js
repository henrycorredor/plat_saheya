const boom = require('@hapi/boom')
const loanHandlerClass = require('../lib/loan_query_handler')
const paymentsService = require('../services/serv_payments')

const [
    extraExtraordinario,
    ordinarioCuotaFija,
    ordinarioSinCuotaFija,
    extraordinario
] = require('../utils/loan_handling/loan_schemas')

class LoanServices {
    constructor() {
        this.handler = new loanHandlerClass()
        this.payments = new paymentsService()
    }

    async getAllLoans() {
        return await this.handler.getAllLoans()
    }

    async applyNewLoan(req_user, loanApplicationData) {
        if (!this.handler.user(req_user.id).isFrozen()) throw boom.notAcceptable('El capital de este usuario está congelado')

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

            let cosignedAmount = 0
            let selfIndex = 0
            const setCosigners = cosigners.map(async (cosigner, index) => {
                cosignedAmount += cosigner.guaranteed_amount
                cosigner.guaranteed_amount = cosigner.guaranteed_amount * -1
                await this.handler.loan(newLoanId).setCosigner(cosigner, index)
                await this.handler.user(cosigner.cosigner_id).freezeUserCapital()
                selfIndex = index
            })
            await Promise.all(setCosigners)

            //self record in cosigner rels
            await this.handler.loan(newLoanId).setCosigner({
                cosigner_id: req_user.id,
                guaranteed_amount: (loanApplicationData.amount - cosignedAmount) * -1,
                status: 3
            }, ++selfIndex)

            const adminCredentials = (loanSchema.features.adminPermission) ? loanSchema.features.adminPermission : []
            const setAdmins = adminCredentials.map(async (adminRole) => {
                await this.handler.loan(newLoanId).setCosigner({ cosigner_id: 0, guaranteed_amount: 0, rol: adminRole })
            })
            await Promise.all(setAdmins)
            loanSchema.loanId = newLoanId
        }
        return loanSchema
    }

    async getLoan(loan_id, user) {
        const loan = await this.handler.loan(loan_id).getInfo()
        if ((user.rol === '1-normal' && loan.debtor_id === user.id) || user.rol !== '1-normal') {
            return loan
        } else {
            throw boom.unauthorized()
        }
    }

    async updateLoan(loan_id, action_rol, status, req_user) {
        //statuses list:
        /*
        1-waiting
        2-reject
        3-accept
        5-treasurer-approve
        6-treasurer-confirm-disbursement
        7-user-confirm-disbursement
        8-loan-ended
        10-freeze
        */
        const loan = await this.handler.loan(loan_id).getInfo()
        const rels = await this.handler.loan(loan_id).getRels()
        const cosigners = []
        rels.map(rel => { if (rel.rol === 1) cosigners.push(rel.cosigner_id) })
        if (rels) {
            const answer = { msg: '', newStatus: 0, rol: 1 }

            //if is an admin user, user ID is useless and is setted to 0
            const userId = (action_rol === 1) ? req_user.id : 0

            // if is admin rol verifies the user has credencial
            if (action_rol !== 1 && (Number(req_user.rol.split("-")[0]) !== action_rol)) throw boom.unauthorized()

            let myRel
            if (action_rol === 3) {
                [myRel] = rels.filter(rel => (rel.rol === 3))
            } else {
                [myRel] = rels.filter(rel => (rel.rol === action_rol && rel.cosigner_id === userId))
            }
            // status 7 is the only one in which debtor updates its own loan
            if (!myRel && (status === '7-user-confirm-disbursement' && req_user.id !== loan.debtor_id)) throw boom.unauthorized()

            switch (status) {
                case '2-reject':
                    //reject loan - admin and users
                    // status 1 -> 2
                    if (myRel.status !== 1) throw boom.notFound('inexistent resource')

                    this.handler.loan(loan_id).reject()
                    this.handler.rel(myRel.id).reject()

                    await this.handler.user(loan.debtor_id).unfreezeUserCapital()
                    await this.handler.users(cosigners).unfreezeUserCapital()

                    answer.msg = `Loan ${loan_id} has been rejected`
                    answer.newStatus = 2
                    answer.rol = action_rol
                    break
                case '3-accept':
                    // accept - cosigners and admin
                    // status 1 -> 3
                    if(!myRel) throw boom.badRequest('check your petition')
                    
                    await this.handler.rel(myRel.id).accept()

                    const isTheLast = rels.filter(rel => rel.status === 1)

                    if (isTheLast.length === 1) {
                        await this.handler.loan(loan_id).waitForDocuments()
                    }

                    if (myRel.rol === 3) { //the system needs to know who was the treasure who signed this rel
                        await this.handler.rel(myRel.id).signRel(req_user.id)
                    }

                    answer.msg = `loan id ${loan_id} has been apoved by user ${req_user.id} rol ${action_rol}`
                    answer.newStatus = 3
                    answer.rol = action_rol
                    break
                case '5-treasurer-approve':
                    //only treasurer can aprove this stage
                    if (loan.status === 4 && action_rol === 3) {
                        await this.handler.loan(loan_id).treasurerAprove()
                        await this.handler.loan(loan_id).generateCuotes()

                        answer.msg = `loan id ${loan_id} has been confirmed`
                        answer.newStatus = 5
                        answer.rol = action_rol
                    } else {
                        throw boom.badRequest('Wrong request')
                    }
                    break
                case '6-treasurer-confirm-disbursement':
                    if (action_rol !== 3) throw boom.unauthorized('not autorized petition')
                    if (loan.status === 5 || loan.status === 7) {
                        const newStatus6 = (loan.status === 5) ? 6 : 8
                        if (newStatus6 === 6) {
                            await this.handler.user(loan.debtor_id).unfreezeUserCapital()
                            await this.handler.users(cosigners).unfreezeUserCapital()
                            await this.handler.loan(loan_id).firstConfirmation(newStatus6)
                        } else {
                            await this.handler.loan(loan_id).secondConfirmation(newStatus6)
                        }
                        answer.msg = `loan id ${loan_id} disbursement confirmed`
                        answer.newStatus = 5
                        answer.rol = action_rol
                    } else {
                        throw boom.badRequest('no resource found')
                    }
                    break
                case '7-user-confirm-disbursement':
                    if (action_rol !== 1) throw boom.unauthorized('not autorized petition')

                    if (loan.status === 5 || loan.status === 6) {
                        const newStatus7 = (loan.status === 5) ? 7 : 8
                        if (newStatus7 === 7) {
                            await this.handler.user(loan.debtor_id).unfreezeUserCapital()
                            await this.handler.users(cosigners).unfreezeUserCapital()
                            await this.handler.loan(loan_id).firstConfirmation(newStatus7)
                        } else {
                            await this.handler.loan(loan_id).secondConfirmation(newStatus7)
                        }
                        answer.msg = `loan id ${loan_id} confirmed`
                        answer.newStatus = 5
                        answer.rol = action_rol
                    } else {
                        throw boom.badRequest('no resource found')
                    }
                    break
                default:
                    throw boom.badRequest('wrong status code')
            }

            return answer
        } else {
            throw boom.notFound('inexistent resource')
        }
    }

    async getLoanCuotes(loan_id) {
        const cuotes = await this.handler.loan(loan_id).getInstallmentes()
        if (cuotes) {
            return cuotes
        } else {
            throw boom.notFound('inexistent resource')
        }
    }

    async getCuote(loan_id, cuote_number) {
        const cuote = await this.handler.getOneInstallment(loan_id, cuote_number)
        if (cuote) {
            return cuote[0]
        } else {
            throw boom.notFound('inexistent resource')
        }
    }
}

module.exports = LoanServices