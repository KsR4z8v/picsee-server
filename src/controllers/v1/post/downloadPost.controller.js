const { postRepository } = require('../../../database/dependencies')
const request = require('postman-request')
const errorHandler = require('../../../tools/errorHandler')
const { extname } = require('path')

const downloadPostController = async (req, res) => {
    try {
        const { postId } = req.params

        const { urlImage, originalFileName } = await postRepository.find(postId)

        const buffer = await new Promise((resolve, reject) => {
            request.get(urlImage, { encoding: null }, (err, resp, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(body)
                }
            })
        })
        await postRepository.increment(postId, 'downloads')
        const ext = extname(originalFileName).slice(1)
        res.set({ 'content-Disposition': 'attachment', "Meta-Data": JSON.stringify({ name: originalFileName, format: ext }) })
        res.type(ext)
        res.send(buffer)
    } catch (e) {
        errorHandler(e, req, res)
    }
}

module.exports = downloadPostController