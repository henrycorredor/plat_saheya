const MySqlClass = require('./mysql')
const boom = require('@hapi/boom')

class PaymentsQueryHandler {
    constructor() {
        this.db = MySqlClass
    }

    async listAllPayments() {
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

    async setTransaction(data) {
        if (!data.transaction_date) throw boom.badRequest('missing transaction_date')
        if (!data.amount) throw boom.badRequest('missing amount')
        if (!data.issuer) throw boom.badRequest('missing issuer')
        if (!data.receiver) throw boom.badRequest('missing receiver')

        if (!data.issuer_rol) data.issuer_rol = '1-normal'
        if (!data.comment) data.comment = ''

        const transaction = await this.db.upsert('transactions', data)

        return transaction.insertId
    }

    async setSubcription(data) {
        if (!data.transaction_id) throw boom.badRequest('missing transaction id')
        if (!data.amount) throw boom.badRequest('missing amount')

        const transaction = await this.db.upsert('trans_subscriptions', data)
        return transaction.insertId
    }

    async setInstalment(data) {
        if (!data.transaction_id) throw boom.badRequest('missing transaction id')
        if (!data.loan_id) throw boom.badRequest('missing loan id')
        if (!data.total_amount) throw boom.badRequest('missing total amount')
        if (!data.instalment) throw boom.badRequest('missing instalment')

        if (!data.interest) data.interest = 0
        if (!data.instalment_number) data.instalment_number = 0

        const transaction = this.db.upsert('trans_instalments', data)
        return transaction.insertId
    }

    async rejectPayment(payment_id, user_id) {
        const transaction = await this.db.getOne('transactions', `id = ${payment_id}`, 'receiver')
        if (transaction.receiver !== user_id) throw boom.unauthorized('the user is not the suscribed receiver')
        await this.db.upsert('transactions', { status: '2-rejected' }, `id = ${payment_id}`)
    }

    async aprovePayment(payment_id, user_id) {
        const transaction = await this.db.getOne('transactions', `id = ${payment_id}`, 'amount, issuer_rol, issuer, receiver')
        if (transaction.receiver !== user_id) throw boom.unauthorized('the user is not the suscribed receiver')

        await this.db.upsert('transactions', { status: '3-approved' }, `id = ${payment_id}`)

        let capital = 0
        let pasive = 0

        // update user capital
        const suscription = await this.db.getOne('trans_subscriptions', `transaction_id = ${payment_id}`)
        if (suscription) {
            const userCapital = await this.db.getOne('users', `id = ${transaction.issuer}`, 'capital')
            await this.db.upsert('users', { capital: userCapital.capital + suscription.amount }, `id = ${transaction.issuer}`)
            capital = suscription.amount
        }

        //update user pasive
        const loanPayment = await this.db.getOne('trans_instalments', `transaction_id = ${payment_id}`, 'instalment, loan_id, instalment_number')
        if (loanPayment) {
            const cosigners = await this.db.getData('cosigner_rels', `loan_id = ${loanPayment.loan_id} and rol = 1 order by 'index' desc`)
            let residue = loanPayment.instalment
            const setPasive = cosigners.map(async cosigner => {
                let payed = 0
                if (residue >= 0) {
                    const onDebt = cosigner.guaranteed_amount - cosigner.guaranteed_payed
                    payed = (onDebt > residue) ? residue : residue - onDebt
                    residue = residue - payed

                    console.log(cosigner.guaranteed_amount, cosigner.guaranteed_payed, onDebt)
                    console.log(payed, residue)
                    console.log("------")

                    await this.db.upsert('cosigner_rels',
                        { guaranteed_payed: cosigner.guaranteed_payed + payed },
                        `loan_id = ${loanPayment.loan_id} and cosigner_id = ${cosigner.cosigner_id} and rol = 1`)
                } else {
                    payed = cosigner.guaranteed_amount * -1
                }
                const userPasive = await this.db.getOne('users', `id = ${cosigner.cosigner_id}`, 'pasive')
                await this.db.upsert('users', { pasive: userPasive.pasive + payed }, `id = ${cosigner.cosigner_id}`)
            })
            await Promise.all(setPasive)
            pasive = loanPayment.instalment

            //update installment #0 as payed
            await this.db.upsert('instalments', { status: 3, payed_amount: loanPayment.instalment }, `loan_id = ${loanPayment.loan_id} AND instalment_number = ${loanPayment.instalment_number}`)
        }

        const holder = (transaction.issuer_rol === '1-normal') ? transaction.receiver : transaction.issuer
        //update capital
        const [capitalData] = await this.db.doQuery('SELECT * FROM capital ORDER BY id DESC LIMIT 1')
        const data = {
            amount: transaction.amount,
            active_actual: capitalData.active_actual + capital,
            active_previous: capitalData.active_actual,
            pasive_actual: capitalData.pasive_actual + pasive,
            pasive_previous: capitalData.pasive_actual,
            transaction_id: payment_id,
            holder: holder
        }
        await this.db.upsert('capital', data)
    }
}

module.exports = PaymentsQueryHandler