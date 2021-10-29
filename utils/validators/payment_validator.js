const MySqlClass = require('../../lib/mysql')

class paymentValidate {
    constructor() {
        this.db = MySqlClass
    }

    async instalmentValidator(instalment) {
        const dbData = await this.db.getOne('instalments', `id = ${instalment.instalment_id}`)

        if (dbData.status === '1-waiting') return { msg: "La cuota está en espera.", code: 10 }
        if (dbData.status === '3-payed') return { msg: "Cuota pagada", code: 11 }

        if (!instalment.actions) {
            if (dbData.amount !== instalment.amount) return { msg: "El monto de la cuota no es correcto", code: 14 }
        }

        if (dbData.interest !== instalment.interest) return { msg: "El monto del interés no coincide", code: 12 }
        if (dbData.penalty !== instalment.penalty) return { msg: "El monto de la multa no coincide", code: 13 }

        return { msg: 'no怕本', code: 30 }
    }
}

module.exports = paymentValidate