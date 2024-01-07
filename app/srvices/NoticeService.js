const Message = require('../messages/Message')
const MessageEntity = require('../messages/MessageEntity')


module.exports = class NoticeService
{
    constructor (noticerApi) {
        this.noticerApi = noticerApi
    }

    getNoticesMessage = async (all) => {
        const notices = all
            ? await this.noticerApi.get('getAllNotices')
            : await this.noticerApi.get('getCurrentNotices')

        if (!notices.length) {
            return '*🤷🏻‍♂️ There are no notices 🤷🏻‍♂️*'
        }

        const message = new Message()

        all ? message.setLabel('All notices') : message.setLabel('Notices')

        notices.forEach(notice => {
            const messageEntity = new MessageEntity(notice.text)
            messageEntity.setDate(notice.datetime)
            message.addEntity(messageEntity)
        })

        return message.getMessageText()
    }
}
