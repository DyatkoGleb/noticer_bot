const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')


module.exports = class NoteService
{
    constructor (noticerApi, appStateManager) {
        this.noticerApi = noticerApi
        this.appStateManager = appStateManager
    }

    addNewNote = async (message) => {
        await this.noticerApi.post('addNewNote', { message })
    }

    removeNoteAction = async (entityType) => {
        const notes = await this.noticerApi.get('getNotes')

        if (!notes.length) {
            this.appStateManager.reset()
            return '*🤷🏻‍♂️ There are no notes 🤷🏻‍♂️*'
        }

        this.appStateManager.setEntityTypeInProgressRemoving(entityType)
        this.appStateManager.setMapEntitiesNumberToId(notes.map(item => item.id))

        return await this.getNotesMessage(notes, true)
    }

    getNotesMessage = async (notes, removing) => {
        notes = notes ?? await this.noticerApi.get('getNotes')

        if (!notes.length) {
            return '*🤷🏻‍♂️ There are no notes 🤷🏻‍♂️*'
        }

        const message = new Message()

        message.setLabel('Notes')

        if (removing) {
            message.setHint('Send me a 0 if you are done')
        }

        notes.forEach((note, idx) => {
            const messageEntity= new MessageEntity(note.text)
            messageEntity.setSequenceNumber(idx + 1)
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }

    getHintToAddNewNote = (entityType) => {
        const message = new Message()
        message.setHint('Just send me any message')

        this.appStateManager.setEntityTypeInProgressAdding(entityType)

        return message.getMessageText()
    }
}
