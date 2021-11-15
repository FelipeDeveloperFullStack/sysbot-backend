const KeyWordsModel = require('../Models/KeyWordsModel')
const fs = require("fs")

  async function _index({ response }) {
    let result = await findAll()
    if(!result.length) return []
    return response.json({ words: result })
  }

  async function findAll() {
    try {
      return await KeyWordsModel.find({})
    } catch (error) {
      if(fs.existsSync('./session.json')){
        fs.unlinkSync('./session.json')
      }
      throw new Error(`An error occurred: ${error}`)
    }
  }

  async function _update({ request, response }) {
    try {
      let resultData = request.body
      await insert(resultData.word)
      console.log(`[SysBot] - Palavra ${resultData.word} adicionada com sucesso!`)
      return response.json({ isUpdate: true})
    } catch (error) {
      console.log(error)
      if(fs.existsSync('./session.json')){
        fs.unlinkSync('./session.json')
      }
      return response.json({ isUpdate: false})
    }
  }

  async function insert(word) {
    const keyW = new KeyWordsModel({ word })
    await keyW.save()
  }

  async function deleteWord(words) {
    words['0'].map(async item => {
      await KeyWordsModel.findOneAndDelete({ word: item.word })
      console.log(`[SysBot] - Palavras ${item.word} deletada com sucesso!`)
    })
  }

  async function _delete({ request, response }) {
    try {
      let resultData = request.body
      await deleteWord(resultData)
      return response.json({ isUpdate: true})
    } catch (error) {
      console.log(error)
      if(fs.existsSync('./session.json')){
        fs.unlinkSync('./session.json')
      }
      return response.json({ isUpdate: false})
    }
  }

  module.exports = {
    _index,
    _update,
    _delete
  }