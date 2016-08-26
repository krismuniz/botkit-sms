/* Minimal SMS bot powered by Twilio Programmable SMS and Botkit */
'use strict'

const TwilioSMSBot = require('botkit-sms')
const controller = TwilioSMSBot({
  account_sid: process.env.TWILIO_ACCOUNT_SID,
  auth_token: process.env.TWILIO_AUTH_TOKEN,
  twilio_number: process.env.TWILIO_NUMBER
})

let bot = controller.spawn({})

controller.setupWebserver(process.env.PORT, function (err, webserver) {
  if (err) console.log(err)
  controller.createWebhookEndpoints(controller.webserver, bot, function () {
    console.log('TwilioSMSBot is online!')
  })
})

controller.hears(['hi', 'hello'], 'message_received', (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (convo) console.log(err)
    convo.say('Hi, I am Oliver, an SMS bot! :D')
    convo.ask('What is your name?', (res, convo) => {
      if (err) console.log(err)
      convo.say(`Nice to meet you, ${res.text}!`)
      convo.next()
    })
  })
})

controller.hears('.*', 'message_received', (bot, message) => {
  bot.reply(message, 'huh?')
})
