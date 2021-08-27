const MySqlClass = require('../lib/mysql')

class LoanServices {
    constructor() {
        this.db = new MySqlClass()
    }

    async getCosigners(){
        const cosigners = await this.db.getData('relaciones_coodeudores', `id_prestamo = ${loan.prestamo_id}`, `id_codeudor, monto_avalado`)
        return cosigners
    }

    async getAllLoans() {
        const loans = await this.db.getData('prestamos')
        
        Promise.all(
            loans.map(async loan =>{

            })
        )
            

        const data = new Promise((res,rej)=>{
            const coodeudores = 
            res(coodeudores)
        })


        loans.forEach(loan =>{
            loan.coodeudores = data
            data.push()
        })
        const promises = await loans.map(async function (loan) {
            console.log('en proceso: ', loan)
            return loan
        }.bind(this))
        Promise.all
        console.log('objeto devuelto: ',data)
        return data
    }

    async applyNewLoan(data) {
        //aca deberia ir todo el proceso de verifiacion
        //si el usuario esta autorizado o no si se puede aplicar el prestamo.
        //de momento se acepta todo.

        const cosigners = (data.coodeudores) ? data.coodeudores : []

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