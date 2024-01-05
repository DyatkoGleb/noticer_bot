module.exports = class Utils
{
    escapeMarkdown = text => text.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&")
}