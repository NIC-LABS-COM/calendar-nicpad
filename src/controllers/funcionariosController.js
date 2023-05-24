const Funcionario = require('../models/Funcionario')
const Tarefa = require('../models/Tarefa')
const Tipo = require('../models/Tipo')
const Cargo = require('../models/Cargo')

module.exports = {
  async listFuncionarios(req, res) {
    try {
      const funcionarios = await Funcionario.findAll({
        include: [{ model: Tarefa, include: Tipo }, { model: Cargo }]
      })
      return res.json(funcionarios)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Listar Funcionarios.' })
    }
  },

  async createFuncionario(req, res) {
    if (!req.body.nome) {
      return res.status(422).json({ error: 'Nome é obrigatório' })
    }
    if (!req.body.cargoId) {
      return res.status(422).json({ error: 'Cargo é obrigatório' })
    }
    try {
      const existingFuncionario = await Funcionario.findOne({
        where: { nome: req.body.nome }
      })
      if (existingFuncionario) {
        return res.status(422).json({ error: 'Nome de funcionário já existe' })
      }
      const funcionarios = await Funcionario.create({
        nome: req.body.nome,
        cargoId: req.body.cargoId
      })
      await funcionarios.save()
      return res.status(201).json(funcionarios)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Criar Funcionario.' })
    }
  },

  async deleteFuncionario(req, res) {
    try {
      const funcionarios = await Funcionario.findByPk(req.params.funcionarioId)
      await funcionarios.destroy()
      res.status(201).json({ msg: 'Funcionario deletado com sucesso.' })
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao Deletar Funcionario.' })
    }
  },

  async deleteEmployeeTask(req, res) {
    try {
      // localizar e excluir todas as tarefas associadas a esse funcionário
      await Tarefa.destroy({
        where: {
          funcionarioId: req.params.funcionarioId
        }
      })

      return res.status(201).json({ msg: 'Deletado com sucesso.' })
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao deletar.' })
    }
  },

  // async GetOne(req, res) {
  //   try {
  //     const funcionarios = await Funcionario.findByPk(req.body.funcionarioId)
  //     return res.json(funcionarios)
  //   } catch (error) {
  //     res.status(500).json({ msg: 'Erro ao Buscar Funcionario.' })
  //   }
  // },

  async updateFuncionario(req, res) {
    try {
      const funcionarios = await Funcionario.findByPk(req.body.funcionarioId)
      if (funcionarios) {
        ;(funcionarios.nome = req.body.nome),
          (funcionarios.cargo = req.body.cargo)
        await funcionarios.save()
      }
      await funcionarios.updateOne(req.body)
      return res.json(funcionarios)
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao Atualizar Tarefa.' })
    }
  }
}
