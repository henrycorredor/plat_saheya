const { Capital, CapitalSchema } = require('./capital.model')
const { Password, PasswordsSchema } = require('./passwords.models')
const { Loan, LoansSchema } = require('./loans.model')
const { CosignerRel, CosignerRelsSchema } = require('./cosignerRels.model')
const { Transaction, TransactionsSchema } = require('./transactions.model')
const { TransSuscription, TransSuscriptionsSchema } = require('./transSubscriptions.model')
const { TransInstalment, TransInstalmentsSchema } = require('./transInstalments.model')
const { User, UserSchema } = require('./users.model')
const { Godparent, GodparentsSchema } = require('./godparents.model')
const { Instalment, InstalmentsSchema } = require('./instalments.model')

function setupModels(sequelize) {
	Capital.init(CapitalSchema, Capital.config(sequelize))
	Password.init(PasswordsSchema, Password.config(sequelize))
	Loan.init(LoansSchema, Loan.config(sequelize))
	CosignerRel.init(CosignerRelsSchema, CosignerRel.config(sequelize))
	Transaction.init(TransactionsSchema, Transaction.config(sequelize))
	TransSuscription.init(TransSuscriptionsSchema, TransSuscription.config(sequelize))
	TransInstalment.init(TransInstalmentsSchema, TransInstalment.config(sequelize))
	User.init(UserSchema, User.config(sequelize))
	Godparent.init(GodparentsSchema, Godparent.config(sequelize))
	Instalment.init(InstalmentsSchema, Instalment.config(sequelize))

	Loan.associate(sequelize.models)
}

module.exports = setupModels