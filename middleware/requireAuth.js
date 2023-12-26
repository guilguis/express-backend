const jwt = require('jsonwebtoken')
const { User: UserModel } = require('../models/User')
const { isNull } = require('lodash')

const requireAuth = async(req, res, next) => {
    try {
        const [ isAuthSession, sessionUser ] =  await requireAuthSession(req)
        const [ isAuthToken, tokenUser ] =  requireAuthToken(req)
        
        if(isAuthSession || isAuthToken) {
            req.user = !isNull(sessionUser) ? sessionUser : !isNull(tokenUser) ? tokenUser : null
            return next()
        } else  {
            return res.status(401).send('Not Authenticated')
        }
    } catch (error) {
        console.log(error)
        res.clearCookie('token')
        res.status(401).send('Not Authenticated');
    }
}

const requireAuthToken = (req) => {
    const { accessToken } = req.cookies
    try {
        const user = jwt.verify(accessToken, process.env.SECRET_KEY).user
        return [ true, user ]
    } catch (error) {
        return [ false, null ]
    }

}

const requireAuthSession = async(req) => {
    const { userId } = req.session
    const user = await UserModel.findOne({_id: userId, active: true}, ['-password', '-salt', ]).populate('company')
    
    if (user) {
        return [ true, user ]
    }
    
    return [ false, null ]
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