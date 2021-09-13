/*
system conditions: 
    term: numero maximo de MESES.
            -> 0 pasa 1 no aprovado

    maxAmount: [capital total, porcentaje]
            -> 0 pasa 1 no aprovado

    accountAgeing: AÑOS de antiguedad de la cuenta
            -> 0 pasa 1 no aprovado

    actualLoans: NUMERO de prestamos vigentes a la fecha
            -> 0 pasa 1 no aprovado

    postApplymentDocs: [CADENA explicando los requisitos posteriores]
            -> 2 aviso
    
    adminPermission: [codigos de roles]
            -> 2 aviso

    monthCuote: constante tipo de cuotas
            -> 3 constantes de la informacion del prestamo

    interest: PORCENTAJE de interes sobre mes vencido
            -> 3 constantes de la informacion del prestamo

System constants:
        TOTAL_COMPANY_CASH: total del efectivo en poder de la compañía
        USER_FREE_CAPITAL: capital libre del usuario

Flags:
        MONTH_FIXED_CUOTE
        ONLY_MONTHLY_INTEREST
*/

const validator = require('../../lib/loan_handler')

/*
- Ordinario cuota fija(PO)
    - 90% del capital libre
    - Cuota fija del 0.8% del interes mensual vencido.
    - Máximo de 60 meses.
    - Extendible hasta 10 años, bajo solicitud firmada del socio.
    - Aprobación única del tesorero.

- Ordinario sin cuota mensual
    - Como el anterior, pero con pago de itereses mensuales
    - Máximo 12 meses
*/

const ordinarioCuotaFija = {
        loanCode: 1,
        filters: {
                selfDebtMaxAmount: ['USER_FREE_CAPITAL', 90],
                term: 60,
                needCosigners: false
        },
        warmings: {},
        features: {
                adminPermission: [3],
                cuoteType: 'MONTH_FIXED_CUOTE',
                interest: 0.8
        }
}

const ordinarioSinCuotaFija = {
        loanCode: 2,
        filters: {
                term: 12,
                selfDebtMaxAmount: ['USER_FREE_CAPITAL', 90],
                needCosigners: false
        },
        warmings: {},
        features: {
                adminPermission: [3],
                cuoteType: 'ONLY_MONTHLY_INTEREST',
                interest: 0.8
        }

}

/*
- Extraordinario (PE)
    - Superior al 90% del capital libre.
    - Respaldada con el capital libre de los deudores.
    - Cuota mensual fija del 0.8%
    - Máximo 5 años, extendible a 10 años bajo solicitud firmada del deudor y los coodeudores.
    - Apobación del tesorero y el presidente.
    - Adjunto pagaré e instructivo
*/

const extraordinario = {
        loanCode: 3,
        filters: {
                selfDebtMaxAmount: ['USER_FREE_CAPITAL', 90],
                cosignersMaxAmount: ['USER_FREE_CAPITAL', 90],
                term: 60,
                actualLoans: 1,
                needCosigners: true
        },
        warmings: {
                postApplymentDocs: ['Necesario adjuntar pagaré e instructivo']
        },
        features: {
                adminPermission: [3, 4],
                interest: 0.8,
                cuoteType: 'MONTH_FIXED_CUOTE',
        }
}

/*
- Extra extraordinario
    - Cuota mensual fija.
    - Máximo 5 años, extendible a 10 años bajo solicitud firmada por deudor y coodeudores.
    - 0.8% interes mes vencido.
    - Monto máximo: no puede superar el 80% del efectivo disponible:
        - efectivo disponible = efectivo - (rubro de auxilio + reserva legal + 30% reserva de recreación - (monto en deuda + monto coodeudado))
    - Dos años de antiguedad.
    - Documentos extra: 
        - Declaración de no embargo, bancarrota o similares.
        - Tener capacidad de pago, analisis de la junta directiva.
        - Adjuntar pagaré e instructivo, firmado por el socio y el coodeudor. Todos con buen historial financiero.
        - Si es para carro o casa, tener el bien asegurado contra todo riesgo.
*/

const extraExtraordinario = {
        loanCode: 4,
        filters: {
                selfDebtMaxAmount: ['TOTAL_COMPANY_CASH', 90],
                term: 60,
                accountAgeing: 2,
                actualLoans: 0
        },
        warmings: {
                postApplymentDocs: ['Pagaré e Instructivo firmado por el socio y el coodeudor']
        },
        features: {
                adminPermission: [3, 4, 5],
                interest: 0.8,
                cuoteType: 'MONTH_FIXED_CUOTE',
        }
}

const loanTypes = [extraExtraordinario, ordinarioCuotaFija, ordinarioSinCuotaFija, extraordinario]

loanTypes.forEach(loanType => {
        Object.assign(loanType, validator)
})

module.exports = loanTypes