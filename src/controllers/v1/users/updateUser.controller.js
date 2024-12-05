const { userRepository } = require("../../../database/dependencies.js");
const { uploadFile, createPublicUrl } = require("../../../services/cloud-storage.service.js");
const errorHandler = require("../../../tools/errorHandler.js");
const { v4: uuid } = require('uuid')
const sharp = require('sharp')
const { extname } = require('path');
const { formToJSON } = require("axios");

const updateUserController = async (req, res) => {
  //* controller for update info user
  try {
    const file = req.file
    const { defaultProfile, ...rest } = req.body;
    const userId = req.userId

    const toInsertDb = {}
    if (req.body.avatar) {
      toInsertDb['url_avatar'] = process.env.DEFAULT_AVATAR_URL
    }
    let uploadFilePromise

    if (file) {
      const { originalname, buffer } = file
      const prefix = Math.round(Math.random() * 1e4)
      const ext = extname(originalname)
      const fileName = `${prefix}-${uuid()}${ext}`
      const folder = 'imagesProfile'
      const urlImage = createPublicUrl(folder, fileName)
      const fileReduced = await sharp(buffer).jpeg({ quality: 70 }).toBuffer()
      uploadFilePromise = uploadFile(folder, [{ buffer: fileReduced, fileName }])
      toInsertDb.url_avatar = urlImage
    }
    const map = {
      firstName: 'first_name',
      lastName: 'last_name',
      dateBorn: 'date_born',
      socialLinks: 'social_links',
      bio: 'bio',
    }
    const bodyKeys = Object.keys(req.body)
    for (let i = 0; i < bodyKeys.length; i++) {
      const key = bodyKeys[i]
      if (map[key]) {
        toInsertDb[map[key]] = req.body[key]
      }
    }
    let toInsertDbPromise
    if (Object.keys(toInsertDb).length !== 0) {
      toInsertDbPromise = userRepository.update(userId, toInsertDb)
    }
    console.log(toInsertDb);

    await Promise.all([uploadFilePromise, toInsertDbPromise])
    return res.sendStatus(204)
  } catch (e) {
    errorHandler(e, req, res)
  }
};


module.exports = updateUserController