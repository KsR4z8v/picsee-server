const { userRepository } = require("../../../database/dependencies.js");

const imageKitIio = require("../../../services/imageKit/imageKitIo.service.js");
const { IMAGE_KIT_CONFIG } = require("../../../../configs/config.js");
const errorHandler = require("../../../tools/errorHandler.js");

const updateAvatarController = async (req, res) => {
  //* controller for update avatar

  const { avatar } = req.files;
  try {

  } catch (e) {
    errorHandler(e, req, res)
  }
};

module.exports = updateAvatarController;
