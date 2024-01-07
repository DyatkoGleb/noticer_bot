const MessageEntity = require('./messages/MessageEntity')
const Message = require('./messages/Message')
const express = require('express')
const bodyParser = require('body-parser')


module.exports = class BotApi
{
    constructor (bot) {
        this.bot = bot
        this.chatId = this.bot.allowedChatId
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
                await this.bot.sendMessageMd(this.getNoticesMessage(JSON.parse(req.body.data)), this.chatId)
                res.status(200).send()
            } catch (error) {
                res.status(500).send()
            }
        })
    }

    getNoticesMessage = (notice) => {
        const message = new Message()

        message.setLabel('Notice')

        const messageEntity = new MessageEntity(notice.text)
        messageEntity.setDate(notice.datetime)
        message.addEntity(messageEntity)

        return message.getMessageText()
    }
}
