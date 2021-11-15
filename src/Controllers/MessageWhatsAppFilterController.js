const KeyWordsModel = require("../Models/KeyWordsModel")
const MessageWhatsAppFilterModel = require("../Models/MessageWhatsAppFilterModel")
const endOfDayfrom = require('date-fns/endOfDay')
const startOfDay = require('date-fns/startOfDay')
const fs = require("fs")

const messageWhatsAppFilter = async ({ messageWhatsapp, io }) => {
  let result = await findAllKeyWords()
  if (!result.length) return
  let message = ''
  result.map(item => {
    if(String(messageWhatsapp.body).toLowerCase().includes(String(item.word).toLowerCase().trim())){
      message = String(messageWhatsapp.body)
    }else {
      message = ''
      //console.log('Not found!')
    }
  })
  //message = messageWhatsapp.body
  if (message && message.length > 0) {
    let data = {
      id: messageWhatsapp.id,
      idSender: messageWhatsapp.idSender,
      displayName: String(messageWhatsapp.displayName).trim() === '' ? messageWhatsapp.formattedName : messageWhatsapp.displayName,
      formattedName: messageWhatsapp.formattedName,
      body: messageWhatsapp.body,
      chatName: messageWhatsapp.chatName,
      chatId: messageWhatsapp.chatId
    }
    console.log(data)
    await insertMessageWhatsAppMongoDB({ messageWhatsApp: data, io })
  }
}


const insertMessageWhatsAppMongoDB = async ({ messageWhatsApp, io }) => {
  try {
    let messageWhatsAppModel = new MessageWhatsAppFilterModel(messageWhatsApp)
    messageWhatsAppModel.save()
    console.info('[SysBot] - Mensagem capturada!')
    await emitEventSocket({ newMessageWp: messageWhatsApp, io })
  } catch (error) {
    if(fs.existsSync('./session.json')){
      fs.unlinkSync('./session.json')
    }
    console.error(`SysBot] - An error occurred: ${error}`, 'MessageWhatsAppFilterController.insertMessageWhatsApp')
  }
}

const emitEventSocket = async ({ newMessageWp, io }) => {
  const allMessagesWp = await findMessageByDateCurrently()
  io.emit('allMessagesWp', allMessagesWp)
  io.emit('newMessageWp', newMessageWp)
  console.info('[SysBot] - Evento Socket enviado.')
}

const findAllMessageWhatsApp = async () => {
  try {
    return await MessageWhatsAppFilterModel.find({})
  } catch (error) {
    if(fs.existsSync('./session.json')){
      fs.unlinkSync('./session.json')
    }
    console.error(`[SysBot] - An error occurred: ${error}`)
  }
}

const findAllMessage = async ({ io }) => {
  try {
    const allMessagesWp = await findAllMessageWhatsApp()
    io.emit('allMessagesWp', allMessagesWp)
    console.info('[SysBot] - Evento Socket enviado.')
  } catch (error) {
    if(fs.existsSync('./session.json')){
      fs.unlinkSync('./session.json')
    }
    console.error(`[SysBot] - An error occurred: ${error}`)
  }
}

const findAllKeyWords = async () => {
  try {
    return await KeyWordsModel.find({})
  } catch (error) {
    if(fs.existsSync('./session.json')){
      fs.unlinkSync('./session.json')
    }
    console.error(`[SysBot] - An error occurred: ${error}`)
  }
}

async function findByDateCurrently({ response, io }) {
  let allMessagesWp = await findMessageByDateCurrently()
  io.emit('allMessagesWp', allMessagesWp)
  return response.json('Ok')
}

async function findMessageByDateCurrently(){
  let result = await MessageWhatsAppFilterModel.find({
    created_at: {
      $gte: startOfDay(new Date()),
      $lte: endOfDayfrom(new Date())
    }
  })
  return result
}

module.exports = {
  messageWhatsAppFilter,
  findAllMessage,
  findByDateCurrently
}


