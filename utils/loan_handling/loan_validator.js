require('dotenv').config()
const moment = require('moment')
const cosignersHandler = require('./cosigners_handler')
const MySqlClass = require('../../lib/mysql')

const conditions = {
    db: new MySqlClass(),

    compare: (more, less, msg) => (more >= less) ? [true, 'pass'] : [false, msg],

    getCapitalVsLoanPercent: async function (squema_capital_source, user_loan_amount, user_id) {
        if (squema_capital_source === 'USER_FREE_CAPITAL') {
            const [userInfo] = await this.db.getData('usuarios', `usuario_id = ${user_id}`, `capital, en_deuda`)
            const userFreeCapital = Number(userInfo.capital) - Number(userInfo.en_deuda)
            return (100 * user_loan_amount) / userFreeCapital
        }
        if (squema_capital_source === 'TOTAL_COMPANY_CASH') {
            const [totalCapital] = await this.db.getData('capital', `mov_id > 1 ORDER BY mov_id DESC LIMIT 1`, `total_actual`)
            return (100 * user_loan_amount) / totalCapital.total_actual
        }
    },

    term: function (schemaMonths, userMonths) {
        return this.compare(schemaMonths, userMonths, 'Ha superado numero de meses máximo de plazo para este tipo de préstamo.')
    },

    selfDebtMaxAmount: async function ({ capitalFunds, cosignerNeeded, percentageAllowed }, user_loan_amount) {
        if (!cosignerNeeded) {
            const freeCapitalVsLoanPercent = await this.getCapitalVsLoanPercent(capitalFunds, user_loan_amount, process.env.USER_ID)
            return this.compare(percentageAllowed, freeCapitalVsLoanPercent, `El monto supera por ${Math.floor(freeCapitalVsLoanPercent)}% la cantidad permitida para este tipo de préstamo.`)
        } else {
            return [true, 'pass']
        }
    },

    cosignersMaxAmount: async function ({ capitalFunds, percentageAllowed }, cosigners_array) {
        for (i = 0; i < cosigners_array.length; i++) {
            freeCapitalVsLoanPercent = await this.getCapitalVsLoanPercent(capitalFunds, cosigners_array[i].monto_avalado, cosigners_array[i].id_codeudor)
            if (freeCapitalVsLoanPercent > percentageAllowed) {
                return [false, `El coodeudor '${cosigners_array[i].id_codeudor}' excede el monto de su capital libre.`]
            }
        }
        return [true, 'pass']
    },

    accountAgeing: async function (schema_loan_agein) {
        const userInfo = await this.db.getData('usuarios', `usuario_id = ${process.env.USER_ID}`, `fecha_ingreso`)
        const userAccountAgeing = moment().diff(userInfo[0].fecha_ingreso, 'years')

        return this.compare(userAccountAgeing, schema_loan_agein, 'No cumple con el tiempo de antiguedad establecido para este tipo de préstamo')
    },

    actualLoans: async function (schema_loans) {
        userLoans = await this.db.getData('prestamos', `deudor_id = ${process.env.USER_ID}  AND estado > 5 AND estado < 8`, `count(*) as prestamos`)

        return this.compare(schema_loans, userLoans[0].prestamos, 'Actualmente tiene más préstamos vigentes que los permitidos por este tipo de préstamos.')
    }
}

const val = {
    validator: async function (user_loan_aplication) {

        const comparePairs = {
            term: 'num_cuotas',
            selfDebtMaxAmount: 'monto',
            cosignersMaxAmount: 'coodeudores'
        }

        const msg = {
            approval: true,
            msg: 'Solicitud aprobada.',
            warmings: [],
            features: {}
        }

        const keys = Object.keys(this.filters)

        for (i = 0; i < keys.length; i++) {
            result = await conditions[keys[i]](this.filters[keys[i]], user_loan_aplication[comparePairs[keys[i]]])
            if (!result[0]) {
                msg.approval = false
                msg.msg = result[1]
                break
            }
        }

        // filters parameters are defined in "loan_schemas"

        if (this.filters.selfDebtMaxAmount.cosignerNeeded) {
            if (user_loan_aplication.coodeudores.length === 0) {
                msg.approval = false
                msg.msg = 'No ha solicitado soporte de coodeudores.'
            } else {
                const cosigners_validation = await cosignersHandler(user_loan_aplication.monto, user_loan_aplication.coodeudores, this.filters.selfDebtMaxAmount[1])
                if (!cosigners_validation[0]) {
                    msg.approval = false
                    msg.msg = cosigners_validation[1]
                }
            }
        }

        if (msg.approval) {
            msg.warmings = this.warmings
            msg.features = this.features
        }

        return msg
    }
}


module.exports = val