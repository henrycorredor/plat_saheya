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

    const lastDayOfMonth = moment(loan.fecha_inicial).endOf('month')
    const monthDaysLeft = moment(lastDayOfMonth).diff(moment(loan.fecha_inicial), 'days')

    const daysInMonth = moment(loan.fecha_inicial, "YYYY-MM").daysInMonth()

    const addMonthsRatio = (loan.mes_inicial === 'this') ? 0 : 1

    let validfrom
    let validUntil
    let onDebt = 0

    switch (loanSchema.features.cuoteType) {
        case 'MONTH_FIXED_CUOTE':
            const data = []

            let fixedCuote = 0
            let surplus = 0
            let onDebtMemory = 0
            let interestByMonth = 0
            let interestAcumulated = 0

            const realCuoteAmount = (loan.monto / loan.num_cuotas).toFixed(2)
            const cuoteRounded = roundToCeil(realCuoteAmount, 100)

            for (i = 0; i < loan.num_cuotas; i++) {
                onDebtMemory = (onDebtMemory === 0) ? loan.monto : onDebt

                interestByMonth = roundToCeil((onDebtMemory * loanSchema.features.interest) / 100, 100)

                if (i === 0) {
                    const interestFractionOfMonth = roundToCeil((interestByMonth * monthDaysLeft) / daysInMonth, 100)
                    interestByMonth = (loan.mes_inicial === 'this') ? interestFractionOfMonth : interestByMonth + interestFractionOfMonth
                }

                interestAcumulated += interestByMonth

                surplus += (cuoteRounded - realCuoteAmount)

                fixedCuote = (i === (loan.num_cuotas - 1)) ? roundToCeil(cuoteRounded - surplus, 100) : cuoteRounded

                validfrom = moment(loan.fecha_inicial).add(addMonthsRatio + i, 'month').startOf('month').format('YYYY-MM-DD')
                validUntil = moment(validfrom).endOf('month').format('YYYY-MM-DD')

                if (i === 0) {
                    if (loan.mes_inicial === 'this') {
                        validfrom = moment(loan.fecha_inicial).format('YYYY-MM-DD')
                    }
                }

                onDebt = onDebtMemory - fixedCuote

                if (onDebt < 0) {
                    fixedCuote = fixedCuote + onDebt
                    onDebt = 0
                }

                data.push({
                    id_prestamo: loan_id,
                    cuota_num: i + 1,
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
            const fixed_interest = roundToCeil((loan.monto * loanSchema.features.interest) / 100, 100)
            let interest_this_month
            let cuote

            for (i = 0; i < loan.num_cuotas; i++) {
                validfrom = moment(loan.fecha_inicial).add(addMonthsRatio + i, 'month').startOf('month').format('YYYY-MM-DD')
                validUntil = moment(validfrom).endOf('month').format('YYYY-MM-DD')

                if (i === 0) {
                    const interestFractionOfMonth = roundToCeil((fixed_interest * monthDaysLeft) / daysInMonth, 100)
                    interest_this_month = (loan.mes_inicial === 'this') ? interestFractionOfMonth : fixed_interest + interestFractionOfMonth

                    if (loan.mes_inicial === 'this') {
                        validfrom = moment(loan.fecha_inicial).format('YYYY-MM-DD')
                    }
                } else {
                    interest_this_month = fixed_interest
                }

                if (i === loan.num_cuotas - 1) {
                    cuote = loan.monto
                    onDebt = 0
                } else {
                    cuote = 0
                    onDebt = loan.monto
                }

                await db.upsert('cuotas', {
                    id_prestamo: loan_id,
                    monto: cuote,
                    cuota_num: i + 1,
                    en_deuda_futura: onDebt,
                    vigencia_desde: validfrom,
                    vigencia_hasta: validUntil,
                    interes: interest_this_month,
                    multa: 0,
                    pagado: 0,
                    en_deuda: loan.monto
                })
            }
            break

        default:
    }
}

module.exports = cuotesGenerator