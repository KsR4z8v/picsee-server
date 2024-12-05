const { Router } = require('express')
const { validateToken } = require('../../middlewares/validateToken.middleware')
const { validateCreateUser, validateUpdateUser } = require('../../middlewares/validateParams.middleware')
const controllers = require('../../controllers/v1/')
const multer = require('multer')
const upload = multer()
const router = Router()


router.get('/:user', validateToken, controllers.getUserInfoController)
router.delete('/', validateToken, controllers.deleteUserController)
router.post('/', validateCreateUser, controllers.createUserController)
router.post('/password', validateToken, controllers.updatedPasswordController)
router.patch('/', upload.single('avatar'), validateToken, validateUpdateUser, controllers.updateUserController)


module.exports = router