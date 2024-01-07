const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')


module.exports = class TodoService
{
    constructor (noticerApi, appStateManager) {
        this.noticerApi = noticerApi
        this.appStateManager = appStateManager
    }

    addNewTodo = async (message) => {
        await this.noticerApi.post('addNewNote', { message, itemType: 'todo' })
    }

    removeTodoAction = async (entityType) => {
        const todos = await this.noticerApi.get('getTodos')

        if (!todos.length) {
            this.appStateManager.reset()
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        this.appStateManager.setEntityTypeInProgressRemoving(entityType)
        this.appStateManager.setMapEntitiesNumberToId(todos.map(item => item.id))

        return await this.getTodosMessage(todos, true)
    }

    getTodosMessage = async (todos, removing) => {
        todos = todos ?? await this.noticerApi.get('getTodos')

        if (!todos.length) {
            return '*🤷🏻‍♂️ There are no todos 🤷🏻‍♂️*'
        }

        const message = new Message()

        message.setLabel('Todos')

        if (removing) {
            message.setHint('Send me a 0 if you are done')
        }

        todos.forEach((todo, idx) => {
            const messageEntity= new MessageEntity(todo.text)
            messageEntity.setIsCompleted(todo.is_completed)
            if (removing) {
                messageEntity.setSequenceNumber(idx + 1)
            }
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }

    getHintToAddNewTodo = (entityType) => {
        const message = new Message()
        message.setHint('Just send me any message')

        this.appStateManager.setEntityTypeInProgressAdding(entityType)

        return message.getMessageText()
    }
}
