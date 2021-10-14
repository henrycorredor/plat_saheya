const MySqlClass = require('./lib/mysql')

Promise.all(
    [MySqlClass.doQuery('UPDATE users SET capital_frozen = 0'),
    MySqlClass.doQuery('DELETE FROM loans'),
    MySqlClass.doQuery('DELETE FROM cosigner_rels')]
).then(() => {
    console.log('done')
    process.exit()
}).catch(error => {
    console.log(error)
    process.exit()
})