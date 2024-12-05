const { userRepository } = require("../../../database/dependencies");
const { validateCredentialsGoogle } = require("../../../services/googleTokenValidation/validationTokenGoogle");
const errorHandler = require("../../../tools/errorHandler");
const InvalidBody = require("../../../exceptions/InvalidBody");
const { sign } = require("jsonwebtoken");
const { v4: uuid } = require('uuid');
const generatePassword = require("../../../tools/generatePassword");
const { hashData } = require('../../../tools/encrypt.tool')

const authPlatformGoogleController = async (req, res) => {

  try {

    const { credential, clientId } = req.body;

    if (!credential) {
      throw new InvalidBody('missing -> credentials')
    }
    const localClientId = process.env.ID_CLIENT_GOOGLE
    if (clientId !== localClientId) {
      throw new InvalidBody('ClientId is invalid.')
    }
    const { picture, name, given_name, email } = await validateCredentialsGoogle(credential)
    let userFound = await userRepository.find(email);

    let username
    let urlAvatar
    let userId
    if (!userFound) {
      username = `${email.split('@')[0]}-${Math.round(Math.random() * 1e10)}`
      userId = uuid()
      urlAvatar = picture
      const password = await hashData(generatePassword(30))
      await userRepository.create({
        userId,
        username,
        email,
        firstNames: given_name,
        lastNames: " ",
        password,
        urlAvatar
      });
    } else {
      username = userFound.username
      urlAvatar = userFound.urlAvatar
      userId = userFound.userId
    }

    const accessToken = sign({ userId, username }, process.env.JWT_KEY_SECRET, { expiresIn: '2h' });

    res.status(200).json({
      state: 'ok',
      data: {
        userId,
        urlAvatar,
        username,
        token: accessToken
      }
    });
  } catch (e) {
    errorHandler(e, req, res)
  }
};

module.exports = authPlatformGoogleController;
