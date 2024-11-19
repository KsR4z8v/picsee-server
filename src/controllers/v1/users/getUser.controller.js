const { userRepository } = require("../../../database/dependencies.js");
const UserNotFound = require("../../../exceptions/UserNotFound.js");
const errorHandler = require("../../../tools/errorHandler.js");

const getUserController = async (req, res) => {
    //* controller for get user info
    try {
        const { user } = req.params
        const userFound = await userRepository.getProfile(user)
        if (!userFound) {
            throw new UserNotFound(user)
        }
        res.status(200).json({
            state: 'ok',
            data: userFound
        })
    } catch (e) {
        errorHandler(e, req, res)
    }
};

module.exports = getUserController;
