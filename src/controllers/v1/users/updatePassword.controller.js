const { compare, hash, genSalt } = require("bcryptjs");
const { userRepository } = require("../../../database/dependencies.js");
const errorHandler = require("../../../tools/errorHandler.js");
const PasswordIncorrect = require("../../../exceptions/PasswordIncorrect.js");

const updatePassword = async (req, res) => {
    //* controller for update info user
    try {
        const userId = req.userId
        const username = req.username
        const { oldPassword, newPassword } = req.body

        const userFound = await userRepository.findCredentials(username)
        const passwordValidation = await compare(oldPassword, userFound.password)

        if (!passwordValidation) {
            throw new PasswordIncorrect()
        }

        const passwordHash = await hash(newPassword, await genSalt())
        await userRepository.update(userId, { password: passwordHash })
        return res.sendStatus(204)
    } catch (e) {
        errorHandler(e, req, res)
    }
};


module.exports = updatePassword