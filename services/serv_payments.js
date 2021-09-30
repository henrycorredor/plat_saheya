require('dotenv').config()
const MySqlClass = require('../lib/mysql')

class PaymentService {
    constructor() {
        this.db = new MySqlClass()
    }

    async setNewPayment(payment) {
        const transaction = { ...payment }
        transaction.emisor = process.env.USER_ID
        delete transaction.transacciones
        const setTransaction = await this.db.upsert('transacciones', transaction)
        console.log(payment)
        const setQuery = payment.transacciones.map(async transaction => {
            delete transaction.motivo
            console.log(transaction.datos)
            if (transaction.motivo === 'abono') {
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
}

module.exports = PaymentService