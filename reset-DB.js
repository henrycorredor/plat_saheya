const MySqlClass = require('./lib/mysql')

const usersData = {
    capital: 0,
    pasive: 0,
    capital_frozen: 0
}

const capitalData = {
    amount: 0,
    active_actual: 0,
    active_previous: 0,
    pasive_actual: 0,
    pasive_previous: 0,
    transaction_id: 1,
    holder: 0
}

Promise.all(
    [MySqlClass.doQuery('DELETE FROM capital'),
    MySqlClass.upsert('capital', capitalData),
    MySqlClass.doQuery('DELETE FROM loans'),
    MySqlClass.doQuery('DELETE FROM cosigner_rels'),
    MySqlClass.doQuery('DELETE FROM transactions'),
    MySqlClass.doQuery('DELETE FROM trans_subscriptions'),
    MySqlClass.doQuery('DELETE FROM trans_instalments'),
    MySqlClass.doQuery('DELETE FROM instalments'),
    MySqlClass.doQuery('UPDATE users SET ?', usersData)]
).then(() => {
    console.log('done')
    process.exit()
}).catch(error => {
    console.log(error)
    process.exit()
})