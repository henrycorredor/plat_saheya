require('dotenv').config()
const MySqlClass = require('../lib/mysql')
const boom = require('@hapi/boom')
const argon2 = require('argon2')

class UserServices {
    constructor() {
        this.db = MySqlClass
    }

    async setPassword(user_id, password) {
        console.log('eltra a la funcion')
        const hashPassword = await argon2.hash(password)
        const prevPassword = await this.db.getData('passwords', `user_id = ${user_id}`)
        console.log(prevPassword)
        if (prevPassword) {
            await this.db.upsert('passwords', { user_id: user_id, password: hashPassword }, `user_id = ${user_id}`)
        } else {
            await this.db.upsert('passwords', { user_id: user_id, password: hashPassword })
        }
        console.log('termina la funcion')
    }

    async getAllUsers() {
        const usersList = await this.db.getData('users')
        return usersList
    }

    async createUser(data) {
        const pswdlessData = { ...data }
        delete pswdlessData.password
        const userCreated = await this.db.upsert('users', pswdlessData)
        if (data.password) {
            await this.setPassword(userCreated.insertId, data.password)
        }
        return { newUserId: userCreated.insertId }
    }

    async getUser(id) {
        const user = await this.db.getData('users', `id = ${id}`)
        return user
    }

    async editUser(id, data) {
        if (data.password) {
            await this.setPassword(id, data.password)
            delete data.password
        }
        
        if (data && Object.keys(data).length > 0) {
            await this.db.upsert('users', data, `id = ${id}`)
        }
        return true
    }

    async getUserLoans(id) {
        const loans = await this.db.getData('loans', `debtor_id = ${id}`)
        return loans
    }

    async getUserFreeCapital(id_document_number, percent) {
        const userInfo = await this.db.getOne('users', `id_document_number = ${id_document_number}`, `capital, pasive`)
        if (userInfo) {
            const { pasive, capital } = userInfo
            const freeCapital = (capital * percent) / 100
            return freeCapital - pasive
        } else {
            throw boom.notFound('inexistent resource')
        }
    }

    async getUserPayments(user_id) {
        const dapayments = await this.db.getData('transactions', `issuer = ${user_id}`)
        if (dapayments) {
            return dapayments
        } else {
            throw boom.notFound('inexistent resource')
        }
    }
}

module.exports = UserServices