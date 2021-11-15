const express = require('express')
const Route = express.Router()
/** WhatsApp Start */
const { initialization, logout, checkStatus } = require('../Whatsapp/Start')
/** Controllers */
const { findAllMessage, findByDateCurrently } = require('../Controllers/MessageWhatsAppFilterController')
const { _index, _update, _delete } = require('../Controllers/KeyWordsController')
const { sendTextToContact } = require('../Controllers/ResponderMensagemsController')

module.exports = (io) => {
  Route.get('/', (request, response) => {
    try {
      console.info(`[SysBot] - Initialize Authentication Whatsapp...`)
      initialization({ response, io })
    } catch (error) {
      response.json(error).status(500)
    }
  })

  Route.get('/logout', (request, response) => {
    logout({ response })
  })

  Route.post('/responder/whatsapp', async (request, response) => {
    await sendTextToContact({ request, response })
    await findByDateCurrently({ response, io })
  })

  Route.get('/listAllMessage', async (request, response) => {
     await findAllMessage({ io })
     return response.json('ok')
  })

  Route.get('/key_words', async (request, response) => {
    await _index({ response })
  })
  
  Route.post('/key_words/update', async (request, response) => {
    await _update({ request, response })
  })
  
  Route.post('/key_words/delete', async (request, response) => {
    await _delete({ request, response })
  })

  Route.get('/check_status', (request, response) => {
    checkStatus({ io })
    return response.json('Ok')
  })

  Route.get('/check_server_isonline', (request, response) => {
    return response.json({ isOnline: true})
  })

  Route.get('/find_by_date', async (request, response) => {
    await findByDateCurrently({ response, io })
  })

  return Route
}