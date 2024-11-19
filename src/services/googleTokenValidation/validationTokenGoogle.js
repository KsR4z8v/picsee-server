

const { OAuth2Client } = require("google-auth-library")
const TokenGoogleInvalid = require("../../exceptions/TokenGoogleInvalid")

const validateCredentialsGoogle = async (token) => {
    try {
        const clientId = process.env.ID_CLIENT_GOOGLE
        const client = new OAuth2Client({ clientId })
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId
        })
        const data = ticket.getPayload()
        return data
    } catch (err) {
        throw new TokenGoogleInvalid
    }
}


module.exports = {
    validateCredentialsGoogle
}