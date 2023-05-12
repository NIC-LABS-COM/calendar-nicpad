const express = require('express')
const router = express.Router()
const tarefasController = require('../controllers/tarefasController')
const Funcionario = require('../models/Funcionario')
const Tarefa = require('../models/Tarefa')
const Tipo = require('../models/Tipo')

router.get('/listTarefas', async (req, res, next) => {
  tarefasController.listTarefas(req, res)
})

router.get('/getOneTask/:tarefaId', async (req, res, next) => {
  tarefasController.getOneTask(req, res)
})

router.post('/createTarefa', async (req, res, next) => {
  tarefasController.createTarefa(req, res)
})

router.post('/deleteTarefa/:tarefaId', async (req, res, next) => {
  tarefasController.deleteTarefa(req, res)
})

router.put('/updateTarefa/:tarefaId', async (req, res, next) => {
  tarefasController.updateTarefa(req, res)
})

module.exports = router
