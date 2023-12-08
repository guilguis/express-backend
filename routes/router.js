const router = require("express").Router();


const serviceRouter = require('./services')
const partyRouter = require('./party')
const userRouter = require('./users')
const companyRouter = require('./companies')

// Service Routes
router.use('/services', serviceRouter)
router.use('/parties', partyRouter)
router.use('/users', userRouter)
router.use('/companies', companyRouter)


module.exports = router