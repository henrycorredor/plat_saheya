require('dotenv').config()
const MySqlClass = require('../../lib/mysql')

async function cosignersInspector(loan_amount, cosigners_array, capital_percentage_allowed) {
    db = new MySqlClass()
    let toReturn = [true, '']

    const [userInfo] = await db.getData('usuarios', `usuario_id = ${process.env.USER_ID}`, 'capital, en_deuda')

    const userFreeCapital = ((Number(userInfo.capital) * capital_percentage_allowed) / 100) - Number(userInfo.en_deuda)

    let cosignedAmount = 0
    cosigners_array.forEach(cosigner => {
        cosignedAmount += Number(cosigner.monto_avalado)
    })

    const unsuported = Number(loan_amount) - userFreeCapital - cosignedAmount

    if (unsuported < 0) {
        toReturn = [false, `Hay un exceso en el respaldo de ${(unsuported * -1)}.`]
    } else if (unsuported > 0) {
        toReturn = [false, `Faltan ${unsuported} por respaldar.`]
    }

    return toReturn
}

module.exports = cosignersInspector