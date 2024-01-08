module.exports = class Utils
{
    escapeMarkdown = text => text.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&")

    dateFormat = (date) => {
        date = new Date(date)

        return date.getDate()
            + ' '
            + date.toLocaleString('en-EN', { month: 'short' })
            + ' '
            + date.getFullYear()
            + ' at '
            + date.getHours()
            + ':'
            + date.getMinutes().toString().padStart(2, '0')
    }
}