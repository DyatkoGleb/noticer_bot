const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')


module.exports = class TodoService
{
    constructor (noticerApi) {
        this.noticerApi = noticerApi
    }

    getTodosMessage = async () => {
        const todos = await this.noticerApi.get('getTodos')

        if (!todos.length) {
            return '*🤷🏻‍♂️ There are no todos 🤷🏻‍♂️*'
        }

        const message = new Message()

        message.setLabel('Todos')

        todos.forEach(todo => {
            const messageEntity= new MessageEntity(todo.text)
            messageEntity.setIsCompleted(todo.is_completed)
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }
}
