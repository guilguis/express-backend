const jwt = require('jsonwebtoken')
const { User: UserModel } = require('../models/User')

const requireAuth = async(req, res, next) => {
    try {
        if (process.env.SESSIONAUTH) {
            requireAuthSession(req, res, next)
        } else {
            requireAuthToken(req, res, next)
        }
    } catch (error) {
        console.log(error)
        res.clearCookie('token')
        res.status(401).send(error);
    }
}

const requireAuthToken = (req, res, next) => {
    const { token } = req.cookies

    const user = jwt.verify(token, process.env.SECRET_KEY)

    delete user.iat
    delete user.exp
    req.user = user
    next()
}

const requireAuthSession = async(req, res, next) => {
    const { userId } = req.session
    const user = await UserModel.findOne({_id: userId, active: true}, ['-password', '-salt', ]).populate('parties').populate('company')
    
    if (user) {
        req.user = user
        next()
    } else {
        res.status(401).send('Not Authenticated');
    }
}

const requireTwoFactor = (req, res, next) => {
    try {
        const { user } = req

        if (!user.config.twoFactor.enabled) return next()
        
        if (!user.config.twoFactor.secret) return res.status(302).send('Must setup 2 factor authentication')
        
        if (!user.config.twoFactor.confirmed) return res.status(302).send('Unconfirmed 2 factor code')

        next()

    } catch (error) {
        console.log(error)
        res.status(401).send('Not Authenticated');
    }
    
}

module.exports = { requireAuth, requireTwoFactor }