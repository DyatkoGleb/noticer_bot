const express = require('express')
const bodyParser = require('body-parser')

const createApi = (bot) => {
    const app = express()
    const port = process.env.PORT

    app.use(bodyParser.json())

    app.post('/send-message', async (req, res) => {
        try {
            await bot.sendMessage(req.body.chatId, req.body.message)
            res.status(200).send()
        } catch (error) {
            res.status(500).send()
        }
    })

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}

module.exports = createApi
