const MySqlClass = require('../lib/mysql')

class LoanServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getAllLoans() {
        const data = await this.db.getData('prestamos')
        return data
    }

    async applyNewLoan(data) {
        //aca deberia ir todo el proceso de verifiacion
        //si el usuario esta autorizado o no si se puede aplicar el prestamo.
        //de momento se acepta todo.

        const cosigners = data.coodeudores

        delete data.coodeudores
        const result = await this.db.upsert('prestamos', data)

        if (cosigners.length > 0) {
            cosigners.forEach(async (coodeudor, index) => {
                await this.db.upsert('relaciones_coodeudores', {
                    id_prestamo: result.insertId,
                    id_codeudor: coodeudor.id_codeudor,
                    monto_avalado: coodeudor.monto_avalado,
                    orden: index + 1
                })
            })
        }

        return result
    }

    async getLoan(id) {
        const data = await this.db.getData('prestamos', `prestamo_id = ${id}`)
        return data
    }
}

module.exports = LoanServices