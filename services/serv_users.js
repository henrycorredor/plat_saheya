const MySqlClass = require('../lib/mysql')

class UserServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getAllUsers() {
        const datos = await this.db.getData('usuarios')
        return datos
    }

    async createUser(data) {
        const result = await this.db.upsert('usuarios', data)
        return result
    }

    async getUser(id) {
        const user = await this.db.getData('usuarios', `usuario_id = ${id}`)
        return user
    }

    async editUser(id, data) {
        const result = await this.db.upsert('usuarios', data, `usuario_id = ${id}`)
        return result
    }

    async deleteUser(id) {
        const userInfo = await this.getUser(id)
        const result = await this.db.delete('usuarios', `usuario_id = ${id}`)
        return [userInfo, result]
    }
}

module.exports = UserServices