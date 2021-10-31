const db = require('../lib/mysql')
const moment = require('moment')
const today = moment().format('YYYY-MM-DD')

//active instalments
const setActive = new Promise((resolve, reject) => {
    db.getData('instalments', `status = '1-waiting'`)
        .then(waitingInstalments => {
            return waitingInstalments.filter(instalment => {
                const afterToday = moment(today).isSameOrAfter(instalment.valid_from)
                const beforeLimitDay = moment(today).isSameOrBefore(instalment.valid_till)
                return afterToday && beforeLimitDay
            })
        })
        .then(activeInstalments => {
            const updateInstalments = activeInstalments.map(async instalment => {
                await db.upsert('instalments', { status: '2-active' }, `id = ${instalment.id}`)
            })
            Promise.all(updateInstalments).then(() => {
                resolve([`${activeInstalments.length} cuotas han sido activadas.`, activeInstalments])
            }).catch(error => {
                reject(error)
            })
        }).catch(error => {
            reject(error)
        })
})

// overdue instalment
const penaltyRules = [{
    moreThan: 5000000,
    penalty: 12000
},
{
    moreThan: 1000000,
    penalty: 8000
},
{
    moreThan: 0,
    penalty: 4000
}
]

const setOverdue = new Promise((resolve, reject) => {
    db.getData('instalments', `status = '2-active'`)
        .then(waitingInstalments => {
            const overdueInstalments = waitingInstalments.filter(instalment => {
                return moment(today).isAfter(instalment.valid_till)
            })
            return overdueInstalments.map(instalment => {
                for (let i = 0; i < penaltyRules.length; i++) {
                    if (instalment.amount > penaltyRules[i].moreThan) {
                        instalment.penalty = penaltyRules[i].penalty
                        break
                    }
                }
                return instalment
            })
        })
        .then(overdueInstalments => {
            const setOverdueInstalments = overdueInstalments.map(async instalment => {
                await db.upsert('instalments', { status: '4-overdue', penalty: instalment.penalty }, `id = ${instalment.id}`)
            })
            Promise.all(setOverdueInstalments)
                .then(() => {
                    resolve([`${overdueInstalments.length} han sido marcadas como morosas.`, overdueInstalments])
                })
                .catch(error => {
                    reject(error)
                })
        })
        .catch(error => {
            reject(error)
        })

})

Promise.all([setActive, setOverdue])
    .then(answers => {
        console.log(`Date: ${today}`)
        console.log(answers[0][0])
        console.table(answers[0][1])
        console.log(answers[1][0])
        console.table(answers[1][1])
        process.exit()
    })
    .catch(error => {
        console.log(error)
        process.exit()
    })