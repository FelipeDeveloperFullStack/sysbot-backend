const qrcode = require('qrcode-terminal')
const { Client } = require('whatsapp-web.js')
const fs = require('fs')
/** Controllers */
const { messageWhatsAppFilter } = require('../../Controllers/MessageWhatsAppFilterController')

const checkFileExists = () => {
  if (fs.existsSync('./session.json')) {
    return require('../../../session.json')
  }
}

let client = null

const start = ({ response, io }) => {

  /** Check Session */
  let sessionData = checkFileExists()

  client = new Client({ puppeteer: 
    { 
      headless: true,
      args: ['--no-sandbox']
    }, 
    session: sessionData })

  client.on('qr', qr => {
    qrcode.generate(qr, { small: true }, (qrcode) => {
      //console.log(qrcode)
      console.info(`[SysBot] - QRCode generated`)
      sendStatus({ io, status: 'notLogged' })
      io.emit('socket_whatsapp', {
        qr_code_base64: qr,
      })
    })
  })

  /** Save session values to the file opon successful auth */
  client.on('authenticated', session => {
    console.info(`[SysBot] - Authenticated`)
    sessionData = session
    fs.writeFileSync('./session.json', JSON.stringify(session))
    console.info(`[SysBot] - Session token saved.`)
  })

  client.on('ready', () => {
    let ready = '[SysBot] - Client is ready!'
    sendStatus({ io, status: 'isLogged' })
    console.info(ready)
    response.json(ready).status(200)
  })

  client.on('message', async message => {
    try {
      let chat = await message.getChat()
      if (chat.isGroup) {
        let { pushname, id, isBusiness } = await message.getContact()
        let { id: groupId, name: groupName } = await message.getChat()
        let data = {
          id: message.id._serialized,
          idSender: id._serialized,
          displayName: pushname ? pushname : await message.getContact(),
          formattedName: await (await message.getContact()).getFormattedNumber(),
          body: message.body,
          chatName: groupName,
          chatId: groupId._serialized
        }
        if (!isBusiness) {
          await messageWhatsAppFilter({ messageWhatsapp: data, io })
        } else {
          console.log(`This is contact is business. Dont send. - ${await message.getContact()}`)
        }
      }
    } catch (error) {
      console.error(`An error occurred, restart application...`, error)
      if (fs.existsSync('./session.json')) {
        fs.unlinkSync('./session.json')
      }
      //start({ response, io })
    }
  })

  client.on('change_battery', (batteryInfo) => {
    const { battery, plugged } = batteryInfo;
    io.emit('socket_whatspp_change_battery', { battery, plugged })
    console.info(`[SysBot] - Battery: ${battery}% - Charging? ${plugged}`);
  });

  client.on('disconnected', (reason) => {
    if (fs.existsSync('./session.json')) {
      fs.unlinkSync('./session.json')
    }
    sendStatus({ io, status: 'desconnectedMobile' })
    console.info('[SysBot] - Client was logged out', reason);
  })

  client.initialize()
}

const sendStatus = ({ io, status }) => {
  io.emit('socket_whatspp_status_session', {
    statusSession: status
  })
}

const checkStatus = ({ io }) => {
  try {
    client.getState().then(result => {
      if (result && result === 'CONNECTED') {
        io.emit('checkStatus', { result })
        console.log({ state: result })
      }
    })
  } catch (error) { }
}

const logout = async ({ response }) => {
  try {
    await client.logout()
    console.log({ statusConnection: 'DISCONNECTED' })
    response.json('DISCONNECTED').status(200)
  } catch (error) {
    response.json(error).status(500)
  }
}

const sendText = ({ data }) => {
  client.sendMessage(data.idSender, data.body);
}

const initialization = async ({ response, io }) => {
  try {
    start({ response, io })
  } catch (error) {
    //start({ response, io })
  }
}

module.exports = {
  initialization,
  logout,
  sendText,
  checkStatus
}

