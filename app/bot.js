const TelegramBotApi = require('node-telegram-bot-api')
const axios = require('axios')

const createBot = () => {
    const bot = new TelegramBotApi(process.env.TG_BOT_TOKEN, { polling: true })


    bot.on('message', msg => {
        const message = msg.text

        axios.post(`${process.env.NOTICER_API_URL}/addNewNote`, { message })
            .catch(err => bot.sendMessage(msg.chat.id, err.message))
    })

    return bot
}

module.exports = createBot
