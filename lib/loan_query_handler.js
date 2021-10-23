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
        await this.db.upsert('loans', { status: 4, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }

    async treasurerAprove() {
        await this.db.upsert('loans', { status: 5, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }

    async generateCuotes() {
        await cuotesGenerator(this.source.loanId)
    }

    async firstConfirmation(newStatus) {
        const loan = await this.db.getOne('loans', `id = ${this.source.loanId}`, 'amount, debtor_id')
        const treasurer = await this.db.getOne('cosigner_rels', `rol = 3 AND loan_id = ${this.source.loanId}`, 'cosigner_id')

        const paymentStack = {
            transaction_date: moment().format("YYYY-MM-DD hh:mm:ss"),
            amount: loan.amount * -1,
            issuer: treasurer.cosigner_id,
            issuer_rol: "3-treasurer",
            receiver: loan.debtor_id,
            comment: 'Desembolso del tesorero.',
            transactions: [{
                aim: 'instalment',
                data: {
                    loan_id: this.source.loanId,
                    instalment_number: 0,
                    total_amount: loan.amount * -1,
                    instalment: loan.amount * -1,
                    interest: 0
                }
            }]
        }

        const paimentId = await this.payments.setNewPayment(paymentStack)
        await this.db.upsert('instalments', { transaction_id: paimentId }, `instalment_number = 0 AND loan_id = ${this.source.loanId}`)
        await this.db.upsert('loans', { status: newStatus, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }

    async secondConfirmation(newStatus) {
        const transaction = await this.db.getOne('trans_instalments', `loan_id = ${this.source.loanId} AND instalment_number = 0`, 'transaction_id')
        const loan = await this.db.getOne('loans', `id = ${this.source.loanId}`, 'debtor_id, amount')
        loan.id = loan.debtor_id
        await this.payments.updatePayment(transaction.transaction_id, newStatus, loan)
        await this.db.upsert('loans', { status: newStatus, last_update: moment().format("YYYY-MM-DD hh:mm:ss") }, `id = ${this.source.loanId}`)
    }
}

module.exports = loanQueryHandler