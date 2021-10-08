require('dotenv').config()
const boom = require('@hapi/boom')
const MySqlClass = require('../lib/mysql')

class PaymentService {
    constructor() {
        this.db = MySqlClass
    }

    async listPayments() {
        const dbPayments = await this.db.getData('transacciones')
        const payments = []
        const getReferences = dbPayments.map(async payment => {
            const loans_payment = await this.db.getData('transacciones_prestamos', `pago_id = ${payment.transaccion_id}`)
            const suscription_payment = await this.db.getData('transacciones_abonos', `transaccion_id = ${payment.transaccion_id}`)
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
        const [treasurer] = await this.db.getData('usuarios', `usuario_id = ${payment.destinatario}`, 'rol')
        if (treasurer.rol !== 3) {
            throw boom.badRequest(`El usuario ${payment.destinatario} no es tesorero`)
        }
        const transaction = { ...payment }

        delete transaction.transacciones

        const setTransaction = await this.db.upsert('transacciones', transaction)

        const setQuery = payment.transacciones.map(async transaction => {
            const motivo = transaction.motivo
            delete transaction.motivo
            if (motivo === 'abono') {
                transaction.datos.transaccion_id = setTransaction.insertId
                await this.db.upsert('transacciones_abonos', transaction.datos)
            } else {
                transaction.datos.pago_id = setTransaction.insertId
                await this.db.upsert('transacciones_prestamos', transaction.datos)
            }
        })

        await Promise.all(setQuery)

        return setTransaction
    }

    async updatePayment(payment_id, update_data) {
        if (update_data.estado === 2) {
            await this.db.upsert('transacciones', { estado: 2 }, `transaccion_id = ${payment_id}`)
        } else if (update_data.estado === 3) {
            const [transactionInfo] = await this.db.getData('transacciones', `transaccion_id = ${payment_id}`, "emisor, destinatario, estado, monto")

            if (transactionInfo.estado !== 1) {
                throw boom.badRequest('not resource found')
            }

            let addCapital = 0
            let substractPasive = 0

            await this.db.upsert('transacciones', { estado: 3 }, `transaccion_id = ${payment_id}`)

            const [suscription] = await this.db.getData('transacciones_abonos', `transaccion_id = ${payment_id}`)
            if (suscription) {
                addCapital = suscription.monto
                await this.db.doQuery(`UPDATE usuarios SET capital = capital + ${suscription.monto} WHERE usuario_id = ${transactionInfo.emisor}`)
            }

            const loan_payment = await this.db.getData('transacciones_prestamos', `pago_id = ${payment_id}`)
            if (loan_payment) {
                substractPasive = loan_payment.abono
                await this.db.doQuery(`UPDATE usuarios SET en_deuda = en_deuda - ${loan_payment.abono} WHERE usuario_id = ${transactionInfo.emisor}`)
                
            }

            let capital = await this.db.getData('capital ORDER BY mov_id DESC LIMIT 1')
            if (!capital) {
                capital = {
                    total_activo_actual: 0,
                    total_activo_anterior: 0,
                    total_pasivo_actual: 0,
                    total_pasivo_anterior: 0
                }
            } else {
                capital = capital[0]
            }
            await this.db.upsert('capital', {
                total_activo_actual: capital.total_activo_actual + addCapital,
                total_activo_anterior: capital.total_activo_actual,
                transaccion_id: payment_id,
                monto: transactionInfo.monto,
                total_pasivo_actual: capital.total_pasivo_actual - substractPasive,
                total_pasivo_anterior: capital.total_pasivo_actual,
                administrador: transactionInfo.destinatario
            })
        }
        return true
    }
}

module.exports = PaymentService