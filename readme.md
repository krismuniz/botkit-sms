# botkit-sms

[![npm](https://img.shields.io/npm/v/botkit-sms.svg?style=flat-square)](https://www.npmjs.com/package/botkit-sms)
[![Dependency Status](https://david-dm.org/krismuniz/botkit-sms.svg?style=flat-square)](https://david-dm.org/krismuniz/botkit-sms)
[![Code-Style:Standard](https://img.shields.io/badge/code%20style-standard-green.svg?style=flat-square)](http://standardjs.com/)
[![License:MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

`botkit-sms` allows you to create conversational SMS apps ("bots") via Twilio's Programmable SMS API using [Botkit](https://www.github.com/howdyai/botkit)'s familiar  interface.

It takes advantage of Botkit's core functionality thus allowing you to create complex conversational flows via a simple interface. It also allows you to use [custom storage methods/systems](https://github.com/howdyai/botkit/blob/master/readme.md#storing-information) to enable data persistence across sessions.

#### What is Botkit?

Here's an excerpt of Botkit's `readme.md` file:

> [[Botkit](https://www.github.com/howdyai/botkit)] provides a semantic interface to sending and receiving messages so that developers can focus on creating novel applications and experiences instead of dealing with API endpoints.

## Use Case

You can use `botkit-sms` to build SMS bots with moderately-complex conversational flows.

## Installation

```bash
$ npm install --save botkit-sms
```

## Usage

*Note: This document assumes that you are familiarized with Botkit and Twilio's Programmable SMS API*

To connect your bot to Twilio you must point a Messaging webhook to http://your_host/sms/receive, after doing so, every Twilio message will be sent to that address.

Then you need to write your bot. First, create a TwilioSMSBot instance and pass an object with your configuration properties:

* `account_sid`: found in your [Twilio Console Dashboard](https://www.twilio.com/console)
* `auth_token`: found in your [Twilio Console Dashboard](https://www.twilio.com/console)
* `twilio_number`: your app's phone number, found in your [Phone Numbers Dashboard](https://www.twilio.com/console/phone-numbers/dashboard) **The phone number format must be: `+15551235555`**

```js
const TwilioSMSBot = require('botkit-sms')
const controller = TwilioSMSBot({
  account_sid: process.env.TWILIO_ACCOUNT_SID,
  auth_token: process.env.TWILIO_AUTH_TOKEN,
  twilio_number: process.env.TWILIO_NUMBER
})
```

`spawn()` your bot instance:

```js
let bot = controller.spawn({})
```

Then you need to set up your Web server and create the webhook endpoints so your app can receive Twilio's messages:

```js
controller.setupWebserver(process.env.PORT, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver, bot, function () {
    console.log('TwilioSMSBot is online!')
  })
})
```

And finally, you can setup listeners for specific messages, like you would in any other `botkit` bot:

```js
controller.hears(['hi', 'hello'], 'message_received', (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    convo.say('Hi, I am Oliver, an SMS bot! :D')
    convo.ask('What is your name?', (res, convo) => {
      convo.say(`Nice to meet you, ${res.text}!`)
      convo.next()
    })
  })
})

controller.hears('.*', 'message_received', (bot, message) => {
  bot.reply(message, 'huh?')

  // send an image
  bot.reply(message, {
    body: 'Optional body to go with text',
    mediaUrl: 'https://i.imgur.com/9n3qoKx.png'
  })
})
```

See full example in the `examples` directory of this repo.

## Reference

Please see `botkit`'s guide and reference document [here](https://github.com/howdyai/botkit/blob/master/readme.md#developing-with-botkit).


## Contributing

#### Bug Reports & Feature Requests

Something does not work as expected or perhaps you think this module needs a feature? Please [open an issue](https://github.com/krismuniz/botkit-sms/issues/new) using GitHub's [issue tracker](https://github.com/krismuniz/botkit-sms/issues). Please be as specific and straightforward as possible.

#### Developing

Pull Requests (PRs) are welcome. Make sure you follow the same basic stylistic conventions as the original code (i.e. ["JavaScript standard code style"](http://standardjs.com)). Your changes must be concise and focus on solving a single problem.

## License

[The MIT License (MIT)](http://opensource.org/licenses/MIT)

Copyright (c) 2016 [Kristian Muñiz](https://www.krismuniz.com)
