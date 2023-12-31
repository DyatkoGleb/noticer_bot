module.exports = class KeyboardManager
{
    constructor () {
        this.keyboard = [
            ['Notes', 'Notices', '<- All', 'Todos'],
            ['Add note', 'Add notice', 'Add todo'],
            ['Remove note', 'Remove notice', 'Remove todo'],
            ['Close'],
        ]
    }

    showKeyboard = () => {
        return {
            reply_markup: {
                keyboard: this.keyboard,
                resize_keyboard: true
            }
        }
    }

    closeKeyboard = () => {
        return  {
            reply_markup: {
                remove_keyboard: true
            }
        }
    }
}