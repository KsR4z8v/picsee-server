const { postRepository } = require("../../../database/dependencies.js");
//const { createUrl, uploadFile } = require("../../../services/imageKit/imageKitIo.service.js");
//const { IMAGE_KIT_CONFIG } = require("../../../../configs/config.js");
const { uploadFile, createPublicUrl } = require('../../../services/cloud-storage.service.js')
const errorHandler = require("../../../tools/errorHandler.js");
const { v4: uuid } = require('uuid');
const { extname } = require('path')
const sharp = require('sharp')

const uploadPostController = async (req, res) => {
  try {
    const { userId } = req;
    const photos = req.files;
    const { tags } = req.body
    const filesToCloud = []
    const imagesToDb = []
    const folderPath = 'gallery'
    const quality = Number(process.env.QUALITY_IMAGES) ?? 80
    for (let i = 0; i < photos.length; i++) {
      const { originalname, buffer } = photos[i]
      const prefix = Math.round(Math.random() * 1e4)
      const ext = extname(originalname)
      const fileName = `${prefix}-${uuid()}${ext}`
      console.log(fileName);
      imagesToDb.push({ url: createPublicUrl(folderPath, fileName), originalname })
      console.log(imagesToDb);
      filesToCloud.push((async () => {
        const fileReduced = await sharp(buffer).jpeg({ quality }).toBuffer()// bajo la calidad a un 80%
        return { buffer: fileReduced, fileName }
      })())
    }
    const results = await Promise.all(filesToCloud)
    const uploadFilePromise = uploadFile(folderPath, results);
    await postRepository.create(userId, imagesToDb, tags ?? [], uploadFilePromise);
    return res.sendStatus(204)
  } catch (e) {
    errorHandler(e, req, res)
  }
};

module.exports = uploadPostController;
