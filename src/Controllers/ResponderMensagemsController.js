const MessageWhatsAppFilterModel = require('../Models/MessageWhatsAppFilterModel')
/** WhatsApp Start */
const { sendText } = require('../Whatsapp/Start')
const fs = require('fs')

async function sendTextToContact({ request, response }) {
  try {
    let { props, message } = request.body
    let data = { idSender: props.idSender, body: message }
    sendText({ data })
    await updateResponseMessageOnMongoDB({ request, response })
    console.info('Mensagem enviada para o destinatário!')
    //return response.json({ messageSend: true })
  } catch (error) {
    if(fs.existsSync('./session.json')){
        fs.unlinkSync('./session.json')
      }
    console.error('An error occurred', error)
    return response.json({ message: 'An error occurred', error })
  }
}

async function updateResponseMessageOnMongoDB({ request, response }) {
  let { props, message } = request.body
  let data = {
    response: message,
    responseSend: true,
    isAnswered: true
  }
  try {
    await MessageWhatsAppFilterModel.findOneAndUpdate({ id: props.id }, data)
    console.info('Mensagem atualizada no banco de dados!')
  } catch (error) {
    if(fs.existsSync('./session.json')){
        fs.unlinkSync('./session.json')
      }
    console.error(`An error occurred: ${error}`)
  }
}

module.exports = {
  sendTextToContact
}