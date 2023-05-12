const express = require('express')
const multer = require('multer')
const xml2js = require('xml2js')

const app = express()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Extração da extensão do arquivo original:
    const extensaoArquivo = file.originalname.split('.')[1]

    // Cria um código randômico que será o nome do arquivo
    const novoNomeArquivo = file.originalname

    // Indica o novo nome do arquivo:
    cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
  }
})

const upload = multer({ storage })

app.post('/xmlFileUpload', upload.single(), (req, res) => {
  const file = req.file.originalname
  console.log(file)
  if (!file) {
    res.status(400).json({ message: 'Nenhum arquivo enviado' })
    return
  }
  // Transforme o arquivo XML em um objeto JSON usando o xml2js
  const parser = new xml2js.Parser()
  // console.log(parser)
  parser.parseString(file, (err, result) => {
    // console.log(err)
    if (err) {
      res.status(500).json({ message: 'Erro ao analisar o arquivo XML' })
      return
    }
    res.json(result)
  })
})

module.exports = app
