const Utils = require('../Utils')


module.exports = class Message {
    constructor () {
        this.utils = new Utils()
        this.entities = []
    }

    setLabel = (label) => {
        this.label = '*' + this.utils.escapeMarkdown(label) + '*'
    }

    getLabel = () => {
        return this.label
    }

    setTip = (tip) => {
        this.tip = '_' + this.utils.escapeMarkdown(tip) + '_'
    }

    getTip = () => {
        return this.tip
    }

    addEntity = (entity) => {
        this.entities.push(entity)
    }

    getMessageText = () => {
        const text = this.entities.reduce((messageText, entity, i) => {
            if (entity.getDate()) {
                messageText += '>' + entity.getDate() + '\n'
            }

            if (entity.getSequenceNumber()) {
                messageText += entity.getSequenceNumber() + '\\. '
            }

            if (typeof entity.getIsCompleted() === 'boolean') {
                messageText += entity.getIsCompleted() ? '✔️ ' : '✖️ '
            }

            return messageText + entity.getText() + '\n\n'
        }, '')

        const label = this.getLabel() ? this.getLabel() + '\n\n' : ''
        const tip = this.getTip() ? this.getTip() + '\n\n' : ''

        return label + tip + text
    }
}