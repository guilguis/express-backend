const _ = require('lodash')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const transporter = require('../email/config')
const { User: UserModel } = require('../models/User')

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

const authController = {

    signup: async(req, res) => {
        try {
            const user = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
            }

            var newUser = await UserModel.create(user)
            await newUser.setPassword(newUser.password)
            
            // Generate Verification Token and send email with token in the link.
            const token = await newUser.generateEmailToken()
            const validationLink = `http://localhost:8000/validateEmail/${token}`
            const mailData = {
                from: process.env.EMAIL_USERNAME,  // sender address
                to: newUser.email,   // list of receivers
                subject: 'Email Confirmation',
                text: `Please  click the following link to confirm your email address: ${validationLink}`,
                html: `<b>Hey there ${newUser.fullName}! </b>
                       <br> Please  click the following link to confirm your email address: <br/>
                       <a href="${validationLink}"> Confirm Email </a>`,
            };
            
            transporter.sendMail(mailData, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
             });

            res.status(201).json({msg: 'user created.'})

        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },
    
    login: async(req, res) => {
        try {
            const { email, password } = req.body

            var user = await UserModel.findOne({email: email}).populate('company')

            const { isValid, validationError } = validateUser(user, password)
            if (!isValid){
                if(validationError === 'Unverified Email'){
                    return res.status(308).send(validationError)
                } else {
                    return res.status(401).send(validationError)
                }
            }

            user = persistLogin(req, res, user)

            res.status(200).json({user: user,  msg:'user logged in'})

        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    logout: async(req, res) => {
        try {
            // Get userID
            const { accessToken } = req.cookies
            const userId = req.session.userId ? req.session.userId : jwt.verify(accessToken, process.env.SECRET_KEY) ? jwt.verify(accessToken, process.env.SECRET_KEY).user.id : null

            // Logout Two Factor
            const user = await UserModel.findOne({_id: userId, active: true}, ['-password', '-salt', ])
            user.config.twoFactor.confirmed = false
            await user.save()
            
            // End  Session
            req.session.destroy()
            
            // Clear JWT
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')

            res.status(200).send('user logged out')

        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    changePassword: async(req, res) => {
        try {
            const { password } = req.body
            const { email } = req.params
            var user = await UserModel.findOne({email: email})

            if (!user) {
                return res.status(401).json({msg: 'Invalid User'})
            }
            
            user.setPassword(password)
            res.status(200).json({msg: 'password updated.'})
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
        
    },

    validateEmail: async(req, res) => {
        try {
            const { token } = req.params
            const verifiedToken = jwt.verify(token, process.env.SECRET_KEY).token

            var user = await UserModel.findOne({'config.email.token': verifiedToken})

            if (!user) return res.status(401).json({msg: 'Invalid User'})
    
            user.config.email.verified = true
            user.save()
            
            res.status(200).send({msg: 'Email verified'})
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        } 
    },
    
    sendEmailValidation: async(req, res) => {
        try {
            const { email } = req.params
        
            var user = await UserModel.findOne({email: email})

            if (!user) return res.status(401).json({msg: 'Invalid User'})

            
            // Generate Verification Token and send email with token in the link.
            const token = await user.generateEmailToken()
            const validationLink = `http://localhost:3000/email-confirmed/${token}`
            const mailData = {
                from: process.env.EMAIL_USERNAME,  // sender address
                to: email,   // list of receivers
                subject: 'Email Confirmation',
                text: `Please  click the following link to confirm your email address: ${validationLink}`,
                html: `<b>Hey there! </b>
                       <br> Please  click the following link to confirm your email address: <br/>
                       <a href="${validationLink}"> Confirm Email </a>`,
            };
            
            transporter.sendMail(mailData, function (err, info) {
                if(err)
                  console.log(err)
                else
                  console.log(info);
             });

            res.status(200).send('Email sent')
            
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
        
    },

    setupTwoFactor: async(req, res) => {
        try {
            var user = await UserModel.findById(req.params.id)

            if(!_.isEmpty(user.config.twoFactor.secret))
                return res.send({ qrCode: user.config.twoFactor.qrCode });

            var secret = speakeasy.generateSecret({ length: 20 })
            user.config.twoFactor.secret = secret.base32
            // Generate a QR code for the user to scan
            var dataURI = await QRCode.toDataURL(secret.otpauth_url)
            user.config.twoFactor.qrCode = dataURI
            await user.save()
            // Send the QR code to the user
            res.send({ qrCode: user.config.twoFactor.qrCode });
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    validateTwoFactor: async(req, res) => {
        try {
            var user = await UserModel.findById(req.params.id)
            const token = req.body.token

            const verified = speakeasy.totp.verify({
                secret: user.config.twoFactor.secret,
                encoding: 'base32',
                token,
                window: 1
            });
            if (!verified) {
                return res.status(401).send('Invalid token');
            }
            user.config.twoFactor.confirmed = true
            await user.save()

            user = persistLogin(req, res, user)
            
            res.status(200).json({user: user,  msg:'user logged in'})
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    },

    refreshToken: async(req, res) => {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
              return res.status(401).send('Access Denied. No refresh token provided.');
            }

            const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY);
            delete decoded.iat
            delete decoded.exp
            const accessToken = jwt.sign({ user: decoded }, process.env.SECRET_KEY, { expiresIn: process.env.JWTREFRESHTIME });

            res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict'})
            res.status(200).json({user: decoded,  msg:'user logged in'})
        } catch (error) {
            console.log(error)
            res.status(403).json({msg: error._message})
        }
    }
}

module.exports = authController