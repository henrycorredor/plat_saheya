const squemas = require('../utils/schemas/schemas_loan_conditions')
const MySqlClass = require('./mysql')
const moment = require('moment')
require('dotenv').config()

const conditions = {
    db: new MySqlClass(),

    compare: (more, less, msg) => (more >= less) ? [0, 'pass'] : [1, msg],

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

    selfDebtMaxAmount: async function ([capital_source, schema_percent], user_loan_amount) {
        const freeCapitalVsLoanPercent = await this.getCapitalVsLoanPercent(capital_source, user_loan_amount, process.env.USER_ID)
        return this.compare(schema_percent, freeCapitalVsLoanPercent, 'El monto supera la cantidad permitida para este tipo de préstamo.')
    },

    cosignersMaxAmount: async function ([capital_source, schema_percent], cosigners_array) {
        let freeCapitalVsLoanPercent
        for (i = 0; i < cosigners_array.length; i++) {
            freeCapitalVsLoanPercent = await this.getCapitalVsLoanPercent(capital_source, cosigners_array[i].monto_avalado, cosigners_array[i].id_codeudor)
            if (freeCapitalVsLoanPercent > schema_percent) {
                return [1, `El coodeudor '${cosigners_array[i].id_codeudor}' excede el monto de su capital libre.`]
            }
        }
        return [0, 'pass']
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

const loanFeatures = {
    postApplymentDocs: function (msg) {
        //este msg es un arreglo
        return [2, msg]
    },
    adminPermission: function (userRoles) {
        const msg = (userRoles.length === 1) ? `un usuario adminstrativo.` : `${userRoles.length} usuarios administrativos.`
        return [2, `Debe contar con la aprobación de ${msg}`]
    },
    cuoteType: function (loanType) {
        return [3, loanType]
    },
    interest: function (loanInterest) {
        return [3, loanInterest]
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
            if (result[0] === 1) {
                msg.approval = false
                msg.msg = result[1]
                break
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