const ImageKit = require("imagekit");
const { IMAGE_KIT_CONFIG } = require("../../../configs/config");
const FailedUploadImageKit = require("../../exceptions/FailedUploadImageKit");
const imagekit = new ImageKit(IMAGE_KIT_CONFIG);

const createUrl = (fileName, folder) => {
  return `https://ik.imagekit.io/picmont/${folder}/${fileName}`
}


const uploadFile = async (files, path, tags = []) => {
  try {
    const promises = [];
    for (let i = 0; i < files.length; i++) {
      promises.push(imagekit.upload({
        useUniqueFileName: false,
        file: await (files[i].buffer),
        fileName: await (files[i].fileName),
        folder: path,
        tags: tags[i],
      }))
    }
    const result = await Promise.all(promises)
    return result;
  } catch (error) {
    console.log(error);
    throw new FailedUploadImageKit()
  }
}

const _delete = async (files) => {
  files.forEach((i) => {
    if (i) {
      imagekit.deleteFile(i.id_cdn).catch((error) => {
        return error;
      });
    }
  });
};


module.exports = {
  uploadFile,
  _delete,
  createUrl
};
