require('dotenv').config()
const boom = require('@hapi/boom')
const handlerClass = require('../lib/payments_query_handler')
const paymentValidator = require('../utils/validators/payment_validator')

class PaymentService {
    constructor() {
        this.handler = new handlerClass()
        this.validate = new paymentValidator()
    }

    async listPayments() {
        const payments = await this.handler.listAllPayments()
        return payments
    }

    async setNewPayment(paymentStack) {
        let transactionsTotal = 0

        // validate payment amounts are correct
        paymentStack.transactions.map(trans => {
            if (trans.aim === 'instalment') {
                transactionsTotal += trans.data.total_amount
            } else {
                transactionsTotal += trans.data.amount
            }
        })

        if (transactionsTotal !== paymentStack.amount) throw boom.notAcceptable('Total amount in transactions and declared amount are not equals')

        const transaction = { ...paymentStack }

        delete transaction.transactions

        const setTransaction = await this.handler.setTransaction(transaction)

        const setQuery = paymentStack.transactions.map(async payment => {
            const aim = payment.aim
            delete payment.aim
            if (aim === 'suscription') {
                payment.data.transaction_id = setTransaction
                await this.handler.setSubcription(payment.data)
            } else {
                const validate = await this.validate.instalmentValidator(payment.data)
                if (validate.code !== 30) throw boom.badRequest(validate.msg)
                payment.data.transaction_id = setTransaction
                await this.handler.setInstalment(payment.data)
            }
        })
        await Promise.all(setQuery)

        return setTransaction
    }

    async updatePayment(payment_id, update_data, req_user) {
        if (update_data.status === '2-rejected') {
            await this.handler.rejectPayment(payment_id, req_user.id)
        } else {
            await this.handler.aprovePayment(payment_id, req_user.id)
        }
        return true
    }
}

module.exports = PaymentService