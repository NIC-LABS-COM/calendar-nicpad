const express = require('express')
const router = express.Router()
const tipoController = require('../controllers/tipoController')
const Funcionario = require('../models/Funcionario')
const Tarefa = require('../models/Tarefa')
const Tipo = require('../models/Tipo')

router.get('/listTipo', async (req, res, next) => {
  tipoController.listTipo(req, res)
})

router.post('/createtipo', async (req, res, next) => {
  tipoController.createTipo(req, res)
})

router.post('/deleteTipo/:tipoId', async (req, res, next) => {
  tipoController.deleteTipo(req, res)
})

module.exports = router
