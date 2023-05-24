const express = require('express')
const router = express.Router()
const prioridadeController = require('../controllers/prioridadeController')

router.get('/listPrioridade', async (req, res, next) => {
  prioridadeController.listPrioridade(req, res)
})

router.post('/createPrioridade', async (req, res, next) => {
  prioridadeController.createPrioridade(req, res)
})

router.post('/deletePrioridade/:prioridadeId', async (req, res, next) => {
  prioridadeController.deletePrioridade(req, res)
})

module.exports = router
