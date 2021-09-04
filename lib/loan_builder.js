const squemas = require('../utils/schemas/schemas_loan_conditions')

const conditions = {
    compare: (more, less, msg) => (more >= less) ? [0, 'pass'] : [1, msg],
    term: function (userMonths, schemaMonths) {
        return this.compare(schemaMonths, userMonths, 'Ha superado numero de meses máximo de plazo para este tipo de préstamo.')
    },
    maxAmount: function (userPercent, schemaPercent) {
        return this.compare(schemaPercent, userPercent, 'El monto supera la cantidad permitida para este tipo de préstamo.')
    },
    accountAgeing: function (userAccountAgeing, schemaLoanAgein) {
        return this.compare(userAccountAgeing, schemaLoanAgein, 'No cumple con el tiempo de antiguedad establecido para este tipo de préstamo')
    },
    actualLoans: function (userLoans, schemaLoans) {
        return this.compare(schemaLoans, userLoans, 'Actualmente tiene más préstamos vigentes que los permitidos por este tipo de préstamos.')
    },
    furtherProcess: function (msg) {
        //este msg es una cadena
        return [2, msg]
    },
    adminPermission: function (userRoles) {
        //recibe un array con los roles para otorgar permisos
        return [2,  userRoles]
    },
    monthCuote: function (loanType) {
        return [3, loanType]
    },
    interest: function (loanInterest) {
        return [3, loanInterest]
    }
}

function validate(loan_schema, user_loan_aplication) {
    let result
    const msg = {
        approval: true,
        msg: 'Solicitud aprobada.',
        features: {}
    }

    const keys = Object.keys(user_loan_aplication)
    for (i = 0; i < keys.length; i++) {
        result = conditions[keys[i]](user_loan_aplication[keys[i]], loan_schema[keys[i]])
        if (result[0] === 1) {
            msg.approval = false
            msg.msg = result[1]
            break
        }
        if(result[0]=== 1)
    }
    return msg
}

module.exports = validate