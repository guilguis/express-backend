const router = require("express").Router();
const userController = require("../controllers/userController");
const { profileUpload } = require("../middleware/upload");

router.route('/').post((req, res) => userController.create(req, res))

router.route('/').get((req, res) => userController.list(req, res))
router.route('/select').get((req, res) => userController.select(req, res))
router.route('/:id').get((req, res) => userController.detail(req, res))

router.route('/:id').put(profileUpload, (req, res) => userController.update(req, res))
router.route('/:id').patch(profileUpload, (req, res) => userController.update(req, res))

router.route('/:id').delete((req, res) => userController.delete(req, res))


module.exports = router