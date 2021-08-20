const MySqlClass = require('../lib/mysql')

class UserServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getAllUsers() {
        const datos = await this.db.getUser()
        return datos
    }

    async createUser(data) {
        const result = await this.db.createUser(data)
        return result
    }

    async getUser(id) {
        const user = await this.db.getUser(`usuario_id = ${id}`)
        return user
    }

    async editUser(id, data) {
        const result = await this.db.editUser(id, data)
        return result
    }

    async deleteUser(id) {
        const userInfo = await this.getUser(id)
        const result = await this.db.deleteUser(id)
        return [userInfo, result]
    }
}

module.exports = UserServices