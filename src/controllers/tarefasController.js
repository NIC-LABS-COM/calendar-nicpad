const Tarefa = require('../models/Tarefa')
const Funcionario = require('../models/Funcionario')
const Tipo = require('../models/Tipo')

module.exports = {
  async listTarefas(req, res) {
    try {
      const tarefas = await Tarefa.findAll({ include: Tipo })
      return res.json(tarefas)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Listar Tarefas.' })
    }
  },

  async getOneTask(req, res) {
    try {
      const { tarefaId } = req.params
      const tarefa = await Tarefa.findByPk(tarefaId)
      return res.json(tarefa)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao buscar Tarefa.' })
    }
  },

  async createTarefa(req, res) {
    try {
      const tarefas = await Tarefa.create({
        funcionarioId: req.body.funcionarioId,
        title: req.body.title,
        tipoId: req.body.tipoId,
        start: new Date(req.body.start),
        end: new Date(req.body.end),
        info: req.body.info,
        aprovadorId: req.body.aprovadorId,
        prioridadeId: req.body.prioridadeId,
        participanteId: req.body.participanteId
      })
      await tarefas.save()
      return res.status(201).json(tarefas)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Criar Tarefa.' })
    }
  },

  async updateTarefa(req, res) {
    try {
      const tarefa = await Tarefa.findByPk(req.params.tarefaId)
      if (!tarefa) {
        return res.status(404).json({ msg: 'Tarefa não encontrada.' })
      }
      await tarefa.update({
        funcionarioId: req.body.funcionarioId,
        title: req.body.title,
        tipoId: req.body.tipoId,
        start: new Date(req.body.start),
        end: new Date(req.body.end),
        info: req.body.info,
        aprovadorId: req.body.aprovadorId,
        prioridadeId: req.body.prioridadeId,
        participanteId: req.body.participanteId,
        updatedAt: new Date()
      })
      return res.status(200).json(tarefa)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Erro ao Atualizar Tarefa.' })
    }
  },

  async deleteTarefa(req, res) {
    try {
      const tarefa = await Tarefa.findByPk(req.params.tarefaId)
      await tarefa.destroy()
      return res.status(201).json({ msg: 'Tarefa deletada com sucesso.' })
    } catch (error) {
      res.status(500).json({ msg: 'Erro ao deletar Tarefa.' })
    }
  }
}
