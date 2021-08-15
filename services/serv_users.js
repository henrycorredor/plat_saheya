const MySqlClass = require('../lib/mysql')

class UserServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getAllUsers() {
        const datos = await this.db.getUsers()
        return datos
    }
}

module.exports = UserServices