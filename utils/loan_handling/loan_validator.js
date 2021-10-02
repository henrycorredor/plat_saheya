require('dotenv').config()
const moment = require('moment')
const cosignersInspector = require('./cosigners_inspector')
const MySqlClass = require('../../lib/mysql')

const conditions = {
    db: new MySqlClass(),

    compare: (more, less, msg) => (more >= less) ? [true, 'pass'] : [false, msg],

    /*getCapitalVsLoanPercent: async function (squema_capital_source, user_loan_amount, user_id) {
        if (squema_capital_source === 'USER_FREE_CAPITAL') {
            const [userInfo] = await this.db.getData('usuarios', `usuario_id = ${user_id}`, `capital, en_deuda`)

            const userFreeCapital = Number(userInfo.capital) - Number(userInfo.en_deuda)
            return (100 * user_loan_amount) / userFreeCapital
        }
        if (squema_capital_source === 'TOTAL_COMPANY_CASH') {
            const [totalCapital] = await this.db.getData('capital', `mov_id > 1 ORDER BY mov_id DESC LIMIT 1`, `total_actual`)
            return (100 * user_loan_amount) / totalCapital.total_actual
        }
    },*/

    term: function (schemaMonths, userMonths) {
        return this.compare(schemaMonths, userMonths, 'Ha superado numero de meses máximo de plazo para este tipo de préstamo.')
    },

    selfDebtMaxAmount: async function ({ capitalFunds, cosignerNeeded, percentageAllowed }, user_loan_amount) {
        let availableCapital = 0
        if (capitalFunds === 'USER_FREE_CAPITAL') {
            const [userInfo] = await this.db.getData('usuarios', `usuario_id = ${process.env.USER_ID}`, `capital, en_deuda`)
            availableCapital = ((userInfo.capital * percentageAllowed) / 100) - userInfo.en_deuda
        }
        const compare = this.compare(availableCapital, user_loan_amount, `El monto supera la cantidad permitida para este tipo de préstamo.`)
        if (!cosignerNeeded) {
            return compare
        } else {
            return (compare[0]) ? [false, 'Este monto puede ser cubierto por el usuario. Puede cambiar la modalidad de préstamo y aplicar sin coodeudores.'] : [true, 'pass']
        }
    },

    cosignersMaxAmount: async function ({ capitalFunds, percentageAllowed }, cosigners_array) {
        if (capitalFunds === 'USER_FREE_CAPITAL') {
            let userInfo
            let freeCapital
            for (i = 0; i < cosigners_array.length; i++) {
                [userInfo] = await this.db.getData('usuarios', `usuario_id = ${cosigners_array[i].id_codeudor}`, `capital, en_deuda`)
                freeCapital = ((Number(userInfo.capital) * percentageAllowed) / 100) - Number(userInfo.en_deuda)

                if (freeCapital < cosigners_array[i].monto_avalado) {
                    return [false, `El coodeudor '${cosigners_array[i].id_codeudor}' excede el monto de su capital libre.`]
                }
            }
        } else if (capitalFunds === 'TOTAL_COMPANY_CASH') {

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
    },

    firstDay: async function (schema_data, user_aplication_first_date) {
        const daysToFistDate = moment(user_aplication_first_date).diff(moment(), 'days')

        const noCloserThan = this.compare(daysToFistDate, schema_data.noCloserThan, 'La fecha inicial más próxima que lo reglamentado.')
        if (!noCloserThan[0]) return noCloserThan

        const noFurtherThan = this.compare(schema_data.noFurtherThan, daysToFistDate, 'La fecha excede el limite de lo reglamentado')
        if (!noFurtherThan[0]) return noFurtherThan

        return [true, 'pass']
    }
}

const val = {
    validator: async function (user_loan_aplication) {

        const comparePairs = {
            term: 'num_cuotas',
            selfDebtMaxAmount: 'monto',
            cosignersMaxAmount: 'coodeudores',
            firstDay: 'fecha_inicial'
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

        if (this.filters.selfDebtMaxAmount.cosignerNeeded && msg.approval) {
            if (user_loan_aplication.coodeudores.length === 0) {
                msg.approval = false
                msg.msg = 'No ha solicitado soporte de coodeudores.'
            } else {
                const cosigners_validation = await cosignersInspector(user_loan_aplication.monto, user_loan_aplication.coodeudores, this.filters.selfDebtMaxAmount.percentageAllowed)
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