const express = require('express')
const bodyParser = require('body-parser')


module.exports = class BotApi
{
    constructor(bot, messageBuilder) {
        this.bot = bot
        this.messageBuilder = messageBuilder
        this.app = express()

        this.app.use(bodyParser.json())
        this.setRoutes()

        this.startServer()
    }

    startServer = () => {
        const port = process.env.PORT

        this.app.listen(port, () => {
            console.log(`Server is running on port ${port}`)
        })
    }

    setRoutes = () => {
        this.app.post('/sendMessage', async (req, res) => {
            try {
                await this.bot.sendMessage(
                    req.body.chatId,
                    this.messageBuilder.build('notice', req.body.data),
                    { parse_mode: 'MarkdownV2' }
                )
                res.status(200).send()
            } catch (error) {
                res.status(500).send()
            }
        })
    }
}