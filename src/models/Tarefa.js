const { Sequelize, DataTypes, Model } = require('sequelize')
const database = require('../db')
const Funcionario = require('./Funcionario')
const Tipo = require('./Tipo')

class Tarefa extends Sequelize.Model {}

Tarefa.init(
  {
    tarefaId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    funcionarioId: DataTypes.INTEGER,
    tipoId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    start: DataTypes.DATE(7),
    end: DataTypes.DATE(7),
    info: DataTypes.STRING,
    aprovadorId: DataTypes.INTEGER,
    nivel: DataTypes.STRING,
    participanteId: DataTypes.INTEGER
  },

  {
    sequelize: database,
    modelName: 'Tarefa'
  }
)

Tarefa.belongsTo(Funcionario, {
  foreignKey: 'funcionarioId'
})

Funcionario.hasMany(Tarefa, { foreignKey: 'funcionarioId' })

Tarefa.belongsTo(Tipo, {
  foreignKey: 'tipoId'
})

Tipo.hasMany(Tarefa, {
  foreignKey: 'tipoId'
})
module.exports = Tarefa
