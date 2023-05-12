const { Sequelize, DataTypes, Model } = require('sequelize')
const database = require('../db')
const Tarefa = require('./Tarefa')

class Funcionario extends Sequelize.Model {}

Funcionario.init(
  {
    funcionarioId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // garante que o nome do funcionário seja único na tabela
    },
    cargo: DataTypes.STRING
  },

  {
    sequelize: database,
    modelName: 'Funcionario',
    timestamps: true
  }
)

module.exports = Funcionario
