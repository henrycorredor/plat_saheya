const MySqlClass = require('../../lib/mysql')
const db = new MySqlClass()

async function setTransaction(transaction_data, suscription_data, loan_cuote_data){
    let active_amount = 0
    let pasive_amount = 0

    const transaction = await db.upsert('transacciones',transaction_data)
    if(!suscription_data){
        active_amount = suscription_data.monto
    }

    if(!loan_cuote_data){

    }
}