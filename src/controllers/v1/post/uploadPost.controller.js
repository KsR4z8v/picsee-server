const { postRepository } = require("../../../database/dependencies.js");
const { createUrl, uploadFile } = require("../../../services/imageKit/imageKitIo.service.js");
const { IMAGE_KIT_CONFIG } = require("../../../../configs/config.js");
const errorHandler = require("../../../tools/errorHandler.js");
const { v4: uuid } = require('uuid');
const { extname } = require('path')
const sharp = require('sharp')

const uploadPostController = async (req, res) => {
  try {
    const { userId } = req;

    const photos = req.files;

    const { tags } = req.body

    const urlImages = []
    const filesToUpload = []
    const folderPath = IMAGE_KIT_CONFIG.images_folder_dest
    const quality = Number(process.env.QUALITY_IMAGES) ?? 80
    for (let i = 0; i < photos.length; i++) {
      const { originalname, buffer } = photos[i]
      const prefix = Math.round(Math.random() * 1e4)
      const ext = extname(originalname)
      const fileName = `${prefix}-${uuid()}${ext}`
      urlImages.push(createUrl(fileName, folderPath))
      filesToUpload.push((async () => {
        const fileReduced = await sharp(buffer).jpeg({ quality }).toBuffer()// bajo la calidad a un 80%
        return { buffer: fileReduced, fileName }
      })())
    }
    const results = await Promise.all(filesToUpload)
    const uploadFilePromise = uploadFile(results, folderPath, tags);
    await postRepository.create(userId, urlImages, tags ?? [], uploadFilePromise);
    return res.sendStatus(204)
  } catch (e) {
    errorHandler(e, req, res)
  }
};

module.exports = uploadPostController;
