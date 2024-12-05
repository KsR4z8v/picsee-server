//* auth
const signController = require("./auth/sign.controller");
const authPlatformGoogleController = require("./auth/authPlataformGoogle.controller");

//* Post
const getPostsController = require("./post/getPosts.controller");
const likeController = require("./post/setLike.controller");
const getTagsController = require("./tags/getTags.controller");
const uploadPostController = require("./post/uploadPost.controller");
const downloadPostController = require('./post/downloadPost.controller')

//* users
const createUserController = require("./users/createUser.controller");
const deleteUserController = require("./users/deleteUser.controller");
const updateUserController = require("./users/updateUser.controller");// TODO
const sendRecoverPassLink = require('./auth/sendRecoverPassLink.controller')
const resetPasswordController = require('./auth/resetPass.controller')
const getUserInfoController = require('./users/getUser.controller')
const updatedPasswordController = require('./users/updatePassword.controller')

module.exports = {
  signController,
  authPlatformGoogleController,
  createUserController,
  deleteUserController,
  updateUserController,
  updatedPasswordController,
  uploadPostController,
  getTagsController,
  getPostsController,
  downloadPostController,
  likeController,
  sendRecoverPassLink,
  resetPasswordController,
  getUserInfoController
};
