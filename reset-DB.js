const MySqlClass = require('./lib/mysql')

const usersData = {
    capital: 12000,
    pasive: 0,
    capital_frozen: 0
}

const capitalData = {
    amount: 0,
    active_actual: 108000,
    active_previous: 0,
    pasive_actual: 0,
    pasive_previous: 0,
    transaction_id: 1,
    holder: 0
}

const loanData = {
    type: 3,
    initial_date: '2021-11-10',
    initial_month: 'this',
    instalments_in_total: 10,
    payed_instalments: 0,
    debtor_id: 1,
    status: 5,
    amount: 30000,
    register_date: '2021-10-23',
    payed: 0
}

const cosignersData = {
    guaranteed_payed: 0
}

Promise.all(
    [MySqlClass.doQuery('DELETE FROM capital'),
    MySqlClass.upsert('capital', capitalData),
    MySqlClass.upsert('loans', loanData, 'id = 11'),
    MySqlClass.upsert('cosigner_rels', cosignersData, 'loan_id = 11'),
    MySqlClass.doQuery('DELETE FROM transactions'),
    MySqlClass.doQuery('DELETE FROM trans_subscriptions'),
    MySqlClass.doQuery('DELETE FROM trans_instalments'),
    MySqlClass.doQuery('UPDATE users SET ?', usersData)]
).then(() => {
    console.log('done')
    process.exit()
}).catch(error => {
    console.log(error)
    process.exit()
})