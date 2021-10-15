require('dotenv').config()
const db = require('../../lib/mysql')

async function cosignersInspector(req_user, loan_amount, cosigners_array, capital_percentage_allowed) {
    let answer = [true, '']

    if (cosigners_array.some(cosigner => cosigner.cosigner_id === req_user.id))
        return [false, 'El dudor no puede ser coodeudor']

    const cosignersIdList = cosigners_array.map(cosigner => cosigner.cosigner_id)
    if (cosignersIdList.some((item, index) => cosignersIdList.indexOf(item) !== index))
        return [false, 'Hay codeudores repetidos.']

    const [userInfo] = await db.getData('users', `id = ${req_user.id}`, 'capital, pasive')

    const userFreeCapital = ((Number(userInfo.capital) * capital_percentage_allowed) / 100) - Number(userInfo.pasive)

    let cosignedAmount = 0
    cosigners_array.forEach(cosigner => {
        cosignedAmount += Number(cosigner.guaranteed_amount)
    })

    const unsuported = Number(loan_amount) - userFreeCapital - cosignedAmount

    if (unsuported < 0) {
        answer = [false, `Hay un exceso en el respaldo de ${(unsuported * -1)}.`]
    } else if (unsuported > 0) {
        answer = [false, `Faltan ${unsuported} por respaldar.`]
    }

    return answer
}

module.exports = cosignersInspector