const MySqlClass = require('../../lib/mysql')

const loanSchemas = require('./loan_schemas')

const moment = require('moment')

function roundToCeil(amount, roundTo) {
    let rounded = Math.floor(amount / roundTo)
    if (rounded !== amount / roundTo) { rounded++ }
    return (rounded * roundTo)
}

const cuotesGenerator = async function (loan_id) {
    const db = new MySqlClass()

    const [loan] = await db.getData('prestamos', `prestamo_id = ${loan_id}`)

    const [loanSchema] = loanSchemas.filter(schema => schema.loanCode === loan.tipo)

    switch (loanSchema.features.cuoteType) {
        case 'MONTH_FIXED_CUOTE':
            const data = []

            const realCuoteAmount = (loan.monto / loan.num_cuotas).toFixed(2)
            const cuoteRounded = roundToCeil(realCuoteAmount, 100)

            let fixedCuote = 0
            let surplus = 0
            let onDebt = 0
            let onDebtMemory = 0
            let interestByMonth = 0
            let interestAcumulated = 0
            let validfrom
            let validUntil
            let addMonthsRatio

            for (i = 0; i < loan.num_cuotas; i++) {
                onDebtMemory = (onDebtMemory === 0) ? loan.monto : onDebt
                onDebt = onDebtMemory - cuoteRounded

                interestByMonth = roundToCeil((onDebtMemory * loanSchema.features.interest) / 100, 100)

                if (i === 0) {
                    const lastDayOfMonth = moment(loan.fecha_inicial).endOf('month')
                    const monthDaysLeft = moment(lastDayOfMonth).diff(moment(loan.fecha_inicial), 'days')

                    const daysInMonth = moment(loan.fecha_inicial, "YYYY-MM").daysInMonth()

                    const interestFractionOfMonth = roundToCeil((interestByMonth * monthDaysLeft) / daysInMonth, 100)
                    console.log('todo el mes: ', daysInMonth, 'dias restantes: ', monthDaysLeft, 'interes de un mes: ', interestByMonth, 'interes fraccion', interestFractionOfMonth)
                    interestByMonth = (loan.mes_inicial === 'this') ? interestFractionOfMonth : interestByMonth + interestFractionOfMonth
                }

                interestAcumulated += interestByMonth

                console.log(i, interestByMonth, interestAcumulated)

                surplus += (cuoteRounded - realCuoteAmount)

                fixedCuote = (i === (loan.num_cuotas - 1)) ? cuoteRounded : roundToCeil(cuoteRounded - surplus, 100)

                addMonthsRatio = (loan.mes_inicial === 'this') ? 0 : 1

                validfrom = moment(loan.fecha_inicial).add(addMonthsRatio + i, 'month').startOf('month').format('YYYY-MM-DD')
                validUntil = moment(validfrom).endOf('month').format('YYYY-MM-DD')

                if (i === 0) {
                    if (loan.mes_inicial === 'this') {
                        validfrom = moment(loan.fecha_inicial).format('YYYY-MM-DD')
                    }
                }

                data.push({
                    id_prestamo: loan_id,
                    monto: fixedCuote,
                    en_deuda_futura: onDebt,
                    vigencia_desde: validfrom,
                    vigencia_hasta: validUntil,
                    interes: 0,
                    multa: 0,
                    pagado: 0,
                    en_deuda: onDebtMemory
                })
            }

            const fixedInterest = roundToCeil(interestAcumulated / loan.num_cuotas, 100)

            const insertCuotes = data.map(async cuote => {
                cuote.interes = fixedInterest
                await db.upsert('cuotas', cuote)
            })

            await Promise.all(insertCuotes)

            break

        case 'ONLY_MONTHLY_INTEREST':

            break

        default:
    }
}

module.exports = cuotesGenerator

/*
loanCode: 4,
        filters: {
                selfDebtMaxAmount: {
                        capitalFunds: 'TOTAL_COMPANY_CASH',
                        percentageAllowed: 90,
                        cosignerNeeded: false
                },
                cosignersMaxAmount: {
                        capitalFunds: 'USER_FREE_CAPITAL',
                        percentageAllowed: 90
                },
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


        cuote_id	integer($int64)

loan_id	integer($int64)
amount	integer($int64)
future_debt	integer($int64)
initial_date	integer($int64)
expiration_date	integer($int64)
interest	integer($int64)
fine	integer($int64)
payed	integer($int64)
actual_in_debt	integer($int64)
}*/