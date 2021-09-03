const conditions = {
    compare: (more, less, msg) => (more >= less) ? [0, 'pass'] : [1, msg],
    term: function (userMonths, schemaMonths) {
        return this.compare(schemaMonths, userMonths, 'Ha superado numero de meses máximo de plazo para este tipo de préstamo.')
    },
    balance: function (userPercent, schemaPercent) {
        return this.compare(schemaPercent, userPercent, 'El monto supera la cantidad permitida para este tipo de préstamo.')
    },
    accountAgeing: function (userAccountAgeing, schemaLoanAgein) {
        return this.compare(userAccountAgeing, schemaLoanAgein, 'No cumple con el tiempo de antiguedad establecido para este tipo de préstamo')
    },
    actualLoans: function (userLoans, schemaLoans) {
        return this.compare(schemaLoans, userLoans, 'Actualmente tiene más préstamos vigentes que los permitidos por este tipo de préstamos.')
    },
    furtherDocs: function (docNames) {
        return [2, `Debe entregar los siguientes documentos de soporte: ${docNames}`]
    }
}

function validate(loan_schema, user_loan_aplication) {
    let result
    let msg = [0, 'Solicitud aprobada.']
    const keys = Object.keys(user_loan_aplication)
    for (i = 0; i < keys.length; i++) {
        result = conditions[keys[i]](user_loan_aplication[keys[i]], loan_schema[keys[i]])
        if (result[0] !== 0) {
            msg = result
            if (result[0] === 1) {
                break
            }
        }
    }
    return msg
}

module.exports = validate