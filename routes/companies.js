const router = require("express").Router();
const companyController = require("../controllers/companyController");

router.route('/').post((req, res) => companyController.create(req, res))

router.route('/').get((req, res) => companyController.list(req, res))
router.route('/select').get((req, res) => companyController.select(req, res))
router.route('/:id').get((req, res) => companyController.detail(req, res))

router.route('/:id').put((req, res) => companyController.update(req, res))
router.route('/:id').patch((req, res) => companyController.update(req, res))

router.route('/:id').delete((req, res) => companyController.delete(req, res))


module.exports = router