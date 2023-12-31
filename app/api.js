const express = require('express')
const bodyParser = require('body-parser')

const createApi = (bot) => {
    const app = express()
    const port = process.env.PORT

    app.use(bodyParser.json())

    app.post('/send-message', async (req, res) => {
        const chatId = req.body.chatId
        const message = req.body.message

        try {
            await bot.sendMessage(chatId, message)
            return res.status(200).send()
        } catch (error) {
            return res.status(500).send()
        }
    })

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}

module.exports = createApi
