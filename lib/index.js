'use strict'

const Botkit = require('botkit').core
const express = require('express')
const bodyParser = require('body-parser')
const twilio = require('twilio')
const path = require('path')
const os = require('os')

function TwilioSMS(configuration) {
  let twilioSMS = Botkit(configuration || {})

  if (!configuration) {
    throw Error(`Specify your 'account_sid', 'auth_token', and ` +
      `'twilio_number' as properties of the 'configuration' object`)
  }

  if (configuration && !configuration.account_sid) {
    throw Error(`Specify an 'account_sid' in your configuration object`)
  }

  if (configuration && !configuration.auth_token) {
    throw Error(`Specify an 'auth_token'`)
  }

  if (configuration && !configuration.twilio_number) {
    throw Error(`Specify a 'twilio_number'`)
  }

  twilioSMS.defineBot(function (botkit, config) {
    let bot = {
      botkit: botkit,
      config: config || {},
      utterances: botkit.utterances
    }

    bot.startConversation = function (message, cb) {
      botkit.startConversation(this, message, cb)
    }

    bot.createConversation = function (message, cb) {
      botkit.createConversation(this, message, cb)
    }

    bot.send = function (message, cb) {
      const client = new twilio.RestClient(
        configuration.account_sid,
        configuration.auth_token
      )

      let sms = {
        body: message.text,
        from: configuration.twilio_number,
        to: message.channel
      }
      
      if ('mediaUrl' in message) sms.mediaUrl = message.mediaUrl;

      client.messages.create(sms, (err, message) => {
        if (err) {
          cb(err)
        } else {
          cb(null, message)
        }
      })
    }

    bot.reply = function (src, resp, cb) {
      let msg = {}

      if (typeof resp === 'string') {
        msg.text = resp
      } else {
        msg = resp
      }

      msg.channel = src.channel

      if (typeof cb === 'function') {
        bot.say(msg, cb)
      } else {
        bot.say(msg, function () {})
      }
    }

    bot.findConversation = function (message, cb) {
      botkit.debug('*> Find Conversation', message.user, message.channel)

      for (var t = 0; t < botkit.tasks.length; t++) {
        for (var c = 0; c < botkit.tasks[t].convos.length; c++) {
          let convo = botkit.tasks[t].convos[c]
          let matchesConvo = (
            convo.source_message.channel === message.channel ||
            convo.source_message.user === message.user
          )

          if (convo.isActive() && matchesConvo) {
            botkit.debug('=> Found existing conversation')
            cb(botkit.tasks[t].convos[c])
            return
          }
        }
      }

      cb()
    }

    return bot
  })

  // set up a web route for receiving outgoing webhooks
  twilioSMS.createWebhookEndpoints = function (webserver, bot, cb) {
    twilioSMS.log(`*> Serving webhook endpoint ` +
      `${os.hostname()}:${twilioSMS.config.port}/sms/receive`)

    let endpoint = twilioSMS.config.endpoint || '/sms/receive'

    webserver.post(endpoint, function (req, res) {
      twilioSMS.log('=> Got a message hook')

      let message = {
        text: req.body.Body,
        from: req.body.From,
        to: req.body.To,
        user: req.body.From,
        channel: req.body.From,
        timestamp: Date.now(),
        sid: req.body.MessageSid,
        NumMedia: req.body.NumMedia,
        MediaUrl0: req.body.MediaUrl0,
        MediaUrl1: req.body.MediaUrl1,
        MediaUrl2: req.body.MediaUrl2,
        MediaUrl3: req.body.MediaUrl3,
        MediaUrl4: req.body.MediaUrl4,
        MediaUrl5: req.body.MediaUrl5,
        MediaUrl6: req.body.MediaUrl6,
        MediaUrl7: req.body.MediaUrl7,
        MediaUrl9: req.body.MediaUrl9,
        MediaUrl10: req.body.MediaUrl10
      }

      twilioSMS.receiveMessage(bot, message)

      // Send empty TwiML response to Twilio
      let twiml = new twilio.TwimlResponse()
      res.type('text/xml')
      res.send(twiml.toString())
    })

    if (cb) cb()

    return twilioSMS
  }

  twilioSMS.setupWebserver = function (port, cb) {
    if (!port) {
      throw new Error(`Cannot start webserver without a 'port' parameter`)
    }

    if (isNaN(port)) {
      throw new TypeError(`Specified 'port' parameter is not a valid number`)
    }

    let static_dir = path.join(__dirname, '/public')

    let config = twilioSMS.config

    if (config && config.webserver && config.webserver.static_dir) {
      static_dir = twilioSMS.config.webserver.static_dir
    }

    twilioSMS.config.port = port

    twilioSMS.webserver = express()
    twilioSMS.webserver.use(bodyParser.json())
    twilioSMS.webserver.use(bodyParser.urlencoded({
      extended: true
    }))
    twilioSMS.webserver.use(express.static(static_dir))

    twilioSMS.webserver.listen(twilioSMS.config.port, () => {
      twilioSMS.log(`*> Listening on port ${twilioSMS.config.port}`)
      twilioSMS.startTicking()
      if (cb) cb(null, twilioSMS.webserver)
    })

    return twilioSMS
  }

  return twilioSMS
}

module.exports = TwilioSMS
