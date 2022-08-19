'use strict';

const { CAPITAL_TABLE, CapitalSchema } = require('../models/v1/capital.model')
const { PASSWORDS_TABLE, PasswordsSchema, PasswordConstraintSchema } = require('../models/v1/passwords.models')
const { LOANS_TABLE, LoansSchema, LoansConstraintSchema } = require('../models/v1/loans.model')
const { COSIGNERS_RELS_TABLE, CosignerRelsSchema, CosignerRelsConstraintSchema } = require('../models/v1/cosignerRels.model')
const { TRANSACTIONS_TABLE, TransactionsSchema, TransactionConstraintSchema } = require('../models/v1/transactions.model')
const { TRANS_SUBSCRIPTIONS_TABLE, TransSubscriptionsConstraintSchema, TransSubscriptionsSchema } = require('../models/v1/transSubscriptions.model')
const { TRANS_INSTALMENTS_TABLE, TransInstalmentsConstraintSchema, TransInstalmentsSchema } = require('../models/v1/transInstalments.model')
const { USERS_TABLE, UserSchema } = require('../models/v1/users.model')
const { GODPARENTS_TABLE, GodparentsConstraintSchema, GodparentsSchema } = require('../models/v1/godparents.model')
const { INSTALMENTS_TABLE, InstalmentConstraintSchema, InstalmentsSchema } = require('../models/v1/instalments.model')

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable(USERS_TABLE, UserSchema)
    await queryInterface.createTable(TRANSACTIONS_TABLE, TransactionsSchema)
    await queryInterface.createTable(CAPITAL_TABLE, CapitalSchema)
    await queryInterface.createTable(PASSWORDS_TABLE, PasswordsSchema)
    await queryInterface.createTable(COSIGNERS_RELS_TABLE, CosignerRelsSchema)
    await queryInterface.createTable(LOANS_TABLE, LoansSchema)
    await queryInterface.createTable(TRANS_SUBSCRIPTIONS_TABLE, TransSubscriptionsSchema)
    await queryInterface.createTable(TRANS_INSTALMENTS_TABLE, TransInstalmentsSchema)
    await queryInterface.createTable(GODPARENTS_TABLE, GodparentsSchema)
    await queryInterface.createTable(INSTALMENTS_TABLE, InstalmentsSchema)

    await queryInterface.addConstraint(TRANSACTIONS_TABLE, TransactionConstraintSchema('receiver'))
    await queryInterface.addConstraint(TRANSACTIONS_TABLE, TransactionConstraintSchema('issuer'))
    await queryInterface.addConstraint(PASSWORDS_TABLE, PasswordConstraintSchema)
    await queryInterface.addConstraint(COSIGNERS_RELS_TABLE, CosignerRelsConstraintSchema('loan_id', LOANS_TABLE))
    await queryInterface.addConstraint(COSIGNERS_RELS_TABLE, CosignerRelsConstraintSchema('cosigner_id', USERS_TABLE))
    await queryInterface.addConstraint(LOANS_TABLE, LoansConstraintSchema)
    await queryInterface.addConstraint(TRANS_INSTALMENTS_TABLE, TransInstalmentsConstraintSchema('transaction_id', TRANSACTIONS_TABLE))
    await queryInterface.addConstraint(TRANS_INSTALMENTS_TABLE, TransInstalmentsConstraintSchema('instalment_id', INSTALMENTS_TABLE))
    await queryInterface.addConstraint(TRANS_SUBSCRIPTIONS_TABLE, TransSubscriptionsConstraintSchema)
    await queryInterface.addConstraint(GODPARENTS_TABLE, GodparentsConstraintSchema('godfather', USERS_TABLE))
    await queryInterface.addConstraint(GODPARENTS_TABLE, GodparentsConstraintSchema('godson', USERS_TABLE))
    await queryInterface.addConstraint(INSTALMENTS_TABLE, InstalmentConstraintSchema('transaction_id', TRANSACTIONS_TABLE))
    await queryInterface.addConstraint(INSTALMENTS_TABLE, InstalmentConstraintSchema('loan_id', LOANS_TABLE))
  },
  async down(queryInterface) {
    await queryInterface.dropAllTables()
  }
};
