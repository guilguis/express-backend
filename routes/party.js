const router = require("express").Router();
const partyController = require("../controllers/partyController");

router.route('/').post((req, res) => partyController.create(req, res))

router.route('/').get((req, res) => partyController.list(req, res))
router.route('/:id').get((req, res) => partyController.detail(req, res))

router.route('/:id').put((req, res) => partyController.update(req, res))
router.route('/:id').patch((req, res) => partyController.update(req, res))

router.route('/:id').delete((req, res) => partyController.delete(req, res))

router.route('/:id/add-service').post((req, res) => partyController.addService(req, res))

module.exports = router