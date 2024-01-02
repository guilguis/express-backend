const router = require("express").Router();
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/requireAuth");

router.route('/login').post((req, res) => authController.login(req, res))
router.route('/signup').post((req, res) => authController.signup(req, res))

router.route('/changePassword/:email', requireAuth).post((req, res) => authController.changePassword(req, res))

router.route('/validateEmail/:token').get((req, res) => authController.validateEmail(req, res))
router.route('/sendValidationEmail/:email', requireAuth).get((req, res) => authController.sendEmailValidation(req, res))

router.route('/setupTwoFactor/:id', requireAuth).get((req, res) => authController.setupTwoFactor(req, res))
router.route('/setupTwoFactor/:id/reset', requireAuth).get((req, res) => authController.resetTwoFactor(req, res))
router.route('/validateTwoFactor/:id', requireAuth).post((req, res) => authController.validateTwoFactor(req, res))

router.route('/refresh').get((req, res) => authController.refreshToken(req, res))

router.route('/logout').get((req, res) => authController.logout(req, res))

module.exports = router