const Utils = require('../Utils')


module.exports = class MessageEntity
{
    constructor (text) {
        this.utils = new Utils()
        this.text = this.utils.escapeMarkdown(text)
    }

    setSequenceNumber = (number) => {
        this.number = number
    }

    getSequenceNumber = () => {
        return this.number
    }

    setDate = (date) => {
        this.date = this.utils.escapeMarkdown(this.utils.dateFormat(date))
    }

    getDate = () => {
        return this.date
    }

    setIsCompleted = (isCompleted) => {
        this.isCompleted = isCompleted
    }

    getIsCompleted = () => {
        return this.isCompleted
    }

    getText = () => {
        return this.text
    }
}