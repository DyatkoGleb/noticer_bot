const axios = require('axios')


module.exports = class NoticerApi
{
    constructor(apiUrl) {
        this.apiUrl = apiUrl
    }

    get = async (endpoint) => {
        try {
            const response = await axios.get(`${this.apiUrl}/${endpoint}`)
            return response.data.data
        } catch (error) {
            throw error.message
        }
    }

    post = async (endpoint, data) => {
        try {
            await axios.post(`${this.apiUrl}/${endpoint}`, data)
        } catch (error) {
            throw error.message
        }
    }
}
