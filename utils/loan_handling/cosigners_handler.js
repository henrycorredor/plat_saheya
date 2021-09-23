require('dotenv').config()
const MySqlClass = require('../../lib/mysql')

async function cosignersHandler(loan_amount, cosigners_array, capital_percentage_allowed) {
    db = new MySqlClass()
    let toReturn = [true, '']

    const [userInfo] = await db.getData('usuarios', `usuario_id = ${process.env.USER_ID}`, 'capital, en_deuda')

    const userFreeCapital = Number(userInfo.capital) - Number(userInfo.en_deuda)
    const userAbleCapital = ((userFreeCapital * capital_percentage_allowed) / 100)

    let cosignedAmount = 0
    for (i = 0; i < cosigners_array.length; i++) {
        cosignedAmount += Number(cosigners_array[i].monto_avalado)
    }

    const unsuported = Number(loan_amount) - userAbleCapital - cosignedAmount

    if (unsuported < 0) {
        toReturn = [false, `Hay un exceso en el respaldo de ${(unsuported * -1)}.`]
    } else if (unsuported > 0) {
        toReturn = [false, `Faltan ${unsuported} por respaldar.`]
    }

    return toReturn
}

module.exports = cosignersHandler