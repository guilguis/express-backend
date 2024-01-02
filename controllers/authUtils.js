const jwt = require('jsonwebtoken')

const persistLogin = (req, res, user) => {
    // Persist Session
    req.session.userId = user.id
    
    // Persist JWT
    user = user.toObject()
    delete user.password
    delete user.salt
    const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: parseInt(process.env.JWTEXPTIME) })
    const refreshToken = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: process.env.JWTREFRESHTIME })
    
    res
    .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict'})
    .cookie('accessToken', token, { httpOnly: true, sameSite: 'strict'})
    
    return user
}

const validateUser = (user, password) => {
    var isValid = true
    var validationError = null

    if (!user) {
        isValid = false
        validationError = 'Invalid User'
        return {isValid, validationError}
    }
    
    if(!user.active) {
        isValid = false
        validationError = 'Inactive User'
        return {isValid, validationError}
    }

    if (!user.validatePassword(password)) {
        isValid = false
        validationError = 'Invalid Password'
        return {isValid, validationError}
    }
    return {isValid, validationError}
}

module.exports = {persistLogin, validateUser}