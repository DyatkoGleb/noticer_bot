class Utils
{
    escapeMarkdown = text => text.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&")
}


module.exports = new Utils()