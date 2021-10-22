const MySqlClass = require('./mysql')
const boom = require('@hapi/boom')
const moment = require('moment')

const cuotesGenerator = require('../utils/loan_handling/cuotes_generator')
const paymentsService = require('../services/serv_payments')

class loanQueryHandler {
    constructor() {
        this.db = MySqlClass
        this.source = {
            userId: false,
            usersIdArray: false,
            loanId: false,
            relId: false
        }
        this.payments = new paymentsService()
    }

    setSource(key, data) {
        const keys = Object.keys(this.source)
        keys.forEach(key => this.source[key] = false)
        this.source[key] = data
    }

    user(id) {
        this.setSource('userId', id)
        return this
    }

    users(usersArray) {
        this.setSource('usersIdArray', usersArray)
        return this
    }

    loan(id) {
        this.setSource('loanId', id)
        return this
    }

    rel(id) {
        this.setSource('relId', id)
        return this
    }

    //getting info
    async getAllLoans() {
        return await this.db.getData('loans')
    }

    async getInfo() {
        const loanInfo = await this.db.getData('loans', `id = ${this.source.loanId}`)

        if (loanInfo) {
            return loanInfo[0]
        } else {
            throw boom.notFound('inexistent resource')
        }
    }

    async getRels() {
        return await this.db.getData('cosigner_rels', `loan_id = ${this.source.loanId}`)
    }

    async getInstallmentes() {
        return await this.db.getData('instalments', `loan_id = ${this.source.loanId}`)
    }

    async getOneInstallment(id) {
        return await this.db.getData('instalments', `id = ${id}`)
    }

    //updating user
    async isFrozen() {
        const isFrozen = await this.db.getData('users', `id = ${this.source.userId}`, 'capital_frozen')
        return (isFrozen[0].capital_frozen === 0) ? false : true;
    }

    async freezeUserCapital() {
        return await this.db.upsert('users', { capital_frozen: 1 }, `id = ${this.source.userId}`)
    }

    async unfreezeUserCapital() {
        if (this.source.userId) {
            await this.db.upsert('users', { capital_frozen: 0 }, `id = ${this.source.userId}`)
        }
        if (this.source.usersIdArray) {
            const unfreezeUsers = this.source.usersIdArray.map(async userId => {
                await this.db.upsert('users', { capital_frozen: 0 }, `id = ${userId}`)
            })
            await Promise.all(unfreezeUsers)
        }
    }

    async setPasive(amount) {
        await this.db.doQuery(`UPDATE users SET pasive = pasive + ${amount} WHERE id = ${this.source.userId}`)
    }

    //manage loan
    async setLoan(loanData) {
        const queryInfo = await this.db.upsert('loans', loanData)
        return queryInfo.insertId
    }

    async setCosigner(cosigner, index = 0) {
        if (!cosigner.rol) ++index
        const data = {
            loan_id: this.source.loanId,
            index: index,
            ...cosigner
        }
        await this.db.upsert('cosigner_rels', data)
    }

    async reject() {
        if (this.source.loanId) {
            await this.db.upsert('loans', { status: 2, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
        }

        if (this.source.relId) {
            await this.db.upsert('cosigner_rels', { status: 2, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id=${this.source.relId}`)
        }
    }

    async accept() {
        await this.db.upsert('cosigner_rels', { status: 3, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id=${this.source.relId}`)
    }

    async signRel(user_id) {
        await this.db.upsert('cosigner_rels', { cosigner_id: user_id }, `id = ${this.source.relId}`)

    }
    async waitForDocuments() {
        console.log('se actualiza', this.source.loanId)
        await this.db.upsert('loans', { status: 4, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }

    async treasurerAprove() {
        await this.db.upsert('loans', { status: 5, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }

    async generateCuotes() {
        await cuotesGenerator(this.source.loanId)
    }

    async fistConfirmation(newStatus) {
        const loan = await this.db.getOne('loans', `id = ${this.source.loanId}`, 'amount, debtor_id')
        const treasurer = await this.db.getOne('cosigner_rels', `rol = 3 AND loan_id = ${this.source.loanId}`, 'cosigner_id')

        const transactionId = await this.db.upsert('transactions', {
            transaction_date: moment().format("YYYY-MM-DD hh:mm:ss"),
            amount: loan.amount,
            issuer: treasurer.cosigner_id,
            issuer_rol: "3-treasurer",
            receiver: loan.debtor_id,
            comment: 'Transacción en espera de confirmación del usuario.'
        })

        await this.db.upsert('trans_instalments', {
            transaction_id: transactionId.insertId,
            loan_id: this.source.loanId,
            instalment_number: 0,
            total_amount: loan.amount,
            instalment: loan.amount,
            interest: 0
        })

        await this.db.upsert('loans', { status: newStatus, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }

    async secondConfirmation(newStatus) {
        const transaction = await this.db.getOne('trans_instalments', `loan_id = ${this.source.loanId} AND instalment_number = 0`, 'transaction_id')
        const loan = await this.db.getOne('loans', `id = ${this.source.loanId}`, 'debtor_id, amount')
        //update transaction
        await this.db.upsert('transactions', { status: "3-payed", comment: "Confirmado" }, `id = ${transaction.transaction_id}`)

        //update installment #0 as payed
        await this.db.upsert('instalments', { status: 3, transaction_id: transaction.transaction_id }, `loan_id = ${this.source.loanId} AND instalment_number = 0`)

        //update cosigners pasive
        let totalGuaranteed = 0
        const cosigners = await this.db.getData('cosigner_rels', `rol = 1 AND loan_id = ${this.source.loanId}`, 'cosigner_id, guaranteed_amount')
        const setCosignersPasive = cosigners.map(async cosigner => {
            await this.user(cosigner.cosigner_id).setPasive(cosigner.guaranteed_amount)
            totalGuaranteed += cosigner.guaranteed_amount
        })
        await Promise.all(setCosignersPasive)

        //update user pasive
        await this.user(loan.debtor_id).setPasive(loan.amount - totalGuaranteed)

        //update capital pasive
        await this.updateCapitalPasive(transaction.transaction_id, loan.amount)

        //update loan status
        await this.db.upsert('loans', { status: newStatus, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }

    async updateCapitalPasive(transaction_id, amount) {
        const [capital] = await this.db.getData('capital ORDER BY id DESC LIMIT 1')
        const [transaction] = await this.db.getData('transactions', `id = ${transaction_id}`, 'issuer')
        await this.db.upsert('capital', {
            amount: amount,
            active_actual: capital.active_actual - amount,
            active_previous: capital.active_actual,
            pasive_actual: capital.pasive_actual + amount,
            pasive_previous: capital.pasive_actual,
            transaction_id: transaction_id,
            holder: transaction.issuer
        })
    }
}

module.exports = loanQueryHandler