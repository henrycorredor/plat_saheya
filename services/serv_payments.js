require('dotenv').config()
const boom = require('@hapi/boom')
const { createPool } = require('mysql')
const MySqlClass = require('../lib/mysql')

class PaymentService {
    constructor() {
        this.db = MySqlClass
    }

    async listPayments() {
        const dbPayments = await this.db.getData('transactions')
        const payments = []
        const getReferences = dbPayments.map(async payment => {
            const loans_payment = await this.db.getData('trans_instalments', `transaction_id = ${payment.id}`)
            const suscription_payment = await this.db.getData('trans_subscriptions', `transaction_id = ${payment.id}`)
            payments.push({
                ...payment,
                pago_prestamo: (loans_payment) ? loans_payment[0] : '',
                pago_capital: (suscription_payment) ? suscription_payment[0] : ''
            })
        })
        await Promise.all(getReferences)
        return payments
    }

    async setNewPayment(payment) {
        const paymentsToAprove = await this.db.getData('transactions', `issuer = ${payment.issuer} AND status = '1-waiting'`)
        if (paymentsToAprove) throw boom.notAcceptable('user already has a pending transaction to approve')

        const receiverRol = await this.db.getOne('users', `id = ${payment.receiver}`, 'rol')
        if (receiverRol.rol !== '3-treasurer') throw boom.notAcceptable('receiver is not treasurer')

        let transactionsTotal = 0

        // validate payment amounts are correct
        payment.transactions.map(trans => {
            if (trans.aim === 'instalment') {
                transactionsTotal += trans.data.total_amount
            } else {
                transactionsTotal += trans.data.amount
            }
        })

        if (transactionsTotal !== payment.amount) throw boom.notAcceptable('Total amount in transactions and declared amount are not equals')

        const transaction = { ...payment }

        delete transaction.transactions

        const setTransaction = await this.db.upsert('transactions', transaction)

        const setQuery = payment.transactions.map(async transaction => {
            const aim = transaction.aim
            delete transaction.aim
            if (aim === 'suscription') {
                transaction.data.transaction_id = setTransaction.insertId
                await this.db.upsert('trans_subscriptions', transaction.data)
            } else {
                transaction.data.transaction_id = setTransaction.insertId
                await this.db.upsert('trans_instalments', transaction.data)
            }
        })
        await Promise.all(setQuery)

        return setTransaction
    }

    async updatePayment(payment_id, update_data, req_user) {
        if (update_data.status === '2-rejected') {
            await this.db.upsert('transactions', { status: '2-rejected' }, `id = ${payment_id}`)
        } else {
            const transaction = await this.db.getOne('transactions', `id = ${payment_id}`, "issuer, receiver, status, amount")

            if (transaction.status !== '1-waiting') throw boom.notFound('not resource found')
            if (transaction.receiver !== req_user.id) throw boom.unauthorized('This transaction belongs to another treasuer')

            let addCapital = 0
            let substractPasive = 0

            await this.db.upsert('transactions', { status: '3-approved' }, `id = ${payment_id}`)

            const suscription = await this.db.getOne('trans_subscriptions', `transaction_id = ${payment_id}`)
            if (suscription) {
                const userCapital = await this.db.getOne('users', `id = ${transaction.issuer}`, 'capital')
                await this.db.upsert('users', { capital: userCapital.capital + suscription.amount }, `id = ${transaction.issuer}`)
                addCapital += suscription.amount
            }

            const loanPayment = await this.db.getOne('trans_instalments', `transaction_id = ${payment_id}`, 'instalment')
            if (loanPayment) {
                const userPasive = await this.db.getOne('users', `id = ${transaction.issuer}`, 'pasive')
                await this.db.upsert('users', { pasive: userPasive.pasive - loanPayment.instalment }, `id = ${transaction.issuer}`)
                substractPasive -= loanPayment.instalment
            }

            let [capital] = await this.db.getData('capital ORDER BY id DESC LIMIT 1')

            await this.db.upsert('capital', {
                active_actual: capital.active_actual + addCapital,
                active_previous: capital.active_actual,
                pasive_actual: capital.pasive_actual - substractPasive,
                pasive_previous: capital.pasive_actual,
                transaction_id: payment_id,
                amount: transaction.amount,
                holder: transaction.receiver
            })
        }
        return true
    }
}

module.exports = PaymentService