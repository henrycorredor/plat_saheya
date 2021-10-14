const MySqlClass = require('./mysql')

class loanQueryHandler {
    constructor() {
        this.db = MySqlClass
    }

    async getAllLoans() {
        return await this.db.getData('loans')
    }

    user(id) {
        this.userId = id
        return this
    }

    loan(id) {
        this.loanId = id
        return this
    }

    async freezeUserCapital() {
        return await this.db.upsert('users', { capital_frozen: 1 }, `id = ${this.userId}`)
    }

    async setLoan(loanData) {
        const queryInfo = await this.db.upsert('loans', loanData)
        return queryInfo.insertId
    }

    async setCosigner(cosigner, index = 0) {
        const data = {
            loan_id: this.loanId,
            index: index,
            ...cosigner
        }
        await this.db.upsert('cosigner_rels', data)
    }
}

module.exports = loanQueryHandler