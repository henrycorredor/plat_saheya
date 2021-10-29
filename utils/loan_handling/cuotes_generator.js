const DB = require('../../lib/mysql')

const loanSchemas = require('./loan_schemas')

const moment = require('moment')

function roundToCeil(amount, roundTo) {
    let rounded = Math.floor(amount / roundTo)
    if (rounded !== amount / roundTo) { rounded++ }
    return (rounded * roundTo)
}

const cuotesGenerator = async function (loan_id) {

    const loan = await DB.getOne('loans', `id = ${loan_id}`)

    const [loanSchema] = loanSchemas.filter(schema => schema.loanCode === loan.type)

    const lastDayOfMonth = moment(loan.initial_date).endOf('month')
    const monthDaysLeft = moment(lastDayOfMonth).diff(moment(loan.initial_date), 'days')

    const daysInMonth = moment(loan.initial_date, "YYYY-MM").daysInMonth()

    const addMonthsRatio = (loan.initial_month === 'this') ? 0 : 1

    let validfrom
    let validUntil
    let onDebt = 0

    switch (loanSchema.features.cuoteType) {
        case 'MONTH_FIXED_CUOTE':
            const data = [{
                loan_id: loan_id,
                instalment_number: 0,
                amount: loan.amount * -1,
                interest: 0,
                payed_amount: 0,
                in_debt: 0,
                penalty: 0,
                future_debt: loan.amount * -1,
                valid_from: moment().format('YYYY-MM-DD'),
                valid_till: moment(loan.initial_date).format('YYYY-MM-DD'),
                status: '2-active'
            }]

            let fixedCuote = 0
            let surplus = 0
            let onDebtMemory = 0
            let interestByMonth = 0
            let interestAcumulated = 0

            const realCuoteAmount = (loan.amount / loan.instalments_in_total).toFixed(2)
            const cuoteRounded = roundToCeil(realCuoteAmount, 100)

            for (i = 0; i < loan.instalments_in_total; i++) {
                onDebtMemory = (onDebtMemory === 0) ? loan.amount : onDebt

                interestByMonth = roundToCeil((onDebtMemory * loanSchema.features.interest) / 100, 100)

                if (i === 0) {
                    const interestFractionOfMonth = roundToCeil((interestByMonth * monthDaysLeft) / daysInMonth, 100)
                    interestByMonth = (loan.initial_month === 'this') ? interestFractionOfMonth : interestByMonth + interestFractionOfMonth
                }

                interestAcumulated += interestByMonth

                surplus += (cuoteRounded - realCuoteAmount)

                fixedCuote = (i === (loan.instalments_in_total - 1)) ? roundToCeil(cuoteRounded - surplus, 100) : cuoteRounded

                validfrom = moment(loan.initial_date).add(addMonthsRatio + i, 'month').startOf('month').format('YYYY-MM-DD')
                validUntil = moment(validfrom).endOf('month').format('YYYY-MM-DD')

                if (i === 0) {
                    if (loan.initial_month === 'this') {
                        validfrom = moment(loan.initial_date).format('YYYY-MM-DD')
                    }
                }

                onDebt = onDebtMemory - fixedCuote

                if (onDebt < 0) {
                    fixedCuote = fixedCuote + onDebt
                    onDebt = 0
                }

                data.push({
                    loan_id: loan_id,
                    instalment_number: i + 1,
                    amount: fixedCuote,
                    future_debt: onDebt * -1,
                    valid_from: validfrom,
                    valid_till: validUntil,
                    interest: 0,
                    penalty: 0,
                    payed_amount: 0,
                    in_debt: onDebtMemory * -1
                })
            }

            const fixedInterest = roundToCeil(interestAcumulated / loan.instalments_in_total, 100)

            const insertInstalments = data.map(async instalment => {
                if (instalment.instalment_number !== 0) {
                    instalment.interest = fixedInterest
                }
                await DB.upsert('instalments', instalment)
            })

            await Promise.all(insertInstalments)
            break

        case 'ONLY_MONTHLY_INTEREST':
            const fixed_interest = roundToCeil((loan.amount * loanSchema.features.interest) / 100, 100)
            let interest_this_month
            let cuote

            for (i = 0; i < loan.instalment_number; i++) {
                validfrom = moment(loan.initial_date).add(addMonthsRatio + i, 'month').startOf('month').format('YYYY-MM-DD')
                validUntil = moment(validfrom).endOf('month').format('YYYY-MM-DD')

                if (i === 0) {
                    const interestFractionOfMonth = roundToCeil((fixed_interest * monthDaysLeft) / daysInMonth, 100)
                    interest_this_month = (loan.initial_month === 'this') ? interestFractionOfMonth : fixed_interest + interestFractionOfMonth

                    if (loan.initial_month === 'this') {
                        validfrom = moment(loan.initial_date).format('YYYY-MM-DD')
                    }
                } else {
                    interest_this_month = fixed_interest
                }

                if (i === loan.instalment_number - 1) {
                    cuote = loan.amount
                    onDebt = 0
                } else {
                    cuote = 0
                    onDebt = loan.amount
                }

                if (i === 0) {
                    await DB.upsert('instalments', {
                        loan_id: loan_id,
                        amount: loan.amount * -1,
                        instalment_number: i,
                        future_debt: loan.amount * -1,
                        valid_from: moment().format('YYYY-MM-DD'),
                        valid_till: loan.initial_date,
                        interest: 0,
                        penalty: 0,
                        payed_amount: 0,
                        in_debt: loan.amount * -1,
                        status: '2-active'
                    })
                }

                await DB.upsert('instalments', {
                    loan_id: loan_id,
                    amount: cuote,
                    instalment_number: i + 1,
                    future_debt: onDebt * -1,
                    valid_from: validfrom,
                    valid_till: validUntil,
                    interest: interest_this_month,
                    penalty: 0,
                    payed_amount: 0,
                    in_debt: loan.amount * -1
                })
            }
            break

        default:
    }
}

module.exports = cuotesGenerator