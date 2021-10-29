const db = require('../lib/mysql')
const moment = require('moment')
//const today = moment().format('YYYY-MM-AA')
const today = moment('2022-04-06').format('YYYY-MM-DD')


moment('2010-10-20').isSameOrAfter('2010-10-19'); // true
moment('2010-10-20').isSameOrAfter('2010-10-20'); // true
moment('2010-10-20').isSameOrAfter('2010-10-21'); // false

const setActive = db.getData('instalments', `status = '1-waiting'`)
    .then(waitingInstalments => {
        const filtrado = waitingInstalments.filter(instalment => {
            const afterToday = moment(today).isSameOrAfter(instalment.valid_from)
            const beforeLimitDay = moment(today).isSameOrBefore(instalment.valid_till)
            return afterToday && beforeLimitDay
        })
        return filtrado
    })
    .then(activeInstalments => {
        const updateInstalments = activeInstalments.map(async instalment => {
            await db.upsert('instalments', { status: '2-active' }, `id = ${instalment.id}`)
        })
        Promise.all(updateInstalments).then(() => {
            if (updateInstalments.length === 0) {
                console.log('Ninguna cuota ha sido actualizada')
            } else {
                console.log('Las siguientes cotas han sido actualizadas:')
                console.table(activeInstalments)
            }
            //process.exit()
        }).catch(error => {
            console.log('Ha ocurrido un error:')
            console.log(error)
        })
    }).catch(error => {
        console.log('Ha ocurrido un error:')
        console.log(error)
    })

const setOverdue = db.getData('instalments', `status = '2-active'`)
    .then(waitingInstalments =>{
        const overdueInstalments = waitingInstalments.filter(instalment => {
            return moment(today).isAfter(instalment.valid_till)
        })
        const setOverdueInstalments = overdueInstalments.map(instalment =>{
            
        })
    })