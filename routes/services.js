const router = require("express").Router();
const serviceController = require("../controllers/serviceController");

router.route('/').post((req, res) => serviceController.create(req, res))

router.route('/').get((req, res) => serviceController.list(req, res))
router.route('/select').get((req, res) => serviceController.select(req, res))
router.route('/:id').get((req, res) => serviceController.detail(req, res))

router.route('/:id').put((req, res) => serviceController.update(req, res))
router.route('/:id').patch((req, res) => serviceController.update(req, res))

router.route('/:id').delete((req, res) => serviceController.delete(req, res))


module.exports = router